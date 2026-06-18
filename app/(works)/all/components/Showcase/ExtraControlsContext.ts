// ExtraControlsContext — portal slot for per-piece controls.
//
// ShowcasePiece composes a `.sc-controls` row that may include a
// PauseButton (video tiles) and a Switch (toggle tiles). Some pieces
// also want their own bespoke control inline in that same row —
// PaymasterAudit's page chip is the canonical example.
//
// To avoid pulling per-piece state ("flowIndex", "cycleFlow",
// PAYMASTER_FLOW_COUNT) into the generic tile shell, ShowcasePiece
// renders an empty <div className="sc-controls__extras" /> at the end
// of the row and exposes it through this context. Per-piece renderers
// that need a control consume the context and portal their JSX into
// that slot.
//
// Result: the controls bar still composes in DOM order
// (pause → switch → extras), but no tile-level component needs to
// know which piece has which extras.

import { createContext } from 'react'

export const ExtraControlsContext = createContext<HTMLDivElement | null>(null)
