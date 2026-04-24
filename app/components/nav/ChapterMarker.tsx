'use client'

// ChapterMarker — chapter navigation marker with docked behavior.
//
// Two modes:
//   • Dynamic (default): sticky marker with arrow rotation, docked detection,
//     tray open/close. Requires containerRef pointing to the parent <section>.
//   • Static: inert marker rendering only the box + content. Used on /selected
//     for the "Works" marker.
//
// Scroll-coupled behaviors live in useDockedMarker hook. Positioning is
// handled by the nav-sled (inside Sheet) + nav.css. Visual chrome, tone,
// press, and shake come from the shared NavMarker primitive.

import { AnimatePresence, motion } from 'framer-motion'
import NavMarker from '../NavMarker'
import { useDockedMarker, SPRING, SPRING_EXIT } from './useDockedMarker'
import type { Chapter } from './types'

interface ChapterMarkerProps {
  chapter:       Chapter
  chapters:      Chapter[]
  containerRef?: React.RefObject<HTMLElement | null>
  static?:       boolean
}

// ── Chapter title (full + short responsive variants) ─────────────────────

function ChapterTitle({ chapter }: { chapter: Chapter }) {
  return (
    <>
      <span className="nav-marker__title-full">{chapter.title}</span>
      {chapter.shortTitle && (
        <span className="nav-marker__title-short">{chapter.shortTitle}</span>
      )}
    </>
  )
}

// ── Static mode ──────────────────────────────────────────────────────────

function StaticChapterMarker({ chapter }: { chapter: Chapter }) {
  return (
    <div className="chapter-nav chapter-nav--static">
      <NavMarker
        as="div"
        role="chapter"
        icon="arrow_downward"
        label={<ChapterTitle chapter={chapter} />}
        sublabel={chapter.year}
        className="chapter-nav__static-marker"
      />
    </div>
  )
}

// ── Dynamic mode ─────────────────────────────────────────────────────────

function DynamicChapterMarker({ chapter, chapters, containerRef }: {
  chapter:      Chapter
  chapters:     Chapter[]
  containerRef: React.RefObject<HTMLElement | null>
}) {
  const {
    navRef, arrowRef, isOpen,
    above, below,
    toggleTray, navigate,
  } = useDockedMarker({ chapter, chapters, containerRef })

  return (
    <div
      ref={navRef}
      className={`chapter-nav${isOpen ? ' chapter-nav--open' : ''}`}
    >

      {/* ── Earlier chapters above ──────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && above.map((ch, i) => (
          <motion.button
            key={ch.id}
            type="button"
            className="nav-marker nav-marker--chapter nav-marker--flyout"
            style={{ '--fi': -(i + 1) } as React.CSSProperties}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8, transition: SPRING_EXIT }}
            transition={{ ...SPRING, delay: i * 0.04 }}
            onClick={() => navigate(ch.id)}
          >
            <span className="nav-marker__content">
              <span className="nav-icon" aria-hidden="true">arrow_upward</span>
              <span className="nav-marker__title t-btn1">
                <ChapterTitle chapter={ch} />
              </span>
              <span className="nav-marker__year t-p4">{ch.year}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* ── Current chapter marker ──────────────────────────────────────── */}
      <NavMarker
        as="button"
        type="button"
        role="chapter"
        icon="arrow_downward"
        iconRef={arrowRef}
        label={<ChapterTitle chapter={chapter} />}
        sublabel={chapter.year}
        onClick={toggleTray}
        aria-expanded={isOpen}
        aria-label={`Chapter navigation — current: ${chapter.title}`}
      />

      {/* ── Later chapters below ────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && below.map((ch, i) => (
          <motion.button
            key={ch.id}
            type="button"
            className="nav-marker nav-marker--chapter nav-marker--flyout"
            style={{ '--fi': i + 1 } as React.CSSProperties}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8, transition: SPRING_EXIT }}
            transition={{ ...SPRING, delay: i * 0.04 }}
            onClick={() => navigate(ch.id)}
          >
            <span className="nav-marker__content">
              <span className="nav-icon" aria-hidden="true">arrow_downward</span>
              <span className="nav-marker__title t-btn1">
                <ChapterTitle chapter={ch} />
              </span>
              <span className="nav-marker__year t-p4">{ch.year}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

    </div>
  )
}

// ── Main export ──────────────────────────────────────────────────────────

export default function ChapterMarker(props: ChapterMarkerProps) {
  if (props.static) {
    return <StaticChapterMarker chapter={props.chapter} />
  }

  if (!props.containerRef) {
    return <StaticChapterMarker chapter={props.chapter} />
  }

  return (
    <DynamicChapterMarker
      chapter={props.chapter}
      chapters={props.chapters}
      containerRef={props.containerRef}
    />
  )
}
