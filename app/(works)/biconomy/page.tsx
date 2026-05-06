import type { Metadata } from 'next'
import { chapters } from './nav/chapters'
import Sheet from '../../components/Sheet'
import Intro from './components/Intro'
import Flows from './components/Flows'
import Demos from './components/Demos'
import BIPs from './components/BIPs'
import Multiverse from './components/Multiverse'
import API from './components/API'
import StayingAnchored from './components/StayingAnchored'

export const metadata: Metadata = {
  title: 'Biconomy — Translating Complexity into Usable Systems',
  description:
    'Designing developer-facing products, onboarding flows, and interactive experiences inside a rapidly evolving infrastructure ecosystem.',
  alternates: { canonical: '/biconomy' },
  openGraph: {
    title: 'Biconomy — Translating Complexity into Usable Systems',
    description:
      'Designing developer-facing products, onboarding flows, and interactive experiences inside a rapidly evolving infrastructure ecosystem.',
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
  author: { '@type': 'Person', name: 'Nihar Bhagat', url: 'https://nihar.works' },
  isPartOf: { '@type': 'WebSite', name: 'Nihar Bhagat', url: 'https://nihar.works' },
}

export default function BiconomyPage() {
  return (
    <div className="route-biconomy">
      <h1 className="sr-only">Biconomy — long-form UX case study</h1>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(creativeWorkLd) }}
      />
      <div className="sheet-stack">
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
    </div>
  )
}
