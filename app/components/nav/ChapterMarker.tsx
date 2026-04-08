'use client'

// ChapterMarker — sticky chapter marker with rotating arrow + chapter tray
//
// Behaviors:
//   • Rotating arrow toward sheet center (scroll-driven)
//   • Docked detection — .is-docked on chapter-nav when stuck (border halving)
//   • Tray — only openable when docked; shows all chapters above/below
//   • Non-docked click scrolls that chapter into view
//   • On open:  mats spread, items spring in (framer-motion), sheets tilt
//   • On close: items spring out via AnimatePresence, mats contract

import { useState, useEffect, useRef, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import type { Chapter } from './types'

const MARKER_TOP = 24  // px — must match --marker-top in nav.css

// Spring spec matching intro__surface: slight overshoot, natural settle
const SPRING = { type: 'spring', duration: 0.5, bounce: 0.15 } as const
const SPRING_EXIT = { type: 'spring', duration: 0.25, bounce: 0 } as const

interface ChapterMarkerProps {
  chapter:  Chapter
  chapters: Chapter[]  // full list — passed from Sheet, sourced from page data
}

export default function ChapterMarker({ chapter, chapters }: ChapterMarkerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const navRef   = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)

  const currentIndex = chapters.findIndex(c => c.id === chapter.id)
  const above = chapters.slice(0, currentIndex).reverse()  // closest first
  const below = chapters.slice(currentIndex + 1)

  // ── Arrow rotation + docked detection ──────────────────────────────────────
  useEffect(() => {
    const nav   = navRef.current
    const arrow = arrowRef.current
    if (!nav || !arrow) return

    const sheet = nav.closest('.sheet') as HTMLElement | null
    if (!sheet) return

    // Arrow points toward the sheet's visual center. For sections that house
    // a pinned scroll scene (taller than viewport), prefer the inner stage so
    // the arrow tracks what the user actually sees rather than the off-screen
    // section midpoint. Falls through to the sheet for normal sections.
    const target = sheet.querySelector('[data-arrow-target]') as HTMLElement | null
                ?? sheet

    const update = () => {
      const navRect    = nav.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()

      const dx = (targetRect.left + targetRect.width  / 2) - (navRect.left + navRect.width  / 2)
      const dy = (targetRect.top  + targetRect.height / 2) - (navRect.top  + navRect.height / 2)
      arrow.style.transform = `rotate(${Math.atan2(dy, dx) * (180 / Math.PI) - 90}deg)`

      nav.classList.toggle('is-docked', Math.abs(navRect.top - MARKER_TOP) < 4)
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update, { passive: true })
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      nav.classList.remove('is-docked')
    }
  }, [])

  // ── Open / close ────────────────────────────────────────────────────────────
  // AnimatePresence handles exit animation duration — no manual timer needed.
  const closeTray = useCallback(() => {
    navRef.current?.closest('.sheet-stack')?.removeAttribute('data-tray-open')
    setIsOpen(false)
  }, [])

  const openTray = useCallback(() => {
    const nav = navRef.current
    if (!nav) return
    // Measure directly — the .is-docked class can be stale during layout transitions
    if (Math.abs(nav.getBoundingClientRect().top - MARKER_TOP) >= 4) return

    // Instant-scroll sheet top to y=0 so marker stays at MARKER_TOP visually when
    // position switches from sticky → relative (avoids a jarring jump upward).
    const sheet = nav.closest('.sheet') as HTMLElement | null
    if (sheet) {
      const sheetTop = sheet.getBoundingClientRect().top
      if (sheetTop < 0) window.scrollBy(0, sheetTop)
    }

    setIsOpen(true)
    nav.closest('.sheet-stack')?.setAttribute('data-tray-open', '')
  }, [])

  const toggleTray = useCallback(() => {
    if (isOpen) {
      closeTray()
    } else {
      const nav = navRef.current
      if (!nav) return
      if (Math.abs(nav.getBoundingClientRect().top - MARKER_TOP) < 4) {
        openTray()
      } else {
        // Not docked — scroll so the section's top edge lands flush with the viewport.
        // Add borderTopWidth so the marker (inside the border) reaches exactly MARKER_TOP.
        const section = document.getElementById(chapter.id)
        if (section) {
          const borderTop = parseFloat(getComputedStyle(section).borderTopWidth) || 0
          window.scrollBy({ top: section.getBoundingClientRect().top + borderTop, behavior: 'smooth' })
        }
      }
    }
  }, [isOpen, closeTray, openTray, chapter.id])

  // ── On open: randomise tilt on every large element within each sheet ────────
  useEffect(() => {
    if (!isOpen) return
    const TILTS = [-2, -1, 1, 2]
    document.querySelectorAll<HTMLElement>('.sheet > :not(.nav-sled)').forEach(el => {
      el.style.setProperty('--tilt', `${TILTS[Math.floor(Math.random() * TILTS.length)]}deg`)
    })
  }, [isOpen])

  // ── Close on outside pointer or when user scrolls into a different chapter ──
  useEffect(() => {
    if (!isOpen) return

    // pointerdown covers mouse, touch, and stylus — no separate touchstart needed
    const onPointerDown = (e: PointerEvent) => {
      if (!navRef.current?.contains(e.target as Node)) closeTray()
    }
    const onScroll = () => {
      const docked = document.querySelector('.chapter-nav.is-docked')
      if (docked && docked !== navRef.current) closeTray()
    }

    document.addEventListener('pointerdown', onPointerDown)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      window.removeEventListener('scroll', onScroll)
    }
  }, [isOpen, closeTray])

  // ── Cleanup on unmount ─────────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      navRef.current?.closest('.sheet-stack')?.removeAttribute('data-tray-open')
    }
  }, [])

  // ── Navigate to a chapter ──────────────────────────────────────────────────
  const navigate = (id: string) => {
    // Suppress gap transition so layout snaps instantly — lets us read the
    // correct post-contraction position from getBoundingClientRect immediately.
    const sheetStack = navRef.current?.closest('.sheet-stack') as HTMLElement | null
    if (sheetStack) sheetStack.setAttribute('data-navigating', '')
    closeTray()
    const el = document.getElementById(id)
    if (el) {
      const borderTop = parseFloat(getComputedStyle(el).borderTopWidth) || 0
      window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + borderTop, behavior: 'smooth' })
    }
    // Re-enable transition after one frame
    requestAnimationFrame(() => sheetStack?.removeAttribute('data-navigating'))
  }

  return (
    <div
      ref={navRef}
      className={`chapter-nav${isOpen ? ' chapter-nav--open' : ''}`}
    >

      {/* ── Earlier chapters above ────────────────────────────────────────────── */}
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
              <span className="nav-marker__title t-btn1">{ch.title}</span>
              <span className="nav-marker__year t-p4">{ch.year}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

      {/* ── Current chapter marker ────────────────────────────────────────────── */}
      <button
        className="nav-marker nav-marker--chapter"
        onClick={toggleTray}
        aria-expanded={isOpen}
        aria-label={`Chapter navigation — current: ${chapter.title}`}
      >
        <span className="nav-marker__content">
          <span ref={arrowRef} className="nav-icon nav-arrow" aria-hidden="true">arrow_downward</span>
          <span className="nav-marker__title t-btn1">{chapter.title}</span>
          <span className="nav-marker__year t-p4">{chapter.year}</span>
        </span>
      </button>

      {/* ── Later chapters below ──────────────────────────────────────────────── */}
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
              <span className="nav-marker__title t-btn1">{ch.title}</span>
              <span className="nav-marker__year t-p4">{ch.year}</span>
            </span>
          </motion.button>
        ))}
      </AnimatePresence>

    </div>
  )
}
