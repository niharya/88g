'use client'

// MarksExitMarker — EXIT marker for the /marks route.
//
// /marks lives outside the (works) shell and so outside TransitionSlot.
// The crossing back to the works hub (/all) is bridged by the shared
// CrossShellVeil primitive — the same veil that handles /all → marks on the way
// in, so both halves of the journey use one beat. See CLAUDE.md →
// "Cross-shell navigation".

import NavMarker from '../../components/NavMarker'
import { useCrossShellNav } from '../../components/CrossShellVeil'

export default function MarksExitMarker() {
  const onClick = useCrossShellNav('/all?cases')

  return (
    <div className="exit-marker">
      <NavMarker
        as="a"
        href="/all?cases"
        role="exit"
        icon="arrow_downward"
        label="EXIT"
        aria-label="Back to works"
        onClick={onClick}
      />
    </div>
  )
}
