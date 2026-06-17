'use client'

// HeaderBlock — title + intro copy that sits above the showcase grid.
//
// Composition:
//   title   · "Visuals"
//   sub     · "This is a selection of my works done across a decade."
//   meta    · {N} pieces
//
// The eyebrow row and the "one bench" qualifier on the count label
// were removed v0.93+. Header + hint also collapsed to one unit (see
// `.sc-header` margin + `.sc-hint` border-top in showcase.css).

import { PIECES } from './data'

export default function HeaderBlock() {
  return (
    <header className="sc-header">
      <div className="sc-header__lead">
        <h2 className="sc-header__title">Visuals</h2>
        <p className="sc-header__sub">
          A selection of interfaces, posters, and marks, laid out for a visual treat.
        </p>
      </div>
      <div className="sc-header__meta">
        <span className="sc-header__count">{PIECES.length}</span>
        <span className="sc-header__countlabel">pieces</span>
      </div>
    </header>
  )
}
