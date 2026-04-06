// Sheet — paper chapter container
// Renders nav-sled with ChapterMarker, and exposes section id for scroll targeting.
// chapters[] is passed through so ChapterMarker stays decoupled from its data source.

import type { ReactNode } from 'react'
import ChapterMarker from './nav/ChapterMarker'
import type { Chapter } from './nav/types'

interface SheetProps {
  chapter:  Chapter
  chapters: Chapter[]
  children?: ReactNode
}

export default function Sheet({ chapter, chapters, children }: SheetProps) {
  return (
    <section id={chapter.id} className="sheet mat">

      <div className="nav-sled">
        <ChapterMarker chapter={chapter} chapters={chapters} />
      </div>

      {children}

    </section>
  )
}
