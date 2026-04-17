'use client'

// MarkNav — sticky top-center pill, context-aware.
//
// The single sticky element that sits in the top chrome across the route:
//   • in the Hero:   nothing (no pill)
//   • in the Essay:  Fraunces 24px "MARKS & SYMBOLS" docked
//   • in a mark:     [grid-icon] MarkName (grid-icon clicks back to the
//                    current cycle's Hero)
//   • in the Buffer: nothing
//
// Position: viewport-centered (`left: 50%; translateX(-50%)`) at --marker-top,
// matching the credits-reel aesthetic. This is different from /biconomy and
// /rr where ChapterMarker sits left-of-center next to ProjectMarker.
//
// Chunk 5 renders this per-section from MarkSection (mark-name variant only).
// Chunk 7 hoists it to the route level and wires scroll-mapped hand-off with
// the Hero title. Chunk 11 wires the grid-icon click to jump back to the
// current cycle's Hero.

interface MarkNavProps {
  name: string
}

export default function MarkNav({ name }: MarkNavProps) {
  return (
    <div className="mark-nav" role="group" aria-label={`Current mark: ${name}`}>
      <span className="mark-nav__icon nav-icon" aria-hidden="true">grid_view</span>
      <span className="mark-nav__name">{name}</span>
    </div>
  )
}
