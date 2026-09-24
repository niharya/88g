// generate-lastmod — writes app/lib/lastmod.json, the per-route "content last
// changed" dates that app/sitemap.ts publishes as <lastmod>.
//
// Run by /release (Phase D, before the bump commit) so the file lands with the
// commits it describes. It is generated here and committed, never at build
// time: Netlify may build from a shallow clone, where every path's last commit
// is HEAD and every date would read "today" — the exact lie this replaces.
//
// Usage: npm run lastmod

import { execFileSync } from 'node:child_process'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const OUT = join(ROOT, 'app/lib/lastmod.json')

const git = (...args) => execFileSync('git', args, { cwd: ROOT, encoding: 'utf8' }).trim()

if (git('rev-parse', '--is-shallow-repository') === 'true') {
  console.error('lastmod: shallow clone — history is truncated, dates would be wrong. Run `git fetch --unshallow` first.')
  process.exit(1)
}

// Which files count as a route's CONTENT. A route's lastmod should move when
// what a reader sees there changes — not when a stylesheet or an archive note
// does. Entries are git pathspecs: `:(glob)` enables `**`, and `:(exclude)`
// removes matches, e.g. ':(exclude,glob)app/marks/**/*.md'.
//
// Code = the route's own .ts/.tsx (its words and structure); plus the route's
// own imagery where it has a dedicated folder, because the proof artifacts ARE
// content. Shared app/components/ are left out on purpose: they change every
// case study at once and would make all the dates move together.
const code = (dir) => [`:(glob)${dir}/**/*.ts`, `:(glob)${dir}/**/*.tsx`]

const ROUTE_SOURCES = {
  '/':                 ['app/page.tsx'],
  '/all':              code('app/(works)/all'),
  '/biconomy':         [...code('app/(works)/biconomy'), 'public/images/biconomy'],
  '/rr':               [...code('app/(works)/rr'), 'public/images/rr'],
  '/marks':            [...code('app/marks'), ':(glob)app/marks/**/*.svg', 'public/marks'],
  '/shape-of-product': code('app/shape-of-product'),
  '/resume':           [...code('app/resume'), 'public/nihar-bhagat-resume-2025.pdf'],
  '/privacy':          code('app/privacy'),
}

const dates = {}
for (const [route, specs] of Object.entries(ROUTE_SOURCES)) {
  // Uncommitted edits count as "changed now": /release may fold remaining work
  // into the bump commit, which runs AFTER this script — git log can't see it.
  const dirty = git('status', '--porcelain', '--', ...specs)
  const iso = dirty ? new Date().toISOString() : git('log', '-1', '--format=%cI', '--', ...specs)
  if (iso) dates[route] = iso
  else console.warn(`lastmod: no commits match ${route} — left out of the sitemap dates`)
}

writeFileSync(OUT, JSON.stringify(dates, null, 2) + '\n')
console.log(`lastmod — ${Object.keys(dates).length} routes dated → app/lib/lastmod.json`)
