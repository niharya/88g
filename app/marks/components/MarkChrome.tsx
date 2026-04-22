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
  mark:   MarkEntry
  index:  number  // active slide index
  active?: boolean // section is dominant — gates the fill animation
  clickPaused?: boolean // click-to-jump pause → locks fill to full (consumed)
  hoverPaused?: boolean // hover pause → freezes fill in place (reading)
  onJump?: (index: number) => void
  onHoverChange?: (hovered: boolean) => void  // hover on chrome (paginator + caption) → freeze timer
}

function captionFor(mark: MarkEntry, index: number): string {
  const slide = mark.slides[index]
  if (!slide) return ''
  if (slide.kind === 'mark') return mark.story
  return slide.caption
}

export default function MarkChrome({ mark, index, active, clickPaused, hoverPaused, onJump, onHoverChange }: MarkChromeProps) {
  return (
    <div
      className="mark-chrome"
      onMouseEnter={() => onHoverChange?.(true)}
      onMouseLeave={() => onHoverChange?.(false)}
    >
      <ol
        className="mark-chrome__paginator"
        aria-label="Slide pagination"
        data-active-section={active ? 'true' : 'false'}
        data-click-paused={clickPaused ? 'true' : 'false'}
        data-hover-paused={hoverPaused ? 'true' : 'false'}
      >
        {mark.slides.map((_, i) => (
          <li
            // Stable key per dot — the `<li>` stays mounted across slide
            // changes so the `width` transition on `.mark-chrome__dot` runs
            // smoothly (circle ↔ pill). The fill-animation restart now
            // lives on the keyed child `<span>` below, which can remount
            // without tearing down the dot that owns the width morph.
            key={i}
            className={`mark-chrome__dot${i === index ? ' mark-chrome__dot--active' : ''}`}
            aria-current={i === index ? 'true' : undefined}
          >
            {i === index && (
              // Inner keyed node → remounts on slide change AND on
              // section-becomes-dominant. That restarts the CSS fill
              // animation from scaleX(0) each time without disturbing the
              // outer dot's width transition.
              <span
                key={`${index}-${active ? 'on' : 'off'}`}
                className="mark-chrome__dot-fill"
                aria-hidden="true"
              />
            )}
            <button
              type="button"
              className="mark-chrome__dot-btn"
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => onJump?.(i)}
            />
          </li>
        ))}
      </ol>

      <div className="mark-chrome__divider" aria-hidden="true" />

      <p className="mark-chrome__caption t-p3">{captionFor(mark, index)}</p>

      <p className="mark-chrome__year t-h5">{mark.name}, {mark.year}</p>
    </div>
  )
}
