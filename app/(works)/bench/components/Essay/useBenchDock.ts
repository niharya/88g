'use client'

// useBenchDock — the bench's scroll-coupled ticket, mirroring the nav cluster's
// useDockedMarker pattern. The ticket is a `position: sticky` sibling between
// the card and the work; this hook flips `docked` when it reaches the top dock
// point (sticky engaged), and the `.is-docked` CSS class does the condense.
//
// Unifies the two entry paths: SCROLL down → the ticket reaches the top and
// docks naturally; CLICK a tab → scrollGlide to the work and the same scroll
// threshold docks it. Closing (✕) is just scrollGlide back to the top — the
// ticket un-docks via scroll. Because nothing is ever imperatively position:
// fixed with a static hand-off, there is no end-of-close scroll jerk.
//
// Content is always present (no invite/browse mount gate): card → ticket →
// active tab's content. Default active tab is the showcase.

import { useCallback, useEffect, useRef, useState } from 'react'
import { scrollGlide } from '../../../../lib/scrollGlide'

export type BenchActive = 'vis' | 'lf'

const DOCK_TOP = 14   // matches `.bench-ticket-slot { top }` in bench.css

export function useBenchDock(initialActive: BenchActive) {
  const [active, setActiveState] = useState<BenchActive>(initialActive)
  const [docked, setDocked] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)
  const workRef = useRef<HTMLDivElement>(null)
  const dockedRef = useRef(false)

  // ── Scroll-driven dock detection ────────────────────────────────────────
  // The sticky slot's top latches at DOCK_TOP once stuck; compare against it
  // (with a small tolerance) and only setState on a real transition so we
  // don't re-render every scroll frame.
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

  // Scroll so the sticky ticket reaches its dock point (and the work below it
  // tops out under the navbar). Waits until the work content has laid out — on
  // a deep-link the document isn't tall enough to scroll to the dock point
  // until the showcase/timeline has measured, so scrollGlide would clamp short.
  // (From a click the work is already tall, so it scrolls on the first frame.)
  const scrollToWork = useCallback((instant = false) => {
    const attempt = (n: number) => {
      const slot = slotRef.current
      const work = workRef.current
      if (!slot) return
      if (work && work.getBoundingClientRect().height < 200 && n < 40) {
        requestAnimationFrame(() => attempt(n + 1))
        return
      }
      const y = Math.max(0, Math.round(slot.getBoundingClientRect().top + window.scrollY - DOCK_TOP))
      // Deep-link entry jumps instantly (a page-load landing shouldn't animate,
      // and an instant set avoids fighting the browser's scroll restoration);
      // a click from rest glides.
      if (instant) {
        window.scrollTo(0, y)
        // Nudge the dock listener so `.is-docked` latches without waiting for
        // the next user scroll (the native scrollTo event can land before the
        // listener reads the updated rect).
        window.dispatchEvent(new Event('scroll'))
      } else {
        scrollGlide(y)
      }
    }
    attempt(0)
  }, [])

  // Tab click. Switching while docked keeps scroll position (just swaps the
  // content below); from the resting card it glides down to the work.
  const openTab = useCallback((tab: BenchActive) => {
    setActiveState(tab)
    if (!dockedRef.current) scrollToWork()
  }, [scrollToWork])

  // Plain active swap (no scroll) — for deep-link priming.
  const setActive = useCallback((tab: BenchActive) => setActiveState(tab), [])

  // ✕ — return to the invitation. Just scroll up; the ticket un-docks via the
  // scroll listener. No fixed→static hand-off, so no end jerk.
  const close = useCallback(() => scrollGlide(0), [])

  return { active, docked, slotRef, workRef, openTab, setActive, scrollToWork, close }
}
