'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, animate, useMotionValue, useTransform } from 'framer-motion'
import type { RoundOutcome } from './game/game-logic'
import { Scorecard } from './game/Scorecard'
import { Img } from '../../../components/Img'

interface StoryCardProps {
  results: RoundOutcome[]
  /** True once the mat split has essentially settled at the locked end position.
   *  Drives the one-shot dotted-path draw, which fires 500ms after this flips true. */
  splitSettled?: boolean
}

export default function StoryCard({ results, splitSettled = false }: StoryCardProps) {
  const [isStructure, setIsStructure] = useState(false)
  const isIdle = results.length === 0

  // Card ref — used for both position measurement and scroll tracking,
  // and for triggering the button-press pulse on tab toggle.
  const cardRef = useRef<HTMLDivElement>(null)
  const isFirstRenderRef = useRef(true)

  // Button-press feedback on every tab toggle. Adds an `is-pressing` class
  // that runs the shared `card-press` keyframe (globals.css) — the card
  // briefly scales down and springs back, the same tactile cue you'd get
  // from a physical button. The class auto-clears so the next toggle
  // replays. Skipped on first render so the card doesn't pulse on mount.
  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false
      return
    }
    const el = cardRef.current
    if (!el) return
    el.classList.add('is-pressing')
    // Match the animation's --dur-fast window (175ms) plus a small margin
    // so the class is gone by the time the next toggle queues.
    const t = window.setTimeout(() => el.classList.remove('is-pressing'), 220)
    return () => {
      window.clearTimeout(t)
      el.classList.remove('is-pressing')
    }
  }, [isStructure])

  const linkRef = useRef<HTMLSpanElement>(null)
  const northStarRef = useRef<HTMLDivElement>(null)
  const [pathPos, setPathPos] = useState({ top: 261, left: 93 })
  // dx/dy: offset from SVG origin (link bottom-center) to North Star top-center
  const [dotEnd, setDotEnd] = useState({ dx: 185, dy: 281 })
  // Width of "only test" — used so the same dotted run that travels to
  // North Star also acts as the underline of "only test". One unified line.
  const [linkWidth, setLinkWidth] = useState(48)

  // Measure after fonts are settled — avoids font-swap reflow misreads
  useEffect(() => {
    const measure = () => {
      const link = linkRef.current
      const card = cardRef.current
      const ns   = northStarRef.current
      if (!link || !card || !ns) return
      const lr = link.getBoundingClientRect()
      const cr = card.getBoundingClientRect()
      const nr = ns.getBoundingClientRect()
      // Divide by scale: getBoundingClientRect gives screen coords but CSS
      // top/left and SVG coords are in the card's local (pre-transform) space.
      const scaleX = card.offsetWidth > 0 ? cr.width / card.offsetWidth : 1
      const scaleY = card.offsetHeight > 0 ? cr.height / card.offsetHeight : 1
      // Origin sits a touch inside the LEFT edge of "only test" — under the
      // "o" of "only" rather than dead-flush with the text edge — so the
      // underline reads as anchored to the letterform, not to a margin. The
      // INSET pulls in equally on both ends; the descent then continues from
      // the right end of the underline ("t" of "test") down to North Star.
      const INSET = 6
      const originX = Math.round((lr.left - cr.left) / scaleX) + INSET
      // ~2px below the link's baseline so the dotted underline has breathing
      // room from the glyph descenders instead of overlapping them.
      const originY = Math.round((lr.bottom - cr.top) / scaleY + 2)
      setPathPos({ top: originY, left: originX })
      setDotEnd({
        dx: Math.round((nr.left + nr.width / 2 - cr.left) / scaleX - originX),
        dy: Math.round((nr.top - cr.top) / scaleY - originY),
      })
      setLinkWidth(Math.max(0, Math.round(lr.width / scaleX) - INSET * 2))
    }
    document.fonts.ready.then(measure)
    // Re-measure when card resizes (deck-fan img load shifts card height)
    const ro = new ResizeObserver(measure)
    if (cardRef.current) ro.observe(cardRef.current)
    return () => ro.disconnect()
  }, [])

  // One-shot path draw — fires shortly after the mat split has settled.
  // Uses a clipPath rect that grows from height 0 → 340 to reveal the dotted
  // path top-to-bottom, rather than scrolling the dot pattern (old dashoffset
  // approach). The path itself is always fully drawn; the clip controls visibility.
  const pathProgress = useMotionValue(0)
  // Fixed ceiling: NS is at ~282px below link, 350 clears it with room to spare
  const clipHeight = useTransform(pathProgress, [0, 1], [0, 350])
  // Once drawn, the path stays — never resets on scroll-back.
  const hasDrawn = useRef(false)

  useEffect(() => {
    if (!splitSettled) {
      // Only snap back if it was never drawn yet
      if (hasDrawn.current) return
      const controls = animate(pathProgress, 0, { duration: 0.25 })
      return () => controls.stop()
    }
    if (hasDrawn.current) return
    let controls: ReturnType<typeof animate> | null = null
    const t = setTimeout(() => {
      controls = animate(pathProgress, 1, {
        duration: 0.8,
        ease: 'easeOut',
        onComplete: () => { hasDrawn.current = true },
      })
    }, 200)
    return () => {
      clearTimeout(t)
      controls?.stop()
    }
  }, [splitSettled, pathProgress])

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
              // Dynamics (The actions a player takes)
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
              <li>Visual treatment → web3 memetic universe</li>
              <li>Overarching feeling: Bullishness / Winning / Pride</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Dotted line from "only test" to North Star top-center.
          Many small dots sampled along an S-curve cubic bezier (two bends)
          so the line reads as a hand-drawn trail rather than a straight run.
          SVG origin = link bottom-center (set via inline top/left).
          ClipPath rect grows top-to-bottom to reveal dots sequentially. */}
      <div
        className="rr-story-card__dotted-path"
        style={{ top: pathPos.top, left: pathPos.left }}
        aria-hidden="true"
      >
        {(() => {
          const { dx, dy } = dotEnd
          const W = linkWidth
          const TOTAL_DOTS = 32

          // Build arc-length samples for any parametric path. Returns the
          // raw samples plus total length — caller decides how many dots to
          // pull out, which lets us divide a fixed budget across segments
          // proportionally instead of letting each segment self-size.
          const sampleArc = (
            fn: (t: number) => { x: number; y: number },
            subdiv: number,
          ) => {
            const samples: { x: number; y: number; d: number }[] = []
            let total = 0
            let prev = fn(0)
            samples.push({ ...prev, d: 0 })
            for (let i = 1; i <= subdiv; i++) {
              const p = fn(i / subdiv)
              total += Math.hypot(p.x - prev.x, p.y - prev.y)
              samples.push({ x: p.x, y: p.y, d: total })
              prev = p
            }
            return { samples, total }
          }
          const dotsAlong = (
            samples: { x: number; y: number; d: number }[],
            total: number,
            count: number,
          ) => {
            const step = total / (count - 1)
            const out: { x: number; y: number }[] = []
            let si = 0
            for (let i = 0; i < count; i++) {
              const target = i * step
              while (si < samples.length - 1 && samples[si + 1].d < target) si++
              const a = samples[si]
              const b = samples[Math.min(si + 1, samples.length - 1)]
              const span = b.d - a.d || 1
              const f = (target - a.d) / span
              out.push({ x: a.x + (b.x - a.x) * f, y: a.y + (b.y - a.y) * f })
            }
            return out
          }

          // Underline — runs from under "o" of "only" through "t" of "test".
          // Slight sine wave so it reads as the same hand-drawn trail that
          // becomes the descent. Single oscillation across the link width.
          const underline = sampleArc(
            (t) => ({
              x: t * W,
              y: Math.sin(t * Math.PI) * 1.6,
            }),
            60,
          )

          // Descent — high-amplitude S-curve from the right end of the
          // underline to North Star. Bigger amp than the previous gentle
          // bend so it reads as a real squiggle.
          const ddx = dx - W
          const ddy = dy
          const amp = Math.max(80, Math.min(140, ddy * 0.32))
          const cp1x = W + ddx * 0.25 + amp
          const cp1y = ddy * 0.33
          const cp2x = W + ddx * 0.75 - amp
          const cp2y = ddy * 0.67
          const descent = sampleArc((t) => {
            const mt = 1 - t
            return {
              x: 3 * mt * mt * t * cp1x + 3 * mt * t * t * cp2x + t * t * t * dx + mt * mt * mt * W,
              y: 3 * mt * mt * t * cp1y + 3 * mt * t * t * cp2y + t * t * t * ddy,
            }
          }, 140)

          // Concatenate underline + descent into one arc-length parameterized
          // path (descent's distances offset by the underline's total length),
          // then sample TOTAL_DOTS evenly along it. This gives uniform spacing
          // across the whole trail — the underline gets whatever count its
          // length fairly earns, and there is no seam discontinuity.
          const combined: { x: number; y: number; d: number }[] = [
            ...underline.samples,
          ]
          for (let i = 1; i < descent.samples.length; i++) {
            const s = descent.samples[i]
            combined.push({ x: s.x, y: s.y, d: s.d + underline.total })
          }
          const totalLen = underline.total + descent.total
          const allDots = dotsAlong(combined, totalLen, TOTAL_DOTS)

          const pad = 40
          const vbX = -pad
          const vbY = -pad
          const vbW = dx + pad * 2
          const vbH = dy + pad * 2
          return (
            <motion.svg
              viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
              width={vbW}
              height={vbH}
              fill="none"
              overflow="visible"
              style={{ marginLeft: vbX, marginTop: vbY }}
            >
              <defs>
                <clipPath id="rr-dot-path-clip">
                  <motion.rect
                    x={vbX - 20}
                    y={vbY}
                    width={vbW + 40}
                    style={{ height: clipHeight }}
                  />
                </clipPath>
              </defs>
              {allDots.map((pt, i) => (
                <circle
                  key={i}
                  cx={pt.x}
                  cy={pt.y}
                  r={1.6}
                  fill="var(--yellow-800)"
                  clipPath="url(#rr-dot-path-clip)"
                />
              ))}
            </motion.svg>
          )
        })()}
      </div>

      {/* North Star (story view only) */}
      <div ref={northStarRef} className="rr-north-star-card rr-north-star-card--incoming" aria-label="North Star">
        <p className="rr-north-star-card__label">North Star</p>
        <p className="rr-north-star-card__text">
          A game that people can enjoy and want to come back to
        </p>
      </div>

      {/* Deck-fan overlay — sits half on / half off the bottom-left of the
          card. Transform is driven entirely by --rr-mech-progress (inherited
          from the stage), so it animates in lockstep with the mat split. */}
      <Img
        src="/images/rr/rr-hand-deck-fan.webp"
        alt=""
        aria-hidden="true"
        className="rr-story-card__deck-fan"
        draggable={false}
        intrinsic
        sizes="307px"
      />
    </div>
  )
}
