// Custom 404 page (Next.js convention).
//
// Reuses the playable RR gameboard rather than a generic dead-end. The user
// landed somewhere wrong; instead of apologising, we hand them a small game
// to play while they decide where to go next. Editorial copy points at the
// page being "rugged" — the same vocabulary as the case study.
//
// Architecture note: GameBoard lives under `app/(works)/rr/components/game/`.
// Its CSS uses route-scoped tokens (`--rr-game-*`, `--rr-z-game`) that come
// from rr.css under the `.route-rr` cascade. We import `rr.css` + `game.css`
// here and the shared NotFoundContent wraps content in a `route-rr` ancestor
// so those tokens apply. Promotion to `app/components/RRGameboard/` was
// considered and flagged: the entanglement with rr-only tokens makes a clean
// extraction expensive vs. the value (CLAUDE.md → "Promotion rule").
// LIBRARY.md documents the cross-route relationship instead.

import NotFoundContent from './components/NotFoundContent'
import './(works)/rr/rr.css'
import './(works)/rr/components/game/game.css'
import './not-found.css'

export default function NotFound() {
  return <NotFoundContent />
}
