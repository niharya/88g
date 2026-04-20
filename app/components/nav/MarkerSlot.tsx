'use client'

// MarkerSlot — persistent positioning wrapper for nav marker pills.
//
// Handles two jobs:
//   1. Fixed positioning (left or right edge of workbench)
//   2. Measurement: for the 'left' slot, publishes --project-marker-right
//      on <html> so the nav-sled can dock flush.
//
// Uses ResizeObserver (catches font loads, text changes, layout shifts),
// IntersectionObserver (catches visibility transitions, e.g. shell going
// from display:none → visible on route change), and matchMedia listeners
// for each breakpoint that changes --workbench-pad-x (the fixed pill
// slides horizontally without resizing, so ResizeObserver misses it).
//
// Set measure={false} on instances that should not write to the variable
// (e.g. /selected's static nav row, which positions the slot differently).
//
// Future: MarkerSlot will become the persistence point for cross-route
// transitions — the box stays mounted, only the inner content swaps.

import { useEffect, useRef, type ReactNode } from 'react'

interface MarkerSlotProps {
  position: 'left' | 'right'
  measure?: boolean
  children: ReactNode
}

export default function MarkerSlot({ position, measure = true, children }: MarkerSlotProps) {
  const slotRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (position !== 'left' || !measure) return
    const el = slotRef.current
    if (!el) return

    const publish = () => {
      const right = el.getBoundingClientRect().right
      // Skip when element has no layout (display: none)
      if (right === 0) return
      document.documentElement.style.setProperty('--project-marker-right', `${right}px`)
    }

    publish()

    // ResizeObserver: catches content changes (text, font load)
    const ro = new ResizeObserver(publish)
    ro.observe(el)

    // IntersectionObserver: catches visibility transitions
    // (shell going from display:none → visible on route change)
    const io = new IntersectionObserver((entries) => {
      if (entries[0]?.isIntersecting) publish()
    })
    io.observe(el)

    window.addEventListener('resize', publish, { passive: true })

    // Breakpoints that change --workbench-pad-x (pill's fixed `left`).
    // ResizeObserver fires on size-only changes, so a position-only shift
    // at a media-query crossing (same pill width, new left) is missed
    // without this. Also covers routes that scope their own pad override
    // via :has() — the class/route change lands in the same frame as
    // the media condition the listener is already watching.
    const mqs = [
      window.matchMedia('(max-width: 767px)'),
      window.matchMedia('(max-width: 1023px)'),
    ]
    mqs.forEach(mq => mq.addEventListener('change', publish))

    // Re-publish when the workbench's class list changes (route swap
    // toggles `route-rr` etc., which drives :has()-scoped overrides).
    // Watch the workbench for route swaps: a route root is a direct child of
    // .workbench, and routes scope their own pad via `:has(.route-*)`. When
    // the route node swaps, --workbench-pad-x can change (same pill width,
    // different `left`) — we need a re-publish on the next frame so the
    // pill's new viewport-right lands in --project-marker-right.
    const workbench = el.closest('.workbench')
    const republish = () => requestAnimationFrame(publish)
    const mo = workbench ? new MutationObserver(republish) : null
    if (mo && workbench) {
      // Workbench class flip OR a direct child swap (route root) are the
      // two ways --workbench-pad-x can change. Both land here.
      mo.observe(workbench, { attributes: true, attributeFilter: ['class'], childList: true })
    }

    return () => {
      ro.disconnect()
      io.disconnect()
      mo?.disconnect()
      mqs.forEach(mq => mq.removeEventListener('change', publish))
      window.removeEventListener('resize', publish)
    }
  }, [position, measure])

  const className = position === 'left' ? 'project-marker' : 'exit-marker'

  return (
    <div ref={slotRef} className={className}>
      {children}
    </div>
  )
}
