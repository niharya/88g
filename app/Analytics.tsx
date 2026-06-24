'use client'

// Umami analytics loader — privacy-first, cookieless, aggregate-only.
// ──────────────────────────────────────────────────────────────────
// Single consumer: the root layout. Lives at the app root (not in
// app/components/) on purpose — it's root infrastructure glue, not a shared
// design primitive, so it doesn't belong in the design-system catalog.
//
// • Loaded `afterInteractive` so it never sits in the page-gate critical path
//   (see layout.tsx's page-gate script) and can't cost first paint.
// • Served FIRST-PARTY through a Netlify proxy (netlify.toml → /_stats/*): the
//   script loads from /_stats/script.js and the tracker POSTs beacons to
//   /_stats/api/send (`data-host-url="/_stats"`, which the tracker resolves
//   against our origin). Ad-blockers target `cloud.umami.is` by name, so
//   first-party routing recovers the chunk of this (blocker-heavy) audience
//   they'd otherwise eat — and the browser only ever talks to our own origin,
//   so the CSP needs just 'self'. NOTE: the proxy only runs on Netlify, so the
//   script can't load under local `next dev` — that's fine (localhost wouldn't
//   send anyway, see data-domains).
// • `data-domains` pins tracking to the production host, so deploy-previews and
//   local dev never reach the dashboard.
// • Gated on the visitor's opt-out signals — Global Privacy Control (the living
//   successor to Do Not Track) or a DNT header of '1'. If either is set the
//   script is never injected, so no request is made on their behalf.
//
// Umami is cookieless and writes nothing to the device. The website id comes
// from NEXT_PUBLIC_UMAMI_ID (netlify.toml), with the public id as a safety
// default so a missing env var can't silently kill analytics. See
// docs/analytics-prd.md.

import Script from 'next/script'
import { useEffect, useState } from 'react'

const SCRIPT_SRC = '/_stats/script.js'
const HOST_URL = '/_stats'
const WEBSITE_ID =
  process.env.NEXT_PUBLIC_UMAMI_ID || '07cb233d-26f2-4dbb-98c8-546cf12d602f'
const PROD_HOST = 'nihar.works'

export default function Analytics() {
  const [allowed, setAllowed] = useState(false)

  useEffect(() => {
    const nav = navigator as Navigator & {
      globalPrivacyControl?: boolean
      doNotTrack?: string | null
    }
    const win = window as Window & { doNotTrack?: string | null }
    const optedOut =
      nav.globalPrivacyControl === true ||
      nav.doNotTrack === '1' ||
      win.doNotTrack === '1'
    if (!optedOut) setAllowed(true)
  }, [])

  // Production builds only (Netlify prod + deploy-previews). Skipping local
  // `next dev` avoids a console 404 — the /_stats proxy only exists on Netlify.
  if (!allowed || !WEBSITE_ID || process.env.NODE_ENV !== 'production') return null

  return (
    <Script
      src={SCRIPT_SRC}
      strategy="afterInteractive"
      data-website-id={WEBSITE_ID}
      data-host-url={HOST_URL}
      data-domains={PROD_HOST}
    />
  )
}
