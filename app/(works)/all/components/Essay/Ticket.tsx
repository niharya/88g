// Ticket — the letterpress "BROWSE IN TWO WAYS" ticket. ONE element: it foots
// the card as the invitation at rest, and lifts into a condensed navbar for the
// work view. `engaged` (driven by useBenchDock) applies `.is-pinned` (position)
// and `.is-condensed` (the visual condense) together, as one unit. This component
// is structural — no inline state.
//
// Tab order: Visual (showcase) first, Longform (case studies) second.
// Visual is the default tab.

import type { Ref } from 'react'
import MaterialIcon from '../../../../components/MaterialIcon'

interface TicketProps {
  engaged: boolean
  active: 'vis' | 'lf'
  onShowcase: () => void
  onLongform: () => void
  onClose: () => void
  slotRef?: Ref<HTMLDivElement>
}

export default function Ticket({ engaged, active, onShowcase, onLongform, onClose, slotRef }: TicketProps) {
  return (
    <div
      className={`bench-ticket-slot${engaged ? ' is-pinned is-condensed' : ''}`}
      ref={slotRef}
    >
      <div className="bench-ticket">
        <div className="bench-ticket__frame">
          {/* Eyebrow — collapses on condense */}
          <div className="bench-ticket__eyebrow">
            <span className="bench-ticket__eyebrow-rule bench-ticket__eyebrow-rule--l" />
            <span className="bench-ticket__eyebrow-label">browse in two ways</span>
            <span className="bench-ticket__eyebrow-rule bench-ticket__eyebrow-rule--r" />
          </div>

          {/* Tabs — Visual (showcase) first, then Longform (case studies). The
              close is absolute (not a grid cell), so the label pair stays centred
              in both states with no horizontal reflow. */}
          <div className="bench-ticket__tabs">
            <button
              type="button"
              className="bench-tab"
              onClick={onShowcase}
              aria-current={engaged && active === 'vis' ? 'true' : undefined}
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
              aria-current={engaged && active === 'lf' ? 'true' : undefined}
            >
              <div className="bench-tab__title"><span className="bench-tab__ink">Longform</span></div>
              <span className="bench-tab__sub">case studies</span>
            </button>

            {/* Close — appears condensed, returns to the invitation */}
            <button
              type="button"
              className="bench-ticket__close"
              onClick={onClose}
              aria-label="Back to the invitation"
              tabIndex={engaged ? 0 : -1}
            >
              <MaterialIcon name="close" className="bench-ticket__close-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
