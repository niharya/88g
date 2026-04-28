'use client'

// Intro — principal surface for the UX Audit chapter
//
// Architecture:
//   intro section (position: relative, fits surface width)
//   ├── intro__memo-cards   (position: absolute, z: auto — tucked behind surface)
//   │   ├── memo-card: "What is it?"
//   │   ├── memo-card: "Who uses it?"
//   │   └── memo-card: "Frequency of use"  ← rests at --card-tilt when closed
//   └── motion.div intro__surface (z: 2 — covers memo cards in closed state)
//       ├── intro__inner (content + north star footer)
//       └── motion.button intro__toggle (docked to surface right edge)
//
// On toggle open: surface springs left x:'-50%' on desktop / '-60%' on mobile,
// revealing memo cards that were always there, tucked underneath. Toggle
// travels with the surface. Last memo card corrects its tilt as it's revealed.
// Mobile travel is tuned so the blue surface stays adjacent to the green memo
// cards rather than being thrown off-screen.

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { TAB_EASE } from '../../../lib/motion'
import IconHighlighter from './IconHighlighter'
import { ExpandToggle } from '../../../components/ExpandToggle'

export default function Intro() {
  const [open, setOpen] = useState(false)
  // Mobile travels slightly farther (−60%) so the surface sits adjacent to the
  // revealed memo cards rather than fully off-screen.
  // SSR default: false — matches the closed state's x:0 at hydration.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  const openX = isMobile ? '-60%' : '-50%'

  return (
    <section className="intro">

      {/* ── Memo cards + toggle: tucked behind surface ──────────── */}
      {/* No explicit z — behind intro__surface (z:10) in closed state         */}
      {/* Toggle is a fixed handle that pokes out from behind the surface      */}
      <div
        className={`intro__memo-cards${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        {/* ── Toggle: fixed handle, entrance spring only ────────── */}
        <motion.button
          className="intro__toggle t-h5"
          initial={{ x: '50%', rotate: -2 }}
          whileInView={{ x: '75%', rotate: 0 }}
          /* Hover squish lives in Framer (not CSS) so all transform writes
             stay in one interpolator — no CSS `transition: transform`
             tail at the end of the entrance. */
          whileHover={{ scaleX: 1.05, scaleY: 0.95 }}
          /* Per-property transitions — each property keeps the same
             timing in both directions:
              • x / rotate (entrance): --dur-glide on --ease-paper
              • scaleX / scaleY (hover in + out): --dur-instant on
                --ease-snap (TAB_EASE), tab/micro-tier per CLAUDE.md. */
          transition={{
            x:      { duration: 0.8, ease: [0.5, 0, 0.2, 1] },
            rotate: { duration: 0.8, ease: [0.5, 0, 0.2, 1] },
            scaleX: { duration: 0.1, ease: TAB_EASE },
            scaleY: { duration: 0.1, ease: TAB_EASE },
          }}
          viewport={{ once: true }}
          onClick={() => setOpen(s => !s)}
          aria-expanded={open}
          aria-label="Reveal context"
          type="button"
        >
          <IconHighlighter size={20} className={`intro__hl-icon${open ? ' is-active' : ''}`} />
          {/* Three dots — shift on open to signal state change */}
          <div className="intro__toggle-dots">
            <span className={`intro__dot${open ? ' is-top' : ''}`} />
            <span className={`intro__dot${open ? ' is-mid' : ''}`} />
            <span className={`intro__dot${open ? ' is-bot' : ''}`} />
          </div>
        </motion.button>

        {/* Card 1 — z:2 within container, sits on top of toggle */}
        <div className="intro__memo-card intro__memo-card--z2">
          <p className="intro__memo-label t-h5">What Is It?</p>
          <p className="intro__memo-body t-p3">
            A platform to manage smart contracts and gas tank balances with custom config.
          </p>
        </div>

        {/* Card 2 — tilts at -1deg in closed state, corrects on reveal */}
        <div className="intro__memo-card intro__memo-card--mid">
          <p className="intro__memo-label t-h5">Who Uses It?</p>
          <p className="intro__memo-body t-p3">
            All web3 blockchain devs, growth reps, early to mid stage founders
          </p>
        </div>

        {/* Card 3 — no tilt */}
        <div className="intro__memo-card">
          <p className="intro__memo-label t-h5">Frequency of Use</p>
          <p className="intro__memo-body t-p3">
            2 consecutive sessions<br />1–3 times / month
          </p>
        </div>
      </div>

      {/* ── Surface: springs left, reveals memo cards ───────────── */}
      {/* Also rotates -1deg and scales to 0.95 on open                       */}
      <motion.div
        className={`intro__surface surface${open ? '' : ' surface--shadowed'}`}
        animate={{ x: open ? openX : 0, rotate: open ? -1 : 0, scale: open ? 0.95 : 1 }}
        transition={{ type: 'spring', duration: 0.6, bounce: 0.15 }}
      >
        {/* Expand/collapse pill — mobile-only affordance. Ported from /rr
            Intro's `.rr-story-card__expand`: a single-icon rounded pill
            inset into the top-right of the card. Uses the shared
            ExpandToggle SVG (currentColor inherits `.intro-expand`'s blue
            tint) so all three call sites — landing, rr, biconomy — show
            the same hand-drawn-feel hooks. */}
        <button
          type="button"
          className="intro-expand"
          onClick={() => setOpen(s => !s)}
          aria-expanded={open}
          aria-label={open ? 'Hide context' : 'Reveal context'}
        >
          <ExpandToggle expanded={open} className="intro-expand__icon" />
        </button>

        {/* Inner card */}
        <div className={`intro__inner${open ? ' is-open' : ''}`}>

          {/* Copy block */}
          <div className="intro__copy">
            <h2 style={{ color: 'var(--blue-800)' }}>
              <span className="t-p4" style={{ display: 'flex' }}>
                Upon joining
              </span>
              <span className="sr-only">,</span>
              <span className="t-h2">
                my first tasks were to add new features to the{' '}
                <span style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                  <button
                    type="button"
                    className="text-marker intro__dashboard-trigger"
                    style={{ color: 'var(--blue-960)' }}
                    onClick={() => setOpen(s => !s)}
                    aria-expanded={open}
                    aria-label="Reveal context"
                  >
                    dashboard
                  </button>
                </span>
                {' '}and to restructure old ones.
              </span>
            </h2>
            <p className="t-p4 text-balance" style={{ color: 'var(--blue-800)' }}>
              Changes happened live and there was no testing or documentation process in place.
            </p>
          </div>

          <hr className="intro__divider" />

          {/* Context block */}
          <div className="intro__context">
            <p className="t-p4 text-balance">
              Over the next 18 months, cycling through 5 PMs, 3 FE devs, 2 BE devs,
              1 bear cycle, 1 bull cycle,{' '}
              <span style={{ color: 'var(--blue-800)' }}>
                the only constant source of truth was the Figma file.
              </span>
            </p>
            <p className="t-p4 text-balance">
              So to make this dashboard simple to use and expandable for development,{' '}
              <span style={{ color: 'var(--blue-800)' }}>I proposed a UX Audit.</span>
            </p>
          </div>

          {/* North Star footer — bleeds into inner padding */}
          <div className="intro__north-star t-p4">
            <span className="intro__north-star-label">
              <span className="t-h5">North Star</span>
              <span className="intro__north-star-line" />
            </span>
            <span style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Increase usability and user confidence</span>
            </span>
          </div>

        </div>{/* /intro__inner */}

      </motion.div>{/* /intro__surface */}

    </section>
  )
}
