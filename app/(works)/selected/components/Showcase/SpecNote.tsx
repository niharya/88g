'use client'

import { useMemo } from 'react'
import IconChevronRight from '../../../../components/icons/IconChevronRight'
import type { Piece, ShowcaseDot } from './data'

const DOT_VAR: Record<ShowcaseDot, string> = {
  blue: 'var(--blue-560)',
  terra: 'var(--terra-560)',
  olive: 'var(--olive-560)',
  orange: 'var(--orange-560)',
  yellow: 'var(--yellow-320)',
  mint: 'var(--mint-560)',
  grey: 'var(--grey-640)',
}

export default function SpecNote({ piece }: { piece: Piece }) {
  const num = String(piece.num).padStart(2, '0')
  // Random toss rotation between -2° and +2°. New value per mount so each
  // open feels physical, like the note was tossed onto the workbench. Set
  // as a CSS var consumed by the sc-note-toss keyframes.
  const rotate = useMemo(() => `${(Math.random() * 4 - 2).toFixed(2)}deg`, [piece.id])
  return (
    <div
      className="sc-note"
      style={{ ['--sc-note-rotate' as string]: rotate }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="sc-note__top">
        <h3 className="sc-note__title">{piece.title}</h3>
        <span className="sc-note__no" style={{ color: DOT_VAR[piece.dot] }}>
          No. {num}
        </span>
      </div>

      <div className="sc-note__rule" />

      <div className="sc-note__line">
        <span className="sc-note__tag">Why</span>
        <p className="sc-note__txt">{piece.why}</p>
      </div>

      <div className="sc-note__rule" />

      <div className="sc-note__line">
        <span className="sc-note__tag">Outcome</span>
        <p className="sc-note__txt">{piece.outcome}</p>
      </div>

      <div className="sc-note__rule" />

      <div className="sc-note__foot">
        <span className="sc-note__work">{piece.work}</span>
        {piece.href && (
          <a className="sc-note__link" href={piece.href}>
            <span className="sc-note__link-label">View case study</span>
            <IconChevronRight size={14} className="sc-note__link-icon" />
          </a>
        )}
      </div>
    </div>
  )
}

export { DOT_VAR }
