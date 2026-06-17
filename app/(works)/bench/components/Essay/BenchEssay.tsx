'use client'

// BenchEssay — client owner of the invitation + ticket + work panel.
// Owns the morph (useBenchMorph) and the ?view ⇄ state sync. The card lives in
// a centred `.bench-stage`; the work panel is a full-width sibling (so the
// Showcase grid gets its 1224 canvas while the card stays narrow). `initialView`
// (read server-side in page.tsx) fast-forwards a deep-link straight into browse.

import { useEffect, useRef } from 'react'
import BenchExitMarker from './BenchExitMarker'
import InvitationCard from './InvitationCard'
import Ticket from './Ticket'
import WorkPanel from './WorkPanel'
import { useBenchMorph, type BenchActive } from './useBenchMorph'

export default function BenchEssay({ initialView }: { initialView?: BenchActive | null }) {
  const m = useBenchMorph()
  // Synchronous once-guard — survives React Strict Mode's mount/cleanup/mount
  // double-invoke (a ref persists across it), so the jump fires exactly once
  // no matter which invoke's observer wins.
  const jumped = useRef(false)

  // Deep-link entry (/cases, /showcase, /bench?view=…, case-study EXIT): jump
  // straight into browse mode. When arriving via an in-shell client nav (EXIT
  // from /rr or /biconomy), TransitionSlot owns scroll + an entrance animation
  // for ~1s — the instant jump must WAIT for that to settle (the
  // `.transitioning` class clears) or the pin + scroll get clobbered. On a hard
  // load there's no transition, so it runs immediately.
  useEffect(() => {
    if (!initialView) return
    const run = () => {
      if (jumped.current) return
      jumped.current = true
      m.openTab(initialView, { instant: true, skipUrlSync: true })
    }

    const wb = document.querySelector('.workbench')
    if (!wb || !wb.classList.contains('transitioning')) { run(); return }

    const obs = new MutationObserver(() => {
      if (!wb.classList.contains('transitioning')) { obs.disconnect(); run() }
    })
    obs.observe(wb, { attributes: true, attributeFilter: ['class'] })
    const fb = setTimeout(run, 1600)  // safety if the class never clears
    return () => { obs.disconnect(); clearTimeout(fb) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <>
      <div className="bench-stage">
        <BenchExitMarker />
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
      </div>

      {m.view === 'browse' && (
        <WorkPanel active={m.active} closing={m.closing} workRef={m.workRef} />
      )}
    </>
  )
}
