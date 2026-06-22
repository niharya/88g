'use client'

// useBenchDock — the bench's scroll-coupled tab nav. ONE ticket element that
// pins at the top and condenses into a smaller version of itself on scroll.
//
// Two coupled states, split so the grow can fire earlier than the unpin without
// a jump:
//   • pinned    — position:fixed at the top. Toggles at the TOP edge
//                 (slot.top ≤ DOCK_TOP), scroll-coincident → seamless hand-off
//                 to/from the card (no jump).
//   • condensed — the scale-down + active pill. Shrinks on the TOP edge going
//                 DOWN (the good snap), but grows back on the BOTTOM edge going
//                 UP (slot.bottom ≥ DOCK_TOP) — ~one footprint earlier — while
//                 still pinned, then the pin hands off at the top edge.
// Direction-gated so the two edges don't fight in the overlap zone.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { scrollGlide } from '../../../../lib/scrollGlide'

export type BenchActive = 'vis' | 'lf'

const DOCK_TOP = 14   // matches `.is-pinned .bench-ticket { top }` in bench.css

export function useBenchDock(initialActive: BenchActive) {
  const [active, setActive] = useState<BenchActive>(initialActive)
  const [pinned, setPinned] = useState(false)
  const [condensed, setCondensed] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)
  const pinnedRef = useRef(false)
  const condensedRef = useRef(false)
  const lastYRef = useRef(0)
  const lastDirRef = useRef<'up' | 'down'>('down')

  // Reserve the resting footprint so the card doesn't collapse when the ticket
  // pins out (position:fixed).
  useLayoutEffect(() => {
    const slot = slotRef.current
    if (slot) slot.style.minHeight = `${Math.round(slot.getBoundingClientRect().height)}px`
  }, [])

  // Clear the transition pane's retained entrance transform (it would become a
  // containing block and pin the fixed ticket to the pane). Paired with the
  // `will-change:auto` rule in bench.css.
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

  useEffect(() => {
    const update = () => {
      const slot = slotRef.current
      if (!slot) return
      const y = window.scrollY
      const dir: 'up' | 'down' = y > lastYRef.current ? 'down' : y < lastYRef.current ? 'up' : lastDirRef.current
      lastYRef.current = y
      lastDirRef.current = dir

      const r = slot.getBoundingClientRect()
      const nextPinned = r.top <= DOCK_TOP + 1

      // Condensed: shrink on the top edge going down; grow on the bottom edge
      // going up (one footprint earlier); never condensed while unpinned.
      let nextCondensed = condensedRef.current
      if (!nextPinned) nextCondensed = false
      else if (dir === 'down') nextCondensed = true
      else if (r.bottom >= DOCK_TOP) nextCondensed = false

      if (nextPinned !== pinnedRef.current) { pinnedRef.current = nextPinned; setPinned(nextPinned) }
      if (nextCondensed !== condensedRef.current) { condensedRef.current = nextCondensed; setCondensed(nextCondensed) }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  // Glide so the ticket's slot reaches the dock point (work tops out under it).
  const scrollToWork = useCallback(() => {
    const slot = slotRef.current
    if (!slot) return
    const y = Math.max(0, Math.round(slot.getBoundingClientRect().top + window.scrollY - DOCK_TOP))
    scrollGlide(y)
  }, [])

  const openTab = useCallback((tab: BenchActive) => {
    setActive(tab)
    if (!pinnedRef.current) scrollToWork()
  }, [scrollToWork])

  // ✕ — return to the invitation. Scroll up; the ticket un-docks via the scroll
  // listener. No fixed→static hand-off, so no end jerk.
  const close = useCallback(() => scrollGlide(0), [])

  return { active, pinned, condensed, slotRef, openTab, close }
}
