'use client'

import { useMemo, type CSSProperties } from 'react'
import IconExternalLink from '../../../../components/icons/IconExternalLink'
import { DOT_VAR_DEEP, type Piece } from './data'

const CloseGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

// Decorative eye glyph — sits at the right edge of the Notice row. No
// interaction; reads as a quiet "look at this" mark. Sized 24×24 per
// Figma. Stroke from currentColor so it inherits the row's grey text
// colour (not the dot tint).
const EyeGlyph = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" fill="currentColor" />
  </svg>
)

export default function SpecNote({
  piece,
  onClose,
  variant = 'card',
}: {
  piece: Piece
  onClose?: () => void
  /** 'card' = the desktop index card with random toss rotation.        */
  /** 'sheet' = the mobile bottom-sheet skin (rendered through a portal */
  /** at document.body by ShowcasePiece).                                */
  variant?: 'card' | 'sheet'
}) {
  // Index-card foot-end label: was zero-padded serial (`01`..`10`),
  // now the year of the piece. The narrative `num` still lives in data
  // for future referencing — it just no longer renders here.
  const footLabel = piece.year
  // Random toss rotation between -1° and +1°. New value per mount so each
  // open feels physical, like the note was tossed onto the workbench.
  // Matched to the tile's own range (ShowcasePiece sets --sc-tile-rotate
  // from the same window) so the opened note reads as a sibling sheet,
  // not a louder gesture than the artefact it explains. Set as a CSS
  // var consumed by the sc-note-toss keyframes. Sheets don't rotate —
  // they dock to the viewport edge instead.
  const rotate = useMemo(() => `${(Math.random() * 2 - 1).toFixed(2)}deg`, [piece.id])
  const isSheet = variant === 'sheet'
  // --sc-dotc is set directly on the note so the dot colour cascades to
  // the foot link, the foot serial, the hint pill, AND the card's own
  // border. Reads the DEEP (720) map — a step darker than the tile's
  // soft 560 dots — so the opened note reads as the confident, deep
  // companion to the closed tile's quiet caption dot.
  const styleVars: CSSProperties = {
    ['--sc-dotc' as string]: DOT_VAR_DEEP[piece.dot],
    ...(isSheet ? {} : { ['--sc-note-rotate' as string]: rotate }),
  }
  return (
    <div
      className={`sc-note${isSheet ? ' sc-note--sheet' : ''}`}
      style={styleVars}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sc-note__head">
        <h3 className="sc-note__title">{piece.title}</h3>
        {/* Close button — rendered always; CSS shows it only in the      */}
        {/* mobile bottom-sheet variant (.sc-note--sheet .sc-note__close).*/}
        {onClose && (
          <button
            type="button"
            className="sc-note__close"
            onClick={(e) => {
              e.stopPropagation()
              onClose()
            }}
            aria-label="Close details"
          >
            <CloseGlyph />
          </button>
        )}
      </div>

      {/* "What is it" body — promoted to lead paragraph. The mono tag    */}
      {/* label that used to sit in a 72 px column is gone; the body now  */}
      {/* runs full-width directly under the title.                       */}
      <p className="sc-note__whatis">{piece.whatIs}</p>

      <div className="sc-note__rule" />

      {/* Notice row — body text on the left, decorative eye glyph        */}
      {/* docked right. Eye is grey (currentColor on the row), not        */}
      {/* dot-tinted — it's a quiet "look at this" mark, not a brand      */}
      {/* accent.                                                          */}
      <div className="sc-note__notice">
        <h5 className="sc-note__notice-txt">{piece.notice}</h5>
        <span className="sc-note__notice-eye" aria-hidden="true">
          <EyeGlyph />
        </span>
      </div>

      <div className="sc-note__rule" />

      {/* Foot — "…from {project} ↗" link on the LEFT (dot-tinted, with   */}
      {/* a persistent dotted underline + the hover hint pill), serial    */}
      {/* number on the RIGHT (dot-tinted, mono). When `href` is omitted */}
      {/* (currently subway, startooth) the foot renders plain credit     */}
      {/* text on the left — the project IS this site or the author's    */}
      {/* own sketchbook, so a link would be circular.                    */}
      <div className="sc-note__foot">
        {piece.href !== undefined ? (
          <a
            className="sc-note__link"
            href={piece.href || undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="sc-note__link-label">…from {piece.project}</span>
            {/* Archive's animated external-link icon (.icon-ext): the     */}
            {/* arrow group slides diagonally on hover via CSS — same      */}
            {/* recipe as `a.ap-entry .icon-ext-arrow`.                    */}
            <IconExternalLink size={14} className="icon-ext" />
          </a>
        ) : (
          <span className="sc-note__credit">…from {piece.project}</span>
        )}
        {/* Foot-end stack — serial number in flow, hint pill absolutely  */}
        {/* positioned over it. At rest the serial reads; on link hover   */}
        {/* the serial fades to 0 and the hint pill ("opens in new tab")  */}
        {/* fades in to take its place. The pill is omitted when there's   */}
        {/* no link to hint at.                                            */}
        <span className="sc-note__foot-end">
          <span className="sc-note__no">{footLabel}</span>
          {piece.href !== undefined && (
            <span className="sc-note__hint" aria-hidden="true">
              opens in new tab
            </span>
          )}
        </span>
      </div>
    </div>
  )
}
