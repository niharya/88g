'use client'

// BlankSection — a truly blank 100vh interstitial between the last mark
// (Kilti) and the Hero-clone. Painted by <Background/> with the pure-black
// hero palette, so the viewer experiences a calm black void between the
// last mark and the reel "restart".
//
// Behaviorally it's a first-class mark-section: it participates in the
// dominance landing-snap via useDominanceSnap, so if scroll ends with the
// blank zone ≥ 72% visible it docks to viewport top. 50/50 midpoints with
// Kilti or Hero-clone remain valid rest states.
//
// No content by design. "We can get creative with it later" — the hook
// is here; the canvas stays empty until there's a reason.

import { useRef } from 'react'
import { useDominanceSnap } from '../../components/hooks/useDominanceSnap'

export default function BlankSection() {
  const ref = useRef<HTMLElement>(null)
  useDominanceSnap(ref)
  return (
    <section
      ref={ref}
      className="marks-blank"
      aria-hidden="true"
      data-marks-blank="true"
    />
  )
}
