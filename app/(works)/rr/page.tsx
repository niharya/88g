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
  title: 'Rug Rumble — Turning Infrastructure into Play',
  description:
    'Part game, part product demo. An experiment in using interaction and humor to communicate complex infrastructure systems.',
  alternates: { canonical: '/rr' },
  openGraph: {
    title: 'Rug Rumble — Turning Infrastructure into Play',
    description:
      'Part game, part product demo. An experiment in using interaction and humor to communicate complex infrastructure systems.',
    url: '/rr',
    images: ['/og-rr.jpg'],
  },
}

const creativeWorkLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Rug Rumble',
  headline: 'Rug Rumble — Turning Infrastructure into Play',
  description:
    'Part game, part product demo. An experiment in using interaction and humor to communicate complex infrastructure systems.',
  url: 'https://nihar.works/rr',
  inLanguage: 'en',
  genre: 'Game design',
  author: { '@type': 'Person', name: 'Nihar Bhagat', url: 'https://nihar.works' },
  isPartOf: { '@type': 'WebSite', name: 'Nihar Bhagat', url: 'https://nihar.works' },
}

export default function RRPage() {
  return (
    <div className="route-rr">
      <h1 className="sr-only">Rug Rumble — strategy card game</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkLd) }}
      />
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
