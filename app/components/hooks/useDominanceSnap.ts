'use client'

// useDominanceSnap — scroll-idle landing snap used by every full-viewport
// section in /marks (mark sections, blank section, hero clone).
//
// Rule: on 150ms scroll idle, if this section's visibility ratio is
// ≥ DOMINANCE_RATIO (0.72) AND it isn't already docked, glide to the
// section's top via scrollGlide(--dur-settle). Below 72% nothing is
// dominant and the scroll is treated as in-transit — no snap.
//
// Extracted from MarkSection so BlankSection and HeroClone can share
// the same snap mechanic without duplication. See ANOMALIES
// "Dominance-based landing-snap" for the design rationale.
//
// Callbacks:
//   • `onScroll(el, rect, vh)` — called on every scroll frame before the
//     idle-debounce arms. Consumers use this to write scroll-linked CSS
//     custom properties (--mark-p, --mark-v, etc.) without spinning a
//     second scroll listener.
//   • `onDocked()` — fires once each time the section's top crosses into
//     SNAPPED_TOL_PX from outside. Fires on both snap landings and manual
//     precise stops. HeroClone uses this to trigger the reel-wrap.

import { useEffect, type RefObject } from 'react'
import { scrollGlide } from '../../lib/scrollGlide'

const IDLE_MS         = 150
const DOMINANCE_RATIO = 0.72
const SNAPPED_TOL_PX  = 2

export interface DominanceSnapOptions {
  onScroll?: (el: HTMLElement, rect: DOMRect, vh: number) => void
  onDocked?: () => void
  // Gate so consumers (e.g. shared Sheet) can opt in per route or per
  // chapter without conditionally calling the hook. Defaults true to
  // preserve every existing /marks call site.
  enabled?: boolean
  // Boundary-only snap. When set, snap fires only while the section's top
  // edge is within this many pixels of the dock position — which keeps
  // tall sections (chapters > 100vh) from snapping the reader back to the
  // top once they're scrolled in mid-read. Leave undefined for the marks
  // behavior (snap fires on any dominance, regardless of top distance).
  topProximityPx?: number
  // Override the scroll-idle window. Default 150ms (marks: section is full
  // viewport, snap fires almost immediately on stop). Long-form chapters
  // pass a multi-second value so snap only fires after the reader has
  // genuinely stopped, not during a brief pause.
  idleMs?: number
  // Override the glide duration in ms. Default reads `--dur-settle` (500ms).
  // Pass a larger value (700–1200ms) for a softer, longer-decay landing.
  glideDurationMs?: number
  // Pixel correction added to the dock target. Use this when the section's
  // top edge does not visually align with the docked nav marker — e.g.
  // when there's a sub-pixel gap between ChapterMarker and ProjectMarker
  // after snap. Positive values scroll further down (section top rises
  // above the viewport top by this many px). Default 0.
  dockOffsetPx?: number
}

export function useDominanceSnap(
  ref: RefObject<HTMLElement | null>,
  opts: DominanceSnapOptions = {},
) {
  const { onScroll, onDocked, enabled = true, topProximityPx, idleMs, glideDurationMs, dockOffsetPx = 0 } = opts

  useEffect(() => {
    if (!enabled) return
    const el = ref.current
    if (!el) return

    let idleTimer: number | null = null
    let gliding   = false
    let glideUntil = 0
    let wasDocked = false
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    const maybeSnap = () => {
      if (gliding || reduced) return
      const rect = el.getBoundingClientRect()
      const vh   = window.innerHeight || 1

      const visibleTop = Math.max(rect.top, 0)
      const visibleBot = Math.min(rect.bottom, vh)
      const visible    = Math.max(0, visibleBot - visibleTop)
      const ratio      = visible / Math.min(rect.height, vh)
      if (ratio < DOMINANCE_RATIO) return

      // Boundary-only snap: when the section is taller than the viewport,
      // dominance alone stays true for ~one viewport's worth of mid-section
      // scroll, which would yank the reader back to the top mid-read. Limit
      // snap to when the section's top edge is within `topProximityPx` of
      // the dock position. Marks sections (100vh) leave this undefined and
      // get the original behavior.
      if (topProximityPx !== undefined && Math.abs(rect.top) > topProximityPx) return

      if (Math.abs(rect.top) <= SNAPPED_TOL_PX) return

      const top = rect.top + window.scrollY + dockOffsetPx
      const dur =
        glideDurationMs ??
        (parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--dur-settle'),
        ) * 1000 || 500)
      gliding = true
      glideUntil = performance.now() + dur + 80
      scrollGlide(top, dur)
    }

    const update = () => {
      if (gliding && performance.now() >= glideUntil) gliding = false

      const vh   = window.innerHeight || 1
      const rect = el.getBoundingClientRect()

      // Consumer-provided per-frame work (scroll-linked CSS vars etc.)
      if (onScroll) onScroll(el, rect, vh)

      // Docked-edge detection: fires onDocked once each time rect.top
      // crosses into the snapped tolerance band.
      const isDocked = Math.abs(rect.top) <= SNAPPED_TOL_PX
      if (isDocked && !wasDocked && onDocked) onDocked()
      wasDocked = isDocked

      if (idleTimer !== null) window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(() => {
        idleTimer = null
        maybeSnap()
      }, idleMs ?? IDLE_MS)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      if (idleTimer !== null) window.clearTimeout(idleTimer)
    }
  }, [ref, onScroll, onDocked, enabled, topProximityPx, idleMs, glideDurationMs, dockOffsetPx])
}
