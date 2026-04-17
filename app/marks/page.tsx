import type { Metadata } from 'next'
import Background from './components/Background'
import DockedTitle from './components/DockedTitle'
import Hero from './components/Hero'
import Essay from './components/Essay'
import MarkSection from './components/MarkSection'
import Buffer from './components/Buffer'
import { MARKS } from './data/marks'

// /marks — Marks & Symbols
//
// Editorial credits-reel: hero → essay → 6 mark sections → buffer → loops.
// Built as one continuous document (not a sheet stack), so it does NOT use
// `<Sheet>` or the `.sheet` class. The `.route-marks` wrapper is the
// load-bearing top-level — TransitionSlot's ghost-content-dim selector
// targets `.route-marks > *` for this route.

export const metadata: Metadata = {
  title: 'Marks & Symbols',
  description:
    'An editorial showcase of six logo marks and symbols, built in the spirit of film credits — a slow, idle reel of specimens.',
  alternates: { canonical: '/marks' },
  openGraph: {
    title: 'Marks & Symbols — Nihar Bhagat',
    description:
      'An editorial showcase of six logo marks and symbols, built in the spirit of film credits — a slow, idle reel of specimens.',
    url: '/marks',
    images: ['/og-image.png'],
  },
}

export default function MarksPage() {
  return (
    <div className="route-marks">
      <Background />
      <DockedTitle />
      <Hero />
      <Essay />
      {/* Scaffolding pass: Beringer (red) + Ecochain (olive), so the
          color-morph → details-appear → 800ms settle sequence can be read
          at a glance across two distinct palettes. The full 6-mark stack
          comes back once the per-section reveal is locked in. */}
      {[MARKS[0], MARKS[2]].map((mark, i) => (
        <MarkSection key={mark.id} mark={mark} index={i} />
      ))}
      <Buffer />
    </div>
  )
}
