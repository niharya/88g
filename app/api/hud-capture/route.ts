// Dev-only endpoint: receives HUD captures from the Flows position editor
// and appends them to .claude/hud-captures.json. Keyed by `${slideIdx}-${state}`
// so recapturing the same state overwrites the previous value.
//
// Never invoked from production code — only the HUD panel hits this when
// ?hud=1 is active. Disabled outside development.

import { NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

const CAPTURES_FILE = path.join(process.cwd(), '.claude', 'hud-captures.json')

type NotePayload = {
  text: string
  x: number
  y: number
  image?: string
  toggleLabel?: { initial: string; after: string }
}

type CapturePayload = {
  slideIdx: number
  slideId: number
  state: 'before' | 'after'
  notes: NotePayload[]
}

export async function POST(req: Request) {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'HUD capture disabled in production' }, { status: 403 })
  }

  let payload: CapturePayload
  try {
    payload = (await req.json()) as CapturePayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  if (
    typeof payload.slideIdx !== 'number' ||
    (payload.state !== 'before' && payload.state !== 'after') ||
    !Array.isArray(payload.notes)
  ) {
    return NextResponse.json({ error: 'Invalid payload shape' }, { status: 400 })
  }

  // Read existing file (or start empty).
  let existing: Record<string, CapturePayload> = {}
  try {
    const raw = await fs.readFile(CAPTURES_FILE, 'utf8')
    existing = JSON.parse(raw)
  } catch {
    // file missing or unreadable — treat as empty
  }

  const key = `${payload.slideIdx}-${payload.state}`
  existing[key] = {
    ...payload,
    // Add a timestamp for audit if we ever need it.
    // @ts-expect-error — augmenting the payload at persist time
    capturedAt: new Date().toISOString(),
  }

  // Ensure .claude exists
  await fs.mkdir(path.dirname(CAPTURES_FILE), { recursive: true })
  await fs.writeFile(CAPTURES_FILE, JSON.stringify(existing, null, 2) + '\n', 'utf8')

  return NextResponse.json({ ok: true, key })
}

export async function GET() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'HUD capture disabled in production' }, { status: 403 })
  }
  try {
    const raw = await fs.readFile(CAPTURES_FILE, 'utf8')
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({})
  }
}
