'use client'

// FilterStrip — the Visual tab's category filter: All · Interface · Brand. Heads the
// masonry grid. Mono caption; the active option reads as a pressed keycap.
//
// Semantics: this is a SINGLE-SELECT filter, NOT tabs (there are no per-option
// panels — it narrows one grid in place). So it's a WAI-ARIA `radiogroup` — one tab
// stop (the checked option), arrow keys move + select. That keeps it distinct from
// the ticket's real tab navigation above (which is the primary control) and stops
// assistive tech from hearing a second, competing "tablist".

import { useRef, type KeyboardEvent } from 'react'
import type { PieceCategory } from './data'

export type ShowcaseFilter = 'all' | PieceCategory

const OPTS: { k: ShowcaseFilter; label: string }[] = [
  { k: 'all', label: 'All' },
  { k: 'interface', label: 'Interface' },
  { k: 'brand', label: 'Brand' },
]

interface FilterStripProps {
  filter: ShowcaseFilter
  onFilter: (f: ShowcaseFilter) => void
}

export default function FilterStrip({ filter, onFilter }: FilterStripProps) {
  const groupRef = useRef<HTMLDivElement>(null)

  const onKeyDown = (e: KeyboardEvent) => {
    const i = OPTS.findIndex((o) => o.k === filter)
    let next = i
    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next = (i + 1) % OPTS.length
    else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') next = (i - 1 + OPTS.length) % OPTS.length
    else return
    e.preventDefault()
    onFilter(OPTS[next].k)
    groupRef.current?.querySelectorAll<HTMLButtonElement>('[role="radio"]')[next]?.focus()
  }

  return (
    <div
      className="sc-filter"
      role="radiogroup"
      aria-label="Filter pieces by category"
      ref={groupRef}
      onKeyDown={onKeyDown}
    >
      {OPTS.map((o) => (
        <button
          key={o.k}
          type="button"
          role="radio"
          aria-checked={filter === o.k}
          tabIndex={filter === o.k ? 0 : -1}
          className="sc-filter__opt"
          onClick={() => onFilter(o.k)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
