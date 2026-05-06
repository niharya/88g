import type { Metadata } from 'next'
import AutoScroll from './components/AutoScroll'
import Background from './components/Background'
import MarksTitle from './components/MarksTitle'
import HeroText from './components/HeroText'
import Hero from './components/Hero'
import Essay from './components/Essay'
import MarkSection from './components/MarkSection'
import BlankSection from './components/BlankSection'
import HeroClone from './components/HeroClone'
import OutroVeil from './components/OutroVeil'
import { MARKS } from './data/marks'

// /marks — Marks & Symbols
//
// Editorial credits-reel: hero → essay → 6 mark sections → blank → hero-clone
// → (teleport back to y=0). Built as one continuous document (not a sheet
// stack), so it does NOT use `<Sheet>` or the `.sheet` class. The
// `.route-marks` wrapper carries every route-local CSS token (see
// `marks.css`).
//
// Infinite reel: the last two sections are a BlankSection (calm black void)
// and a HeroClone (identical palette to the real Hero). When dominance-snap
// docks the user into the clone, HeroClone teleports scrollY to 0 — the
// real Hero. Palette continuity (Background) + title continuity (MarksTitle
// distToNearestHero) makes the switch imperceptible.

export const metadata: Metadata = {
  title: 'Marks & Symbols — Identity Work',
  description:
    'An editorial reel of logo marks and symbols, built like a slow strip of film credits.',
  alternates: { canonical: '/marks' },
  openGraph: {
    title: 'Marks & Symbols — Identity Work',
    description:
      'An editorial reel of logo marks and symbols, built like a slow strip of film credits.',
    url: '/marks',
    images: ['/og-marks.jpg'],
  },
}

export default function MarksPage() {
  return (
    <div className="route-marks">
      <AutoScroll />
      <Background />
      <HeroText />
      <MarksTitle />
      <Hero />
      <Essay />
      {MARKS.map((mark, i) => (
        <MarkSection key={mark.id} mark={mark} index={i} />
      ))}
      <BlankSection />
      <HeroClone />
      <OutroVeil />
    </div>
  )
}
