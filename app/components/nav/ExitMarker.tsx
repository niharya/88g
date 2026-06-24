// ExitMarker — fixed right-side exit marker. Links back to the works hub
// (/all), landing on the Longform browse mode (?cases) so a case-study exit
// returns to the timeline the visitor came from, not the resting invite.

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
        aria-label="Back to works"
      />
    </div>
  )
}
