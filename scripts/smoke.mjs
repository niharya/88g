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
const ALIASES = ['/cases', '/showcase']
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
async function checkPageHeaders() {
  for (const path of ['/', '/privacy']) {
    const res = await get(path)
    const xfo = res.headers.get('x-frame-options')
    xfo ? ok(`${path} carries X-Frame-Options: ${xfo}`) : bad(`${path} carries NO X-Frame-Options`)

    res.headers.get('content-security-policy-report-only')
      ? ok(`${path} carries a content policy`)
      : bad(`${path} carries NO content policy`)
  }
}

// Cross-origin embeds are evidence on the case studies. If the content policy
// is ever promoted from report-only to enforcing, every host they load from
// must be named in frame-src or the embeds go white.
async function checkEmbedsWouldSurviveEnforcement() {
  const res = await get('/')
  const csp = res.headers.get('content-security-policy-report-only')
  if (!csp) return bad('no content policy to check frame-src against')
  for (const host of ['https://calendar.app.google', 'https://niharbhagat.notion.site', 'https://embed.figma.com']) {
    csp.includes(host)
      ? ok(`frame-src allows ${host}`)
      : bad(`frame-src is missing ${host} — that embed breaks if the policy is enforced`)
  }
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
await checkNotExposed()

for (const m of pass) console.log(`  ✓ ${m}`)
if (fail.length) {
  console.log('')
  for (const m of fail) console.log(`  ✗ ${m}`)
}

console.log(`\n${pass.length} passed, ${fail.length} failed`)
process.exit(fail.length ? 1 : 0)
