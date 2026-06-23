// startooth-constants.ts — all static geometry, palette, and tuning for the
// Startooth canvas engine. No logic lives here; StartoothField imports these
// and aliases them to private readonly fields (method bodies stay unchanged).
//
// Vocabulary
// ----------
// Voids   — the negative-space shapes: star (8-sided) and diamond (4-sided,
//           sits below the star). Void = star | diamond.
// Keys    — the positive raised forms flanking each star. Two kinds:
//             shortkey  upper key, connecting two stars above (faces 0-1 + top 0)
//             tallkey   lower key, between a star and the diamond below (faces 2-3 + top 1)
//           Key parts:
//             faces     the left and right panels of a key (4 total: 2 per key)
//             top       the protruding cap at the centre, distinctly coloured
// Tile    — the repeating unit, period 320 × 560 px

// ---- Tile framework ----

export const TILE_PATHS: number[][][] = [
  [[162,82],[202,202],[322,242],[202,282],[162,482]],
  [[162,482],[322,562],[322,322],[202,282]],
  [[162,82],[122,202],[2,242],[122,282],[162,482]],
  [[162,482],[2,562],[2,322],[122,282]],
  [[162,82],[2,2],[2,162],[122,202]],
  [[162,82],[322,2],[322,162],[202,202]],
]
export const TILE_PERIOD = { x: 320, y: 560 }
export const DISPLAY_SCALE = 0.34   // lattice display scale — lower = more pattern in view

// ---- Voids ----

export const STAR_PTS: number[][] = [
  [162,82],[202,202],[322,242],[202,282],[162,482],[122,282],[2,242],[122,202],
]
export const DIAMOND_PTS: number[][] = [
  [162,482],[322,562],[162,642],[2,562],
]

// ---- Keys ----
//
// Faces are split by key kind so build() can tag keyGroup on each Reg, letting
// groupUnits() assign shortkey vs tallkey without any post-hoc geometry check.

// Shortkey (upper) — faces bracket the top of the star, top cap sits between them
export const FACES_SHORTKEY: number[][][] = [
  [[122,202],[162,82],[2,2],[2,162]],       // upper-left face
  [[162,82],[202,202],[322,162],[322,2]],   // upper-right face
]
export const TOP_SHORTKEY: number[][] = [
  [202,202],[322,162],[442,202],[322,242],
]

// Tallkey (lower) — faces bracket the bottom of the star + the diamond beneath
export const FACES_TALLKEY: number[][][] = [
  [[202,282],[162,482],[322,562],[322,322]],   // lower-right face
  [[162,482],[122,282],[2,322],[2,562]],        // lower-left face
]
export const TOP_TALLKEY: number[][] = [
  [202,282],[322,242],[442,282],[322,322],
]

// ---- Structural palette ----
// core is NOT here — it is read from CSS --surface-bg at mount (so it tracks
// any theme shift without a rebuild). face/top are Startooth-specific.

export const STRUCTURAL_BASE = { face: '#c96e42', top: '#ad4b24' }
export const BUILD_PEN = '#4b2c19'

// Warm-tone variants cycled on each void-rupture regrow.
// core never changes; only face/top nudge.
export const PALETTE_VARIANTS = [
  { face: '#c96e42', top: '#ad4b24' },  // original
  { face: '#c4663e', top: '#a8451f' },  // a touch redder/deeper
  { face: '#ce7642', top: '#b25024' },  // a touch more golden
  { face: '#c06a4c', top: '#a6492e' },  // cooler, dusty
]

// ---- Effect palette (ephemeral — not in the 88g design system) ----

export const EFFECT_COLORS = {
  dim:         '#0a0502',  // hover dim veil
  lockFlash:   '#f2d8a8',  // warm pale wash on key lock confirm
  topScatter:  '#e8a45c',  // gold scatter on key click / idle breathing
  wave:        '#7a3a18',  // additive warm lift for void waves
  crossRipple: '#b85c2a',  // cross-ripple on key/void click
  ripple:      '#ffce9a',  // ring ripple from empty-space click
  breath:      '#d07840',  // ambient whole-field breathing pulse
}

// ---- Build timing ----

export const BUILD_HOLD_MS  = 900    // ms of held black before the build begins
export const BUILD_DUR_S    = 6.2    // full build animation duration (seconds)
export const BUILD_TILT_DEG = 15     // canvas tilt in degrees, matches CSS rotate(-15deg)

// ---- Interaction constants ----

export const HOVER_DIM      = 0.32   // hover dim-veil strength (0–1)
export const LAMP_FALL_PX   = 360    // px — lamp falloff along row/column axes
export const WAVE_SPEED_PX  = 1.4    // px/ms — void-press wave front speed
export const WAVE_EDGE_PX   = 110    // px — soft wave-front width
export const RIPPLE_SPEED   = 1700   // px/s — radial ripple ring speed
export const RIPPLE_SIGMA   = 95     // px — half-width of ring's soft band
export const RIPPLE_LIFE_S  = 1.2    // s — how long a radial ripple lives
export const RIPPLE_MAG     = 0.8    // peak ripple strength
export const AUTO_FADE_MS   = 12000  // ms — locked-key auto-fade timeout

// ---- Void rupture ----

export const RUPTURE_N        = 9     // clicks on one void to trigger rupture
export const CHARGE_DECAY_MS  = 1400  // ms of no-click grace before charge bleeds
export const DECAY_FALL_MS    = 900   // ms to shed one charge unit after grace expires
export const TREMOR_THRESHOLD = 0.7   // charge fraction where near-critical tremor starts

// ---- Idle breathing ----

export const IDLE_BREATH_MS = 9000   // ms of inactivity before ambient top-breathing fires
