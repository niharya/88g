'use client'

import { useEffect, useState } from 'react'
import { Img } from '../../../../../components/Img'

// PosterStack — four comedy posters in a deck, randomized per page load.
//
// Interactivity gated on the parent tile's `active` prop:
//   - inactive: clicks pass through (open the spec note via the tile)
//   - active:   click cycles the front poster to the back (paper deck
//                rotation, mirrors the biconomy API stack motion)
//
// When inactive, `pointer-events: none` on the wrap lets clicks reach
// the parent tile so the spec note opens.

// Each poster carries its own aspect ratio so the deck visibly mixes
// formats — three A-series print posters (~0.707) plus one IG-story
// vertical (gong, 0.5625). Read by `.sc-poster` via the `--poster-
// aspect` CSS var set inline (see showcase.css).
type Poster = { src: string; alt: string; border: string; aspect: number }

// Border colours tinted from each poster's content accent (not the raw
// dominant pixel, which was near-white for two of three and invisible
// against the workbench). cutting-2 already carries its own printed red
// rule around the artwork, so its faux border is set to `transparent`
// to avoid stacking two outlines. gong is on a saturated orange ground
// — a neutral grey-800 hairline reads cleanest against the workbench.
const POSTERS: Poster[] = [
  { src: '/images/posters/falah-faisal.webp', alt: 'Comedy poster — Falah Faisal',     border: '#b8453a',     aspect: 1357 / 1920 },
  { src: '/images/posters/cutting-1.webp',    alt: 'Comedy poster — Cutting Comedy',   border: '#3a7a4a',     aspect: 1190 / 1684 },
  { src: '/images/posters/cutting-2.webp',    alt: 'Comedy poster — Cutting 2',        border: 'transparent', aspect: 1080 / 1528 },
  { src: '/images/posters/gong.webp',         alt: 'Comedy poster — The Gong Show',    border: '#4a2a1a',     aspect: 1080 / 1920 },
]

// Fisher-Yates — returns a NEW shuffled array; doesn't mutate POSTERS.
function shuffle<T>(arr: readonly T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

export default function PosterStack({ active = false }: { active?: boolean }) {
  // Server / first-paint sees POSTERS in authored order — keeps SSR
  // hydration stable. useEffect after mount swaps in a freshly shuffled
  // deck, so each page load shows a different front poster while the
  // cycle interaction stays intact (advance walks the new order).
  const [deck, setDeck] = useState<Poster[]>(POSTERS)
  useEffect(() => {
    setDeck(shuffle(POSTERS))
  }, [])

  const TOTAL = deck.length
  const [offset, setOffset] = useState(0)

  // Reset deck order when the tile loses focus.
  useEffect(() => {
    if (!active) setOffset(0)
  }, [active])

  const advance = (e: React.MouseEvent | React.KeyboardEvent) => {
    if (!active) return // inactive: bubble up to the tile
    e.stopPropagation()
    setOffset((o) => (o + 1) % TOTAL)
  }

  return (
    <div
      className={`sc-poster-stack${active ? ' is-active' : ''}`}
      role={active ? 'button' : undefined}
      tabIndex={active ? 0 : -1}
      aria-label={active ? 'Poster series — click to cycle' : 'Comedy poster series'}
      onClick={advance}
      onKeyDown={(e) => {
        if ((e.key === 'Enter' || e.key === ' ') && active) {
          e.preventDefault()
          advance(e)
        }
      }}
      // Inactive: clicks fall through to the parent tile so the spec note
      // opens. Active: this wrap captures clicks for the carousel.
      style={!active ? { pointerEvents: 'none' } : undefined}
    >
      {deck.map((p, i) => {
        const slot = ((i - offset + TOTAL) % TOTAL) + 1
        return (
          <div
            key={p.src}
            className={`sc-poster sc-poster--slot-${slot}`}
            style={{
              zIndex: TOTAL - slot + 1,
              borderColor: p.border,
              // Per-poster aspect ratio — consumed by `.sc-poster`'s
              // `aspect-ratio: var(--poster-aspect)`. Lets the three
              // print posters and the gong IG-story sit at their true
              // shapes inside the same fanned stack.
              ['--poster-aspect' as string]: String(p.aspect),
            }}
          >
            <Img
              src={p.src}
              alt={p.alt}
              fill
              sizes="(max-width: 767px) 60vw, 22vw"
            />
          </div>
        )
      })}
    </div>
  )
}
