'use client'

// PieceMedia — thin kind→renderer switch. Each renderer lives in its own
// file under media/ so React Fast Refresh can apply updates without the
// helper-after-export hoisting trap we hit when everything was inline.

import { Img } from '../../../../components/Img'
import type { Piece } from './data'
import VideoSlot from './media/VideoSlot'
import CardstackFan from './media/CardstackFan'
import PosterStack from './media/PosterStack'
import PaymasterAuditController from './media/PaymasterAuditController'
import RrInterfaceScene from './media/RrInterface/Scene'
import { Placeholder, DualPlaceholder } from './media/Misc'

type Props = {
  piece: Piece
  toggleKey?: string
  /** Pause state for video tiles. Controlled by the parent tile. */
  paused?: boolean
  /** Tile is the focused/active one — internal interactions unlock. */
  active?: boolean
}

export default function PieceMedia({ piece, toggleKey, paused, active }: Props) {
  switch (piece.kind) {
    case 'cardstack':
      return <CardstackFan active={active} />

    case 'interface':
      // Live Rug Rumble scene — foreign artefact with its own design
      // language. The tile is framed (data.ts), so the standard hairline
      // + mat-bg wrap around the scene. Pauses with the grid's
      // anyActive contract via the `paused` prop.
      return (
        <div className="sc-media-fill">
          <RrInterfaceScene paused={paused} />
        </div>
      )

    case 'subway':
      return (
        <VideoSlot
          src="/videos/subway/subway-nav-2.mp4"
          alt="Subway-inspired site nav — interaction loop"
          paused={paused}
        />
      )

    case 'paymaster':
      // Per-piece state (flowIndex, cycle) lives in the controller, not
      // in the tile shell. The controller portals its page chip into
      // ShowcasePiece's `.sc-controls__extras` slot via context.
      return <PaymasterAuditController showAfter={toggleKey === 'after'} />

    case 'multiverse':
      return (
        <div className="sc-multiverse">
          <Img
            src="/images/biconomy/_diagrams/multiverse_poster.webp"
            alt="Biconomy Multiverse launch poster"
            fill
            sizes="(max-width: 767px) 90vw, 25vw"
          />
        </div>
      )

    case 'startooth':
      // Cards SVG sits on top of the tile's framed background, which is
      // recolored to the dark Startooth ground (#311700) via
      // `.sc-piece--startooth .sc-media` in showcase.css. Vector
      // everywhere — no raster, no AVIF re-encode loss. The framed
      // tile's border + shadow continue to apply because we kept
      // `frame: true` on the piece.
      return (
        <div className="sc-startooth-svg">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/images/startooth/sc-startooth-cards.svg"
            alt="Startooth pattern study"
            className="sc-startooth-svg__cards"
          />
        </div>
      )

    case 'furrmark':
      return (
        <VideoSlot
          src="/marks/furrmark/04.mp4"
          alt="Furrmark — refinement journey loop"
          paused={paused}
        />
      )

    case 'posters':
      return <PosterStack active={active} />

    case 'dual':
      return <DualPlaceholder />

    case 'ecochain': {
      const src =
        toggleKey === 'icons'
          ? '/videos/ecochain/audit-status-icons.mov'
          : '/videos/ecochain/interface-introduction.mov'
      const alt =
        toggleKey === 'icons'
          ? 'Ecochain — audit status icons'
          : 'Ecochain — interface introduction'
      return <VideoSlot src={src} alt={alt} paused={paused} />
    }

    default:
      return <Placeholder label="—" sub="" />
  }
}
