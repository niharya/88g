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
//   │   └── 6 sketch images fan out on expand
//   └── rr-lightbox (overlay — horizontal drag-scroll gallery)
//
// Interactions:
//   isExpanded: story card slides left, card stack fans out (CSS class toggle)
//   constraintsOpen: hidden constraint rows reveal (Framer Motion height + AnimatePresence)
//   lightboxIndex: click image → full lightbox with drag-scroll strip

import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

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

// ── Lightbox image dimensions (large preview) ────────────────────────────
// Each sketch gets a fixed large height; width follows its natural aspect ratio.
const SKETCH_ASPECTS: Record<number, number> = {
  1: 172 / 350,   // tall portrait
  2: 210 / 301,
  3: 211 / 301,
  4: 249 / 364,   // tall portrait
  5: 240 / 184,   // landscape
  6: 177 / 150,   // landscape
}
const LB_HEIGHT = 480
const LB_GAP = 36

export default function Intro() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [constraintsOpen, setConstraintsOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  const constraintRef = useRef<HTMLDivElement>(null)

  // Per-card transition delay — matches vanilla rr-interactions.js initCardStackFan()
  // Expand: reverse order (top card fans first). Collapse: forward order.
  const cardDelay = (i: number) =>
    isExpanded
      ? `${((5 - i) * 0.045).toFixed(3)}s`
      : `${(i * 0.035).toFixed(3)}s`

  // Compute initial drag offset to center the clicked image
  const computeInitialX = (idx: number) => {
    let offset = 0
    for (let i = 0; i < idx; i++) {
      offset += LB_HEIGHT * (SKETCH_ASPECTS[i + 1] ?? 1) + LB_GAP
    }
    const currentWidth = LB_HEIGHT * (SKETCH_ASPECTS[idx + 1] ?? 1)
    // Canvas is 1440px wide; center the clicked image
    const center = (1440 - currentWidth) / 2
    return -(offset - center + 64) // 64 is left padding
  }

  return (
    <div className="rr-canvas">

      {/* ── Story Card ──────────────────────────────────────────────────── */}
      {/* Spring physics matching Biconomy intro__surface: x, rotate, scale  */}
      <motion.div
        className={`rr-story-card${isExpanded ? ' rr-story-card--expanded' : ''}`}
        animate={{ x: isExpanded ? -400 : 0, rotate: isExpanded ? -1 : 0, scale: isExpanded ? 0.95 : 1 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }}
      >

        {/* Expand / collapse pill */}
        <button
          className="rr-story-card__expand"
          type="button"
          aria-label={isExpanded ? 'Collapse sketches' : 'Expand sketches'}
          onClick={() => setIsExpanded(s => !s)}
        >
          {isExpanded ? (
            // Compress icon — two arrows pointing inward
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M6.5 9.5H3.5M6.5 9.5V12.5M6.5 9.5L2.5 13.5M9.5 6.5H12.5M9.5 6.5V3.5M9.5 6.5L13.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          ) : (
            // Expand icon — two arrows pointing outward
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M2.5 6.5V2.5H6.5M2.5 2.5L6.5 6.5M13.5 9.5V13.5H9.5M13.5 13.5L9.5 9.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
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
        <div className={`rr-constraints-card${constraintsOpen ? ' rr-constraints-card--expanded' : ''}`}>
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

            <button
              className="rr-constraints-card__toggle"
              type="button"
              aria-expanded={constraintsOpen}
              onMouseDown={e => e.preventDefault()}
              onClick={() => setConstraintsOpen(s => !s)}
            >
              <span className="rr-constraints-card__toggle-label">+3</span>
              <span className="rr-constraints-card__toggle-icon material-symbols-rounded" aria-hidden="true">
                arrow_drop_down
              </span>
            </button>

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
      {/* Zero-size pivot at story card bottom-left (536px, 776px).         */}
      {/* All pages are absolutely positioned relative to this point.       */}
      <div
        className={`rr-card-stack${isExpanded ? ' rr-card-stack--expanded' : ''}${lightboxIndex !== null ? ' rr-card-stack--dimmed' : ''}`}
        aria-hidden={lightboxIndex !== null ? 'true' : undefined}
      >
        {([1, 2, 3, 4, 5, 6] as const).map((n, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={n}
            src={`/images/rr/rr-sketch-${n}.jpg`}
            alt=""
            className={`rr-card-stack__page rr-card-stack__page--${n}`}
            style={{
              transitionDelay: cardDelay(i),
              cursor: isExpanded ? 'pointer' : undefined,
            }}
            onClick={() => { if (isExpanded) setLightboxIndex(i) }}
          />
        ))}
      </div>

      {/* ── Lightbox ──────────────────────────────────────────────────────── */}
      {/* Full-canvas overlay with horizontal drag-scroll strip of sketches   */}
      <AnimatePresence>
        {lightboxIndex !== null && (
          <motion.div
            className="rr-lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={(e) => {
              // Dismiss if clicking backdrop area (not images or close button)
              const target = e.target as HTMLElement
              if (target.closest('.rr-lightbox__strip') || target.closest('.rr-lightbox__close')) return
              setLightboxIndex(null)
            }}
          >
            {/* Backdrop — visual dimming layer */}
            <div className="rr-lightbox__backdrop" />

            {/* Close button — centered above the strip */}
            <button
              className="rr-lightbox__close"
              type="button"
              aria-label="Close lightbox"
              onClick={() => setLightboxIndex(null)}
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </button>

            {/* Drag strip — horizontal drag-scroll with momentum */}
            <div className="rr-lightbox__constraint" ref={constraintRef}>
              <motion.div
                className="rr-lightbox__strip"
                drag="x"
                dragConstraints={constraintRef}
                dragElastic={0.08}
                initial={{ x: computeInitialX(lightboxIndex) }}
                style={{ cursor: 'grab' }}
                whileDrag={{ cursor: 'grabbing' }}
              >
                {([1, 2, 3, 4, 5, 6] as const).map((n) => (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    key={n}
                    src={`/images/rr/rr-sketch-${n}.jpg`}
                    alt={`Sketch ${n}`}
                    className="rr-lightbox__image"
                    draggable={false}
                    style={{
                      height: LB_HEIGHT,
                      width: LB_HEIGHT * (SKETCH_ASPECTS[n] ?? 1),
                    }}
                  />
                ))}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  )
}
