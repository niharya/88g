'use client'

// ProjectMarker — content for the left nav pill.
//
// Renders the icon + project name. Positioning and measurement are handled
// by MarkerSlot (which wraps this component in ShellNav and selected page).
//
// When used standalone (without MarkerSlot), the outer .project-marker class
// on MarkerSlot provides the fixed positioning. When used inside /selected's
// nav row, MarkerSlot is overridden to position: static via CSS.

export default function ProjectMarker({ projectName = 'Biconomy' }: { projectName?: string }) {
  return (
    <div className="nav-marker nav-marker--project">
      <span className="nav-marker__content">
        <span className="nav-icon" aria-hidden="true">info</span>
        <span className="nav-marker__name t-h5">{projectName}</span>
      </span>
    </div>
  )
}
