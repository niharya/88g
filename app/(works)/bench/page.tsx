import type { Metadata } from 'next'
import './selected.css'
import MarkerSlot from '../../components/nav/MarkerSlot'
import NavMarker from '../../components/NavMarker'
import AboutCard from './components/AboutCard'
import SelectedContent from './components/SelectedContent'
import FirstView from './components/FirstView'
import ShowcaseSection from './components/Showcase/ShowcaseSection'
import NiharHomeLink from '../../components/NiharHomeLink'
import SlideInOnNav from '../../components/SlideInOnNav'

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

export default function SelectedPage() {
  return (
    <div className="selected-workbench">
      <h1 className="sr-only">Works</h1>
      <SlideInOnNav
        flag="to-bench"
        selector=".selected-workbench"
        className="selected-workbench--slide-in"
      />
      {/* First viewport — AboutCard + Timeline panel up top, Showcase  */}
      {/* cue pinned a few px below the mat panel. The FirstView client */}
      {/* wrapper owns the click-to-glide handler and the measured      */}
      {/* `--sc-cue-top` var that anchors the cue to the mat's bottom.   */}
      <FirstView>
        <div
          className="selected-layout"
          // Contract with FirstView: the stage element provides the
          // horizontal rails (left + right) for the Showcase cue. The
          // mat carries `data-cue-v-anchor` for the vertical position.
          // If this attribute moves, update CUE_H_ANCHOR_SELECTOR in
          // FirstView.tsx.
          data-cue-h-anchor
        >
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
      </FirstView>

      {/* Showcase — appended below the first viewport. The hint row +    */}
      {/* 10-tile bento grid live here; HeaderBlock above them carries   */}
      {/* the Claude Design intro copy.                                   */}
      <ShowcaseSection />
    </div>
  )
}
