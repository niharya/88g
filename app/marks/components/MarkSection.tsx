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
import { useDominanceSnap } from './hooks/useDominanceSnap'
import { scrollGlide } from '../lib/scrollGlide'
import { isAutoScrollActive, startAutoScroll, subscribeAutoScroll } from '../lib/autoScroll'

interface MarkSectionProps {
  mark:  MarkEntry
  index: number
}

// Thresholds for the settle latch. Settled once we're 85% into the entry;
// released back to scroll-driven when we drop below 60% (hysteresis stops
// it flipping each frame if the user parks right at the edge).
const SETTLE_IN  = 0.85
const SETTLE_OUT = 0.60

// Dominance-based snap lives in useDominanceSnap (shared with BlankSection
// and HeroClone). MarkSection only owns the --mark-p/--mark-v/data-settled
// writes, delivered via the hook's onScroll callback.

export default function MarkSection({ mark, index }: MarkSectionProps) {
  const ref = useRef<HTMLElement>(null)
  const [active, setActive] = useState(false)
  const [autoScrolling, setAutoScrolling] = useState(false)
  const [hasEnteredViewport, setHasEnteredViewport] = useState(false)

  // Active when ≥50% of the section is in the viewport — used only to gate
  // the showcase timer. Separate from the scroll-progress reveal below.
  // `hasEnteredViewport` latches true the first time any part of the section
  // is visible; drives the hidden preloader inside MarkCarousel so every
  // non-mark slide's source is fetched in parallel before the carousel
  // advances to it. Latch never resets — preloaded sources stay cached.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        setActive(entry.intersectionRatio >= 0.5)
        if (entry.intersectionRatio > 0) setHasEnteredViewport(true)
      },
      { threshold: [0, 0.5, 1] },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  // Credits-reel transport gate: while auto-scroll is carrying the reader
  // from Hero → first mark, the showcase timer must not tick — otherwise
  // the first slide may advance before the reader arrives. The subscribe
  // fires immediately with current state so mount-order doesn't matter.
  useEffect(() => {
    return subscribeAutoScroll(setAutoScrolling)
  }, [])

  // Per-frame writes for this section: --mark-p (entry progress),
  // --mark-v (centered-ness), and the data-settled latch with hysteresis.
  // The dominance-based snap + listener plumbing lives in useDominanceSnap.
  const settledRef = useRef(false)
  const onScroll = useCallback((el: HTMLElement, rect: DOMRect, vh: number) => {
    const top = rect.top
    const p = Math.max(0, Math.min(1, (vh - top) / vh))
    el.style.setProperty('--mark-p', String(p))

    // --mark-v: centered-ness, 1 when the section sits centered in the
    // viewport, 0 when it's fully off (either direction). Drives the
    // scroll-tied exit fade + scale per-leaf in CSS.
    const centerDist = Math.abs((rect.top + rect.height / 2) - vh / 2)
    const v = Math.max(0, Math.min(1, 1 - centerDist / vh))
    el.style.setProperty('--mark-v', String(v))

    if (!settledRef.current && p >= SETTLE_IN) {
      settledRef.current = true
      el.dataset.settled = 'true'
    } else if (settledRef.current && p <= SETTLE_OUT) {
      settledRef.current = false
      delete el.dataset.settled
    }
  }, [])
  useDominanceSnap(ref, { onScroll })

  // When the last slide wraps, paper-glide into the next mark section.
  // After the final mark (Kilti) the wrap triggers the outro auto-scroll
  // instead: a continuous 3.5 vh/s ride through BlankSection into the
  // HeroClone, where the teleport fires and intro re-arms for the next
  // loop. This is how the reel becomes genuinely autonomous — the reader
  // never has to scroll manually to keep the loop alive.
  //
  // Gated on `isAutoScrollActive()`: while the intro reel is still carrying
  // the reader toward Furrmark, scrollGlide would step on it (100vh tween
  // fighting additive dy → jarring overshoot). We still consume the wrap
  // (slide index cycles via modulo) so the paginator stays live.
  const advanceToNextMark = useCallback(() => {
    if (isAutoScrollActive()) return

    const nextIdx = index + 1
    const nextMark = MARKS[nextIdx]
    // Last mark (Kilti) → start the outro reel instead of gliding.
    // Everything from here through the teleport is autoScroll-owned.
    if (!nextMark) {
      startAutoScroll('outro')
      return
    }
    const nextSection = document.querySelector<HTMLElement>(
      `.marks-section[data-mark-id="${nextMark.id}"]`,
    )
    if (!nextSection) return
    const top = nextSection.getBoundingClientRect().top + window.scrollY
    scrollGlide(top)
  }, [index])

  const { index: activeSlide, setIndex, pauseForInteraction, setHoverPaused, clickPaused, hoverPaused } = useShowcaseTimer({
    total:  mark.slides.length,
    active: active && !autoScrolling,
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

    // Keyboard arrows on the dominant mark — bounded within this mark
    // (no cross-mark hop). Counts as interaction → click-pause semantics.
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return
      // Ignore if the user is typing into a field.
      const target = e.target as HTMLElement | null
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)) return
      e.preventDefault()
      nudge(e.key === 'ArrowRight' ? 1 : -1)
    }

    el.addEventListener('wheel',      onWheel,      { passive: true })
    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      el.removeEventListener('wheel',      onWheel)
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchend',   onTouchEnd)
      window.removeEventListener('keydown', onKey)
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
      <MarkCarousel mark={mark} index={activeSlide} preload={hasEnteredViewport} />
      <MarkChrome
        mark={mark}
        index={activeSlide}
        // Gated with the same condition as useShowcaseTimer's `active` so the
        // dot fill animation starts *with* the tick — not when the section
        // crosses 50% visibility while auto-scroll is still carrying the
        // reader toward it. Without the gate the pill would visually empty
        // before the timer had actually started, reading as a broken clock.
        active={active && !autoScrolling}
        clickPaused={clickPaused}
        hoverPaused={hoverPaused}
        onJump={(i) => {
          pauseForInteraction()
          setIndex(i)
          // Snap this section to viewport top so the jumped-to slide is
          // actually in view — the user may have clicked from a section
          // that's only partially docked.
          const el = ref.current
          if (el) {
            const top = el.getBoundingClientRect().top + window.scrollY
            if (Math.abs(top - window.scrollY) > 1) {
              // --dur-settle (0.5s) — snappier than the default paper glide,
              // matches the "settles into place" semantic for a paginator click.
              const dur = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--dur-settle')) * 1000
              scrollGlide(top, dur || 500)
            }
          }
        }}
        onHoverChange={setHoverPaused}
      />
    </section>
  )
}
