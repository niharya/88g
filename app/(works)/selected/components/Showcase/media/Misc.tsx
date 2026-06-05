'use client'

// Small helper renderers (placeholder card, UI-map overlay, dual chip+gauge).
// Pulled out of PieceMedia.tsx so React Fast Refresh stops choking on
// helper-after-export hoisting.

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

export function DualPlaceholder() {
  return (
    <div className="sc-dual">
      <div className="sc-dual__pane">
        <span className="sc-chip">
          <span className="sc-chip__dot" />
          job · syncing
        </span>
      </div>
      <div className="sc-dual__pane">
        <svg viewBox="0 0 60 60" className="sc-gauge" aria-hidden="true">
          <circle cx="30" cy="30" r="22" className="sc-gauge__track" />
          <circle cx="30" cy="30" r="22" className="sc-gauge__fill" />
        </svg>
      </div>
    </div>
  )
}
