'use client'

import { Img } from '../../../../../components/Img'
import { PAYMASTER_FLOWS } from './paymasterFlows'

// PaymasterAudit — simple variant: image only.
//
// The Before/After switch and the 3-dot page chip live on the parent
// tile's controls bar (ShowcasePiece). This component just renders the
// matching flow image for the current (flowIndex, showAfter) pair.
//
// The earlier slide-out olive "Notes" rail (with numbered Monostamps on
// the image) was removed by request — it never settled inside the
// showcase tile at this scale. If revived later, port it from /biconomy
// as a dedicated primitive rather than reviving this version.

type Props = {
  flowIndex: number
  showAfter: boolean
}

export default function PaymasterAudit({ flowIndex, showAfter }: Props) {
  const flow = PAYMASTER_FLOWS[flowIndex] ?? PAYMASTER_FLOWS[0]
  const variant = showAfter ? flow.after : flow.before

  return (
    <div className="sc-audit">
      <div className="sc-audit__frame">
        <Img
          src={variant.image}
          alt={`${flow.title} — ${showAfter ? 'after' : 'before'} audit`}
          fill
          sizes="(max-width: 767px) 90vw, 60vw"
        />
      </div>
    </div>
  )
}
