// Tile — the bento's framed container primitive. One `tone` prop drives the
// whole monochrome step set (bg → border → badge → label → ink) from a single
// 88g ramp via the `.tile--{tone}` custom-property block in signals-bento.css.
// Structure is a fixed double frame: a 6px-padded tinted body holding an
// inner hairline frame. Per-tile knobs (inner padding, frame border, grid
// area, min-height, entrance delay) are props so consumers theme by tone and
// tune by prop — never by hardcoded value.

import type { CSSProperties, ReactNode } from 'react'
import type { TileTone } from './types'

interface TileProps {
  tone: TileTone
  /** grid-area name within the bento template. */
  area?: string
  minHeight?: number
  /** Inner frame padding (CSS shorthand). Default '20px 22px'. */
  pad?: string
  /** Override the inner hairline frame colour (a token). Defaults to the tone's step. */
  frameBorder?: string
  /** Entrance stagger delay in seconds. */
  delay?: number
  className?: string
  children: ReactNode
}

export function Tile({ tone, area, minHeight, pad, frameBorder, delay, className, children }: TileProps) {
  const style = {
    gridArea: area,
    // As a CSS var (not an inline `min-height`) so the mobile recompose can
    // drop it via a stylesheet rule — an inline property can't be overridden
    // without `!important`.
    '--tile-min-h': minHeight != null ? `${minHeight}px` : undefined,
    '--tile-delay': delay != null ? `${delay}s` : undefined,
    '--tile-pad': pad,
    '--tile-border-inner-override': frameBorder,
  } as CSSProperties

  return (
    <div className={`tile tile--${tone}${className ? ` ${className}` : ''}`} style={style}>
      <div className="tile__frame">{children}</div>
    </div>
  )
}

// TileBadge — the numbered square + uppercase section label shared by the
// Outcome / Product / Involvement / Deliverables tiles (Role has none). Colours
// come from the parent tile's tone vars.
export function TileBadge({ n, label }: { n: number | string; label: string }) {
  return (
    <div className="tile__badge-row">
      <span className="tile__badge" aria-hidden="true">{n}</span>
      <span className="tile__badge-label">{label}</span>
    </div>
  )
}
