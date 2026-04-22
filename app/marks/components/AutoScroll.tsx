'use client'

// AutoScroll — mounts the continuous credits-reel driver on /marks.
//
// Renders nothing. All behavior lives in `lib/autoScroll`; this component
// exists to bind lifecycle (start on mount, stop on unmount) and to route
// user-input events into `pauseAutoScroll(COOLDOWN_MS)` so the reel yields
// briefly when the reader takes manual control, then resumes from wherever
// they ended up.
//
// Listeners are on `window` (not a specific element) because:
//   • wheel / touch can originate anywhere on the page
//   • keydown pages the document regardless of focus target
//   • the reel needs to yield globally — there's no "auto-scroll zone"

import { useEffect } from 'react'
import {
  onCursorMove,
  pauseAutoScroll,
  startAutoScroll,
  stopAutoScroll,
} from '../lib/autoScroll'

// Only keys that scroll the document count as interaction. Arrow Left/Right
// are deliberately excluded — MarkSection consumes those for slide nav and
// shouldn't pause the reel.
const SCROLL_KEYS = new Set([
  ' ',         // spacebar
  'PageUp',
  'PageDown',
  'ArrowUp',
  'ArrowDown',
  'Home',
  'End',
])

export default function AutoScroll() {
  useEffect(() => {
    startAutoScroll()

    const onWheel      = () => pauseAutoScroll()
    const onTouchStart = () => pauseAutoScroll()
    const onTouchMove  = () => pauseAutoScroll()
    const onKeyDown    = (e: KeyboardEvent) => {
      if (SCROLL_KEYS.has(e.key)) pauseAutoScroll()
    }
    // Mouse movement throttles the reel to a reading-friendly slow rate;
    // when the cursor goes still for CURSOR_IDLE_MS, full speed returns
    // via the same cruise spring. Listener is passive (read-only signal).
    const onMouseMove  = () => onCursorMove()

    window.addEventListener('wheel',      onWheel,      { passive: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove',  onTouchMove,  { passive: true })
    window.addEventListener('keydown',    onKeyDown)
    window.addEventListener('mousemove',  onMouseMove,  { passive: true })

    return () => {
      stopAutoScroll()
      window.removeEventListener('wheel',      onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove',  onTouchMove)
      window.removeEventListener('keydown',    onKeyDown)
      window.removeEventListener('mousemove',  onMouseMove)
    }
  }, [])

  return null
}
