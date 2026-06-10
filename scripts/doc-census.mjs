#!/usr/bin/env node
// doc-census — the doc family's roll-call.
//
// Verifies the protective documentation tree is whole:
//   1. Every dir with an ANOMALIES.md also has a CLAUDE.md digest (the pairing).
//   2. Every route (a dir under app/ with a page.tsx) is either protected by a
//      digest in its own dir, covered by a documented mapping (landing →
//      app/_landing/), or deliberately listed as a chrome route below.
//   3. Every family CLAUDE.md carries the family header and (for route digests)
//      a "Don't-touch digest" section.
//   4. Relative markdown links inside family files resolve to real files.
//
// Run directly (`node scripts/doc-census.mjs`) or via /release.
// Exit code 0 = court is whole; 1 = someone is missing from the roll.

import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { join, dirname, resolve, relative } from 'node:path'

const ROOT = resolve(import.meta.dirname, '..')
const APP = join(ROOT, 'app')

// Utility routes that deliberately carry no protective docs. Adding a real
// content route here to silence the census is the wrong move — use
// docs/templates/ to give it docs instead.
const CHROME_ROUTES = ['resume', 'privacy', 'preview', 'not-found', 'api']

// Routes whose docs live elsewhere (the mapping is itself part of the system).
const DOC_HOME_OVERRIDES = { '': 'app/_landing' } // app/page.tsx → app/_landing/

const failures = []
const notes = []

function walk(dir, hit, skip = /node_modules|\.next|_source/) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (skip.test(p)) continue
    const s = statSync(p)
    if (s.isDirectory()) walk(p, hit, skip)
    else hit(p)
  }
}

// ── Collect the family ────────────────────────────────────────────────────
const anomalies = []
const digests = []
const pages = []
walk(APP, (p) => {
  if (p.endsWith('/ANOMALIES.md')) anomalies.push(p)
  else if (p.endsWith('/CLAUDE.md')) digests.push(p)
  else if (p.endsWith('/page.tsx')) pages.push(p)
})

// ── 1. Pairing: archive ⇒ digest ──────────────────────────────────────────
for (const a of anomalies) {
  const dir = dirname(a)
  if (!existsSync(join(dir, 'CLAUDE.md')))
    failures.push(`UNPAIRED ARCHIVE: ${relative(ROOT, a)} has no sibling CLAUDE.md digest`)
}

// ── 2. Route coverage ─────────────────────────────────────────────────────
for (const page of pages) {
  const dir = dirname(page)
  const rel = relative(APP, dir) // '' for app/page.tsx
  const top = rel.split('/')[0] ?? ''
  if (CHROME_ROUTES.includes(top)) continue
  // _-prefixed segments are unrouted private/stashed space (Next.js convention)
  if (rel.split('/').some((seg) => seg.startsWith('_'))) continue
  const home = rel in DOC_HOME_OVERRIDES ? join(ROOT, DOC_HOME_OVERRIDES[rel]) : dir
  if (!existsSync(join(home, 'CLAUDE.md')))
    failures.push(
      `ORPHAN ROUTE: ${relative(ROOT, page)} has no protective digest at ${relative(ROOT, home)}/CLAUDE.md` +
      ` — scaffold from docs/templates/ (see root CLAUDE.md → "The document family")`
    )
}

// ── 3. Family headers ─────────────────────────────────────────────────────
for (const d of digests) {
  const body = readFileSync(d, 'utf8')
  const rel = relative(ROOT, d)
  if (!/doc family/i.test(body))
    failures.push(`HEADERLESS DIGEST: ${rel} is missing the family header ("Part of the 88g doc family…")`)
  const hasArchive = existsSync(join(dirname(d), 'ANOMALIES.md'))
  if (hasArchive && !/## Don't-touch digest/.test(body))
    failures.push(`DIGESTLESS PAIR: ${rel} sits beside an ANOMALIES.md but has no "## Don't-touch digest" section`)
}

// ── 4. Relative links resolve ─────────────────────────────────────────────
for (const f of [...digests, ...anomalies]) {
  const body = readFileSync(f, 'utf8')
  for (const m of body.matchAll(/\]\((\.\/[^)#]+)\)/g)) {
    const target = resolve(dirname(f), m[1])
    if (!existsSync(target))
      failures.push(`DANGLING LINK: ${relative(ROOT, f)} → ${m[1]} does not exist`)
  }
}

// ── Report ────────────────────────────────────────────────────────────────
notes.push(`family: ${digests.length} digests, ${anomalies.length} archives, ${pages.length} routed pages`)
console.log(`doc-census — ${notes.join('; ')}`)
if (failures.length) {
  console.log('')
  for (const f of failures) console.log(`  ✗ ${f}`)
  console.log(`\n${failures.length} failure(s). The court is not whole.`)
  process.exit(1)
} else {
  console.log('  ✓ every member accounted for. The court is whole.')
}
