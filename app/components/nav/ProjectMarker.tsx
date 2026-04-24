'use client'

// ProjectMarker — left-nav marker. Clicking scrolls the page back to top
// (natural "home of this project" affordance). Positioning comes from
// MarkerSlot; visuals come from NavMarker.

import NavMarker from '../NavMarker'

export default function ProjectMarker({ projectName = 'Biconomy' }: { projectName?: string }) {
  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' })
  return (
    <NavMarker as="button" role="project" icon="info" label={projectName} onClick={scrollTop} />
  )
}
