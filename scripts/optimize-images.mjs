// Optimize-images — walks _source/images/ and emits .webp derivatives under
// public/images/ using a 3-tier encoder picked by folder convention. See
// scripts/lib/compression-tier.mjs and _source/README.md for the rules.
//
// What this script does NOT do:
//   - Touch anything under public/images/ that doesn't have a _source/ master
//     (existing on-the-fly derivatives stay until they get a master + re-run).
//   - Delete source masters. _source/ is the long-term home for re-encoding.
//   - Sweep across app/ to rewrite import paths. Consumers update their own
//     `<Img src=...>` to point at the new .webp; cleaner than the optimizer
//     reaching across the repo.
//
// What it does:
//   - Walks _source/images/ recursively
//   - For each .png/.jpg/.jpeg source, picks a tier via inferTier(path)
//   - Writes the .webp to the mirrored path under public/images/
//   - Skips if the .webp already exists and is newer than the source
//     (incremental — re-run is cheap)

import fs from 'node:fs'
import path from 'node:path'
import sharp from 'sharp'
import {
  inferTier,
  sharpWebpOptionsForTier,
} from './lib/compression-tier.mjs'

const SOURCE_ROOT = path.join(process.cwd(), '_source/images')
const TARGET_ROOT = path.join(process.cwd(), 'public/images')
const SOURCE_EXTS = new Set(['.png', '.jpg', '.jpeg'])

function* walk(dir) {
  if (!fs.existsSync(dir)) return
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const abs = path.join(dir, entry.name)
    if (entry.isDirectory()) yield* walk(abs)
    else if (entry.isFile() && SOURCE_EXTS.has(path.extname(entry.name).toLowerCase())) {
      yield abs
    }
  }
}

function relToSourceRoot(abs) {
  return path.relative(SOURCE_ROOT, abs)
}

function targetWebpFor(srcAbs) {
  const rel = relToSourceRoot(srcAbs)
  const stem = rel.replace(/\.(png|jpe?g)$/i, '')
  return path.join(TARGET_ROOT, `${stem}.webp`)
}

function shouldSkip(srcAbs, dstAbs) {
  if (!fs.existsSync(dstAbs)) return false
  const s = fs.statSync(srcAbs)
  const d = fs.statSync(dstAbs)
  return d.mtimeMs >= s.mtimeMs
}

async function processOne(srcAbs) {
  const dstAbs = targetWebpFor(srcAbs)
  const rel = relToSourceRoot(srcAbs)
  const tier = inferTier(srcAbs)
  const opts = sharpWebpOptionsForTier(tier)

  if (shouldSkip(srcAbs, dstAbs)) {
    return { rel, tier, skipped: true }
  }

  fs.mkdirSync(path.dirname(dstAbs), { recursive: true })
  const srcSize = fs.statSync(srcAbs).size
  await sharp(srcAbs).webp(opts).toFile(dstAbs)
  const dstSize = fs.statSync(dstAbs).size

  return { rel, tier, srcSize, dstSize, skipped: false }
}

async function run() {
  const sources = [...walk(SOURCE_ROOT)]
  if (sources.length === 0) {
    console.log(`No sources found under ${path.relative(process.cwd(), SOURCE_ROOT)}.`)
    console.log('Add a .png or .jpg under _source/images/ to get started.')
    return
  }
  console.log(`Found ${sources.length} source file(s) under _source/images/.`)
  console.log('')

  let converted = 0
  let skipped = 0
  let inBytes = 0
  let outBytes = 0

  for (const srcAbs of sources) {
    try {
      const r = await processOne(srcAbs)
      if (r.skipped) {
        skipped++
        console.log(`  skip  [${r.tier.padEnd(14)}] ${r.rel}`)
      } else {
        converted++
        inBytes += r.srcSize
        outBytes += r.dstSize
        const ratio = ((r.dstSize / r.srcSize) * 100).toFixed(0)
        console.log(
          `  conv  [${r.tier.padEnd(14)}] ${r.rel}  ` +
          `${(r.srcSize / 1024).toFixed(0)}KB → ${(r.dstSize / 1024).toFixed(0)}KB  (${ratio}%)`
        )
      }
    } catch (err) {
      console.error(`  FAIL  ${path.relative(SOURCE_ROOT, srcAbs)}  ${err.message}`)
    }
  }

  console.log('')
  console.log(`Converted ${converted}, skipped ${skipped}.`)
  if (converted > 0) {
    console.log(
      `Total: ${(inBytes / 1024).toFixed(0)} KB source → ${(outBytes / 1024).toFixed(0)} KB webp ` +
      `(${((outBytes / inBytes) * 100).toFixed(0)}%).`,
    )
  }
  console.log('')
  console.log('Next: run `npm run lqip` to refresh the manifest before authoring <Img>.')
}

run().catch((err) => {
  console.error(err)
  process.exit(1)
})
