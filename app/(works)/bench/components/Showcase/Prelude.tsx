'use client'

// Prelude — the row directly under the AboutCard. Left: header copy block.
// Right: Timeline tile with the Nihar/Works nav chips sitting on top of
// its mat (matches the original /selected design where the chips docked
// over the timeline mat's top edge).
//
// The masonry grid of 10 tiles is a separate section below this.

import MarkerSlot from '../../../../components/nav/MarkerSlot'
import NavMarker from '../../../../components/NavMarker'
import NiharHomeLink from '../../../../components/NiharHomeLink'
import TimelineTile from './TimelineTile'
import HeaderBlock from './HeaderBlock'

export default function Prelude() {
  return (
    <section className="sc-prelude" aria-label="Career timeline and showcase intro">
      <div className="sc-prelude__header">
        <HeaderBlock />
      </div>
      <div className="sc-prelude__timeline">
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
        <TimelineTile />
      </div>
    </section>
  )
}
