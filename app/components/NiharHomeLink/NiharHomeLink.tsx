'use client'

// NiharHomeLink — the "Nihar" project-marker that links back to the
// landing page from any non-landing surface that wants the docked
// nav-pair pattern.
//
// Sets `sessionStorage['nav-direction'] = 'to-landing'` on click so the
// landing's `<SlideInOnNav>` can animate the hero in from the left on
// arrival. The session flag is the only side-effect; the navigation
// itself is a normal anchor (`href="/"`), so middle-click / cmd-click
// "open in new tab" still works.
//
// Stateless and consumer-driven for placement: composes via NavMarker
// with `tone="neutral"` by default, and the consumer wraps it in a
// `.project-marker` div + the docked-pair container that owns the
// row's positioning + border-halving.
//
// Consumers (today): `/selected` (the workbench's nav row, paired with
// the static "Works" chapter-marker), `/shape-of-product` (SopNavRow,
// paired with the static "Shape of Product" chapter-marker). Future
// musings or non-landing routes that want the same back-affordance
// can drop this in directly.

import NavMarker from '../NavMarker'

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
