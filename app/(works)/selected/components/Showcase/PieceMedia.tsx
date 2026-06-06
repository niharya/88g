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
import { Placeholder, UiMapPlaceholder, DualPlaceholder } from './media/Misc'

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
      // Toggle pair: clean ↔ UI map overlay. Real overlay asset comes from
      // Figma later (per user). For v1 we show the clean screenshot only;
      // the UI-map state is a placeholder dashed overlay above the same image.
      return (
        <div className="sc-media-fill">
          <Img
            src="/images/rr/rr-interface-desktop.webp"
            alt="Rug Rumble table interface"
            fill
            sizes="(max-width: 767px) 90vw, 40vw"
          />
          {toggleKey === 'map' && <UiMapPlaceholder />}
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
            src="/images/biconomy/multiverse_poster.webp"
            alt="Biconomy Multiverse launch poster"
            fill
            sizes="(max-width: 767px) 90vw, 25vw"
          />
        </div>
      )

    case 'startooth':
      return (
        <div className="sc-media-fill">
          <Img
            src="/images/startooth/sc-startooth.webp"
            alt="Startooth pattern study"
            fill
            sizes="(max-width: 767px) 90vw, 25vw"
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
          ? '/videos/ecochain/audit-status-icons.mp4'
          : '/videos/ecochain/interface-introduction.mp4'
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
