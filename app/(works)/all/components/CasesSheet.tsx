'use client'

// CasesSheet — mobile bottom sheet for the three Slangbusters case studies
// (Aleyr / Ecochain / Codezeros). The mobile counterpart of the desktop inline
// dropdown: tapping "3 projects during Slangbusters" slides this up.
//
// Mirrors the showcase's ShowcaseBottomSheet idiom: body scroll-lock for the
// sheet's lifetime + a portal into document.body so `position: fixed` anchors
// to the viewport (not a transformed bench ancestor). Route-local — first
// timeline consumer of the pattern; promote only on a second use.

import { useEffect } from 'react'
import MaterialIcon from '../../../components/MaterialIcon'

// Matches the showcase SpecNote sheet's close glyph so the two docked cards
// read as one family.
const CloseGlyph = () => (
  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
)

const STUDIES = [
  {
    id: 'aleyr',
    title: 'Finding the thin line between pet ownership and pet parenting',
    meta: 'Creative Director · Aleyr',
    year: '20',
    href: 'https://niharbhagat.com/work/aleyr/',
  },
  {
    id: 'eco',
    title: 'Using the logic of a real desk to shape a digital trading workspace',
    meta: 'Creative Director · Ecochain',
    year: '19',
    href: 'https://slangbusters.com/work/ecochain/',
  },
  {
    id: 'code',
    title: 'Defining a blockchain company before the category had a clear shape',
    meta: 'Creative Director · Codezeros',
    year: '18',
    href: 'https://niharbhagat.com/work/codezeros/',
  },
] as const

export default function CasesSheet({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Body scroll-lock while the sheet is open. Restore the previous value
  // (not blindly clear) so another component's lock survives.
  useEffect(() => {
    if (!open) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [open])

  // Esc to close.
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open, onClose])

  // Rendered inline (not portaled): `position: fixed` anchors to the viewport
  // because no ancestor in the cases tree carries a transform/filter (the
  // docked-ticket navbar relies on the same post-settle guarantee). Inline
  // keeps it inside `.workbench:has(.bench-workbench)`, so the route-scoped
  // study tokens (--aleyr/ecochain/codezeros-800) cascade in.
  return (
    <div className={`cases-sheet${open ? ' is-open' : ''}`} aria-hidden={!open}>
      <div className="cases-sheet__scrim" onClick={onClose} />
      <div
        className="cases-sheet__panel"
        role="dialog"
        aria-modal="true"
        aria-label="Slangbusters case studies"
      >
        <div className="cases-sheet__head">
          <span className="cases-sheet__title">Slangbusters</span>
          <button
            type="button"
            className="cases-sheet__close"
            onClick={onClose}
            aria-label="Close"
          >
            <CloseGlyph />
          </button>
        </div>
        <span className="cases-sheet__span">2018 — 2020</span>
        {STUDIES.map(s => (
          <a
            key={s.id}
            className={`cases-sheet__row cases-sheet__row--${s.id}`}
            href={s.href}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cases-sheet__body">
              <span className="cases-sheet__row-title">{s.title}</span>
              <span className="cases-sheet__meta">
                {s.meta}
                <MaterialIcon name="open_in_new" className="cases-sheet__ext" />
              </span>
            </span>
            <span className="cases-sheet__year">{s.year}</span>
          </a>
        ))}
      </div>
    </div>
  )
}
