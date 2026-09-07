'use client'

// HashLanding — makes `/rr#cards`, `/biconomy#demos` etc. actually land on
// their chapter. Mounted once per case-study route with the chapter ids it
// honours; renders nothing.
//
// THE BUG IT EXISTS FOR (production-only — `next dev` resolves these fine):
// the browser resolves a hash anchor against the streaming, pre-hydration
// layout, which on these routes is ~2.5k px TALLER than the settled one. It
// scrolls to a position that no longer means anything, the document collapses
// under it, and the reader is clamped to the very BOTTOM of the case study.
// Measured on nihar.works: `#ux-audit`, `#demos` and `#bips` all landed at
// maxScroll, whatever their real position.
//
// So the browser's anchor is not corrected, it is SUPPRESSED — the inline
// script in `app/(works)/layout.tsx` strips the hash during HTML parse, before
// the sections exist to anchor to, and stashes it on `window.__deepLink`. That
// leaves the page at a legitimate scroll 0 (the Signals cover). This component
// picks the stash up and places the reader deliberately, then puts the hash
// back. All of it happens behind the `.page-boot` gate, so no scroll churn is
// ever visible.
//
// Three details are load-bearing:
//   1. Position comes from OFFSET geometry, never getBoundingClientRect — an
//      unrevealed `.section-reveal` carries `transform: translateY(32px)`,
//      which rect includes and offsetTop doesn't. Measured live: rect 4428 vs
//      offset 4396 for the same section.
//   2. `.fonts-ready` is necessary but NOT sufficient. The case pages keep
//      moving for a beat after the gate releases (a target measured at 4284 on
//      the fonts-ready frame settled at 4428 forty ms later), so we poll until
//      the position actually stops changing before committing.
//   3. The glide runs with `is-overlay-open` set, which pauses
//      useDominanceSnap. Both routes give their first chapter `snapIdleMs={100}`,
//      so a snap can start inside our placement window and fight it.
//
// Reader intent always wins: a wheel/touch/pointer/key event during the window
// cancels the placement outright. We test for INTENT rather than diffing
// scrollY, because scrollGlide writes scrollY every frame — position alone
// can't tell us apart from the reader.

import { useEffect, useRef } from 'react'
import { scrollGlide } from '../lib/scrollGlide'
import { GATE_FAILSAFE_MS } from '../lib/gate'

// The settle distance. We place instantly this far ABOVE the chapter and glide
// down onto it, so a deep link 4,000px into a case study reads as the section
// settling into place rather than as a long scroll journey to nowhere.
const GLIDE_PX = 64
// Stop waiting for layout to hold still past this (measured from gate release).
const SETTLE_CAP_MS = 1500
const POLL_MS = 80
// Consecutive identical measurements that count as "layout has stopped".
const STABLE_SAMPLES = 2

interface DeepLinkWindow extends Window {
  __deepLink?: string
}

/** Document-absolute top, immune to the reveal transform (see note 1 above). */
function absoluteTop(el: HTMLElement): number {
  let y = 0
  let node: HTMLElement | null = el
  while (node) {
    y += node.offsetTop
    node = node.offsetParent as HTMLElement | null
  }
  return y
}

export default function HashLanding({ ids }: { ids: readonly string[] }) {
  // Held in a ref so the effect can run once on mount without taking the
  // array's render-to-render identity as a dependency.
  const idsRef = useRef(ids)
  idsRef.current = ids

  useEffect(() => {
    const w = window as DeepLinkWindow
    const id = w.__deepLink
    // NOT cleared on read: React StrictMode mounts, cleans up, and mounts
    // again in dev. Clearing here would let the first (immediately aborted)
    // pass eat the stash and leave the second with nothing to do.
    if (!id || !idsRef.current.includes(id)) return
    const el = document.getElementById(id)
    if (!el) return

    let cancelled = false
    const cleanups: Array<() => void> = []
    const stop = () => {
      cancelled = true
      cleanups.forEach((fn) => fn())
      cleanups.length = 0
    }

    const onIntent = () => {
      delete w.__deepLink // the reader has taken over; don't retry on remount
      stop()
    }
    const intents = ['wheel', 'touchstart', 'pointerdown', 'keydown'] as const
    intents.forEach((type) => {
      window.addEventListener(type, onIntent, { passive: true })
      cleanups.push(() => window.removeEventListener(type, onIntent))
    })

    const land = () => {
      if (cancelled) return
      delete w.__deepLink

      // Match useDockedMarker.navigate: the sheet's own top border is part of
      // where a chapter "starts", so the chapter menu and a deep link agree.
      const border = parseFloat(getComputedStyle(el).borderTopWidth) || 0
      const max = Math.max(0, document.documentElement.scrollHeight - window.innerHeight)
      const target = Math.min(max, Math.max(0, absoluteTop(el) + border))

      // The hash goes back on now that the position is ours, so the URL the
      // reader sees (and can copy) matches where they actually are.
      history.replaceState(null, '', `${location.pathname}${location.search}#${id}`)

      const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
      // A background tab freezes rAF (measured: 1 frame per second), so
      // scrollGlide would never advance and would strand the reader GLIDE_PX
      // short of the chapter with the URL claiming otherwise. This is a real
      // path, not a lab case: /shape-of-product's chips are target="_blank",
      // and a cmd-click opens them in the background. A glide nobody can watch
      // buys nothing — jump, and they arrive placed when they switch over.
      if (reduced || target <= GLIDE_PX || document.visibilityState !== 'visible') {
        window.scrollTo(0, target)
        return
      }

      const dur =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue('--dur-settle'),
        ) * 1000 || 425

      document.body.classList.add('is-overlay-open') // pause dominance-snap
      window.scrollTo(0, target - GLIDE_PX)
      const cancelGlide = scrollGlide(target, dur)
      const release = window.setTimeout(() => {
        document.body.classList.remove('is-overlay-open')
        // Backstop for a glide that stalled anyway — the tab was hidden AFTER
        // we started, or rAF was throttled mid-flight. Timers are clamped in
        // background tabs but they do still fire, so the landing still lands.
        if (Math.abs(window.scrollY - target) > 2) window.scrollTo(0, target)
      }, dur + 120)
      cleanups.push(() => {
        cancelGlide()
        window.clearTimeout(release)
        document.body.classList.remove('is-overlay-open')
      })
    }

    // Gate 2 — layout has to stop moving before the measurement means anything.
    const afterGate = () => {
      if (cancelled) return
      const t0 = performance.now()
      let last = -1
      let stable = 0
      const poll = () => {
        if (cancelled) return
        const now = absoluteTop(el)
        stable = now === last ? stable + 1 : 0
        last = now
        if (stable >= STABLE_SAMPLES || performance.now() - t0 > SETTLE_CAP_MS) {
          land()
          return
        }
        const timer = window.setTimeout(poll, POLL_MS)
        cleanups.push(() => window.clearTimeout(timer))
      }
      poll()
    }

    // Gate 1 — the page gate, same contract useReveal uses: proceed on
    // `.fonts-ready`, and proceed anyway just past the CSS failsafe so a
    // JS-fail path doesn't strand the reader at the top with a live hash.
    const html = document.documentElement
    if (html.classList.contains('fonts-ready')) {
      afterGate()
    } else {
      let proceeded = false
      const proceed = () => {
        if (proceeded) return
        proceeded = true
        gateMo.disconnect()
        window.clearTimeout(cap)
        afterGate()
      }
      const gateMo = new MutationObserver(() => {
        if (html.classList.contains('fonts-ready')) proceed()
      })
      gateMo.observe(html, { attributes: true, attributeFilter: ['class'] })
      const cap = window.setTimeout(proceed, GATE_FAILSAFE_MS)
      cleanups.push(() => {
        gateMo.disconnect()
        window.clearTimeout(cap)
      })
    }

    return stop
  }, [])

  return null
}
