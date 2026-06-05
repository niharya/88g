'use client'

// Showcase — single CSS Grid surface with JS-measured row spans.
//
// Grid shape:
//   • 6 equal columns under the hood. A "normal" tile spans 2 (one
//     visual third); a "wide" tile spans 3 (one visual half = 1.5
//     normal tiles).
//   • `grid-auto-rows: var(--sc-row)` (8 px). Each tile's row span is
//     measured from its content height: ceil((h + gap) / (row + gap)).
//   • `grid-auto-flow: dense` packs short tiles into gaps that wide
//     tiles would otherwise leave behind.
//
// Why this idiom: CSS multi-column can't do fractional spans (every
// tile is atomic to one column). To get the 1.5×-wide paymaster +
// ecochain we asked for, the grid has to be CSS Grid with explicit
// row spans — which means re-measuring on resize, on the active-state
// lift, and on image-load reveals. The cost is some orphan whitespace
// next to wide tiles when neighbours can't pack in tightly.
//
// DOM order is `PIECES` (by `num`, 1 → 10). `grid-auto-flow: dense`
// can reshuffle the visual order to fill gaps.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { PIECES, type Piece } from './data'
import ShowcasePiece from './ShowcasePiece'
import './showcase.css'

// Row height + gap, mirrored from showcase.css so the JS measurement
// matches the layout exactly. If you change them in CSS, change them
// here too.
const ROW_HEIGHT_PX = 8
const GAP_PX = 36
const MOBILE_GAP_PX = 24
const MOBILE_BP = '(max-width: 767px), (max-height: 500px)'

function measureSpans(grid: HTMLElement) {
  const isMobile =
    typeof window !== 'undefined' &&
    window.matchMedia(MOBILE_BP).matches
  const gap = isMobile ? MOBILE_GAP_PX : GAP_PX
  const slots = grid.querySelectorAll<HTMLElement>('.sc-slot')
  slots.forEach((slot) => {
    // Measure the slot's first child (the .sc-piece) — the slot itself
    // is constrained by whatever row span we last wrote, so measuring it
    // directly is a chicken-and-egg trap.
    const child = slot.firstElementChild as HTMLElement | null
    if (!child) return
    const h = child.getBoundingClientRect().height
    if (!h) return
    const span = Math.ceil((h + gap) / (ROW_HEIGHT_PX + gap))
    slot.style.setProperty('--sc-rowspan', String(span))
  })
}

export default function Showcase() {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  const [toggles, setToggles] = useState<Record<string, string>>(() => {
    const t: Record<string, string> = {}
    for (const p of PIECES) {
      if (p.toggle) t[p.id] = p.toggle.defaultKey
    }
    return t
  })

  // ── Row-span measurement pass ─────────────────────────────────────────
  // rAF-debounced so bursts of ResizeObserver + window resize trigger
  // one pass per frame, not eleven.
  const rafRef = useRef<number | null>(null)
  const schedule = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const grid = gridRef.current
      if (grid) measureSpans(grid)
    })
  }, [])

  useLayoutEffect(() => {
    schedule()
    const grid = gridRef.current
    if (!grid) return
    const ro = new ResizeObserver(schedule)
    // Observe the grid itself so a container-width change (e.g. parent
    // layout shifts because the header or hint row above resized)
    // triggers a re-measure — per-slot observers only fire when slot
    // content height changes, not when column width changes.
    ro.observe(grid)
    grid.querySelectorAll('.sc-slot').forEach((s) => ro.observe(s))
    window.addEventListener('resize', schedule)
    // Re-measure when images materialize (LQIP → real bytes can change
    // perceived height for unframed/cropped media).
    const imgs = grid.querySelectorAll('img')
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', schedule)
    })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      imgs.forEach((img) => img.removeEventListener('load', schedule))
      if (rafRef.current != null) cancelAnimationFrame(rafRef.current)
    }
  }, [schedule])

  // Re-measure when the active tile changes — the .is-active translateY
  // lift + scale changes its rendered height slightly.
  useLayoutEffect(() => {
    schedule()
  }, [activeId, schedule])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus trap — when a tile is open, Tab cycles inside its caption dot +
  // switch + note link instead of escaping to the next tile.
  useEffect(() => {
    if (!activeId) return
    const grid = gridRef.current
    if (!grid) return
    const active = grid.querySelector(`.sc-piece.is-active`) as HTMLElement | null
    if (!active) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusables = Array.from(
        active.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const current = document.activeElement as HTMLElement | null
      if (e.shiftKey && current === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      } else if (current && !active.contains(current)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeId])

  const setToggle = (id: string, k: string) =>
    setToggles((t) => ({ ...t, [id]: k }))

  const slotClass = (p: Piece) =>
    `sc-slot sc-slot--${p.width === 'wide' ? 'wide' : 'normal'}`

  return (
    <section
      className={`sc-grid${activeId ? ' is-dimming' : ''}`}
      ref={gridRef}
    >
      {PIECES.map((p) => (
        <div className={slotClass(p)} key={p.id}>
          <ShowcasePiece
            piece={p}
            active={activeId === p.id}
            onSelect={setActiveId}
            toggleVal={toggles[p.id]}
            onToggle={setToggle}
          />
        </div>
      ))}

      {activeId && (
        <div
          className="sc-backdrop"
          onClick={() => setActiveId(null)}
          aria-hidden="true"
        />
      )}
    </section>
  )
}
