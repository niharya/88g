'use client'

// ProjectMarker — left-nav project marker.
//
// Click is a TOGGLE between the Signals cover and the case body:
//   • away from Signals → glide up to the Signals cover (docked).
//   • already at Signals → glide back to where you came from (the position
//     saved on the way up), or the first content section if there's nothing
//     to return to.
// The info icon marks it as the route to the project's overview (Signals).
// (No drawer/info-card any more — Signals is a first-class chapter; TopSheet
// and MarkerTicket are parked.)
//
// Scrolls via the shared `scrollGlide` singleton (the same path
// useDominanceSnap writes through), and pauses snapping during the glide via
// the `is-overlay-open` body class (the established pause-snap signal) so the
// cover's land-dock snap can't fight the toggle mid-glide. Targets are real
// dock positions (a section's absolute top), so the destination lands docked.

import { useCallback, useRef } from 'react'
import NavMarker from '../NavMarker'
import { scrollGlide } from '../../lib/scrollGlide'

const GLIDE_MS = 700

interface Props {
  projectName?: string
}

export default function ProjectMarker({ projectName = 'Biconomy' }: Props) {
  // Where we were before jumping up to Signals — the toggle's "back" target.
  // Lives per mount (resets on route change, which is the right scope).
  const returnPos = useRef<number | null>(null)

  const glideTo = useCallback((target: number) => {
    // Pause every dominance snap for the glide's duration so the cover's
    // land-dock snap can't override our scrollGlide; clear it just after.
    document.body.classList.add('is-overlay-open')
    scrollGlide(target, GLIDE_MS)
    window.setTimeout(() => {
      document.body.classList.remove('is-overlay-open')
    }, GLIDE_MS + 120)
  }, [])

  const handleClick = useCallback(() => {
    const signals = document.getElementById('signals')
    if (!signals) {
      glideTo(0)
      return
    }
    const rect = signals.getBoundingClientRect()
    const coverTop = rect.top + window.scrollY
    const coverBottom = rect.bottom + window.scrollY
    const halfView = window.innerHeight * 0.5
    const atSignals = window.scrollY < coverBottom - halfView

    if (!atSignals) {
      // Remember where we are, then glide up to the cover's dock.
      returnPos.current = window.scrollY
      glideTo(coverTop)
    } else {
      // Return to where we came from — or the first content section's dock if
      // the saved spot is empty or still inside the cover.
      let target = returnPos.current
      if (target == null || target < coverBottom - halfView) {
        const firstChapter = document.querySelector<HTMLElement>('.sheet:not(.sheet--cover)')
        target = firstChapter
          ? firstChapter.getBoundingClientRect().top + window.scrollY
          : coverBottom
      }
      glideTo(target)
      returnPos.current = null
    }
  }, [glideTo])

  return (
    <NavMarker
      as="button"
      role="project"
      icon="info"
      label={projectName}
      onClick={handleClick}
    />
  )
}
