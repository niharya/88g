'use client'

// HeaderBlock — title + intro copy that sits above the showcase grid.
//
// Copy is the Claude Design header verbatim:
//   eyebrow · "nihar.works · selected visuals"
//   title   · "Visuals"
//   sub     · "A flatlay of the work — interfaces, posters, motion, and
//              marks, laid out on one bench. Click any piece to lift it
//              and read the note."
//   meta    · {N} pieces · one bench
//
// Renders inside the workbench, below the reverted AboutCard + Timeline
// block. Plain text on the workbench surface — no border, no frame.

import { PIECES } from './data'

export default function HeaderBlock() {
  return (
    <header className="sc-header">
      <div className="sc-header__lead">
        <span className="sc-header__eyebrow">
          <span className="sc-header__eyebrow-dot" />
          nihar.works · selected visuals
        </span>
        <h2 className="sc-header__title">Visuals</h2>
        <p className="sc-header__sub">
          A flatlay of the work — interfaces, posters, motion, and marks,
          laid out on one bench. Click any piece to lift it and read the
          note.
        </p>
      </div>
      <div className="sc-header__meta">
        <span className="sc-header__count">{PIECES.length}</span>
        <span className="sc-header__countlabel">pieces · one bench</span>
      </div>
    </header>
  )
}
