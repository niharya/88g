'use client'

// WorkPanel — the browse-mode content revealed beneath the lifted invitation.
// Phase 4 renders design placeholders so the morph + scroll choreography can
// be exercised; Phase 6 swaps in the real content (Longform → Timeline +
// Archive, Visual → the Showcase grid). Top padding clears the pinned navbar.

import type { Ref } from 'react'
import type { BenchActive } from './useBenchMorph'

interface WorkPanelProps {
  active: BenchActive
  closing: boolean
  workRef?: Ref<HTMLDivElement>
}

function LongformPlaceholder() {
  const rows = [
    { idx: '01', title: 'Case study placeholder', year: '2024' },
    { idx: '02', title: 'Case study placeholder', year: '2023' },
    { idx: '03', title: 'Case study placeholder', year: '2022' },
  ]
  return (
    <div className="bench-lf">
      {rows.map(r => (
        <div className="bench-lf-row" key={r.idx}>
          <span className="bench-lf-row__idx">{r.idx}</span>
          <span className="bench-lf-row__title">{r.title}</span>
          <span className="bench-lf-row__year">{r.year}</span>
        </div>
      ))}
    </div>
  )
}

function VisualPlaceholder() {
  return (
    <div className="bench-vis-grid">
      {Array.from({ length: 6 }).map((_, i) => (
        <div className="bench-vis-tile" key={i} />
      ))}
    </div>
  )
}

export default function WorkPanel({ active, closing, workRef }: WorkPanelProps) {
  return (
    <div ref={workRef} className={`bench-work${closing ? ' bench-work--closing' : ''}`}>
      {active === 'lf' ? <LongformPlaceholder /> : <VisualPlaceholder />}
    </div>
  )
}
