// Rug Rumble route layout — RR-specific fonts and CSS only.
// Font gate and nav.css live in the (works) shared layout.
// Fraunces is loaded by the root layout (app/layout.tsx), so RR only
// declares the fonts that are unique to this route.

import type { ReactNode } from 'react'
import './rr.css'
import './components/game/game.css'

export default function RRLayout({ children }: { children: ReactNode }) {
  return (
    <>
      {/* Playpen Sans — playful body text */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400..800&display=swap"
      />
      {/* Londrina Solid — display / heading */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Londrina+Solid&display=swap"
      />
      {/* Gluten — accent weight */}
      <link
        rel="stylesheet"
        href="https://fonts.googleapis.com/css2?family=Gluten:wght@400;600&display=swap"
      />
      {children}
    </>
  )
}
