// (works) route group layout — persistent shell
// Stays mounted across /selected, /rr, and /biconomy navigations.
// Renders the workbench surface, PaperFilter, and nav markers once.
// TransitionSlot wraps children with DOM ghost-clone page transitions.

import type { ReactNode } from 'react'
import Script from 'next/script'
import '../components/nav/nav.css'
import PaperFilter from '../components/PaperFilter'
import ShellNav from './ShellNav'
import TransitionSlot from './TransitionSlot'

export default function WorksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script id="font-gate" strategy="afterInteractive">{`
        var done = function() { document.documentElement.classList.add('fonts-ready'); };
        var t = setTimeout(done, 3000);
        document.fonts.ready.then(function() { clearTimeout(t); done(); });
      `}</Script>
      <main className="workbench">
        <PaperFilter />
        <ShellNav />
        <TransitionSlot>{children}</TransitionSlot>
      </main>
    </>
  )
}
