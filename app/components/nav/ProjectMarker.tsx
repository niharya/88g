'use client'

// ProjectMarker — left-nav marker.
//
// Default behavior (no infoCard): clicking scrolls the page back to top
// (natural "home of this project" affordance).
//
// With infoCard: clicking toggles the route's info card anchored below the
// marker. Open state fills the info icon, applies aria-expanded, and starts
// a 12s auto-close timer. Each open click resets the timer.

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import NavMarker from '../NavMarker'

const AUTO_CLOSE_MS = 12000

interface Props {
  projectName?: string
  infoCard?:    ReactNode
}

export default function ProjectMarker({ projectName = 'Biconomy', infoCard }: Props) {
  const [open, setOpen] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const cancel = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = null
  }
  const arm = useCallback(() => {
    cancel()
    timerRef.current = setTimeout(() => setOpen(false), AUTO_CLOSE_MS)
  }, [])

  useEffect(() => () => cancel(), [])

  const handleClick = useCallback(() => {
    if (!infoCard) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    setOpen(prev => {
      const next = !prev
      if (next) arm()
      else cancel()
      return next
    })
  }, [infoCard, arm])

  return (
    <>
      <NavMarker
        as="button"
        role="project"
        icon="info"
        label={projectName}
        onClick={handleClick}
        className={open ? 'is-info-open' : undefined}
        aria-expanded={infoCard ? open : undefined}
      />
      {infoCard && (
        <div
          className={`marker-info-anchor${open ? ' is-open' : ''}`}
          aria-hidden={!open}
        >
          {infoCard}
        </div>
      )}
    </>
  )
}
