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
//   └── rr-card-stack (absolute, pivot at story card bottom-left)
//       └── 6 sketch images fan out on expand
//
// Interactions:
//   isExpanded: story card slides left, card stack fans out (CSS class toggle)
//   constraintsOpen: hidden constraint rows reveal (CSS class toggle + max-height)

import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Intro() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [constraintsOpen, setConstraintsOpen] = useState(false)

  // Per-card transition delay — matches vanilla rr-interactions.js initCardStackFan()
  // Expand: reverse order (top card fans first). Collapse: forward order.
  const cardDelay = (i: number) =>
    isExpanded
      ? `${((5 - i) * 0.045).toFixed(3)}s`
      : `${(i * 0.035).toFixed(3)}s`

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
            // Compress icon — arrows pointing inward
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M8.25 11.77H5.75c-.28 0-.52.1-.72.3-.2.2-.3.44-.3.72 0 .28.1.52.3.72.2.2.44.3.72.3H9.25c.28 0 .52-.1.72-.3.2-.2.3-.44.3-.72V9.25c0-.28-.1-.52-.3-.72-.2-.2-.44-.3-.72-.3-.28 0-.52.1-.72.3-.2.2-.3.44-.3.72v2.52zm3.5-3.54H14.25c.28 0 .52-.1.72-.3.2-.2.3-.44.3-.72 0-.28-.1-.52-.3-.72-.2-.2-.44-.3-.72-.3H10.75c-.28 0-.52.1-.72.3-.2.2-.3.44-.3.72v3.5c0 .28.1.52.3.72.2.2.44.3.72.3.28 0 .52-.1.72-.3.2-.2.3-.44.3-.72V8.23z" fill="currentColor"/>
            </svg>
          ) : (
            // Expand icon — arrows pointing outward
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M6.77 13.23H9.25c.28 0 .52.1.72.3.2.2.3.44.3.72 0 .28-.1.52-.3.72-.2.2-.44.3-.72.3H5.75c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72V10.75c0-.28.1-.52.3-.72.2-.2.44-.3.72-.3.28 0 .52.1.72.3.2.2.3.44.3.72v2.48zM13.23 6.77H10.75c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72 0-.28.1-.52.3-.72.2-.2.44-.3.72-.3h3.5c.28 0 .52.1.72.3.2.2.3.44.3.72v3.5c0 .28-.1.52-.3.72-.2.2-.44.3-.72.3-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72V6.77z" fill="currentColor"/>
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

            {/* Hidden rows — CSS only. Class toggle drives line-drawing sequence. */}
            <div className="rr-constraints-card__hidden">
              <p className="rr-constraints-card__item">A memetic visual language</p>
              <div className="rr-constraints-card__border rr-constraints-card__border--mid" />
              <p className="rr-constraints-card__item">No possibility of a tie</p>
              <div className="rr-constraints-card__border rr-constraints-card__border--mid" />
              <p className="rr-constraints-card__item">Visual restraint</p>
              <div className="rr-constraints-card__border rr-constraints-card__border--mid" />
            </div>

            {/* Frame bottom — draws left→right after box opens (outside overflow clip) */}
            <div className="rr-constraints-card__frame-bottom" aria-hidden="true" />

            <button
              className="rr-constraints-card__toggle"
              type="button"
              aria-expanded={constraintsOpen}
              onClick={() => setConstraintsOpen(s => !s)}
            >
              <span className="rr-constraints-card__toggle-label">+3</span>
              <span className="rr-constraints-card__toggle-icon material-symbols-rounded" aria-hidden="true">
                arrow_drop_down
              </span>
            </button>

            <div className="rr-constraints-card__border rr-constraints-card__border--bottom" />

            {/* Vertical margin lines (decorative) */}
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
        className={`rr-card-stack${isExpanded ? ' rr-card-stack--expanded' : ''}`}
        aria-hidden="true"
      >
        {([1, 2, 3, 4, 5, 6] as const).map((n, i) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={n}
            src={`/images/rr/rr-sketch-${n}.jpg`}
            alt=""
            className={`rr-card-stack__page rr-card-stack__page--${n}`}
            style={{ transitionDelay: cardDelay(i) }}
          />
        ))}
      </div>

    </div>
  )
}
