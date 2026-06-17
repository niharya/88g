#!/usr/bin/env node
// Fails if the shipped Material Symbols subset is out of sync with the icon
// registry (app/lib/icons.ts). Pure Node — no font tooling — so the pre-push
// hook stays dependency-light. The subset is rebuilt with `npm run icons`
// (Python + fontTools), which writes app/fonts/icon-manifest.json; this check
// just compares that manifest to ICON_NAMES.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')

function registryNames() {
  const ts = readFileSync(join(root, 'app/lib/icons.ts'), 'utf8')
  const m = ts.match(/ICON_NAMES\s*=\s*\[(.*?)\]\s*as const/s)
  if (!m) {
    console.error('icon check: could not find ICON_NAMES in app/lib/icons.ts')
    process.exit(1)
  }
  return [...m[1].matchAll(/'([a-z_]+)'/g)].map((x) => x[1]).sort()
}

function manifestNames() {
  try {
    const raw = readFileSync(join(root, 'app/fonts/icon-manifest.json'), 'utf8')
    return JSON.parse(raw).icons.slice().sort()
  } catch {
    console.error('icon check FAILED: app/fonts/icon-manifest.json missing — run `npm run icons`.')
    process.exit(1)
  }
}

const registry = registryNames()
const manifest = manifestNames()
const missing = registry.filter((n) => !manifest.includes(n)) // used but not in subset
const extra = manifest.filter((n) => !registry.includes(n)) // in subset but unused

if (missing.length || extra.length) {
  console.error('icon check FAILED — subset out of sync with app/lib/icons.ts. Run `npm run icons`.')
  if (missing.length) console.error('  registry icons missing from subset:', missing.join(', '))
  if (extra.length) console.error('  subset icons no longer in registry:', extra.join(', '))
  process.exit(1)
}

console.log(`icon check: ${registry.length} icons, subset in sync.`)
