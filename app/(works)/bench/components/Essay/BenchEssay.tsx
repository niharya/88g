'use client'

// BenchEssay — the bench as one scroll document: card → sticky ticket → the
// active tab's work (always present). The ticket docks into a navbar on scroll
// (useBenchDock); clicking a tab scroll-glides to the work; ✕ scrolls back to
// the card. Showcase is the default tab. `initialView` (server-read in page.tsx
// for the /cases & /showcase rewrites + case-study EXIT) scrolls into the work
// on a deep-link; bare /bench stays at the resting card.

import BenchExitMarker from './BenchExitMarker'
import InvitationCard from './InvitationCard'
import Ticket from './Ticket'
import WorkPanel from './WorkPanel'
import { useBenchDock, type BenchActive } from './useBenchDock'

// `initialView` (server-read in page.tsx for the /cases & /showcase rewrites +
// case-study EXIT) selects the active tab so a deep-link lands on the right
// content below the card. It does NOT auto-scroll into the work — that landed
// inconsistently against the content-layout + TransitionSlot scroll timing, so
// the bench rests at the card (consistent with bare /bench) and the chosen tab
// is one scroll/click away. (Auto-scroll-into-content: deferred follow-up.)
export default function BenchEssay({ initialView }: { initialView?: BenchActive | null }) {
  const d = useBenchDock(initialView ?? 'vis')

  return (
    <>
      <div className="bench-stage">
        <BenchExitMarker />
        <InvitationCard />
      </div>

      {/* Sticky ticket — sits at the card's foot, docks into a navbar on scroll. */}
      <Ticket
        docked={d.docked}
        active={d.active}
        onShowcase={() => d.openTab('vis')}
        onLongform={() => d.openTab('lf')}
        onClose={d.close}
        slotRef={d.slotRef}
      />

      {/* Work — always present; the active tab swaps the content. */}
      <WorkPanel active={d.active} workRef={d.workRef} />
    </>
  )
}
