'use client'

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
// Preview row is interactive: each mark is a <button> that colorises on hover
// (via `--preview-color` inline, consumed by CSS `:hover { color: … }`) and
// on click paper-glides the viewport to that mark's section top.

import { Beringer, Codezeros, Ecochain, Furrmark, Kilti, Slangbusters } from './marks'
import { MARKS } from '../data/marks'
import { scrollGlide } from '../../lib/scrollGlide'
import type { MarkId } from './marks/types'
import type { CSSProperties } from 'react'

// Each PreviewBtn gets two CSS custom properties inline:
//   --preview-color   → primary ink on hover (cascades to currentColor)
//   --preview-accent  → secondary ink, only consumed by data-depth paths
// Duotone marks (codezeros, slangbusters, beringer) carry an accent; single-
// tone marks (furrmark, ecochain, kilti) leave --preview-accent unset.
const previewInkFor = (id: MarkId): CSSProperties => {
  const m = MARKS.find((m) => m.id === id)
  const vars: Record<string, string> = {
    '--preview-color': m?.previewColor ?? 'currentColor',
  }
  if (m?.previewAccent) vars['--preview-accent'] = m.previewAccent
  return vars as CSSProperties
}

const jumpTo = (id: MarkId) => () => {
  const section = document.querySelector<HTMLElement>(
    `.marks-section[data-mark-id="${id}"]`,
  )
  if (!section) return
  const top = section.getBoundingClientRect().top + window.scrollY
  scrollGlide(top)
}

type Props = { id: MarkId; style?: CSSProperties; children: React.ReactNode }
const PreviewBtn = ({ id, style, children }: Props) => (
  <button
    type="button"
    className="marks-essay__preview-btn"
    data-mark-id={id}
    aria-label={MARKS.find((m) => m.id === id)?.name}
    onClick={jumpTo(id)}
    style={{ ...previewInkFor(id), ...style }}
  >
    {children}
  </button>
)

export default function Essay() {
  return (
    <section className="marks-essay">
      <p className="marks-essay__body">
        As my approach to designing marks shifted from answering the brief to
        treating them as empty vessels that could carry an idea or emotion, my
        process also changed.
      </p>

      <div className="marks-essay__divider">
        <PreviewBtn id="furrmark">
          <Furrmark />
        </PreviewBtn>
      </div>

      <div className="marks-essay__body marks-essay__body--p2">
        <p>Now, it&rsquo;s all about uncovering an idea or emotion first, and letting the form emerge.</p>
        <p>Eventually, one such mark does emerge and it often gets a positive response, often it is resonance with the client.</p>
      </div>

      <div className="marks-essay__preview marks-essay__preview--wordmarks">
        <PreviewBtn id="codezeros">
          <Codezeros className="marks-essay__wordmark" />
        </PreviewBtn>
        <PreviewBtn id="slangbusters">
          <Slangbusters className="marks-essay__wordmark" />
        </PreviewBtn>
        <PreviewBtn id="beringer">
          <Beringer className="marks-essay__wordmark" />
        </PreviewBtn>
      </div>

      <div className="marks-essay__caption marks-essay__caption--between">
        <p>For me, marks are not decorations but transmissions: vessels built for timelessness.</p>
      </div>

      <div className="marks-essay__preview marks-essay__preview--glyphs">
        <PreviewBtn id="ecochain">
          <Ecochain className="marks-essay__glyph" />
        </PreviewBtn>
        <PreviewBtn id="kilti">
          <Kilti className="marks-essay__glyph" />
        </PreviewBtn>
      </div>

      <div className="marks-essay__caption">
        <p>Here is a selection of a few distilled ideas and emotions.</p>
      </div>
    </section>
  )
}
