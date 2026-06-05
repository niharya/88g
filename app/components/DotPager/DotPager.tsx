'use client'

// DotPager — small 24 px-tall chip holding a row of N dots; the dot at
// `activeIndex` reads as filled. The whole chip is the click target;
// clicking cycles 0 → 1 → 2 → … → N − 1 → 0.
//
// Same visual family as Switch wrapper / PauseButton — mat-bg fill,
// 1 px grey-800 hairline, 8 px outer radius. Hover ↑ to grey-880; active
// ↓ to scale 0.97.
//
// The active dot is tinted via `--dotpager-tint` (default `--grey-240`).
// Consumers usually set `--dotpager-tint: var(--<route>-accent)` on a
// wrapper so the active dot picks up the artefact's accent colour.
//
// Known consumers
//   • /selected showcase Paymaster tile — cycles between three audit
//     flows. Tinted from `--sc-dotc` via the .sc-pagechip wrapper-class
//     hook below.

import type { MouseEventHandler } from 'react'

export interface DotPagerProps {
  count: number
  activeIndex: number
  onAdvance: () => void
  ariaLabel?: string
  /** Optional click handler that fires alongside `onAdvance` — useful for
   *  `stopPropagation` when the chip sits inside a click-to-focus tile. */
  onClick?: MouseEventHandler<HTMLButtonElement>
  className?: string
}

export default function DotPager({
  count,
  activeIndex,
  onAdvance,
  ariaLabel,
  onClick,
  className,
}: DotPagerProps) {
  return (
    <button
      type="button"
      className={`dotpager${className ? ` ${className}` : ''}`}
      aria-label={ariaLabel ?? `Step ${activeIndex + 1} of ${count}`}
      onClick={(e) => {
        onClick?.(e)
        if (!e.defaultPrevented) onAdvance()
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <span
          key={i}
          className={`dotpager__dot${i === activeIndex ? ' is-active' : ''}`}
        />
      ))}
    </button>
  )
}
