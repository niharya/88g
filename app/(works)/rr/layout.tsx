// Rug Rumble route layout — RR-specific fonts and CSS only.
// Font gate and nav.css live in the (works) shared layout.
// Fraunces is loaded by the root layout (app/layout.tsx); this layout
// declares the three decorative fonts unique to /rr.
//
// All three migrated from external Google Fonts <link> tags to local
// next/font/local in the production-readiness pass — same `display: 'swap'`
// + `fallback` contract as the primary site fonts (docs/performance.md).
// Only the latin subset is served (≈260 KB total) since the case study is
// English-only; emoji / extended scripts that the original CSS imported
// were never used in copy.

import type { ReactNode } from 'react'
import localFont from 'next/font/local'
import './rr.css'
import './components/game/game.css'

const playpenSans = localFont({
  src: '../../fonts/PlaypenSans-variable.woff2',
  variable: '--rr-font-playpen',
  display: 'swap',
  weight: '400 800',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: false,
})

const londrinaSolid = localFont({
  src: '../../fonts/LondrinaSolid-normal.woff2',
  variable: '--rr-font-londrina',
  display: 'swap',
  weight: '400',
  fallback: ['Impact', 'Haettenschweiler', 'Arial Narrow Bold', 'sans-serif'],
  preload: false,
})

const gluten = localFont({
  src: '../../fonts/Gluten-variable.woff2',
  variable: '--rr-font-gluten',
  display: 'swap',
  weight: '400 600',
  fallback: ['Georgia', 'Cambria', 'Times New Roman', 'serif'],
  preload: false,
})

export default function RRLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${playpenSans.variable} ${londrinaSolid.variable} ${gluten.variable}`}>
      {children}
    </div>
  )
}
