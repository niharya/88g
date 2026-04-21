'use client'

// Intro — Introduction section for /rr
//
// Architecture:
//   rr-canvas (1440×900 fixed composition, overflow: hidden)
//   ├── rr-story-card (absolute, yellow card — expands left)
//   │   ├── rr-story-card__expand (pill button, top-right)
//   │   ├── rr-story-card__body (text + callout)
//   │   ├── rr-north-star-card (absolute, nested — moves with card)
//   │   └── rr-constraints-card (absolute, nested — moves with card)
//   ├── rr-card-stack (absolute, pivot at story card bottom-left)
//   │   └── 6 img: stacked fan → expanded grid (CSS hide when enlarged)
//   └── rr-enlarged (absolute, inset: 0 — renders when isEnlarged)
//       ├── close button
//       └── rr-enlarged__scroll (native horizontal scroll, wheel → scrollLeft)
//           └── 6 img (760px tall, proportional width)
//
// Interactions:
//   isExpanded: story card slides left, card stack fans out (CSS class toggle)
//   constraintsOpen: hidden constraint rows reveal (Framer Motion height + AnimatePresence)
//   isEnlarged: card stack hides (CSS), enlarged strip mounts; mat dims via :has()

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useMatSettle from './useMatSettle'
import { Img } from '../../../components/Img'

// ── Shared motion constants ────────────────────────────────────────────────
// Single easing curve + base duration — all timings are multiples of DUR

const EASE: [number, number, number, number] = [0.45, 0, 0.15, 1]
const DUR = 0.30

// ── Hidden section dimensions ──────────────────────────────────────────────
// Derived from CSS: item (12px × 1.3 line-height + 2×6 padding = 28px)
//                   border-mid (1px border + 2×6 margin = 13px)
// No magic max-height — the motion.div height matches actual content exactly.

const ROW_H = 28
const DIV_H = 13
const HIDDEN_OPEN_H = 3 * ROW_H + 3 * DIV_H  // 123px

const HIDDEN_ROWS = [
  'A memetic visual language',
  'No possibility of a tie',
  'Visual restraint',
]

// ── Enlarged strip dimensions ──────────────────────────────────────────────
// 760px uniform height. Width follows each sketch's natural aspect ratio.
const ENLARGED_H = 760
const SKETCH_ASPECTS: Record<number, number> = {
  1: 172 / 350,
  2: 210 / 301,
  3: 211 / 301,
  4: 249 / 364,
  5: 240 / 184,
  6: 177 / 150,
}

export default function Intro() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [constraintsOpen, setConstraintsOpen] = useState(false)
  const [isEnlarged, setIsEnlarged] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLDivElement>(null)
  useMatSettle(canvasRef)

  // Per-card transition delay — matches vanilla rr-interactions.js initCardStackFan()
  // Expand: reverse order (top card fans first). Collapse: forward order.
  const cardDelay = (i: number) =>
    isExpanded
      ? `${((5 - i) * 0.045).toFixed(3)}s`
      : `${(i * 0.035).toFixed(3)}s`

  return (
    <div
      ref={canvasRef}
      className="rr-canvas"
      onClick={(e) => {
        if (!isEnlarged) return
        const target = e.target as HTMLElement
        if (target.closest('.rr-enlarged__strip') || target.closest('.rr-enlarged__close')) return
        setIsEnlarged(false)
      }}
    >

      {/* ── Story Card ──────────────────────────────────────────────────── */}
      {/* Tween on the paper curve — matches card-stack CSS, no spring overshoot */}
      <motion.div
        className={`rr-story-card${isExpanded ? ' rr-story-card--expanded' : ''}`}
        animate={{ x: isExpanded ? -400 : 0, rotate: isExpanded ? -1 : 0, scale: isExpanded ? 0.95 : 1 }}
        transition={{ duration: 0.55, ease: EASE }}
      >

        {/* Expand / collapse pill */}
        <button
          className="rr-story-card__expand"
          type="button"
          aria-label={isExpanded ? 'Collapse sketches' : 'Expand sketches'}
          onClick={() => setIsExpanded(s => !s)}
        >
          <span className="material-symbols-rounded" aria-hidden="true" style={{ fontSize: 18, fontVariationSettings: "'wght' 500" }}>
            {isExpanded ? 'collapse_content' : 'expand_content'}
          </span>
        </button>

        {/* Body text */}
        <div className="rr-story-card__body">
          <p className="rr-story-card__text">
            In 2024, at Biconomy's annual offsite in Baku the Growth team proposed building a small
            B2C product that could demonstrate our full tech stack. The idea was approved the same
            day, and I joined in to shape the product. It was a game.
          </p>
          <div className="rr-story-card__callout">
            <p className="rr-story-card__text">I gathered the constraints and</p>
            <p className="rr-story-card__text rr-story-card__text--bold">Sketched An Initial Game Mechanic.</p>
          </div>
        </div>

        {/* ── North Star Card ──────────────────────────────────────────── */}
        <div className="rr-north-star-card" aria-label="North Star">
          <p className="rr-north-star-card__label">North Star</p>
          <p className="rr-north-star-card__text">A game that people can enjoy and want to come back to</p>
        </div>

        {/* ── Constraints Card ─────────────────────────────────────────── */}
        <div
          className={`rr-constraints-card${constraintsOpen ? ' rr-constraints-card--expanded' : ''}`}
          onClick={() => setConstraintsOpen(s => !s)}
          role="button"
          tabIndex={0}
          aria-expanded={constraintsOpen}
          aria-label={constraintsOpen ? 'Collapse constraints' : 'Expand constraints'}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setConstraintsOpen(s => !s) } }}
          style={{ cursor: 'pointer' }}
        >
          <div className="rr-constraints-card__dot" aria-hidden="true" />
          <div className="rr-constraints-card__inner">
            <div className="rr-constraints-card__border rr-constraints-card__border--top" />
            <h4 className="rr-constraints-card__title">Constraints</h4>
            <div className="rr-constraints-card__border rr-constraints-card__border--mid" />
            <p className="rr-constraints-card__item">A strategy or puzzle-based PvP game</p>
            <div className="rr-constraints-card__border rr-constraints-card__border--mid" />
            <p className="rr-constraints-card__item">A complete match in &lt; two minutes</p>
            <div className="rr-constraints-card__border rr-constraints-card__border--mid" />

            {/* ── Hidden rows — Framer Motion height + AnimatePresence ── */}
            {/* Height animates precisely (no magic max-height).           */}
            {/* AnimatePresence gives rows a proper exit on collapse.      */}
            <motion.div
              className="rr-constraints-card__hidden"
              animate={{ height: constraintsOpen ? HIDDEN_OPEN_H : 0 }}
              initial={false}
              transition={{ duration: DUR, ease: EASE }}
            >
              <AnimatePresence>
                {constraintsOpen && HIDDEN_ROWS.map((text, i) => (
                  <motion.div
                    key={text}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: DUR * 0.8, ease: EASE, delay: i * 0.048 }}
                  >
                    <p className="rr-constraints-card__item">{text}</p>
                    <div className="rr-constraints-card__border rr-constraints-card__border--mid" />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>

            <div
              className="rr-constraints-card__toggle"
              aria-hidden="true"
            >
              <span className="rr-constraints-card__toggle-label">+3</span>
              <span className="rr-constraints-card__toggle-icon material-symbols-rounded" aria-hidden="true">
                arrow_drop_down
              </span>
            </div>

            <div className="rr-constraints-card__border rr-constraints-card__border--bottom" />

            {/* Vertical margin lines (decorative) — l4/r4/l5/r5 grow with inner div height */}
            <div className="rr-constraints-card__vline rr-constraints-card__vline--l1" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--r1" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--l2" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--r2" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--l3" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--r3" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--l4" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--r4" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--l5" aria-hidden="true" />
            <div className="rr-constraints-card__vline rr-constraints-card__vline--r5" aria-hidden="true" />
          </div>
        </div>

      </motion.div>{/* end rr-story-card */}

      {/* ── Card Stack ──────────────────────────────────────────────────── */}
      {/* Two CSS states: stacked fan → expanded grid. Hidden when enlarged. */}
      <div
        className={`rr-card-stack${isExpanded ? ' rr-card-stack--expanded' : ''}${isEnlarged ? ' rr-card-stack--hidden' : ''}`}
        onClick={() => { if (!isExpanded) setIsExpanded(true) }}
        style={{ cursor: isExpanded ? undefined : 'pointer' }}
      >
        {([1, 2, 3, 4, 5, 6] as const).map((n, i) => (
          <Img
            key={n}
            src={`/images/rr/rr-sketch-${n}.jpg`}
            alt=""
            className={`rr-card-stack__page rr-card-stack__page--${n}`}
            style={{
              transitionDelay: cardDelay(i),
              cursor: isExpanded ? 'pointer' : undefined,
            }}
            sizes="400px"
            onClick={() => { if (isExpanded && !isEnlarged) setIsEnlarged(true) }}
          />
        ))}
      </div>

      {/* ── Enlarged strip ────────────────────────────────────────────────── */}
      {/* Snappy swap — no layout morph. Wheel scrolls horizontally.          */}
      {/* Mat dims via :has([data-enlarged]) — no overlay element.             */}
      {isEnlarged && (
        <div
          className="rr-enlarged"
          data-enlarged
          onClick={(e) => {
            const target = e.target as HTMLElement
            if (target.closest('.rr-enlarged__scroll') || target.closest('.rr-enlarged__close')) return
            setIsEnlarged(false)
          }}
        >
          <button
            className="rr-enlarged__close"
            type="button"
            aria-label="Close enlarged view"
            onClick={() => setIsEnlarged(false)}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>

          {/* Native horizontal scroll — wheel event converts deltaY → scrollLeft */}
          <div
            className="rr-enlarged__scroll"
            ref={scrollRef}
          >
            {([1, 2, 3, 4, 5, 6] as const).map((n) => (
              <Img
                key={n}
                src={`/images/rr/rr-sketch-${n}.jpg`}
                alt={`Sketch ${n}`}
                className="rr-enlarged__image"
                draggable={false}
                sizes="800px"
                style={{
                  height: ENLARGED_H,
                  width: Math.round(ENLARGED_H * (SKETCH_ASPECTS[n] ?? 1)),
                }}
              />
            ))}
          </div>
        </div>
      )}

    </div>
  )
}
