'use client'

// useReveal — one-shot scroll-triggered entrance animation.
//
// Adds `.revealed` to the target element when it enters the viewport.
// Uses IntersectionObserver with { once: true }.
//
// Two gates run BEFORE observation begins, so a section's entrance plays as
// the page appears rather than fighting (or hiding behind) a page-level one:
//
//   1. Page gate (hard load). On a cold load every surface is held at
//      opacity:0 behind the .page-boot loader until the gate releases
//      (`.fonts-ready` on <html>, set by the script in layout.tsx). Without
//      this wait, IntersectionObserver fires while the section is still behind
//      the invisible gate (opacity doesn't affect intersection), so the
//      reveal plays unseen and the page flat-flips to already-placed content.
//      Waiting for `.fonts-ready` makes the section settle in AS the page
//      reveals. If the class is already present (client nav, or a fast load
//      that landed it before this effect), we skip straight through.
//      Timeout-bounded: the gate has a CSS-only failsafe that reveals the
//      page at 8s WITHOUT setting the class (JS-fail path), so we proceed
//      anyway just past that — otherwise sections would stay at opacity:0.
//
//   2. Transition gate (client nav). TransitionSlot adds `.transitioning` to
//      .workbench while its page transition plays; we wait for its removal so
//      section reveals don't fight the page-level entrance. On hard load
//      `.transitioning` is never set.

import { useEffect, useRef, type RefObject } from 'react'
import { GATE_FAILSAFE_MS } from '../lib/gate'

const ROOT_MARGIN = '-60px'
const THRESHOLD = 0
// GATE_FAILSAFE_MS sits just past the page gate's own --dur-gate-cap CSS
// failsafe (app/lib/gate.ts) — so if `.fonts-ready` never lands, sections
// still reveal rather than staying hidden forever.

export function useReveal(ref: RefObject<HTMLElement | null>) {
  const revealed = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || revealed.current) return

    let io: IntersectionObserver | undefined
    const cleanups: Array<() => void> = []

    const observe = () => {
      if (revealed.current) return
      io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed')
            revealed.current = true
            io?.disconnect()
          }
        },
        { rootMargin: ROOT_MARGIN, threshold: THRESHOLD },
      )
      io.observe(el)
    }

    // Gate 2 — wait out a client-side page transition, then observe.
    const afterPageGate = () => {
      const wb = document.querySelector('.workbench')
      if (wb?.classList.contains('transitioning')) {
        const mo = new MutationObserver(() => {
          if (!wb.classList.contains('transitioning')) {
            mo.disconnect()
            observe()
          }
        })
        mo.observe(wb, { attributes: true, attributeFilter: ['class'] })
        cleanups.push(() => mo.disconnect())
        return
      }
      observe()
    }

    // Gate 1 — wait for the page gate to release on hard load.
    const html = document.documentElement
    if (html.classList.contains('fonts-ready')) {
      afterPageGate()
    } else {
      let done = false
      const proceed = () => {
        if (done) return
        done = true
        gateMo.disconnect()
        clearTimeout(timer)
        afterPageGate()
      }
      const gateMo = new MutationObserver(() => {
        if (html.classList.contains('fonts-ready')) proceed()
      })
      gateMo.observe(html, { attributes: true, attributeFilter: ['class'] })
      const timer = setTimeout(proceed, GATE_FAILSAFE_MS)
      cleanups.push(() => {
        gateMo.disconnect()
        clearTimeout(timer)
      })
    }

    return () => {
      io?.disconnect()
      cleanups.forEach((fn) => fn())
    }
  }, [ref])
}
