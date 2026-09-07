import type { Metadata } from 'next'
import { chapters } from './nav/chapters'
import Sheet from '../../components/Sheet'
import CoverSheet from '../../components/CoverSheet'
import { biconomySignals } from './components/signalsData'
import Intro from './components/Intro'
import Flows from './components/Flows'
import Demos from './components/Demos'
import BIPs from './components/BIPs'
import Multiverse from './components/Multiverse'
import API from './components/API'
import StayingAnchored from './components/StayingAnchored'
import CaseCompletion from '../../components/CaseCompletion'
import HashLanding from '../../components/HashLanding'

// Chapters a deep link may land on — every chapter plus the Signals cover.
// `/shape-of-product` ships `target="_blank"` chips to `#ux-audit` and
// `#demos`, so those two are always the cold-load path this exists to fix.
const LANDABLE = ['signals', ...chapters.map((c) => c.id)]

export const metadata: Metadata = {
  title: 'Biconomy · Deep Infrastructure Stuff',
  description:
    'Thought I was designing product screens. Most of the work was actually systems work.',
  alternates: { canonical: '/biconomy' },
  openGraph: {
    title: 'Deep infrastructure stuff.',
    description:
      'Trying to make complicated systems feel clear enough to move through.',
    url: '/biconomy',
    images: ['/og-biconomy.jpg'],
  },
}

// Sheet content keyed by chapter id — keeps page.tsx readable without a giant switch
const sheetContent: Record<string, React.ReactNode> = {
  'ux-audit':         <><Intro /><Flows /></>,
  'demos':            <Demos />,
  'bips':             <BIPs />,
  'multiverse':       <Multiverse />,
  'api':              <API />,
  'staying-anchored': <StayingAnchored />,
}

const creativeWorkLd = {
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: 'Biconomy',
  headline: 'Biconomy — long-form UX case study',
  description:
    'A long-form UX case study on Biconomy — rethinking the platform Web3 developers use to manage smart contracts and gas tanks.',
  url: 'https://nihar.works/biconomy',
  inLanguage: 'en',
  author: { '@type': 'Person', name: 'Nihar', url: 'https://nihar.works' },
  isPartOf: { '@type': 'WebSite', name: 'Nihar', url: 'https://nihar.works' },
}

export default function BiconomyPage() {
  return (
    <div className="route-biconomy">
      <HashLanding ids={LANDABLE} />
      <h1 className="sr-only">Biconomy — long-form UX case study</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkLd) }}
      />
      <div className="sheet-stack">
        <CoverSheet data={biconomySignals} />
        {chapters.map((chapter, i) => (
          <Sheet
            key={chapter.id}
            chapter={chapter}
            chapters={chapters}
            snap
            snapIdleMs={i === 0 ? 100 : 2000}
          >
            {sheetContent[chapter.id]}
          </Sheet>
        ))}
      </div>
      <CaseCompletion project="biconomy" sectionId="staying-anchored" />
    </div>
  )
}
