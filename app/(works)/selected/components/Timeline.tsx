'use client'

// Timeline — vertical timeline with project cards, nameplates, and archive toggle.
// Framer Motion staggered spring entrance using the train metaphor:
// an imaginary cursor draws the timeline top-to-bottom, elements appear
// as the cursor reaches their vertical position.

import Link from 'next/link'
import { motion } from 'framer-motion'
import ProjectCard from './ProjectCard'
import { getGreeting } from '../../../lib/greeting'


const SPRING = { type: 'spring' as const, duration: 0.5, bounce: 0.15 }
const SPRING_POP = { type: 'spring' as const, duration: 0.3, bounce: 0.35 }
const SPRING_PLACE = { type: 'spring' as const, duration: 0.45, bounce: 0.25 }
const SPRING_PILL = { type: 'spring' as const, duration: 0.4, bounce: 0.15 }

// ── Unified delay map — single top-to-bottom train ──────────────────────
//
// Phase 1: Pre-bar (Now dot → top dots → blue bar start)
// Phase 2: During blue bar growth (train formula)
//   delay = barBlue.start + ((el.top - bar.top) / bar.height) × spring.duration
//   bar: top 184, height 389, start 0.50, spring 0.5s
// Phase 3: Post-bar (sequential, ~0.04s gaps)
//
const D = {
  // Phase 1 — pre-bar
  dot:        0.30,
  dotsTop0:   0.38,
  dotsTop1:   0.42,
  dotsTop2:   0.46,

  // Phase 2 — during blue bar growth
  barBlue:    0.50,   // spring 0.5s → done ~1.00
  year2025:   0.51,   // 136 — just inside bar top
  cardTerra:  0.51,   // 126 — at bar top
  barYellow:  0.68,   // 256 — 35% into blue
  yearQ425:   0.70,   // 280 — 41% into blue (Terra role center)
  cardBlue:   0.76,   // 324 — 53% into blue
  year23:     0.98,   // 478 — 94% into blue

  // Phase 3 — post-bar (sequential after blue completes ~1.00)
  dotsBot0:   1.02,
  dotsBot1:   1.06,
  dotsBot2:   1.10,
  names:      1.14,
  dotMid1:    1.18,
  marks:      1.20,
  dotMid2:    1.24,
  archive:    1.28,
}

interface TimelineProps {
  isArchiveOpen: boolean
  onArchiveToggle: () => void
}

export default function Timeline({ isArchiveOpen, onArchiveToggle }: TimelineProps) {
  return (
    <div className="selected-tl">
      {/* Now dot */}
      <motion.div
        className="selected-tl__dot"
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_POP, delay: D.dot }}
      />

      {/* Now label */}
      <motion.span
        className="selected-tl__label-now"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: D.dot }}
      >
        Now
      </motion.span>

      {/* Greeting */}
      <motion.span
        className="selected-tl__greeting"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.25, delay: D.dot }}
      >
        {getGreeting()}
      </motion.span>

      {/* Top dot cluster */}
      <div className="selected-tl__dots selected-tl__dots--top">
        {[D.dotsTop0, D.dotsTop1, D.dotsTop2].map((delay, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_POP, delay }}
          />
        ))}
      </div>

      {/* Blue bar */}
      <motion.div
        className="selected-tl__bar-blue"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ ...SPRING, delay: D.barBlue }}
      />

      {/* Yellow bar */}
      <motion.div
        className="selected-tl__bar-yellow"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ ...SPRING, duration: 0.18, delay: D.barYellow }}
      />

      {/* Year labels */}
      <motion.span
        className="selected-tl__year selected-tl__year--2025"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: D.year2025 }}
      >
        2025
      </motion.span>

      <motion.span
        className="selected-tl__year selected-tl__year--q425"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: D.yearQ425 }}
      >
        Q4&bull;25
      </motion.span>

      <motion.span
        className="selected-tl__year selected-tl__year--23"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: D.year23 }}
      >
        23
      </motion.span>

      {/* Project card: Terra (Rug Rumble) */}
      <motion.div
        className="selected-card-terra"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.cardTerra }}
      >
        <ProjectCard
          variant="terra"
          href="/rr"
          title="A 5-minute game, with a simple mechanic"
          body="+ card layouts, a game arena, and the process of building a game across 3 continents with playtesting."
          role="Game Designer • Rug Rumble"
        />
      </motion.div>

      {/* Project card: Blue (Biconomy) */}
      <motion.div
        className="selected-card-blue"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.cardBlue }}
      >
        <ProjectCard
          variant="blue"
          href="/biconomy"
          title="Designs to make the invisible infra: visible and usable"
          body="+ a UX Audit, demos, a concept UI, and cultural interventions in a web3 ecosystem."
          role="Product Designer • Biconomy"
        />
      </motion.div>

      {/* Bottom dot cluster */}
      <div className="selected-tl__dots selected-tl__dots--bot">
        {[D.dotsBot0, D.dotsBot1, D.dotsBot2].map((delay, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_POP, delay }}
          />
        ))}
      </div>

      {/* Nameplate: Names Coined */}
      <motion.div
        className="selected-nameplate selected-nameplate--names"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.names }}
      >
        <div className="nav-marker">
          <span className="nav-marker__content">
            <span className="nav-icon nav-icon--muted" aria-hidden="true">title</span>
            <span className="nav-marker__title t-btn1" style={{ color: 'var(--grey-640)' }}>Names Coined</span>
          </span>
        </div>
      </motion.div>

      {/* Single dot: after Names Coined */}
      <motion.div
        className="selected-tl__dot-single selected-tl__dot-single--mid1"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_POP, delay: D.dotMid1 }}
      />

      {/* Nameplate: Marks And Symbols Made — live link to /marks. Unlike the
          Names Coined nameplate (still paper-stage, muted), this one routes
          through the shared (works) nav so the shell chrome transitions in. */}
      <motion.div
        className="selected-nameplate selected-nameplate--marks selected-nameplate--link"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.marks }}
      >
        <Link href="/marks" className="nav-marker nav-marker--chapter">
          <span className="nav-marker__content">
            <span className="nav-icon" aria-hidden="true">category</span>
            <span className="nav-marker__title t-btn1">Marks and Symbols Made</span>
          </span>
        </Link>
      </motion.div>

      {/* Single dot: after Marks And Symbols Made */}
      <motion.div
        className="selected-tl__dot-single selected-tl__dot-single--mid2"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_POP, delay: D.dotMid2 }}
      />

      {/* Archive toggle button — last element in the train */}
      <motion.div
        className="selected-nav-archive"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.archive }}
      >
        <button
          className="nav-marker nav-marker--chapter"
          type="button"
          onClick={onArchiveToggle}
          aria-expanded={isArchiveOpen}
        >
          <span className="nav-marker__content">
            <span className="nav-icon" aria-hidden="true">
              {isArchiveOpen ? 'keyboard_arrow_up' : 'keyboard_arrow_down'}
            </span>
            <span className="nav-marker__title t-btn1 archive-toggle-label--desktop">Works from the previous portfolio</span>
            <span className="nav-marker__title t-btn1 archive-toggle-label--mobile">Previous portfolio</span>
            <span className="nav-marker__year t-p4">2018–22</span>
          </span>
        </button>
      </motion.div>
    </div>
  )
}
