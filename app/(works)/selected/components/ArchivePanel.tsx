'use client'

// ArchivePanel — toggle button + expandable archive entries.
// State is lifted to SelectedContent so the mat can grow when open.
// Framer Motion AnimatePresence for staggered entry reveals with springs.

import { motion, AnimatePresence } from 'framer-motion'
import IconExternalLink from '../../../components/icons/IconExternalLink'


const SPRING = { type: 'spring' as const, duration: 0.4, bounce: 0.15 }
const SPRING_LONG = { type: 'spring' as const, duration: 0.65, bounce: 0.12 }
const SPRING_ENTRY = { type: 'spring' as const, duration: 0.3, bounce: 0.12 }

// Sequential top-to-bottom delays — train metaphor.
// Yellow bar completes before mint starts. Nested bars appear mid-mint.
const D = {
  dots:          0.06,
  barYellow:     0.12,   // spring 0.4s → done ~0.52
  connektion:    0.28,
  year21:        0.42,
  barMint:       0.54,   // spring 0.65s → done ~1.19
  year20top:     0.56,
  aleyr:         0.58,
  barAleyr:      0.65,
  year20:        0.66,
  ecochain:      0.74,
  barEcochain:   0.82,
  year19:        0.83,
  codezeros:     0.92,
  barCodezeros:  1.00,
  year18:        1.01,
  slangbusters:  1.09,
  year18bot:     1.17,
}

const ARCHIVE_ENTRIES = [
  {
    id: 'yellow',
    title: 'Finding the real product hidden inside the client brief',
    role: 'Product Designer',
    company: 'Connektion',
    year: '2021',
    href: 'https://niharbhagat.com/work/connektion/',
  },
  {
    id: 'aleyr',
    title: 'Finding the thin line between pet ownership and pet parenting',
    role: 'Creative Director',
    company: 'Aleyr',
    year: '2020',
    href: 'https://niharbhagat.com/work/aleyr/',
  },
  {
    id: 'olive',
    title: 'Using the logic of a real desk to shape a digital trading workspace',
    role: 'Creative Director',
    company: 'Ecochain',
    year: '2019',
    href: 'https://slangbusters.com/work/ecochain/',
  },
  {
    id: 'codezeros',
    title: 'Defining a blockchain company before the category had a clear shape',
    role: 'Creative Director',
    company: 'Codezeros',
    year: '2018',
    href: 'https://niharbhagat.com/work/codezeros/',
  },
  {
    id: 'mint',
    title: 'Building the conditions that let a creative studio do its best work',
    role: 'Creative Director',
    company: 'Slangbusters',
    year: '2018',
    href: 'https://niharbhagat.com/work/slangbusters/',
  },
]

interface ArchivePanelProps {
  isOpen: boolean
}

export default function ArchivePanel({ isOpen }: ArchivePanelProps) {
  return (
    <AnimatePresence>
        {isOpen && (
          <motion.div
            className="selected-archive-panel"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            {/* Mini timeline dots */}
            <div className="selected-ap-dots selected-ap-dots--top">
              {[0, 1, 2].map(i => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ type: 'spring', duration: 0.3, bounce: 0.35, delay: D.dots + i * 0.04 }}
                />
              ))}
            </div>

            {/* ── Yellow bar (Connektion) — standalone ─────────── */}
            <motion.div
              className="selected-ap-bar selected-ap-bar--yellow"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...SPRING, delay: D.barYellow }}
            />
            <motion.a
              className="ap-entry ap-entry--yellow"
              href={ARCHIVE_ENTRIES[0].href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_ENTRY, delay: D.connektion }}
            >
              <p className="ap-entry__title">{ARCHIVE_ENTRIES[0].title}</p>
              <div className="ap-entry__meta">
                <span>{ARCHIVE_ENTRIES[0].role} &bull; {ARCHIVE_ENTRIES[0].company}<span className="ap-entry__year"> &bull; {ARCHIVE_ENTRIES[0].year}</span></span>
                <IconExternalLink size={14} className="icon-ext" />
              </div>
              <span className="ap-entry__hint">opens in new tab</span>
            </motion.a>
            <motion.span
              className="selected-ap-year selected-ap-year--yellow"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: D.year21 }}
            >
              21
            </motion.span>

            {/* ── Mint bar (Slangbusters) — long bar, starts after yellow ── */}
            <motion.div
              className="selected-ap-bar selected-ap-bar--mint"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...SPRING_LONG, delay: D.barMint }}
            />
            <motion.span
              className="selected-ap-year selected-ap-year--mint-top"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: D.year20top }}
            >
              20
            </motion.span>

            {/* ── Aleyr — nested inside mint ──────────────────── */}
            <motion.a
              className="ap-entry ap-entry--aleyr"
              href={ARCHIVE_ENTRIES[1].href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_ENTRY, delay: D.aleyr }}
            >
              <p className="ap-entry__title">{ARCHIVE_ENTRIES[1].title}</p>
              <div className="ap-entry__meta">
                <span>{ARCHIVE_ENTRIES[1].role} &bull; {ARCHIVE_ENTRIES[1].company}<span className="ap-entry__year"> &bull; {ARCHIVE_ENTRIES[1].year}</span></span>
                <IconExternalLink size={14} className="icon-ext" />
              </div>
              <span className="ap-entry__hint">opens in new tab</span>
            </motion.a>
            <motion.div
              className="selected-ap-bar selected-ap-bar--aleyr"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...SPRING_ENTRY, delay: D.barAleyr }}
            />
            <motion.span
              className="selected-ap-year selected-ap-year--aleyr"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: D.year20 }}
            >
              20
            </motion.span>

            {/* ── Ecochain (olive) — nested inside mint ────────── */}
            <motion.a
              className="ap-entry ap-entry--olive"
              href={ARCHIVE_ENTRIES[2].href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_ENTRY, delay: D.ecochain }}
            >
              <p className="ap-entry__title">{ARCHIVE_ENTRIES[2].title}</p>
              <div className="ap-entry__meta">
                <span>{ARCHIVE_ENTRIES[2].role} &bull; {ARCHIVE_ENTRIES[2].company}<span className="ap-entry__year"> &bull; {ARCHIVE_ENTRIES[2].year}</span></span>
                <IconExternalLink size={14} className="icon-ext" />
              </div>
              <span className="ap-entry__hint">opens in new tab</span>
            </motion.a>
            <motion.div
              className="selected-ap-bar selected-ap-bar--olive"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...SPRING_ENTRY, delay: D.barEcochain }}
            />
            <motion.span
              className="selected-ap-year selected-ap-year--olive"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: D.year19 }}
            >
              19
            </motion.span>

            {/* ── Codezeros — nested inside mint ───────────────── */}
            <motion.a
              className="ap-entry ap-entry--codezeros"
              href={ARCHIVE_ENTRIES[3].href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_ENTRY, delay: D.codezeros }}
            >
              <p className="ap-entry__title">{ARCHIVE_ENTRIES[3].title}</p>
              <div className="ap-entry__meta">
                <span>{ARCHIVE_ENTRIES[3].role} &bull; {ARCHIVE_ENTRIES[3].company}<span className="ap-entry__year"> &bull; {ARCHIVE_ENTRIES[3].year}</span></span>
                <IconExternalLink size={14} className="icon-ext" />
              </div>
              <span className="ap-entry__hint">opens in new tab</span>
            </motion.a>
            <motion.div
              className="selected-ap-bar selected-ap-bar--codezeros"
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ ...SPRING_ENTRY, delay: D.barCodezeros }}
            />
            <motion.span
              className="selected-ap-year selected-ap-year--codezeros"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: D.year18 }}
            >
              18
            </motion.span>

            {/* ── Slangbusters (mint) — at bottom of mint bar ──── */}
            <motion.a
              className="ap-entry ap-entry--mint"
              href={ARCHIVE_ENTRIES[4].href}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ ...SPRING_ENTRY, delay: D.slangbusters }}
            >
              <p className="ap-entry__title">{ARCHIVE_ENTRIES[4].title}</p>
              <div className="ap-entry__meta">
                <span>{ARCHIVE_ENTRIES[4].role} &bull; {ARCHIVE_ENTRIES[4].company}<span className="ap-entry__year"> &bull; {ARCHIVE_ENTRIES[4].year}</span></span>
                <IconExternalLink size={14} className="icon-ext" />
              </div>
              <span className="ap-entry__hint">opens in new tab</span>
            </motion.a>
            <motion.span
              className="selected-ap-year selected-ap-year--mint"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.14, delay: D.year18bot }}
            >
              18
            </motion.span>
          </motion.div>
        )}
    </AnimatePresence>
  )
}
