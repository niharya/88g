import type { Metadata } from 'next'
import './selected.css'
import MarkerSlot from '../../components/nav/MarkerSlot'
import NavMarker from '../../components/NavMarker'
import AboutCard from './components/AboutCard'
import SelectedContent from './components/SelectedContent'
import ShowcaseSection from './components/Showcase/ShowcaseSection'
import NiharHomeLink from '../../components/NiharHomeLink'
import SlideInOnNav from '../../components/SlideInOnNav'

export const metadata: Metadata = {
  title: 'Selected Work',
  description:
    'Branding, onboarding flows, naming, systems work, infrastructure experiments.',
  alternates: { canonical: '/selected' },
  openGraph: {
    title: 'Different systems. Same instincts.',
    description:
      'Trying to organize complexity so people can move through it and get somewhere.',
    url: '/selected',
    images: ['/og-image.png'],
  },
}

export default function SelectedPage() {
  return (
    <div className="selected-workbench">
      <h1 className="sr-only">Works</h1>
      <SlideInOnNav
        flag="to-selected"
        selector=".selected-workbench"
        className="selected-workbench--slide-in"
      />
      {/* First viewport — AboutCard + Timeline panel up top, scroll cue */}
      {/* pinned to the bottom of the initial 100svh so the hand-off to  */}
      {/* the Showcase reads without scrolling.                          */}
      <div className="selected-firstview">
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

        <div className="sc-cue" aria-hidden="true">
          <div className="sc-cue__rule" />
          <div className="sc-cue__row">
            <span className="material-symbols-rounded sc-cue__arrow">
              arrow_downward
            </span>
            <span className="sc-cue__label">Showcase</span>
          </div>
        </div>
      </div>

      {/* Showcase — appended below the first viewport. The hint row +    */}
      {/* 10-tile bento grid live here; HeaderBlock above them carries   */}
      {/* the Claude Design intro copy.                                   */}
      <ShowcaseSection />
    </div>
  )
}
