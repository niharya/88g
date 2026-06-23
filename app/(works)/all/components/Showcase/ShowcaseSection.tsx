'use client'

// ShowcaseSection — the Visual tab's content: the category filter strip heading the
// masonry grid. The filter is just present (no timed hint / countdown / swap — that
// was dropped). Filter state lives in WorkPanel so it survives Visual↔Longform
// switches.

import FilterStrip, { type ShowcaseFilter } from './FilterStrip'
import Showcase from './Showcase'

interface ShowcaseSectionProps {
  filter: ShowcaseFilter
  onFilter: (f: ShowcaseFilter) => void
}

export default function ShowcaseSection({ filter, onFilter }: ShowcaseSectionProps) {
  return (
    <section className="sc-section bench-showcase">
      <FilterStrip filter={filter} onFilter={onFilter} />
      <Showcase filter={filter} />
    </section>
  )
}
