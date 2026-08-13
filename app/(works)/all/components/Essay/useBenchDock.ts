'use client'

// useBenchDock — the bench's two-view scroll. ONE ticket element foots the
// invitation at rest and lifts into a condensed navbar for the work view.
//
// Native scroll stays in charge — the ticket docks + condenses purely by READING
// the scroll position (`engaged` flips at the dock line), never by hijacking it.
//
// One gentle ASSIST, down only: once the reader has scrolled far enough that the
// ticket DOCKS (engaged) but stops before the card has fully cleared, an idle
// settle glides the rest of the way into the work view (Anchor 1 = `workY()`). It
// does NOT fire from the top of the zone (a small peek-scroll never yanks you in),
// and never fires upward — scrolling back toward the invitation is pure native
// scroll. Any glide ABORTS the instant the reader scrolls against it, so there's
// never a fight. Below the work view the long content scrolls free; reduced motion
// skips the assist entirely.

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { scrollGlide, isGlideActive } from '../../../../lib/scrollGlide'
import { analytics } from '../../../../lib/analytics'

export type BenchActive = 'vis' | 'lf'

const DOCK_TOP = 16    // matches `.is-pinned .bench-ticket { top: var(--space-16) }` in bench.css
const IDLE_MS  = 150   // settle fires this long after the last scroll (momentum has stopped by now)
const EPSILON  = 2     // don't bother gliding if we're already within this many px of the target

export function useBenchDock(initialActive: BenchActive) {
  const [active, setActive] = useState<BenchActive>(initialActive)
  const [engaged, setEngaged] = useState(false)
  const slotRef = useRef<HTMLDivElement>(null)
  const engagedRef = useRef(false)
  const lastYRef = useRef(0)
  const lastDirRef = useRef<'up' | 'down'>('down')
  // The in-flight glide (target + abort handle), so a counter-scroll can cancel it.
  const glideRef = useRef<{ target: number; cancel: () => void } | null>(null)

  // Departure-hold release — the landing mounts `#route-hold-departure` on a
  // Works click (app/page.tsx → markToBench) so the .page-boot loader covers a
  // stalled landing → /all navigation. The bench mounting IS the arrival, so
  // remove the marker here: the fonts-ready rules retake the cascade and the
  // standard loader exit + reveal replay. (This replaced /all's loading.tsx —
  // see ANOMALIES.md → "Route hold".)
  useLayoutEffect(() => {
    document.getElementById('route-hold-departure')?.remove()
  }, [])

  // Entrance ownership — three arrivals land on this page and only ONE of them
  // has no entrance of its own:
  //   1. COLD load / reload  → the page gate fades .workbench in, flat
  //   2. landing → /all      → SlideInOnNav's lateral `--slide-in`
  //   3. works ↔ works       → TransitionSlot's Exchange
  // Case 1 gets the settle (bench.css → "Entrance: the card settles when the
  // page gate lifts"). The test is ONE positive fact, not a survey of what the
  // other two are doing: a cold load is the only arrival where the page gate is
  // still HELD at mount, i.e. `.fonts-ready` is not yet on <html>. Both soft
  // navs run inside an already-released document, so the class never arms for
  // them — no ordering dependency on SlideInOnNav, and nothing to ask
  // TransitionSlot.
  //
  // Do NOT reintroduce a `.workbench.transitioning` check here: React runs
  // CHILD layout effects before PARENT ones, so this hook always runs before
  // TransitionSlot has set that class — the check reads false during an
  // Exchange and arms the settle on top of it (verified: /rr → /all ran
  // `bench-settle-in` and the Exchange together).
  //
  // The class only ARMS the animation; `html.fonts-ready` in the selector is
  // what STARTS it, so the card settles as the gate releases rather than at
  // mount. A pure CSS selector can't replace this — `.fonts-ready` persists
  // across soft navs, so it would fire on 2 and 3 too.
  useLayoutEffect(() => {
    if (document.documentElement.classList.contains('fonts-ready')) return
    document.querySelector('.bench-workbench')?.classList.add('bench-workbench--settle')
  }, [])

  // Deep-link tab selection — a mount-time read of the real browser URL. The
  // /cases & /showcase rewrites hide their destination query from the client
  // (useSearchParams never sees it) but never the browser PATHNAME, and the
  // /all?cases return seam is a real, client-visible query — so pathname +
  // query together cover every entry without a server searchParams read
  // (which would flip /all to request-time rendering and break full route
  // prefetch — ANOMALIES.md → "Deep-link entry & tab order"). Layout effect
  // so the swap off the prerendered default applies before first paint after
  // hydration — no visible wrong-tab frame. setActive, not openTab — a deep
  // link rests at the card, it never auto-scrolls into the work.
  useLayoutEffect(() => {
    const path = window.location.pathname.replace(/\/$/, '')
    const query = new URLSearchParams(window.location.search)
    const resolved: BenchActive | null =
      path === '/showcase' || query.has('showcase') ? 'vis' // showcase wins if both flags are present
      : path === '/cases' || query.has('cases') ? 'lf'
      : null
    if (resolved) setActive(resolved)
  }, [])

  // Reserve the resting footprint so the card doesn't collapse when the ticket
  // pins out (position:fixed). The placeholder stays in flow, so slot.top keeps
  // tracking the document position even while the ticket is fixed.
  useLayoutEffect(() => {
    const slot = slotRef.current
    if (slot) slot.style.minHeight = `${Math.round(slot.getBoundingClientRect().height)}px`
  }, [])

  // Clear the transition pane's retained entrance transform (it would become a
  // containing block and pin the fixed ticket to the pane). Paired with the
  // `will-change:auto` rule in bench.css.
  useEffect(() => {
    const clearPane = () =>
      document.querySelector('.transition-pane')?.getAnimations?.().forEach(a => a.cancel())
    const wb = document.querySelector('.workbench')
    if (!wb || !wb.classList.contains('transitioning')) { clearPane(); return }
    const obs = new MutationObserver(() => {
      if (!wb.classList.contains('transitioning')) { obs.disconnect(); clearPane() }
    })
    obs.observe(wb, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // Glide to a target Y under a duration token — DOWN into the work glides calmly
  // (`--dur-glide`), the reverse back to the invitation is snappier (`--dur-settle`)
  // — or instantly when the reader prefers reduced motion. The returned handle is
  // stashed so a counter-scroll can abort it (see the override check in update).
  const glideTo = useCallback((y: number, durVar = '--dur-glide') => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      window.scrollTo(0, y)
      return
    }
    const dur = parseFloat(
      getComputedStyle(document.documentElement).getPropertyValue(durVar),
    ) * 1000
    const cancel = scrollGlide(y, dur || 650)
    glideRef.current = { target: y, cancel }
  }, [])

  // Anchor 1 — the work view: the work panel's top at the viewport top, so the
  // card has scrolled FULLY away and only the docked ticket + the work show.
  const workY = useCallback(() => {
    const work = document.querySelector('.bench-work')
    if (work) return Math.max(0, Math.round(work.getBoundingClientRect().top + window.scrollY))
    const slot = slotRef.current
    if (!slot) return 0
    return Math.max(0, Math.round(slot.getBoundingClientRect().top + window.scrollY - DOCK_TOP))
  }, [])

  useEffect(() => {
    let idleTimer: number | null = null

    // The assist — DOWN only, and only to FINISH a committed descent: the ticket
    // must already be docked (engaged), the reader heading down and stopped before
    // the work view. A peek-scroll from the top (not yet docked) is left alone, and
    // upward scrolling is never assisted. Never fires mid-glide or under reduced motion.
    const settle = () => {
      if (isGlideActive()) return
      if (!engagedRef.current) return             // not docked yet → a small peek, leave it
      if (lastDirRef.current !== 'down') return   // reverse scroll is pure native — leave it
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
      const w = workY()
      const y = window.scrollY
      if (y >= w - EPSILON) return                // already at / past the work view
      glideTo(w, '--dur-glide')                   // finish the descent so the card clears
    }

    const update = () => {
      const slot = slotRef.current
      if (!slot) return
      const y = window.scrollY

      // Hand control back the instant the reader scrolls AGAINST an in-flight glide.
      // The glide's own writes always move toward its target; a move the other way
      // can only be the reader, so abort and let native scroll take over.
      const g = glideRef.current
      if (g) {
        if (!isGlideActive()) {
          glideRef.current = null
        } else {
          const moved  = y - lastYRef.current
          const toward = g.target - lastYRef.current
          if (moved !== 0 && Math.sign(moved) !== Math.sign(toward)) {
            g.cancel()
            glideRef.current = null
          }
        }
      }

      if (y !== lastYRef.current) lastDirRef.current = y > lastYRef.current ? 'down' : 'up'
      lastYRef.current = y

      // engaged = pin + condense, one unit. Reads the dock line; never hijacks.
      const nextEngaged = slot.getBoundingClientRect().top <= DOCK_TOP + 1
      if (nextEngaged !== engagedRef.current) { engagedRef.current = nextEngaged; setEngaged(nextEngaged) }

      if (idleTimer !== null) window.clearTimeout(idleTimer)
      idleTimer = window.setTimeout(settle, IDLE_MS)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      if (idleTimer !== null) window.clearTimeout(idleTimer)
    }
  }, [glideTo, workY])

  // A tab click glides into the work if we're still resting at the invitation;
  // if already engaged, just swap the content (keeps scroll position).
  const openTab = useCallback((tab: BenchActive) => {
    analytics.browseMode(tab === 'vis' ? 'showcase' : 'cases')
    setActive(tab)
    if (!engagedRef.current) glideTo(workY())
  }, [glideTo, workY])

  // ✕ — return to the invitation (snappy, like the reverse scroll).
  const close = useCallback(() => glideTo(0, '--dur-settle'), [glideTo])

  return { active, engaged, slotRef, openTab, close }
}
