'use client'

import { useState, useEffect, type CSSProperties } from 'react'

const CLOSED_REST_TRANSFORM = 'rotate(1deg)'
// Matches the board's -12px nudge when rules opens (note stays tucked under
// the board's right edge).
const CLOSED_NUDGED_TRANSFORM = 'translateX(-12px) rotate(1deg)'
// Open math: note.left_base (= 129 in mech-family) + translate = board.right_nudged
// = 389 − 50 = 339 → translate = 210. Keeping this in sync with the note-open
// board nudge above is load-bearing — they must agree or the note will land
// offset from the board edge.
const OPEN_TRANSFORM = 'translateX(210px) rotate(0deg)'

interface NoteRailProps {
  /** Slide the rail out from under the game board on mount (closed state). */
  playReveal?: boolean
  /** Is the sibling rail (rules) currently open? If so, tuck-nudge -12px to
   *  follow the game board, which shifts -12px via :has(.is-open) in rr.css. */
  otherOpen?: boolean
  /** Emit open-state changes so the parent can coordinate with the other rail. */
  onOpenChange?: (isOpen: boolean) => void
}

export default function NoteRail({ playReveal = false, otherOpen = false, onOpenChange }: NoteRailProps) {
  const [isOpen, setIsOpen] = useState(false)

  // Emit open-state to parent so the rules rail can react to our state.
  useEffect(() => {
    onOpenChange?.(isOpen)
  }, [isOpen, onOpenChange])

  // First-reveal: a one-shot CSS animation plays on mount, sliding the rail
  // out from under the game board (see `.rr-note-rail.is-revealing` in rr.css).
  // On return visits playReveal is false, so the rail just renders at its
  // resting position with no entrance animation.
  const classes = [
    'rr-note-rail',
    isOpen && 'is-open',
    playReveal && !isOpen && 'is-revealing',
  ].filter(Boolean).join(' ')

  // Inline transform — same reason as RulesRail: transitions on rules via CSS
  // class rules don't compose cleanly with the useMatSettle-driven parent in
  // this render path, so the authoring is in JS.
  // During the reveal keyframe (playReveal && !isOpen), leave style undefined
  // so the animation owns transform — inline style loses to a running/filled
  // CSS animation anyway.
  let style: CSSProperties | undefined
  if (playReveal && !isOpen) {
    style = undefined
  } else if (isOpen) {
    style = { transform: OPEN_TRANSFORM }
  } else if (otherOpen) {
    style = { transform: CLOSED_NUDGED_TRANSFORM }
  } else {
    style = { transform: CLOSED_REST_TRANSFORM }
  }

  return (
    <div className={classes} style={style}>

      {/* Icon-only tab */}
      <button
        className="rr-note-rail__tab"
        onClick={() => setIsOpen(o => !o)}
        type="button"
        aria-label={isOpen ? 'Close note' : 'Open note'}
      >
        <span className="rr-note-rail__tab-icon material-symbols-rounded" aria-hidden="true">emergency_home</span>
      </button>

      {/* Note body — clicking anywhere on the open sheet closes it */}
      <div
        className="rr-note-rail__content"
        onClick={() => { if (isOpen) setIsOpen(false) }}
      >
        <p className="rr-note-rail__title">This Is Not The Main Game</p>
        <p className="rr-note-rail__text">This is the rudimentary game mechanic that evolved into the main gameplay later</p>
      </div>

    </div>
  )
}
