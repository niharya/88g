'use client'

// DockedTitle — scroll-mapped "MARKS & SYMBOLS".
//
// Lives at the route level as `position: fixed`. As scrollY progresses from
// 0 → 50vh (HALF a Hero height), the title continuously interpolates from
// the big Hero state into the docked Essay state:
//
//   scrollY 0         (Hero view):  120px, top: ~37vh, tracking: -3.6px
//   scrollY 50vh+     (docked):      24px, top: 26px,  tracking: -0.72px
//
// The dock finishes at 50vh (≈450px on a 900vh screen) so the title is
// fully parked BEFORE the Essay's first paragraph reaches the viewport top
// (Essay top sits at page-y ≈647). The end state matches the Essay frame's
// docked title (Figma 1976:3795, y=26, size 24, tracking -0.72); the start
// state matches the Hero frame (Figma 2466:3791, y=333 in 900px, so 37vh).
//
// We drive a single CSS custom property `--marks-s` (0 → 1) from a scroll
// listener; all the interpolation lives in marks.css via `calc()`. This
// keeps SSR output byte-identical to the first client render (no hydration
// mismatch) and avoids framer-motion's useTransform pipeline here.

import { useEffect, useRef } from 'react'

const DOCK_FRACTION = 0.5   // dock completes at 50% of one viewport of scroll

export default function DockedTitle() {
  const ref = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => {
      const vh = window.innerHeight || 1
      const range = vh * DOCK_FRACTION
      const p = Math.max(0, Math.min(1, window.scrollY / range))
      el.style.setProperty('--marks-s', String(p))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <h1 ref={ref} className="marks-title">
      MARKS &amp; SYMBOLS
    </h1>
  )
}
