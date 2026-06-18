'use client'

// useBenchDock — the bench's scroll-coupled ticket, mirroring the nav cluster's
// useDockedMarker pattern. The ticket foots the invitation card; this hook flips
// `docked` when its slot reaches the top dock point, and the `.is-docked` CSS
// class lifts it OUT (position:fixed) into a condensed navbar.
//
// Unifies the two entry paths: SCROLL down → the ticket reaches the top and
// docks naturally; CLICK a tab → scrollGlide to the work and the same scroll
// threshold docks it. Closing (✕) is just scrollGlide back to the top — the
// ticket un-docks via scroll. Because the rest→fixed flip is scroll-coincident
// (no imperative geometry / static hand-off), there is no end-of-close jerk.
//
// Content is always present (no invite/browse mount gate): card → ticket →
// active tab's content. Default active tab is the showcase.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { scrollGlide } from '../../../../lib/scrollGlide'

export type BenchActive = 'vis' | 'lf'

const DOCK_TOP = 14   // matches `.bench-ticket-slot { top }` in bench.css

export function useBenchDock(initialActive: BenchActive) {
  const [active, setActive] = useState<BenchActive>(initialActive)
  const [docked, setDocked] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)
  const dockedRef = useRef(false)

  // ── Reserve the resting footprint ───────────────────────────────────────
  // The ticket lives inside the card and lifts OUT (position:fixed) when docked;
  // pin the slot's height so the card doesn't collapse (and the work below
  // doesn't jump up) at the dock moment.
  useLayoutEffect(() => {
    const slot = slotRef.current
    if (slot) slot.style.minHeight = `${Math.round(slot.getBoundingClientRect().height)}px`
  }, [])

  // ── Clear the transition pane's retained entrance transform ─────────────
  // The docked ticket is position:fixed. TransitionSlot's entrance animation
  // (WAAPI, fill:both) leaves transform:translateY(0) on `.transition-pane` — a
  // containing block that would pin the fixed navbar to the pane instead of the
  // viewport when the user scrolls to dock after an in-shell nav (e.g. EXIT from
  // a case study). Cancel it once the transition settles (the animation is at
  // its identity end-state, so cancelling is visually a no-op). Paired with the
  // `will-change:auto` rule in bench.css (the other half of the same trap).
  useEffect(() => {
    const clearPane = () =>
      document.querySelector('.transition-pane')?.getAnimations?.().forEach(a => a.cancel())
    const wb = document.querySelector('.workbench')
    if (!wb || !wb.classList.contains('transitioning')) { clearPane(); return }
    const obs = new MutationObserver(() => {
      if (!wb.classList.contains('transitioning')) { obs.disconnect(); clearPane() }
    })
    obs.observe(wb, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // ── Scroll-driven dock detection ────────────────────────────────────────
  // Dock when the slot (the ticket's resting spot in the card) reaches the top
  // dock point. Only setState on a real transition so we don't re-render every
  // scroll frame. The position flip is scroll-coincident with the rest spot, so
  // the hand-off is seamless (no jump); the rise (scale + shadow) + condense
  // animate via CSS as `.is-docked` toggles.
  useEffect(() => {
    const update = () => {
      const slot = slotRef.current
      if (!slot) return
      const next = slot.getBoundingClientRect().top <= DOCK_TOP + 1
      if (next !== dockedRef.current) {
        dockedRef.current = next
        setDocked(next)
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // Glide so the ticket's slot reaches the dock point (the work below tops out
  // under the navbar). Used by a tab click from rest; the work is already laid
  // out, so a single glide suffices.
  const scrollToWork = useCallback(() => {
    const slot = slotRef.current
    if (!slot) return
    const y = Math.max(0, Math.round(slot.getBoundingClientRect().top + window.scrollY - DOCK_TOP))
    scrollGlide(y)
  }, [])

  // Tab click. Switching while docked keeps scroll position (just swaps the
  // content below); from the resting card it glides down to the work.
  const openTab = useCallback((tab: BenchActive) => {
    setActive(tab)
    if (!dockedRef.current) scrollToWork()
  }, [scrollToWork])

  // ✕ — return to the invitation. Just scroll up; the ticket un-docks via the
  // scroll listener. No fixed→static hand-off, so no end jerk.
  const close = useCallback(() => scrollGlide(0), [])

  return { active, docked, slotRef, openTab, close }
}
