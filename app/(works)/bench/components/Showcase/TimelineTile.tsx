'use client'

// TimelineTile — wraps the existing <Timeline /> + <ArchivePanel /> inside
// the showcase grid as a non-focusable tile.
//
// It is NOT a regular ShowcasePiece — it has no caption row, no dot, no
// spec note, no lift-on-click. The Timeline keeps its existing interactions
// (project cards link out, archive expands/collapses). The tile is purely
// a composition slot in the masonry grid.
//
// Owns archive open state locally (was previously owned by SelectedContent).

import { useCallback, useState } from 'react'
import Timeline from '../Timeline'
import ArchivePanel from '../ArchivePanel'

export default function TimelineTile() {
  const [archiveOpen, setArchiveOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setArchiveOpen(prev => !prev)
  }, [])

  return (
    <section
      className={`selected-mat mat sc-timeline-tile${archiveOpen ? ' selected-mat--archive-open' : ''}`}
      aria-label="Career timeline 2018 to 2025"
    >
      <Timeline isArchiveOpen={archiveOpen} onArchiveToggle={handleToggle} />
      <ArchivePanel isOpen={archiveOpen} />
    </section>
  )
}
