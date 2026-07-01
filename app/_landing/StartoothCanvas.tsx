'use client'

// StartoothCanvas — thin React shell around the StartoothField engine.
//
// Responsibilities: owns the DOM refs (root div, wrap div, canvas element),
// instantiates StartoothField on a post-hydration idle callback, manages
// cleanup on unmount. No UI of its own — the field is the whole experience.
//
// `onBuildComplete` fires once when the build animation finishes.
// `skipBuild` tells the engine to jump straight to the settled pattern
// (used on client-side return, where the build has already played this load).
//
// Canvas interactivity: .startooth-canvas-root has pointer-events:none
// (see startooth-canvas.css) so the root div doesn't block landing content.
// The canvas element inside has pointer-events:auto — see landing.css for
// how the content layer passes events down to the canvas in empty areas.
//
// Position: fixed. See app/_landing/ANOMALIES.md — "canvas fixed vs absolute".

import { useRef, useEffect, useCallback } from 'react'
import { StartoothField } from './StartoothField'
import './startooth-canvas.css'

/* Grey-hold: how long the blank grey card holds before the build is cued, on a
   fresh DESKTOP load. Mobile (full-bleed) and skip (return) don't hold. */
const GREY_HOLD_MS = 1800

export interface StartoothCanvasProps {
  onBuildComplete: () => void
  /* Fires the instant the build is cued (after the grey hold) — page.tsx uses it
     to straighten the sheet corners + ink grey→black as the pattern begins. */
  onBuildStart?: () => void
  skipBuild: boolean
  /* When the landing expands, the engine dissolves its filled pattern down to a
     bare wireframe so the busy field quiets behind the bento. */
  expanded: boolean
}

export default function StartoothCanvas({ onBuildComplete, onBuildStart, skipBuild, expanded }: StartoothCanvasProps) {
  const rootRef   = useRef<HTMLDivElement>(null)
  const wrapRef   = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const fieldRef  = useRef<StartoothField | null>(null)

  const handleBuildComplete = useCallback(() => {
    onBuildComplete()
  }, [onBuildComplete])

  useEffect(() => {
    if (!rootRef.current || !wrapRef.current || !canvasRef.current) return

    const field = new StartoothField(
      rootRef.current,
      canvasRef.current,
      wrapRef.current,
      { onBuildComplete: handleBuildComplete, skipBuild }
    )
    fieldRef.current = field

    const mount = () => { onBuildStart?.(); field.mount() }

    // Grey-hold intro (DESKTOP framed sheet only): the sheet arrives as a blank
    // grey card and holds a beat before the build is cued — so we DELAY the engine
    // mount by GREY_HOLD_MS. Hydration is long done by then, so no idle-defer is
    // needed. On skip (return) or mobile (full-bleed, timing unchanged) there's no
    // hold: keep the original post-hydration idle-slot mount exactly as before.
    const framedSheet = window.matchMedia('(min-width: 768px) and (min-height: 501px)').matches
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!skipBuild && framedSheet && !prefersReduced) {
      const id = window.setTimeout(mount, GREY_HOLD_MS)
      return () => {
        clearTimeout(id)
        field.destroy()
        fieldRef.current = null
      }
    }

    // Defer to a post-hydration idle slot to avoid competing with the
    // React hydration pass and the font-gate inline script.
    if (typeof requestIdleCallback !== 'undefined') {
      const id = requestIdleCallback(mount, { timeout: 300 })
      return () => {
        cancelIdleCallback(id)
        field.destroy()
        fieldRef.current = null
      }
    } else {
      // Safari: rIC not available
      const id = window.setTimeout(mount, 50)
      return () => {
        clearTimeout(id)
        field.destroy()
        fieldRef.current = null
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])  // intentionally stable — field mounts once; skipBuild baked at construction

  // Relay expand state to the engine (separate from the mount effect, which is
  // stable). The field may not exist yet on the very first idle-deferred mount;
  // the next expand toggle (only possible post-build) re-syncs it.
  useEffect(() => {
    fieldRef.current?.setExpanded(expanded)
  }, [expanded])

  return (
    <>
      <div ref={rootRef} className="startooth-canvas-root" aria-hidden="true">
        <div ref={wrapRef} className="startooth-canvas-wrap">
          <canvas ref={canvasRef} />
        </div>
      </div>
      {/* Framed sheet: matte over the scrolling content — its window clips the
          content to the sheet, its border is the frame. See startooth-canvas.css. */}
      <div className="startooth-sheet-matte" aria-hidden="true" />
    </>
  )
}
