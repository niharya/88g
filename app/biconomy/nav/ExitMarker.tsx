// ExitMarker — fixed right-side exit marker, mirrors ProjectMarker
// Links to /selection (page to be added later)

import Link from 'next/link'

export default function ExitMarker() {
  return (
    <div className="exit-marker">
      <Link href="/selection" className="nav-marker nav-marker--exit" aria-label="Exit to project selection">
        <span className="nav-marker__content">
          <span className="nav-icon" aria-hidden="true">arrow_downward</span>
          <span className="nav-marker__exit-label">EXIT</span>
        </span>
      </Link>
    </div>
  )
}
