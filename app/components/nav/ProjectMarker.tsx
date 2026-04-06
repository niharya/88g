'use client'

// ProjectMarker — single global project marker, position: fixed
// Measures its actual right edge (rect.right) on mount and sets
// --project-marker-right so each Sheet's nav-sled positions the chapter
// marker flush against it with zero arithmetic error.

import { useEffect, useRef } from 'react'

export default function ProjectMarker({ projectName = 'Biconomy' }: { projectName?: string }) {
  const markerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = markerRef.current
    if (!el) return

    const update = () => {
      const right = el.getBoundingClientRect().right
      document.documentElement.style.setProperty('--project-marker-right', `${right}px`)
    }

    update()
    window.addEventListener('resize', update, { passive: true })
    return () => window.removeEventListener('resize', update)
  }, [])

  return (
    <div ref={markerRef} className="project-marker">
      <div className="nav-marker nav-marker--project">
        <span className="nav-marker__content">
          <span className="nav-icon" aria-hidden="true">info</span>
          <span className="nav-marker__name t-h5">{projectName}</span>
        </span>
      </div>
    </div>
  )
}
