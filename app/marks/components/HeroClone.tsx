'use client'

// HeroClone — the "reel restart" at the tail of the document.
//
// A second 100vh section that paints the identical hero palette as the real
// <Hero/> at the top of the page. When the dominance-snap docks the user
// into this section, we teleport scroll to y=0 — the real Hero — so the
// reel loops seamlessly. The two elements look identical at dock, so the
// scrollTop(0) switch is invisible.
//
// Arming discipline: we require one observation of the clone NOT being
// docked before we're willing to fire a wrap. This prevents a teleport
// from firing on first mount if the browser restored scroll close to the
// clone, or on any stray docked-edge event that might occur before the
// user has actually scrolled down to reach us.
//
// MarksTitle owns the title's visual continuity across the wrap — at both
// y=0 (real Hero) and y=heroCloneStart (clone dock), --marks-s reads 0,
// so the title is in its big hero state in both places. See MarksTitle's
// `distToNearestHero` logic.

import { useCallback, useRef } from 'react'
import { useDominanceSnap } from './hooks/useDominanceSnap'

export default function HeroClone() {
  const ref = useRef<HTMLElement>(null)
  const armedRef = useRef(false)

  const onScroll = useCallback((_el: HTMLElement, rect: DOMRect) => {
    // Armed once the clone has been observed off-dock. Top well away from
    // 0 is the cheap arming signal; any subsequent dock is a legitimate
    // forward-scroll landing.
    if (Math.abs(rect.top) > 8) armedRef.current = true
  }, [])

  const onDocked = useCallback(() => {
    if (!armedRef.current) return
    // Teleport. Instant jump — no smooth — since the destination paints
    // identically to where we currently are.
    armedRef.current = false
    window.scrollTo(0, 0)
  }, [])

  useDominanceSnap(ref, { onScroll, onDocked })

  return (
    <section
      ref={ref}
      className="marks-hero-clone"
      aria-hidden="true"
      data-marks-hero-clone="true"
    />
  )
}
