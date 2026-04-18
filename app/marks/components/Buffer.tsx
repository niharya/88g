'use client'

// Buffer — fade-to-black reel cut between the last mark and the next Hero.
//
// Three stacked zones in flex-column (heights per MARKS_BRIEF):
//   • fade-out (25vh) — linear-gradient(transparent → black) overlays the
//     fixed Mark 6 palette, so the mark gradient visibly dissolves into black.
//   • black    (30vh) — opaque black with the route's noise tile. While this
//     zone dominates the viewport, Background.tsx (chunk 5 update) resets the
//     palette to hero-grey under opaque black — invisible palette swap.
//   • fade-in  (25vh) — linear-gradient(black → transparent) reveals the now
//     hero-palette fixed background, easing the reel into the next Hero.
//
// In chunk 6 the infinite-loop's silent scroll-shift fires during the black
// zone; the opacity mask here is what makes that reset imperceptible.

import { useInfiniteLoop } from './hooks/useInfiniteLoop'

export default function Buffer() {
  useInfiniteLoop()
  return (
    <section className="marks-buffer" aria-hidden="true">
      <div className="marks-buffer__zone" data-buffer-zone="fade-out" />
      <div className="marks-buffer__zone" data-buffer-zone="black" />
      <div className="marks-buffer__zone" data-buffer-zone="fade-in" />
    </section>
  )
}
