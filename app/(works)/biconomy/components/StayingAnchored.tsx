'use client'

// StayingAnchored — photostack below the "by year two..." lead.
//
// The grid layout was replaced with a single pile of 7 prints.
// Click the stack or the nav arrows and the top print cycles to the back —
// no motion on the swap ("tak-tak-tak"), just z-order. Random rotations
// (-4° to +4°) set once on mount so each visit has its own tilt.
//
// Photos follow the copy's arc: team & close friends (documentation era) →
// a literal bridge → outward travel & feasts (the events and conversations
// block). Stacked rather than gridded so the reader sits with one image at
// a time, the way the memory surfaces.
//
// No entrance animation, no exit animation, no transitions on rotate. The
// whole point is the instant snap of flipping through a physical stack.

import { useEffect, useState } from 'react'
import NavPill from './NavPill'
import { Img } from '../../../components/Img'
import Sticker from '../../../components/Sticker'

type Photo = { src: string; alt: string }

const PHOTOS: Photo[] = [
  { src: '/images/biconomy/sa/design-team-bico.webp',    alt: 'The Biconomy design team.' },
  { src: '/images/biconomy/sa/gang.jpg',                alt: 'The broader Biconomy gang.' },
  { src: '/images/biconomy/sa/flor-and-me.jpg',         alt: 'Flor and me.' },
  { src: '/images/biconomy/sa/georgios-and-me.jpg',     alt: 'Georgios and me.' },
  { src: '/images/biconomy/sa/flor-azaan-football.webp', alt: 'Flor, Azaan, and me at football.' },
  { src: '/images/biconomy/sa/building-a-bridge.jpg',   alt: 'Building a bridge.' },
  { src: '/images/biconomy/sa/kalyug-ka-bazaar.webp',    alt: 'Kalyug ka Bazaar.' },
  { src: '/images/biconomy/sa/scooters-in-baku.webp',    alt: 'Scooters in Baku.' },
  { src: '/images/biconomy/sa/feast-in-bali.webp',       alt: 'A feast in Bali.' },
  { src: '/images/biconomy/sa/breakfast.jpg',           alt: 'Breakfast.' },
]

export default function StayingAnchored() {
  const [topIdx, setTopIdx] = useState(0)
  // Seed rotations once on mount (client-only, avoids hydration mismatch).
  // Rotations stay put through the whole session — only a page reload
  // reshuffles them. Cycling through the pile should not jostle the tilts.
  const [rotations, setRotations] = useState<number[]>(() => PHOTOS.map(() => 0))
  const [pressing, setPressing] = useState(false)

  useEffect(() => {
    setRotations(PHOTOS.map(() => Math.random() * 8 - 4))
  }, [])

  const next = () => setTopIdx((i) => (i + 1) % PHOTOS.length)
  const prev = () => setTopIdx((i) => (i - 1 + PHOTOS.length) % PHOTOS.length)

  // Tactile press on stack click — shared `card-press` keyframe (globals.css).
  // State-driven so React's re-render after `next()` doesn't wipe the class
  // back off. Photos themselves still snap-swap with no transition; the
  // press is on the button (the parent), preserving the documented
  // "tak-tak" interaction on the photos.
  const handleStackClick = () => {
    next()
    setPressing(false)
    requestAnimationFrame(() => setPressing(true))
    window.setTimeout(() => setPressing(false), 220)
  }

  return (
    <div className="sa">
      <h2 className="sa__lead t-h1">
        By year two, almost everyone I&apos;d started with had left.
      </h2>

      <div className="sa__stack-area">
        <button
          type="button"
          className={`sa__stack${pressing ? ' is-pressing' : ''}`}
          onClick={handleStackClick}
          aria-label="Advance photo stack"
        >
          {PHOTOS.map((p, i) => {
            // Distance from top in the cycle; higher = closer to top visually.
            const distance = (i - topIdx + PHOTOS.length) % PHOTOS.length
            const z = PHOTOS.length - distance
            return (
              <div
                key={p.src}
                className="sa__photo"
                style={{ rotate: `${rotations[i]}deg`, zIndex: z }}
              >
                <Img
                  src={p.src}
                  alt={p.alt}
                  className="sa__photo-img"
                  placeholder="hash"
                  intrinsic
                  draggable={false}
                  sizes="400px"
                />
              </div>
            )
          })}
        </button>
        <NavPill
          onPrev={prev}
          onNext={next}
          prevLabel="Previous photo"
          nextLabel="Next photo"
        />
      </div>

      <div className="sa__prose">
        <p className="t-h1">
          To stay centered, I kept my own documentation: decision logs, PM
          notes, founder goals, working styles. It became the best way to keep
          the threads connected.
        </p>
        <p className="t-h1">
          Outside the company, I tracked what was happening in web3, read the
          EIPs that mattered and translated the useful ones into features.
          <br /><br />
          Also, attended a few events and befriended some blockchain devs. The
          conversations with them informed some of the decisions on navigation
          and flow.
        </p>
      </div>

      {/* ── Trailing notes USB sticker — closing artifact ───────────────── */}
      <div className="sa__trailing">
        <Sticker tilt={-2} className="sa__trailing-sticker">
          <Img
            src="/images/biconomy/sa/notes.webp"
            alt=""
            width={184}
            height={99}
            draggable={false}
            intrinsic
            placeholder="none"
          />
        </Sticker>
      </div>
    </div>
  )
}
