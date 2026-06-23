'use client'

// WorkPanel — the browse-mode content revealed beneath the lifted invitation.
//   Longform → SelectedContent (the Timeline + expandable Archive). It's
//     absolute-positioned (mat anchored right:0 width:688), so it's hosted in
//     `.bench-cases`, a sized relative wrapper that recreates the old
//     `.selected-layout` positioning context (incl. archive-open growth).
//   Visual → ShowcaseSection: the category filter strip over the masonry grid.
//
// `filter` is held HERE (not in ShowcaseSection) so the reader's choice survives
// Visual↔Longform tab switches — ShowcaseSection unmounts on each switch, but this
// state persists. Top padding clears the pinned navbar.

import { useState } from 'react'
import SelectedContent from '../SelectedContent'
import ShowcaseSection from '../Showcase/ShowcaseSection'
import type { ShowcaseFilter } from '../Showcase/FilterStrip'
import type { BenchActive } from './useBenchDock'

interface WorkPanelProps {
  active: BenchActive
}

export default function WorkPanel({ active }: WorkPanelProps) {
  const [filter, setFilter] = useState<ShowcaseFilter>('all')

  return (
    <div className="bench-work">
      {active === 'lf' ? (
        <div className="bench-cases">
          <SelectedContent />
        </div>
      ) : (
        <ShowcaseSection filter={filter} onFilter={setFilter} />
      )}
    </div>
  )
}
