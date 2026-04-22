'use client'

// CaptionTag — museum-label caption docked to the viewport bottom.
//
// Collapsed state shows only a title row (plus-icon + "Title, Year") peeking
// above the viewport edge. Clicking anywhere on the card toggles it — the
// card slides up and docks flush to the viewport bottom, revealing the
// description below the title. Plus icon rotates 45° to become a cross.
// Hover nudges the closed tag up 4px as the affordance.
//
// Stateless visibility: consumers pass `visible` and the tag tucks back below
// the viewport when false (fade + slide down, removed from tab order).
//
// Load-bearing details (see LIBRARY.md → CaptionTag for why):
//   1. Measurement runs in two useLayoutEffect passes because card height
//      depends on width. Pass 1 reads the title row's natural width and
//      sets it as `handleWidth`. Pass 2 (re-runs when handleWidth changes)
//      measures root height after React has applied the inline
//      `width: calc(handleWidth + 16)` — only then does the description
//      reflow to the final column, giving the correct cardHeight. Pass 2
//      computes `--tuck = cardHeight - titleBottom - CLOSED_PEEK` so the
//      title row rests CLOSED_PEEK px above the viewport edge when closed.
//      A single-pass measurement would read cardHeight at the wrong width
//      (description on one long line) and set tuck too small.
//   2. `--tuck` is registered as a typed <length> custom property in
//      caption-tag.css — without @property, the transition from
//      translateY(100%) (hidden) to translateY(var(--tuck)) (visible) is
//      a unit-space mismatch (% ↔ px) that pins at currentTime=0.
//   3. useEffect flips `data-ready="true"` after first paint — this gates
//      the CSS `transition` so the intro hidden → visible state change
//      paints at its target without animating. Subsequent state changes
//      (hover, open, `visible` toggling) animate.
//
// Known consumers
//   • / landing — Startooth Pattern caption, hides when landing expands.

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import type { CSSProperties, KeyboardEvent as ReactKeyboardEvent } from 'react'
import './caption-tag.css'

const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

export interface CaptionTagProps {
  title: string
  year: string | number
  description?: string
  /** When false, the tag slides back below the viewport edge and is removed from tab order. */
  visible?: boolean
  className?: string
}

function PlusIcon() {
  return (
    <svg
      className="caption-tag__icon"
      width="18"
      height="18"
      viewBox="0 0 20 20"
      fill="currentColor"
      aria-hidden="true"
    >
      <rect x="8.5" y="3" width="3" height="14" rx="1.5" />
      <rect x="3" y="8.5" width="14" height="3" rx="1.5" />
    </svg>
  )
}

export default function CaptionTag({
  title,
  year,
  description,
  visible = true,
  className,
}: CaptionTagProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const handleRef = useRef<HTMLDivElement>(null)
  const [tuck, setTuck] = useState(0)
  const [cardHeight, setCardHeight] = useState(200)
  const [handleWidth, setHandleWidth] = useState<number | null>(null)
  const [measured, setMeasured] = useState(false)
  const [ready, setReady] = useState(false)
  // Hover-lift suppression — when toggling closed with the mouse still over
  // the card, the `:hover` rule would keep the card lifted 4px so the close
  // never lands at rest. Suppress the hover rule until the mouse leaves,
  // then re-enable on the next entry. Ref (not state) tracks whether the
  // mouse was over at toggle time so keyboard-close with no pointer nearby
  // doesn't wedge suppression on.
  const hoveredRef = useRef(false)
  const [hoverSuppressed, setHoverSuppressed] = useState(false)

  const hasDrawer = Boolean(description)
  const interactive = visible && hasDrawer

  // Close when the consumer hides the tag.
  useEffect(() => {
    if (!visible) setOpen(false)
  }, [visible])

  // Measurement is split into two passes because the card's height depends
  // on its width, and the width is set inline AFTER the first render (once
  // we've measured the title-row's natural width).
  //
  // Pass 1 — measure the title-row's natural width. The description is still
  // wrapping freely at its content-width, so root height here is meaningless.
  // Pass 2 — runs after pass 1's setState applies `width: calc(handleWidth + 16)`
  // inline. With width locked, description reflows to the correct column and
  // root.offsetHeight now reflects the real card height. Compute --tuck.
  //
  // CLOSED_PEEK is subtracted so the title row rests this far above the
  // viewport edge when closed. 6px is the new resting lift (the former
  // hover state); on hover the card nudges up another 4px from here.
  const CLOSED_PEEK = 6
  useIsoLayoutEffect(() => {
    const handle = handleRef.current
    if (!handle) return
    // Observe the handle so late font swaps (web fonts load AFTER mount and
    // grow the title row by a few px) re-trigger the width measurement.
    // Without this, the card is sized to the fallback-font width and the
    // real-font title leaks past the right edge once fonts swap in.
    const measure = () => {
      setHandleWidth(Math.ceil(handle.getBoundingClientRect().width))
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(handle)
    return () => ro.disconnect()
  }, [description])

  useIsoLayoutEffect(() => {
    const root = rootRef.current
    const handle = handleRef.current
    if (!root || !handle || handleWidth === null) return
    const measure = () => {
      const cardH = root.offsetHeight
      const titleBottom = handle.offsetTop + handle.offsetHeight
      setCardHeight(cardH)
      setTuck(cardH - titleBottom - CLOSED_PEEK)
    }
    measure()
    setMeasured(true)
    const ro = new ResizeObserver(measure)
    ro.observe(root)
    return () => ro.disconnect()
  }, [handleWidth, description])

  // Enable transitions after the first paint — see header comment.
  // Double-rAF so the flip lands on a real paint frame AFTER the
  // measurement-driven render (which flips data-visible). Without the
  // delay, React can auto-batch the ready flip with measurement state
  // updates, causing a transition to arm and pin on the hidden→visible
  // transform change.
  useEffect(() => {
    let r2 = 0
    const r1 = requestAnimationFrame(() => {
      r2 = requestAnimationFrame(() => setReady(true))
    })
    return () => {
      cancelAnimationFrame(r1)
      if (r2) cancelAnimationFrame(r2)
    }
  }, [])

  // Click outside closes. Defer registration so the same click that opened
  // doesn't immediately close.
  useEffect(() => {
    if (!open) return
    const handle = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false)
    }
    const id = window.setTimeout(() => document.addEventListener('mousedown', handle), 0)
    return () => {
      window.clearTimeout(id)
      document.removeEventListener('mousedown', handle)
    }
  }, [open])

  // Escape closes.
  useEffect(() => {
    if (!open) return
    const handle = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('keydown', handle)
    return () => document.removeEventListener('keydown', handle)
  }, [open])

  const performToggle = () => {
    if (open && hoveredRef.current) setHoverSuppressed(true)
    setOpen(o => !o)
  }
  const toggle = () => {
    if (interactive) performToggle()
  }
  const onKeyDown = (e: ReactKeyboardEvent) => {
    if (!interactive) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      performToggle()
    }
  }
  const onMouseEnter = () => { hoveredRef.current = true }
  const onMouseLeave = () => {
    hoveredRef.current = false
    setHoverSuppressed(false)
  }

  const classes = ['caption-tag', className].filter(Boolean).join(' ')

  return (
    <div
      ref={rootRef}
      className={classes}
      data-open={open ? 'true' : 'false'}
      data-visible={visible && measured ? 'true' : 'false'}
      data-ready={ready ? 'true' : 'false'}
      data-hover-suppressed={hoverSuppressed ? 'true' : 'false'}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : -1}
      onClick={interactive ? toggle : undefined}
      onKeyDown={interactive ? onKeyDown : undefined}
      onMouseEnter={interactive ? onMouseEnter : undefined}
      onMouseLeave={interactive ? onMouseLeave : undefined}
      aria-expanded={interactive ? open : undefined}
      aria-controls={interactive ? 'caption-tag-drawer' : undefined}
      style={{
        '--tuck': `${tuck}px`,
        '--tuck-hidden': `${cardHeight}px`,
        ...(handleWidth !== null && { width: `calc(${handleWidth}px + var(--space-16))` }),
      } as CSSProperties}
    >
      <div ref={handleRef} className="caption-tag__handle">
        {hasDrawer && (
          <span className="caption-tag__icon-slot" aria-hidden="true">
            <PlusIcon />
          </span>
        )}
        <span className="caption-tag__title t-h5">{title}, {year}</span>
      </div>
      {hasDrawer && (
        <p
          className="caption-tag__description t-p4"
          id="caption-tag-drawer"
          aria-hidden={!open}
        >
          {description}
        </p>
      )}
    </div>
  )
}
