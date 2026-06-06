'use client'

// PaymasterAuditController — owns the paymaster audit's flow-cycling
// state. ShowcasePiece (the generic tile shell) no longer knows about
// paymaster's flow count, flow index, or page chip.
//
// State ownership:
//   • flowIndex lives here, not on the tile shell.
//   • Flow count derives from PAYMASTER_FLOWS.length — no hardcoded 3.
//
// Chip placement:
//   • The chip belongs visually inside the tile's `.sc-controls` row,
//     to the right of the Switch. The shell renders an empty extras
//     slot at that position and exposes it via ExtraControlsContext.
//     This controller portals its chip into that slot, so DOM order
//     stays pause → switch → chip while state stays here.

import { useContext, useState } from 'react'
import { createPortal } from 'react-dom'
import PaymasterAudit from './PaymasterAudit'
import { PAYMASTER_FLOWS } from './paymasterFlows'
import { ExtraControlsContext } from '../ExtraControlsContext'
import { DotPager } from '../../../../../components/DotPager'

const FLOW_COUNT = PAYMASTER_FLOWS.length

export default function PaymasterAuditController({
  showAfter,
}: {
  showAfter: boolean
}) {
  const [flowIndex, setFlowIndex] = useState(0)
  const cycleFlow = () => setFlowIndex((i) => (i + 1) % FLOW_COUNT)
  const extrasSlot = useContext(ExtraControlsContext)

  return (
    <>
      <PaymasterAudit flowIndex={flowIndex} showAfter={showAfter} />
      {extrasSlot &&
        createPortal(
          <DotPager
            className="sc-pagechip"
            count={FLOW_COUNT}
            activeIndex={flowIndex}
            onAdvance={cycleFlow}
            onClick={(e) => e.stopPropagation()}
            ariaLabel={`Flow ${flowIndex + 1} of ${FLOW_COUNT}`}
          />,
          extrasSlot,
        )}
    </>
  )
}
