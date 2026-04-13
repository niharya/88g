'use client'

// useReveal — one-shot scroll-triggered entrance animation.
//
// Adds `.revealed` to the target element when it enters the viewport.
// Uses IntersectionObserver with { once: true }.
//
// Sequencing with TransitionSlot:
//   After client-side navigation, TransitionSlot adds `.transitioning` to
//   .workbench while the page transition plays. This hook waits for that
//   class to be removed before starting to observe — so section reveals
//   don't fight the page-level entrance animation.
//   On hard load, `.transitioning` is never set, so observation begins
//   immediately (gated only by fonts-ready via CSS).

import { useEffect, useRef, type RefObject } from 'react'

const ROOT_MARGIN = '-60px'
const THRESHOLD = 0

export function useReveal(ref: RefObject<HTMLElement | null>) {
  const revealed = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el || revealed.current) return

    const observe = () => {
      if (revealed.current) return
      const io = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            el.classList.add('revealed')
            revealed.current = true
            io.disconnect()
          }
        },
        { rootMargin: ROOT_MARGIN, threshold: THRESHOLD },
      )
      io.observe(el)
      return io
    }

    // If a page transition is in progress, wait for it to finish.
    const wb = document.querySelector('.workbench')
    if (wb?.classList.contains('transitioning')) {
      const mo = new MutationObserver(() => {
        if (!wb.classList.contains('transitioning')) {
          mo.disconnect()
          observe()
        }
      })
      mo.observe(wb, { attributes: true, attributeFilter: ['class'] })
      return () => mo.disconnect()
    }

    // No transition in progress — observe immediately.
    const io = observe()
    return () => io?.disconnect()
  }, [ref])
}
