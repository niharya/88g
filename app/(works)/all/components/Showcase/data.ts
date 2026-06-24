// Showcase pieces — 10 from the visuals brief.
//
// Order in this array drives the DOM/masonry order. Each tile carries an
// authored aspect, an optional toggle/video spec, a `cols` integer (its
// 9-col grid span), and copy fields that feed the caption row and the
// index card. The spec note's placement is decided at runtime by
// ShowcasePiece (desktop: measure column → pick left/right) and by
// ShowcaseBottomSheet (mobile: singleton bottom sheet), not by data.

import { CARD_COPY } from './card-copy'

// Four-tone palette — narrowed from six (olive/yellow dropped) +
// removed the unused grey. Anchored to the brand's four primaries so
// every piece reads in-system. The per-page-load shuffle distributes
// these four across the 10 pieces (see Showcase.tsx `DOT_PALETTE`).
export type ShowcaseDot =
  | 'blue'
  | 'terra'
  | 'orange'
  | 'mint'

// Color mapping for `dot` — used by ShowcasePiece (caption dot tint,
// switch tint via --sc-dotc) and SpecNote (serial number, link, hint
// pill — all set from --sc-dotc on the note element). Lives here next
// to ShowcaseDot rather than in SpecNote so the tile shell doesn't
// reach back through the spec note for a data-level token map.
export const DOT_VAR: Record<ShowcaseDot, string> = {
  blue:   'var(--blue-560)',
  terra:  'var(--terra-560)',
  orange: 'var(--orange-560)',
  mint:   'var(--mint-560)',
}

// Deeper companion to DOT_VAR — same tones at the 720 step. Consumed
// inside SpecNote only (serial, link label + icon, hint pill, and the
// note's border). The tile's caption dot, Switch tint, and DotPager
// still read DOT_VAR (560) so the closed tile reads soft while the
// opened note reads deep — a deliberate two-tier cascade per piece.
export const DOT_VAR_DEEP: Record<ShowcaseDot, string> = {
  blue:   'var(--blue-720)',
  terra:  'var(--terra-720)',
  orange: 'var(--orange-720)',
  mint:   'var(--mint-720)',
}

export type PieceKind =
  | 'cardstack'
  | 'interface'
  | 'subway'
  | 'paymaster'
  | 'multiverse'
  | 'startooth'
  | 'furrmark'
  | 'posters'
  | 'dual'
  | 'ecochain'

// Filter taxonomy — the two coarse categories the showcase filter strip switches
// between. The per-tile `type` stays the specific label ("Game Interface",
// "Pattern"…); this is the broad axis. Keyed by piece id so it's a single
// authoritative classification, not parsed from the free-text `type`.
// cardstack → interface (a game-card LAYOUT reads as UI).
export type PieceCategory = 'interface' | 'brand'
export const PIECE_CATEGORY: Record<string, PieceCategory> = {
  cardstack:  'interface',
  paymaster:  'interface',
  subway:     'interface',
  interface:  'interface',
  ecochain:   'interface',
  dual:       'interface',
  furrmark:   'brand',
  startooth:  'brand',
  multiverse: 'brand',
  posters:    'brand',
}

export type ToggleSpec = {
  defaultKey: string
  opts: { k: string; label: string }[]
}

export type Piece = {
  id: string
  num: number
  kind: PieceKind
  title: string
  short?: string
  /** Categorical label rendered in the caption row and as the index-card  */
  /** type signal (e.g. "Layout Design", "Game Interface", "Pattern").     */
  type: string
  dot: ShowcaseDot
  /** Parent project / source. Single noun phrase ("Rug Rumble",           */
  /** "Biconomy", "My sketchbook"). No `· /path` suffix — the project      */
  /** name is what reads, the route lives in `href`.                        */
  project: string
  year: string
  /** width / height of the media box */
  aspect: number
  /** thin border + radius around the media */
  frame: boolean
  /** has a Before/After style switch overlaid bottom-left */
  toggle?: ToggleSpec
  /** autoplay video tile (gif/video) */
  video?: boolean
  /** Link target for the index-card foot ("…from {project} ↗"). Empty    */
  /** string '' renders the link with no destination (placeholder while    */
  /** URLs get sourced). Omit entirely for pieces that should render the   */
  /** foot as plain text credit (currently: subway, startooth).            */
  href?: string
  /** Width across the underlying 9-column grid. Integer 1..9. Defaults
   *  to 3 (one-third) when omitted. Two canonical values cover almost
   *  every piece:
   *    • 3 → one-third (default, breathing room for product UI and
   *      portrait pieces)
   *    • 6 → two-thirds (hero — paymaster, ecochain)
   *  9 is full-width — rare. Off-canonical values (4, 5, 7, 8) work
   *  but leave more orphan gaps for the dense packer to fill.
   *
   *  Showcase.tsx writes two CSS custom properties per slot:
   *    --sc-cols-d = cols (desktop, 9-col grid)
   *    --sc-cols-t = max(1, ceil(cols / 3)) (tablet, 3-col grid)
   *  The tablet formula preserves proportions — a third stays a third,
   *  a two-thirds stays a two-thirds. On mobile every slot spans the
   *  single column.
   */
  cols?: number
  /** Index-card body — one-line description of the artefact ("A series  */
  /** showing how a custom playing-card layout evolved").                 */
  whatIs: string
  /** Index-card body — one-line "what to pay attention to" ("How         */
  /** information is chunked out for easy scanning").                    */
  notice: string
}

// DOM order = reading order; visual position is determined by the
// grid-auto-flow: dense packer.
//
// .sc-grid is a 9-column CSS Grid with JS-measured row spans (see
// Showcase.tsx for the full mechanism + ANOMALIES.md → "Layout idiom").
// Each piece carries a `cols` integer (1..9) that becomes its
// grid-column span; default 3 (one-third). Canonical values are 3
// (third) and 6 (two-thirds = hero). Heights come from each tile's
// authored aspect ratio, measured at runtime into --sc-rowspan per
// slot.
//
// DOM order below sequences tiles by *layout priority* (left → right,
// top → bottom roughly): num 7, 4, 3, 1, 6, 2, 5, 10, 9, 8. Order is
// tentative — `grid-auto-flow: dense` reshuffles visual placement to
// fill gaps next to wide tiles, so DOM index is a hint, not a guarantee.
// `num` is preserved on each entry as the stable narrative serial for
// referencing; it no longer controls display order.

// Structural piece data only — the reader-facing copy fields (type, title,
// whatIs, notice) live in card-copy.ts and are overlaid by id below, so the dev
// copy-editor can rewrite copy without ever touching this file.
const PIECES_STRUCT: Omit<Piece, 'type' | 'title' | 'whatIs' | 'notice'>[] = [
  {
    id: 'cardstack',
    num: 1,
    kind: 'cardstack',
    dot: 'blue',
    project: 'Rug Rumble',
    year: '2024',
    // 1.4 (down from 1.6) — bumped to make room for the scaled-up
    // cardstack (cards 34% wide as of v0.93+) without click-spread
    // (scale 1.18 + lift -8%) clipping past the tile's overflow-hidden
    // top edge. The bottom anchor (`bottom: 6%`) is unchanged; the tile
    // just gains ~37 px of vertical headroom for the selected card to
    // breathe into.
    aspect: 1.4,
    frame: false,
    href: '/rr',
  },
  {
    id: 'paymaster',
    num: 4,
    kind: 'paymaster',
    short: 'Paymaster',
    dot: 'orange',
    project: 'Biconomy',
    year: '2024',
    // Source files are 2979 × 1692 — set tile aspect to match exactly so   */
    // object-fit cover doesn't crop any UI off the edges.                  */
    aspect: 2979 / 1692,
    frame: true,
    href: '/biconomy',
    cols: 6,
    toggle: {
      defaultKey: 'before',
      opts: [
        { k: 'before', label: 'Before Audit' },
        { k: 'after', label: 'After Audit' },
      ],
    },
  },
  {
    id: 'subway',
    num: 3,
    kind: 'subway',
    short: 'Site Nav',
    dot: 'mint',
    project: 'This site',
    year: '2026',
    // Source video is 880 × 600 (1.467) — baked in so first paint matches
    // the video's natural ratio.
    aspect: 880 / 600,
    frame: true,
    video: true,
    // href intentionally omitted — the "project" IS this very site, so the
    // index-card foot renders as plain credit text, not a link.
  },
  {
    id: 'furrmark',
    num: 7,
    kind: 'furrmark',
    dot: 'orange',
    project: 'Aleyr',
    year: '2021',
    // Source video is 998 × 668 (1.494) — baked in so first paint matches  */
    // the video's natural ratio (no letterbox flash on load).               */
    aspect: 998 / 668,
    frame: true,
    video: true,
    href: 'https://niharbhagat.com/work/aleyr/',
  },
  {
    id: 'startooth',
    num: 6,
    kind: 'startooth',
    dot: 'blue',
    project: 'My sketchbook',
    year: '2026',
    // Source image is 1239 × 1549 (~0.80) — a fresh @3× export of the
    // pattern that gives DPR=3 Retina devices a true 3× while still
    // supplying the 2× variant via downsampling. Aspect matches the
    // prior 1100 × 1375 master to a rounding error, so tile dimensions
    // don't shift.
    aspect: 1239 / 1549,
    // Framed treatment (was false) — gives the image a proper 1 px
    // grey-800 hairline and mat-bg behind it, consistent with the other
    // image tiles (interface, paymaster). Avoids the plain-tile border
    // overlapping the image edge.
    frame: true,
    // href intentionally omitted — index-card foot renders as plain credit.
  },
  {
    id: 'interface',
    num: 2,
    kind: 'interface',
    dot: 'terra',
    project: 'Rug Rumble',
    year: '2024',
    // Live scene canvas is 548 × 560 (~0.98:1) — the autoplay artefact
    // scales to the tile width via container-query scaling in
    // rr-interface.css. Canvas is taller than the card so the card
    // exits cleanly upward and re-enters cleanly downward without
    // clipping mid-body.
    aspect: 548 / 560,
    // Frameless: the scene's artefacts (You panel, Peace Treaty card)
    // self-frame and sit directly on the workbench. The plain-tile
    // hairline is suppressed for this kind via a `:has(.sc-rr-scene)`
    // exclusion in showcase.css.
    frame: false,
    href: '/rr',
  },
  {
    id: 'multiverse',
    num: 5,
    kind: 'multiverse',
    dot: 'terra',
    project: 'Biconomy',
    year: '2023',
    // Tile aspect matches the image natural exactly (1684 × 2382), so
    // object-fit: cover shows the full poster with no crop and no
    // letterbox on any edge — the artwork's own margins are what you see.
    aspect: 1684 / 2382,
    frame: false,
    href: '/biconomy',
  },
  {
    id: 'ecochain',
    num: 10,
    kind: 'ecochain',
    dot: 'mint',
    project: 'Ecochain',
    year: '2019',
    // Updated Ecochain clips are 4:3-ish (~1194 × 896 ≈ 1.33). Baked in   */
    // so the tile sizes deterministically without a first-paint flash.    */
    aspect: 1194 / 896,
    frame: true,
    video: true,
    href: 'https://slangbusters.com/work/ecochain/',
    cols: 6,
    toggle: {
      defaultKey: 'interface',
      opts: [
        { k: 'interface', label: 'Interface' },
        { k: 'icons', label: 'Status icons' },
      ],
    },
  },
  {
    id: 'dual',
    num: 9,
    kind: 'dual',
    short: 'Components',
    dot: 'mint',
    project: 'Connektion',
    year: '2021',
    // cols 3 + aspect 1.1 — the tile holds both natural-size specimens
    // (260×162 JobChipStack + 138×115 LifecycleGauge) stacked
    // VERTICALLY: chip on top, gauge below, centered horizontally with
    // ~32 px gap. Tile dims 413 × 375 give ~33 px vertical breathing
    // room above and below the stack. Back to a canonical 3-col span —
    // no more orphan cols. See `.sc-dual` rule in showcase.css for the
    // flex-direction: column setup.
    cols: 3,
    aspect: 1.1,
    frame: false,
    href: 'https://niharbhagat.com/work/connektion/',
  },
  {
    id: 'posters',
    num: 8,
    kind: 'posters',
    dot: 'terra',
    project: 'Mic Testing',
    year: '2017',
    // 0.70 (down from 0.80) — bumped to give the poster fan vertical
    // room. The slot-4 transform translates the back poster up by 62%
    // of its own height; with the rotation extending its bounding
    // rectangle further, the top corners were clipping past the tile's
    // overflow-hidden top edge. Taller tile pushes the fan down (since
    // posters anchor at `top: 50%`) so corners clear. Bonus: tile
    // height now 590 vs ecochain 648 in row 4 — heights closer, row
    // reads more balanced.
    aspect: 0.70,
    frame: false,
    href: 'https://www.behance.net/gallery/47138397/Open-Mic-Series-Poster-Collection',
  },
]

// Overlay the editable copy (card-copy.ts) onto the structural data by id —
// CARD_COPY is authoritative for title / whatIs / notice. The result is the
// full Piece[] the rest of the route consumes.
export const PIECES: Piece[] = PIECES_STRUCT.map((p) => ({
  ...p,
  ...CARD_COPY[p.id],
}))
