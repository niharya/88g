'use client'

// PrivacyReturn — the notice's two "return" affordances, both pointed at the
// route the visitor actually arrived from (not a fixed home).
//
//   • variant="marker" (top) — the shared ReturnMarker primitive (flat exit
//     link), toned to the stationery palette via the `.privacy-exit` wrapper.
//   • variant="block" (bottom) — the stationery bordered button.
//
// Destination is resolved from the `privacy-from` route the Footer's Privacy
// link writes to sessionStorage on click, so "Return" goes back where you came
// from. The LABEL stays generic ("Return" / "Return to nihar.works", the
// prototype's wording) — only the href is dynamic. Read in a useLayoutEffect
// so the href is correct before paint.
//
// (Supersedes PrivacyBackLink — same session-flag mechanism; this borrows the
// /all marker idiom instead of rendering a toned project chip.)

import { useLayoutEffect, useState } from 'react'
import ReturnMarker from '../../components/ReturnMarker'

// Routes the Footer marks as a Privacy source → where "Return" should go back.
const HREFS: Record<string, string> = {
  '/all': '/all',
  '/biconomy': '/biconomy',
  '/rr': '/rr',
  '/marks': '/marks',
  '/': '/',
}

const FALLBACK_HREF = '/'
const STORAGE_KEY = 'privacy-from'

export default function PrivacyReturn({ variant }: { variant: 'marker' | 'block' }) {
  const [href, setHref] = useState(FALLBACK_HREF)

  useLayoutEffect(() => {
    let from: string | null = null
    try {
      from = sessionStorage.getItem(STORAGE_KEY)
    } catch {
      // sessionStorage can throw in private browsing — fall through to home.
    }
    if (from && HREFS[from]) setHref(HREFS[from])
  }, [])

  if (variant === 'marker') {
    return (
      <div className="privacy-exit">
        <ReturnMarker href={href} label="Return" aria-label="Return to where you came from" />
      </div>
    )
  }

  return (
    <a href={href} className="privacy__return-block">
      <span className="privacy__return-arrow" aria-hidden="true">
        &larr;
      </span>{' '}
      Return to nihar.works
    </a>
  )
}
