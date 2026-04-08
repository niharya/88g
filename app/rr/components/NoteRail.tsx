'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface NoteRailProps {
  /** Slide the rail out from under the game board on mount (closed state). */
  playReveal?: boolean
}

export default function NoteRail({ playReveal = false }: NoteRailProps) {
  const [isOpen, setIsOpen] = useState(false)

  // First-reveal: start fully tucked under the game board (x = -32, the
  // width of the tab) and slowly slide right to the closed resting position
  // (x = 0). On return visits playReveal is false, so the rail just renders
  // at its resting position with no entrance animation.
  return (
    <motion.div
      className={`rr-note-rail${isOpen ? ' is-open' : ''}`}
      initial={playReveal ? { x: -32, rotate: 1 } : false}
      animate={{
        x: isOpen ? 220 : 0,
        rotate: isOpen ? 0 : 1,
      }}
      transition={
        playReveal && !isOpen
          ? { x: { duration: 1.4, ease: [0.22, 1, 0.36, 1], delay: 0.4 }, rotate: { duration: 0 } }
          : { type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }
      }
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

    </motion.div>
  )
}
