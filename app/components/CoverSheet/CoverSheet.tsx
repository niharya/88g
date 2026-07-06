'use client'

// CoverSheet — the topmost sheet in a case study's stack: the project
// "Signals" bento on a punched graph-paper card, above the first chapter.
// It is the case's cover, reached via the project marker's toggle (or by
// scrolling up) — NOT a menu chapter, so it carries no ChapterMarker and no
// dominance-snap. It keeps the `.sheet .section-reveal` pair so it Places +
// reveals on the same paths as every sheet, and the `id="signals"` scroll
// target the project marker glides to.
//
// Optional `coverImage` renders a CoverPeek photo tucked behind the card. The
// card + the peek are siblings inside `.cover-stack` so they move independently:
// on the peek's active toggle the card slides DOWN while the peek slides UP,
// opening a gap that reveals more of the photo. One `active` state drives both.
//
// While the peek is out, the section lifts to `--z-overlay` and a `.cover-scrim`
// (z between card and photo) dims everything behind the raised photo; a click
// anywhere on it — or Escape — returns the photo. (The scrim is a fixed layer
// oversized to cover the viewport — see cover-sheet.css for why.)

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { useReveal } from '../useReveal'
import CoverPeek from './CoverPeek'
import SignalsBento from '../SignalsBento'
import type { SignalsData } from '../SignalsBento'

const EASE = [0.5, 0, 0.2, 1] as const // --ease-paper
const CARD_DOWN = 22 // px the card slides down when the peek is brought forward

export default function CoverSheet({ data }: { data: SignalsData }) {
  const ref = useRef<HTMLElement>(null)
  useReveal(ref)

  const [revealed, setRevealed] = useState(false)
  const [active, setActive] = useState(false)

  // Play the peek entrance on the cover's reveal (useReveal adds `.revealed`
  // after the page-boot gate), not on raw mount — otherwise it animates behind
  // the gate and the reader misses it.
  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (el.classList.contains('revealed')) {
      setRevealed(true)
      return
    }
    const obs = new MutationObserver(() => {
      if (el.classList.contains('revealed')) {
        setRevealed(true)
        obs.disconnect()
      }
    })
    obs.observe(el, { attributes: true, attributeFilter: ['class'] })
    return () => obs.disconnect()
  }, [])

  // Peek-out is a focused, dimmed state: lock scroll + pause dominance-snap
  // (the shared `is-overlay-open` contract) and let Escape return the photo,
  // matching the click-anywhere-on-scrim dismissal.
  useEffect(() => {
    if (!active) return
    const prevOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.body.classList.add('is-overlay-open')
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActive(false)
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = prevOverflow
      document.body.classList.remove('is-overlay-open')
      document.removeEventListener('keydown', onKey)
    }
  }, [active])

  return (
    <section
      ref={ref}
      id="signals"
      // `revealed` is echoed into the className because useReveal adds `.revealed`
      // imperatively to this node; without it here, toggling `is-peek-open` on a
      // re-render would rewrite className and clobber `.revealed`, dropping the
      // whole section back to its un-revealed (opacity 0) state.
      className={`sheet section-reveal sheet--cover${revealed ? ' revealed' : ''}${active ? ' is-peek-open' : ''}`}
      aria-label={data.label}
    >
      <div className="cover-stack">
        {/* Mobile-only decorative backdrop: the team photo tucked BEHIND the
            edge-to-edge graph mat, bleeding across above it. Desktop hides it
            (the interactive CoverPeek handles desktop); mobile hides the peek. */}
        {data.coverImage && (
          // eslint-disable-next-line @next/next/no-img-element — decorative backdrop, not an <Img> content surface
          <img className="cover-backdrop" src={data.coverImage.src} alt="" aria-hidden="true" />
        )}

        {data.coverImage && (
          <CoverPeek
            image={data.coverImage}
            revealed={revealed}
            active={active}
            onToggle={() => setActive((a) => !a)}
          />
        )}

        {/* Dim scrim — over the card + page, under the raised photo. Click
            anywhere returns it. Present only when there is a cover photo. */}
        {data.coverImage && (
          <motion.div
            className="cover-scrim"
            aria-hidden="true"
            onClick={() => setActive(false)}
            initial={false}
            animate={{ opacity: active ? 1 : 0 }}
            style={{ pointerEvents: active ? 'auto' : 'none' }}
            transition={{ duration: 0.4, ease: EASE }}
          />
        )}

        <motion.div
          className="cover-mat-wrap"
          animate={{ y: active ? CARD_DOWN : 0 }}
          // On close the card rises immediately (no delay) and a hair quicker
          // than the photo's return, so it closes over the photo as it retucks.
          transition={{ duration: active ? 0.45 : 0.42, ease: EASE }}
        >
          <span className="cover-mat__bg mat" aria-hidden="true" />
          <div className="cover-mat__body">
            <SignalsBento data={data} />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
