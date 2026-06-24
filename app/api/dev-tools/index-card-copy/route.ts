// Dev-only endpoint: receives edited index-card copy from the copy-editor lab
// (/card-copy-lab) and regenerates app/(works)/all/components/Showcase/card-copy.ts
// wholesale. Values are JSON-encoded on the way out, so any punctuation
// (apostrophes, quotes, em-dashes) is escaped safely — no string-literal
// corruption. Disabled outside development; never invoked from shipped code.

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const COPY_FILE = path.join(
  process.cwd(),
  'app', '(works)', 'all', 'components', 'Showcase', 'card-copy.ts',
)

// Regenerated verbatim each save — keep in sync with the hand-authored header if
// the file's contract changes.
const HEADER = `// Index-card copy — the editable strings for each showcase piece:
//   type     → the caption category label     (.sc-cap__type)
//   title    → the index-card heading          (.sc-note__title)
//   whatIs   → the "what is it" subtitle line   (.sc-note__whatis)
//   notice   → the "notice how…" line           (.sc-note__notice-txt)
//
// Split out of data.ts so the reader-facing copy lives in ONE place, separate
// from the structural piece data (kind, aspect, cols, href…). data.ts overlays
// these onto PIECES by id, so THIS file is the single source of truth for those
// four strings — edit here, or via the copy-editor lab.
//
// Rewritten wholesale by the dev copy-editor: the Save button POSTs to
// /api/dev-tools/index-card-copy, which regenerates this file from the edited
// values (JSON-encoded, so any punctuation is escaped safely). Keep it a plain
// object literal keyed by piece id — the editor's serializer assumes that shape.

export type CardCopy = {
  type:   string
  title:  string
  whatIs: string
  notice: string
}
`

type Entry = { id: string; type: string; title: string; whatIs: string; notice: string }

function isEntry(v: unknown): v is Entry {
  if (typeof v !== 'object' || v === null) return false
  const e = v as Record<string, unknown>
  return (
    typeof e.id === 'string' && e.id.length > 0 &&
    typeof e.type === 'string' &&
    typeof e.title === 'string' &&
    typeof e.whatIs === 'string' &&
    typeof e.notice === 'string'
  )
}

function serialize(entries: Entry[]): string {
  const body = entries
    .map(
      (e) =>
        `  ${JSON.stringify(e.id)}: {\n` +
        `    type:   ${JSON.stringify(e.type)},\n` +
        `    title:  ${JSON.stringify(e.title)},\n` +
        `    whatIs: ${JSON.stringify(e.whatIs)},\n` +
        `    notice: ${JSON.stringify(e.notice)},\n` +
        `  },`,
    )
    .join('\n')
  return `${HEADER}\nexport const CARD_COPY: Record<string, CardCopy> = {\n${body}\n}\n`
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Copy editor disabled in production' }, { status: 403 })
  }

  let payload: { entries?: unknown }
  try {
    payload = (await req.json()) as { entries?: unknown }
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const entries = payload.entries
  if (!Array.isArray(entries) || entries.length === 0 || !entries.every(isEntry)) {
    return NextResponse.json({ error: 'Expected a non-empty entries[] of {id,type,title,whatIs,notice}' }, { status: 400 })
  }

  try {
    await fs.writeFile(COPY_FILE, serialize(entries as Entry[]), 'utf8')
  } catch (err) {
    return NextResponse.json({ error: `Write failed: ${(err as Error).message}` }, { status: 500 })
  }

  return NextResponse.json({ ok: true, count: entries.length })
}
