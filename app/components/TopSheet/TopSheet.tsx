'use client'

// TopSheet — a portaled top-layer drawer that descends from the TOP edge of
// the viewport over a dimmed scrim, hanging like a pulled shade. A grab handle
// sits at its LOWER edge (the visible lip); drag it UP — or tap the scrim, or
// press Esc — to dismiss. Built for the project-marker "Signals" reveal on
// /biconomy + /rr, but content-agnostic: pass any children.
//
// Architecture mirrors ShowcaseBottomSheet's portal + scroll-lock contract and
// borrows useExpand's `is-overlay-open` body class so the route's
// useDominanceSnap pauses while the drawer is open. It is a CONTROLLED
// component — the consumer owns `open` and `onClose`.
//
// Motion is house-paper only: one --ease-paper curve, --dur-settle slide, no
// overshoot. Drag uses a bound motion value so the snap-back curve is ours
// (Framer's default constraint spring can micro-bounce — we don't let it).
// Reduced-motion swaps the slide for a fade and disables drag.

import { useEffect, useId, useRef, type CSSProperties, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import {
  AnimatePresence,
  animate,
  motion,
  useDragControls,
  useMotionValue,
  useReducedMotion,
  type PanInfo,
} from 'framer-motion'

const EASE = [0.5, 0, 0.2, 1] as const // mirrors --ease-paper
const DUR_SETTLE = 0.425 // mirrors --dur-settle
const DUR_SLIDE = 0.25 // mirrors --dur-slide

// Drag past this distance (px) OR fling faster than this (px/s) upward to dismiss.
const DISMISS_OFFSET = 120
const DISMISS_VELOCITY = 500

interface Props {
  open: boolean
  onClose: () => void
  children: ReactNode
  /** Accessible label for the dialog (announced to screen readers). */
  label?: string
  /** Max content width of the panel in px. Default 1080 (the bento's authored width). */
  maxWidth?: number
}

export default function TopSheet({ open, onClose, children, label, maxWidth = 1080 }: Props) {
  const controls = useDragControls()
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const y = useMotionValue<number | string>(0)
  const uid = useId().replace(/:/g, '')
  // Distinguishes a real drag from a plain click/tap on the handle, so a
  // below-threshold drag (which snaps the panel back open) doesn't also fire
  // the button's click and close it. Reset at the start of every interaction.
  const dragged = useRef(false)

  // Body scroll-lock + dominance-snap pause for the drawer's open lifetime.
  // Restore the prior overflow (not blindly clear) so a nested lock survives.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('is-overlay-open')
    return () => {
      document.body.style.overflow = prev
      document.body.classList.remove('is-overlay-open')
    }
  }, [open])

  // Escape dismiss.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Focus save → first focusable inside → restore to trigger on close.
  useEffect(() => {
    if (!open) return
    const node = panelRef.current
    if (!node) return
    const prevFocus = document.activeElement as HTMLElement | null
    const first = node.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )
    const id = requestAnimationFrame(() => (first ?? node).focus())
    return () => {
      cancelAnimationFrame(id)
      if (prevFocus && node.contains(document.activeElement)) prevFocus.focus()
    }
  }, [open])

  const onDragEnd = (_: unknown, info: PanInfo) => {
    const dismiss = info.offset.y < -DISMISS_OFFSET || info.velocity.y < -DISMISS_VELOCITY
    if (dismiss) onClose()
    else animate(y, 0, { duration: DUR_SLIDE, ease: EASE }) // our curve, no bounce
  }

  const onHandlePointerDown = (e: ReactPointerEvent) => {
    dragged.current = false
    if (!reduce) controls.start(e)
  }
  const onHandleClick = () => {
    // Suppress the click that trails a drag; a plain tap/click still closes.
    if (dragged.current) return
    onClose()
  }

  if (typeof document === 'undefined') return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div
          className="top-sheet"
          role="dialog"
          aria-modal="true"
          aria-label={label}
          style={{ ['--top-sheet-max-w' as keyof CSSProperties]: `${maxWidth}px` } as CSSProperties}
        >
          <motion.div
            className="top-sheet__scrim"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: DUR_SLIDE, ease: EASE }}
          />
          <motion.div
            ref={panelRef}
            id={`top-sheet-panel-${uid}`}
            className="top-sheet__panel"
            tabIndex={-1}
            style={{ y }}
            initial={reduce ? { opacity: 0 } : { y: '-100%' }}
            animate={reduce ? { opacity: 1 } : { y: 0 }}
            exit={reduce ? { opacity: 0 } : { y: '-100%' }}
            transition={{ duration: DUR_SETTLE, ease: EASE }}
            drag={reduce ? false : 'y'}
            dragControls={controls}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0.7, bottom: 0 }}
            dragMomentum={false}
            onDragStart={() => {
              dragged.current = true
            }}
            onDragEnd={onDragEnd}
          >
            <div className="top-sheet__content">{children}</div>
            <button
              type="button"
              className="top-sheet__handle"
              aria-label="Close"
              onPointerDown={onHandlePointerDown}
              onClick={onHandleClick}
            >
              <span className="top-sheet__grip" aria-hidden="true" />
            </button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
