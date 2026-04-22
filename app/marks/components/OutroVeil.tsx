'use client'

// OutroVeil — fade-to-black overlay that covers the Kilti→Hero teleport.
//
// When Kilti's last slide wraps, `startAutoScroll('outro')` fires this veil
// to opaque, does a silent `scrollTo(0, 0)` underneath, then releases the
// veil so it fades out over the real Hero. Total beat: ~1.6s wall-clock.
//
// Visual owner is CSS: this component only toggles a `data-opaque` attribute;
// the 900 ms fade-in / 700 ms fade-out live on `.marks-outro-veil` in
// marks.css. Keeping the timeline in CSS means the JS coordinator doesn't
// have to orchestrate two animations on one element — one state per side.
//
// Replaces the previous outro design, which cruised scrollY through Blank +
// HeroClone at 3.5 vh/s (~28s of dead black). BlankSection + HeroClone
// remain in the DOM as manual-scroll fallbacks — a reader who coasts past
// Kilti under their own power still hits HeroClone.onDocked for the wrap.

import { useEffect, useState } from 'react'
import { subscribeOutroVeil } from '../lib/autoScroll'

export default function OutroVeil() {
  const [opaque, setOpaque] = useState(false)

  useEffect(() => {
    return subscribeOutroVeil((state) => setOpaque(state === 'opaque'))
  }, [])

  return (
    <div
      className="marks-outro-veil"
      data-opaque={opaque ? 'true' : 'false'}
      aria-hidden="true"
    />
  )
}
