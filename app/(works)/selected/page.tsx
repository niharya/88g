import type { Metadata } from 'next'
import './selected.css'
import MarkerSlot from '../../components/nav/MarkerSlot'
import ChapterMarker from '../../components/nav/ChapterMarker'
import AboutCard from './components/AboutCard'
import SelectedContent from './components/SelectedContent'
import NiharHomeLink from './components/NiharHomeLink'
import SlideInOnNav from '../../components/SlideInOnNav'

export const metadata: Metadata = {
  title: 'Works',
  description:
    'Selected works by Nihar Bhagat — product, systems, and brand design from 2018 onward.',
  alternates: { canonical: '/selected' },
  openGraph: {
    title: 'Works — Nihar Bhagat',
    description:
      'Selected works by Nihar Bhagat — product, systems, and brand design from 2018 onward.',
    url: '/selected',
    images: ['/og-image.png'],
  },
}

export default function SelectedPage() {
  return (
    <div className="selected-workbench">
      <SlideInOnNav
        flag="to-selected"
        selector=".selected-workbench"
        className="selected-workbench--slide-in"
      />
      <div className="selected-layout">
        {/* Nav pills — docked together, positioned above the mat */}
        <div className="selected-nav-row">
          <MarkerSlot position="left" measure={false}>
            <NiharHomeLink />
          </MarkerSlot>
          <ChapterMarker
            static
            chapter={{ id: 'works', title: 'Works', year: '2018-25' }}
            chapters={[]}
          />
        </div>

        <AboutCard />
        <SelectedContent />
      </div>
    </div>
  )
}
