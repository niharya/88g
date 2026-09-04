#!/usr/bin/env node
// smoke — assert the DEPLOYED site is intact.
//
// Why this exists: /resume was broken for twelve weeks and 47 releases. Not
// through bad code — through a security header that only exists in production,
// forbidding something the page was built to do. Every local check passed the
// entire time, because `next dev` serves none of the deploy's headers. Nothing
// had ever looked at the real site.
//
// So this looks at the real site. Headers, redirects, rewrites, embeddability
// — the whole class of things that only become true after a deploy.
//
//   npm run smoke                 → test https://nihar.works as it is now
//   npm run smoke -- --wait       → wait for THIS version to be live, then test
//   npm run smoke -- <url>        → test a Netlify deploy-preview URL instead
//
// --wait is the important one. Netlify builds asynchronously after the push,
// so a check that fires when `/release` finishes measures the PREVIOUS deploy
// and reports green. It polls X-App-Version (next.config.mjs) until the live
// site reports the version in package.json, and refuses to assert until it
// matches — a green run always describes the build you just shipped.

import { readFileSync } from 'node:fs'

const args = process.argv.slice(2)
const WAIT = args.includes('--wait')
const BASE = (args.find((a) => a.startsWith('http')) ?? 'https://nihar.works').replace(/\/$/, '')
const VERSION = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8')).version

const POLL_EVERY_MS = 15_000
const GIVE_UP_AFTER_MS = 10 * 60_000

const pass = []
const fail = []
const ok = (m) => pass.push(m)
const bad = (m) => fail.push(m)

const get = async (path, opts = {}) => {
  try {
    return await fetch(`${BASE}${path}`, { redirect: 'manual', ...opts })
  } catch (err) {
    return { status: 0, headers: new Headers(), error: String(err) }
  }
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

// ── Wait for the build we actually shipped ────────────────────────────────
async function waitForVersion() {
  const deadline = Date.now() + GIVE_UP_AFTER_MS
  process.stdout.write(`waiting for v${VERSION} at ${BASE}`)
  while (Date.now() < deadline) {
    const res = await get('/')
    if (res.headers.get('x-app-version') === VERSION) {
      process.stdout.write(' — live\n\n')
      return true
    }
    process.stdout.write('.')
    await sleep(POLL_EVERY_MS)
  }
  process.stdout.write('\n\n')
  console.error(`✗ v${VERSION} never went live within ${GIVE_UP_AFTER_MS / 60_000} minutes.`)
  console.error('  Check the Netlify build log — the deploy may have failed.\n')
  return false
}

// ── The checks ────────────────────────────────────────────────────────────

// Every route a visitor can reach, plus the two pretty aliases (rewrites) and
// the retired path (redirect). A 404 here means a link somewhere lies.
const ROUTES = ['/', '/all', '/rr', '/biconomy', '/marks', '/shape-of-product', '/privacy', '/resume']
const ALIASES = ['/cases', '/showcase', '/blast-radius']
const FEEDS = ['/sitemap.xml', '/robots.txt']

async function checkRoutes() {
  for (const path of [...ROUTES, ...ALIASES, ...FEEDS]) {
    const res = await get(path)
    res.status === 200 ? ok(`${path} → 200`) : bad(`${path} → ${res.status} (expected 200)`)
  }
  const moved = await get('/selected')
  ;[301, 308].includes(moved.status)
    ? ok(`/selected → ${moved.status} redirect`)
    : bad(`/selected → ${moved.status} (expected a permanent redirect to /all)`)
}

// THE regression guard. /resume lays the PDF in a same-origin frame; if the
// file ever comes back X-Frame-Options: DENY again, the browser refuses to
// render it and the route is a blank page. That is the original bug.
async function checkResume() {
  const pdf = await get('/nihar-bhagat-resume-2025.pdf', { method: 'HEAD' })
  pdf.status === 200
    ? ok('resume PDF → 200')
    : bad(`resume PDF → ${pdf.status} (expected 200 — has the file been renamed?)`)

  const type = pdf.headers.get('content-type') ?? ''
  type.includes('application/pdf')
    ? ok('resume PDF served as application/pdf')
    : bad(`resume PDF content-type is "${type}" (expected application/pdf)`)

  const xfo = (pdf.headers.get('x-frame-options') ?? '').toUpperCase()
  xfo === 'DENY'
    ? bad('resume PDF sends X-Frame-Options: DENY — /resume will render BLANK. This is the v0.84–v0.131 bug.')
    : ok(`resume PDF is frameable by our own pages (X-Frame-Options: ${xfo || 'unset'})`)

  const csp = pdf.headers.get('content-security-policy') ?? ''
  !csp || /frame-ancestors[^;]*'self'/.test(csp)
    ? ok('resume PDF CSP permits same-origin framing')
    : bad(`resume PDF CSP would block the frame: ${csp}`)
}

// Pages, not just files. Netlify's [[headers]] never reached Next-rendered
// responses, so these were bare for months while the static assets were covered.
//
// The content policy is read under EITHER header name so these checks survive
// the planned report-only → enforcing promotion (netlify.toml's comment) —
// before this, promotion day would have produced two false failures at the
// exact moment the checks mattered most.
const contentPolicy = (headers) =>
  headers.get('content-security-policy') ?? headers.get('content-security-policy-report-only')

async function checkPageHeaders() {
  for (const path of ['/', '/privacy']) {
    const res = await get(path)
    // Value, not presence: presence-only passed a DENY regression green, and
    // DENY is the exact header that blanked /resume for 47 releases.
    const xfo = (res.headers.get('x-frame-options') ?? '').toUpperCase()
    xfo === 'SAMEORIGIN'
      ? ok(`${path} carries X-Frame-Options: SAMEORIGIN`)
      : bad(`${path} X-Frame-Options is "${xfo || 'missing'}" (expected SAMEORIGIN — DENY blanks /resume)`)

    contentPolicy(res.headers)
      ? ok(`${path} carries a content policy`)
      : bad(`${path} carries NO content policy`)
  }
}

// Cross-origin embeds are evidence on the case studies. If the content policy
// is ever promoted from report-only to enforcing, every host they load from
// must be named in frame-src or the embeds go white.
async function checkEmbedsWouldSurviveEnforcement() {
  const res = await get('/')
  const csp = contentPolicy(res.headers)
  if (!csp) return bad('no content policy to check frame-src against')
  for (const host of ['https://calendar.app.google', 'https://niharbhagat.notion.site', 'https://embed.figma.com']) {
    csp.includes(host)
      ? ok(`frame-src allows ${host}`)
      : bad(`frame-src is missing ${host} — that embed breaks if the policy is enforced`)
  }
}

// The image optimizer is a production-only function: every <Img> on the site
// subrequests /_next/image, dev uses a different code path, and a total
// optimizer failure fails no route check (pages still 200). One real request
// proves the pipeline end to end. /og-image.png is stable-named (metadata +
// checkResume-style: renaming it must update this line too).
async function checkImageOptimizer() {
  const res = await get('/_next/image?url=%2Fog-image.png&w=640&q=75')
  const type = res.headers.get('content-type') ?? ''
  res.status === 200 && type.startsWith('image/')
    ? ok(`/_next/image optimizes (${type})`)
    : bad(`/_next/image → ${res.status} ${type} — the image optimizer is broken; every content image on the site fails with it`)
}

// The showcase videos are plain CDN files no route check touches — they can
// 404 (rename, lost file) while everything else stays green.
async function checkVideos() {
  for (const path of ['/videos/ecochain/audit-status-icons.mov', '/videos/ecochain/interface-introduction.mov']) {
    const res = await get(path, { method: 'HEAD' })
    const type = res.headers.get('content-type') ?? ''
    res.status === 200 && type.startsWith('video/')
      ? ok(`${path} → 200 (${type})`)
      : bad(`${path} → ${res.status} ${type} — showcase video missing or mistyped`)
  }
}

// Caching contract — pins today's correct Netlify-runtime defaults so a future
// runtime upgrade can't silently weaken them. HTML must revalidate on every
// use (a cached page HTML references purged hashed chunks after the next
// deploy → broken navigation); hashed assets must stay immutable (they're the
// reason deploys are cheap). Neither is authored in-repo — the runtime emits
// both — which is exactly why the live site is asserted instead.
async function checkCachingContract() {
  const page = await get('/')
  const pageCc = page.headers.get('cache-control') ?? ''
  pageCc.includes('max-age=0') && pageCc.includes('must-revalidate')
    ? ok(`HTML revalidates (cache-control: ${pageCc})`)
    : bad(`/ cache-control is "${pageCc}" — stale HTML will reference purged chunks after the next deploy`)

  const html = await page.text?.() ?? ''
  const chunk = html.match(/\/_next\/static\/[^"']+\.js/)?.[0]
  if (!chunk) {
    bad('/ HTML contains no /_next/static script reference — cannot assert asset caching')
    return
  }
  const asset = await get(chunk, { method: 'HEAD' })
  const assetCc = asset.headers.get('cache-control') ?? ''
  asset.status === 200 && assetCc.includes('immutable')
    ? ok(`hashed assets immutable (${chunk.slice(0, 40)}…)`)
    : bad(`${chunk} → ${asset.status}, cache-control "${assetCc}" (expected 200 + immutable)`)
}

// Things that must NOT be reachable.
async function checkNotExposed() {
  for (const path of ['/preview/404', '/preview/error']) {
    const res = await get(path)
    res.status === 404
      ? ok(`${path} → 404 (internal, correctly private)`)
      : bad(`${path} → ${res.status} — internal preview page is publicly reachable`)
  }
  for (const path of ['/api/dev-tools/hud-capture', '/api/dev-tools/index-card-copy']) {
    const res = await get(path, { method: 'POST', headers: { 'content-type': 'application/json' }, body: '{}' })
    res.status === 403
      ? ok(`${path} → 403 (disabled in production)`)
      : bad(`${path} → ${res.status} — dev endpoint is NOT disabled in production`)
  }
}

// ── Run ───────────────────────────────────────────────────────────────────
if (WAIT && !(await waitForVersion())) process.exit(1)

console.log(`smoke — ${BASE}${WAIT ? ` (v${VERSION})` : ''}\n`)

await checkRoutes()
await checkResume()
await checkPageHeaders()
await checkEmbedsWouldSurviveEnforcement()
await checkImageOptimizer()
await checkVideos()
await checkCachingContract()
await checkNotExposed()

for (const m of pass) console.log(`  ✓ ${m}`)
if (fail.length) {
  console.log('')
  for (const m of fail) console.log(`  ✗ ${m}`)
}

console.log(`\n${pass.length} passed, ${fail.length} failed`)
process.exit(fail.length ? 1 : 0)
