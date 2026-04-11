'use client'

import { useEffect, useMemo, useRef } from 'react'

/* ── Seeded PRNG (mulberry32) ─────────────────────────────────────────── */

function mulberry32(seed: number) {
  let t = seed >>> 0
  return function () {
    t += 0x6d2b79f5
    let r = Math.imul(t ^ (t >>> 15), 1 | t)
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r)
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296
  }
}

function hash32(str: string) {
  let h = 2166136261
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/* ── Profiles ─────────────────────────────────────────────────────────── */

export type ScrambleProfile = keyof typeof PROFILES

/**
 * Named scramble personalities. Each profile controls the visual texture
 * (glyph set), pacing (duration, stagger, FPS), and reveal strategy.
 *
 * cipher   — block/tech glyphs, fast LTR. "Decoding" energy.
 * mono     — binary/hex, steady typewriter. Terminal aesthetic.
 * glitch   — heavy unicode noise, very fast, random lock-in. Digital chaos.
 * mystic   — runic/alchemical symbols, slow, random. Arcane reveal.
 * poetic   — soft vowels and punctuation, gentle random. Quiet transitions.
 * numeric  — numbers and math operators, medium speed. Scoreboard/stats.
 * minimal  — dots and dashes, very fast typewriter. Subtle UI labels.
 * fragment — mixed-case Latin fragments, medium. Anagram/word-puzzle feel.
 */
const PROFILES = {
  cipher: {
    glyphs: '█▓▒░<>/\\|{}[]—=+*^?#',
    durationMs: 900,
    staggerMs: 18,
    scrambleFps: 30,
    revealMode: 'ltr' as const,
  },
  mono: {
    glyphs: '01│─┌┐└┘├┤┬┴┼',
    durationMs: 800,
    staggerMs: 22,
    scrambleFps: 24,
    revealMode: 'typewriter' as const,
  },
  glitch: {
    glyphs: '▀▄█▌▐░▒▓╳╱╲◢◣◤◥',
    durationMs: 500,
    staggerMs: 10,
    scrambleFps: 48,
    revealMode: 'random' as const,
  },
  mystic: {
    glyphs: 'ᚠᚢᚦᚨᚱᚲᚷᚹᚺᛃᛈᛉᛊᛏᛒᛖᛗᛚᛝᛟ',
    durationMs: 1600,
    staggerMs: 30,
    scrambleFps: 16,
    revealMode: 'random' as const,
  },
  poetic: {
    glyphs: 'aeiouy…·~-–',
    durationMs: 1400,
    staggerMs: 24,
    scrambleFps: 20,
    revealMode: 'random' as const,
  },
  numeric: {
    glyphs: '0123456789+-×÷=%',
    durationMs: 700,
    staggerMs: 16,
    scrambleFps: 28,
    revealMode: 'ltr' as const,
  },
  minimal: {
    glyphs: '·.:-–_',
    durationMs: 400,
    staggerMs: 12,
    scrambleFps: 36,
    revealMode: 'typewriter' as const,
  },
  fragment: {
    glyphs: 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ',
    durationMs: 600,
    staggerMs: 14,
    scrambleFps: 30,
    revealMode: 'ltr' as const,
  },
} as const

type RevealMode = 'ltr' | 'random' | 'typewriter'

/* ── Reduced-motion hook ──────────────────────────────────────────────── */

function usePrefersReducedMotion() {
  return useMemo(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])
}

/* ── Component ────────────────────────────────────────────────────────── */

interface ScrambleTextProps {
  text: string
  /** Named profile — controls glyphs, pacing, and reveal mode. */
  profile?: ScrambleProfile
  /** Seed for deterministic randomness. Defaults to text content. */
  seed?: string
  /** Override duration (ms). Falls back to profile default. */
  duration?: number
  /** Override reveal mode. Falls back to profile default. */
  revealMode?: RevealMode
  /** Legacy: override glyph pool directly. */
  pool?: string
  /** Legacy: override tick interval (ms). Converted to scrambleFps. */
  tick?: number
  className?: string
  /** Called when all characters have resolved. */
  onDone?: () => void
}

export function ScrambleText({
  text,
  profile: profileName = 'cipher',
  seed,
  duration,
  revealMode,
  pool,
  tick,
  className,
  onDone,
}: ScrambleTextProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const reducedMotion = usePrefersReducedMotion()

  useEffect(() => {
    const el = ref.current
    if (!el) return

    // Stable accessible name while visible text scrambles
    el.setAttribute('aria-label', text)

    // Reduced motion: show final text immediately
    if (reducedMotion) {
      el.textContent = text
      onDone?.()
      return
    }

    const p = PROFILES[profileName] || PROFILES.cipher
    const chars = Array.from(text)
    const glyphs = Array.from(pool || p.glyphs)
    const totalDuration = duration ?? p.durationMs
    const mode: RevealMode = revealMode ?? p.revealMode

    // Seeded RNG — deterministic per seed+profile+text
    const rng = mulberry32(hash32(`${seed ?? text}::${profileName}`))

    // Build reveal order
    const indices = chars.map((_, i) => i)
    if (mode === 'random') {
      // Fisher–Yates with seeded RNG
      for (let i = indices.length - 1; i > 0; i--) {
        const j = Math.floor(rng() * (i + 1))
        ;[indices[i], indices[j]] = [indices[j], indices[i]]
      }
    }

    // Per-character resolve times
    const stagger = p.staggerMs
    const now = performance.now()
    const resolveAt = chars.map((ch, i) => {
      if (ch === ' ') return 0 // spaces resolve instantly
      let pos: number
      if (mode === 'random') {
        pos = indices.indexOf(i)
      } else if (mode === 'typewriter') {
        // Typewriter: evenly spaced across duration, no jitter
        const charCount = chars.filter(c => c !== ' ').length
        const tw_stagger = (totalDuration - 80) / Math.max(1, charCount - 1)
        return now + 80 + i * tw_stagger
      } else {
        pos = i
      }
      const jitter = Math.floor(rng() * 40)
      return now + Math.min(totalDuration, 120 + pos * stagger + jitter)
    })

    // Throttle glyph refresh to scrambleFps
    const scrambleFps = tick ? Math.round(1000 / tick) : p.scrambleFps
    const scrambleInterval = 1000 / scrambleFps
    let lastScrambleTick = 0
    let cachedNoise = chars.map(() => '')

    let rafId = 0
    const node = el // stable non-null ref for closure
    function frame(t: number) {
      // Refresh noise glyphs at capped FPS
      if (t - lastScrambleTick >= scrambleInterval) {
        lastScrambleTick = t
        cachedNoise = chars.map((ch) => {
          if (ch === ' ') return ' '
          return glyphs[Math.floor(rng() * glyphs.length)]
        })
      }

      let doneCount = 0
      const nonSpaceCount = chars.filter((c) => c !== ' ').length

      const out = chars
        .map((ch, i) => {
          if (ch === ' ') return ' '
          if (t >= resolveAt[i]) {
            doneCount++
            return ch
          }
          return cachedNoise[i]
        })
        .join('')

      node.textContent = out

      if (doneCount >= nonSpaceCount) {
        node.textContent = text // ensure exact final text
        onDone?.()
        return
      }
      rafId = requestAnimationFrame(frame)
    }

    rafId = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(rafId)
  }, [text, profileName, seed, duration, revealMode, pool, tick, reducedMotion, onDone])

  return (
    <span ref={ref} className={className}>
      {text}
    </span>
  )
}
