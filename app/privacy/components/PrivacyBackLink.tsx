'use client'

// PrivacyBackLink — dynamic back marker that mirrors the route the user
// arrived from. The Footer's Privacy link writes a `from-privacy` flag
// to sessionStorage on click; this component reads it on mount and
// renders a NavMarker labelled and toned to match that source. So:
//   • from /selected → "Works" with terra tone
//   • from /biconomy → "Biconomy" with mint tone (the route's accent)
//   • from /rr      → "Rug Rumble" with terra tone
//   • from /        → plain "Back" marker (intentionally NOT "Nihar" —
//                     the landing's nameplate is its own object and
//                     shouldn't be re-rendered as a back-link styled
//                     copy here)
//   • direct visit / unknown → "Back" with neutral tone, returns home.
//
// Reads sessionStorage in a useLayoutEffect so the button text is right
// before paint (no flash of "Back" while the JS picks the source).

import { useLayoutEffect, useState } from 'react'
import NavMarker from '../../components/NavMarker'

type BackTarget = {
  href: string
  label: string
  tone: 'neutral' | 'terra' | 'mint'
}

const TARGETS: Record<string, BackTarget> = {
  '/selected':  { href: '/selected',  label: 'Works',      tone: 'terra'   },
  '/biconomy':  { href: '/biconomy',  label: 'Biconomy',   tone: 'mint'    },
  '/rr':        { href: '/rr',        label: 'Rug Rumble', tone: 'terra'   },
  '/':          { href: '/',          label: 'Back',       tone: 'neutral' },
  '/marks':     { href: '/marks',     label: 'Marks',      tone: 'neutral' },
}

const FALLBACK: BackTarget = { href: '/', label: 'Back', tone: 'neutral' }

const STORAGE_KEY = 'privacy-from'

export default function PrivacyBackLink() {
  const [target, setTarget] = useState<BackTarget>(FALLBACK)

  useLayoutEffect(() => {
    let from: string | null = null
    try {
      from = sessionStorage.getItem(STORAGE_KEY)
    } catch {
      // sessionStorage may throw in private browsing on some browsers;
      // fall through to the fallback target.
    }
    if (from && TARGETS[from]) {
      setTarget(TARGETS[from])
    }
  }, [])

  return (
    <NavMarker
      as="a"
      href={target.href}
      role="project"
      tone={target.tone}
      icon="arrow_back"
      label={target.label}
    />
  )
}
