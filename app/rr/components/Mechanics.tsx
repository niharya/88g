'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import { useScroll, useMotionValueEvent, useTransform, useSpring } from 'framer-motion'
import type { RoundOutcome } from './game/game-logic'
import { GameBoard } from './game/GameBoard'
import RulesRail from './RulesRail'
import NoteRail from './NoteRail'
import StoryCard from './StoryCard'

const NOTE_REVEALED_KEY = 'rr-note-revealed'

// Choreography tuning
const HOLD = 0.15  // first 15% of pinned scroll = mat held centered, no movement

export default function Mechanics() {
  const [results, setResults] = useState<RoundOutcome[]>([])

  // Dismiss signal for the first-visit rules overlay — flips true when the
  // game starts (i.e. the user clicked "Start game").
  const [rulesDismissed, setRulesDismissed] = useState(false)

  // Note rail reveal — same gating as before. Hidden until first game-end,
  // persisted in localStorage so return visits show it instantly.
  const [noteRevealed, setNoteRevealed] = useState(false)
  const [justRevealed, setJustRevealed] = useState(false)

  // True once the spring follower is essentially at its locked end position.
  // Passed to StoryCard so its dotted-path one-shot can fire after the mat
  // has visually settled (with its own 500ms delay).
  const [splitSettled, setSplitSettled] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(NOTE_REVEALED_KEY) === '1') {
      setNoteRevealed(true)
    }
  }, [])

  const handleResultsChange = useCallback((r: RoundOutcome[]) => {
    setResults(r)
  }, [])

  // ── Scroll-bound mat split ────────────────────────────────────────────────
  // Scene wrapper is 200vh tall; the inner stage is sticky (100vh) so both
  // mats stay glued to the viewport while progress 0 → 1 drives the split.
  // Reversible — scrolling back up reverses the split.
  const sceneRef   = useRef<HTMLDivElement>(null)
  const stageRef   = useRef<HTMLDivElement>(null)
  const primaryRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: sceneRef,
    offset: ['start start', 'end end'],
  })

  // Timer ref for the delayed auto-scroll so we can clean up on unmount.
  const autoScrollTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleGameOver = useCallback(() => {
    setNoteRevealed(prev => {
      if (prev) return prev
      setJustRevealed(true)
      try { window.localStorage.setItem(NOTE_REVEALED_KEY, '1') } catch {}
      return true
    })

    // Wait for the game-over choreography to fully complete (~2.7s) before
    // auto-advancing the mat split. Without this the secondary mat slides in
    // abruptly while cards are still animating.
    if (autoScrollTimer.current) clearTimeout(autoScrollTimer.current)
    autoScrollTimer.current = setTimeout(() => {
      const scene = sceneRef.current
      if (!scene) return
      const rect = scene.getBoundingClientRect()
      const inView = rect.bottom > 0 && rect.top < window.innerHeight
      if (!inView) return
      if (scrollYProgress.get() >= 0.999) return

      const sceneDocTop = rect.top + window.scrollY
      const target = sceneDocTop + scene.offsetHeight - window.innerHeight
      window.scrollTo({ top: target, behavior: 'smooth' })
    }, 3000)
  }, [scrollYProgress])

  // Clean up auto-scroll timer on unmount
  useEffect(() => {
    return () => {
      if (autoScrollTimer.current) clearTimeout(autoScrollTimer.current)
    }
  }, [])

  // Hold zone — first HOLD of progress is dead time so the user reads the
  // full-width mat before anything moves. Remap [HOLD, 1] → [0, 1].
  const animProgress = useTransform(scrollYProgress, [HOLD, 1], [0, 1], { clamp: true })

  // Spring follower — uses the duration/bounce API instead of stiffness/mass
  // because it maps more directly to feel: `duration` is how long the spring
  // takes to settle, `bounce` is how much it overshoots. Underdamped enough
  // to be visibly springy on settle. Still scroll-bound — the spring chases
  // scrollYProgress, so dragging the scrollbar still drives it.
  const springProgress = useSpring(animProgress, {
    duration: 0.55,
    bounce: 0.35,
    restDelta: 0.0005,
  })

  // Write progress as a CSS variable on the stage so both mats (primary and
  // secondary, siblings inside the stage) inherit it. The .is-split class
  // flips on the primary mat the moment progress leaves 0 so the secondary's
  // border doesn't render as a stray line when its position is still off-screen.
  // splitSettled flips at ~0.95 so downstream one-shot animations (StoryCard's
  // dotted path) know the mat is essentially in place.
  useMotionValueEvent(springProgress, 'change', v => {
    stageRef.current?.style.setProperty('--rr-mech-progress', String(v))
    primaryRef.current?.classList.toggle('is-split', v > 0.0005)
    setSplitSettled(v > 0.95)
  })

  return (
    <div ref={sceneRef} className="rr-mech-scene">
      <div ref={stageRef} className="rr-mech-stage">

        {/* Primary mat — fixed-width (678px) mat surface that translates from
            stage center to flush-left as progress goes 0 → 1. Carries .mat
            class so it inherits grid + paper noise from globals.
            data-arrow-target hooks ChapterMarker's arrow rotation. */}
        <div ref={primaryRef} className="rr-mat--primary mat" data-arrow-target>
          <div className="rr-mech-family">
            <RulesRail dismiss={rulesDismissed} />
            <div className="rr-game-board">
              <GameBoard
                onResultsChange={handleResultsChange}
                onGameOver={handleGameOver}
                onGameStart={() => setRulesDismissed(true)}
              />
            </div>
            {noteRevealed && <NoteRail playReveal={justRevealed} />}
          </div>
        </div>

        {/* Secondary mat — fixed-width (678px) sibling that slides in from the
            right as the primary slides left. Reads the same --rr-mech-progress. */}
        <div className="rr-mat--secondary mat">
          <StoryCard results={results} splitSettled={splitSettled} />
        </div>

      </div>
    </div>
  )
}
