'use client'

// ShowcaseBottomSheet — singleton mobile bottom sheet.
//
// There's only ever one active piece, so there's only ever one sheet.
// This component is rendered ONCE by Showcase (not per-tile) when a
// piece is active and the viewport is mobile. It owns:
//
//   • the body scroll-lock for the sheet's lifetime
//   • the portal escape into document.body (so position: fixed anchors
//     to the viewport, not to any transformed ancestor in the tile tree)
//   • the SpecNote render with variant="sheet"
//
// ShowcasePiece no longer renders the sheet, no longer portals, no
// longer locks scroll — the tile is just a tile. Mobile activation only
// triggers the scroll-into-view inside ShowcasePiece; everything else
// is this component's job.

import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import SpecNote from './SpecNote'
import type { Piece } from './data'

export default function ShowcaseBottomSheet({
  piece,
  onClose,
}: {
  piece: Piece
  onClose: () => void
}) {
  // Body scroll-lock for the duration the sheet is mounted. Restoring
  // the previous `overflow` value (not blindly clearing it) preserves
  // any lock another component may have set.
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [])

  // SSR guard — Portal needs `document`. Showcase only mounts this on
  // the client side (it depends on `isMobile` state set in useEffect),
  // but the guard is cheap insurance.
  if (typeof document === 'undefined') return null

  return createPortal(
    <SpecNote piece={piece} onClose={onClose} variant="sheet" />,
    document.body,
  )
}
