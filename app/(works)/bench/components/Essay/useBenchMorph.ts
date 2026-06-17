'use client'

// useBenchMorph — the bench's state machine + ticket choreography.
//
// Ported from the design prototype's Component class, re-expressed under our
// motion policy: the ticket geometry glide and the page scroll both run on
// --ease-paper for ~--dur-glide, so they stay in lockstep; the prototype's
// overshoot "pop" is dropped (a clean glide, no scale bounce). Reduced motion
// snaps to end-states with no animation.
//
// State: view (invite|browse) · active (lf|vis) · condensed · closing.
// The declarative `condensed`/`active` drive the ticket's inner reshape (via
// Ticket's inline values); the GEOMETRY (position/top/left/width/height) is
// written imperatively on the ticket node, exactly as the prototype does.

import { useCallback, useEffect, useRef, useState } from 'react'
import { scrollGlide } from '../../../../lib/scrollGlide'

export type BenchView = 'invite' | 'browse'
export type BenchActive = 'lf' | 'vis'

const NAVBAR_W = 296
const NAVBAR_H = 56
const NAVBAR_TOP = 14
const MORPH_MS = 650            // mirrors --dur-glide; shared by glide + geometry
const FREEZE_MS = 20            // reflow gap between freeze and animate
const MOUNT_MS = 45            // let the work panel mount before measuring
const CLOSE_LEAD_MS = 120       // work content leads the sheet on close
const FRAMED_FRAC = 0.34        // close lands the ticket ~34% down the viewport
const EASE = 'cubic-bezier(0.5, 0, 0.2, 1)'   // == --ease-paper

const GEOM_PROPS = ['top', 'left', 'width', 'height'] as const
const RESET_PROPS = [
  'transition', 'position', 'top', 'left', 'right', 'bottom',
  'width', 'height', 'margin', 'zIndex', 'transform', 'transformOrigin', 'animation',
] as const

function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useBenchMorph() {
  const [view, setView] = useState<BenchView>('invite')
  const [active, setActive] = useState<BenchActive>('lf')
  const [condensed, setCondensed] = useState(false)
  const [closing, setClosing] = useState(false)

  const slotRef = useRef<HTMLDivElement>(null)
  const ticketRef = useRef<HTMLDivElement>(null)
  const workRef = useRef<HTMLDivElement>(null)
  const restH = useRef(0)
  const timers = useRef<number[]>([])

  const after = (ms: number, fn: () => void) => {
    timers.current.push(window.setTimeout(fn, ms))
  }
  const clearTimers = () => {
    timers.current.forEach(id => clearTimeout(id))
    timers.current = []
  }
  useEffect(() => () => clearTimers(), [])

  const geomTransition = () =>
    GEOM_PROPS.map(p => `${p} ${MORPH_MS}ms ${EASE}`).join(',')

  // Reflect the browse state in the URL without a navigation (shareable +
  // survives reload — page.tsx reads ?view server-side and re-enters browse).
  const syncUrl = (v: 'cases' | 'showcase' | null) => {
    if (typeof window === 'undefined') return
    window.history.replaceState(window.history.state, '', v ? `/bench?view=${v}` : '/bench')
  }
  const viewParam = (tab: BenchActive): 'cases' | 'showcase' => (tab === 'lf' ? 'cases' : 'showcase')

  const switchTab = useCallback((tab: BenchActive) => {
    setActive(prev => (prev === tab ? prev : tab))
    syncUrl(viewParam(tab))
  }, [])

  // Pin the ticket as a fixed navbar at the top-centre of the viewport.
  const pinTicket = (t: HTMLDivElement, left: number, animate: boolean) => {
    t.style.position = 'fixed'
    t.style.zIndex = '200'
    t.style.margin = '0'
    t.style.transformOrigin = 'center top'
    t.style.transition = animate ? geomTransition() : 'none'
    t.style.top = NAVBAR_TOP + 'px'
    t.style.left = left + 'px'
    t.style.width = NAVBAR_W + 'px'
    t.style.height = NAVBAR_H + 'px'
  }

  const openTab = useCallback((tab: BenchActive, opts?: { instant?: boolean; skipUrlSync?: boolean }) => {
    if (view === 'browse') { switchTab(tab); return }
    // `instant` skips the animation (reduced motion, or a deep-link arriving
    // already in browse mode — it shouldn't replay the morph). `skipUrlSync`
    // is for deep-links: the URL is already correct (/showcase, /cases, or
    // /bench?view=…) — don't clobber a pretty alias back to ?view=.
    const instant = !!opts?.instant || prefersReducedMotion()
    setView('browse')
    setActive(tab)
    if (!opts?.skipUrlSync) syncUrl(viewParam(tab))

    // Wait for the work panel to mount, then measure the ticket at rest.
    after(MOUNT_MS, () => {
      const t = ticketRef.current
      const slot = slotRef.current
      const work = workRef.current
      if (!t || !slot) return

      // Drop any retained WAAPI entrance transform on the transition pane. When
      // we arrived here via an in-shell client nav, TransitionSlot's entrance
      // animation finished with fill:both, leaving transform:translateY(0) on
      // .transition-pane — a non-none transform that makes the pane a containing
      // block and pins the fixed navbar to it (scrolls away) instead of the
      // viewport. The animation is already at its identity end-state, so
      // cancelling it is visually a no-op. (will-change:auto is handled in CSS.)
      document.querySelector('.transition-pane')?.getAnimations?.().forEach(a => a.cancel())

      const first = t.getBoundingClientRect()
      restH.current = first.height
      slot.style.minHeight = first.height + 'px'     // reserve the resting footprint
      const targetLeft = Math.round((window.innerWidth - NAVBAR_W) / 2)

      const scrollTarget = () =>
        work ? Math.round(work.getBoundingClientRect().top + window.scrollY) : 0

      if (instant) {
        setCondensed(true)
        pinTicket(t, targetLeft, false)
        window.scrollTo(0, scrollTarget())
        return
      }

      // Freeze the ticket exactly where it rests, as fixed.
      t.style.transition = 'none'
      t.style.position = 'fixed'
      t.style.zIndex = '200'
      t.style.margin = '0'
      t.style.transformOrigin = 'center top'
      t.style.top = first.top + 'px'
      t.style.left = first.left + 'px'
      t.style.width = first.width + 'px'
      t.style.height = first.height + 'px'

      // Force the freeze to commit, then condense + glide in lockstep.
      void t.offsetHeight
      after(FREEZE_MS, () => {
        setCondensed(true)
        pinTicket(t, targetLeft, true)
        scrollGlide(scrollTarget(), MORPH_MS)
      })
    })
  }, [view, switchTab])

  const closeTab = useCallback(() => {
    const t = ticketRef.current
    const slot = slotRef.current
    if (!t || !slot) {
      setView('invite'); setCondensed(false); setClosing(false)
      return
    }
    const reduce = prefersReducedMotion()

    // Phase 1 (leads): work content fades + sinks. Stays mounted so the page
    // keeps its height (no scroll-clamp jump).
    setClosing(true)

    const finish = () => {
      // Seamless fixed → static hand-off: measure, drop the inline fixed
      // styles so the ticket falls back into the slot, then compensate any
      // sub-pixel delta with an instant scrollBy (kills the end-jerk).
      const before = t.getBoundingClientRect().top
      RESET_PROPS.forEach(p => { t.style.setProperty(p, '') })
      slot.style.minHeight = ''
      const delta = t.getBoundingClientRect().top - before
      if (Math.abs(delta) > 0.5) window.scrollBy(0, delta)
      setView('invite')
      setClosing(false)
      syncUrl(null)
    }

    after(reduce ? 0 : CLOSE_LEAD_MS, () => {
      const r = slot.getBoundingClientRect()
      const slotDocTop = r.top + window.scrollY
      const desired = Math.round(window.innerHeight * FRAMED_FRAC)
      const closeScrollY = Math.max(0, Math.round(slotDocTop - desired))
      const landTop = Math.round(slotDocTop - closeScrollY)

      setCondensed(false)             // inner de-reshape, synced with the descent

      if (reduce) {
        t.style.transition = 'none'
        t.style.top = landTop + 'px'
        t.style.left = Math.round(r.left) + 'px'
        t.style.width = Math.round(r.width) + 'px'
        t.style.height = (restH.current || r.height) + 'px'
        window.scrollTo(0, closeScrollY)
        finish()
        return
      }

      t.style.animation = 'none'
      t.style.transition = geomTransition()
      requestAnimationFrame(() => {
        t.style.top = landTop + 'px'
        t.style.left = Math.round(r.left) + 'px'
        t.style.width = Math.round(r.width) + 'px'
        t.style.height = (restH.current || r.height) + 'px'
        scrollGlide(closeScrollY, MORPH_MS)
        after(MORPH_MS + 60, finish)
      })
    })
  }, [])

  return {
    view, active, condensed, closing,
    slotRef, ticketRef, workRef,
    openTab, switchTab, closeTab,
  }
}
