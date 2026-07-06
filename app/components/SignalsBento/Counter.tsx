'use client'

// Counter — a count-up number for the Outcome stats. Re-timed to the house
// motion language: a single ease-out cubic that settles (no overshoot), and
// none of the reference's motion-blur / translate (the tile place-in carries
// the entrance). Counts from 0 → value once on mount; since the bento only
// mounts when the drawer opens, mount == reveal. Reduced-motion shows the
// final value immediately.

import { useEffect, useRef, useState } from 'react'
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
  const [n, setN] = useState(reduce ? value : 0)
  const raf = useRef(0)

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
