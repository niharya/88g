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
import { motion, Variants, AnimatePresence } from 'framer-motion'

// ── Constraints line-drawing variants ─────────────────────────────────────
// Matches the Framer Motion pathLength spring pattern.
// `custom` drives the stagger delay: delay = i * 0.35s
// Sequence: outer frame verticals (0) → frame-bottom (0.5) →
//           inner verticals (1) → hlines (1.5, 2) → items (2.5–3.5)

const draw: Variants = {
  hidden: { pathLength: 0, opacity: 0 },
  visible: (i: number) => {
    const delay = i * 0.35
    return {
      pathLength: 1,
      opacity: 1,
      transition: {
        pathLength: { delay, type: 'spring', duration: 0.8, bounce: 0 },
        opacity:    { delay, duration: 0.01 },
      },
    }
  },
}

const itemFade: Variants = {
  hidden: { opacity: 0 },
  visible: (i: number) => ({
    opacity: 1,
    transition: { delay: i * 0.35, duration: 0.2, ease: 'easeOut' },
  }),
}

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

            {/* Hidden rows — items fade in after SVG lines are drawn */}
            <div className="rr-constraints-card__hidden">
              {(['A memetic visual language', 'No possibility of a tie', 'Visual restraint'] as const)
                .map((item, i) => (
                  <motion.p
                    key={item}
                    className="rr-constraints-card__item"
                    variants={itemFade}
                    custom={2.5 + i * 0.5}
                    initial="hidden"
                    animate={constraintsOpen ? 'visible' : 'hidden'}
                  >
                    {item}
                  </motion.p>
                ))}
            </div>

            {/* SVG line-drawing overlay — pathLength spring, staggered via custom prop.  */}
            {/* Positioned absolute in inner div; clipped by parent overflow:hidden so    */}
            {/* lines below the fold are revealed as the hidden section expands.           */}
            <AnimatePresence>
              {constraintsOpen && (
                <motion.svg
                  className="rr-constraints-card__lines-svg"
                  width="256"
                  height="244"
                  viewBox="0 0 256 244"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, transition: { duration: 0.15 } }}
                  aria-hidden="true"
                >
                  {/* Outer frame verticals (l4 / r4) — custom=0, no delay */}
                  <motion.line x1="28"  y1="120" x2="28"  y2="240" variants={draw} custom={0} style={{ stroke: 'var(--olive-560)', strokeWidth: 1, strokeLinecap: 'round', strokeOpacity: 0.4 }} />
                  <motion.line x1="228" y1="120" x2="228" y2="240" variants={draw} custom={0} style={{ stroke: 'var(--olive-560)', strokeWidth: 1, strokeLinecap: 'round', strokeOpacity: 0.4 }} />

                  {/* Frame bottom — custom=0.5 */}
                  <motion.line x1="4"   y1="210" x2="252" y2="210" variants={draw} custom={0.5} style={{ stroke: 'var(--olive-560)', strokeWidth: 1, strokeLinecap: 'round', strokeOpacity: 0.4 }} />

                  {/* Inner verticals (l5 / r5) — custom=1 */}
                  <motion.line x1="36"  y1="160" x2="36"  y2="240" variants={draw} custom={1}   style={{ stroke: 'var(--olive-560)', strokeWidth: 1, strokeLinecap: 'round', strokeOpacity: 0.4 }} />
                  <motion.line x1="220" y1="160" x2="220" y2="240" variants={draw} custom={1}   style={{ stroke: 'var(--olive-560)', strokeWidth: 1, strokeLinecap: 'round', strokeOpacity: 0.4 }} />

                  {/* Horizontal dividers between hidden items — custom=1.5, 2 */}
                  <motion.line x1="4"   y1="160" x2="252" y2="160" variants={draw} custom={1.5} style={{ stroke: 'var(--olive-560)', strokeWidth: 1, strokeLinecap: 'round', strokeOpacity: 0.4 }} />
                  <motion.line x1="4"   y1="198" x2="252" y2="198" variants={draw} custom={2}   style={{ stroke: 'var(--olive-560)', strokeWidth: 1, strokeLinecap: 'round', strokeOpacity: 0.4 }} />
                </motion.svg>
              )}
            </AnimatePresence>

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
            {/* l4/r4/l5/r5 replaced by SVG motion.line paths above */}
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
