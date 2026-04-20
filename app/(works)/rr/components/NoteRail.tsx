'use client'

import { useEffect, useState } from 'react'
import Rail from './Rail'

const CLOSED_REST_TRANSFORM = 'rotate(1deg)'
// Matches the board's -12px nudge when rules opens (note stays tucked under
// the board's right edge).
const CLOSED_NUDGED_TRANSFORM = 'translateX(-12px) rotate(1deg)'
// Open math: note.left_base (= 129 in mech-family) + translate = board.right_nudged
// = 389 − 50 = 339 → translate = 210. Keeping this in sync with the note-open
// board nudge above is load-bearing — they must agree or the note will land
// offset from the board edge.
const OPEN_TRANSFORM = 'translateX(210px) rotate(0deg)'
// Mobile: board doesn't nudge; note already starts at left:129 which is near
// board's left edge. Zero translation on open keeps it visible under the mat.
const OPEN_TRANSFORM_MOBILE = 'translateX(0px) rotate(0deg)'

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
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  // During the reveal keyframe (playReveal && !isOpen), leave transform undefined
  // so the CSS animation owns it — inline style loses to a running CSS animation
  // anyway, but keeping the branch explicit matches original intent.
  let transform: string | undefined
  if (playReveal && !isOpen) transform = undefined
  else if (isOpen) transform = isMobile ? OPEN_TRANSFORM_MOBILE : OPEN_TRANSFORM
  else if (otherOpen && !isMobile) transform = CLOSED_NUDGED_TRANSFORM
  else transform = CLOSED_REST_TRANSFORM

  return (
    <Rail
      className="rr-note-rail"
      isOpen={isOpen}
      isRevealing={playReveal && !isOpen}
      transform={transform}
      onOpenChange={onOpenChange}
    >
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
    </Rail>
  )
}
