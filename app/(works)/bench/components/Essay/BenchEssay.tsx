'use client'

// BenchEssay — the bench as one scroll document: card → sticky ticket → the
// active tab's work (always present). The ticket docks into a navbar on scroll
// (useBenchDock); clicking a tab scroll-glides to the work; ✕ scrolls back to
// the card. Showcase is the default tab. `initialView` (server-read in page.tsx
// for the /cases & /showcase rewrites + case-study EXIT) scrolls into the work
// on a deep-link; bare /bench stays at the resting card.

import { useEffect, useRef } from 'react'
import BenchExitMarker from './BenchExitMarker'
import InvitationCard from './InvitationCard'
import Ticket from './Ticket'
import WorkPanel from './WorkPanel'
import { useBenchDock, type BenchActive } from './useBenchDock'

export default function BenchEssay({ initialView }: { initialView?: BenchActive | null }) {
  const d = useBenchDock(initialView ?? 'vis')
  // Synchronous once-guard — survives React Strict Mode's mount/cleanup/mount
  // (a ref persists across it), so the deep-link scroll fires exactly once even
  // though the first invoke's timeout is cancelled by its own cleanup.
  const jumped = useRef(false)

  useEffect(() => {
    if (!initialView) return
    const fire = () => {
      if (jumped.current) return
      jumped.current = true
      d.scrollToWork(true)   // instant + re-asserts until docked
    }
    // Defer past the entry beat: ~1s when arriving via an in-shell client nav
    // (TransitionSlot owns scroll for that long and would reset us mid-flight),
    // a short beat on a hard load. scrollToWork(true) then re-asserts the dock
    // position until it sticks, so exact timing isn't load-bearing. The
    // synchronous once-guard makes Strict Mode's re-mount harmless.
    const wb = document.querySelector('.workbench')
    const delay = wb?.classList.contains('transitioning') ? 1150 : 200
    const t = setTimeout(fire, delay)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
