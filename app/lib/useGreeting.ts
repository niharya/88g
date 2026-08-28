'use client'

// useGreeting — the hydration-safe way to render the time-of-day greeting.
//
// WHY THIS EXISTS (it is not a convenience wrapper — it is a bug fix).
// `getGreeting()` reads the clock. Called during render — directly, or via
// `useState(getGreeting)`, whose lazy initializer ALSO runs on the server —
// it returns the build machine's time in the prerendered HTML and the
// visitor's time in the browser. That is a React hydration mismatch, and on
// this site a mismatch does not merely warn: React re-renders the root, which
// re-applies `<html className>` from the root layout and STRIPS the
// `.fonts-ready` page-gate class the inline script had already added. The gate
// then falls to its CSS failsafe, which on the landing used to hand `.landing`
// `pointer-events: auto` — an invisible sheet over the Startooth canvas that
// swallowed every click on the pattern. See app/_landing/ANOMALIES.md →
// "Clock-in-render wipes the page gate".
//
// The fix is the same shape the hero headline cycle uses: render a fixed seed
// that server and client both agree on, then swap in the real value in
// `useLayoutEffect` — which runs BEFORE paint, so no visitor ever sees the
// seed. (Both surfaces that use this are behind the page gate at `opacity: 0`
// on a cold load anyway, so it is doubly unobservable.)
//
// Consumers: app/page.tsx (landing hero), app/(works)/all Timeline (greeting +
// the time-of-day dot shape), app/shape-of-product SignOffCard.

import { useState, useLayoutEffect } from 'react'
import { GREETING_BY_STAGE, getGreetingStage, type GreetingStage } from './greeting'

/* The SSR seed. Any of the three would be correct — the value is swapped out
   before first paint and is never seen. `afternoon` is the middle bucket, so
   the seed is the median string width if a measurement ever reads it early
   (the landing's `--hero-h` ResizeObserver re-measures on the swap either
   way). Keep it a CONSTANT: deriving it from the clock is the whole bug. */
const SEED_STAGE: GreetingStage = 'afternoon'

export interface Greeting {
  /** "Good morning" | "Good afternoon" | "Good evening" */
  greeting: string
  /** The same value as a token, for time-of-day styling hooks. */
  stage: GreetingStage
}

export function useGreeting(): Greeting {
  const [value, setValue] = useState<Greeting>({
    greeting: GREETING_BY_STAGE[SEED_STAGE],
    stage: SEED_STAGE,
  })

  useLayoutEffect(() => {
    const stage = getGreetingStage()
    setValue({ greeting: GREETING_BY_STAGE[stage], stage })
  }, [])

  return value
}
