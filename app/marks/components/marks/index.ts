// Barrel export for the route-local mark components.
//
// Each SVG follows the same conventions:
//   • `fill="currentColor"` on every ink path (so CSS can tint them)
//   • viewBox preserved, width/height removed (CSS sizes them)
//   • `useId()` for every clip-path id so the double-render in chunk 13
//     doesn't collide in-DOM.

export type { MarkId, MarkComponent } from './types'

import Beringer from './Beringer'
import Codezeros from './Codezeros'
import Ecochain from './Ecochain'
import Furrmark from './Furrmark'
import Kilti from './Kilti'
import Slangbusters from './Slangbusters'

export { Beringer, Codezeros, Ecochain, Furrmark, Kilti, Slangbusters }

// Registry keyed by MarkId so sections/preview-row can look up the
// component for a given data entry in one place.
export const marks = {
  beringer: Beringer,
  codezeros: Codezeros,
  ecochain: Ecochain,
  furrmark: Furrmark,
  kilti: Kilti,
  slangbusters: Slangbusters,
} as const
