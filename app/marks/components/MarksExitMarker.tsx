'use client'

// MarksExitMarker — exit marker for the /marks route.
//
// /marks lives outside the (works) shell and therefore outside TransitionSlot.
// To match the project → /selected exit choreography of /rr and /biconomy
// (ghost translates down + fades, then /selected appears), we play the same
// motion locally on `.route-marks` before pushing the route.
//
// Values mirror TransitionSlot's GHOST_* exit constants (project → selected
// direction): ghost dir is +1 (down), GHOST_DUR 420ms, GHOST_Y_EXIT 64px,
// content content-dim phase 340ms / 28px, EASE = --ease-paper.

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'
import NavMarker from '../../components/NavMarker'

const EASE = 'cubic-bezier(0.5, 0, 0.2, 1)'
const GHOST_CONTENT_DUR = 340
const GHOST_CONTENT_Y   = 28
const GHOST_DUR         = 420
const GHOST_DELAY       = 100
const GHOST_Y           = 64

export default function MarksExitMarker() {
  const router = useRouter()

  const onClick = useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    const root = document.querySelector<HTMLElement>('.route-marks')
    if (!root) {
      router.push('/selected')
      return
    }

    // Phase A: inner content dims + drifts (everything inside .route-marks
    // except the exit-marker chrome itself, so the marker doesn't get pulled
    // into the dimming).
    const dimTargets = Array.from(root.children).filter(
      (el) => !(el as HTMLElement).classList?.contains('exit-marker'),
    ) as HTMLElement[]
    dimTargets.forEach((el) =>
      el.animate(
        [
          { opacity: '1', transform: 'translateY(0)' },
          { opacity: '0', transform: `translateY(${GHOST_CONTENT_Y}px)` },
        ],
        { duration: GHOST_CONTENT_DUR, easing: EASE, fill: 'forwards' },
      ),
    )

    // Phase B: the whole route recedes.
    root.animate(
      [
        { transform: 'translateY(0)', opacity: '1' },
        { transform: `translateY(${GHOST_Y}px)`, opacity: '0' },
      ],
      { duration: GHOST_DUR, easing: EASE, delay: GHOST_DELAY, fill: 'forwards' },
    )

    window.setTimeout(() => {
      router.push('/selected')
    }, GHOST_DELAY + GHOST_DUR - 40)
  }, [router])

  return (
    <div className="exit-marker">
      <NavMarker
        as="a"
        href="/selected"
        role="exit"
        icon="arrow_downward"
        label="EXIT"
        aria-label="Back to works"
        onClick={onClick}
      />
    </div>
  )
}
