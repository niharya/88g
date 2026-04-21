'use client'

// CardFan — interactive 5-card fan for the Cards tab of Section 3.
//
// React port of vanilla rr-interactions.js initCardFanInspect. Transforms are
// authored as CSS custom properties on each card; CSS handles the transition
// (springy cubic-bezier overshoot) so animation cost stays off the React tree.
//
// State:
//   hoveredIdx — -1 or index of currently hovered card
//   selectedIdx — -1 or index of currently selected (clicked) card
//
// Modes:
//   rest        : each card sits at BASE_ROT[i]
//   hover       : hovered card lifts + neighbours nudge sideways (only when no selection)
//   spread      : selected card lifts to centre, others fan out (selection mode)
//   click out   : clicking outside the fan deselects

import { useEffect, useState, type CSSProperties } from 'react'
import { Img } from '../../../../components/Img'

const BASE_ROT = [-12, -6, 0, 4, 10]
const BASE_Y   = [-4, -12, -14, -9, 2]   // stagger from Figma: v2 highest, v3/v4 near, v5 drops
const HOVER_NUDGE = 18
const HOVER_LIFT = -28
const CLICK_SPREAD = 22
const CLICK_LIFT = -36

const CARDS = [
  { v: 'v1', src: '/images/rr/rr-card-v1.png', caption: 'The very first hand-drawn concept' },
  { v: 'v2', src: '/images/rr/rr-card-v2.png', caption: 'Added energy and name' },
  { v: 'v3', src: '/images/rr/rr-card-v3.png', caption: 'Added conditional effects' },
  { v: 'v4', src: '/images/rr/rr-card-v4.png', caption: 'First printed version' },
  { v: 'v5', src: '/images/rr/rr-card-v5.png', caption: 'Final digital design' },
] as const

type CardTransform = { x: number; y: number; rotate: number; scale: number }

function restTransform(i: number): CardTransform {
  return { x: 0, y: BASE_Y[i], rotate: BASE_ROT[i], scale: 1 }
}

function hoverTransform(i: number, hIdx: number): CardTransform {
  if (i === hIdx) return { x: 0, y: BASE_Y[i] + HOVER_LIFT, rotate: BASE_ROT[i] * 0.5, scale: 1.06 }
  const dir = i < hIdx ? -1 : 1
  const dist = Math.abs(i - hIdx)
  const nudge = dir * HOVER_NUDGE * (dist === 1 ? 1 : 0.4)
  return { x: nudge, y: BASE_Y[i], rotate: BASE_ROT[i], scale: 1 }
}

function spreadTransform(i: number, sIdx: number): CardTransform {
  if (i === sIdx) return { x: 0, y: CLICK_LIFT, rotate: 0, scale: 1.04 }
  const dir = i < sIdx ? -1 : 1
  const dist = Math.abs(i - sIdx)
  const x = dir * CLICK_SPREAD * dist
  const extraRot = dir * dist * 3
  const totalRot = Math.max(-8, Math.min(8, BASE_ROT[i] + extraRot))
  return { x, y: BASE_Y[i] + 8, rotate: totalRot, scale: 0.94 }
}

export default function CardFan() {
  const [hoveredIdx, setHoveredIdx] = useState(-1)
  const [selectedIdx, setSelectedIdx] = useState(-1)

  // Click outside the fan to deselect.
  useEffect(() => {
    if (selectedIdx < 0) return
    const onDocClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null
      if (!target?.closest('.rr-card-item')) setSelectedIdx(-1)
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

  return (
    <div className={`rr-card-fan${selectedIdx >= 0 ? ' rr-card-fan--has-selection' : ''}`}>
      {CARDS.map((card, i) => {
        const isSelected = selectedIdx === i
        const isHoveredInSelection = selectedIdx >= 0 && hoveredIdx === i && !isSelected
        const cls = [
          'rr-card-item',
          `rr-card-item--${card.v}`,
          isSelected && 'rr-card-item--selected',
          isHoveredInSelection && 'rr-card-item--hovered',
        ].filter(Boolean).join(' ')

        const t = transformFor(i)
        const style: CSSProperties = {
          transform: `translate(${t.x}px, ${t.y}px) rotate(${t.rotate}deg) scale(${t.scale})`,
          zIndex: zIndexFor(i),
        }

        return (
          <div
            key={card.v}
            className={cls}
            style={style}
            onMouseEnter={() => setHoveredIdx(i)}
            onMouseLeave={() => setHoveredIdx(-1)}
            onClick={() => setSelectedIdx(selectedIdx === i ? -1 : i)}
          >
            <span className="rr-card-item__label">{card.v}</span>
            <Img src={card.src} alt={`Card ${card.v}`} className="rr-card-item__img" sizes="300px" />
            <p className="rr-card-item__caption">{card.caption}</p>
          </div>
        )
      })}
    </div>
  )
}
