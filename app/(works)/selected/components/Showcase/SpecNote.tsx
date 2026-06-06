'use client'

import { useMemo, type CSSProperties } from 'react'
import IconExternalLink from '../../../../components/icons/IconExternalLink'
import { DOT_VAR, type Piece } from './data'

const CloseGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
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
  const num = String(piece.num).padStart(2, '0')
  // Random toss rotation between -2° and +2°. New value per mount so each
  // open feels physical, like the note was tossed onto the workbench. Set
  // as a CSS var consumed by the sc-note-toss keyframes. Sheets don't
  // rotate — they dock to the viewport edge instead.
  const rotate = useMemo(() => `${(Math.random() * 4 - 2).toFixed(2)}deg`, [piece.id])
  const isSheet = variant === 'sheet'
  // --sc-dotc is set directly on the note so the dot colour cascades to
  // the serial number, the link, and the hint pill — regardless of whether
  // the note is rendered inline inside .sc-piece (desktop, which also
  // sets --sc-dotc on the piece) or portaled to document.body (mobile
  // bottom sheet, where the .sc-piece's cascade doesn't reach).
  const styleVars: CSSProperties = {
    ['--sc-dotc' as string]: DOT_VAR[piece.dot],
    ...(isSheet ? {} : { ['--sc-note-rotate' as string]: rotate }),
  }
  return (
    <div
      className={`sc-note${isSheet ? ' sc-note--sheet' : ''}`}
      style={styleVars}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sc-note__top">
        <h3 className="sc-note__title">{piece.title}</h3>
        <span className="sc-note__no">No. {num}</span>
        {/* Close button — rendered always; CSS shows it only in the      */}
        {/* mobile bottom-sheet variant (.sc-piece--note-bottom .sc-note).*/}
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

      <div className="sc-note__rule" />

      <div className="sc-note__line">
        <span className="sc-note__tag">What is it</span>
        <p className="sc-note__txt">{piece.whatIs}</p>
      </div>

      <div className="sc-note__rule" />

      <div className="sc-note__line">
        <span className="sc-note__tag">Notice</span>
        <p className="sc-note__txt">{piece.notice}</p>
      </div>

      <div className="sc-note__rule" />

      {/* Foot — "…from {project} ↗" link when href is defined (even if   */}
      {/* empty for now; user is filling URLs in a follow-up pass). When   */}
      {/* href is OMITTED entirely (currently subway, startooth) the foot  */}
      {/* renders as plain credit text — the project IS this site or the  */}
      {/* author's own sketchbook, so a link would be circular.            */}
      <div className="sc-note__foot">
        {piece.href !== undefined ? (
          <a
            className="sc-note__link"
            href={piece.href || undefined}
            target="_blank"
            rel="noopener noreferrer"
          >
            {/* Hint pill — hidden by default, fades + slides in from the   */}
            {/* left on hover. Mirrors the archive panel's `.ap-entry__hint`*/}
            {/* idiom (mono 10 px, paper pill, 4 px radius); positioned     */}
            {/* absolute to the LEFT of the link so the text doesn't shift  */}
            {/* when the pill appears.                                       */}
            <span className="sc-note__link-hint" aria-hidden="true">
              opens in new tab
            </span>
            <span className="sc-note__link-label">…from {piece.project}</span>
            <IconExternalLink size={14} className="sc-note__link-icon" />
          </a>
        ) : (
          <span className="sc-note__credit">…from {piece.project}</span>
        )}
      </div>
    </div>
  )
}

