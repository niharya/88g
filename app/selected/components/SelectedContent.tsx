'use client'

// SelectedContent — mat section with timeline, cards, and archive.
// Manages archive open/close state to toggle mat height.

import { useState, useCallback } from 'react'
import Timeline from './Timeline'
import ArchivePanel from './ArchivePanel'

export default function SelectedContent() {
  const [archiveOpen, setArchiveOpen] = useState(false)

  const handleToggle = useCallback(() => {
    setArchiveOpen(prev => !prev)
  }, [])

  return (
    <section className={`selected-mat mat${archiveOpen ? ' selected-mat--archive-open' : ''}`}>
      <Timeline isArchiveOpen={archiveOpen} onArchiveToggle={handleToggle} />
      <ArchivePanel isOpen={archiveOpen} />
    </section>
  )
}
