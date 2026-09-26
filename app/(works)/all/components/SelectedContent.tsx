'use client'

// SelectedContent — the Cases-tab mat. Owns the `expanded` state (desktop
// dropdown + mat growth) and the desktop/mobile composition gate.
//
// Desktop: the absolute-positioned Timeline (rail, cards, inline case-study
// dropdown). Mobile: a purpose-built cards-first composition (MobileCases)
// with the case studies in a bottom sheet — a separate DOM, swapped via
// matchMedia(MOBILE_BP), not a CSS reflow of the rail. Both never coexist,
// so no duplicated content. The gate mirrors the showcase's isMobile pattern
// (single source of truth: Showcase/responsive.ts).
//
// Reduced motion: the route blanket in selected.css is CSS-only, and Framer
// drives WAAPI + inline styles, so it cannot reach the ~32 mount-time entrances
// in Timeline/MobileCases. `MotionConfig reducedMotion="user"` is the Framer
// half of that guard. It is scoped HERE, not at BenchEssay, deliberately: the
// Showcase media (LifecycleGauge, RrInterface/Scene + CardPanel, ShowcasePiece)
// already hand-wires reduced motion with per-component decisions, and a
// route-wide MotionConfig would override them. WorkPanel's tab swap and
// TransitionSlot are ANCESTORS, so both stay outside this context.
// See ANOMALIES.md → "Reduced motion".

import { useState, useEffect, useCallback } from 'react'
import { MotionConfig } from 'framer-motion'
import Timeline from './Timeline'
import MobileCases from './MobileCases'
import { MOBILE_BP } from './Showcase/responsive'

export default function SelectedContent() {
  const [expanded, setExpanded] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  const handleToggle = useCallback(() => {
    setExpanded(prev => !prev)
  }, [])

  // Match the showcase's mobile gate. Server + first client render are desktop
  // (SSR-safe, no hydration mismatch); the effect swaps to mobile after mount.
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BP)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  return (
    <section
      // `.selected-mat--archive-open` is the historical name for the
      // "mat grown" modifier (the bench.css height mirror it was named for is
      // long gone). It is LOAD-BEARING again: the mint spine's lower terminus
      // is a different element per state — the Slangbusters card when closed,
      // the Codezeros segment when open — and this class is what selects
      // between them. See selected.css → .selected-tl__bar-mint.
      // Only the desktop dropdown sets it.
      className={`selected-mat mat${expanded ? ' selected-mat--archive-open' : ''}`}
    >
      <MotionConfig reducedMotion="user">
        {isMobile ? <MobileCases /> : <Timeline expanded={expanded} onToggle={handleToggle} />}
      </MotionConfig>
    </section>
  )
}
