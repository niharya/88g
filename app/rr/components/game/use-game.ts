"use client"

import { useState, useCallback, useEffect, useRef } from "react"
import {
  type GameState,
  createIdleState,
  startGame,
  endPeek,
  chooseCard,
  resolveRound,
  nextRound,
  PEEK_DURATION_MS,
  REVEAL_DELAY_MS,
  AUTO_ADVANCE_MS,
} from "./game-logic"

export interface UseGameReturn {
  state: GameState
  pickCard: (index: 0 | 1) => void
  start: () => void
  restart: () => void
  /** Dev shortcut: jump straight to GAME_OVER with a fixed result. */
  forceGameOver: (result: 'victory' | 'defeat') => void
  /** Countdown seconds shown during RESOLVED (3 → 1), or null otherwise. */
  countdown: number | null
  /** Peek timer remaining as a 1 → 0 ratio, or 0 outside PEEK. */
  peekProgress: number
}

export function useGame(totalRounds = 5): UseGameReturn {
  // Lazy init: createIdleState is deterministic (no Math.random) so SSR-safe.
  const [state, setState] = useState<GameState>(() => createIdleState(totalRounds))
  const [countdown, setCountdown] = useState<number | null>(null)
  const [peekProgress, setPeekProgress] = useState(0)

  // PEEK: drive progress ticker AND end-of-peek transition from one effect.
  useEffect(() => {
    if (state.phase !== "PEEK") {
      setPeekProgress(0)
      return
    }
    const startTime = Date.now()
    setPeekProgress(1)

    const tick = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.max(1 - elapsed / PEEK_DURATION_MS, 0)
      setPeekProgress(remaining)
      if (remaining <= 0) clearInterval(tick)
    }, 30)

    const end = setTimeout(() => {
      setState((prev) => endPeek(prev))
    }, PEEK_DURATION_MS)

    return () => {
      clearInterval(tick)
      clearTimeout(end)
    }
  }, [state.phase, state.round])

  // REVEALING -> RESOLVED after timer
  useEffect(() => {
    if (state.phase !== "REVEALING") return
    const timer = setTimeout(() => {
      setState((prev) => resolveRound(prev))
    }, REVEAL_DELAY_MS)
    return () => clearTimeout(timer)
  }, [state.phase, state.round])

  // RESOLVED -> auto-advance with countdown
  const advanceTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  useEffect(() => {
    if (state.phase !== "RESOLVED") {
      setCountdown(null)
      return
    }
    const startTime = Date.now()
    setCountdown(3)

    advanceTimerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime
      const remaining = Math.ceil((AUTO_ADVANCE_MS - elapsed) / 1000)

      if (remaining <= 0) {
        if (advanceTimerRef.current) clearInterval(advanceTimerRef.current)
        advanceTimerRef.current = null
        setCountdown(null)
        setState((prev) => nextRound(prev))
      } else {
        setCountdown(remaining)
      }
    }, 200)

    return () => {
      if (advanceTimerRef.current) {
        clearInterval(advanceTimerRef.current)
        advanceTimerRef.current = null
      }
    }
  }, [state.phase, state.round])

  const pickCard = useCallback((index: 0 | 1) => {
    setState((prev) => (prev.phase === "CHOOSING" ? chooseCard(prev, index) : prev))
  }, [])

  const start = useCallback(() => {
    setState((prev) => startGame(prev))
  }, [])

  const restart = useCallback(() => {
    setState(createIdleState(totalRounds))
  }, [totalRounds])

  const forceGameOver = useCallback((result: 'victory' | 'defeat') => {
    setState({
      ...createIdleState(totalRounds),
      phase: 'GAME_OVER',
      round: totalRounds,
      totalRounds,
      playerHand: [5, 15],
      opponentHand: [6, 16],
      playerChoiceIndex: 0,
      opponentChoiceIndex: 0,
      results: result === 'victory'
        ? ['P', 'P', 'P', 'O', 'O']
        : ['O', 'O', 'O', 'P', 'P'],
      playerDiscard: [7, 9, 11, 13, 5],
      playerDeck: [15],
      opponentDiscard: [6, 8, 10, 12, 14],
      opponentDeck: [16],
    })
  }, [totalRounds])

  return { state, pickCard, start, restart, forceGameOver, countdown, peekProgress }
}
