'use client'

// BenchExitMarker — the "+Nihar" marker, top-left above the invitation card.
//
// The flat back-link affordance is the shared ReturnMarker primitive; this
// wrapper owns the /all-specifics: grey tone + flow positioning (`.bench-exit`
// in bench.css) and, like NiharHomeLink, the to-landing nav-direction flag so
// the landing slides its hero back in on arrival.

import ReturnMarker from '../../../../components/ReturnMarker'

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
      <ReturnMarker href="/" label="Nihar" onClick={onClick} aria-label="Back to landing page" />
    </div>
  )
}
