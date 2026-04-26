'use client'

// Sheet — paper chapter container
// Renders nav-sled with ChapterMarker, and exposes section id for scroll targeting.
// chapters[] is passed through so ChapterMarker stays decoupled from its data source.
//
// Section reveal: useReveal adds .revealed via IntersectionObserver for one-shot
// mat entrance animation. The .section-reveal base state is in globals.css.
//
// Card placement: the first .surface element in each sheet gets a scroll-linked
// glide — subtle translateY + rotation + shadow that settles as the section
// enters the viewport. Driven by useScroll → useMotionValueEvent, writing
// inline styles directly on the surface element.

import { useRef, useEffect, type ReactNode } from 'react'
import { useScroll, useMotionValueEvent } from 'framer-motion'
import ChapterMarker from './nav/ChapterMarker'
import { useReveal } from './useReveal'
import { useDominanceSnap } from './hooks/useDominanceSnap'
import type { Chapter } from './nav/types'

interface SheetProps {
  chapter:  Chapter
  chapters: Chapter[]
  children?: ReactNode
  // Opt in to dominance-snap (paper-eased glide to chapter top on scroll-idle).
  // Defaults false — biconomy passes true; rr is being migrated chapter-by-chapter.
  snap?: boolean
}

export default function Sheet({ chapter, chapters, children, snap = false }: SheetProps) {
  const sectionRef = useRef<HTMLElement>(null)
  const surfaceRef = useRef<HTMLElement | null>(null)
  const rotationRef = useRef((Math.random() - 0.5) * 3) // ±1.5°, stable per mount
  useReveal(sectionRef)

  // Snap tuning for long-form chapters:
  //  • topProximityPx 80 — only fire when the chapter's top edge is near
  //    the dock; any post-snap scroll exits this zone immediately so the
  //    reader is not yanked back to the top while reading.
  //  • idleMs 2000 — wait 2s of true scroll-stop before snapping. Brief
  //    pauses while reading do not trigger anything.
  //  • glideDurationMs 800 — `--dur-glide`, gentler than marks' 500ms but
  //    not slow.
  //  • dockOffsetPx 2 — the section's top edge sits exactly at the
  //    viewport top after snap; without this nudge the ChapterMarker
  //    rests ~2px below the ProjectMarker.
  useDominanceSnap(sectionRef, {
    enabled: snap,
    topProximityPx: 80,
    idleMs: 2000,
    glideDurationMs: 800,
    dockOffsetPx: 2,
  })

  // Find the first .surface in this sheet for scroll-linked card placement.
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    surfaceRef.current = section.querySelector<HTMLElement>('.surface')
  }, [])

  // Assign random micro-rotation to non-surface content blocks (CSS reveal).
  useEffect(() => {
    const section = sectionRef.current
    if (!section) return
    section.querySelectorAll<HTMLElement>(':scope > :not(.nav-sled)').forEach(el => {
      const deg = (Math.random() - 0.5) * 3
      el.style.setProperty('--place-rotate', `${deg.toFixed(2)}deg`)
    })
  }, [])

  // ── Scroll-linked card placement ──────────────────────────────────────
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start 0.85', 'start 0.4'],
  })

  // Drive transform + shadow on the surface element as the section scrolls in.
  // progress 0 = just entering viewport (card lifted, rotated, diffuse shadow)
  // progress 1 = settled in place (resolves to the --shadow-flat token tier)
  //
  // This is a motion-state shadow, off the elevation ladder by design: the
  // endpoint matches --shadow-flat (0 1px 2px / 0.10) so the resting state
  // reads the same as any other flat surface; the entrance value is a bit
  // more diffuse to suggest paper gliding onto the desk.
  useMotionValueEvent(scrollYProgress, 'change', (p) => {
    const el = surfaceRef.current
    if (!el) return
    const ease = 1 - (1 - p) * (1 - p) // quadratic ease-out for smoother settle

    const y = 20 * (1 - ease)
    const rotate = rotationRef.current * (1 - ease)

    // Shadow interpolates from gliding (more blur, slightly heavier) to settled
    // (matches --shadow-flat). Kept inline because values are lerped per frame.
    const shadowY     = 4 - 3 * ease       // 4 → 1  (matches --shadow-flat Y)
    const shadowBlur  = 6 - 4 * ease        // 6 → 2  (matches --shadow-flat blur)
    const shadowAlpha = 0.08 + 0.02 * ease  // 0.08 → 0.10 (matches --shadow-flat alpha)

    el.style.transform = `translateY(${y.toFixed(1)}px) rotate(${rotate.toFixed(2)}deg)`
    el.style.boxShadow = `0 ${shadowY.toFixed(1)}px ${shadowBlur.toFixed(1)}px 0px rgba(0, 0, 0, ${shadowAlpha.toFixed(3)})`
  })

  return (
    <section id={chapter.id} className="sheet mat section-reveal" ref={sectionRef}>

      <div className="nav-sled">
        <ChapterMarker chapter={chapter} chapters={chapters} containerRef={sectionRef} />
      </div>

      {children}

    </section>
  )
}
