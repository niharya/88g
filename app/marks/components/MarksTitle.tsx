'use client'

// MarksTitle — the single persistent title element for the entire /marks route.
//
// One element, three states, one scroll listener, no React state:
//
//   State 1 — Hero     (--marks-s = 0):  "MARKS & SYMBOLS" at 120px, 37vh
//   State 2 — Docked   (--marks-s = 1):  "MARKS & SYMBOLS" at 24px, 26px top
//   State 3 — Mark     (--title-reveal → 1): mark name fades in, icon slides right
//
// States 1→2 are driven by --marks-s (scrollY / 50vh, clamped 0..1).
// States 2→3 are driven by --title-reveal (dominant section entry progress,
// same timing curve as --content-reveal: starts at p=0.45, done at p=0.80).
//
// All three phases share one requestAnimationFrame-free scroll listener.
// The mark name span is updated via direct textContent write — no setState,
// no re-render, same mechanism as the CSS var writes.

import { useEffect, useRef } from 'react'
import { MARKS } from '../data/marks'

const DOCK_FRACTION  = 0.5   // dock completes at 50% of one viewport of scroll
const SECTION_FLOOR  = 0.2   // min overlap fraction for a section to be dominant
const REVEAL_START   = 0.45  // section entry progress at which name fade begins
const REVEAL_END     = 0.80  // section entry progress at which name fade completes

export default function MarksTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const markRef  = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el     = titleRef.current
    const markEl = markRef.current
    if (!el || !markEl) return

    let currentId: string | null = null

    const update = () => {
      const vh = window.innerHeight || 1

      // ── Phase 1: hero → docked ────────────────────────────────────────────
      const s = Math.max(0, Math.min(1, window.scrollY / (vh * DOCK_FRACTION)))
      el.style.setProperty('--marks-s', String(s))

      // ── Phase 2: label → mark name ────────────────────────────────────────
      const sections = document.querySelectorAll<HTMLElement>('.marks-section')
      let bestScore = SECTION_FLOOR  // anything below floor is treated as no section
      let bestId:    string | null = null
      let bestP    = 0

      sections.forEach((section) => {
        const rect    = section.getBoundingClientRect()
        const overlap = Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0))
        const score   = overlap / vh
        if (score > bestScore) {
          const id = section.dataset.markId
          if (id) {
            bestScore = score
            bestId    = id
            bestP     = Math.max(0, Math.min(1, (vh - rect.top) / vh))
          }
        }
      })

      if (bestId) {
        const reveal = Math.max(0, Math.min(1, (bestP - REVEAL_START) / (REVEAL_END - REVEAL_START)))
        el.style.setProperty('--title-reveal', String(reveal))

        // Mirror data-settled from the dominant section onto the title element
        // so the CSS transition can snap --title-reveal to 1 (same mechanism
        // as MarkSection snapping --content-reveal).
        const bestSection = document.querySelector<HTMLElement>(`.marks-section[data-mark-id="${bestId}"]`)
        if (bestSection?.dataset.settled === 'true') {
          el.dataset.settled = 'true'
        } else {
          delete el.dataset.settled
        }

        if (bestId !== currentId) {
          currentId          = bestId
          const mark         = MARKS.find((m) => m.id === bestId)
          markEl.textContent = mark?.name ?? ''
        }
      } else {
        el.style.setProperty('--title-reveal', '0')
        delete el.dataset.settled
        currentId = null
        // markEl.textContent intentionally kept — holds last name during fade-out
      }
    }

    update()
    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
    }
  }, [])

  return (
    <h1 ref={titleRef} className="marks-title">
      <span className="marks-title__text">
        <span className="marks-title__label">MARKS &amp; SYMBOLS</span>
        <span ref={markRef} className="marks-title__mark" />
        <span className="marks-title__icon nav-icon" aria-hidden="true">grid_view</span>
      </span>
    </h1>
  )
}
