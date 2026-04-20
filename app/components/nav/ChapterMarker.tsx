'use client'

// ChapterMarker — chapter navigation pill with docked behavior.
//
// Two modes:
//   • Dynamic (default): sticky pill with arrow rotation, docked detection,
//     tray open/close. Requires containerRef pointing to the parent <section>.
//   • Static: inert pill rendering only the box + content. No scroll logic,
//     no tray, no arrow rotation. Used on /selected for the "Works" pill.
//
// Scroll-coupled behaviors live in useDockedMarker hook.
// Positioning is handled by the nav-sled (inside Sheet) + nav.css.

import { AnimatePresence, motion } from 'framer-motion'
import { useDockedMarker, SPRING, SPRING_EXIT } from './useDockedMarker'
import type { Chapter } from './types'

interface ChapterMarkerProps {
  chapter:       Chapter
  chapters:      Chapter[]
  containerRef?: React.RefObject<HTMLElement | null>
  static?:       boolean
}

// ── Static mode: inert pill, no hooks ────────────────────────────────────

function StaticChapterMarker({ chapter }: { chapter: Chapter }) {
  return (
    <div className="chapter-nav chapter-nav--static">
      <div className="nav-marker nav-marker--chapter" style={{ borderLeftWidth: 1 }}>
        <span className="nav-marker__content">
          <span className="nav-icon" aria-hidden="true">arrow_downward</span>
          <span className="nav-marker__title t-btn1">
            <span className="nav-marker__title-full">{chapter.title}</span>
            {chapter.shortTitle && (
              <span className="nav-marker__title-short">{chapter.shortTitle}</span>
            )}
          </span>
          <span className="nav-marker__year t-p4">{chapter.year}</span>
        </span>
      </div>
    </div>
  )
}

// ── Dynamic mode: full docked behavior ───────────────────────────────────

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
                <span className="nav-marker__title-full">{ch.title}</span>
                {ch.shortTitle && (
                  <span className="nav-marker__title-short">{ch.shortTitle}</span>
                )}
              </span>
              <span className="nav-marker__year t-p4">{ch.year}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* ── Current chapter marker ──────────────────────────────────────── */}
      <button
        className="nav-marker nav-marker--chapter"
        onClick={toggleTray}
        aria-expanded={isOpen}
        aria-label={`Chapter navigation — current: ${chapter.title}`}
      >
        <span className="nav-marker__content">
          <span ref={arrowRef} className="nav-icon nav-arrow" aria-hidden="true">arrow_downward</span>
          <span className="nav-marker__title t-btn1">
            <span className="nav-marker__title-full">{chapter.title}</span>
            {chapter.shortTitle && (
              <span className="nav-marker__title-short">{chapter.shortTitle}</span>
            )}
          </span>
          <span className="nav-marker__year t-p4">{chapter.year}</span>
        </span>
      </button>

      {/* ── Later chapters below ────────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && below.map((ch, i) => (
          <motion.button
            key={ch.id}
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
                <span className="nav-marker__title-full">{ch.title}</span>
                {ch.shortTitle && (
                  <span className="nav-marker__title-short">{ch.shortTitle}</span>
                )}
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
    // Dynamic mode requires a containerRef — bail with a static fallback
    // so it never crashes, but this path should not be reached in practice.
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
