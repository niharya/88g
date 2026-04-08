'use client'

import { useEffect, useState } from 'react'

interface ScrambleTextProps {
  text: string
  /** Total animation length in ms. */
  duration?: number
  /** How often to swap random characters (ms). */
  tick?: number
  /** Character pool to pull random glyphs from. */
  pool?: string
  className?: string
}

const DEFAULT_POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%&*'

/**
 * Scramble-to-reveal text effect. Each character in `text` starts as a
 * random glyph from `pool` and "settles" into its final letter at a
 * staggered time across `duration`. Preserves spaces.
 *
 * No framer-motion primitive exists for this — it's a small interval loop.
 */
export function ScrambleText({
  text,
  duration = 600,
  tick = 35,
  pool = DEFAULT_POOL,
  className,
}: ScrambleTextProps) {
  const [display, setDisplay] = useState(text)

  useEffect(() => {
    const start = performance.now()
    // Per-character settle time within [duration * 0.3, duration]
    const settles = Array.from({ length: text.length }, (_, i) => {
      if (text[i] === ' ') return 0
      const stagger = (i / Math.max(1, text.length - 1)) * duration * 0.6
      return stagger + duration * 0.4
    })

    const id = window.setInterval(() => {
      const now = performance.now() - start
      let out = ''
      let anyPending = false
      for (let i = 0; i < text.length; i++) {
        const ch = text[i]
        if (ch === ' ') {
          out += ' '
          continue
        }
        if (now >= settles[i]) {
          out += ch
        } else {
          anyPending = true
          out += pool[Math.floor(Math.random() * pool.length)]
        }
      }
      setDisplay(out)
      if (!anyPending) {
        window.clearInterval(id)
        setDisplay(text)
      }
    }, tick)

    return () => window.clearInterval(id)
  }, [text, duration, tick, pool])

  return <span className={className}>{display}</span>
}
