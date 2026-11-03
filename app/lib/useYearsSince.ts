'use client'

// useYearsSince — a live "years since <year>" count that is hydration-safe.
//
// Same shape as useGreeting, for the same reason: reading the clock during
// render bakes the build machine's date into the prerendered HTML and the
// visitor's into the browser, and on this site that mismatch wipes the page
// gate (app/_landing/ANOMALIES.md → "Clock-in-render wipes the page gate").
//
// The seed is the BUILD year (NEXT_PUBLIC_BUILD_YEAR, inlined by
// next.config.mjs), so server and client agree and the static HTML already
// carries a true count for readers without JS. useLayoutEffect then swaps in
// the visitor's year before paint, which only differs when a New Year has
// passed since the last deploy.
//
// Consumers: app/(works)/all InvitationCard ("Over the past N years").

import { useState, useLayoutEffect } from 'react'

const BUILD_YEAR = Number(process.env.NEXT_PUBLIC_BUILD_YEAR)

export function useYearsSince(startYear: number): number {
  const [years, setYears] = useState(BUILD_YEAR - startYear)

  useLayoutEffect(() => {
    setYears(new Date().getFullYear() - startYear)
  }, [startYear])

  return years
}
