'use client'

import { useEffect, useRef, useState } from 'react'
import type { RoundOutcome } from './game-logic'

// ── Geometry constants ──
const EGG_W = 8
const EGG_H = 9
const EGG_BORDER = 1.5
const CRACK_SIZE = 5
const CRACK_STROKE = 2.5
const SKEWER_THIN = 1
const SKEWER_THICK = 2
const SLOT_GAP = 14
// Eggs sit slightly further apart in idle, then "fall in line" on start.
const SLOT_GAP_IDLE = 20
const CRACK_OFFSET = 15
// Idle tilt range — random ±deg per egg, regenerated each idle entry
const EGG_TILT_RANGE = 14

const TOTAL_SLOTS = 5
// SVG width spans the opponent hand: 2 cards × 80px + 8px gap (matches --card-w * 2 + gap at u=1).
// The eggs render inside this fixed-width SVG at their natural size in BOTH idle and active
// states. In idle, the skewer line is drawn as a separate full-width DOM element behind the
// SVG (see `.rr-scorecard__idle-skewer`) so it can reach the real panel edges regardless of
// any drift between --panel-w and the actual container width.
const SVG_W = 2 * 80 + 8
const SVG_H = EGG_H + CRACK_OFFSET * 2 + CRACK_SIZE + 8

const MID_Y = SVG_H / 2

// ── Theme tokens (read from CSS custom properties — defined in game.css) ──
const COLOR_DARK = 'var(--orange-720)'
const COLOR_CREAM = 'var(--rr-game-paper)'
const COLOR_SKEWER = 'var(--rr-game-accent)'
const COLOR_SKEWER_FILL = 'var(--rr-game-ink)'

type SlotState = 'filled' | 'cracked_up' | 'cracked_down'

interface ScorecardProps {
  maxRounds: number
  results: RoundOutcome[]
  peekActive?: boolean
  peekProgress?: number
  /** In idle state: a full-width DOM skewer line is rendered behind the SVG
      so the line reaches the real panel edges. Eggs stay at their natural
      size, centered inside the same fixed-width SVG used during gameplay. */
  idle?: boolean
  /** When 'left', eggs are left-anchored at the SVG edge instead of centered.
      Game board does not pass this — default centering is unaffected. */
  align?: 'left'
}

function slotX(i: number, gap: number, align?: 'left'): number {
  const startX = align === 'left'
    ? EGG_W / 2
    : (SVG_W - (TOTAL_SLOTS - 1) * gap) / 2
  return startX + i * gap
}

function Egg({ x, y, tilt, state, animating }: {
  /** Slot center X (where the egg sits inside the SVG) */
  x: number
  /** Slot center Y */
  y: number
  /** Idle random tilt in degrees (0 in active state) */
  tilt: number
  state: SlotState
  animating: boolean
}) {
  const isCracked = state === 'cracked_up' || state === 'cracked_down'
  const fillColor = isCracked ? COLOR_CREAM : COLOR_DARK
  const rx = EGG_W / 2
  const ry = EGG_H / 2

  // Position via group transform so we can compose translate + rotate and let
  // CSS transition both at once when idle→active fires. Ellipses sit at (0,0).
  return (
    <g
      style={{
        transform: `translate(${x}px, ${y}px) rotate(${tilt}deg)`,
        transition: 'transform 0.55s cubic-bezier(0.5, 0, 0.2, 1)',
      }}
    >
      <ellipse
        cx={0}
        cy={0}
        rx={rx}
        ry={ry}
        fill={fillColor}
        className={animating ? 'rr-egg-anim' : ''}
      />
      <ellipse
        cx={0}
        cy={0}
        rx={rx}
        ry={ry}
        fill="none"
        stroke={isCracked ? COLOR_SKEWER : fillColor}
        strokeWidth={EGG_BORDER}
        className={animating ? 'rr-egg-anim' : ''}
      />
    </g>
  )
}

function Crack({ cx, cy, direction, animating }: {
  cx: number
  cy: number
  direction: 'up' | 'down'
  animating: boolean
}) {
  const targetY = direction === 'up' ? cy - CRACK_OFFSET : cy + CRACK_OFFSET
  const arm = CRACK_SIZE / 2

  return (
    <g
      style={{
        transformOrigin: `${cx}px ${targetY}px`,
        animation: animating ? 'crackIn 0.5s ease-out forwards' : 'none',
        opacity: animating ? 0 : 1,
      }}
    >
      <line
        x1={cx - arm} y1={targetY - arm}
        x2={cx + arm} y2={targetY + arm}
        stroke={COLOR_DARK}
        strokeWidth={CRACK_STROKE}
        strokeLinecap="round"
      />
      <line
        x1={cx + arm} y1={targetY - arm}
        x2={cx - arm} y2={targetY + arm}
        stroke={COLOR_DARK}
        strokeWidth={CRACK_STROKE}
        strokeLinecap="round"
      />
    </g>
  )
}

export function Scorecard({ maxRounds, results, peekActive = false, peekProgress = 0, idle = false, align }: ScorecardProps) {
  const prevLen = useRef(results.length)
  const [animatingIdx, setAnimatingIdx] = useState<number | null>(null)

  // Egg idle tilts — [0, 0, 0, 0, 0] on SSR + active state for hydration
  // safety; randomised client-side after mount and on each re-entry into idle.
  // When idle clears, tilts return to 0 and CSS transitions handle the settle.
  const [eggTilts, setEggTilts] = useState<number[]>(() => Array(TOTAL_SLOTS).fill(0))

  useEffect(() => {
    if (idle) {
      setEggTilts(
        Array.from(
          { length: TOTAL_SLOTS },
          () => (Math.random() * 2 - 1) * EGG_TILT_RANGE,
        ),
      )
    } else {
      setEggTilts(Array(TOTAL_SLOTS).fill(0))
    }
  }, [idle])

  useEffect(() => {
    if (results.length > prevLen.current) {
      const newIdx = results.length - 1
      setAnimatingIdx(newIdx)
      const t = setTimeout(() => setAnimatingIdx(null), 600)
      prevLen.current = results.length
      return () => clearTimeout(t)
    }
  }, [results.length])

  const slots: SlotState[] = Array.from({ length: TOTAL_SLOTS }, (_, i) => {
    if (i < results.length) {
      return results[i] === 'P' ? 'cracked_up' : 'cracked_down'
    }
    return 'filled'
  })

  const slotGap = idle ? SLOT_GAP_IDLE : SLOT_GAP
  const skewerThickness = peekActive ? SKEWER_THICK : SKEWER_THIN
  const skewerStartX = 4
  const skewerEndX = SVG_W - 4

  return (
    <div className="rr-scorecard" role="img" aria-label={`Scorecard, ${maxRounds} rounds`}>
      {/* Full-width DOM skewer for idle state — bound to the real container
          width, so it always reaches the panel edges regardless of any drift
          between --panel-w and the actual rendered panel width. */}
      {idle && <div className="rr-scorecard__idle-skewer" aria-hidden="true" />}
      <svg
        width={SVG_W}
        height={SVG_H}
        viewBox={`0 0 ${SVG_W} ${SVG_H}`}
        className="rr-scorecard__svg"
      >
        {/* Active-state skewer (hidden in idle — the DOM line above takes over) */}
        {!idle && (
          <line
            x1={skewerStartX} y1={MID_Y}
            x2={skewerEndX} y2={MID_Y}
            stroke={COLOR_SKEWER}
            strokeWidth={skewerThickness}
            strokeLinecap="round"
            className="rr-scorecard__skewer"
          />
        )}

        {peekActive && peekProgress > 0 && (
          <line
            x1={skewerStartX} y1={MID_Y}
            x2={skewerStartX + (skewerEndX - skewerStartX) * peekProgress} y2={MID_Y}
            stroke={COLOR_SKEWER_FILL}
            strokeWidth={skewerThickness}
            strokeLinecap="round"
          />
        )}

        {slots.map((slotState, i) => (
          <Egg
            key={i}
            x={slotX(i, slotGap, align)}
            y={MID_Y}
            tilt={eggTilts[i] ?? 0}
            state={slotState}
            animating={animatingIdx === i}
          />
        ))}

        {results.map((outcome, i) => {
          const direction = outcome === 'P' ? 'up' : 'down'
          return (
            <Crack
              key={`crack-${i}`}
              cx={slotX(i, slotGap, align)}
              cy={MID_Y}
              direction={direction}
              animating={animatingIdx === i}
            />
          )
        })}
      </svg>
    </div>
  )
}
