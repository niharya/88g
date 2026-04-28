import type { Metadata } from 'next'
import { Fragment } from 'react'
import { chapters } from './nav/chapters'
import Sheet from '../../components/Sheet'
import Intro from './components/Intro'
import Mechanics from './components/Mechanics'
import Cards from './components/Cards'
import Outcome from './components/Outcome'
import InterstitialText from './components/InterstitialText'

export const metadata: Metadata = {
  title: 'Rug Rumble',
  description:
    'Rug Rumble — a strategy card game designed around bluffing, momentum, and the feel of placing a real object on a table.',
  alternates: { canonical: '/rr' },
  openGraph: {
    title: 'Rug Rumble — Nihar Bhagat',
    description:
      'A strategy card game designed around bluffing, momentum, and the feel of placing a real object on a table.',
    url: '/rr',
    images: ['/og-image.png'],
  },
}

export default function RRPage() {
  return (
    <div className="route-rr">
      <div className="sheet-stack">
        {chapters.map((chapter, i) => (
          <Fragment key={chapter.id}>
            <Sheet
              chapter={chapter}
              chapters={chapters}
              snap={chapter.id !== 'mechanics'}
              snapIdleMs={i === 0 ? 100 : 2000}
            >
              {chapter.id === 'intro'      && <Intro />}
              {chapter.id === 'mechanics' && <Mechanics />}
              {chapter.id === 'cards'     && <Cards />}
              {chapter.id === 'outcome'   && <Outcome />}
            </Sheet>

            {chapter.id === 'intro' && <InterstitialText />}
          </Fragment>
        ))}
      </div>
    </div>
  )
}
