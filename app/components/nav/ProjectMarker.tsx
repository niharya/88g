'use client'

// ProjectMarker — inert left-nav pill. Positioning comes from MarkerSlot;
// this component is purely presentational.

import NavMarker from '../NavMarker'

export default function ProjectMarker({ projectName = 'Biconomy' }: { projectName?: string }) {
  return (
    <NavMarker as="div" role="project" icon="info" label={projectName} />
  )
}
