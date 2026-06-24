'use client'

// Timeline — vertical timeline with project cards, the Slangbusters case-study
// dropdown, and nameplates. Framer Motion staggered spring entrance using the
// train metaphor: an imaginary cursor draws the timeline top-to-bottom,
// elements appear as the cursor reaches their vertical position.
//
// Two parents on the rail: Biconomy (blue, tall) with Rug Rumble (yellow)
// nested inside its span, and Slangbusters (mint, tall) below it with three
// case studies — Aleyr / Ecochain / Codezeros — collapsed behind the inline
// "case studies (3)" dropdown. Expanding grows the mint bar + the mat and
// pushes the lower timeline (nameplates) down; the children mount with their
// own stagger (see CHILD_D).

import { motion, AnimatePresence } from 'framer-motion'
import NavMarker from '../../../components/NavMarker'
import MaterialIcon from '../../../components/MaterialIcon'
import ProjectCard from './ProjectCard'
import IconExternalLink from '../../../components/icons/IconExternalLink'
import { getGreeting, getGreetingStage } from '../../../lib/greeting'
import { useCrossShellNav } from '../../../components/CrossShellVeil'


const SPRING = { type: 'spring' as const, duration: 0.5, bounce: 0.15 }
const SPRING_POP = { type: 'spring' as const, duration: 0.3, bounce: 0.35 }
const SPRING_PLACE = { type: 'spring' as const, duration: 0.45, bounce: 0.25 }
const SPRING_ENTRY = { type: 'spring' as const, duration: 0.3, bounce: 0.12 }

// ── Unified delay map — single top-to-bottom train ──────────────────────
//
// Phase 1: Pre-bar (Now dot → top dots → blue bar start)
// Phase 2: During blue bar growth (train formula)
//   delay = barBlue.start + ((el.top - bar.top) / bar.height) × spring.duration
//   bar geometry lives in selected.css (.selected-tl__bar-blue); the D values
//   below are the absolute results of the formula, not derived live
// Phase 3: Connector → Slangbusters stack (mint bar + dropdown + mint card)
// Phase 4: Post-stack (nameplate cluster → nameplates, sequential)
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

  // Phase 3 — Biconomy→Slangbusters connector + Slangbusters stack
  dotsBot0:   1.02,
  dotsBot1:   1.06,
  dotsBot2:   1.10,
  barMint:    1.14,   // mint bar (parent span)
  slangTop:   1.16,   // year 20 at mint bar top
  slangBot:   1.20,   // year 18 at mint bar bottom
  dropdown:   1.22,   // inline "case studies (3)" header
  cardMint:   1.26,   // Slangbusters card

  // Phase 4 — nameplate connector cluster + nameplates
  npDots0:    1.34,
  npDots1:    1.38,
  npDots2:    1.42,
  marks:      1.46,   // Marks and Symbols Made (swapped above Names — §2a)
  dotMid:     1.50,
  names:      1.52,   // Names Coined
}

// Dropdown-expand stagger for the three nested children (relative to open).
const CHILD_D = {
  aleyr: { row: 0.08, bar: 0.14, year: 0.18 },
  eco:   { row: 0.22, bar: 0.28, year: 0.32 },
  code:  { row: 0.36, bar: 0.42, year: 0.46 },
}

// The three Slangbusters case studies (nested children). Years carried here so
// the displayed labels and the hand-placed year markers can't drift.
const CHILDREN = [
  {
    id: 'aleyr',
    title: 'Finding the thin line between pet ownership and pet parenting',
    meta: 'Creative Director • Aleyr',
    href: 'https://niharbhagat.com/work/aleyr/',
  },
  {
    id: 'eco',
    title: 'Using the logic of a real desk to shape a digital trading workspace',
    meta: 'Creative Director • Ecochain',
    href: 'https://slangbusters.com/work/ecochain/',
  },
  {
    id: 'code',
    title: 'Defining a blockchain company before the category had a clear shape',
    meta: 'Creative Director • Codezeros',
    href: 'https://niharbhagat.com/work/codezeros/',
  },
] as const

interface TimelineProps {
  expanded: boolean
  onToggle: () => void
}

export default function Timeline({ expanded, onToggle }: TimelineProps) {
  // /marks lives outside the (works) shell, so TransitionSlot doesn't
  // bridge the navigation. Crossfade through black instead — see
  // CrossShellVeil + CLAUDE.md "Cross-shell navigation".
  const onMarksClick = useCrossShellNav('/marks')

  return (
    <div className="selected-tl">
      {/* Now dot — shape mirrors time of day: morning semicircle (sun on
          horizon), afternoon full circle, evening crescent moon. */}
      <motion.div
        className={`selected-tl__dot selected-tl__dot--${getGreetingStage()}`}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_POP, delay: D.dot }}
      />

      {/* Living "Now" pulse — a gentle expanding ring on the amber dot,
          signalling the timeline is anchored in the present. Decorative;
          sits behind the dot and starts after the dot has landed. A
          separate element (not a pseudo) so it never collides with the
          dot's clip-path/crescent treatments. Honors reduced-motion. */}
      <span className="selected-tl__pulse" aria-hidden="true" />

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
        className="selected-tl__greeting t-h5"
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

      {/* Blue bar (Biconomy — parent) */}
      <motion.div
        className="selected-tl__bar-blue"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ ...SPRING, delay: D.barBlue }}
      />

      {/* Yellow bar (Rug Rumble — nested) */}
      <motion.div
        className="selected-tl__bar-yellow"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ ...SPRING, duration: 0.18, delay: D.barYellow }}
      />

      {/* Year labels — Biconomy stack */}
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

      {/* Connector dots (Biconomy → Slangbusters) */}
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

      {/* ════ Slangbusters stack (mint — second parent) ════════════════ */}

      {/* Mint bar (parent span; grows 224→504 with the mat on expand) */}
      <motion.div
        className="selected-tl__bar-mint"
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ ...SPRING, delay: D.barMint }}
      />

      {/* Slangbusters years — 20 at the top of the span, 18 at the bottom */}
      <motion.span
        className="selected-tl__year selected-tl__year--slang-top"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: D.slangTop }}
      >
        20
      </motion.span>
      <motion.span
        className="selected-tl__year selected-tl__year--slang-bot"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2, delay: D.slangBot }}
      >
        18
      </motion.span>

      {/* Inline dropdown header — text button on the mint spine (not a
          NavMarker). Toggles the nested case studies + the mat growth. */}
      <motion.div
        className="selected-tl__dropdown"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.dropdown }}
      >
        <button
          type="button"
          className="selected-tl__dropdown-btn"
          onClick={onToggle}
          aria-expanded={expanded}
        >
          <span className="selected-tl__dropdown-label">Slangbusters case studies (3)</span>
          <MaterialIcon name="expand_more" className="selected-tl__dropdown-chevron" />
        </button>
      </motion.div>

      {/* Slangbusters card (mint — external link) */}
      <motion.div
        className="selected-card-mint"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.cardMint }}
      >
        <ProjectCard
          variant="mint"
          href="https://niharbhagat.com/work/slangbusters/"
          title="Building the conditions that let a creative studio do its best work"
          body="+ studio rituals, hiring, and the operating system behind the work."
          role="Creative Director • Slangbusters"
        />
      </motion.div>

      {/* Nested children — Aleyr / Ecochain / Codezeros. Mount only when the
          dropdown is open, with the CHILD_D stagger; tear down on collapse.
          Each is a row + short bar + year, on the mint spine. */}
      <AnimatePresence>
        {expanded &&
          CHILDREN.flatMap((c, i) => {
            const d = CHILD_D[c.id]
            return [
              <motion.a
                key={`row-${c.id}`}
                className={`sb-case sb-case--${c.id}`}
                href={c.href}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ ...SPRING_ENTRY, delay: d.row }}
              >
                <p className="sb-case__title">{c.title}</p>
                <div className="sb-case__meta t-h5">
                  <span>{c.meta}</span>
                  <IconExternalLink size={14} className="icon-ext" />
                </div>
                <span className="sb-case__hint">opens in new tab</span>
              </motion.a>,
              <motion.div
                key={`bar-${c.id}`}
                className={`selected-tl__bar-sb selected-tl__bar-sb--${c.id}`}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                exit={{ opacity: 0 }}
                transition={{ ...SPRING_ENTRY, delay: d.bar }}
              />,
              <motion.span
                key={`year-${c.id}`}
                className={`selected-tl__year selected-tl__year--sb-${c.id}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14, delay: d.year }}
              >
                {i === 0 ? '20' : i === 1 ? '19' : '18'}
              </motion.span>,
            ]
          })}
      </AnimatePresence>

      {/* Nameplate connector cluster (before the nameplates) */}
      <div className="selected-tl__dots selected-tl__dots--nameplate">
        {[D.npDots0, D.npDots1, D.npDots2].map((delay, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_POP, delay }}
          />
        ))}
      </div>

      {/* Nameplate: Marks and Symbols Made — live link to /marks, routed
          through the shared (works) nav so the shell chrome transitions in.
          Sits ABOVE Names Coined (§2a swap). */}
      <motion.div
        className="selected-nameplate selected-nameplate--marks selected-nameplate--link"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.marks }}
      >
        <NavMarker
          as="a"
          href="/marks"
          role="chapter"
          icon="category"
          label="Marks and Symbols Made"
          onClick={onMarksClick}
        />
      </motion.div>

      {/* Single dot between the nameplates */}
      <motion.div
        className="selected-tl__dot-single selected-tl__dot-single--mid"
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ ...SPRING_POP, delay: D.dotMid }}
      />

      {/* Nameplate: Names Coined — still paper-stage (muted, W.I.P.) */}
      <motion.div
        className="selected-nameplate selected-nameplate--names"
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...SPRING_PLACE, delay: D.names }}
      >
        <NavMarker
          as="button"
          role="chapter"
          icon="title"
          label="Names Coined"
          wipHint="W.I.P."
          aria-label="Names Coined — work in progress"
        />
      </motion.div>
    </div>
  )
}
