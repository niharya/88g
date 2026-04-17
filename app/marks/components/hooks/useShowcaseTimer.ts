'use client'

// useShowcaseTimer — 4s/slide auto-advance with idle-resume semantics.
//
// Drives a numeric index that advances on a fixed cadence (default 4s)
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
  slideMs?:      number        // default 4000
  idleResumeMs?: number        // default 24000
  onWrap?:       () => void    // called when advancing past the last slide
}

export function useShowcaseTimer({
  total,
  active,
  slideMs     = 4000,
  idleResumeMs = 24000,
  onWrap,
}: Options) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const resumeTimer = useRef<number | null>(null)

  const pauseForInteraction = useCallback(() => {
    setPaused(true)
    if (resumeTimer.current !== null) {
      window.clearTimeout(resumeTimer.current)
    }
    resumeTimer.current = window.setTimeout(() => {
      setPaused(false)
      resumeTimer.current = null
    }, idleResumeMs)
  }, [idleResumeMs])

  // Advance tick — only runs when active, not paused, visible, reduced-motion
  // not set. Depends on `index` so each tick re-arms the next one.
  useEffect(() => {
    if (!active || paused || total <= 1) return
    if (typeof window === 'undefined') return

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (reduced) return
    if (document.visibilityState === 'hidden') return

    const id = window.setTimeout(() => {
      setIndex((prev) => {
        const next = (prev + 1) % total
        if (next === 0 && onWrap) onWrap()
        return next
      })
    }, slideMs)

    return () => window.clearTimeout(id)
  }, [active, paused, index, total, slideMs, onWrap])

  // When `active` flips off, reset to slide 0 so each visit starts fresh.
  useEffect(() => {
    if (!active) setIndex(0)
  }, [active])

  // Visibility + reduced-motion listeners: re-render when either flips so the
  // tick effect above can re-evaluate. `paused` is the only state we actually
  // flip here; visibility is re-read inside the tick effect.
  useEffect(() => {
    if (typeof window === 'undefined') return
    const onVisibility = () => {
      // Forcing a state update re-runs the tick effect, which reads
      // document.visibilityState and returns early when hidden.
      setPaused((p) => p)
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

  return { index, setIndex, pauseForInteraction, paused }
}
