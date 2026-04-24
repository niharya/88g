'use client'

// Multiverse — port of original Multiverse.js
// Source-locked: preserves scroll-driven dissolve exactly.
// The scroll animation is what makes text feel earned, not labeled.
// Do not flatten into static layout — the motion IS the artifact feeling.

import { useRef } from 'react'
import {
  motion,
  useMotionTemplate,
  useScroll,
  useTransform,
} from 'framer-motion'
import BiconomyChip from './BiconomyChip'
import { Img } from '../../../components/Img'

export default function Multiverse() {
  const posterRef = useRef<HTMLSpanElement>(null)
  const { scrollYProgress } = useScroll({
    target: posterRef,
    offset: ['start center', 'center start'],
  })

  // Before-caption: visible → fades out at midpoint → returns
  const beforeElementsOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.8],
    [1, 0, 1],
  )
  // After-captions: invisible → fade in at end
  const afterElementsOpacity = useTransform(
    scrollYProgress,
    [0, 0.5, 0.8],
    [0, 0, 1],
  )
  // Blur peaks at the midpoint seam
  const blur = useTransform(scrollYProgress, [0, 0.5, 0.8], [0, 4, 0])
  const filter = useMotionTemplate`blur(${blur}px)`

  return (
    <section id="multiverse" className="multiverse">

      {/* ── Header card — full width, centered ──────────────────────────── */}
      <div className="multiverse__header">
        <div className="multiverse__card-outer surface">
          <div className="multiverse__card-inner">
            <div className="multiverse__card-text">
              <h2 className="multiverse__h2 t-h2">
                <span className="t-p4">After a year of remote work,</span>
                <br />
                I met the team at the annual offsite and realized each person
                carried a different idea of what Biconomy was.
              </h2>
              <p className="t-p4 multiverse__subtitle">
                That turned into an internal joke. I called this
                <br />
                <span className="t-h5">The Multiverse Theory</span>
              </p>
            </div>
            <hr className="multiverse__divider" />
            <div className="multiverse__aside">
              <p className="t-p4 multiverse__aside-text">
                To test it, I ran one-on-one calls and asked simple questions*
                around directions and priorities.
                <br /><br />
                Surprisingly, the answers varied greatly.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Before-caption — left-anchored, dissolves out on scroll ─────── */}
      <div className="multiverse__before-row">
        <motion.p
          style={{ opacity: beforeElementsOpacity, filter }}
          className="multiverse__before-text t-p4"
        >
          I turned that phenomenon into a poster which made the problem real
          while also carrying the humor with which this had started
        </motion.p>
      </div>

      {/* ── Poster + after-caption underneath ───────────────────────────── */}
      <div className="multiverse__poster-col">
        <Img
          ref={posterRef}
          src="/images/biconomy/multiverse_poster.png"
          alt="Multiverse"
          className="multiverse__poster"
          draggable={false}
          intrinsic
          placeholder="hash"
          sizes="(max-width: 767px) 100vw, 800px"
        />
        <motion.p
          style={{ opacity: afterElementsOpacity, filter }}
          className="multiverse__after-sub t-p4"
        >
          Orange, the fruit, was part of our brand's secondary identity
        </motion.p>
      </div>

      {/* ── After-caption — centered, dissolves in on scroll ────────────── */}
      <div className="multiverse__after-row">
        <motion.p
          style={{ opacity: afterElementsOpacity, filter }}
          className="multiverse__after-text t-p4"
        >
          Once I had resonance with the core team, I presented the findings to
          the founders.
          <br /><br />
          They agreed with the diagnosis, unfortunately not the solutions.
        </motion.p>
      </div>

      {/* ── BiconomyChip — three marks, punctuation only ─────────────────── */}
      <div className="multiverse__chip-row">
        <BiconomyChip />
      </div>

    </section>
  )
}
