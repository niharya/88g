/**
 * Time-of-day greeting. Canonical logic — used by the landing page, the /all
 * timeline and the /shape-of-product sign-off, so all three read with the same
 * voice.
 *
 * Sentence case is intentional: the site's copy register is calm, not titular.
 *
 * These functions read the CLOCK, so they return a different value on the
 * server (frozen at prerender) than in the visitor's browser. Never call them
 * during a React render — go through `useGreeting()` (app/lib/useGreeting.ts),
 * which keeps the first render hydration-stable. See app/_landing/ANOMALIES.md
 * → "Clock-in-render wipes the page gate".
 */

export type GreetingStage = 'morning' | 'afternoon' | 'evening'

/** Stage → greeting. The one place the three strings live. */
export const GREETING_BY_STAGE: Record<GreetingStage, string> = {
  morning:   'Good morning',
  afternoon: 'Good afternoon',
  evening:   'Good evening',
}

export function getGreetingStage(): GreetingStage {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  return 'evening'
}

export function getGreeting(): string {
  return GREETING_BY_STAGE[getGreetingStage()]
}
