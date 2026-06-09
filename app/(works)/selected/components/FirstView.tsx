'use client'

// FirstView — client wrapper around the first 100svh of /selected.
//
// (Formerly FirstViewSnap, back when the route had an auto dominance-
// snap on Showcase. The snap is gone; hand-off to Showcase is click-
// only via the cue button below. Kept as a small client wrapper
// because page.tsx is a server component and these three jobs need a
// client boundary.)
//
// Owns:
//   1. The Showcase cue rendered as a real <button> with an onClick
//      that glide-scrolls to `#${SHOWCASE_DOCK_ID}` under --ease-paper
//      (scrollGlide), landing the header one --workbench-pad-y below
//      viewport top.
//   2. The .selected-firstview wrapper itself — single ownership site
//      for the route's first-view zone.
//   3. Three measured custom properties that align the Showcase cue to
//      the canvas rails:
//        --sc-cue-top   — distance from wrapper top to mat's bottom
//        --sc-cue-left  — distance from wrapper left to stage's left
//        --sc-cue-right — distance from stage's right to wrapper right
//      Two anchor elements opt in via data-* attributes:
//        `data-cue-v-anchor` on the mat (.selected-mat) → vertical
//        `data-cue-h-anchor` on the stage (.selected-layout) → horizontal
//      The horizontal anchor is the stage, NOT AboutCard — AboutCard
//      has a Framer Motion spring entrance, so measuring it captured
//      stale mid-flight positions and `ResizeObserver` doesn't fire
//      for transform changes. The stage doesn't animate; deterministic.
//      Class names are styling; data-* attributes are the cross-
//      component wiring contract. ResizeObserver picks up archive open/
//      close and any other reflow automatically.

import { useEffect, useRef, type ReactNode } from 'react'
import { scrollGlide } from '../../../lib/scrollGlide'

// Shared with ShowcaseSection so the click-glide target and the dock id
// can't drift out of sync. Single source of truth lives here.
export const SHOWCASE_DOCK_ID = 'showcase-dock'

// Selectors for the anchor elements that drive the cue's position.
//   data-cue-v-anchor → mat <section> in SelectedContent.tsx (top)
//   data-cue-h-anchor → stage <div> in page.tsx        (left + right)
// If either attribute moves to a different element, update the matching
// selector here. Missing anchors → cue falls back to spanning the full
// wrapper (left: 0, right: 0, top: 100%).
const CUE_V_ANCHOR_SELECTOR = '[data-cue-v-anchor]'
const CUE_H_ANCHOR_SELECTOR = '[data-cue-h-anchor]'

export default function FirstView({ children }: { children: ReactNode }) {
  const fvRef = useRef<HTMLDivElement>(null)

  const handleJumpToShowcase = () => {
    const target = document.getElementById(SHOWCASE_DOCK_ID)
    if (!target) return
    const padY = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue('--workbench-pad-y'),
    ) || 48
    const y = target.getBoundingClientRect().top + window.scrollY - padY
    scrollGlide(y)
  }

  useEffect(() => {
    const fv = fvRef.current
    if (!fv) return
    const vAnchor = fv.querySelector<HTMLElement>(CUE_V_ANCHOR_SELECTOR)
    const hAnchor = fv.querySelector<HTMLElement>(CUE_H_ANCHOR_SELECTOR)
    if (!vAnchor || !hAnchor) return

    const update = () => {
      const fvRect = fv.getBoundingClientRect()
      const vRect  = vAnchor.getBoundingClientRect()
      const hRect  = hAnchor.getBoundingClientRect()
      // Top: a few px below the mat's bottom edge (offset lives in CSS).
      fv.style.setProperty('--sc-cue-top',   `${vRect.bottom - fvRect.top}px`)
      // Left + right: pinned to the stage's edges (the canonical rail).
      // CSS `right` is measured from the wrapper's right edge inward.
      fv.style.setProperty('--sc-cue-left',  `${hRect.left   - fvRect.left}px`)
      fv.style.setProperty('--sc-cue-right', `${fvRect.right - hRect.right}px`)
    }
    update()

    const ro = new ResizeObserver(update)
    ro.observe(vAnchor)
    ro.observe(hAnchor)
    ro.observe(fv)
    window.addEventListener('resize', update)
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <div ref={fvRef} className="selected-firstview">
      {children}

      <button
        type="button"
        className="sc-cue"
        onClick={handleJumpToShowcase}
        aria-label="Jump to Showcase"
      >
        <span className="sc-cue__rule" aria-hidden="true" />
        <span className="sc-cue__row">
          <span
            className="material-symbols-rounded sc-cue__arrow"
            aria-hidden="true"
          >
            arrow_downward
          </span>
          <span className="sc-cue__label">Showcase</span>
        </span>
      </button>
    </div>
  )
}
