'use client'

// BenchEssay — client owner of the invitation + ticket (+ work panel in
// Phase 6). Phase 3 renders the ticket resting with no-op handlers; Phase 4
// replaces the local stubs with the useBenchMorph state machine (view /
// active / condensed / closing) + imperative ticket geometry + scrollGlide,
// and Phase 5 syncs it to the ?view search-param.

import InvitationCard from './InvitationCard'
import Ticket from './Ticket'

export default function BenchEssay() {
  const noop = () => {}

  return (
    <InvitationCard>
      <Ticket
        condensed={false}
        active="lf"
        onLongform={noop}
        onVisual={noop}
        onClose={noop}
      />
    </InvitationCard>
  )
}
