// ExitMarker — fixed right-side exit pill. Links back to the works index.

import NavMarker from '../NavMarker'

export default function ExitMarker() {
  return (
    <div className="exit-marker">
      <NavMarker
        as="a"
        href="/selected"
        role="exit"
        icon="arrow_downward"
        label="EXIT"
        aria-label="Back to works"
      />
    </div>
  )
}
