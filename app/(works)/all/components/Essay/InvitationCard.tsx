// InvitationCard — the blue "broadside": engraved double-frame, the three-paragraph
// manifesto in gradient-clipped Fraunces, a mint startooth crown + divider, and
// the script closing (mono kicker + pinyon signature).
//
// Static composition (Phase 2) — the poem gradient is rendered still here;
// its calm drift is added in Phase 8. Marks are filled mint (--mint-720 ==
// the design's #028634) per the chosen markStyle. The footing ticket mounts
// as a child in Phase 3.

import type { ReactNode } from 'react'

// Filled startooth marks — verbatim paths from the design handoff. `fill`
// inherits via currentColor from `.bench-mark` (set to --mint-720).
function CrownStar() {
  return (
    <span className="bench-mark" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 100 100">
        <path d="M40 30L50 0L60 30L90 40L60 50L50 100L40 50L10 40L40 30Z" fill="currentColor" />
      </svg>
    </span>
  )
}

function DividerDiamond() {
  return (
    <span className="bench-mark" aria-hidden="true">
      <svg width="48" height="48" viewBox="0 0 100 100" style={{ overflow: 'visible' }}>
        <path d="M10 50L50 30L90 50L50 70L10 50Z" fill="currentColor" />
      </svg>
    </span>
  )
}

export default function InvitationCard({ children }: { children?: ReactNode }) {
  return (
    <div className="bench-card">
      <div className="bench-card__keyline" />

      <main className="bench-card__main">
        {/* Crown */}
        <div className="bench-crown">
          <span className="bench-rule bench-rule--l" />
          <CrownStar />
          <span className="bench-rule bench-rule--r" />
        </div>

        {/* Manifesto */}
        <p className="bench-poem">
          Over the past 10 years I’ve made interfaces, brands, a culture,
          posters, even names and games.
        </p>

        <p className="bench-poem bench-poem--second">
          None of it came from a fixed method. Every project sets its own
          conditions, from the briefs to the timelines and agendas, and reading
          those forces is the work.
        </p>

        <p className="bench-poem bench-poem--second">
          This portfolio, for instance: no rounded corners, no dark mode, to see
          what it would make me build instead.
        </p>

        {/* Divider */}
        <div className="bench-divider">
          <span className="bench-rule bench-rule--l" />
          <DividerDiamond />
          <span className="bench-rule bench-rule--r" />
        </div>

        {/* Closing — "script" variant */}
        <div className="bench-closing">
          <span className="bench-closing__eyebrow">The method bends to the problem</span>
          <p className="bench-closing__line">That’s my craft</p>
        </div>

        {/* The ticket foots the card (rises out into a navbar on scroll). */}
        {children}
      </main>
    </div>
  )
}
