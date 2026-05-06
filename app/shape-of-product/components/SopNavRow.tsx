'use client'

// SopNavRow — the docked Nihar + "Shape of Product" pair.
//
// Mirrors the nav pair on /selected and landing. The "Nihar"
// project-marker is the way back to the landing page; the "Shape of
// Product" chapter-marker is the "you are here" indicator (static,
// shake on click — clicking the marker you're already on shakes the
// arrow as feedback).

import NavMarker from '../../components/NavMarker'
import NiharHomeLink from '../../components/NiharHomeLink'

export default function SopNavRow() {
  return (
    <div className="sop-nav-row">
      <div className="project-marker">
        <NiharHomeLink />
      </div>
      <div className="chapter-nav chapter-nav--static">
        <NavMarker
          as="button"
          role="chapter"
          icon="arrow_downward"
          acknowledgeOnClick="shake"
          label="Shape of Product"
          sublabel="2026"
          aria-label="Shape of Product — you are here"
        />
      </div>
    </div>
  )
}
