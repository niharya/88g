// (works) route group layout — persistent shell
// Stays mounted across /selected, /rr, and /biconomy navigations.
// Renders the workbench surface, PaperFilter, and nav markers once.
// TransitionSlot wraps children with DOM ghost-clone page transitions.

import type { ReactNode } from 'react'
import '../components/nav/nav.css'
import '../components/NavMarker/navmarker.css'
import { CrossShellEntryFader } from '../components/CrossShellVeil'
import PaperFilter from '../components/PaperFilter'
import ShellNav from './ShellNav'
import TransitionSlot from './TransitionSlot'

export default function WorksLayout({ children }: { children: ReactNode }) {
  // Font gate is set globally in the root layout so /selected, /rr, /biconomy,
  // and the landing page all participate in the same opacity reveal.
  // CrossShellEntryFader is a no-op unless the user just came in via the
  // CrossShellVeil (i.e. from /marks); see CLAUDE.md "Cross-shell navigation".
  return (
    <>
      <CrossShellEntryFader />
      <main className="workbench">
        <PaperFilter />
        <ShellNav />
        <TransitionSlot>{children}</TransitionSlot>
      </main>
    </>
  )
}
