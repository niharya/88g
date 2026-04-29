'use client'

// HeroText — the big "MARKS & SYMBOLS" title that lives at the top of the reel.
//
// Fixed at 37vh (Figma reference), 120px. On scroll it fades + sinks into the
// gradient rather than morphing into a small docked marker — that's an
// intentional split from the earlier single-element design (see MarksTitle).
// The effect beyond opacity is text-shadow: a black halo that grows with
// `--hero-recede`, selling "the title is going behind" rather than "the
// title is turning transparent".
//
// This component writes `--hero-recede` (0 → 1 across the first 60vh of
// scroll) to the `.route-marks` wrapper. Two consumers read it:
//   • `.marks-hero-text` (own fade via CSS below)
//   • `.marks-title` (inverse fade-in — the dock marker only appears once the
//     big hero has receded enough to not fight it)
//
// Semantically this is decorative: the h1 lives on MarksTitle (which tracks
// the committed mark name for both screen readers and tab-title parity).
// `aria-hidden="true"` keeps this out of the accessibility tree.

import { useEffect, useState } from 'react'
import { subscribeOutroVeil } from '../lib/autoScroll'

export default function HeroText() {
  // Bumped each time the wrap completes (veil opaque → hidden) so the
  // hero text remounts and replays its CSS entry animation. Without this
  // the veil reveals a static hero, which reads as a pop-in. With it,
  // the hero fades in over the veil's fade-out — one settle, two layers.
  const [reEnterKey, setReEnterKey] = useState(0)

  useEffect(() => {
    const root = document.querySelector<HTMLElement>('.route-marks')
    if (!root) return

    // While the outro veil is opaque (fade-to-black over Kilti → teleport →
    // hero), the hero text is completely hidden behind the black veil. We
    // pre-write recede = 0 so that once teleport lands at y=0 and the veil
    // lifts, the hero is already at full opacity — the reveal reads as the
    // veil unveiling the hero, not as the hero popping in.
    let veilLocked = false
    let wasOpaque = false
    const unsubVeil = subscribeOutroVeil((state) => {
      if (state === 'opaque') {
        veilLocked = true
        wasOpaque = true
        root.style.setProperty('--hero-recede', '0')
      } else {
        veilLocked = false
        if (wasOpaque) {
          wasOpaque = false
          setReEnterKey((k) => k + 1)
        }
      }
    })

    const update = () => {
      if (veilLocked) return
      const vh = window.innerHeight || 1
      // Two-stage recede, both anchored to the Essay element:
      //   Stage A — as the Essay top enters the viewport, the title falls
      //             from opacity 1 → WATERMARK_FLOOR (0.12). Anchored so
      //             that by the time the Essay has entered ~40% of the
      //             viewport (essay top at 0.6vh from viewport top), the
      //             title is already at the watermark floor. It then holds
      //             at that floor for the rest of the essay read.
      //   Stage B — once the Essay's bottom approaches the viewport top,
      //             the floor releases and opacity falls to 0, fully gone
      //             before the first mark section arrives.
      //
      // Both stages feed `--hero-recede` (CSS opacity = 1 - recede).
      // Stage A spans 0 → (1 - WATERMARK_FLOOR); Stage B covers the rest.
      const WATERMARK_FLOOR = 0.12
      const STAGE_A_END     = 1 - WATERMARK_FLOOR   // 0.88

      const essay = document.querySelector<HTMLElement>('.marks-essay')
      let stageA = 0
      let stageB = 0
      if (essay) {
        const rect = essay.getBoundingClientRect()

        // Stage A: essay top enters viewport.
        //   essayTop = vh  → t = 0  (just crossing the bottom edge)
        //   essayTop = 0.6vh → t = 1 (essay occupies top 40% of viewport)
        const tA = (vh - rect.top) / (vh * 0.4)
        stageA = Math.max(0, Math.min(1, tA)) * STAGE_A_END

        // Stage B: essay bottom approaches viewport top.
        //   rect.bottom = vh       → t = 0 (bottom touching viewport bottom)
        //   rect.bottom = 0.4vh    → t = 1 (bottom well up past midline)
        const tB = (vh - rect.bottom) / (vh * 0.6)
        stageB = Math.max(0, Math.min(1, tB))
      }
      const recede = Math.min(1, stageA + stageB * (1 - STAGE_A_END))
      root.style.setProperty('--hero-recede', String(recede))
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      unsubVeil()
      root.style.removeProperty('--hero-recede')
    }
  }, [])

  // First mount uses the snappy --dur-slide entry. Subsequent remounts
  // (post-wrap) use a longer fade so the hero ramps up across the veil's
  // 700ms clear instead of finishing while the veil is still opaque.
  const wrappedClass = reEnterKey > 0 ? ' marks-hero-text--wrapped' : ''

  return (
    <div className={`marks-hero-text${wrappedClass}`} key={reEnterKey} aria-hidden="true">
      <span className="marks-hero-text__line">MARKS &amp;</span>
      <span className="marks-hero-text__break"> </span>
      <span className="marks-hero-text__line">SYMBOLS</span>
    </div>
  )
}
