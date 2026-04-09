'use client'

import type { CSSProperties } from 'react'
import { useEffect, useRef, useState } from 'react'
import { useGame } from './use-game'
import { FaceDownCard } from './FaceDownCard'
import { NumberCard } from './NumberCard'
import { Scorecard } from './Scorecard'
import { DeckStrip } from './DeckStrip'
import { FlipCard } from './FlipCard'
import { ScrambleText } from './ScrambleText'
import { useGameOverChoreography } from './use-game-over-choreography'
import {
  type RoundOutcome,
  PLAYER_CARDS,
  getLastOutcome,
  getScores,
  wasAnomalyResolution,
} from './game-logic'

interface GameBoardProps {
  onResultsChange?: (results: RoundOutcome[]) => void
  onGameOver?: () => void
  onGameStart?: () => void
}

export function GameBoard({ onResultsChange, onGameOver, onGameStart }: GameBoardProps = {}) {
  const { state, pickCard, start, restart, forceGameOver, peekProgress } = useGame(5)

  useEffect(() => {
    onResultsChange?.(state.results)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.results])

  // Fire onGameOver exactly once each time the game enters GAME_OVER.
  useEffect(() => {
    if (state.phase === 'GAME_OVER') onGameOver?.()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase])
  const panelRef = useRef<HTMLDivElement>(null)

  // Idle tilts — [0,0] on SSR to avoid hydration mismatch; randomised
  // client-side after mount and each time IDLE is re-entered.
  const [idleTilts, setIdleTilts] = useState<[number, number]>([0, 0])

  // Dev shortcut: Shift+V → Victory, Shift+D → Defeat
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!e.shiftKey) return
      if (e.key === 'V') forceGameOver('victory')
      if (e.key === 'D') forceGameOver('defeat')
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [forceGameOver])

  const isGameOver = state.phase === 'GAME_OVER'
  const isIdle = state.phase === 'IDLE'
  const { step: endStep, tilts } = useGameOverChoreography(isGameOver)

  // Randomise idle tilts after mount and whenever IDLE is re-entered.
  // Not run on the server, so SSR and client agree on the initial [0,0].
  useEffect(() => {
    if (!isIdle) return
    setIdleTilts([
      (Math.random() * 2 - 1) * 2,
      (Math.random() * 2 - 1) * 2,
    ])
  }, [isIdle])

  // Measure merge offsets when game-over activates
  useEffect(() => {
    if (!isGameOver) return
    const panel = panelRef.current
    if (!panel) return
    const opp = panel.querySelector('.rr-game__opp-card')
    const player = panel.querySelector('.rr-game__player-card')
    const deck = panel.querySelector('.rr-deck-strip__chips')
    if (!opp || !player || !deck) return
    const oppCenter = opp.getBoundingClientRect().top + opp.getBoundingClientRect().height / 2
    const playerCenter = player.getBoundingClientRect().top + player.getBoundingClientRect().height / 2
    const deckCenter = deck.getBoundingClientRect().top + deck.getBoundingClientRect().height / 2
    panel.style.setProperty('--merge-opp-y', `${playerCenter - oppCenter}px`)
    panel.style.setProperty('--merge-deck-y', `${playerCenter - deckCenter}px`)
  }, [isGameOver])

  // ── Derived state (shared across idle + active) ──
  const {
    phase,
    round,
    totalRounds,
    playerHand,
    opponentHand,
    playerChoiceIndex,
    opponentChoiceIndex,
    results,
    playerDiscard,
  } = state

  const allPlayerCards = PLAYER_CARDS

  const isPeek = phase === 'PEEK'
  const isChoosing = phase === 'CHOOSING'
  const isRevealing = phase === 'REVEALING'
  const isResolved = phase === 'RESOLVED'
  const showOpponentCards = isPeek || isRevealing || isResolved || isGameOver
  const playerPicked = playerChoiceIndex !== null

  const lastOutcome = getLastOutcome(state)
  const wasAnomaly = wasAnomalyResolution(state)

  const { playerWins, opponentWins } = getScores(results)
  const playerWon = playerWins > opponentWins
  const revealFace: 'heart' | 'spade' = playerWon ? 'heart' : 'spade'
  const backFace: 'diamond' | 'heart' | 'spade' = endStep >= 6 ? revealFace : 'diamond'

  const roundLabel =
    (isResolved || isGameOver) && lastOutcome
      ? lastOutcome === 'P'
        ? wasAnomaly ? '5 traps! You win!' : 'You win the round!'
        : wasAnomaly ? '5 traps! Opponent wins!' : 'Opponent wins!'
      : null

  const topLineText = isGameOver
    ? 'Game Over'
    : isPeek
      ? 'Memorize!'
      : isRevealing
        ? 'Revealing...'
        : isIdle
          ? ''
          : `Round ${round} of ${totalRounds}`

  const panelClassName = [
    'rr-game-panel',
    isIdle         && 'rr-game-panel--idle',
    endStep >= 1   && 'rr-game-panel--ending',
    endStep >= 3   && 'rr-game-panel--collapsed',
    endStep >= 4   && 'rr-game-panel--merged',
    endStep >= 5   && 'rr-game-panel--revealed',
    endStep >= 6   && 'rr-game-panel--final',
  ].filter(Boolean).join(' ')

  // Tilt CSS variables — idle uses the stable idle pair; game-over uses
  // the choreography tilts. Both write to the same --tilt-pl-* vars.
  const tiltStyle: CSSProperties = isIdle
    ? ({
        '--tilt-pl-0': `${idleTilts[0]}deg`,
        '--tilt-pl-1': `${idleTilts[1]}deg`,
      } as CSSProperties)
    : endStep >= 3
      ? ({
          '--tilt-opp-0': `${tilts[0] ?? 0}deg`,
          '--tilt-opp-1': `${tilts[1] ?? 0}deg`,
          '--tilt-pl-0':  `${tilts[2] ?? 0}deg`,
          '--tilt-pl-1':  `${tilts[3] ?? 0}deg`,
          '--tilt-dk-0':  `${tilts[4] ?? 0}deg`,
          '--tilt-dk-1':  `${tilts[5] ?? 0}deg`,
          '--tilt-dk-2':  `${tilts[6] ?? 0}deg`,
          '--tilt-dk-3':  `${tilts[7] ?? 0}deg`,
          '--tilt-dk-4':  `${tilts[8] ?? 0}deg`,
          '--tilt-dk-5':  `${tilts[9] ?? 0}deg`,
        } as CSSProperties)
      : {}

  return (
    <div ref={panelRef} className={panelClassName} data-end-step={endStep} style={tiltStyle}>

      {/* ── Idle overlay elements ───────────────────────────────────────── */}

      {/* "NUMBER DUEL" — two stacked lines, same slot as VICTORY / DEFEAT */}
      {isIdle && (
        <div className="rr-game__verdict rr-game__verdict--idle">
          <span>Number</span>
          <span>Duel</span>
        </div>
      )}

      {/* Start game — same position + style as Play Again */}
      {isIdle && (
        <button
          type="button"
          className="rr-game-play-again t-btn1"
          onClick={() => { onGameStart?.(); start() }}
        >
          Start game
        </button>
      )}

      {/* ── Game-over overlay elements ──────────────────────────────────── */}

      {endStep >= 5 && (
        <div className="rr-game__verdict">
          <ScrambleText text={playerWon ? 'VICTORY' : 'DEFEAT'} duration={700} />
        </div>
      )}

      {endStep >= 6 && (
        <button
          type="button"
          className="rr-game-play-again t-btn1"
          onClick={restart}
        >
          Play again
        </button>
      )}

      {/* ── Persistent board elements ───────────────────────────────────── */}

      {/* Round label (hidden in idle) */}
      <div className="rr-game__round-label">
        <span className={`rr-game__round-text${isRevealing ? ' rr-game__round-text--pulse' : ''}`}>
          {topLineText}
        </span>
      </div>

      {/* Opponent Hand (hidden in idle) */}
      <div className="rr-game__opp-hand">
        {showOpponentCards ? (
          opponentHand.map((card, i) => {
            const decided = isRevealing || isResolved || isGameOver
            const isChosen = decided && i === opponentChoiceIndex
            const isUnused = decided && i !== opponentChoiceIndex
            return (
              <div
                key={`${round}-opp-${i}`}
                className={`rr-game__opp-card${isUnused ? ' rr-game__opp-card--unused' : ''}`}
              >
                <FlipCard
                  flipped={endStep >= 2}
                  front={
                    <NumberCard value={card} variant="opponent" size="sm" disabled selected={isChosen} />
                  }
                  back={<FaceDownCard size="md" face={backFace} />}
                />
              </div>
            )
          })
        ) : (
          <>
            <FaceDownCard size="md" />
            <FaceDownCard size="md" />
          </>
        )}
      </div>

      {/* Scorecard — expands edge-to-edge in idle, transitions back on start */}
      <div className="rr-game__scorecard">
        <Scorecard
          maxRounds={totalRounds}
          results={results}
          peekActive={isPeek}
          peekProgress={peekProgress}
          idle={isIdle}
        />
      </div>

      {/* Status Banner (hidden in idle) */}
      <div className="rr-game__status">
        {isChoosing && <span className="rr-game__status-text">Pick a card</span>}
        {roundLabel && !isGameOver && (
          <span className={`rr-game__outcome-text ${lastOutcome === 'P' ? 'rr-game__outcome-text--win' : 'rr-game__outcome-text--lose'}`}>
            {roundLabel}
          </span>
        )}
      </div>

      {/* Player Hand
          - idle: two face-down cards collapsed together with random tilts
          - active: normal spread positions, flip reveals numbers on start
          Stable key `player-${i}` lets CSS transitions fire across idle→active */}
      <div className={`rr-game__player-hand${isPeek ? ' rr-game__player-hand--upright' : ''}`}>
        {playerHand.map((card, i) => {
          const isChosen = playerPicked && playerChoiceIndex === i
          const isUnused = playerPicked && !isChosen
          const slot = i === 0 ? 'left' : 'right'
          const stateClass = isChosen
            ? 'rr-game__player-card--chosen'
            : isUnused
              ? 'rr-game__player-card--unused'
              : ''
          return (
            <div
              key={`player-${i}`}
              className={`rr-game__player-card rr-game__player-card--${slot} ${stateClass}`}
            >
              <FlipCard
                flipped={isIdle || endStep >= 2}
                front={
                  <NumberCard
                    value={card}
                    variant="player"
                    size="lg"
                    onClick={() => pickCard(i as 0 | 1)}
                    disabled={!isChoosing}
                    selected={isChosen}
                  />
                }
                back={<FaceDownCard size="lg" face={backFace} />}
              />
            </div>
          )
        })}
      </div>

      {/* Deck Strip (hidden in idle) */}
      <DeckStrip
        allCards={allPlayerCards}
        playedCards={playerDiscard}
        flipped={endStep >= 2}
        face={backFace}
      />
    </div>
  )
}
