/**
 * Time-of-day greeting. Canonical logic — used by the landing page and
 * the /all timeline so both read with the same voice.
 *
 * Sentence case is intentional: the site's copy register is calm, not titular.
 */
export function getGreeting(): string {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'Good morning'
  if (h >= 12 && h < 17) return 'Good afternoon'
  return 'Good evening'
}

export type GreetingStage = 'morning' | 'afternoon' | 'evening'

export function getGreetingStage(): GreetingStage {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  return 'evening'
}
