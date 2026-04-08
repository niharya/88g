'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import type { RoundOutcome } from './game/game-logic'
import { Scorecard } from './game/Scorecard'

interface StoryCardProps {
  results: RoundOutcome[]
}

export default function StoryCard({ results }: StoryCardProps) {
  const [isStructure, setIsStructure] = useState(false)
  const isIdle = results.length === 0

  // Card ref — used for both position measurement and scroll tracking
  const cardRef = useRef<HTMLDivElement>(null)
  const linkRef = useRef<HTMLSpanElement>(null)
  const [pathPos, setPathPos] = useState({ top: 261, left: 93 })

  // Measure after fonts are settled — avoids font-swap reflow misreads
  useEffect(() => {
    const measure = () => {
      const link = linkRef.current
      const card = cardRef.current
      if (!link || !card) return
      const lr = link.getBoundingClientRect()
      const cr = card.getBoundingClientRect()
      setPathPos({
        top:  Math.round(lr.bottom - cr.top  - 3),
        left: Math.round(lr.left + lr.width / 2 - cr.left - 1),
      })
    }
    document.fonts.ready.then(measure)
  }, [])

  // Scroll-bound stroke — draws as the card scrolls into view
  const pathRef = useRef<SVGPathElement>(null)
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start 0.85', 'start 0.2'],
  })
  const strokeDashoffset = useTransform(scrollYProgress, [0, 1], [2000, 0])

  return (
    <div
      ref={cardRef}
      className={`rr-story-card rr-story-card--mechanics${
        isStructure ? ' rr-story-card--structure' : ''
      }`}
    >
      {/* Header strip: full-width skewer line + live egg scorecard */}
      <div className="rr-story-card__strip" aria-hidden="true">
        <div className="rr-story-card__strip-line" />
        <div className="rr-story-card__eggs">
          <Scorecard maxRounds={5} results={results} idle={isIdle} align="left" />
        </div>
      </div>

      {/* Two-slot toggle pill */}
      <button
        className="rr-switch-pill"
        type="button"
        aria-label={isStructure ? 'View story' : 'View game structure'}
        onClick={() => setIsStructure((v) => !v)}
      >
        <span className="rr-switch-pill__knob" aria-hidden="true" />
        <span className="rr-switch-pill__slot rr-switch-pill__slot--top">
          <span className="material-symbols-rounded rr-switch-pill__icon">info</span>
        </span>
        <span className="rr-switch-pill__slot rr-switch-pill__slot--bottom">
          <span className="material-symbols-rounded rr-switch-pill__icon">article</span>
        </span>
      </button>

      {/* Story view (default) */}
      <div className="rr-story-card__body">
        <p className="rr-story-card__text">
          Back in Bangalore, evolving this mechanic, we made and played with the first physical
          deck. We refined values, tested balance, and tweaked powers.
        </p>
        <p className="rr-story-card__text rr-story-card__text--ind1">
          Then we shipped printed decks to remote teammates across four cities so everyone could
          join the playtesting.
        </p>
        <p className="rr-story-card__text rr-story-card__text--ind2">
          We logged every match, noting not just balance issues but whether it passed the{' '}
          <span ref={linkRef} className="rr-story-card__text--link">only test</span>
        </p>
      </div>

      {/* Structure view */}
      <div className="rr-story-card__structure" aria-hidden={!isStructure}>
        <p className="rr-story-card__structure-title">Game Structure</p>
        <div className="rr-mono-sections">
          <div className="rr-mono-section">
            <p className="rr-mono-label rr-mono-label--mech">// Mechanics (The code)</p>
            <ul className="rr-mono-list">
              <li>3 types of cards: Attack, Defense, Special</li>
              <li>You can see 2 cards of your opponent</li>
              <li>Played card is discarded. Rest is shuffled back.</li>
              <li>Goes on for 5 rounds</li>
              <li>There&apos;s a wager for more involvement</li>
            </ul>
          </div>
          <div className="rr-mono-section">
            <p className="rr-mono-label rr-mono-label--dyn">
              \ Dynamics (The actions a player takes)
            </p>
            <ul className="rr-mono-list rr-mono-list--terra">
              <li className="rr-mono-item--bold">
                The player has to analyze their own cards against their opponents while keeping in
                mind early or late stage of the game.
              </li>
              <li>Low rule overhead (read: easy to understand)</li>
              <li>
                Two levels of randomness: shuffle before each round; player&apos;s choice of card
                in each round
              </li>
              <li>Time limit per round to keep the game under 5 min</li>
            </ul>
          </div>
          <div className="rr-mono-section">
            <p className="rr-mono-label rr-mono-label--mech">// Aesthetics (What the player feels)</p>
            <ul className="rr-mono-list">
              <li>Visual treatment → web3 mematic universe</li>
              <li>Overarching feeling: Bullishness / Winning / Pride</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dotted path — plain div for positioning, motion.svg for animation */}
      <div
        className="rr-story-card__dotted-path"
        style={{ top: pathPos.top, left: pathPos.left }}
        aria-hidden="true"
      >
        <motion.svg
          viewBox="0 0 160 320"
          width="160"
          height="320"
          fill="none"
          overflow="visible"
        >
          <motion.path
            ref={pathRef}
            d="M 2 0 C 20 80, 130 130, 110 210 C 90 275, 30 290, 47 315"
            stroke="var(--yellow-800)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeDasharray="0 8"
            style={{ strokeDashoffset }}
          />
        </motion.svg>
      </div>

      {/* North Star (story view only) */}
      <div className="rr-north-star-card rr-north-star-card--incoming" aria-label="North Star">
        <p className="rr-north-star-card__label">North Star</p>
        <p className="rr-north-star-card__text">
          A game that people can enjoy and want to come back to
        </p>
      </div>
    </div>
  )
}
