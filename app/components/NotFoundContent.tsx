'use client'

// Body of the 404 page, rendered by app/not-found.tsx (the real Next.js
// 404 for any unknown route — visit any bad URL to see it).
// CSS / token cascade lives at the consumer; this component is JSX only.

import { GameBoard } from '../(works)/rr/components/game/GameBoard'
import NavMarker from './NavMarker'

export default function NotFoundContent() {
  return (
    <main className="route-rr not-found">
      {/* DOM order is column-then-board (orientation and the Home CTA reach
          keyboard/SR users before the game controls); row-reverse puts the
          board on the left visually. */}
      <div className="not-found__inner">
        <header className="not-found__col">
          <p className="not-found__code">404</p>
          <h1 className="not-found__headline t-h1">This page got rugged.</h1>
          <p className="not-found__support t-p2">Fancy a game before you go?</p>
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
        </header>

        <div className="not-found__board">
          <GameBoard />
        </div>
      </div>
    </main>
  )
}
