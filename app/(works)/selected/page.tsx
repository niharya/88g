import type { Metadata } from 'next'
import './selected.css'
import MarkerSlot from '../../components/nav/MarkerSlot'
import NavMarker from '../../components/NavMarker'
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
        {/* Nav markers — docked together, positioned above the mat */}
        <div className="selected-nav-row">
          <MarkerSlot position="left" measure={false}>
            <NiharHomeLink />
          </MarkerSlot>
          <div className="chapter-nav chapter-nav--static">
            <NavMarker
              as="button"
              role="chapter"
              icon="arrow_downward"
              acknowledgeOnClick="shake"
              label="Works"
              sublabel="2018-25"
              aria-label="Works — you are here"
            />
          </div>
        </div>

        <AboutCard />
        <SelectedContent />
      </div>
    </div>
  )
}
