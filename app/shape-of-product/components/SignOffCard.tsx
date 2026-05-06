'use client'

// SignOffCard — closing identity artifact at the bottom of /shape-of-product.
//
// Mirrors landing's `.hero-card` visual (centered greeting + headline +
// subtitle), recolored to the biconomy blue-note palette: blue-80 ground,
// blue-800 ink + 1px border, --shadow-resting. The reader who finishes
// the musing closes on the same "I'm Nihar" identity tag they'd see on
// the landing — but tinted to match the blue editorial voice biconomy
// uses for its intro cards.
//
// Time-of-day greeting comes from the shared `getGreeting` util.
// `useState(getGreeting)` lazy-inits on first client render so SSR and
// hydration agree on a single value.
//
// PROMOTION NOTE: visual treatment is duplicated from landing's
// `.hero-card` (background, padding, shadow, type slots). Second
// consumer of the same card visual — flagged as a promotion candidate.

import { useState } from 'react'
import { getGreeting } from '../../lib/greeting'

export default function SignOffCard() {
  const [greeting] = useState(getGreeting)
  // Card lands tilted (2deg). The reader can click it to flatten — a
  // small one-way "settle" interaction. Stateful so SSR + hydration both
  // start at `tilted: true` and only the first click in the session
  // changes it.
  const [tilted, setTilted] = useState(true)

  return (
    <aside className="sop__sign-off" aria-label="About the author">
      <div
        className={`sop__sign-off-card${tilted ? '' : ' is-flat'}`}
        style={{ transform: `rotate(${tilted ? 2 : 0}deg)` }}
        onClick={tilted ? () => setTilted(false) : undefined}
        role={tilted ? 'button' : undefined}
        tabIndex={tilted ? 0 : undefined}
        onKeyDown={tilted ? (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            setTilted(false)
          }
        } : undefined}
        aria-label={tilted ? 'Settle the card' : undefined}
      >
        <p className="sop__sign-off-greeting t-p4">{greeting}</p>
        <h2 className="sop__sign-off-headline t-h2">
          I&rsquo;m Nihar. I&rsquo;ve designed brands, cultures, and products.
        </h2>
        <p className="sop__sign-off-sub t-p3">
          What I was really doing was designing systems
        </p>
      </div>
    </aside>
  )
}
