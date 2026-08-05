import type { Metadata } from 'next'
import './selected.css'
import './bench.css'
import SlideInOnNav from '../../components/SlideInOnNav'
import { pinyon } from './fonts'
import BenchEssay from './components/Essay/BenchEssay'

export const metadata: Metadata = {
  title: 'Selected Work',
  description:
    'Branding, onboarding flows, naming, systems work, infrastructure experiments.',
  alternates: { canonical: '/all' },
  openGraph: {
    title: 'Different systems. Same instincts.',
    description:
      'Trying to organize complexity so people can move through it and get somewhere.',
    url: '/all',
    images: ['/og-image.png'],
  },
}

// The active tab is addressed by bare query flags — `/all?showcase` / `/all?cases`
// (the `/showcase` & `/cases` rewrites resolve to these). This page must NOT
// read `searchParams`: any server read flips the route to request-time
// rendering (build shows ƒ), which cuts route prefetch down to the loading
// boundary and makes the stall loader the common path. The tab is resolved
// client-side in useBenchDock from the real browser URL (pathname covers the
// rewrite aliases, query covers the return seam) — see the "Deep-link entry &
// tab order" anomaly. Default is the Visual (showcase) tab.
export default function BenchPage() {
  return (
    <div className={`bench-workbench ${pinyon.variable}`}>
      <h1 className="sr-only">Works</h1>
      <SlideInOnNav
        flag="to-bench"
        selector=".bench-workbench"
        className="bench-workbench--slide-in"
      />

      {/* The invitation essay. The ticket morphs into a pinned navbar; the work
          panel (Timeline / Showcase) mounts beneath in browse mode. BenchEssay
          owns its own centred stage + the full-width work panel. */}
      <BenchEssay />
    </div>
  )
}
