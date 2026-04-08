'use client'

// InterfacePanel — "Interface" tab of Section 3 (Cards & UI).
//
// React port of vanilla rr-interactions.js initInterfaceReveal.
//
// Layout: a desktop screenshot of The Arena, with an annotation sticky note
// tucked behind it. The "Details" button (vertical label, top-right of the
// note) toggles a revealed state — screenshot slides left, note slides right,
// arrow flips. CSS handles the slide transitions via .rr-interface-panel--revealed.

import { Fragment, useState } from 'react'

const NOTES = [
  "All illustrations: the characters, the arena, and the cards are created by Florencia de Pamphilis, adding to the mematic visual language.",
  "I've designed the arena to hold focus on a single decision for the player: which card to play this round.",
  "The health bar is segmented, so players can read their status at a glance.",
  "A compact bottom bar shows time, round number, and settings. Easy to access but not distracting.",
  "Everything else is deliberately kept out of the way.",
]

export default function InterfacePanel() {
  const [revealed, setRevealed] = useState(false)

  return (
    <div className={`rr-interface-panel${revealed ? ' rr-interface-panel--revealed' : ''}`}>

      {/* Game screenshot */}
      <div className="rr-interface-desktop">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/rr/rr-interface-desktop.png"
          alt="The Arena interface"
          className="rr-interface-desktop__img"
        />
      </div>

      {/* Annotation sticky note */}
      <div className="rr-interface-notes">
        <div className="rr-interface-notes__frame">
          <div className="rr-interface-notes__body">
            <hr className="rr-interface-note__divider" />
            {NOTES.map((text, i) => (
              <Fragment key={i}>
                <p className="rr-interface-note">{text}</p>
                <hr className="rr-interface-note__divider" />
              </Fragment>
            ))}
          </div>
        </div>

        {/* Details toggle — vertical label, top-right corner */}
        <button
          type="button"
          className="rr-interface-notes__details"
          aria-label={revealed ? 'Hide details' : 'Show details'}
          aria-expanded={revealed}
          onClick={() => setRevealed(s => !s)}
        >
          <span className="material-symbols-rounded rr-interface-notes__arrow" aria-hidden="true">
            arrow_forward
          </span>
          <span className="rr-interface-notes__label">Details</span>
        </button>
      </div>

    </div>
  )
}
