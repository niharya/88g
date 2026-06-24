// CSP violation sink.
// ───────────────────
// The Content-Security-Policy-Report-Only header (netlify.toml) names
// `report-uri /csp-report`; browsers POST violation reports here. This endpoint
// accepts them so they don't 404, and logs them to the function output — the
// whole point of the report-only phase is to WATCH for violations before the
// policy is ever promoted to enforcing. No storage, no PII; reports are
// transient. Until this existed, the report-uri pointed at nothing.

import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const report = await req.json()
    // Surfaces in the Netlify function log. Report-only → nothing is blocked.
    console.warn('[csp-report]', JSON.stringify(report))
  } catch {
    /* empty or malformed report — ignore */
  }
  return new NextResponse(null, { status: 204 })
}
