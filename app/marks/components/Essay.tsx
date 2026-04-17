// Essay — body copy + glyph dividers + 6-mark preview row.
//
// Values transcribed from the Figma Essay frame (node 1976:3795):
//   • all copy: Fraunces Regular 24px / -0.72px tracking / grey-720 (#b8b8b8)
//                with 'SOFT' 0, 'WONK' 1 variations matching the Hero title
//   • body ¶1 width 625px, body ¶2 width 616px, preview row width 1136px
//   • wordmark row (top):    Codezeros / Slangbusters / Beringer
//   • glyph row    (bottom): Ecochain / Furrmark / Kilti
//   • divider glyph — Furrmark rendered at 80px (its 1.618:1 aspect matches
//     the 80×50 divider bounds in the Figma; we reuse the mark component
//     rather than shipping a one-off ornament asset)
//
// Chunk 7 adds the scroll-mapped docked title that sits above this section.
// Chunk 11 adds hover colorisation + click-to-jump on the preview row.
// Chunk 12 rewires the preview row to read from MARKS (data/marks.ts) by
// id instead of the hand-ordered arrangement here.

import { Beringer, Codezeros, Ecochain, Furrmark, Kilti, Slangbusters } from './marks'

export default function Essay() {
  return (
    <section className="marks-essay">
      <p className="marks-essay__body">
        As my approach to designing marks shifted from answering the brief to
        treating them as empty vessels that could carry an idea or emotion, my
        process also changed.
      </p>

      <div className="marks-essay__divider" aria-hidden="true">
        <Furrmark />
      </div>

      <div className="marks-essay__body marks-essay__body--p2">
        <p>Now, it&rsquo;s all about uncovering an idea or emotion first, and letting the form emerge.</p>
        <p>Eventually, one such mark does emerge and it often gets a positive response, often it is resonance with the client.</p>
      </div>

      <div className="marks-essay__preview marks-essay__preview--wordmarks">
        <Codezeros className="marks-essay__wordmark" />
        <Slangbusters className="marks-essay__wordmark" />
        <Beringer className="marks-essay__wordmark" />
      </div>

      <div className="marks-essay__caption">
        <p>For me, marks are not decorations but transmissions: vessels built for timelessness.</p>
        <p>Here is a selection of a few distilled ideas and emotions.</p>
      </div>

      <div className="marks-essay__preview marks-essay__preview--glyphs">
        <Ecochain className="marks-essay__glyph" />
        <Kilti className="marks-essay__glyph" />
      </div>
    </section>
  )
}
