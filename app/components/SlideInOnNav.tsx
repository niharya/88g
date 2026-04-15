'use client'

// SlideInOnNav — apply a one-shot entrance class based on a session flag.
//
// Used to signal direction between landing and /selected without a shared
// transition slot (landing lives outside the (works) route group, so
// TransitionSlot can't wrap both sides). The outgoing page sets
// sessionStorage['nav-direction']; the incoming page reads it on mount, adds
// the entrance class, and clears the flag.
//
// The flag is consumed once — hard loads and navigations from elsewhere
// see no class applied.
//
// Implementation notes:
// - useLayoutEffect runs before browser paint, so the entrance class is
//   applied in time for the animation's first frame (useEffect would let
//   the default animation start before the class swap).
// - No cleanup function is returned. React StrictMode double-invokes effects
//   in dev (mount → cleanup → mount); a cleanup that removed the class would
//   strip it during the double-invoke, and the second mount would find the
//   flag already cleared and bail out with no class. The class naturally
//   goes away when the page unmounts on next navigation.
// - A module-level "consumed" guard prevents the second StrictMode mount
//   from clearing a fresh flag set by an unrelated subsequent navigation.

import { useLayoutEffect } from 'react'

interface Props {
  flag:      string   // value of sessionStorage['nav-direction'] that triggers
  selector:  string   // target element on this page
  className: string   // entrance class to add
}

export default function SlideInOnNav({ flag, selector, className }: Props) {
  useLayoutEffect(() => {
    let direction: string | null = null
    try {
      direction = sessionStorage.getItem('nav-direction')
    } catch {
      return
    }
    if (direction !== flag) return
    try {
      sessionStorage.removeItem('nav-direction')
    } catch {
      /* non-fatal */
    }

    const el = document.querySelector(selector)
    if (!el) return
    el.classList.add(className)
  }, [flag, selector, className])

  return null
}
