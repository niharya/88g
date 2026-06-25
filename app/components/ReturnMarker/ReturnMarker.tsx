'use client'

// ReturnMarker — the flat, chip-less "back" link built on NavMarker(role="exit").
//
// Pairs with ExitMarker (the fixed white-on-art *chip* exit): "Marker" there is
// the chip; here "Marker" is its flat, in-flow sibling — the marker shell is
// stripped, the arrow points left, and the label reads as a dotted→solid
// underline link. Colour is consumer-driven via two custom properties so the
// primitive stays stateless:
//
//   --return-marker-ink        rest colour   (fallback --grey-720)
//   --return-marker-ink-hover  hover colour  (fallback --grey-560)
//
// Set those on any ancestor. Consumers: /all (BenchExitMarker → "Nihar", links
// home) and /privacy (PrivacyReturn → "Return", links to the route the visitor
// came from). The styling lives in navmarker.css under `.return-marker`; any
// route that renders this must already import navmarker.css (every marker
// consumer does).
//
// Side-effects (e.g. setting a `nav-direction` flag for the landing's entrance
// animation) stay with the consumer via `onClick` — the primitive only renders.

import NavMarker from '../NavMarker'

type Props = {
  href: string
  label: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLAnchorElement>
  'aria-label'?: string
}

export default function ReturnMarker({ href, label, onClick, ...rest }: Props) {
  return (
    <NavMarker
      as="a"
      href={href}
      role="exit"
      icon="arrow_back"
      className="return-marker"
      label={label}
      onClick={onClick}
      aria-label={rest['aria-label']}
    />
  )
}
