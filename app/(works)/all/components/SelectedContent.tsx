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

import { useState, useEffect, useCallback } from 'react'
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
      // "mat grown" modifier — kept so the `.bench-cases:has(...)` height
      // mirror in bench.css keeps matching. Only the desktop dropdown sets it.
      className={`selected-mat mat${expanded ? ' selected-mat--archive-open' : ''}`}
    >
      {isMobile ? <MobileCases /> : <Timeline expanded={expanded} onToggle={handleToggle} />}
    </section>
  )
}
