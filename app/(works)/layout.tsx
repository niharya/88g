// (works) route group layout — persistent shell
// Stays mounted across /all, /rr, and /biconomy navigations.
// Renders the workbench surface, PaperFilter, and nav markers once.
// TransitionSlot wraps children with DOM ghost-clone page transitions.

import type { ReactNode } from 'react'
import '../components/nav/nav.css'
import '../components/NavMarker/navmarker.css'
import '../components/MarkerTicket/marker-ticket.css'
import '../components/TopSheet/top-sheet.css'
import '../components/SignalsBento/signals-bento.css'
import '../components/CoverSheet/cover-sheet.css'
import { CrossShellEntryFader } from '../components/CrossShellVeil'
import PaperFilter from '../components/PaperFilter'
import ShellNav from './ShellNav'
import TransitionSlot from './TransitionSlot'
import Footer from '../components/Footer'
import '../components/Footer/footer.css'

export default function WorksLayout({ children }: { children: ReactNode }) {
  // Font gate is set globally in the root layout so /all, /rr, /biconomy,
  // and the landing page all participate in the same opacity reveal.
  // CrossShellEntryFader is a no-op unless the user just came in via the
  // CrossShellVeil (i.e. from /marks); see CLAUDE.md "Cross-shell navigation".
  return (
    <>
      {/* Hash-anchor suppression — the first half of HashLanding (the other
          half is app/components/HashLanding.tsx; read its header for the full
          rationale). On the two case-study routes the browser resolves a hash
          against the streaming, pre-hydration layout — ~2.5k px taller than
          the settled one — and clamps the reader to the BOTTOM of the case.
          Production-only: `next dev` resolves the same URLs correctly, so this
          is invisible to every local check.

          Stripping the hash HERE, during parse, is what makes it work: this
          runs before the chapter <section id>s have been streamed, so there is
          nothing for the browser to anchor to and the page simply loads at the
          Signals cover. The stash is handed to HashLanding, which places the
          reader once layout has settled and puts the hash back.

          Vanilla inline <script>, not next/script — same reasoning as the page
          gate in app/layout.tsx: `beforeInteractive` is queued through
          self.__next_s and runs far too late to beat the anchor. It lives in
          the (works) shell rather than the root layout because /rr and
          /biconomy are this shell's business (cf. TransitionSlot's isProject).
          Unknown hashes are left alone — with no matching element the browser
          never scrolls, so they are already harmless. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var h=location.hash;if(h.length<2)return;var p=location.pathname.replace(/\\/$/,'');if(p!=='/rr'&&p!=='/biconomy')return;window.__deepLink=h.slice(1);history.replaceState(null,'',location.pathname+location.search);}catch(e){}})();`,
        }}
      />
      <CrossShellEntryFader />
      <main className="workbench">
        <PaperFilter />
        <ShellNav />
        <TransitionSlot>{children}</TransitionSlot>
      </main>
      {/* Site footer — rendered OUTSIDE the workbench main on a "deeper
          desk" surface (`.footer-stage` uses --below-bg, half-step
          darker than the workbench paper). The workbench casts a soft
          shadow onto this stage (see globals.css `.workbench`), so the
          eye reads the workbench as a sheet of paper resting on a desk
          and the footer as occupying that desk. Mounting at the layout
          level covers /all, /rr, /biconomy without per-page
          wiring. */}
      <div className="footer-stage">
        <Footer />
      </div>
    </>
  )
}
