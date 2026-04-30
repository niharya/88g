'use client'

// Shared body of the 404 page. Used by:
//   • app/not-found.tsx — the real Next.js 404 (any unknown route).
//   • app/404/page.tsx — preview route so the layout can be opened directly
//     without having to reproduce a real 404.
// CSS / token cascade lives at the consumer; this component is JSX only.

import { GameBoard } from '../(works)/rr/components/game/GameBoard'
import NavMarker from './NavMarker'

export default function NotFoundContent() {
  return (
    <main className="route-rr not-found">
      <div className="not-found__inner">
        <p className="not-found__copy t-p2">
          This page got rugged. Play while you find the way home.
        </p>

        <div className="not-found__board">
          <GameBoard />
        </div>

        <div className="not-found__home">
          <NavMarker
            as="a"
            href="/"
            role="project"
            tone="terra"
            icon="arrow_back"
            label="Home"
          />
        </div>
      </div>
    </main>
  )
}
