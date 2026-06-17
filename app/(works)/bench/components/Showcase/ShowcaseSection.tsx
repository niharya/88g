// ShowcaseSection — appended below the AboutCard + Timeline first view
// on /selected. Composes:
//
//   1. HeaderBlock — title + intro copy (Claude Design header verbatim)
//   2. HintRow     — "click to focus · esc to dismiss" keycap row
//   3. Showcase    — the 10-tile bento grid
//
// Wrapped in a section so the showcase reads as its own movement under
// the page intro, with its own breathing room set by `.sc-section`.
//
// The dock id is imported from FirstView so the click-glide target and
// the dom id can't drift out of sync. No auto-snap on this route —
// hand-off is click-only.

import { SHOWCASE_DOCK_ID } from '../FirstView'
import HeaderBlock from './HeaderBlock'
import HintRow from './HintRow'
import Showcase from './Showcase'

export default function ShowcaseSection() {
  return (
    <section
      id={SHOWCASE_DOCK_ID}
      className="sc-section"
      aria-label="Visuals showcase"
    >
      <HeaderBlock />
      <HintRow />
      <Showcase />
    </section>
  )
}
