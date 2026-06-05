'use client'

// CardstackFan — tile-size port of /rr's CardFan.
//
// Interaction is gated on the parent tile's `active` prop, matching the
// rest of the showcase tiles (poster stack, paymaster, etc.):
//   • inactive — cards are decorative; pointer-events disabled so the
//     first click bubbles up to the tile and activates it (opening the
//     spec note).
//   • active   — full /rr behaviour: rest fan with per-card stagger,
//     hover lifts the focused card and nudges its neighbours, click
//     selects → spread, click outside deselects, caption fades in under
//     the selected card. Losing focus resets the fan to rest.
//
// Positions are re-authored as % of the tile box (the original /rr layout
// uses px on a 1280-wide canvas) so the fan reads at any column width.

import { useEffect, useState, type CSSProperties, type MouseEvent } from 'react'
import { Img } from '../../../../../components/Img'

type CardMeta = { v: string; src: string; alt: string; caption: string }

const CARDS: CardMeta[] = [
  { v: 'v1', src: '/images/rr/rr-card-v1.webp', alt: 'Rug Rumble card — v1', caption: 'The very first hand-drawn concept' },
  { v: 'v2', src: '/images/rr/rr-card-v2.webp', alt: 'Rug Rumble card — v2', caption: 'Added energy and name' },
  { v: 'v3', src: '/images/rr/rr-card-v3.webp', alt: 'Rug Rumble card — v3', caption: 'Added conditional effects' },
  { v: 'v4', src: '/images/rr/rr-card-v4.webp', alt: 'Rug Rumble card — v4', caption: 'First printed version' },
  { v: 'v5', src: '/images/rr/rr-card-v5.webp', alt: 'Rug Rumble card — v5', caption: 'Final digital design' },
]

// Rest fan: stagger v2 highest, drop to v5 (matches /rr Figma reference).
// Values are % of the tile's height/width. Horizontal numbers are tuned
// so cards never extend past the tile edge during hover or selection —
// the tile's .sc-media is overflow:hidden, so anything that pokes out
// gets clipped.
const BASE_ROT = [-10, -5, 0, 4, 9]
const BASE_Y_PCT = [-1.0, -3.0, -3.5, -2.2, 0.6]
const HOVER_NUDGE_PCT = 2.5
const HOVER_LIFT_PCT = -6
// Click lift tamed (was -12) so the scale-1.18 selected card has room   */
// to lift without poking past the tile's overflow-hidden top edge.      */
const CLICK_SPREAD_PCT = 3.5
const CLICK_LIFT_PCT = -8

type CardTransform = { xPct: number; yPct: number; rotate: number; scale: number }

function restTransform(i: number): CardTransform {
  return { xPct: 0, yPct: BASE_Y_PCT[i], rotate: BASE_ROT[i], scale: 1 }
}

function hoverTransform(i: number, hIdx: number): CardTransform {
  if (i === hIdx) {
    return { xPct: 0, yPct: BASE_Y_PCT[i] + HOVER_LIFT_PCT, rotate: BASE_ROT[i] * 0.5, scale: 1.06 }
  }
  const dir = i < hIdx ? -1 : 1
  const dist = Math.abs(i - hIdx)
  const nudge = dir * HOVER_NUDGE_PCT * (dist === 1 ? 1 : 0.4)
  return { xPct: nudge, yPct: BASE_Y_PCT[i], rotate: BASE_ROT[i], scale: 1 }
}

function spreadTransform(i: number, sIdx: number): CardTransform {
  if (i === sIdx) {
    return { xPct: 0, yPct: CLICK_LIFT_PCT, rotate: 0, scale: 1.18 }
  }
  const dir = i < sIdx ? -1 : 1
  const dist = Math.abs(i - sIdx)
  const xPct = dir * CLICK_SPREAD_PCT * dist
  const extraRot = dir * dist * 3
  const totalRot = Math.max(-8, Math.min(8, BASE_ROT[i] + extraRot))
  return { xPct, yPct: BASE_Y_PCT[i] + 2.2, rotate: totalRot, scale: 0.92 }
}

// Per-card horizontal anchor as % of tile width. Five-card fan centered
// around 50%, tucked tighter than /rr's px layout because the tile is
// much narrower (~420 px in 1col) and the card width is 22%cqw — any
// wider spread clips against the tile edges on hover/spread.
const BASE_X_PCT = [34, 42, 50, 58, 66]

export default function CardstackFan({ active = false }: { active?: boolean }) {
  const [hoveredIdx, setHoveredIdx] = useState(-1)
  const [selectedIdx, setSelectedIdx] = useState(-1)

  // Reset internal interaction state when the tile loses focus, so the
  // next activation always starts from the rest fan.
  useEffect(() => {
    if (!active) {
      setHoveredIdx(-1)
      setSelectedIdx(-1)
    }
  }, [active])

  // Click outside the fan to deselect — same as /rr.
  useEffect(() => {
    if (selectedIdx < 0) return
    const onDocClick = (e: globalThis.MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target?.closest('.sc-cardfan__card')) setSelectedIdx(-1)
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [selectedIdx])

  const transformFor = (i: number): CardTransform => {
    if (selectedIdx >= 0) return spreadTransform(i, selectedIdx)
    if (hoveredIdx >= 0) return hoverTransform(i, hoveredIdx)
    return restTransform(i)
  }

  const zIndexFor = (i: number) => {
    if (selectedIdx === i) return 10
    if (selectedIdx < 0 && hoveredIdx === i) return 10
    return i + 1
  }

  const handleCardClick = (e: MouseEvent, i: number) => {
    if (!active) return // inactive: bubble up to the tile so it activates
    // Stop the tile's own click handler from firing (otherwise it would
    // open the spec note on top of the selection). The caption-dot in the
    // tile cap still works for opening the spec note.
    e.stopPropagation()
    setSelectedIdx(selectedIdx === i ? -1 : i)
  }

  const selected = selectedIdx >= 0 ? CARDS[selectedIdx] : null

  return (
    <div
      className={`sc-cardfan${selectedIdx >= 0 ? ' sc-cardfan--has-selection' : ''}`}
      aria-label="Five iterations of the Rug Rumble card"
    >
      {CARDS.map((card, i) => {
        const isSelected = selectedIdx === i
        const isHoveredInSelection = selectedIdx >= 0 && hoveredIdx === i && !isSelected
        const cls = [
          'sc-cardfan__card',
          `sc-cardfan__card--${card.v}`,
          isSelected && 'is-selected',
          isHoveredInSelection && 'is-hovered',
        ]
          .filter(Boolean)
          .join(' ')

        const t = transformFor(i)
        const style: CSSProperties = {
          left: `${BASE_X_PCT[i]}%`,
          transform: `translate(calc(-50% + ${t.xPct}cqw), ${t.yPct}cqh) rotate(${t.rotate}deg) scale(${t.scale})`,
          zIndex: zIndexFor(i),
        }

        return (
          <button
            key={card.v}
            type="button"
            className={cls}
            style={!active ? { ...style, pointerEvents: 'none' } : style}
            onMouseEnter={() => active && setHoveredIdx(i)}
            onMouseLeave={() => active && setHoveredIdx(-1)}
            onClick={(e) => handleCardClick(e, i)}
            aria-label={`Card ${card.v} — ${card.caption}`}
            aria-pressed={isSelected}
            tabIndex={active ? 0 : -1}
          >
            <span className="sc-cardfan__label">{card.v}</span>
            <Img
              src={card.src}
              alt={card.alt}
              fill
              sizes="(max-width: 767px) 28vw, 12vw"
            />
          </button>
        )
      })}

      {selected && (
        <span className="sc-cardfan__caption">{selected.caption}</span>
      )}
    </div>
  )
}
