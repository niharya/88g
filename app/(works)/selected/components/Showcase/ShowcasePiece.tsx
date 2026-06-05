'use client'

import { useId, useLayoutEffect, useRef, useState, type MouseEventHandler } from 'react'
import PieceMedia from './PieceMedia'
import SpecNote, { DOT_VAR } from './SpecNote'
import type { Piece } from './data'
import { Switch } from '../../../../components/Switch'
import '../../../../components/Switch/switch.css'
import { PauseButton } from '../../../../components/PauseButton'
import '../../../../components/PauseButton/pausebtn.css'
import { DotPager } from '../../../../components/DotPager'
import '../../../../components/DotPager/dotpager.css'

type Props = {
  piece: Piece
  active: boolean
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

// Paymaster audit has 3 flows that the page chip cycles through. Lift the
// index here so the chip (inside the controls bar) can drive it and the
// audit component renders the matching slide.
const PAYMASTER_FLOW_COUNT = 3

export default function ShowcasePiece({
  piece,
  active,
  onSelect,
  toggleVal,
  onToggle,
}: Props) {
  const [paused, setPaused] = useState(false)
  const [flowIndex, setFlowIndex] = useState(0)
  const cycleFlow = () => setFlowIndex((i) => (i + 1) % PAYMASTER_FLOW_COUNT)
  const switchId = useId()

  // The spec-note side is decided at activation:
  //   • Desktop / tablet — measure the tile's column position in the
  //     masonry grid. Left third → note opens to the right; middle and
  //     right thirds → note opens to the left. Snug beside the parent.
  //   • Mobile (1-col stack) — note always opens BELOW the tile, and the
  //     tile scrolls to the top of the viewport so the tile + the note
  //     read as a single read-this-now unit instead of forcing the user
  //     to chase the note down the page.
  const pieceRef = useRef<HTMLDivElement | null>(null)
  const [activeSide, setActiveSide] = useState<'left' | 'right' | 'bottom'>('right')
  useLayoutEffect(() => {
    if (!active) return
    const el = pieceRef.current
    if (!el) return

    // Same media query as `.sc-grid` mobile breakpoint in showcase.css —
    // OR'd with landscape-phone clause per docs/responsive.md.
    const isMobile =
      typeof window !== 'undefined' &&
      window.matchMedia('(max-width: 767px), (max-height: 500px)').matches

    if (isMobile) {
      setActiveSide('bottom')
      // Defer the scroll one frame so the .is-active class has applied
      // and the tile's translateY lift is committed — otherwise the
      // smooth-scroll target measures the pre-lift position and lands
      // ~12 px short of the viewport top.
      requestAnimationFrame(() => {
        // Offset so the tile clears the top marker strip and the chapter
        // tab; mirrors the same 72 px offset used in /biconomy Flows on
        // notes-open.
        const top = el.getBoundingClientRect().top + window.scrollY - 24
        window.scrollTo({ top, behavior: 'smooth' })
      })
      return
    }

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
      aria-label={`${piece.title} — ${piece.cat}`}
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
        <PieceMedia
          piece={piece}
          toggleKey={toggleVal}
          paused={paused}
          active={active}
          flowIndex={flowIndex}
        />

        {(piece.toggle && altKey) || (piece.video && !piece.toggle) || piece.kind === 'paymaster' ? (
          <div className="sc-controls">
            {piece.video && (
              /* Pause/play for any video tile. Sits to the left of the   */
              /* switch when both are present (Ecochain); stands alone on */
              /* video-only tiles (Furrmark, Subway). Shared PauseButton  */
              /* primitive (app/components/PauseButton).                  */
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
            {piece.kind === 'paymaster' && (
              /* Page chip — same height as the switch, dots row inside.   */
              /* Entire chip clickable; cycles 1 → 2 → 3 → 1 through the  */
              /* paymaster flows. Shared DotPager primitive — tint comes  */
              /* via the `.sc-pagechip` scope hook below in showcase.css. */
              <DotPager
                className="sc-pagechip"
                count={PAYMASTER_FLOW_COUNT}
                activeIndex={flowIndex}
                onAdvance={cycleFlow}
                onClick={(e) => e.stopPropagation()}
                ariaLabel={`Flow ${flowIndex + 1} of ${PAYMASTER_FLOW_COUNT}`}
              />
            )}
          </div>
        ) : null}

      </div>

      {/* Desktop note placement — lives inside .sc-frame so left/right    */}
      {/* anchors to the frame edges (not the piece, which also contains   */}
      {/* the caption row below).                                          */}
      {active && activeSide !== 'bottom' && <SpecNote piece={piece} />}
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
        <span className="sc-cap__cat">{piece.cat}</span>
        <span className="sc-cap__sep">·</span>
        <span className="sc-cap__src">{piece.src}</span>
        <span className="sc-cap__year">{piece.year}</span>
      </div>

      {/* Mobile note placement — lives OUTSIDE .sc-frame so its           */}
      {/* `top: calc(100% + 12px)` anchors to the bottom of the entire    */}
      {/* tile (including the caption row), not just the media frame.     */}
      {active && activeSide === 'bottom' && <SpecNote piece={piece} />}
    </div>
  )
}
