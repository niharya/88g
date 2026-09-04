'use client'

// VersionSkewWatcher — keeps a long-open tab from operating a stale deploy.
//
// The failure this closes: HTML is served must-revalidate, so a REFRESH always
// gets the newest page — but an already-open tab keeps its old JS bundle
// running, and that old code happily performs client-side navigations against
// the NEW deploy's server (old components + new payloads + purged chunks). The
// visitor sees the "wonky version" mixed state, and nothing recovers it short
// of a manual hard refresh. You can't push a reload to a device; the tab has
// to notice on its own.
//
// Mechanism: the shipped version is baked into the bundle at build time
// (NEXT_PUBLIC_APP_VERSION, next.config.mjs) and also rides every response as
// the `X-App-Version` header (the same beacon `npm run smoke -- --wait` polls).
// When a tab is returned to after being hidden for a while — the only window
// in which a deploy can realistically have happened — a HEAD request compares
// the two, and on mismatch reloads while the visitor is still orienting, so
// stale code never gets to navigate.
//
// Deliberate restraint:
//   • Only on RETURN to the tab (visibilitychange → visible, or a bfcache
//     pageshow restore) after DWELL_MS hidden — never on a timer, never
//     mid-reading. A reload at this moment repaints what the visitor is
//     already looking at; it does not yank a scroll position mid-scroll.
//   • Never while any form control holds input — a reload would eat a
//     half-written contact-form message. Skew resolves on their next visit.
//   • Fails silent: offline / missing header / fetch error → do nothing.

import { useEffect } from 'react'

const DWELL_MS = 60_000 // hidden at least this long before a check is due
const THROTTLE_MS = 60_000 // at most one HEAD per minute

export default function VersionSkewWatcher() {
  useEffect(() => {
    const builtVersion = process.env.NEXT_PUBLIC_APP_VERSION
    if (!builtVersion) return

    let hiddenAt = 0
    let lastCheck = 0

    const formHasInput = () =>
      Array.from(
        document.querySelectorAll<HTMLInputElement | HTMLTextAreaElement>('input, textarea'),
      ).some((el) => el.value.trim() !== '')

    const check = async () => {
      const now = Date.now()
      if (now - lastCheck < THROTTLE_MS) return
      lastCheck = now
      try {
        const res = await fetch(window.location.pathname, {
          method: 'HEAD',
          cache: 'no-store',
        })
        const live = res.headers.get('x-app-version')
        if (
          live &&
          live !== builtVersion &&
          document.visibilityState === 'visible' &&
          !formHasInput()
        ) {
          window.location.reload()
        }
      } catch {
        /* offline or blocked — stale is better than broken here */
      }
    }

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') {
        hiddenAt = Date.now()
      } else if (hiddenAt && Date.now() - hiddenAt >= DWELL_MS) {
        void check()
      }
    }
    const onPageShow = (e: PageTransitionEvent) => {
      // A bfcache restore revives the whole old JS heap — same exposure as a
      // long-hidden tab, no dwell needed.
      if (e.persisted) void check()
    }

    document.addEventListener('visibilitychange', onVisibility)
    window.addEventListener('pageshow', onPageShow)
    return () => {
      document.removeEventListener('visibilitychange', onVisibility)
      window.removeEventListener('pageshow', onPageShow)
    }
  }, [])

  return null
}
