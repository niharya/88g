'use client'

// Small helper renderers (placeholder card, UI-map overlay, dual chip+gauge).
// Pulled out of PieceMedia.tsx so React Fast Refresh stops choking on
// helper-after-export hoisting.

import { JobChipStack } from './JobChipStack'
import LifecycleGauge from './LifecycleGauge'

export function Placeholder({ label, sub }: { label: string; sub: string }) {
  return (
    <div className="sc-placeholder">
      <span className="sc-placeholder__label">{label}</span>
      {sub && <span className="sc-placeholder__sub">{sub}</span>}
    </div>
  )
}

// Connektion specimens — JobChipStack + LifecycleGauge sit directly on
// the workbench, side-by-side. No pane wrappers; each artefact self-
// frames (the chip on its light card, the gauge inside its dark frame).
// See showcase.css `.sc-dual` for the tile geometry that holds them.
export function DualPlaceholder() {
  return (
    <div className="sc-dual">
      <JobChipStack />
      <LifecycleGauge />
    </div>
  )
}
