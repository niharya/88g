'use client'

// WorkPanel — the browse-mode content revealed beneath the lifted invitation.
//   Longform → SelectedContent (the Timeline + expandable Archive). It's
//     absolute-positioned (mat anchored right:0 width:688), so it's hosted in
//     `.bench-cases`, a sized relative wrapper that recreates the old
//     `.selected-layout` positioning context (incl. archive-open growth).
//   Visual → the Showcase bento grid, in a flow `.sc-section` (1224, centred).
//     Per the design decision, the showcase's HeaderBlock is dropped (the
//     bench card is the intro now); the click/esc HintRow is kept.
// Top padding clears the pinned navbar.

import type { Ref } from 'react'
import SelectedContent from '../SelectedContent'
import Showcase from '../Showcase/Showcase'
import HintRow from '../Showcase/HintRow'
import type { BenchActive } from './useBenchMorph'

interface WorkPanelProps {
  active: BenchActive
  closing: boolean
  workRef?: Ref<HTMLDivElement>
}

export default function WorkPanel({ active, closing, workRef }: WorkPanelProps) {
  return (
    <div ref={workRef} className={`bench-work${closing ? ' bench-work--closing' : ''}`}>
      {active === 'lf' ? (
        <div className="bench-cases">
          <SelectedContent />
        </div>
      ) : (
        <div className="sc-section bench-showcase">
          <HintRow />
          <Showcase />
        </div>
      )}
    </div>
  )
}
