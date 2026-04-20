'use client'

// useShowcaseTimer — 8s/slide auto-advance with idle-resume semantics.
//
// Drives a numeric index that advances on a fixed cadence (default 8s)
// while the page is active and the user isn't mid-interaction. Matches the
// MARKS_BRIEF spec:
//
//   • Runs by default when the page loads.
//   • Any user interaction pauses it via `pauseForInteraction()`; it
//     resumes after `idleResumeMs` (default 24s) of no further calls.
//   • Paused when `document.visibilityState === 'hidden'`.
//   • Disabled under `prefers-reduced-motion: reduce`.
//
// The hook is active-state-aware: pass `active` to gate whether this instance
// should be ticking at all (e.g. only the visible mark section ticks). The
// wrap callback decides what "last slide" means (loop internally, or hand off
// to the next mark) — default is modulo loop.

import { useCallback, useEffect, useRef, useState } from 'react'

interface Options {
  total:         number        // total slide count for this mark
  active:        boolean       // is this section currently visible?
  slideMs?:      number        // default 8000
  idleResumeMs?: number        // default 12000
  onWrap?:       () => void    // called when advancing past the last slide
}

export function useShowcaseTimer({
  total,
  active,
  slideMs     = 8000,
  idleResumeMs = 12000,
  onWrap,
}: Options) {
  const [index, setIndex] = useState(0)
  // Two separate pause sources with different semantics:
  //   • clickPaused — "I interacted"; locks the fill to full, auto-releases
  //     after idleResumeMs. Used by paginator click-to-jump + manual gesture.
  //   • hoverPaused — "I'm reading"; freezes the fill in place, resumes from
  //     where it stopped when the cursor leaves. No idle delay.
  // Both halt the tick; CSS reads them separately via data attrs on the
  // paginator so the two pause styles can render differently.
  const [clickPaused, setClickPaused] = useState(false)
  const [hoverPaused, setHoverPaused] = useState(false)
  const paused = clickPaused || hoverPaused
  const resumeTimer = useRef<number | null>(null)
  // Deadline tracking so hoverPaused freezes in place. remainingRef holds
  // the time left on the current slide; deadlineRef is the performance.now()
  // at which the tick will fire while a timeout is armed.
  const remainingRef = useRef<number>(slideMs)
  const deadlineRef = useRef<number | null>(null)
  const lastIndexRef = useRef<number>(0)

  const pauseForInteraction = useCallback(() => {
    setClickPaused(true)
    if (resumeTimer.current !== null) {
      window.clearTimeout(resumeTimer.current)
    }
    resumeTimer.current = window.setTimeout(() => {
      setClickPaused(false)
      resumeTimer.current = null
    }, idleResumeMs)
  }, [idleResumeMs])

  // Advance tick — active + not paused + visible + reduced-motion not set.
  //
  // Uses deadline tracking so hoverPaused can freeze-in-place: on cleanup,
  // if a timeout was armed, we compute how much time was left and stash it
  // in remainingRef. The next run schedules for that remaining time. When
  // the slide actually changes (index bump), we reset remaining to slideMs.
  //
  // Single-slide marks (total === 1) still tick: `next = 0` which === 0,
  // so `onWrap` fires every `slideMs` — that hands off to the next mark.
  useEffect(() => {
    if (!active || paused || total < 1) return
    if (typeof window === 'undefined') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    if (document.visibilityState === 'hidden') return

    // Fresh slide → reset remaining to full duration.
    if (lastIndexRef.current !== index) {
      remainingRef.current = slideMs
      lastIndexRef.current = index
    }

    const wait = remainingRef.current
    deadlineRef.current = performance.now() + wait
    const id = window.setTimeout(() => {
      deadlineRef.current = null
      remainingRef.current = slideMs
      setIndex((prev) => {
        const next = (prev + 1) % total
        if (next === 0 && onWrap) onWrap()
        return next
      })
    }, wait)

    return () => {
      window.clearTimeout(id)
      if (deadlineRef.current !== null) {
        remainingRef.current = Math.max(0, deadlineRef.current - performance.now())
        deadlineRef.current = null
      }
    }
  }, [active, paused, index, total, slideMs, onWrap])

  // When `active` flips off, reset to slide 0 so each visit starts fresh.
  useEffect(() => {
    if (!active) setIndex(0)
  }, [active])

  // Visibility + reduced-motion listeners: re-render when either flips so the
  // tick effect above can re-evaluate. Bumping clickPaused with its own value
  // is a no-op that forces a render so the tick effect re-reads
  // document.visibilityState and returns early when hidden.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onVisibility = () => {
      setClickPaused((p) => p)
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [])

  // Clean up pending resume timer on unmount.
  useEffect(() => {
    return () => {
      if (resumeTimer.current !== null) {
        window.clearTimeout(resumeTimer.current)
      }
    }
  }, [])

  return { index, setIndex, pauseForInteraction, setHoverPaused, paused, clickPaused, hoverPaused }
}
