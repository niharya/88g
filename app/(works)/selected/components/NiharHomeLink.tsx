'use client'

// NiharHomeLink — the "Nihar" marker on /selected.
//
// Anchor variant of the project-role NavMarker. Sets a session flag so the
// landing page can slide in from the left on arrival.

import NavMarker from '../../../components/NavMarker'

export default function NiharHomeLink() {
  const onClick = () => {
    try {
      sessionStorage.setItem('nav-direction', 'to-landing')
    } catch {
      /* Safari private mode etc. — non-fatal */
    }
  }

  return (
    <NavMarker
      as="a"
      href="/"
      role="project"
      icon="arrow_back"
      label="Nihar"
      onClick={onClick}
      aria-label="Back to landing page"
    />
  )
}
