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
import { Img } from '../../../../components/Img'

function ArrowBackIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <mask id="rr-notes-arrow-mask" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 20 1.74846e-06)" fill="white" />
      </mask>
      <g mask="url(#rr-notes-arrow-mask)">
        <path d="M7.52271 11.0208L15.38 11.0208C15.6631 11.0208 15.9039 10.9219 16.1025 10.724C16.3011 10.5262 16.4004 10.2863 16.4004 10.0044C16.4004 9.72243 16.3011 9.48111 16.1025 9.28042C15.9039 9.07959 15.6631 8.97917 15.38 8.97917L7.52271 8.97917L10.7346 5.76729C10.9393 5.56257 11.0436 5.32021 11.0475 5.04021C11.0515 4.76035 10.9497 4.51326 10.7419 4.29896C10.5341 4.09785 10.2903 3.99924 10.0104 4.00313C9.73056 4.00702 9.48806 4.1116 9.28292 4.31688L4.32917 9.27708C4.23056 9.37583 4.15403 9.48861 4.09959 9.61542C4.04528 9.74236 4.01813 9.87167 4.01813 10.0033C4.01813 10.135 4.04528 10.2642 4.09959 10.391C4.15403 10.518 4.22771 10.628 4.32063 10.721L9.29084 15.691C9.50639 15.9067 9.74674 16.0111 10.0119 16.0042C10.2769 15.9972 10.5133 15.8892 10.721 15.6802C10.9288 15.4659 11.0327 15.2196 11.0327 14.9413C11.0327 14.6629 10.9288 14.4222 10.721 14.2192L7.52271 11.0208Z" fill="currentColor" />
      </g>
    </svg>
  )
}

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
        <Img
          src="/images/rr/rr-interface-desktop.png"
          alt="The Arena interface"
          className="rr-interface-desktop__img"
          intrinsic
          placeholder="hash"
          sizes="(max-width: 767px) 90vw, 900px"
        />
      </div>

      {/* Annotation sticky note — whole card toggles reveal */}
      <div
        className="rr-interface-notes"
        onClick={() => setRevealed(s => !s)}
        role="button"
        aria-label={revealed ? 'Hide details' : 'Show details'}
        aria-expanded={revealed}
      >
        <div className="rr-interface-notes__frame">
          <div className="rr-interface-notes__body">
            <hr className="rr-interface-note__divider" />
            {NOTES.map((text, i) => (
              <Fragment key={i}>
                <p className="rr-interface-note">{text}</p>
                {i < NOTES.length - 1 && <hr className="rr-interface-note__divider" />}
              </Fragment>
            ))}
          </div>
        </div>

        {/* Details label — visual only, click is on the whole card */}
        <div className="rr-interface-notes__details">
          <ArrowBackIcon className="rr-interface-notes__arrow" />
          <span className="rr-interface-notes__label">Details</span>
        </div>
      </div>

    </div>
  )
}
