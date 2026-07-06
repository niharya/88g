import type { ReactNode } from 'react'

// One main hue per tile; inner values are stepped from that ramp. See
// Tile.tsx for how a tone resolves to the --tile-* custom-property set.
export type TileTone = 'blue' | 'orange' | 'yellow' | 'olive' | 'terra' | 'grey'

// ── Per-route data shape for a Signals bento ──────────────────────────────
// The 5-tile structure is fixed (Role · Outcome · Product · Involvement ·
// Deliverables); only the content + the two variable tones (role, outcome)
// differ between routes. Product is always grey, Involvement olive,
// Deliverables terra.

export interface SignalsRole {
  /** blue on /biconomy, orange on /rr. */
  tone: TileTone
  icon: ReactNode
  /** Emphasised lead, e.g. "Product Designer". */
  lead: string
  /** Lighter remainder, e.g. "at a blockchain payments infrastructure company". */
  rest: string
  /** Right-aligned period stamp, e.g. "2021 – 2023". */
  meta: string
}

export interface SignalsStat {
  value: number
  /** Inline same-size suffix counted with the number, e.g. "K". */
  suffix?: string
  /** Small trailing unit, not animated, e.g. "mo". */
  unit?: string
  label: string
}

export interface SignalsOutcome {
  /** orange on /biconomy, yellow on /rr. */
  tone: TileTone
  body: string
  /** Present on /rr — renders the 3 count-up stats and compacts the body. */
  stats?: SignalsStat[]
  /** Decorative halo position: bottom-right (biconomy) or top-right (rr). */
  halo: 'br' | 'tr'
  minHeight: number
}

export interface SignalsMetaRow {
  label: string
  value: string
}

export interface SignalsProduct {
  headline: string
  image: { src: string; alt: string; width: number }
  rows: SignalsMetaRow[]
}

export interface SignalsData {
  /** Dialog aria-label, e.g. "Biconomy — Signals". */
  label: string
  role: SignalsRole
  outcome: SignalsOutcome
  product: SignalsProduct
  involvement: string[]
  deliverables: string[]
  /** Optional photo tucked behind the cover card, peeking above the top edge.
   *  `caption` prints on the photo's lower frame (a small typed stamp). */
  coverImage?: { src: string; alt: string; width: number; caption?: string }
}
