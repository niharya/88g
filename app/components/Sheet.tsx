'use client'

// Sheet — paper chapter container
// Renders nav-sled with ChapterMarker, and exposes section id for scroll targeting.
// chapters[] is passed through so ChapterMarker stays decoupled from its data source.
//
// 'use client' is required because Sheet creates a ref for the section element
// and passes it to ChapterMarker as containerRef for scroll-coupled behaviors.
//
// Section reveal: useReveal adds .revealed via IntersectionObserver for one-shot
// entrance animation. The .section-reveal base state is in globals.css.

import { useRef, type ReactNode } from 'react'
import ChapterMarker from './nav/ChapterMarker'
import { useReveal } from './useReveal'
import type { Chapter } from './nav/types'

interface SheetProps {
  chapter:  Chapter
  chapters: Chapter[]
  children?: ReactNode
}

export default function Sheet({ chapter, chapters, children }: SheetProps) {
  const sectionRef = useRef<HTMLElement>(null)
  useReveal(sectionRef)

  return (
    <section id={chapter.id} className="sheet mat section-reveal" ref={sectionRef}>

      <div className="nav-sled">
        <ChapterMarker chapter={chapter} chapters={chapters} containerRef={sectionRef} />
      </div>

      {children}

    </section>
  )
}
