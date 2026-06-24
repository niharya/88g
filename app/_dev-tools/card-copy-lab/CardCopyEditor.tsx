'use client'

// CardCopyEditor — form-on-the-left, live-sample-on-the-right. The left column
// edits the four copy strings (type, title, subtitle, notice); the right column
// renders the ACTUAL caption (.sc-cap, showing type) + the ACTUAL SpecNote index
// card with the edits merged in, so you edit against the real thing. The Save
// button (pinned top) POSTs every piece to /api/dev-tools/index-card-copy, which
// rewrites card-copy.ts. State seeds from the server-passed live PIECES.

import { useState, type CSSProperties } from 'react'
import SpecNote from '../../(works)/all/components/Showcase/SpecNote'
import type { Piece } from '../../(works)/all/components/Showcase/data'

export type LabItem = { piece: Piece; capDotc: string }

type Draft = { type: string; title: string; whatIs: string; notice: string }
type EditableField = keyof Draft
type Status = 'idle' | 'saving' | 'saved' | 'error'

const FIELDS: { key: EditableField; label: string; multiline: boolean }[] = [
  { key: 'type',   label: 'Type (caption)', multiline: false },
  { key: 'title',  label: 'Title',          multiline: false },
  { key: 'whatIs', label: 'Subtitle',       multiline: true  },
  { key: 'notice', label: 'Notice',         multiline: true  },
]

export default function CardCopyEditor({ items }: { items: LabItem[] }) {
  const [drafts, setDrafts] = useState<Record<string, Draft>>(() =>
    Object.fromEntries(
      items.map(({ piece }) => [
        piece.id,
        { type: piece.type, title: piece.title, whatIs: piece.whatIs, notice: piece.notice },
      ]),
    ),
  )
  const [status, setStatus] = useState<Status>('idle')
  const [error, setError] = useState('')
  const [dirty, setDirty] = useState(false)

  const update = (id: string, field: EditableField, value: string) => {
    setDrafts((ds) => ({ ...ds, [id]: { ...ds[id], [field]: value } }))
    setDirty(true)
    if (status !== 'idle') setStatus('idle')
  }

  const save = async () => {
    setStatus('saving')
    setError('')
    try {
      const res = await fetch('/api/dev-tools/index-card-copy', {
        method:  'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          entries: items.map(({ piece }) => ({ id: piece.id, ...drafts[piece.id] })),
        }),
      })
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as { error?: string }
        throw new Error(body.error || res.statusText)
      }
      setStatus('saved')
      setDirty(false)
    } catch (e) {
      setStatus('error')
      setError((e as Error).message)
    }
  }

  const statusText =
    status === 'saving' ? 'Saving…' :
    status === 'saved'  ? 'Saved ✓' :
    status === 'error'  ? `Save failed — ${error}` :
    dirty               ? 'Unsaved changes' : ''

  return (
    <div className="cclab">
      <header className="cclab__bar">
        <div className="cclab__lead">
          <h1 className="cclab__h1">Index-card copy</h1>
          <p className="cclab__sub">
            Type, title, subtitle &amp; notice per showcase piece — the live card sits beside each editor. Save commits to <code>card-copy.ts</code>.
          </p>
        </div>
        <div className="cclab__actions">
          <span className={`cclab__status cclab__status--${status}`}>{statusText}</span>
          <button type="button" className="cclab__save" onClick={save} disabled={status === 'saving' || !dirty}>
            Save
          </button>
        </div>
      </header>

      <div className="cclab__list">
        {items.map(({ piece, capDotc }) => {
          const d = drafts[piece.id]
          const merged: Piece = { ...piece, type: d.type, title: d.title, whatIs: d.whatIs, notice: d.notice }
          return (
            <section key={piece.id} className="ccrow">
              <div className="cc-edit">
                <span className="cc-edit__id">{piece.id}</span>
                {FIELDS.map((f) => (
                  <label key={f.key} className="cc-field">
                    <span className="cc-field__label">{f.label}</span>
                    {f.multiline ? (
                      <textarea
                        className="cc-field__input"
                        value={d[f.key]}
                        onChange={(e) => update(piece.id, f.key, e.target.value)}
                        rows={2}
                      />
                    ) : (
                      <input
                        className="cc-field__input"
                        value={d[f.key]}
                        onChange={(e) => update(piece.id, f.key, e.target.value)}
                      />
                    )}
                  </label>
                ))}
              </div>

              <div className="cc-sample" style={{ ['--sc-dotc' as string]: capDotc } as CSSProperties}>
                <span className="cc-sample__tag">live sample</span>
                <div className="sc-cap cc-sample__cap">
                  <span className="sc-cap__dot" aria-hidden="true" />
                  <span className="sc-cap__type">{d.type}</span>
                  <span className="sc-cap__year">{piece.year}</span>
                </div>
                <SpecNote piece={merged} />
              </div>
            </section>
          )
        })}
      </div>
    </div>
  )
}
