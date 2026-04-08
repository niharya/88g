'use client'

import { useState, useCallback, useEffect } from 'react'
import type { RoundOutcome } from './game/game-logic'
import { GameBoard } from './game/GameBoard'
import RulesRail from './RulesRail'
import NoteRail from './NoteRail'
import StoryCard from './StoryCard'

const NOTE_REVEALED_KEY = 'rr-note-revealed'

export default function Mechanics() {
  const [results, setResults] = useState<RoundOutcome[]>([])

  // Note rail reveal:
  // - hidden by default; appears the first time the player reaches a
  //   game-end state (victory or defeat). Once revealed, persisted in
  //   localStorage so future visits show it immediately.
  // - `noteRevealed`: render the rail at all
  // - `justRevealed`: it became revealed in *this* session, so play the
  //   gentle pop-in animation and start it open. On return visits this
  //   stays false → rail renders instantly, closed, with no flourish.
  const [noteRevealed, setNoteRevealed] = useState(false)
  const [justRevealed, setJustRevealed] = useState(false)

  // Read persisted state after mount (avoids SSR/hydration mismatch)
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(NOTE_REVEALED_KEY) === '1') {
      setNoteRevealed(true)
    }
  }, [])

  const handleResultsChange = useCallback((r: RoundOutcome[]) => {
    setResults(r)
  }, [])

  const handleGameOver = useCallback(() => {
    setNoteRevealed(prev => {
      if (prev) return prev
      setJustRevealed(true)
      try { window.localStorage.setItem(NOTE_REVEALED_KEY, '1') } catch {}
      return true
    })
  }, [])

  return (
    <div className="rr-canvas">

      {/* Story card — story ↔ structure toggle, reflects live game results */}
      <StoryCard results={results} />

      {/* Rules rail — slides from right of game board */}
      <RulesRail />

      {/* Note rail — hidden until first game-end, then persisted */}
      {noteRevealed && (
        <NoteRail playReveal={justRevealed} />
      )}

      {/* Game board */}
      <div className="rr-game-board">
        <GameBoard
          onResultsChange={handleResultsChange}
          onGameOver={handleGameOver}
        />
      </div>

    </div>
  )
}
