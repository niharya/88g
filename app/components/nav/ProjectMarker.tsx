'use client'

// ProjectMarker — left-nav marker.
//
// Default behavior (no infoCard): clicking scrolls the page back to top
// (natural "home of this project" affordance).
//
// With infoCard: clicking toggles the route's info card anchored below the
// marker. Open state fills the info icon, paints the marker in its hover
// shell (switch "pressed" feel), and applies aria-expanded. The card
// collapses on scroll — scrolling the page is the primary dismissal, so
// the marker reads as a held toggle tied to card visibility. A 12s auto-
// close timer runs as a safety net for idle sessions.

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import NavMarker from '../NavMarker'

const AUTO_CLOSE_MS = 12000
const SCROLL_CLOSE_THRESHOLD = 4

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

  useEffect(() => {
    if (!open) return
    const startY = window.scrollY
    const onScroll = () => {
      if (Math.abs(window.scrollY - startY) > SCROLL_CLOSE_THRESHOLD) {
        cancel()
        setOpen(false)
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [open])

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
