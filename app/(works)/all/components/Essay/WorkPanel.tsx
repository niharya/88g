'use client'

// WorkPanel — the browse-mode content revealed beneath the lifted invitation.
//   Longform → SelectedContent (the Timeline + expandable Archive). It's
//     absolute-positioned (mat anchored right:0 width:688), so it's hosted in
//     `.bench-cases`, a sized relative wrapper that recreates the old
//     `.selected-layout` positioning context (incl. archive-open growth).
//   Visual → ShowcaseSection: the category filter strip over the masonry grid.
//
// `filter` is held HERE (not in ShowcaseSection) so the reader's choice survives
// Visual↔Longform tab switches — ShowcaseSection unmounts on each switch, but this
// state persists. Top padding clears the pinned navbar.
//
// The tab swap rides the shared tab-switch idiom (app/lib/motion.ts — the same
// one /rr and /biconomy use): AnimatePresence mode="wait" runs the outgoing tab's
// exit before the incoming enter, on the snap curve. `initial={false}` skips the
// first-mount wipe (deep-link / reload lands at rest). The body's enter/exit scale
// (0.985→1) only paints during the ~0.3s switch and settles to transform:none, so
// it never becomes a lasting containing block — and the showcase grid is measured
// via offsetHeight (transform-immune), so the transient scale can't re-pack it.
// WorkPanel is a SIBLING of the docked ticket (not an ancestor), so this transform
// never touches the ticket's fixed positioning.

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import SelectedContent from '../SelectedContent'
import ShowcaseSection from '../Showcase/ShowcaseSection'
import type { ShowcaseFilter } from '../Showcase/FilterStrip'
import type { BenchActive } from './useBenchDock'
import { TAB_BODY_VARIANTS, TAB_BODY_TRANSITION } from '../../../../lib/motion'

interface WorkPanelProps {
  active: BenchActive
}

export default function WorkPanel({ active }: WorkPanelProps) {
  const [filter, setFilter] = useState<ShowcaseFilter>('all')

  return (
    <div className="bench-work">
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={active}
          variants={TAB_BODY_VARIANTS}
          initial="enter"
          animate="active"
          exit="exit"
          transition={TAB_BODY_TRANSITION}
        >
          {active === 'lf' ? (
            <div className="bench-cases">
              <SelectedContent />
            </div>
          ) : (
            <ShowcaseSection filter={filter} onFilter={setFilter} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
