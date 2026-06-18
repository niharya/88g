'use client'

// BenchExitMarker — the "+Nihar" marker, top-left above the invitation card.
//
// Reuses NavMarker(role="exit") for the icon+label affordance, but sits in
// flow on the pale desk in our grey scale (styled by `.bench-exit` in
// bench.css) rather than the shell/marks fixed white-on-art EXIT. Links home
// (/) and, like NiharHomeLink, sets the to-landing nav-direction so the
// landing slides its hero back in on arrival.

import NavMarker from '../../../../components/NavMarker'

export default function BenchExitMarker() {
  const onClick = () => {
    try {
      sessionStorage.setItem('nav-direction', 'to-landing')
    } catch {
      /* Safari private mode etc. — non-fatal */
    }
  }

  return (
    <div className="bench-exit">
      <NavMarker
        as="a"
        href="/"
        role="exit"
        icon="arrow_back"
        label="Nihar"
        onClick={onClick}
        aria-label="Back to landing page"
      />
    </div>
  )
}
