'use client'

// MarkerTicket — postage-stamp ornament shown beneath a `ProjectMarker` when
// its info icon is opened. Notched outer body with a paper-edge wobble + soft
// drop-shadow; inner notched border (matching wobble); 40×40 icon slot, a
// vertical hairline rule, and two stacked text lines (lead + title), all
// vertically centered in a flex row inside the notched body. Tilts fresh in
// [-2°, +2°] every time the parent `.marker-info-anchor` toggles open —
// observed via MutationObserver so `ProjectMarker`'s contract stays untouched.
//
// Tones (`olive | yellow | terra | mint`) drive the gradient stops, stroke,
// and ink via CSS custom properties — the SVGs read `var(--marker-ticket-*)`
// so consumers theme by class alone. Each stamp instance gets unique SVG
// gradient/filter ids via `useId()` so multiple stamps on a page do not
// collide. Lead defaults to `.t-p3`; title defaults to `.t-h5`.
//
// `width` (default 314, biconomy's reference), `ruleHeight` (default 48), and
// `padRight` (default 4) are configurable per consumer. Height is fixed at 96;
// corner notches stay 8px regardless of width — only the horizontal segments
// stretch. Title slot fills the remaining flex space, so wider stamps give
// the title more room before wrapping.
//
// The number `8` is the stamp's corner radius; `4.41828` and `3.582`
// (= 8 - 4.41828) are the bezier control points for an 8px quarter-circle
// notch — leave them alone unless the notch radius changes.

import { useEffect, useId, useRef, useState, type CSSProperties, type ReactNode } from 'react'

export type MarkerTicketTone = 'olive' | 'yellow' | 'terra' | 'mint'

interface Props {
  tone:        MarkerTicketTone
  icon:        ReactNode
  lead:        string
  title:       string
  /** Outer stamp width in px. Default 314. Height stays 96. */
  width?:      number
  /** Vertical hairline rule height in px. Default 48. */
  ruleHeight?: number
  /** Right-edge inner padding in px. Default 4. Larger gives the title more
   * breathing room before the notched right edge. */
  padRight?:   number
}

// Outer body — 96 tall, W wide, 8px corner notches (concave).
const outerPath = (W: number) =>
  `M${W - 8} 0 C${W - 8} 4.41828 ${W - 4.41828} 8 ${W} 8 V88 ` +
  `C${W - 4.41828} 88 ${W - 8} 91.5817 ${W - 8} 96 H8 ` +
  `C8 91.5817 4.41828 88 0 88 V8 ` +
  `C4.41828 8 8 4.41828 8 0 H${W - 8} Z`

// Inner border — 88 tall, IW wide. Same notch geometry shrunk to ~7.8px so
// the corners read as parallel inset arcs rather than collapsing on top of
// the outer. Constants below come from the Figma source (filter-baked).
const innerPath = (IW: number) =>
  `M${IW - 7.809} 0 C${IW - 7.809} 3.92343 ${IW - 4.528} 7.12767 ${IW - 0.402} 7.32422 ` +
  `L${IW} 7.33301 V80.667 ` +
  `C${IW - 4.312} 80.667 ${IW - 7.809} 83.9499 ${IW - 7.809} 88 H7.80859 ` +
  `C7.80859 84.0764 4.5272 80.8721 0.40137 80.6758 L0 80.667 V7.33301 ` +
  `C4.17774 7.3329 7.58894 4.25179 7.79785 0.37695 L7.80859 0 H${IW - 7.809} Z`

export default function MarkerTicket({
  tone,
  icon,
  lead,
  title,
  width      = 314,
  ruleHeight = 48,
  padRight   = 4,
}: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [rotate, setRotate] = useState(0)
  const uid = useId().replace(/:/g, '')
  const fillId   = `mt-fill-${uid}`
  const outerFid = `mt-paper-outer-${uid}`
  const innerFid = `mt-paper-inner-${uid}`
  const innerW   = width - 8

  useEffect(() => {
    const anchor = ref.current?.parentElement
    if (!anchor) return
    let wasOpen = anchor.classList.contains('is-open')
    if (wasOpen) setRotate((Math.random() - 0.5) * 4)
    const obs = new MutationObserver(() => {
      const open = anchor.classList.contains('is-open')
      if (open && !wasOpen) setRotate((Math.random() - 0.5) * 4)
      wasOpen = open
    })
    obs.observe(anchor, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  return (
    <div
      ref={ref}
      className={`marker-ticket marker-ticket--${tone}`}
      role="img"
      aria-label={`${lead} ${title}`}
      style={{
        '--marker-ticket-rotate':   `${rotate}deg`,
        '--marker-ticket-w':        `${width}px`,
        '--marker-ticket-inner-w':  `${innerW}px`,
        '--marker-ticket-rule-h':   `${ruleHeight}px`,
        '--marker-ticket-pad-r':    `${padRight}px`,
      } as CSSProperties}
    >
      <svg className="marker-ticket__outer" viewBox={`0 0 ${width} 96`} aria-hidden="true">
        <defs>
          <linearGradient id={fillId} x1="0" y1="0" x2={width} y2="96" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="var(--marker-ticket-fill-a)" />
            <stop offset="1" stopColor="var(--marker-ticket-fill-b)" />
          </linearGradient>
          <filter id={outerFid} x="-2%" y="-6%" width="104%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0125" numOctaves={3} seed={3047} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={1} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path filter={`url(#${outerFid})`} d={outerPath(width)} fill={`url(#${fillId})`} />
      </svg>
      <svg className="marker-ticket__inner" viewBox={`0 0 ${innerW} 88`} aria-hidden="true">
        <defs>
          <filter id={innerFid} x="-2%" y="-6%" width="104%" height="112%">
            <feTurbulence type="fractalNoise" baseFrequency="0.0125" numOctaves={3} seed={1514} result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale={1} xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
        <path filter={`url(#${innerFid})`} d={innerPath(innerW)} fill="none" stroke="var(--marker-ticket-stroke)" />
      </svg>
      <div className="marker-ticket__body">
        <span className="marker-ticket__icon" aria-hidden="true">{icon}</span>
        <span className="marker-ticket__rule" aria-hidden="true" />
        <div className="marker-ticket__copy">
          <p className="marker-ticket__lead t-p3">{lead}</p>
          <p className="marker-ticket__title t-h5">{title}</p>
        </div>
      </div>
    </div>
  )
}
