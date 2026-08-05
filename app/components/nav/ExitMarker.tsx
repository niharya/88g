// ExitMarker — fixed right-side exit marker. Links back to the works hub
// (/all), landing on the Longform browse mode (?cases) so a case-study exit
// returns to the timeline the visitor came from, not the resting invite.
//
// acknowledgeOnClick='press' holds the pressed shell through the departure
// (docs/navigation-choreography.md §5.6 — every nav entry point acknowledges
// on the same frame). The held value is the one :active already paints, so
// this adds no new CSS: the press simply stops releasing mid-navigation.

import NavMarker from '../NavMarker'

export default function ExitMarker() {
  return (
    <div className="exit-marker">
      <NavMarker
        as="a"
        href="/all?cases"
        role="exit"
        icon="arrow_downward"
        label="EXIT"
        acknowledgeOnClick="press"
        aria-label="Back to works"
      />
    </div>
  )
}
