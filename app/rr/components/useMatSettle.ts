'use client'

// useMatSettle — scroll-linked "placed on mat" effect
//
// Sets CSS custom properties (--settle-scale, --settle-shadow) on the
// referenced element based on parent section scroll progress.
// CSS rules on child elements consume these vars to apply the effect.
//
// Usage:
//   useMatSettle(canvasRef)
//   CSS: .rr-story-card { scale: var(--settle-scale, 1); }

import { useEffect, useRef } from 'react'
import { useScroll, useTransform, useMotionValueEvent } from 'framer-motion'

export default function useMatSettle(
  innerRef: React.RefObject<HTMLElement | null>,
) {
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (innerRef.current) {
      sectionRef.current = innerRef.current.closest('.mat') as HTMLElement
    }
  }, [innerRef])

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  // Settle: 0→0.35 entering, 0.35→0.65 resting, 0.65→1 leaving
  const settleScale = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [1.035, 1, 1, 1.035],
  )
  const settleShadow = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [12, 3, 3, 12],
  )
  const settleOpacity = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [0.55, 1, 1, 0.55],
  )
  const settleRotate = useTransform(
    scrollYProgress,
    [0, 0.35, 0.65, 1],
    [-2, 0, 0, 2],
  )

  // Write CSS vars onto the element so child CSS can consume them
  useMotionValueEvent(settleScale, 'change', (v) => {
    innerRef.current?.style.setProperty('--settle-scale', String(v))
  })
  useMotionValueEvent(settleShadow, 'change', (v) => {
    innerRef.current?.style.setProperty('--settle-shadow', `${v}px`)
  })
  useMotionValueEvent(settleOpacity, 'change', (v) => {
    innerRef.current?.style.setProperty('--settle-opacity', String(v))
  })
  useMotionValueEvent(settleRotate, 'change', (v) => {
    innerRef.current?.style.setProperty('--settle-rotate', `${v}deg`)
  })
}
