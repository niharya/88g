'use client'

import { useEffect, useId, useLayoutEffect, useRef, useState, type MouseEventHandler } from 'react'
import PieceMedia from './PieceMedia'
import SpecNote from './SpecNote'
import { DOT_VAR, type Piece } from './data'
import { isMobileViewport } from './responsive'
import { ExtraControlsContext } from './ExtraControlsContext'
import { Switch } from '../../../../components/Switch'
import '../../../../components/Switch/switch.css'
import { PauseButton } from '../../../../components/PauseButton'
import '../../../../components/PauseButton/pausebtn.css'
// DotPager CSS is loaded here even though no consumer in this file
// renders one directly anymore — PaymasterAuditController portals a
// DotPager into the extras slot, and component-scoped CSS imports are
// the established idiom in this route.
import '../../../../components/DotPager/dotpager.css'

type Props = {
  piece: Piece
  active: boolean
  /** True when ANY tile on the showcase is active. Non-active video    */
  /** tiles read this and force-pause so the focused artefact owns the  */
  /** room.                                                              */
  anyActive?: boolean
  /** True when the viewport is below the mobile breakpoint. Set by the  */
  /** Showcase parent (reactive via matchMedia). The tile uses this to   */
  /** decide whether to render its own inline SpecNote (desktop) or      */
  /** delegate that to ShowcaseBottomSheet (mobile, owned by parent).    */
  isMobile?: boolean
  onSelect: (id: string | null) => void
  toggleVal?: string
  onToggle?: (id: string, key: string) => void
}

const Plus = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M8 2.5v11M2.5 8h11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

const Close = () => (
  <svg width="11" height="11" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
)

export default function ShowcasePiece({
  piece,
  active,
  anyActive,
  isMobile,
  onSelect,
  toggleVal,
  onToggle,
}: Props) {
  const [paused, setPaused] = useState(false)
  const switchId = useId()
  // Portal slot for per-piece controls (e.g. the paymaster page chip).
  // Held in state (not just a ref) so the Provider re-renders when the
  // slot's <div> attaches and downstream consumers can portal into it.
  const [extrasEl, setExtrasEl] = useState<HTMLDivElement | null>(null)

  // The spec-note side is decided at activation (DESKTOP ONLY): measure
  // the tile's column position in the masonry grid. Left third → note
  // opens to the right; middle/right thirds → note opens to the left.
  // On mobile the bottom-sheet variant is owned by ShowcaseBottomSheet
  // at the Showcase parent — this tile only scrolls itself into view.
  const pieceRef = useRef<HTMLDivElement | null>(null)
  const [activeSide, setActiveSide] = useState<'left' | 'right'>('right')

  // Random toss rotation between -1° and +1° per mount — mirrors the    */
  // Sheet `--place-rotate` idiom so tiles read as loose sheets on the  */
  // mat, not a uniform grid. Set in useEffect to avoid SSR mismatch.   */
  useEffect(() => {
    const el = pieceRef.current
    if (!el) return
    const deg = (Math.random() * 2 - 1).toFixed(2)
    el.style.setProperty('--sc-tile-rotate', `${deg}deg`)
  }, [])
  useLayoutEffect(() => {
    if (!active) return
    const el = pieceRef.current
    if (!el) return

    if (isMobileViewport()) {
      // Mobile activation = scroll the tile to the top of the viewport
      // with 24 px of breathing room. The bottom sheet (rendered by the
      // Showcase parent) takes the lower half of the view from there.
      requestAnimationFrame(() => {
        const top = el.getBoundingClientRect().top + window.scrollY - 24
        window.scrollTo({ top, behavior: 'smooth' })
      })
      return
    }

    // Desktop / tablet — pick the side the inline SpecNote should open on.
    const grid = el.closest('.sc-grid') as HTMLElement | null
    const gridRect = grid?.getBoundingClientRect()
    const tileRect = el.getBoundingClientRect()
    if (!gridRect) return
    const relativeCenter =
      (tileRect.left + tileRect.width / 2 - gridRect.left) / gridRect.width
    setActiveSide(relativeCenter < 1 / 3 ? 'right' : 'left')
  }, [active])

  const select: MouseEventHandler<HTMLDivElement> = () => {
    // First click on an inactive tile = open. Once active, the tile body  */
    // itself is inert — only its interactive children (switch, pause,    */
    // cardfan, poster carousel, note link) respond. Clicking the dimmed  */
    // backdrop closes.                                                    */
    if (active) return
    onSelect(piece.id)
  }

  const dotClick: MouseEventHandler<HTMLButtonElement> = (e) => {
    e.stopPropagation()
    onSelect(active ? null : piece.id)
  }

  // Toggle pieces: figure out the next state on press.
  let activeLabel: string | null = null
  let altKey: string | null = null
  if (piece.toggle && toggleVal) {
    activeLabel = piece.toggle.opts.find((o) => o.k === toggleVal)?.label ?? null
    altKey = piece.toggle.opts.find((o) => o.k !== toggleVal)?.k ?? null
  }

  const classes = [
    'sc-piece',
    // Kind hook so per-tile CSS (e.g. corner-radius overrides, border    */
    // exceptions) can target a specific tile without :has() guessing.    */
    `sc-piece--${piece.kind}`,
    active && 'is-active',
    piece.video && 'sc-piece--video',
    paused && 'is-paused',
    `sc-piece--note-${activeSide}`,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      ref={pieceRef}
      className={classes}
      onClick={select}
      role="group"
      aria-label={`${piece.title} — ${piece.type}`}
      style={{
        // CSS uses --dotc for the caption dot colour.
        ['--sc-dotc' as string]: DOT_VAR[piece.dot],
      }}
    >
      {/* .sc-frame is a position-relative wrapper around .sc-media that  */}
      {/* gives the spec note an explicit FRAME anchor for desktop        */}
      {/* left/right placements (mobile-bottom placement lives outside,    */}
      {/* below .sc-cap, so it sits under the entire tile). See           */}
      {/* ANOMALIES.md → "Index card (spec note) placement rule".          */}
      <div className="sc-frame">
      <div
        className={`sc-media${piece.frame ? ' sc-media--framed' : ' sc-media--plain'}`}
        style={{ aspectRatio: String(piece.aspect) }}
      >
        <ExtraControlsContext.Provider value={extrasEl}>
          <PieceMedia
            piece={piece}
            toggleKey={toggleVal}
            /* Force-pause video tiles in two cases:                       */
            /*   1. user toggled the local pause control                   */
            /*   2. another tile on the showcase is the focused one        */
            /*      (anyActive && !active) — quiets ambient motion behind  */
            /*      the dim so the read sits cleanly on the active tile.   */
            paused={paused || (!!anyActive && !active)}
            active={active}
          />

          {(piece.toggle && altKey) || piece.video ? (
            <div className="sc-controls">
              {piece.video && (
                /* Pause/play for any video tile. Sits left of the switch */
                /* when both are present; stands alone on video-only tiles.*/
                <PauseButton
                  paused={paused}
                  onToggle={() => setPaused((v) => !v)}
                  onClick={(e) => e.stopPropagation()}
                />
              )}
              {piece.toggle && altKey && (
                <div
                  className="sc-switch"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Switch
                    id={switchId}
                    checked={toggleVal === piece.toggle.opts[1]?.k}
                    onCheckedChange={() => onToggle?.(piece.id, altKey)}
                    ariaLabel={`Toggle ${piece.toggle.opts.map((o) => o.label).join(' / ')}`}
                  />
                  <label htmlFor={switchId} className="sc-switch__label">
                    {activeLabel}
                  </label>
                </div>
              )}
              {/* Per-piece extras slot. PaymasterAuditController portals  */}
              {/* its page chip into this <div> via ExtraControlsContext;  */}
              {/* tiles with no extras leave it empty. The tile shell      */}
              {/* doesn't know which pieces use it.                         */}
              <div ref={setExtrasEl} className="sc-controls__extras" />
            </div>
          ) : null}
        </ExtraControlsContext.Provider>

      </div>

      {/* Desktop note placement — lives inside .sc-frame so left/right    */}
      {/* anchors to the frame edges (not the piece, which also contains   */}
      {/* the caption row below). Skipped on mobile; the bottom sheet is   */}
      {/* rendered once by Showcase as a singleton.                        */}
      {active && !isMobile && <SpecNote piece={piece} />}
      </div>

      <div className="sc-cap">
        <button
          type="button"
          className="sc-cap__dot"
          onClick={dotClick}
          aria-label={active ? 'Close details' : 'Open details'}
        >
          <span className="sc-cap__dot-glyph">{active ? <Close /> : <Plus />}</span>
        </button>
        <span className="sc-cap__type">{piece.type}</span>
        <span className="sc-cap__sep">·</span>
        <span className="sc-cap__project">{piece.project}</span>
        <span className="sc-cap__year">{piece.year}</span>
      </div>

    </div>
  )
}
