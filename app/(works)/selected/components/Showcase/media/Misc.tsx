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

export function UiMapPlaceholder() {
  // Dashed accent regions overlaid on the rr interface — placeholder until
  // the real UI-map artwork is dropped in from Figma.
  return (
    <div className="sc-ui-map" aria-hidden="true">
      <span className="sc-ui-map__zone" style={{ left: '4%', top: '6%', width: '92%', height: '12%' }} />
      <span className="sc-ui-map__zone" style={{ left: '4%', top: '22%', width: '62%', height: '54%' }} />
      <span className="sc-ui-map__zone" style={{ left: '68%', top: '22%', width: '28%', height: '54%' }} />
      <span className="sc-ui-map__zone" style={{ left: '4%', top: '80%', width: '92%', height: '14%' }} />
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
