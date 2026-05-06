// ActorStickers — three label stickers replacing the words "engineers,
// users, protocols" inline in the page prose. Per-instance tilt and
// y-offset are locked to authored values — no randomization on load,
// every visit renders the same pose. Server-rendered: this component
// has no client features (no useState / useEffect / event handlers);
// LabelSticker is `'use client'` and Next.js handles the boundary
// crossing automatically.
//
// Each sticker is wrapped in a `.sop__actor-slot` span that owns its
// per-instance translateY. The wrapper is the right home for the Y
// offset because the inner <Sticker>'s transform is already spent on
// rotation + hover lift — overloading it would fight the family
// contract.

import type { CSSProperties } from 'react'
import { LabelSticker } from '../../components/LabelSticker'

// [engineers, users, protocols]
const TILTS: [number, number, number] = [-3, 3, -1]
const YS:    [number, number, number] = [-6, 2, -3]

const slotStyle = (i: number): CSSProperties =>
  ({ ['--sop-actor-y' as string]: `${YS[i]}px` })

export default function ActorStickers() {
  return (
    <>
      <span className="sop__actor-slot" style={slotStyle(0)}>
        <LabelSticker tilt={TILTS[0]} className="sop__actor">
          engineers
        </LabelSticker>
      </span>
      <span className="sop__actor-slot" style={slotStyle(1)}>
        <LabelSticker tone="orange" tilt={TILTS[1]} className="sop__actor">
          users
        </LabelSticker>
      </span>
      <span className="sop__actor-slot" style={slotStyle(2)}>
        <LabelSticker tone="green" tilt={TILTS[2]} className="sop__actor">
          protocols
        </LabelSticker>
      </span>
    </>
  )
}
