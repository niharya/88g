import type { Metadata } from 'next'
import './selected.css'
import './bench.css'
import SlideInOnNav from '../../components/SlideInOnNav'
import { pinyon } from './fonts'
import BenchExitMarker from './components/Essay/BenchExitMarker'
import InvitationCard from './components/Essay/InvitationCard'

export const metadata: Metadata = {
  title: 'Selected Work',
  description:
    'Branding, onboarding flows, naming, systems work, infrastructure experiments.',
  alternates: { canonical: '/bench' },
  openGraph: {
    title: 'Different systems. Same instincts.',
    description:
      'Trying to organize complexity so people can move through it and get somewhere.',
    url: '/bench',
    images: ['/og-image.png'],
  },
}

export default function BenchPage() {
  return (
    <div className={`bench-workbench ${pinyon.variable}`}>
      <h1 className="sr-only">Works</h1>
      <SlideInOnNav
        flag="to-bench"
        selector=".bench-workbench"
        className="bench-workbench--slide-in"
      />

      {/* The invitation essay. Phase 3 mounts the morphing ticket as a child
          of the card; Phase 6 mounts the work panel (Timeline / Showcase). */}
      <div className="bench-stage">
        <BenchExitMarker />
        <InvitationCard />
      </div>
    </div>
  )
}
