'use client'

// BenchEssay — client owner of the invitation + ticket + work panel.
// Owns the morph via useBenchMorph (state machine + ticket geometry +
// scrollGlide lockstep). Phase 5 will sync this to the ?view search-param;
// Phase 6 replaces WorkPanel's placeholders with the real Timeline / Showcase.

import InvitationCard from './InvitationCard'
import Ticket from './Ticket'
import WorkPanel from './WorkPanel'
import { useBenchMorph } from './useBenchMorph'

export default function BenchEssay() {
  const m = useBenchMorph()

  return (
    <>
      <InvitationCard>
        <Ticket
          condensed={m.condensed}
          active={m.active}
          onLongform={() => m.openTab('lf')}
          onVisual={() => m.openTab('vis')}
          onClose={m.closeTab}
          slotRef={m.slotRef}
          ticketRef={m.ticketRef}
        />
      </InvitationCard>

      {m.view === 'browse' && (
        <WorkPanel active={m.active} closing={m.closing} workRef={m.workRef} />
      )}
    </>
  )
}
