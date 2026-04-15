// ExitMarker — fixed right-side exit marker, mirrors ProjectMarker.
// Links back to the works index (/selected).

import Link from 'next/link'

export default function ExitMarker() {
  return (
    <div className="exit-marker">
      <Link href="/selected" className="nav-marker nav-marker--exit" aria-label="Back to works">
        <span className="nav-marker__content">
          <span className="nav-icon" aria-hidden="true">arrow_downward</span>
          <span className="nav-marker__exit-label">EXIT</span>
        </span>
      </Link>
    </div>
  )
}
