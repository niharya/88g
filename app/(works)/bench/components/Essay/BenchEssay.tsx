'use client'

// BenchEssay — client owner of the invitation + ticket + work panel.
// Owns the morph via useBenchMorph (state machine + ticket geometry +
// scrollGlide lockstep) and the ?view ⇄ state sync: `initialView` (read
// server-side in page.tsx, so the /cases & /showcase rewrites work too)
// fast-forwards straight into browse mode on a deep-link, without replaying
// the morph. Phase 6 replaces WorkPanel's placeholders with Timeline / Showcase.

import { useEffect, useRef } from 'react'
import InvitationCard from './InvitationCard'
import Ticket from './Ticket'
import WorkPanel from './WorkPanel'
import { useBenchMorph, type BenchActive } from './useBenchMorph'

export default function BenchEssay({ initialView }: { initialView?: BenchActive | null }) {
  const m = useBenchMorph()
  const entered = useRef(false)

  // Deep-link entry (/cases, /showcase, /bench?view=…, case-study EXIT): jump
  // straight into browse mode, no morph replay. Once.
  useEffect(() => {
    if (entered.current) return
    entered.current = true
    if (initialView) m.openTab(initialView, { instant: true, skipUrlSync: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
