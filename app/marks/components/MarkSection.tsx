'use client'

// MarkSection — one 100vh × 100vw mark section.
//
// Owns two pieces of scroll state for this mark:
//
//   1. `--mark-p` — continuous entry progress (0 → 1). Computed on every
//      scroll from the section's top relative to the viewport bottom. Drives
//      the in-section content reveal via CSS (opacity + translate on
//      MarkCarousel / MarkNav / MarkChrome — see marks.css).
//   2. `data-settled` — discrete state that flips to `"true"` once `p`
//      crosses the settle threshold and stays true until `p` falls back
//      below the release threshold. When `data-settled="true"`, a CSS
//      transition (0.8s --ease-paper) drives the contents to their final
//      state so the composition "snaps into place" even if the user stops
//      scrolling mid-reveal.
//
// `active` (≥50% visible) is still derived via IntersectionObserver and
// gates the showcase timer so only the dominant mark auto-advances slides.
//
// The fixed <Background/> paints the palette (it listens to its own scroll
// event); reveal + settle live here so the wiring for each phase stays
// close to the element it affects.

import { useEffect, useRef, useState } from 'react'
import type { MarkEntry } from '../data/marks'
import MarkCarousel from './MarkCarousel'
import MarkChrome from './MarkChrome'
import MarkNav from './MarkNav'
import { useShowcaseTimer } from './hooks/useShowcaseTimer'

interface MarkSectionProps {
  mark:  MarkEntry
  index: number
}

// Thresholds for the settle latch. Settled once we're 85% into the entry;
// released back to scroll-driven when we drop below 60% (hysteresis stops
// it flipping each frame if the user parks right at the edge).
const SETTLE_IN  = 0.85
const SETTLE_OUT = 0.60

export default function MarkSection({ mark, index }: MarkSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)

  // Active when ≥50% of the section is in the viewport — used only to gate
  // the showcase timer. Separate from the scroll-progress reveal below.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => setActive(entry.intersectionRatio >= 0.5),
      { threshold: [0, 0.5, 1] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Scroll listener that writes `--mark-p` + toggles `data-settled`.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let settled = false
    const update = () => {
      const vh = window.innerHeight || 1
      const top = el.getBoundingClientRect().top
      const p = Math.max(0, Math.min(1, (vh - top) / vh))
      el.style.setProperty('--mark-p', String(p))

      if (!settled && p >= SETTLE_IN) {
        settled = true
        el.dataset.settled = 'true'
      } else if (settled && p <= SETTLE_OUT) {
        settled = false
        delete el.dataset.settled
      }
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  const { index: activeSlide } = useShowcaseTimer({
    total:  mark.slides.length,
    active,
  })

  return (
    <section
      ref={ref}
      className="marks-section"
      aria-label={mark.name}
      data-mark-id={mark.id}
      data-mark-index={index}
    >
      <MarkNav name={mark.name} />
      <MarkCarousel mark={mark} index={activeSlide} />
      <MarkChrome mark={mark} index={activeSlide} />
    </section>
  )
}
