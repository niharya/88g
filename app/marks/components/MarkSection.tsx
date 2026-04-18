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

import { useCallback, useEffect, useRef, useState } from 'react'
import type { MarkEntry } from '../data/marks'
import { MARKS } from '../data/marks'
import MarkCarousel from './MarkCarousel'
import MarkChrome from './MarkChrome'
import { useShowcaseTimer } from './hooks/useShowcaseTimer'
import { scrollGlide } from '../lib/scrollGlide'

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

  // When the last slide wraps, paper-glide into the next mark section.
  // Last mark in MARKS is the handoff point to the Buffer — chunk 6 wires
  // that to the infinite-loop reset. Until then, last mark simply stops
  // advancing (no buffer target yet).
  const advanceToNextMark = useCallback(() => {
    const nextIdx = index + 1
    const nextMark = MARKS[nextIdx]
    if (!nextMark) return
    const nextSection = document.querySelector<HTMLElement>(
      `.marks-section[data-mark-id="${nextMark.id}"]`,
    )
    if (!nextSection) return
    const top = nextSection.getBoundingClientRect().top + window.scrollY
    scrollGlide(top)
  }, [index])

  const { index: activeSlide, setIndex, pauseForInteraction } = useShowcaseTimer({
    total:  mark.slides.length,
    active,
    onWrap: advanceToNextMark,
  })

  // Horizontal trackpad/wheel + touch swipe → manual slide advance.
  // Listener lives on the section so the interaction surface matches the
  // visible mark zone. Only the active (dominant) section consumes input.
  // Each manual advance pauses the auto-advance timer for idleResumeMs.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!active) return

    const WHEEL_THRESHOLD    = 30     // min |deltaX| to count as intent
    const WHEEL_COOLDOWN_MS  = 400    // trackpad inertia guard
    const TOUCH_THRESHOLD    = 40     // min |dx| to count as swipe

    let wheelCooldownUntil = 0
    const nudge = (dir: 1 | -1) => {
      pauseForInteraction()
      setIndex((prev) => (prev + dir + mark.slides.length) % mark.slides.length)
    }

    const onWheel = (e: WheelEvent) => {
      const dx = e.deltaX
      if (Math.abs(dx) < WHEEL_THRESHOLD) return
      if (Math.abs(dx) < Math.abs(e.deltaY)) return
      const now = performance.now()
      if (now < wheelCooldownUntil) return
      wheelCooldownUntil = now + WHEEL_COOLDOWN_MS
      nudge(dx > 0 ? 1 : -1)
    }

    let tStartX = 0
    let tStartY = 0
    let tracking = false
    const onTouchStart = (e: TouchEvent) => {
      const t = e.touches[0]
      tStartX = t.clientX
      tStartY = t.clientY
      tracking = true
    }
    const onTouchEnd = (e: TouchEvent) => {
      if (!tracking) return
      tracking = false
      const t = e.changedTouches[0]
      const dx = t.clientX - tStartX
      const dy = t.clientY - tStartY
      if (Math.abs(dx) < TOUCH_THRESHOLD) return
      if (Math.abs(dx) < Math.abs(dy)) return
      // Swipe LEFT (dx < 0) advances to the next slide.
      nudge(dx < 0 ? 1 : -1)
    }

    el.addEventListener('wheel',      onWheel,      { passive: true })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    return () => {
      el.removeEventListener('wheel',      onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [active, setIndex, pauseForInteraction, mark.slides.length])

  return (
    <section
      ref={ref}
      className="marks-section"
      aria-label={mark.name}
      data-mark-id={mark.id}
      data-mark-index={index}
    >
      <MarkCarousel mark={mark} index={activeSlide} />
      <MarkChrome mark={mark} index={activeSlide} />
    </section>
  )
}
