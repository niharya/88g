// ExitMarker — fixed right-side exit marker. Links back to the works hub
// (/all), landing on the Longform browse mode (?cases) so a case-study exit
// returns to the timeline the visitor came from, not the resting invite.
//
// acknowledgeOnClick='press' holds the pressed shell through the departure
// (docs/navigation-choreography.md §5.6 — every nav entry point acknowledges
// on the same frame). The held value is the one :active already paints, so
// this adds no new CSS: the press simply stops releasing mid-navigation.
//
// The press is marker-scale feedback; the PAGE-scale half is `onClick`, which
// the works shell fills with its departure lift (ShellNav → departureLift.ts).
// It arrives as a prop rather than an import because this file sits in the
// shared components layer and the lift belongs to the (works) group — shared
// code never reaches up into a route group.

import type { MouseEvent } from 'react'
import NavMarker from '../NavMarker'

export default function ExitMarker({ onClick }: { onClick?: (e: MouseEvent<HTMLAnchorElement>) => void }) {
  return (
    <div className="exit-marker">
      <NavMarker
        as="a"
        href="/all?cases"
        role="exit"
        icon="arrow_downward"
        label="EXIT"
        acknowledgeOnClick="press"
        onClick={onClick}
        aria-label="Back to works"
      />
    </div>
  )
}
