'use client'

// ShowcaseSection — appended below the reverted AboutCard + Timeline
// block on /selected. Composes:
//
//   1. HeaderBlock — title + intro copy (Claude Design header verbatim)
//   2. HintRow     — "click to focus · esc to dismiss" keycap row
//   3. Showcase    — the 10-tile bento grid
//
// Wrapped in a section so the showcase reads as its own movement under
// the page intro, with its own breathing room set by `.sc-section`.
//
// The hand-off cue ("↓ Showcase" hairline) lives one level up in
// page.tsx so it can pin to the bottom of the initial viewport via the
// .selected-firstview wrapper.

import HeaderBlock from './HeaderBlock'
import HintRow from './HintRow'
import Showcase from './Showcase'

export default function ShowcaseSection() {
  return (
    <section className="sc-section" aria-label="Visuals showcase">
      <HeaderBlock />
      <HintRow />
      <Showcase />
    </section>
  )
}
