#!/usr/bin/env node
// check-prod-safety — guards two production-only invariants no local run can see.
//
// 1. STATIC RENDERING. Every page route prerenders static (○). That is not
//    configured anywhere — it is INFERRED by Next from the absence of dynamic
//    APIs, so one `searchParams` read silently flips a route to per-request
//    rendering. The cost is real and shipped once: a dynamic /all made the
//    landing → Works click dead for 2–3s (app/(works)/all/ANOMALIES.md →
//    "Route hold"; fixed v0.128 by moving the read client-side). `next dev`
//    renders per-request either way, so the regression is invisible locally.
//    This scans the server entry files (page.tsx / layout.tsx) for the APIs
//    that trigger the flip.
//
// 2. HEADER TWINS. The security headers are declared twice — next.config.mjs
//    (Next-rendered responses) and netlify.toml (CDN-served files) — and must
//    stay byte-identical (LIBRARY.md → "Security headers"). /resume shipped
//    blank for 47 releases on this layer. This diffs every header in
//    SECURITY_HEADERS against its netlify.toml copy.
//
// Same shape as check-icons.mjs / check-hydration-safety.mjs: pure Node,
// run by the pre-push hook and /release.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const APP = join(ROOT, 'app')
const SKIP_DIRS = new Set(['node_modules', '.next', '_dev-tools', 'api'])
const failures = []

/* ── 1. Static-rendering guard ────────────────────────────────────────────── */

// Route handlers under app/api are dynamic by design (SKIP_DIRS drops them).
const DYNAMIC_RULES = [
  { re: /\bsearchParams\b/, what: '`searchParams`' },
  { re: /\bheaders\s*\(\s*\)/, what: '`headers()`' },
  { re: /\bcookies\s*\(\s*\)/, what: '`cookies()`' },
  { re: /\bdraftMode\s*\(\s*\)/, what: '`draftMode()`' },
  { re: /\bconnection\s*\(\s*\)/, what: '`connection()`' },
  { re: /export\s+const\s+dynamic\s*=\s*['"]force-dynamic['"]/, what: '`dynamic = "force-dynamic"`' },
]

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/^(page|layout)\.tsx$/.test(name)) out.push(p)
  }
  return out
}

const stripComments = (src) => {
  let out = '', i = 0, mode = 'code'
  while (i < src.length) {
    const two = src.slice(i, i + 2)
    if (mode === 'code' && two === '//') { mode = 'line'; out += '  '; i += 2; continue }
    if (mode === 'code' && two === '/*') { mode = 'block'; out += '  '; i += 2; continue }
    if (mode === 'line' && src[i] === '\n') { mode = 'code'; out += '\n'; i += 1; continue }
    if (mode === 'block' && two === '*/') { mode = 'code'; out += '  '; i += 2; continue }
    out += mode === 'code' ? src[i] : (src[i] === '\n' ? '\n' : ' ')
    i += 1
  }
  return out
}

for (const file of walk(APP)) {
  const rel = relative(ROOT, file)
  const src = stripComments(readFileSync(file, 'utf8'))
  // Client components can't take the server searchParams prop; the hooks that
  // matter there (useSearchParams sans Suspense) are a different regression —
  // keep this guard to the server entry files, where the shipped bug lived.
  if (/^\s*['"]use client['"]/.test(src)) continue
  src.split('\n').forEach((line, i) => {
    for (const { re, what } of DYNAMIC_RULES) {
      if (re.test(line)) {
        failures.push(
          `${rel}:${i + 1} — ${what} makes this route render per-request (ƒ). ` +
          'That un-prerenders it and re-creates the 2–3s dead click (all/ANOMALIES.md → "Route hold"). ' +
          'Read request state client-side instead.',
        )
      }
    }
  })
}

/* ── 2. Header drift ──────────────────────────────────────────────────────── */

const config = (await import(join(ROOT, 'next.config.mjs'))).default
const rules = (await config.headers())[0].headers
const toml = readFileSync(join(ROOT, 'netlify.toml'), 'utf8')

for (const { key, value } of rules) {
  if (key === 'X-App-Version') continue // Next-only deploy beacon, by design
  const m = toml.match(new RegExp(`^\\s*${key}\\s*=\\s*"([^"]*)"`, 'm'))
  if (!m) {
    failures.push(`netlify.toml — missing header \`${key}\` (declared in next.config.mjs). The two lists must stay identical.`)
  } else if (m[1] !== value) {
    failures.push(
      `header drift on \`${key}\`:\n      next.config.mjs: ${value}\n      netlify.toml:    ${m[1]}`,
    )
  }
}

/* ── Report ───────────────────────────────────────────────────────────────── */

if (failures.length) {
  console.error('prod-safety: production-only invariant broken\n')
  for (const f of failures) console.error('  ✗ ' + f)
  console.error('\n  Why it matters: CLAUDE.md → "Versioning and pushing" (production is a different machine)')
  process.exit(1)
}
console.log('prod-safety — routes prerender static, header twins identical.')
