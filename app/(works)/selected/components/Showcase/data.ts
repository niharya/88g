// Showcase pieces — 10 from the visuals brief.
//
// Order in this array drives the DOM/masonry order. Each tile carries an
// authored aspect, an optional toggle/video spec, an optional `noteSide`
// (where the spec note appears so it doesn't get clipped), and a
// `selfInteractive` flag for tiles that own their own click interaction
// (RR card-stack fan, poster carousel) and opt out of the focus + spec
// note model entirely.

export type ShowcaseDot =
  | 'blue'
  | 'terra'
  | 'olive'
  | 'orange'
  | 'yellow'
  | 'mint'
  | 'grey'

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

export type ToggleSpec = {
  defaultKey: string
  opts: { k: string; label: string }[]
}

/** Where the spec note appears relative to the focused tile. */
export type NoteSide = 'top' | 'right' | 'bottom' | 'left'

export type Piece = {
  id: string
  num: number
  kind: PieceKind
  title: string
  short?: string
  cat: string
  dot: ShowcaseDot
  src: string
  year: string
  /** width / height of the media box */
  aspect: number
  /** thin border + radius around the media */
  frame: boolean
  /** has a Before/After style switch overlaid bottom-left */
  toggle?: ToggleSpec
  /** autoplay video tile (gif/video) */
  video?: boolean
  /** href to the case study, if any */
  href?: string
  /** Where the spec note appears relative to the tile. Default 'bottom'. */
  noteSide?: NoteSide
  /** Width across the underlying 6-column grid. `normal` = 2 of 6 (1 of
   *  3 visual cols), `wide` = 3 of 6 (1.5 of 3 visual cols). Defaults to
   *  `normal` when omitted. Used by Showcase.tsx to set `grid-column:
   *  span N` on the slot.
   */
  width?: 'normal' | 'wide'
  why: string
  outcome: string
  work: string
}

// DOM order = reading order; visual position is determined by the
// grid-auto-flow: dense packer.
//
// .sc-grid is a 6-column CSS Grid with JS-measured row spans (see
// Showcase.tsx for the full mechanism + ANOMALIES.md → "Layout idiom").
// Normal tiles span 2 of 6 (one visual third); wide tiles span 4 of 6
// (two visual thirds). Heights come from each tile's authored aspect
// ratio, measured at runtime into --sc-rowspan per slot.
//
// Order below is by `num` (1 → 10) — the narrative sequence Nihar uses
// when walking through the work. With grid-auto-flow: dense the visual
// placement can re-shuffle to fill gaps next to wide tiles, so the
// on-screen column of any tile depends on its neighbours' widths, not
// strictly on its DOM index.

export const PIECES: Piece[] = [
  {
    id: 'cardstack',
    num: 1,
    kind: 'cardstack',
    title: 'Evolution of Card',
    cat: 'Interaction',
    dot: 'blue',
    src: 'Rug Rumble · /rr',
    year: '2023',
    // 1.6 (up from 4/3 ≈ 1.33) — tile is wider/shorter so the empty
    // headroom above the fan is trimmed. Cards anchor at bottom: 6 % so
    // shortening the tile removes the top whitespace, not the cards.
    aspect: 1.6,
    frame: false,
    href: '/rr',
    noteSide: 'top',
    why: 'The card had to survive from flat tile to a dealt hand.',
    outcome: 'Each iteration earned its place in the final fan.',
    work: 'Interaction design',
  },
  {
    id: 'furrmark',
    num: 2,
    kind: 'furrmark',
    title: 'Furrmark',
    cat: 'Motion',
    dot: 'yellow',
    src: 'Identity · loop',
    year: '2025',
    // Source video is 998 × 668 (1.494) — baked in so first paint matches  */
    // the video's natural ratio (no letterbox flash on load).               */
    aspect: 998 / 668,
    frame: true,
    video: true,
    noteSide: 'bottom',
    why: 'A wordmark had to feel alive without a single illustration.',
    outcome: 'The loop became the brand’s signature across every reel.',
    work: 'Brand motion',
  },
  {
    id: 'subway',
    num: 3,
    kind: 'subway',
    title: 'Subway-inspired Site Nav',
    short: 'Site Nav',
    cat: 'Wayfinding',
    dot: 'olive',
    src: 'nihar.works · /',
    year: '2025',
    // Source video is 880 × 600 (1.467) — baked in so first paint matches
    // the video's natural ratio.
    aspect: 880 / 600,
    frame: true,
    video: true,
    href: '/',
    noteSide: 'bottom',
    why: 'Visitors kept missing how the portfolio’s pages connected.',
    outcome: 'Wayfinding clicked once routes read as a transit line.',
    work: 'Information design',
  },
  {
    id: 'multiverse',
    num: 5,
    kind: 'multiverse',
    title: 'Multiverse Poster',
    cat: 'Poster',
    dot: 'terra',
    src: 'Biconomy',
    year: '2024',
    // Tile aspect matches the image natural exactly (1684 × 2382), so
    // object-fit: cover shows the full poster with no crop and no
    // letterbox on any edge — the artwork's own margins are what you see.
    aspect: 1684 / 2382,
    frame: false,
    href: '/biconomy',
    /* `left` clips off the viewport at narrow widths when the tile lands  */
    /* in column 1. `top` is safe regardless of column placement.          */
    noteSide: 'top',
    why: 'Created to call attention to the operation within silos.',
    outcome: 'We began looping each other in more intentionally.',
    work: 'Design intervention',
  },
  {
    id: 'paymaster',
    num: 4,
    kind: 'paymaster',
    title: 'Paymaster — Before / After',
    short: 'Paymaster',
    cat: 'UX Audit',
    dot: 'orange',
    src: 'Biconomy · /biconomy',
    year: '2024',
    // Source files are 2979 × 1692 — set tile aspect to match exactly so   */
    // object-fit cover doesn't crop any UI off the edges.                  */
    aspect: 2979 / 1692,
    frame: true,
    href: '/biconomy',
    noteSide: 'top',
    width: 'wide',
    toggle: {
      defaultKey: 'before',
      opts: [
        { k: 'before', label: 'Before Audit' },
        { k: 'after', label: 'After Audit' },
      ],
    },
    why: 'The paymaster flow hid three quiet failure points.',
    outcome: 'The redesign resolved each one before launch.',
    work: 'UX audit',
  },
  {
    id: 'startooth',
    num: 6,
    kind: 'startooth',
    title: 'Startooth Pattern',
    cat: 'Pattern',
    dot: 'grey',
    src: 'nihar.works · marks',
    year: '2025',
    // Source image is 1100 × 1375 (0.80). Baked in so first paint
    // matches the image's natural ratio.
    aspect: 1100 / 1375,
    // Framed treatment (was false) — gives the image a proper 1 px
    // grey-800 hairline and mat-bg behind it, consistent with the other
    // image tiles (interface, paymaster). Avoids the plain-tile border
    // overlapping the image edge.
    frame: true,
    noteSide: 'top',
    why: 'The personal mark needed a tileable companion.',
    outcome: 'A surface that signals authorship without shouting.',
    work: 'Pattern study',
  },
  {
    id: 'interface',
    num: 7,
    kind: 'interface',
    title: 'Interface',
    cat: 'Product UI',
    dot: 'terra',
    src: 'Rug Rumble · /rr',
    year: '2023',
    aspect: 16 / 10,
    frame: true,
    href: '/rr',
    noteSide: 'bottom',
    toggle: {
      defaultKey: 'clean',
      opts: [
        { k: 'clean', label: 'Clean' },
        { k: 'map', label: 'UI Map' },
      ],
    },
    why: 'Players couldn’t parse the table at a glance mid-match.',
    outcome: 'Labelling the regions cut new-player confusion sharply.',
    work: 'Product design',
  },
  {
    id: 'posters',
    num: 8,
    kind: 'posters',
    title: 'Posters',
    cat: 'Poster',
    dot: 'terra',
    src: 'Series · print',
    year: '2024',
    // 0.80 (down from 0.82) — gives ~4 px more height at a 1-col width so
    // the front poster's bottom-edge text isn't clipped by .sc-media's
    // overflow-hidden.
    aspect: 0.80,
    frame: false,
    noteSide: 'top',
    why: 'A launch wall needed three ideas, not one busy sheet.',
    outcome: 'One idea per sheet kept the series legible across the room.',
    work: 'Print system',
  },
  {
    id: 'dual',
    num: 9,
    kind: 'dual',
    title: 'Job Chip + Status Gauge',
    short: 'Components',
    cat: 'Components',
    dot: 'mint',
    src: 'Connektion · system',
    year: '2025',
    aspect: 2.4,
    frame: false,
    noteSide: 'top',
    why: 'Status was scattered across mismatched components.',
    outcome: 'A chip and its gauge now report from one source.',
    work: 'Design systems',
  },
  {
    id: 'ecochain',
    num: 10,
    kind: 'ecochain',
    title: 'Ecochain UI',
    cat: 'Product UI',
    dot: 'mint',
    src: 'Ecochain · product',
    year: '2025',
    // Updated Ecochain clips are 4:3-ish (~1194 × 896 ≈ 1.33). Baked in   */
    // so the tile sizes deterministically without a first-paint flash.    */
    aspect: 1194 / 896,
    frame: true,
    video: true,
    noteSide: 'top',
    width: 'wide',
    toggle: {
      defaultKey: 'interface',
      opts: [
        { k: 'interface', label: 'Interface' },
        { k: 'icons', label: 'Status icons' },
      ],
    },
    why: 'Emissions data felt abstract until it started to move.',
    outcome: 'A live trend made the dashboard worth checking daily.',
    work: 'Product design',
  },
]
