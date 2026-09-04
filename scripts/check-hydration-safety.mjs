#!/usr/bin/env node
// check-hydration-safety — block the regression that killed canvas clicks.
//
// WHY THIS EXISTS. `getGreeting()` reads the clock, so it returns the build
// machine's time in the prerendered HTML and the visitor's time in the
// browser. On this site that hydration mismatch does not merely warn: React
// re-renders the root, re-applies `<html className>` from the root layout, and
// strips the `.fonts-ready` page-gate class. The gate then falls to its CSS
// failsafe — which used to hand `.landing` `pointer-events: auto`, an
// invisible sheet over the Startooth canvas that swallowed every click on the
// pattern. It shipped that way, and it was invisible to every local check,
// because `next dev` does not prerender.
//
// The CSS half of the fix (globals.css keeps `.landing` out of the shared gate
// group) means a recurrence can no longer kill the canvas. This script guards
// the other half: it keeps the clock out of render in the first place.
//
// Full chain: app/_landing/ANOMALIES.md → "Clock-in-render wipes the page gate"
// Same shape as check-icons.mjs: pure Node, run by the pre-push hook.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const ROOT = new URL('..', import.meta.url).pathname
const APP = join(ROOT, 'app')
const SKIP_DIRS = new Set(['node_modules', '.next', '_dev-tools'])

/** Files allowed to touch the clock directly — the util itself and its hook. */
const ALLOWED = new Set(['app/lib/greeting.ts', 'app/lib/useGreeting.ts'])

const walk = (dir, out = []) => {
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue
    const p = join(dir, name)
    if (statSync(p).isDirectory()) walk(p, out)
    else if (/\.(ts|tsx)$/.test(p)) out.push(p)
  }
  return out
}

const RULES = [
  {
    // The exact original bug, in two of three consumers.
    re: /useState\(\s*getGreeting(Stage)?\s*\)/,
    msg: 'useState(getGreeting) — a lazy useState initializer runs on the SERVER too, so this bakes the prerender machine\'s clock into the HTML. Use `useGreeting()` from app/lib/useGreeting.ts.',
  },
  {
    // Any direct clock read during render, outside the sanctioned files.
    re: /\bgetGreeting(Stage)?\s*\(/,
    msg: 'getGreeting()/getGreetingStage() called outside app/lib — the clock differs between the prerender and the visitor. Use `useGreeting()` from app/lib/useGreeting.ts.',
  },
]

/** Blank out // and block comments, preserving line count so numbers stay true.
    Comments legitimately NAME the banned patterns (this file does too), so a
    naive scan flags its own documentation. */
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

/* ── Rule 3: no per-visitor values in useState/useMemo initializers ────────
   Both initializers run during the PRERENDER too, so anything that differs
   between the build machine and the visitor (randomness, the clock) bakes a
   divergent value into the HTML — the same mismatch → root re-render → gate
   wipe chain as the greeting bug. (MarkCarousel shipped exactly this shape,
   defused only by the marks.ts slide[0] invariant.) `useRef` is deliberately
   NOT scanned: Sheet.tsx's mount-time random rotation is a documented-safe
   ref that never reaches server HTML.
   Mechanics: find each useState(/useMemo( call, walk the parens to capture
   the whole (possibly multi-line) argument span, and test the span. */
const DIVERGENT = /Math\.random\s*\(|Date\.now\s*\(|new\s+Date\s*\(|crypto\.randomUUID\s*\(|performance\.now\s*\(/
const DIVERGENT_MSG =
  'randomness/clock inside a useState/useMemo initializer — initializers run on the SERVER too, so the prerendered HTML diverges from the visitor\'s first render. Roll it in a useEffect instead (see MarkCarousel.tsx).'

const initializerFailures = (src, rel, out) => {
  const openerRe = /\buse(?:State|Memo)\s*(?:<[^\n<>]*>)?\s*\(/g
  let m
  while ((m = openerRe.exec(src)) !== null) {
    let depth = 0, i = openerRe.lastIndex - 1
    for (; i < src.length; i++) {
      if (src[i] === '(') depth++
      else if (src[i] === ')' && --depth === 0) break
    }
    const span = src.slice(openerRe.lastIndex, i)
    const hit = span.match(DIVERGENT)
    if (hit) {
      const line = src.slice(0, openerRe.lastIndex + span.indexOf(hit[0])).split('\n').length
      out.push(`${rel}:${line} — ${DIVERGENT_MSG}`)
    }
  }
}

const failures = []
for (const file of walk(APP)) {
  const rel = relative(ROOT, file)
  if (ALLOWED.has(rel)) continue
  const src = stripComments(readFileSync(file, 'utf8'))
  src.split('\n').forEach((line, i) => {
    for (const { re, msg } of RULES) {
      if (re.test(line)) failures.push(`${rel}:${i + 1} — ${msg}`)
    }
  })
  initializerFailures(src, rel, failures)
}

if (failures.length) {
  console.error('hydration-safety: clock-in-render found\n')
  for (const f of failures) console.error('  ✗ ' + f)
  console.error('\n  Why it matters: app/_landing/ANOMALIES.md → "Clock-in-render wipes the page gate"')
  process.exit(1)
}
console.log('hydration-safety — no clock-in-render. The gate class is safe.')
