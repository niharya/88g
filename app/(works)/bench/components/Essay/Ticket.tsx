// Ticket — the letterpress "BROWSE IN TWO WAYS" ticket footing the card.
//
// Stateless and presentational: all morph-driven values (padding, title size,
// divider height, close width, label crossfade, tab ink) are computed from
// `condensed` / `active` and applied as inline styles — mirroring the design
// prototype's renderVals. bench.css owns structure + the transitions (on our
// --ease-paper / --dur-* tiers). Phase 4's useBenchMorph hook owns the state
// machine + imperative geometry (rest → pinned navbar) and feeds this via the
// refs + props below; Phase 3 renders it resting.

import type { CSSProperties, Ref } from 'react'

type Active = 'lf' | 'vis'

interface TicketProps {
  condensed: boolean
  active: Active
  onLongform: () => void
  onVisual: () => void
  onClose: () => void
  slotRef?: Ref<HTMLDivElement>
  ticketRef?: Ref<HTMLDivElement>
}

const ACTIVE_INK = 'var(--terra-960)'
// Muted (inactive, condensed) — the design's #B7A07C greyish tan; approximated
// by blending our gold ink toward grey until a --gold-* ramp exists.
const MUTED_INK = 'color-mix(in srgb, var(--terra-720) 55%, var(--grey-560))'

export default function Ticket({
  condensed: cond,
  active,
  onLongform,
  onVisual,
  onClose,
  slotRef,
  ticketRef,
}: TicketProps) {
  const lfActive = active === 'lf'
  const visActive = active === 'vis'

  const titleFont = cond ? '18px' : '27px'
  // Subtitles ("case studies" / "showcase") stay visible in the condensed
  // navbar and morph directly from the expanded ticket — only the top margin
  // tightens. (Underline is CSS-driven: hover + [aria-current].)
  const subStyle: CSSProperties = {
    marginTop: cond ? '3px' : '9px',
  }
  const lfInk: CSSProperties = {
    color: cond ? (lfActive ? ACTIVE_INK : MUTED_INK) : ACTIVE_INK,
  }
  const visInk: CSSProperties = {
    color: cond ? (visActive ? ACTIVE_INK : MUTED_INK) : ACTIVE_INK,
  }

  return (
    <div className="bench-ticket-slot" ref={slotRef}>
      <div className="bench-ticket" ref={ticketRef}>
        <div
          className="bench-ticket__frame"
          style={{
            padding: `${cond ? '0px' : '26px'} 16px`,
            borderColor: cond ? 'transparent' : 'var(--terra-160)',
          }}
        >
          {/* Eyebrow — collapses on condense */}
          <div
            className="bench-ticket__eyebrow"
            style={{
              maxHeight: cond ? '0px' : '22px',
              opacity: cond ? 0 : 1,
              margin: cond ? '0px' : '2px 0 18px',
              transform: cond ? 'translateY(10px)' : 'translateY(0px)',
            }}
          >
            <span className="bench-ticket__eyebrow-rule bench-ticket__eyebrow-rule--l" />
            <span className="bench-ticket__eyebrow-label">browse in two ways</span>
            <span className="bench-ticket__eyebrow-rule bench-ticket__eyebrow-rule--r" />
          </div>

          {/* Tabs */}
          <div className="bench-ticket__tabs">
            {/* Longform */}
            <button
              type="button"
              className="bench-tab"
              onClick={onLongform}
              aria-current={cond && lfActive ? 'true' : undefined}
              style={{ padding: cond ? '6px 8px' : '13px 12px 13px 22px' }}
            >
              <div className="bench-tab__title" style={{ fontSize: titleFont }}>
                <span className="bench-tab__ink" style={lfInk}>Longform</span>
              </div>
              <span className="bench-tab__sub" style={subStyle}>case studies</span>
            </button>

            {/* Perforated divider + diamond bead */}
            <div className="bench-perf">
              <span
                className="bench-perf__line"
                style={{
                  height: cond ? '20px' : '60px',
                  backgroundImage: cond
                    ? 'radial-gradient(circle at center, var(--terra-160) 0 0.8px, transparent 1.1px)'
                    : 'radial-gradient(circle at center, var(--terra-160) 0 1.4px, transparent 1.8px)',
                  backgroundSize: cond ? '2px 3px' : '4px 6px',
                }}
              />
              <span className="bench-perf__bead" style={{ opacity: cond ? 0 : 1 }}>
                <svg width="21" height="15" viewBox="0 0 100 100" aria-hidden="true">
                  <path d="M10 50L50 30L90 50L50 70L10 50Z" fill="currentColor" />
                </svg>
              </span>
            </div>

            {/* Visual — the persistent "showcase" subtitle carries the word, so
                the title stays "Visual" through the morph (no crossfade). */}
            <button
              type="button"
              className="bench-tab"
              onClick={onVisual}
              aria-current={cond && visActive ? 'true' : undefined}
              style={{ padding: cond ? '6px 8px' : '13px 22px 13px 12px' }}
            >
              <div className="bench-tab__title" style={{ fontSize: titleFont }}>
                <span className="bench-tab__ink" style={visInk}>Visual</span>
              </div>
              <span className="bench-tab__sub" style={subStyle}>showcase</span>
            </button>

            {/* Close ✕ — appears as the navbar forms */}
            <button
              type="button"
              className="bench-ticket__close"
              onClick={onClose}
              aria-label="Close"
              style={{
                width: cond ? '34px' : '0px',
                opacity: cond ? 1 : 0,
                pointerEvents: cond ? 'auto' : 'none',
              }}
            >
              <svg width="15" height="15" viewBox="0 0 17 17" style={{ flexShrink: 0 }} aria-hidden="true">
                <path d="M2 2L15 15M15 2L2 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
