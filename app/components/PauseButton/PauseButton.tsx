'use client'

// PauseButton — 24 × 24 mat-bg icon button that toggles play / pause.
//
// Visual family: same 8 px outer radius + 1 px `--grey-800` hairline +
// `--mat-bg` fill as the rest of the showcase control chips (Switch
// wrapper, page chip). Hover shifts the background to `--grey-880`;
// active scales the button down to 0.96 for a press feel.
//
// Props are intentionally minimal — consumers own the paused state. If
// the same button gets re-used in a richer transport (volume, scrubbing)
// the consumer composes those siblings separately rather than this
// primitive growing more responsibilities.
//
// Known consumers
//   • /selected showcase video tiles (Furrmark, Ecochain, Subway). Sits
//     in the `.sc-controls` bar next to the Switch.

import type { MouseEventHandler } from 'react'

export interface PauseButtonProps {
  paused: boolean
  onToggle: () => void
  /** Optional click handler that fires alongside `onToggle` — useful for
   *  `stopPropagation` when the button sits inside a clickable tile. */
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
  ariaLabel?: { play: string; pause: string }
}

const PlayIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const PauseIcon = () => (
  <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <rect x="6" y="5" width="4" height="14" rx="1" />
    <rect x="14" y="5" width="4" height="14" rx="1" />
  </svg>
)

export default function PauseButton({
  paused,
  onToggle,
  onClick,
  className,
  ariaLabel = { play: 'Play', pause: 'Pause' },
}: PauseButtonProps) {
  return (
    <button
      type="button"
      className={`pausebtn${className ? ` ${className}` : ''}`}
      aria-label={paused ? ariaLabel.play : ariaLabel.pause}
      aria-pressed={paused}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) onToggle()
      }}
    >
      {paused ? <PlayIcon /> : <PauseIcon />}
    </button>
  )
}
