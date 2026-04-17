'use client'

// MarkCarousel — horizontal translateX track, index-driven.
//
// Slide 1 is always the SVG mark (rendered via the route-local marks barrel).
// Slides 2+ are Next <Image>s driven by the MarkEntry.slides list, OR
// additional placeholder 'mark' slides with a `flip` set (scaleX/Y(-1)) so
// the carousel has real content to tick through before production media
// lands.
//
// The mark sits at editorial scale, centered, with `mix-blend-mode: overlay`
// so the gradient reads through the glyph and the ink picks up the palette.
// Horizontal trackpad/wheel advance + 40px touch threshold land in a later
// chunk alongside the showcase timer's interaction-pause wiring.

import Image from 'next/image'
import type { MarkEntry } from '../data/marks'
import { marks } from './marks'

interface MarkCarouselProps {
  mark:  MarkEntry
  index: number  // active slide index (0-based), driven by useShowcaseTimer.
}

// Map MarkSlide.flip to the inline transform applied on the glyph. Inline
// style keeps the MarkComponent pure (no wrapper div) while still stacking
// cleanly with the existing `mix-blend-mode: overlay` from marks.css.
function flipTransform(flip?: 'x' | 'y'): string | undefined {
  if (flip === 'x') return 'scaleX(-1)'
  if (flip === 'y') return 'scaleY(-1)'
  return undefined
}

export default function MarkCarousel({ mark, index }: MarkCarouselProps) {
  const MarkGlyph = marks[mark.id]

  return (
    <div
      className="mark-carousel"
      data-active-slide={index}
      aria-roledescription="carousel"
    >
      {mark.slides.map((slide, i) => (
        <div
          key={i}
          className={`mark-carousel__slide${i === index ? ' mark-carousel__slide--active' : ''}`}
          aria-hidden={i !== index}
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
        </div>
      ))}
    </div>
  )
}
