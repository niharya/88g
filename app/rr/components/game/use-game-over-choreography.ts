'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Game-over choreography step machine.
 *
 * 0 = IDLE        — not in game-over (or before any beat starts)
 * 1 = TEXT_FADE   — round/status/deck-label text fades out
 * 2 = FLIP        — all face-up cards rotate to face-down
 * 3 = COLLAPSE    — horizontal wave: each group collapses to its own center
 * 4 = MERGE       — vertical merge: all groups slide into one stack
 * 5 = SETTLE      — stack aligns to 0° tilt (no cards peek) — clean ease-out
 * 6 = LIFT        — stack nudges up + icon morphs + Play Again nudges in
 */
export type GameOverStep = 0 | 1 | 2 | 3 | 4 | 5 | 6

const STEP_DELAYS: Record<GameOverStep, number> = {
  0: 0,
  1: 250,   // text fade
  2: 350,   // flip
  3: 500,   // horizontal collapse
  4: 750,   // vertical merge + pause before Part 2
  5: 320,   // settle straighten (clean, no bounce)
  6: 0,     // lift + morph + play again nudge
}

// Total tilt slots — 2 opponent + 2 player + 6 deck = 10 cards
const TILT_COUNT = 10
const TILT_RANGE = 2 // degrees (±)

interface UseGameOverChoreographyReturn {
  step: GameOverStep
  tilts: number[]
}

export function useGameOverChoreography(active: boolean): UseGameOverChoreographyReturn {
  const [step, setStep] = useState<GameOverStep>(0)
  const tiltsRef = useRef<number[]>([])

  // Pre-compute tilts once per game-over activation
  if (active && tiltsRef.current.length === 0) {
    tiltsRef.current = Array.from(
      { length: TILT_COUNT },
      () => (Math.random() * 2 - 1) * TILT_RANGE,
    )
  }

  useEffect(() => {
    if (!active) {
      setStep(0)
      tiltsRef.current = []
      return
    }

    const timers: ReturnType<typeof setTimeout>[] = []
    const advance = (next: GameOverStep, delayFromPrev: number) => {
      const t = setTimeout(() => setStep(next), delayFromPrev)
      timers.push(t)
    }

    // Schedule each beat relative to game-over activation
    let cumulative = 0
    setStep(1)
    cumulative += STEP_DELAYS[1]
    advance(2, cumulative)
    cumulative += STEP_DELAYS[2]
    advance(3, cumulative)
    cumulative += STEP_DELAYS[3]
    advance(4, cumulative)
    cumulative += STEP_DELAYS[4]
    advance(5, cumulative)
    cumulative += STEP_DELAYS[5]
    advance(6, cumulative)

    return () => {
      timers.forEach(clearTimeout)
    }
  }, [active])

  return { step, tilts: tiltsRef.current }
}
