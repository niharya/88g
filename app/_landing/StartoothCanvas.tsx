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

export interface StartoothCanvasProps {
  onBuildComplete: () => void
  skipBuild: boolean
}

export default function StartoothCanvas({ onBuildComplete, skipBuild }: StartoothCanvasProps) {
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

    const mount = () => field.mount()

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

  return (
    <div ref={rootRef} className="startooth-canvas-root" aria-hidden="true">
      <div ref={wrapRef} className="startooth-canvas-wrap">
        <canvas ref={canvasRef} />
      </div>
    </div>
  )
}
