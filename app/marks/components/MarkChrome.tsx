'use client'

// MarkChrome — bottom chrome inside a mark section.
//
// Layout, top to bottom (values from Aleyr Figma reference, node 1981:4078):
//   • dot paginator (one dot per slide; click-to-jump lands with the showcase
//     timer) — mix-blend-mode: color-dodge so the dots pick up the gradient
//   • thin 702px horizontal divider
//   • slide caption (Fraunces 24px, grey-720)
//   • "MarkName, Year" attribution (uppercase, tracked)
//
// Chunk 5 renders this static with slide 0 caption (falls back to mark.story
// for the `kind: 'mark'` slide). Click-to-jump on the paginator lands with
// the showcase timer in chunk 9.

import type { MarkEntry } from '../data/marks'

interface MarkChromeProps {
  mark:  MarkEntry
  index: number  // active slide index
}

function captionFor(mark: MarkEntry, index: number): string {
  const slide = mark.slides[index]
  if (!slide) return ''
  if (slide.kind === 'mark') return mark.story
  return slide.caption
}

export default function MarkChrome({ mark, index }: MarkChromeProps) {
  return (
    <div className="mark-chrome">
      <ol className="mark-chrome__paginator" aria-label="Slide pagination">
        {mark.slides.map((_, i) => (
          <li
            key={i}
            className={`mark-chrome__dot${i === index ? ' mark-chrome__dot--active' : ''}`}
            aria-current={i === index ? 'true' : undefined}
          />
        ))}
      </ol>

      <div className="mark-chrome__divider" aria-hidden="true" />

      <p className="mark-chrome__caption">{captionFor(mark, index)}</p>

      <p className="mark-chrome__year">{mark.name}, {mark.year}</p>
    </div>
  )
}
