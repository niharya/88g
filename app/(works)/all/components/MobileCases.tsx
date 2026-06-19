'use client'

// MobileCases — the cards-first composition for the Cases tab on phones.
// A purpose-built mobile layout (not a reflow of the desktop rail): a living
// "Now" cue, then the work as cards with hierarchy carried by indentation +
// explicit nested labels instead of a spine. The three Slangbusters case
// studies live in a bottom sheet (CasesSheet) rather than the desktop's inline
// dropdown.
//
// Rendered by SelectedContent behind a matchMedia(MOBILE_BP) gate — the
// desktop Timeline and this never coexist in the DOM (no duplicated content).

import { useState } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import MaterialIcon from '../../../components/MaterialIcon'
import { useCrossShellNav } from '../../../components/CrossShellVeil'
import CasesSheet from './CasesSheet'

const RISE = { type: 'spring' as const, duration: 0.5, bounce: 0.18 }

// Mini stickers — small role-line marks (replace the desktop floating sticker).
function MiniSticker({ kind }: { kind: 'paper' | 'diamond' | 'star' }) {
  if (kind === 'paper') {
    // eslint-disable-next-line @next/next/no-img-element
    return <img className="mcase__mini mcase__mini--paper" src="/images/paper-roll.webp" alt="" />
  }
  if (kind === 'diamond') {
    return (
      <svg className="mcase__mini" width="15" height="17" viewBox="-3 -3 35 40" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M13.6464 1.26833e-05C14.3548-0.00191177 14.6984 0.21482 14.9981 0.88508C17.5457 6.581 21.8922 11.4428 26.7794 15.2513C28.6599 16.7161 28.3602 17.2699 26.6878 18.6067C22.6455 21.8376 18.7682 25.8285 16.2738 30.4001C15.7725 31.3177 15.0668 33.1459 14.3575 33.7261C14.2925 33.7369 14.2256 33.7464 14.1596 33.7546C13.5832 33.8254 13.3028 33.4115 13.0975 32.9453C10.7872 27.6901 6.99881 23.3985 2.76043 19.6029C2.02455 18.9441 0.107425 17.9394 0.00387143 16.9517C-0.110679 15.8627 2.34988 14.6728 2.99961 13.9281C6.25927 11.0425 9.15786 7.75474 11.4672 4.06244C12.2141 2.86827 12.785 0.974336 13.6464 1.26833e-05Z"
          fill="var(--orange-560)" stroke="#FFFFFF" strokeWidth="5" strokeLinejoin="round" paintOrder="stroke fill"
        />
      </svg>
    )
  }
  return (
    <svg className="mcase__mini" width="17" height="17" viewBox="0 0 100 100" aria-hidden="true" style={{ overflow: 'visible' }} xmlns="http://www.w3.org/2000/svg">
      <path d="M40 30L50 0L60 30L90 40L60 50L50 100L40 50L10 40L40 30Z" fill="var(--mint-720)" stroke="#FFFFFF" strokeWidth="9" strokeLinejoin="round" paintOrder="stroke fill" />
    </svg>
  )
}

interface CardProps {
  variant: 'blue' | 'terra' | 'mint'
  hero?: boolean
  year: string
  title: string
  body?: string
  role: string
  sticker: 'paper' | 'diamond' | 'star'
  href: string
  external?: boolean
}

function MobileCard({ variant, hero, year, title, body, role, sticker, href, external }: CardProps) {
  const inner = (
    <>
      <span className="mcase__year">{year}</span>
      <span className="mcase__title">{title}</span>
      {body && <span className="mcase__body">{body}</span>}
      <span className="mcase__divider" />
      <span className="mcase__footer">
        <span className="mcase__role-wrap">
          <span className="mcase__mini-slot"><MiniSticker kind={sticker} /></span>
          <span className="mcase__role t-h5">{role}</span>
        </span>
        <MaterialIcon name={external ? 'open_in_new' : 'arrow_forward'} className="mcase__arrow" />
      </span>
    </>
  )
  const cls = `mcase mcase--${variant}${hero ? ' mcase--hero' : ''}`
  return external ? (
    <a className={cls} href={href} target="_blank" rel="noopener noreferrer">{inner}</a>
  ) : (
    <Link className={cls} href={href}>{inner}</Link>
  )
}

export default function MobileCases() {
  const [sheetOpen, setSheetOpen] = useState(false)
  const onMarksClick = useCrossShellNav('/marks')

  return (
    <div className="cases-mobile">
      {/* Living "Now" cue — pulse dot + NOW · 2026 + fading hairline. The
          bench card above is the page's intro, so no display title here. */}
      <motion.div
        className="cases-mobile__now"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RISE, delay: 0.05 }}
      >
        <span className="cases-mobile__now-dot" aria-hidden="true" />
        <span className="cases-mobile__now-label">NOW · 2026</span>
        <span className="cases-mobile__now-rule" aria-hidden="true" />
      </motion.div>

      {/* Biconomy — hero */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RISE, delay: 0.16 }}
      >
        <MobileCard
          variant="blue"
          hero
          year="2023 — 2025"
          title="Designs to make the invisible infra: visible and usable"
          body="A UX audit, demos, a concept UI, and cultural interventions in a web3 ecosystem."
          role="Product Designer · Biconomy"
          sticker="paper"
          href="/biconomy"
        />
      </motion.div>

      {/* Nested label → Rug Rumble (indented, compact) */}
      <motion.div
        className="cases-mobile__nest"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RISE, delay: 0.26 }}
      >
        <MaterialIcon name="subdirectory_arrow_right" className="cases-mobile__nest-icon cases-mobile__nest-icon--terra" />
        <span className="cases-mobile__nest-label cases-mobile__nest-label--terra">A project during Biconomy</span>
      </motion.div>
      <motion.div
        className="cases-mobile__indent"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RISE, delay: 0.32 }}
      >
        <MobileCard
          variant="terra"
          year="Q4 · 2025"
          title="A 5-minute game, with a simple mechanic"
          role="Game Designer · Rug Rumble"
          sticker="diamond"
          href="/rr"
        />
      </motion.div>

      {/* Slangbusters — external (new top-level group, set apart from the
          Biconomy + Rug Rumble group above) */}
      <motion.div
        className="cases-mobile__slang"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RISE, delay: 0.44 }}
      >
        <MobileCard
          variant="mint"
          year="2018 — 2020"
          title="Building the conditions that let a creative studio do its best work"
          body="Studio rituals, hiring, and the operating system behind the work."
          role="Creative Director · Slangbusters"
          sticker="star"
          href="https://niharbhagat.com/work/slangbusters/"
          external
        />
      </motion.div>

      {/* Trigger → bottom sheet */}
      <motion.button
        type="button"
        className="cases-mobile__nest cases-mobile__trigger"
        onClick={() => setSheetOpen(true)}
        aria-haspopup="dialog"
        aria-expanded={sheetOpen}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RISE, delay: 0.54 }}
      >
        <MaterialIcon name="subdirectory_arrow_right" className="cases-mobile__nest-icon cases-mobile__nest-icon--mint" />
        <span className="cases-mobile__nest-label cases-mobile__nest-label--mint cases-mobile__trigger-label">3 projects during Slangbusters</span>
        <MaterialIcon name="arrow_outward" className="cases-mobile__trigger-out" />
      </motion.button>

      {/* Foot — Marks and Symbols Made, then Names Coined (§2a order) */}
      <motion.div
        className="cases-mobile__foot"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...RISE, delay: 0.62 }}
      >
        <a className="cases-mobile__foot-row" href="/marks" onClick={onMarksClick}>
          <MaterialIcon name="category" className="cases-mobile__foot-icon" />
          <span className="cases-mobile__foot-label">Marks and Symbols Made</span>
        </a>
        <button type="button" className="cases-mobile__foot-row">
          <MaterialIcon name="title" className="cases-mobile__foot-icon" />
          <span className="cases-mobile__foot-label">Names Coined</span>
          <span className="cases-mobile__foot-tag">W.I.P</span>
        </button>
      </motion.div>

      <CasesSheet open={sheetOpen} onClose={() => setSheetOpen(false)} />
    </div>
  )
}
