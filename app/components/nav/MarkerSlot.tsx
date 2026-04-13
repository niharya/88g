'use client'

// MarkerSlot — persistent positioning wrapper for nav marker pills.
//
// Handles two jobs:
//   1. Fixed positioning (left or right edge of workbench)
//   2. Measurement: for the 'left' slot, publishes --project-marker-right
//      on <html> so the nav-sled can dock flush.
//
// Uses ResizeObserver (catches font loads, text changes, layout shifts) and
// IntersectionObserver (catches visibility transitions, e.g. shell going
// from display:none → visible on route change).
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

    return () => {
      ro.disconnect()
      io.disconnect()
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
