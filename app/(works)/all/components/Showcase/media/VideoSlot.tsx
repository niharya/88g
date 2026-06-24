'use client'

import { useEffect, useRef } from 'react'

// VideoSlot — wraps a <video> with paused-state control. Tile aspect lives
// in data.ts (baked from the source video dimensions) so first paint never
// letterboxes — no runtime measurement.
export default function VideoSlot({
  src,
  alt,
  paused,
}: {
  src: string
  alt: string
  paused?: boolean
}) {
  const ref = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    if (paused) v.pause()
    else v.play().catch(() => {})
  }, [paused, src])
  return (
    <video
      key={src}
      ref={ref}
      className="sc-video"
      src={src}
      autoPlay
      loop
      muted
      playsInline
      aria-label={alt}
    />
  )
}
