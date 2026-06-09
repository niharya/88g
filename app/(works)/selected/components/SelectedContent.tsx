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
    <section
      className={`selected-mat mat${archiveOpen ? ' selected-mat--archive-open' : ''}`}
      // Contract with FirstView: this element's bottom edge anchors the
      // Showcase cue's vertical position. Horizontal rails come from the
      // stage (data-cue-h-anchor on .selected-layout). If this attribute
      // moves, update CUE_V_ANCHOR_SELECTOR in FirstView.tsx. Class
      // names are styling; data-* is the cross-component wiring.
      data-cue-v-anchor
    >
      <Timeline isArchiveOpen={archiveOpen} onArchiveToggle={handleToggle} />
      <ArchivePanel isOpen={archiveOpen} />
    </section>
  )
}
