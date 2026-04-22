'use client'

// MarkCarousel — index-driven slide stage with tab-switch crossfade.
//
// Slide 1 is always the SVG mark; slides 2+ are Next <Image>s (or flipped
// placeholder marks) from MarkEntry.slides.
//
// Transition model: AnimatePresence mode="wait" + TAB_BODY_VARIANTS, the
// same pattern used by /rr Cards (cards | interface) and /biconomy Demos.
// Only the active slide is in the DOM at a time — Presence drives the
// exit (old slide) before the enter (new slide) so the crossfade reads as
// a tab switch rather than a pile of stacked layers.
//
// Media sizing: photographs and videos render at their natural aspect
// ratio (no crop). The figure sizes to the media and is capped by CSS
// (max-width / max-height). Each media slide gets a random ±1° tilt
// chosen on mount — a tiny "slipped out of a folder" tell that matches
// the editorial-credits register without being decorative.
//
// Preload: every non-mark slide's source is rendered into a hidden
// preloader once the section has entered the viewport, so advancing the
// carousel never waits on a network fetch. See `MarkSection` for the
// `hasEnteredViewport` flag that gates this.

import { AnimatePresence, motion } from 'framer-motion'
import { useMemo } from 'react'
import { Img } from '../../components/Img'
import type { MarkEntry } from '../data/marks'
import { marks } from './marks'
import { TAB_BODY_VARIANTS, TAB_BODY_TRANSITION } from '../../lib/motion'

interface MarkCarouselProps {
  mark:  MarkEntry
  index: number  // active slide index (0-based), driven by useShowcaseTimer.
  preload?: boolean  // once true, all media slides render into a hidden preloader.
}

function flipTransform(flip?: 'x' | 'y'): string | undefined {
  if (flip === 'x') return 'scaleX(-1)'
  if (flip === 'y') return 'scaleY(-1)'
  return undefined
}

export default function MarkCarousel({ mark, index, preload = false }: MarkCarouselProps) {
  const MarkGlyph = marks[mark.id]
  const slide = mark.slides[index]

  // One random ±1° tilt per slide, fixed for this mount. Reroll on next
  // visit (next /marks page load) — matches the `--place-rotate` pattern
  // from Sheet.tsx but scoped to individual carousel slides.
  const tilts = useMemo(
    () => mark.slides.map(() => (Math.random() < 0.5 ? -1 : 1)),
    [mark.id, mark.slides.length],
  )
  const tilt = tilts[index] ?? 0

  return (
    <div
      className="mark-carousel"
      data-active-slide={index}
      aria-roledescription="carousel"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={index}
          className={`mark-carousel__slide mark-carousel__slide--active${slide.kind === 'mark' ? ' mark-carousel__slide--blend' : ''}`}
          variants={TAB_BODY_VARIANTS}
          initial="enter"
          animate="active"
          exit="exit"
          transition={TAB_BODY_TRANSITION}
        >
          {slide.kind === 'mark' ? (
            <MarkGlyph
              className="mark-carousel__glyph"
              aria-label={mark.name}
              style={{ transform: flipTransform(slide.flip) }}
            />
          ) : slide.kind === 'video' ? (
            <figure
              className="mark-carousel__media"
              style={{ ['--artifact-tilt' as string]: `${tilt}deg` }}
            >
              <video
                src={slide.src}
                autoPlay
                muted
                loop
                playsInline
                aria-label={slide.caption}
              />
            </figure>
          ) : (
            <figure
              className="mark-carousel__media"
              style={{ ['--artifact-tilt' as string]: `${tilt}deg` }}
            >
              <Img
                src={slide.src}
                alt={slide.caption}
                intrinsic
                sizes="100vw"
              />
            </figure>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Hidden preloader. Once the section has entered the viewport, every
          non-mark slide's source is rendered here so the browser fetches
          them in parallel — advancing the carousel never waits on network. */}
      {preload && (
        <div className="mark-carousel__preloader" aria-hidden="true">
          {mark.slides.map((s, i) => {
            if (s.kind === 'mark' || i === index) return null
            if (s.kind === 'video') {
              return <video key={`pre-${i}`} src={s.src} muted playsInline preload="auto" />
            }
            return <Img key={`pre-${i}`} src={s.src} alt="" intrinsic />
          })}
        </div>
      )}
    </div>
  )
}
