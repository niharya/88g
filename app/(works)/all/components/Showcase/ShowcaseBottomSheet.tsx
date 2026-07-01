'use client'

// ShowcaseBottomSheet — singleton mobile bottom sheet.
//
// There's only ever one active piece, so there's only ever one sheet.
// This component is rendered ONCE by Showcase (not per-tile) when a
// piece is active and the viewport is mobile. It owns:
//
//   • scroll-to-dismiss (a page scroll closes the sheet — no hard lock)
//   • the portal escape into document.body (so position: fixed anchors
//     to the viewport, not to any transformed ancestor in the tile tree)
//   • the SpecNote render with variant="sheet"
//
// ShowcasePiece no longer renders the sheet, no longer portals, no
// longer locks scroll — the tile is just a tile.

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import SpecNote from './SpecNote'
import type { Piece } from './data'

export default function ShowcaseBottomSheet({
  piece,
  onClose,
}: {
  piece: Piece
  onClose: () => void
}) {
  // On open: bring the selected artifact into the top third of the view, then
  // arm scroll-to-dismiss (no hard body lock — iOS overflow:hidden is unreliable
  // and would fight this scroll). The programmatic scroll must NOT self-dismiss,
  // so the dismiss only arms once that scroll SETTLES (scrollend; a timeout
  // fallback covers browsers without it and the already-in-place case). After
  // arming, any page scroll past a small delta closes the sheet and returns the
  // grid to rest. The sheet's own inner scrolling doesn't reach here
  // (overscroll-behavior: contain). onClose is stable (useCallback in Showcase).
  useEffect(() => {
    const sheet = document.querySelector<HTMLElement>('.sc-note--sheet')
    const active = document.querySelector<HTMLElement>('.sc-piece.is-active')
    const grid = document.querySelector<HTMLElement>('.sc-grid')

    // Give the grid extra scroll room below the last tile, so even the final
    // artifact can scroll up to its resting position (there's otherwise no space
    // past it). Off-screen + backdrop-covered while open; removed on close. Flush
    // layout so the room exists before we scroll.
    grid?.classList.add('sc-scroll-room')
    if (grid) void grid.offsetHeight

    // Position relative to the docked card's ACTUAL height (no hardcoded px). The
    // card sits at the bottom, so its top is innerHeight − cardHeight. `edge` is a
    // small viewport-relative breathing space used both as the top margin and the
    // caption↔card gap.
    let targetTop = window.scrollY
    if (active) {
      const rect = active.getBoundingClientRect()
      const cardH = sheet ? sheet.offsetHeight : 0
      const cardTop = window.innerHeight - cardH
      // Breathing space used as both the top margin and the caption↔card gap.
      // Tied to the --space-40 design token for a consistent gap across devices.
      const edge = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--space-40')) || 40
      const roomAboveCard = cardTop - edge * 2
      if (rect.height <= roomAboveCard) {
        // Short artifact: its bottom caption sits just above the card.
        targetTop = window.scrollY + rect.bottom - (cardTop - edge)
      } else {
        // Tall artifact (posters, multiverse): top pinned near the very top.
        targetTop = window.scrollY + rect.top - edge
      }
    }
    const needsScroll = Math.abs(targetTop - window.scrollY) > 4

    // Dismiss threshold — viewport-relative and a touch generous, so a minor
    // scroll doesn't collapse the sheet; it takes a deliberate scroll.
    const dismissDelta = Math.round(window.innerHeight * 0.06)

    // Arm only after the open's programmatic scroll SETTLES, so it can't
    // self-dismiss no matter how long the smooth scroll runs. While unarmed,
    // each scroll event (re)starts a short settle timer; when scrolling stops
    // the sheet arms with the resting position as baseline. After that, a real
    // page scroll past a small delta closes the sheet.
    let armed = false
    let baseline = window.scrollY
    let settleTimer: ReturnType<typeof setTimeout> | undefined
    const arm = () => {
      baseline = window.scrollY
      armed = true
    }

    const onScroll = () => {
      if (!armed) {
        clearTimeout(settleTimer)
        settleTimer = setTimeout(arm, 140)
        return
      }
      if (Math.abs(window.scrollY - baseline) > dismissDelta) onClose()
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    if (needsScroll) {
      window.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' })
      // Safety: arm even if the scroll somehow produces no events.
      settleTimer = setTimeout(arm, 700)
    } else {
      arm()
    }

    return () => {
      window.removeEventListener('scroll', onScroll)
      clearTimeout(settleTimer)
      grid?.classList.remove('sc-scroll-room')
    }
  }, [onClose])

  // SSR guard — Portal needs `document`. Showcase only mounts this on
  // the client side (it depends on `isMobile` state set in useEffect),
  // but the guard is cheap insurance.
  if (typeof document === 'undefined') return null

  return createPortal(
    <SpecNote piece={piece} onClose={onClose} variant="sheet" />,
    document.body,
  )
}
