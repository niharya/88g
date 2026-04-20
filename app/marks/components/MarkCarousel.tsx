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

import { AnimatePresence, motion } from 'framer-motion'
import Image from 'next/image'
import type { MarkEntry } from '../data/marks'
import { marks } from './marks'
import { TAB_BODY_VARIANTS, TAB_BODY_TRANSITION } from '../../lib/motion'

interface MarkCarouselProps {
  mark:  MarkEntry
  index: number  // active slide index (0-based), driven by useShowcaseTimer.
}

function flipTransform(flip?: 'x' | 'y'): string | undefined {
  if (flip === 'x') return 'scaleX(-1)'
  if (flip === 'y') return 'scaleY(-1)'
  return undefined
}

export default function MarkCarousel({ mark, index }: MarkCarouselProps) {
  const MarkGlyph = marks[mark.id]
  const slide = mark.slides[index]

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
          ) : (
            <figure className="mark-carousel__media">
              <Image
                src={slide.src}
                alt={slide.caption}
                fill
                sizes="100vw"
                unoptimized={slide.kind === 'gif'}
              />
            </figure>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
