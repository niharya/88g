'use client'

// MarksTitle — the single persistent title element for the entire /marks route.
//
// One DOM node, three states, one scroll listener. The three states are the
// same object; there is no stacked-spans crossfade.
//
//   State 1 — Hero   (--marks-s = 0):   "MARKS & SYMBOLS" at 120px, 37vh
//   State 2 — Docked (--marks-s = 1):   "MARKS & SYMBOLS" at 24px,  26px top
//   State 3 — Mark   (in mark zone):    "<Mark name>" + grid icon, same 24px
//
// States 1↔2 are driven by `--marks-s` (scrollY / 50vh, clamped 0..1) — text
// is identical across both, so scaling happens around stable content.
//
// States 2↔3 and mark→mark transitions are a reel-roll: two slots ping-pong
// inside a clipped cell. Roll direction follows scroll direction — scrolling
// down rolls text upward (old up, new from below); scrolling up rolls text
// downward (old down, new from above). The mechanism is the same whether the
// morph is label↔name or name↔name.
//
// Cell width is transitioned alongside the roll (driven by an off-flow sizer
// measurement) so the grid icon slides to its new position smoothly rather
// than snapping when the mark name length changes.
//
// Coalescing: if a new target arrives mid-roll, `kickRoll` bails; the
// transitionend handler re-checks `targetText` vs `currentText` and fires
// again if they've drifted. Fast scrolls may pass through intermediate marks,
// which reads as the reel catching up.

import { useEffect, useRef } from 'react'
import { MARKS } from '../data/marks'
import { scrollGlide } from '../lib/scrollGlide'

const DOCK_FRACTION    = 0.5   // dock completes at 50% of one viewport of scroll
const DOMINANT_COMMIT  = 0.55  // overlap fraction to claim the title
const DOMINANT_RELEASE = 0.45  // overlap fraction below which the claim releases
const LABEL_TEXT       = 'MARKS & SYMBOLS'

export default function MarksTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null)
  const cellRef  = useRef<HTMLSpanElement>(null)
  const slotARef = useRef<HTMLSpanElement>(null)
  const slotBRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el   = titleRef.current
    const cell = cellRef.current
    const a    = slotARef.current
    const b    = slotBRef.current
    if (!el || !cell || !a || !b) return

    let committedId: string | null = null
    let currentText  = LABEL_TEXT
    let targetText   = LABEL_TEXT
    let rolling      = false
    let scrollDir: 'down' | 'up' = 'down'
    let lastScrollY  = window.scrollY

    const overlapFor = (section: Element, vh: number) => {
      const rect = section.getBoundingClientRect()
      return Math.max(0, Math.min(rect.bottom, vh) - Math.max(rect.top, 0)) / vh
    }

    const computeCommittedId = (): string | null => {
      const vh = window.innerHeight || 1
      const sections = document.querySelectorAll<HTMLElement>('.marks-section')

      let bestId: string | null = null
      let bestScore = 0
      sections.forEach((section) => {
        const score = overlapFor(section, vh)
        if (score > bestScore) {
          bestScore = score
          bestId    = section.dataset.markId ?? null
        }
      })

      if (bestId && bestId !== committedId && bestScore >= DOMINANT_COMMIT) {
        return bestId
      }
      if (committedId) {
        const current = document.querySelector<HTMLElement>(
          `.marks-section[data-mark-id="${committedId}"]`,
        )
        const currentOverlap = current ? overlapFor(current, window.innerHeight || 1) : 0
        if (currentOverlap <= DOMINANT_RELEASE) {
          return bestId && bestScore >= DOMINANT_COMMIT ? bestId : null
        }
      }
      return committedId
    }

    // Measure target text width in the cell's own typographic context.
    // Off-flow (position: absolute) so it doesn't disturb the grid cell.
    const measureText = (text: string): number => {
      const sizer = document.createElement('span')
      sizer.textContent = text
      sizer.style.cssText = 'position:absolute;left:0;top:0;visibility:hidden;white-space:nowrap;pointer-events:none;'
      cell.appendChild(sizer)
      const w = sizer.offsetWidth
      cell.removeChild(sizer)
      return w
    }

    // Pre-measure the widest mark name once. Inside the mark zone the cell is
    // locked to this width — a fixed "window" through which the reel rolls.
    // Mark→mark transitions never resize the cell, so the icon's x-position
    // stays stable and the roll reads as pure vertical motion (no horizontal
    // rubber-banding competing with it). Cell width only transitions at phase
    // boundaries (entering/leaving mark zone), driven by `syncCellWidth`.
    const markZoneWidth = MARKS.reduce(
      (m, mark) => Math.max(m, measureText(mark.name)),
      0,
    )

    // Lock or release the cell width based on whether we're in mark zone.
    // In mark zone → fixed markZoneWidth. Out of mark zone → unset, so the
    // cell follows the label's intrinsic width as font-size scales with
    // `--marks-s`.
    const syncCellWidth = () => {
      cell.style.width = committedId ? markZoneWidth + 'px' : ''
    }

    const kickRoll = () => {
      if (rolling) return
      if (targetText === currentText) return

      const activeLetter   = cell.dataset.active as 'a' | 'b'
      const incomingLetter = activeLetter === 'a' ? 'b' : 'a'
      const incoming       = incomingLetter === 'a' ? a : b
      const outgoing       = activeLetter === 'a' ? a : b

      // Scroll direction determines roll direction:
      //   down-scroll → reel rolls up (old goes up and off, new rises from below)
      //   up-scroll   → reel rolls down (old goes down and off, new drops from above)
      const fromY = scrollDir === 'down' ? '100%' : '-100%'
      const outY  = scrollDir === 'down' ? '-100%' : '100%'

      // Snap incoming to the "from" edge instantly, load text, force reflow,
      // then release to CSS-driven transition.
      incoming.style.transition = 'none'
      incoming.style.transform  = `translateY(${fromY})`
      incoming.textContent      = targetText
      void incoming.offsetHeight

      incoming.style.transition = ''
      incoming.style.transform  = 'translateY(0)'
      outgoing.style.transform  = `translateY(${outY})`

      cell.dataset.active = incomingLetter
      rolling = true
    }

    const onTransitionEnd = (e: TransitionEvent) => {
      if (e.propertyName !== 'transform') return
      const activeLetter = cell.dataset.active as 'a' | 'b'
      const active       = activeLetter === 'a' ? a : b
      if (e.target !== active) return

      // Clear the outgoing slot so nothing stale lingers in the DOM.
      const outgoing = activeLetter === 'a' ? b : a
      outgoing.textContent = ''

      rolling     = false
      currentText = active.textContent ?? ''

      if (targetText !== currentText) kickRoll()
    }

    // Smoothstep — eases the linear scroll ratio so hero↔dock reads like a
    // settle rather than a drag against raw scroll velocity.
    const smoothstep = (t: number) => t * t * (3 - 2 * t)

    const update = () => {
      const y  = window.scrollY
      if (y > lastScrollY)      scrollDir = 'down'
      else if (y < lastScrollY) scrollDir = 'up'
      lastScrollY = y

      const vh = window.innerHeight || 1
      const raw = Math.max(0, Math.min(1, y / (vh * DOCK_FRACTION)))
      el.style.setProperty('--marks-s', String(smoothstep(raw)))

      const nextCommitted = computeCommittedId()
      if (nextCommitted !== committedId) {
        committedId = nextCommitted
      }

      const nextTarget = committedId
        ? MARKS.find((m) => m.id === committedId)?.name ?? LABEL_TEXT
        : LABEL_TEXT

      if (nextTarget !== targetText) {
        targetText = nextTarget
        el.dataset.inMark = committedId ? 'true' : 'false'
        el.tabIndex = committedId ? 0 : -1
        syncCellWidth()
        kickRoll()
      }
    }

    // Initial paint — write the initial target directly to slot-a so a
    // deep-link / refresh on a mark section doesn't play a catch-up roll.
    const initialS = Math.max(0, Math.min(1, window.scrollY / ((window.innerHeight || 1) * DOCK_FRACTION)))
    el.style.setProperty('--marks-s', String(smoothstep(initialS)))

    committedId = computeCommittedId()
    const initialTarget = committedId
      ? MARKS.find((m) => m.id === committedId)?.name ?? LABEL_TEXT
      : LABEL_TEXT

    a.textContent            = initialTarget
    a.style.transition       = 'none'
    a.style.transform        = 'translateY(0)'
    b.textContent            = ''
    b.style.transition       = 'none'
    b.style.transform        = 'translateY(100%)'
    void a.offsetHeight
    a.style.transition       = ''
    b.style.transition       = ''
    cell.dataset.active      = 'a'
    currentText              = initialTarget
    targetText               = initialTarget
    el.dataset.inMark        = committedId ? 'true' : 'false'
    el.tabIndex              = committedId ? 0 : -1

    syncCellWidth()

    window.addEventListener('scroll', update, { passive: true })
    window.addEventListener('resize', update)
    a.addEventListener('transitionend', onTransitionEnd)
    b.addEventListener('transitionend', onTransitionEnd)

    return () => {
      window.removeEventListener('scroll', update)
      window.removeEventListener('resize', update)
      a.removeEventListener('transitionend', onTransitionEnd)
      b.removeEventListener('transitionend', onTransitionEnd)
    }
  }, [])

  const handleActivate = () => {
    // Stub per the brief's chunk 13: in mark state the title doubles as the
    // grid-back affordance. Jumps to the top of the document for now; the
    // current-cycle Hero target comes in when the infinite-loop lands.
    scrollGlide(0)
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLHeadingElement>) => {
    if (titleRef.current?.dataset.inMark !== 'true') return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleActivate()
    }
  }

  return (
    <h1
      ref={titleRef}
      className="marks-title"
      data-in-mark="false"
      role="button"
      tabIndex={-1}
      onClick={handleActivate}
      onKeyDown={handleKeyDown}
    >
      <span className="marks-title__row">
        <span ref={cellRef} className="marks-title__cell" data-active="a">
          <span ref={slotARef} className="marks-title__slot" data-slot="a" />
          <span ref={slotBRef} className="marks-title__slot" data-slot="b" />
        </span>
      </span>
    </h1>
  )
}
