'use client'

// Counter — a count-up number for the Outcome stats. Re-timed to the house
// motion language: a single ease-out cubic that settles (no overshoot), and
// none of the reference's motion-blur / translate (the tile place-in carries
// the entrance). Counts 0 → value once on mount. Reduced-motion shows the
// final value and never counts.
//
// The server HTML carries the FINAL value, not 0: crawlers, link-preview bots
// and no-JS readers take the prerender as the truth, and a stat reading "0 mo"
// there is a false claim. The first client render must match it (a hydration
// mismatch strips the page gate — app/_landing/ANOMALIES.md → "Clock-in-render
// wipes the page gate"), so the drop to 0 happens in useLayoutEffect, before
// paint. Never branch the useState initializer on useReducedMotion: it is
// null on the server and real on the client, which is exactly that mismatch.

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

const DUR = 1000 // count duration (ms) — legibility tier, ~--dur-place
const BASE = 360 // start offset after the drawer settles (ms)

export function Counter({
  value,
  suffix = '',
  delay = 0,
}: {
  value: number
  suffix?: string
  delay?: number
}) {
  const reduce = useReducedMotion()
  const [n, setN] = useState(value)
  const raf = useRef(0)

  // Pre-paint drop to the count's starting point — see the header.
  useLayoutEffect(() => {
    if (!reduce) setN(0)
  }, [value, reduce])

  useEffect(() => {
    if (reduce) {
      setN(value)
      return
    }
    let start = 0
    const begin = BASE + delay
    const tick = (now: number) => {
      if (!start) start = now + begin
      const t = Math.min(1, Math.max(0, (now - start) / DUR))
      const e = 1 - Math.pow(1 - t, 3) // ease-out cubic — settles, no bounce
      setN(Math.round(value * e))
      if (t < 1) raf.current = requestAnimationFrame(tick)
      else setN(value)
    }
    raf.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf.current)
  }, [value, delay, reduce])

  return (
    <span className="signals-stat__num">
      {n}
      {suffix}
    </span>
  )
}
