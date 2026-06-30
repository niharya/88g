'use client'

// Timeline — vertical timeline with project cards, the Slangbusters case-study
// dropdown, and nameplates. FLOW layout: a CSS grid with a narrow RAIL column
// (dots, colored bars, year labels) on the left and a CONTENT column (project
// cards) on the right. Heights are content-driven — bars fill their project
// group's row height via `align-self: stretch`, so opening the Slangbusters
// dropdown reflows everything below naturally (no hand-synced coordinate shift).
//
// Two parents on the rail: Biconomy (blue, tall) with Rug Rumble (yellow)
// nested inside its span, and Slangbusters (mint, tall) below it with three
// case studies — Aleyr / Ecochain / Codezeros — collapsed behind the inline
// "case studies (3)" dropdown. Expanding mounts the children (Framer
// AnimatePresence), which the grid absorbs by growing the mint group + the mat.
//
// Framer staggered spring entrance ("train" metaphor): an imaginary cursor
// draws the timeline top-to-bottom, elements appear top-to-bottom as it passes.
// Bars grow via scaleY; dots pop; cards place from y:-8→0.

import { motion, AnimatePresence } from 'framer-motion'
import NavMarker from '../../../components/NavMarker'
import MaterialIcon from '../../../components/MaterialIcon'
import ProjectCard from './ProjectCard'
import { getGreeting, getGreetingStage } from '../../../lib/greeting'
import { useCrossShellNav } from '../../../components/CrossShellVeil'


const SPRING = { type: 'spring' as const, duration: 0.5, bounce: 0.15 }
const SPRING_POP = { type: 'spring' as const, duration: 0.3, bounce: 0.35 }
const SPRING_PLACE = { type: 'spring' as const, duration: 0.45, bounce: 0.25 }
const SPRING_ENTRY = { type: 'spring' as const, duration: 0.3, bounce: 0.12 }
// Expand/collapse of the Slangbusters children: a height settle on --ease-paper
// (no overshoot) so the card below, the mint spine, and the mat all glide as the
// wrapper opens/closes — the structural reflow that used to snap.
const PAPER_EASE = [0.5, 0, 0.2, 1] as const
const HEIGHT_SETTLE = { duration: 0.45, ease: PAPER_EASE }

// ── Unified delay map — single top-to-bottom train ──────────────────────
//
// An imaginary cursor draws the timeline top-to-bottom; each element appears as
// the cursor reaches its vertical position. The values below are the ORIGINAL
// hand-tuned results of that train (Phase 1 pre-bar → Phase 2 during the blue
// bar's growth → Phase 3 the Slangbusters stack → Phase 4 the nameplates) and
// are restored verbatim — do not retune to a flat sequential stagger.
//
const D = {
  // Phase 1 — pre-bar
  dot:        0.30,
  dotsTop0:   0.38,
  dotsTop1:   0.42,
  dotsTop2:   0.46,

  // Phase 2 — during blue bar growth (train formula)
  barBlue:    0.50,
  year2025:   0.51,
  cardTerra:  0.51,
  barYellow:  0.68,
  yearQ425:   0.70,
  cardBlue:   0.76,
  year23:     0.98,

  // Phase 3 — Biconomy→Slangbusters connector + Slangbusters stack
  dotsBot0:   1.02,
  dotsBot1:   1.06,
  dotsBot2:   1.10,
  barMint:    1.14,
  slangTop:   1.16,
  slangBot:   1.20,
  dropdown:   1.22,
  cardMint:   1.26,

  // Phase 4 — nameplate connector cluster + nameplates
  npDots0:    1.34,
  npDots1:    1.38,
  npDots2:    1.42,
  marks:      1.46,
  dotMid:     1.50,
  names:      1.52,
}

// Dropdown-expand stagger for the three nested children (relative to open) —
// each child's row, then its bar, then its year (original per-element stagger).
const CHILD_D = {
  aleyr: { row: 0.08, bar: 0.14, year: 0.18 },
  eco:   { row: 0.22, bar: 0.28, year: 0.32 },
  code:  { row: 0.36, bar: 0.42, year: 0.46 },
} as const

// The three Slangbusters case studies (nested children). Years carried here so
// the displayed labels and the rail year markers can't drift.
const CHILDREN = [
  {
    id: 'aleyr',
    year: '20',
    title: 'Finding the thin line between pet ownership and pet parenting',
    role: 'Creative Director • Aleyr',
    href: 'https://niharbhagat.com/work/aleyr/',
  },
  {
    id: 'eco',
    year: '19',
    title: 'Using the logic of a real desk to shape a digital trading workspace',
    role: 'Creative Director • Ecochain',
    href: 'https://slangbusters.com/work/ecochain/',
  },
  {
    id: 'code',
    year: '18',
    title: 'Defining a blockchain company before the category had a clear shape',
    role: 'Creative Director • Codezeros',
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

      {/* ════ Cap — the living "Now" ═══════════════════════════════════════ */}
      <div className="selected-tl__cap">
        <div className="selected-tl__cap-rail">
          {/* Now dot — shape mirrors time of day: morning semicircle (sun on
              horizon), afternoon full circle, evening crescent moon. */}
          <motion.div
            className={`selected-tl__dot selected-tl__dot--${getGreetingStage()}`}
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ ...SPRING_POP, delay: D.dot }}
          />
          {/* Living "Now" pulse — a gentle expanding ring on the amber dot.
              A separate element (not a pseudo) so it never collides with the
              dot's clip-path/crescent. Honors reduced-motion. */}
          <span className="selected-tl__pulse" aria-hidden="true" />
        </div>

        <motion.span
          className="selected-tl__label-now"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: D.dot }}
        >
          Now
        </motion.span>

        <motion.span
          className="selected-tl__greeting t-h5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.25, delay: D.dot }}
        >
          {getGreeting()}
        </motion.span>
      </div>

      {/* Top dot cluster — between the cap and the first project group */}
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

      {/* ════ Biconomy group (blue) — Rug Rumble nested ════════════════════ */}
      {/* A 2-row grid (rail col + card col). Bars are grid ITEMS that
          align-self:stretch to their card rows, so they're EXACTLY as tall as
          their project (content-driven, edges touching): yellow spans the Rug
          Rumble row, blue spans both rows. Years are grid items in the rail col,
          placed at their card's TOP (2025) or ROLE-ROW level (Q4•25, 23). */}
      <div className="selected-tl__group selected-tl__group--blue">
        {/* Blue bar — col 1, spans both rows (RR-top → Biconomy-bottom) */}
        <motion.div
          className="selected-tl__bar-blue"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ ...SPRING, delay: D.barBlue }}
        />
        {/* Yellow bar — col 1, row 1 (spans exactly the Rug Rumble card) */}
        <motion.div
          className="selected-tl__bar-yellow"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ ...SPRING, duration: 0.18, delay: D.barYellow }}
        />

        {/* Years — rail col, aligned to card top / role rows */}
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

        {/* Cards — col 2, one per row */}
        <motion.div
          className="selected-card selected-card-terra"
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

        <motion.div
          className="selected-card selected-card-blue"
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
      </div>

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

      {/* ════ Slangbusters group (mint — second parent) ════════════════════ */}
      {/* The mint spine is one absolute bar over the WHOLE group: its top sits
          just under the connector dots (closing the gap that the dropdown header
          used to leave), its bottom at the Slangbusters card bottom; it grows to
          span the children when they mount. Dropdown + spine wrapper flow beside it. */}
      <div className="selected-tl__group selected-tl__group--mint">
        {/* Continuous mint spine — spans the whole group. */}
        <motion.div
          className="selected-tl__bar-mint"
          initial={{ scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={{ ...SPRING, delay: D.barMint }}
        />
        {/* Inline dropdown header — text button (not a NavMarker), aligned to
            the cards column. Toggles the nested case studies + the mat growth. */}
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

        {/* Spine wrapper — children + parent card; the mint spine spans the
            parent group (above), not just this box. */}
        <div className="selected-tl__mint-spinebox">
          {/* Child rows — Aleyr / Ecochain / Codezeros, inside a height-animated
              wrapper so expand/collapse glides (the card below, the mint spine,
              and the mat all follow the wrapper's flow). Mount only when expanded
              (AnimatePresence) with the CHILD_D stagger; mounting ABOVE the parent
              card pushes the Slangbusters card DOWN. Each child is a rail (short
              bar + year) + a plain-text entry. */}
          <AnimatePresence>
            {expanded && (
              <motion.div
                key="sb-children"
                className="selected-tl__children-wrap"
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={HEIGHT_SETTLE}
              >
                {CHILDREN.map((c) => (
                <motion.div
                  key={`row-${c.id}`}
                  className={`selected-tl__row selected-tl__row--child selected-card-sb--${c.id}`}
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ ...SPRING_ENTRY, delay: CHILD_D[c.id].row }}
                >
                  <div className="selected-tl__rail">
                    <motion.span
                      className={`selected-tl__bar-sb selected-tl__bar-sb--${c.id}`}
                      initial={{ scaleY: 0 }}
                      animate={{ scaleY: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ ...SPRING_ENTRY, delay: CHILD_D[c.id].bar }}
                    />
                    <motion.span
                      className={`selected-tl__year selected-tl__year--sb-${c.id}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.14, delay: CHILD_D[c.id].year }}
                    >
                      {c.year}
                    </motion.span>
                  </div>
                  <div className="selected-tl__cards">
                    <ProjectCard
                      compact
                      variant={c.id}
                      href={c.href}
                      title={c.title}
                      role={c.role}
                    />
                  </div>
                </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Parent row — rail (years) + the Slangbusters card. Sits BELOW the
              children, so it's pushed down when they mount. */}
          <div className="selected-tl__row selected-tl__row--mint-parent">
            <div className="selected-tl__rail">
              <motion.span
                className="selected-tl__year selected-tl__year--slang-top"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: D.slangTop }}
              >
                20
              </motion.span>
              {/* Bottom year only when collapsed — children carry years when open. */}
              {!expanded && (
                <motion.span
                  className="selected-tl__year selected-tl__year--slang-bot"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: D.slangBot }}
                >
                  18
                </motion.span>
              )}
            </div>

            <div className="selected-tl__cards">
              <motion.div
                className="selected-card selected-card-mint"
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
            </div>
          </div>
        </div>
      </div>

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
