// Ticket — the letterpress "BROWSE IN TWO WAYS" ticket. A `position: sticky`
// element (the slot, via slotRef) that docks into a navbar on scroll; the
// `.is-docked` class (driven by useBenchDock) drives the entire condense in
// bench.css. This component is purely structural — no inline state.
//
// Tab order: Showcase first (the default), Longform second.

import type { Ref } from 'react'
import MaterialIcon from '../../../../components/MaterialIcon'

interface TicketProps {
  docked: boolean
  active: 'vis' | 'lf'
  onShowcase: () => void
  onLongform: () => void
  onClose: () => void
  slotRef?: Ref<HTMLDivElement>
}

export default function Ticket({ docked, active, onShowcase, onLongform, onClose, slotRef }: TicketProps) {
  return (
    <div className={`bench-ticket-slot${docked ? ' is-docked' : ''}`} ref={slotRef}>
      <div className="bench-ticket">
        <div className="bench-ticket__frame">
          {/* Eyebrow — collapses on dock */}
          <div className="bench-ticket__eyebrow">
            <span className="bench-ticket__eyebrow-rule bench-ticket__eyebrow-rule--l" />
            <span className="bench-ticket__eyebrow-label">browse in two ways</span>
            <span className="bench-ticket__eyebrow-rule bench-ticket__eyebrow-rule--r" />
          </div>

          {/* Tabs — Showcase first (default), then Longform */}
          <div className="bench-ticket__tabs">
            {/* Mirror of the close cell so the label pair stays centred in the
                docked navbar (0-width at rest). */}
            <span className="bench-tab__spacer" aria-hidden="true" />
            <button
              type="button"
              className="bench-tab"
              onClick={onShowcase}
              aria-current={docked && active === 'vis' ? 'true' : undefined}
            >
              <div className="bench-tab__title"><span className="bench-tab__ink">Visual</span></div>
              <span className="bench-tab__sub">showcase</span>
            </button>

            {/* Divider + diamond bead */}
            <div className="bench-perf">
              <span className="bench-perf__line" />
              <span className="bench-perf__bead">
                <svg width="21" height="15" viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M10 50L50 30L90 50L50 70L10 50Z" fill="currentColor" />
                </svg>
              </span>
            </div>

            <button
              type="button"
              className="bench-tab"
              onClick={onLongform}
              aria-current={docked && active === 'lf' ? 'true' : undefined}
            >
              <div className="bench-tab__title"><span className="bench-tab__ink">Longform</span></div>
              <span className="bench-tab__sub">case studies</span>
            </button>

            {/* Close — appears docked, returns to the invitation */}
            <button
              type="button"
              className="bench-ticket__close"
              onClick={onClose}
              aria-label="Back to the invitation"
              tabIndex={docked ? 0 : -1}
            >
              <MaterialIcon name="close" className="bench-ticket__close-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
