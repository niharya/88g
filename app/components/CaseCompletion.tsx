'use client'

// CaseCompletion — passive "read to the end" signal.
// ───────────────────────────────────────────────────
// Mounts a read-only IntersectionObserver on a case study's FINAL <section id>
// and fires `case-completed` once when it scrolls into view. It NEVER touches
// the tuned reveal / dominance-snap / scroll machinery (see ./ANOMALIES.md) —
// it only observes. Each case-study page mounts it with that route's last
// section id (/biconomy → "staying-anchored", /rr → "outcome"). Renders nothing.

import { useEffect } from 'react'
import { analytics } from '../lib/analytics'

export default function CaseCompletion({
  project,
  sectionId,
}: {
  project: string
  sectionId: string
}) {
  useEffect(() => {
    const el = document.getElementById(sectionId)
    if (!el) return
    let fired = false
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !fired) {
          fired = true
          analytics.caseCompleted(project)
          io.disconnect()
        }
      },
      { rootMargin: '-60px', threshold: 0 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [project, sectionId])

  return null
}
