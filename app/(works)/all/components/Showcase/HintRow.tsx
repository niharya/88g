'use client'

// HintRow — heads the Visual tab's masonry grid (rendered by WorkPanel). Mono
// caption with two keycap-styled glyphs: `[click]` to focus a piece, `[esc]`
// to dismiss. Mirrors the hint row from the Claude design handoff.

export default function HintRow() {
  return (
    <p className="sc-hint">
      <span className="sc-hint__key">click</span>
      <span className="sc-hint__txt">to focus a piece</span>
      <span className="sc-hint__sep">·</span>
      <span className="sc-hint__key">esc</span>
      <span className="sc-hint__txt">to dismiss</span>
    </p>
  )
}
