// Index-card copy editor — a dev-only lab for editing the reader-facing strings
// on each showcase piece (type, title, subtitle, notice), with the ACTUAL
// SpecNote + caption rendered live beside each editor. Seeds from the live
// PIECES and commits to card-copy.ts via /api/dev-tools/index-card-copy.
// ARCHIVED here under app/_dev-tools/ — Next's `_` prefix makes this folder
// non-routable, so the editor isn't reachable as-is (like lqip-lab / sticker-lab).
// To use it again, move the folder back out to `app/card-copy-lab/` (and restore
// the `../(works)/…` import depth); it still POSTs to the live dev API.
//
// notFound() in production so it never ships as a public route; noindex too.
// Imports the real SpecNote + showcase.css for a faithful preview — a sanctioned
// dev-tool exception to the "routes don't import from each other" rule, since the
// lab is production-guarded and never shipped.

import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { PIECES, DOT_VAR, type Piece } from '../../(works)/all/components/Showcase/data'
import '../../(works)/all/components/Showcase/showcase.css'
import CardCopyEditor, { type LabItem } from './CardCopyEditor'
import './card-copy-lab.css'

export const metadata: Metadata = {
  title: 'Index-card copy — lab',
  robots: { index: false, follow: false },
}

export default function CardCopyLabPage() {
  if (process.env.NODE_ENV === 'production') notFound()

  const items: LabItem[] = PIECES.map((piece: Piece) => ({
    piece,
    capDotc: DOT_VAR[piece.dot], // 560 tint for the caption dot (SpecNote uses its own deep tint)
  }))

  return <CardCopyEditor items={items} />
}
