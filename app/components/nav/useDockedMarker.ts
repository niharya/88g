'use client'

// useDockedMarker — extracted scroll-coupled behaviors from ChapterMarker.
//
// Owns: arrow rotation toward sheet center, is-docked detection, tray
// open/close with mat spreading, sheet tilt, outside-click dismiss,
// cross-chapter scroll dismiss, and chapter navigation.
//
// Accepts explicit refs so the hook is decoupled from DOM structure.
// The caller (ChapterMarker inside a Sheet) provides containerRef
// pointing to the <section> element. The hook finds sheet-stack via
// containerRef.closest('.sheet-stack') for tray operations.
//
// MARKER_TOP must match --marker-top in nav.css (24px).

import { useState, useEffect, useRef, useCallback } from 'react'
import type { Chapter } from './types'

const MARKER_TOP = 24 // px — must match --marker-top in nav.css

// Spring specs matching intro surface
const SPRING     = { type: 'spring' as const, duration: 0.5,  bounce: 0.15 }
const SPRING_EXIT = { type: 'spring' as const, duration: 0.25, bounce: 0    }

export { SPRING, SPRING_EXIT }

interface UseDockedMarkerOptions {
  chapter:      Chapter
  chapters:     Chapter[]
  containerRef: React.RefObject<HTMLElement | null> // the <section> element (sheet)
}

export function useDockedMarker({ chapter, chapters, containerRef }: UseDockedMarkerOptions) {
  const [isOpen, setIsOpen] = useState(false)
  const navRef   = useRef<HTMLDivElement>(null)
  const arrowRef = useRef<HTMLSpanElement>(null)

  const currentIndex = chapters.findIndex(c => c.id === chapter.id)
  const above = chapters.slice(0, currentIndex).reverse() // closest first
  const below = chapters.slice(currentIndex + 1)

  // ── Arrow rotation + docked detection ──────────────────────────────────
  useEffect(() => {
    const nav   = navRef.current
    const arrow = arrowRef.current
    const sheet = containerRef.current
    if (!nav || !arrow || !sheet) return

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
  }, [containerRef])

  // ── Close tray ─────────────────────────────────────────────────────────
  const closeTray = useCallback(() => {
    navRef.current?.closest('.sheet-stack')?.removeAttribute('data-tray-open')
    setIsOpen(false)
  }, [])

  // ── Open tray ──────────────────────────────────────────────────────────
  const openTray = useCallback(() => {
    const nav = navRef.current
    if (!nav) return
    // Measure directly — the .is-docked class can be stale during layout transitions
    if (Math.abs(nav.getBoundingClientRect().top - MARKER_TOP) >= 4) return

    // Instant-scroll sheet top to y=0 so marker stays at MARKER_TOP visually when
    // position switches from sticky to relative (avoids a jarring jump upward).
    const sheet = containerRef.current
    if (sheet) {
      const sheetTop = sheet.getBoundingClientRect().top
      if (sheetTop < 0) window.scrollBy(0, sheetTop)
    }

    setIsOpen(true)
    nav.closest('.sheet-stack')?.setAttribute('data-tray-open', '')
  }, [containerRef])

  // ── Toggle ─────────────────────────────────────────────────────────────
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

  // ── On open: randomise tilt on every large element within each sheet ───
  useEffect(() => {
    if (!isOpen) return
    const TILTS = [-2, -1, 1, 2]
    document.querySelectorAll<HTMLElement>('.sheet > :not(.nav-sled)').forEach(el => {
      el.style.setProperty('--tilt', `${TILTS[Math.floor(Math.random() * TILTS.length)]}deg`)
    })
  }, [isOpen])

  // ── Close on outside pointer or when user scrolls into a different chapter
  useEffect(() => {
    if (!isOpen) return

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

  // ── Cleanup on unmount ─────────────────────────────────────────────────
  useEffect(() => {
    return () => {
      navRef.current?.closest('.sheet-stack')?.removeAttribute('data-tray-open')
    }
  }, [])

  // ── Navigate to a chapter ──────────────────────────────────────────────
  const navigate = useCallback((id: string) => {
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
  }, [closeTray])

  return {
    navRef,
    arrowRef,
    isOpen,
    above,
    below,
    toggleTray,
    closeTray,
    navigate,
  }
}
