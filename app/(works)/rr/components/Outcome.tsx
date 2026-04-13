'use client'

// Outcome — Section 4 of /rr
//
// Architecture:
//   #outcome.mat              — overflow: clip; bg dims via CSS :has()
//   └── rr-canvas--outcome    — 1440×900 composition area
//       ├── rr-outcome-card   — scroll-linked: sweeps in from left with rotation
//       ├── rr-outcome-quote  — scroll-linked: sweeps in from left (slightly delayed)
//       └── rr-rules-group    — scroll-linked entrance (mirrors card from right),
//                                then FM spring for expand/collapse
//           ├── rr-rules-label   — "Rules of the game" header
//           ├── rr-rules-inner   — motion.div scales the 6-card grid
//           └── rr-rules-close   — close button (AnimatePresence)
//
// Scroll entrance: useScroll on the outcome .mat section maps scroll progress
//   to x, rotate, opacity. Fully reversible — scroll up and they part away.
// Expand: spring translates group to canvas centre, scales panel 0.82 → 0.8.
//         Mat bg dims via CSS :has([data-rules-expanded]).
// Collapse: close button, click anywhere outside group, or Escape.

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion, AnimatePresence, useMotionValue, useScroll, useSpring, useTransform, useInView } from 'framer-motion'

/* ── SVG icons ── */

const HeartIcon = ({ w = 16, h = 14 }: { w?: number; h?: number }) => (
  <svg width={w} height={h} viewBox="0 0 18 16" fill="none">
    <path d="M9 15S1 9.5 1 4.5A4 4 0 0 1 9 2.9 4 4 0 0 1 17 4.5C17 9.5 9 15 9 15Z" fill="#ff7564" />
  </svg>
)

const ShieldIcon = () => (
  <svg width={16} height={19} viewBox="0 0 16 19" fill="none">
    <path d="M8 1L1 4v5c0 4 3.1 7.7 7 8.9C11.9 16.7 15 13 15 9V4L8 1Z" fill="none" stroke="#6478ff" strokeWidth="1.5" />
  </svg>
)

/* ── Animated counter ── */

function AnimatedNumber({ to, suffix = '' }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-50px' })
  const motionVal = useMotionValue(0)
  const springVal = useSpring(motionVal, { stiffness: 60, damping: 20, mass: 1 })
  const display = useTransform(springVal, (v) => `${Math.round(v)}${suffix}`)

  useEffect(() => {
    if (inView) motionVal.set(to)
  }, [inView, motionVal, to])

  return <motion.span ref={ref}>{display}</motion.span>
}

/* ── Expand/collapse config ── */

const spring = { type: 'spring' as const, stiffness: 170, damping: 26, mass: 1 }

const GROUP_COLLAPSED = { x: 0, y: 0 }
const GROUP_EXPANDED  = { x: -612, y: 35 }

const PANEL_COLLAPSED = { scale: 0.82 }
const PANEL_EXPANDED  = { scale: 0.8 }

/* ── Component ── */

export default function Outcome() {
  const [expanded, setExpanded] = useState(false)
  const groupRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement | null>(null)
  const canvasRef = useRef<HTMLDivElement>(null)

  // Grab the parent .mat section for useScroll target (canvas is inside it)
  useEffect(() => {
    if (canvasRef.current) {
      sectionRef.current = canvasRef.current.closest('.mat') as HTMLElement
    }
  }, [])

  // Scroll progress: 0 = section just entering bottom of viewport, 1 = top of section at top of viewport
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })

  // Spring config: high stiffness keeps it tight to scroll, low damping adds subtle settle
  const scrollSpring = { stiffness: 400, damping: 30, mass: 0.3 }

  // ── Card (left): sweep in from left with rotation ──
  const cardXRaw       = useTransform(scrollYProgress, [0.4, 0.85], [-120, 0])
  const cardRotateRaw  = useTransform(scrollYProgress, [0.4, 0.85], [-1.5, 0])
  const cardOpacityRaw = useTransform(scrollYProgress, [0.4, 0.8], [0, 1])
  const cardX       = useSpring(cardXRaw, scrollSpring)
  const cardRotate  = useSpring(cardRotateRaw, scrollSpring)
  const cardOpacity = useSpring(cardOpacityRaw, scrollSpring)

  // ── Quote (bottom left): sweep in from left, slightly behind card ──
  const quoteXRaw       = useTransform(scrollYProgress, [0.45, 0.9], [-80, 0])
  const quoteOpacityRaw = useTransform(scrollYProgress, [0.45, 0.85], [0, 1])
  const quoteX       = useSpring(quoteXRaw, scrollSpring)
  const quoteOpacity = useSpring(quoteOpacityRaw, scrollSpring)

  // ── Rules group (right): mirror of card — sweep in from right with rotation ──
  const rulesXRaw       = useTransform(scrollYProgress, [0.4, 0.85], [120, 0])
  const rulesRotateRaw  = useTransform(scrollYProgress, [0.4, 0.85], [1.5, 0])
  const rulesOpacityRaw = useTransform(scrollYProgress, [0.4, 0.8], [0, 1])
  const rulesX       = useSpring(rulesXRaw, scrollSpring)
  const rulesRotate  = useSpring(rulesRotateRaw, scrollSpring)
  const rulesOpacity = useSpring(rulesOpacityRaw, scrollSpring)

  const collapse = useCallback(() => setExpanded(false), [])

  // Escape key
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') collapse() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded, collapse])

  // Click outside group → collapse
  useEffect(() => {
    if (!expanded) return
    const onClickOutside = (e: MouseEvent) => {
      if (groupRef.current && !groupRef.current.contains(e.target as Node)) {
        collapse()
      }
    }
    const id = requestAnimationFrame(() => {
      document.addEventListener('mousedown', onClickOutside, true)
      document.addEventListener('click', onClickOutside, true)
    })
    return () => {
      cancelAnimationFrame(id)
      document.removeEventListener('mousedown', onClickOutside, true)
      document.removeEventListener('click', onClickOutside, true)
    }
  }, [expanded, collapse])

  return (
    <div
      ref={canvasRef}
      className="rr-canvas rr-canvas--outcome"
      data-rules-expanded={expanded || undefined}
    >

      {/* ── Left: Outcome card ── */}
      <motion.div
        className="rr-outcome-card"
        style={{ x: cardX, rotate: cardRotate, opacity: cardOpacity }}
      >
        <div className="rr-outcome-card__inner">
          <p className="rr-outcome-card__text">The final game launched with instant traction. Low rule overhead, quick matches, and meme energy made it an easy pick-up.</p>
          <hr className="rr-outcome-card__divider" />
          <div className="rr-outcome-stats">
            <div className="rr-outcome-stat">
              <span className="rr-outcome-stat__num"><AnimatedNumber to={3} /></span>
              <span className="rr-outcome-stat__label">Months</span>
            </div>
            <div className="rr-outcome-stat">
              <span className="rr-outcome-stat__num"><AnimatedNumber to={14} suffix="K" /></span>
              <span className="rr-outcome-stat__label">Testnet{'\n'}Users</span>
            </div>
            <div className="rr-outcome-stat">
              <span className="rr-outcome-stat__num"><AnimatedNumber to={50} suffix="K" /></span>
              <span className="rr-outcome-stat__label">Games{'\n'}Played</span>
            </div>
          </div>
          <hr className="rr-outcome-card__divider" />
          <p className="rr-outcome-card__text">The adoption was so strong that the two people leading the project left the company to form a startup with Rug Rumble.</p>
        </div>
      </motion.div>

      {/* ── Bottom left: closing quote ── */}
      <motion.div
        className="rr-outcome-quote"
        style={{ x: quoteX, opacity: quoteOpacity }}
      >
        <div className="rr-outcome-quote__icon" aria-hidden="true">
          <img src="/images/rr/rr-quote-icon.svg" alt="" width={48} height={48} />
        </div>
        <p className="rr-outcome-quote__text">What started as a laugh in Baku became a live product with thousands of players, a proof that a simple, well-balanced mechanic can travel far.</p>
      </motion.div>

      {/* ── Rules group (label + panel) ── */}
      <motion.div
        className="rr-rules-group"
        ref={groupRef}
        style={
          expanded
            ? undefined
            : { x: rulesX, rotate: rulesRotate, opacity: rulesOpacity }
        }
        animate={expanded ? GROUP_EXPANDED : GROUP_COLLAPSED}
        transition={spring}
      >

        {/* Label — docked above panel */}
        <div className="rr-rules-label">
          <span className="rr-rules-label__text">Rules of the game</span>
          <span className="rr-rules-label__note">(Appears at the start of the first few matches and is always available as a toggle within the game)</span>
        </div>

        {/* Rules panel */}
        <motion.div
          className="rr-rules-inner"
          style={{ transformOrigin: 'top left' }}
          animate={expanded ? PANEL_EXPANDED : PANEL_COLLAPSED}
          whileHover={expanded ? {} : { scale: 0.824, boxShadow: '0 0 14px 4px rgba(19,215,245,0.35)' }}
          transition={spring}
          role="button"
          tabIndex={0}
          aria-label="View rules full screen"
          onClick={() => { if (!expanded) setExpanded(true) }}
          onKeyDown={(e) => { if (!expanded && (e.key === 'Enter' || e.key === ' ')) setExpanded(true) }}
        >

          {/* 1. Basics */}
          <div className="rr-rule-card rr-rule-card--basics">
            <div className="rr-rule-card__head">
              <h3 className="rr-rule-card__title">1. Basics</h3>
              <div className="rr-rule-card__divider" />
            </div>
            <div className="rr-rule-basics-top">
              <p className="rr-rule-basics-desc"><strong>Rug Rumble</strong> is a fast-paced card game for 2 players, played with 7 cards per deck over 5 rounds.</p>
              <div className="rr-rule-basics-divider" />
              <div className="rr-rule-stat-group">
                <div className="rr-rule-stat"><span className="rr-rule-stat__label">Players</span><span className="rr-rule-stat__val"><AnimatedNumber to={2} /></span></div>
                <div className="rr-rule-basics-divider" />
                <div className="rr-rule-stat"><span className="rr-rule-stat__label">Cards</span><span className="rr-rule-stat__val"><AnimatedNumber to={7} /></span></div>
                <div className="rr-rule-basics-divider" />
                <div className="rr-rule-stat"><span className="rr-rule-stat__label">Rounds</span><span className="rr-rule-stat__val"><AnimatedNumber to={5} /></span></div>
              </div>
            </div>
            <div className="rr-rule-basics-bottom">
              <div className="rr-rule-energy-block">
                <div className="rr-rule-energy-badge">
                  <span className="rr-rule-energy-badge__num"><AnimatedNumber to={12} /></span>
                  <span className="rr-rule-energy-badge__icon">⚡</span>
                </div>
                <p className="rr-rule-energy-text">Each card costs 1 to 4 Energy. You get 12 per match. <em>Use it wisely.</em></p>
              </div>
              <div className="rr-rule-vitals">
                <div className="rr-rule-vital rr-rule-vital--health">
                  <div className="rr-rule-vital__badge">
                    <span className="rr-rule-vital__num"><AnimatedNumber to={100} /></span>
                    <HeartIcon w={18} h={16} />
                  </div>
                  <p>This is your health<br /><span className="rr-rule-vital__max">Max: 100</span></p>
                </div>
                <div className="rr-rule-vital rr-rule-vital--shield">
                  <div className="rr-rule-vital__badge">
                    <span className="rr-rule-vital__num"><AnimatedNumber to={34} /></span>
                    <ShieldIcon />
                  </div>
                  <p>This is your shield</p>
                </div>
              </div>
            </div>
          </div>

          {/* 2. Gameplay */}
          <div className="rr-rule-card rr-rule-card--gameplay">
            <div className="rr-rule-card__head">
              <h3 className="rr-rule-card__title">2. Gameplay</h3>
              <div className="rr-rule-card__divider" />
            </div>
            <div className="rr-rule-gameplay-steps">
              <div className="rr-rule-step">
                <div className="rr-rule-step__content">
                  <div className="rr-rule-step__header">
                    <div className="rr-rule-step__num">1</div>
                    <h4 className="rr-rule-step__title">Reveal Cards</h4>
                  </div>
                  <p className="rr-rule-step__desc">At the start of each round, 2 random cards from each player&apos;s deck are revealed to both players.</p>
                </div>
                <div className="rr-rule-step__diagram">
                  <div className="rr-rule-mini-cards">
                    <div className="rr-mini-row">
                      <div className="rr-mini-card rr-mini-card--down" />
                      <div className="rr-mini-card rr-mini-card--down" />
                    </div>
                    <span className="rr-mini-label rr-mini-label--top">↑ Not Your Cards</span>
                    <span className="rr-mini-label rr-mini-label--bot">↓ Your Cards</span>
                    <div className="rr-mini-row">
                      <div className="rr-mini-card rr-mini-card--down-you" />
                      <div className="rr-mini-card rr-mini-card--down-you" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rr-rule-step">
                <div className="rr-rule-step__content">
                  <div className="rr-rule-step__header">
                    <div className="rr-rule-step__num">2</div>
                    <h4 className="rr-rule-step__title">Choose a Card</h4>
                  </div>
                  <p className="rr-rule-step__desc">Each player picks one card to play. The unchosen card goes back to the draw pile and is shuffled.</p>
                </div>
                <div className="rr-rule-step__diagram">
                  <div className="rr-rule-mini-cards">
                    <div className="rr-mini-row">
                      <div className="rr-mini-card rr-mini-card--up" />
                      <div className="rr-mini-card rr-mini-card--down" />
                    </div>
                    <span className="rr-mini-label rr-mini-label--top">↑ Not Your Cards</span>
                    <span className="rr-mini-label rr-mini-label--bot">↓ Your Cards</span>
                    <div className="rr-mini-row">
                      <div className="rr-mini-card rr-mini-card--down-you" />
                      <div className="rr-mini-card rr-mini-card--up-you" />
                    </div>
                  </div>
                </div>
              </div>
              <div className="rr-rule-step">
                <div className="rr-rule-step__content">
                  <div className="rr-rule-step__header">
                    <div className="rr-rule-step__num">3</div>
                    <h4 className="rr-rule-step__title">Lock in Choices</h4>
                  </div>
                  <p className="rr-rule-step__desc">Both cards are revealed, and their effects are resolved simultaneously.</p>
                </div>
                <div className="rr-rule-step__diagram">
                  <div className="rr-rule-mini-cards">
                    <div className="rr-mini-row">
                      <div className="rr-mini-card rr-mini-card--up" />
                    </div>
                    <span className="rr-mini-label rr-mini-label--top">↑ Not Your Cards</span>
                    <span className="rr-mini-label rr-mini-label--bot">↓ Your Cards</span>
                    <div className="rr-mini-row">
                      <div className="rr-mini-card rr-mini-card--up-you" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* How to Rumble label card */}
          <div className="rr-rule-card rr-rule-card--howto">
            <h3 className="rr-rule-howto__title">How to Rumble</h3>
          </div>

          {/* 3. Card Types */}
          <div className="rr-rule-card rr-rule-card--types">
            <div className="rr-rule-card__head">
              <h3 className="rr-rule-card__title">3. Card Types</h3>
              <div className="rr-rule-card__divider" />
            </div>
            <div className="rr-rule-types-grid">
              <div className="rr-rule-types-left">
                <div className="rr-rule-type-badge rr-rule-type-badge--special">Reflects 50% Damage</div>
                <div className="rr-rule-type-badge rr-rule-type-badge--defense"><span className="rr-type-num">34</span> Defense</div>
                <div className="rr-rule-type-badge rr-rule-type-badge--heal"><span className="rr-type-num">56</span> Heal</div>
                <div className="rr-rule-type-badge rr-rule-type-badge--attack"><span className="rr-type-num">12</span> Attack</div>
              </div>
              <div className="rr-rule-types-right">
                <div className="rr-rule-type-row"><span className="rr-rule-type-dot rr-rule-type-dot--special" /><span className="rr-rule-type-desc">Apply special effects (e.g., disable shields, flip opponent&apos;s card)</span></div>
                <div className="rr-rule-type-row"><span className="rr-rule-type-dot rr-rule-type-dot--defense" /><span className="rr-rule-type-desc">Block attacks by adding a shield</span></div>
                <div className="rr-rule-type-row"><span className="rr-rule-type-dot rr-rule-type-dot--heal" /><span className="rr-rule-type-desc">Restore your own health</span></div>
                <div className="rr-rule-type-row"><span className="rr-rule-type-dot rr-rule-type-dot--attack" /><span className="rr-rule-type-desc">Deal damage to your opponent&apos;s health</span></div>
              </div>
            </div>
          </div>

          {/* 4. Resolving the Round */}
          <div className="rr-rule-card rr-rule-card--resolving">
            <div className="rr-rule-resolving-top">
              <div className="rr-rule-resolving-top-content">
                <h3 className="rr-rule-card__title" style={{ margin: 0 }}>4. Resolving the Round</h3>
                <div className="rr-rule-card__divider" />
                <p className="rr-rule-resolving-intro">Card effects are resolved in the following order</p>
              </div>
              <div className="rr-rule-resolving-icon">
                <img src="/images/rr/rr-resolving-icon.png" alt="" />
              </div>
            </div>
            <div className="rr-rule-resolving-bottom">
              <div className="rr-rule-order">
                <span className="rr-rule-order-item rr-order--power"><span className="rr-order-label">Power</span><span className="rr-order-arrow-box">→</span></span>
                <span className="rr-rule-order-item rr-order--defense"><span className="rr-order-label">Defense</span><span className="rr-order-arrow-box">→</span></span>
                <span className="rr-rule-order-item rr-order--heal"><span className="rr-order-label">Heal</span><span className="rr-order-arrow-box">→</span></span>
                <span className="rr-rule-order-item rr-order--attack"><span className="rr-order-label">Attack</span><span className="rr-order-check-box">✓</span></span>
              </div>
              <p className="rr-rule-resolving-note">Defense shields are applied before any damage is calculated</p>
            </div>
          </div>

          {/* 5. Winning the Match */}
          <div className="rr-rule-card rr-rule-card--winning">
            <div className="rr-rule-card__head">
              <h3 className="rr-rule-card__title">5. Winning the Match</h3>
              <div className="rr-rule-card__divider" />
            </div>
            <p className="rr-rule-winning-intro">Both players start with 100 health. The match ends when...</p>
            <div className="rr-rule-winning-scenarios">
              <div className="rr-rule-scenario">
                <span className="rr-rule-scenario__when">At any time</span>
                <div className="rr-rule-scenario__div" />
                <div className="rr-rule-hp-display">
                  <span className="rr-rule-hp-num"><AnimatedNumber to={0} /></span>
                  <HeartIcon />
                </div>
                <p className="rr-rule-scenario__text">A player&apos;s health drops to zero</p>
              </div>
              <div className="rr-rule-scenario">
                <span className="rr-rule-scenario__when">After the final round</span>
                <div className="rr-rule-scenario__div" />
                <div className="rr-rule-hp-row">
                  <div className="rr-rule-hp-display rr-rule-hp-display--loser">
                    <span className="rr-rule-hp-num"><AnimatedNumber to={27} /></span>
                    <HeartIcon />
                  </div>
                  <div className="rr-rule-hp-display rr-rule-hp-display--winner">
                    <span className="rr-rule-hp-num"><AnimatedNumber to={35} /></span>
                    <HeartIcon />
                  </div>
                </div>
                <p className="rr-rule-scenario__text">The player with the higher health wins</p>
              </div>
            </div>
            <div className="rr-rule-card__divider" style={{ marginTop: 'auto' }} />
            <p className="rr-rule-tiebreaker">Tiebreakers: Defense and remaining energy act as tiebreakers if health is tied.</p>
          </div>

        </motion.div>{/* rr-rules-inner */}

        {/* Close button — positioned to the right of the panel, not on it */}
        <AnimatePresence>
          {expanded && (
            <motion.button
              key="close"
              className="rr-rules-close"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              aria-label="Close rules"
              onClick={collapse}
            >
              ×
            </motion.button>
          )}
        </AnimatePresence>

      </motion.div>{/* rr-rules-group */}

    </div>
  )
}
