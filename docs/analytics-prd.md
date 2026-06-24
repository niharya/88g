# PRD — Analytics (Track A: measurement)

Status: **Batch 1 (baseline) implemented & locally verified — awaiting first production deploy to confirm data flow.** See §10 rollout log.
Owner: Nihar. Drafted from an audit of the current codebase (2026-06-24).

This is the *measurement* layer only. The per-visitor, on-device **adaptive layer is a separate, gated track** (see "Out of scope" and `docs/adaptive-charter.md` once that track is greenlit). The two must stay independent: the adaptive layer never depends on analytics, and analytics never receives per-visitor model data.

---

## 1. Why

The site has no analytics today and the privacy policy says so explicitly. We want to know, in aggregate and anonymously, **who arrives, where from, which work draws attention, how deep people read, and what converts** — without cookies, without a consent banner, and without spending the page-gate performance budget. For a portfolio whose whole question is *"which work resonates with which audience,"* pageviews alone aren't enough; we need a small set of custom events.

## 2. Decisions (locked)

- **Tool: Umami Cloud, free Hobby tier.** Cookieless by default, <2 KB async script, custom events, EU-friendly, zero infra. Self-hosting was rejected — standing up a server + Postgres is disproportionate for a portfolio and the opposite of "finishing."
- **Cookieless, no consent banner.** Properly-configured cookieless analytics that store nothing on the device are exempt from consent under GDPR/ePrivacy (CNIL, DSK). No banner — which also keeps the "show, don't ask / no administrative debris" ethos intact.
- **Aggregate and anonymous only.** No per-visitor identifiers, no PII, no cross-site tracking. Honor Do-Not-Track as a courtesy consistent with the site's posture.

## 3. Goals / non-goals

**Goals**
- Pageviews, referrers/UTM, country, device — automatic via Umami.
- A tight, aggregate custom-event vocabulary that answers "which work resonates" and "what converts."
- Zero regression to LCP / the page-gate reveal.
- Privacy policy and CSP brought into truth in the same change.

**Non-goals**
- Any per-visitor personalization or storage (that's the adaptive track).
- Heatmaps, session replay, funnels-with-identity, A/B infra.
- Promoting CSP to enforcing (tracked separately; this change keeps it report-only and watches the analytics host first).

## 4. Event vocabulary (starter set)

Automatic: pageview per route (Umami default).

Custom events — fire via a typed wrapper, all props low-cardinality and non-identifying:

| Event | Props | Answers |
|---|---|---|
| `work_opened` | `{ slug }` | Which case study / showcase piece pulls clicks. |
| `case_started` | `{ route }` | Who enters a long-form case study. |
| `case_completed` | `{ route }` | Read-through depth (fires when the final section is reached). |
| `browse_mode` | `{ mode: 'showcase' \| 'cases' }` | Which hub browse mode people prefer. |
| `contact_opened` | — | Top of the contact funnel. |
| `contact_purpose` | `{ purpose }` | **Declared visitor intent** — the purpose tags people pick. High-value for audience read. |
| `contact_submitted` | — | Conversion. |
| `book_call_clicked` | — | The Google Calendar CTA. |

Keep it to this set at launch. `case_section_reached` (per-section depth) is deliberately deferred — high volume, low marginal insight over `started`/`completed`.

## 5. Implementation plan (build steps, in order)

1. **Provision** an Umami Cloud Hobby site for `nihar.works`; note the exact script host and website ID from the dashboard (region-dependent — do not hardcode a guessed host).
2. **Loader** — add the Umami script in `app/layout.tsx` via `next/script` with `strategy="afterInteractive"` (or `lazyOnload`). It must stay **out of the page-gate path** — never inline in the gate script, never `beforeInteractive`. It's a fire-and-forget async script, like EmailJS.
3. **Typed wrapper** — `app/lib/analytics.ts`: a single `track(event, data?)` that no-ops when `window.umami` is absent, when DNT is set, or when a build-time kill switch is off. All event calls go through it so nothing scatters raw `umami.track` across components.
4. **Wire events** at their natural sources: `work_opened` on hub tile / case open; `case_started`/`case_completed` off the existing `<section id={chapter.id}>` anchors (completed = last chapter in view); `browse_mode` on the showcase/cases morph; the contact + book-call events in the Footer/contact components.
5. **CSP** — in `netlify.toml`, add the Umami host (e.g. `https://cloud.umami.is`) to **both** `script-src` and `connect-src`. Confirm the exact host from the dashboard. Header stays `Content-Security-Policy-Report-Only` for now.
6. **Privacy policy** — rewrite the "does not run analytics" paragraph in `app/privacy/page.tsx` (see §6). Portfolio-guardian pass on the copy before ship.
7. **Verify** in dev against the test Umami site, then ship via `/release`.

Files touched: `app/layout.tsx`, `app/lib/analytics.ts` (new), `netlify.toml`, `app/privacy/page.tsx`, plus the event call-sites (hub, case-study section trackers, Footer/contact). All additive.

## 6. Privacy-policy copy (draft — needs portfolio-guardian + verify current wording)

Replace the sentence that currently asserts no analytics. Draft, in the site's calm/precise voice:

> nihar.works does not place advertising, set tracking cookies, or share visitor information with anyone. It does use a privacy-first, cookieless analytics service (Umami) to see aggregate, anonymous patterns — how many people visit, which pages they read, and where they arrived from. No cookies are set, nothing identifies you, nothing is stored on your device, and the data is never linked to a person or sold.

Keep the existing contact-form, book-a-call, and session-flag paragraphs as they are.

## 7. Success criteria

- Umami dashboard receives pageviews and all custom events from production.
- No regression to LCP / page-gate reveal (the loader is async and off the critical path).
- Privacy policy is accurate; no CSP violation is reported for the analytics host. (Note: `report-uri /csp-report` has no handler yet, so this is a manual browser-console check, not a logged one — adding the handler is a separate task.)
- Adblock undercount is accepted — the data is directional and aggregate, not a billing source.

## 8. Risks

- **Page-gate sensitivity** → mitigated by `afterInteractive`/`lazyOnload`, never in the gate path.
- **Exact CSP host** → must match the dashboard's region host or the report-only log fills with noise; confirm at wire-time.
- **Event cardinality** → keep props low-cardinality (slugs, enums) so the dashboard stays legible.
- **US-based processor** (Umami Cloud on AWS us-east-1) → acceptable for a personal portfolio; revisit only if an EU-residency requirement appears.

## 9. Out of scope (the adaptive track)

Everything per-visitor and on-device: session-context capture, the localStorage visitor model + taste vector, resume-where-you-left-off, taste-vector emphasis, prefetch, bandits. That track is separately greenlit, gets its own doc-family node, and is **capped at emphasis / surface / resume — it never auto-reorders or hides authored work** (that would break the "preserve authored values" hard rule). Analytics must ship without any dependency on it.

---

## 10. Rollout log

- **2026-06-24 — Batch 1 (baseline) implemented in the worktree, locally verified.** Direct Umami integration via `app/Analytics.tsx` (client component mounted in `app/layout.tsx`): `strategy="afterInteractive"` (off the page-gate path), `data-domains="nihar.works"` (local dev + Netlify deploy-previews load the script but never send), and an opt-out gate on Global Privacy Control / Do-Not-Track (GPC default = yes). CSP host `https://cloud.umami.is` added to `script-src` + `connect-src` in `netlify.toml`. Privacy policy rewritten (the "does not run analytics" sentence). Website ID `07cb233d-26f2-4dbb-98c8-546cf12d602f`. Verified: `tsc` clean; script loads, `window.umami` present, zero console errors, **no `/api/send` on localhost**. End-to-end (a pageview in the dashboard) confirms on the first production deploy to `nihar.works`.
- **Staging decision** (engineering call): the first-party proxy to recover ad-blocked traffic is a separate, deploy-verified follow-up — a known-good direct baseline ships first because the proxy can only be tested on a live Netlify deploy.
- **2026-06-24 — Batch 3: custom events wired (the "where they clicked" layer).** `app/lib/analytics.ts` is the single typed `track()` helper (no-ops when the tracker is absent). Four events, all additive fire-and-forget — no motion/layout touched: `browse-mode` (hub Visual/Longform morph, in `useBenchDock.openTab`), `work-opened` (showcase tile opens, via a wrapped `setActiveId` in `Showcase.tsx` — covers tile + dot paths), `contact-submitted` (with the chosen purpose tag(s), at the landing's EmailJS success), `book-call-clicked` (landing CTA). Verified: `tsc` clean, no console errors, `browse-mode` confirmed firing in-browser with correct payloads (the showcase grid couldn't mount under the headless 0-height viewport, but `work-opened` rides the same proven helper).
- **2026-06-25 — Batch 4: hardening, extras, docs.** (a) **First-party proxy** — `/_stats/script.js` + `/_stats/api/send` rewrite to Umami in `netlify.toml`; `app/Analytics.tsx` requests the proxied path with `data-host-url="/_stats"`; external umami host dropped from CSP (now all `'self'`). Loader is production-only now (skips local `next dev`). **Deploy-verify:** Network → `/_stats/api/send` returns 2xx. (b) **Website id → env var** `NEXT_PUBLIC_UMAMI_ID` (in `netlify.toml`), with the public id as a safety default. (c) **`/csp-report` handler** (`app/csp-report/route.ts`) so report-only reports stop 404-ing — the prerequisite for ever promoting CSP to enforcing. (d) **Read-to-the-end** — `app/components/CaseCompletion.tsx`, a passive route-local IntersectionObserver mounted by /biconomy (`staying-anchored`) + /rr (`outcome`), fires `case-completed` once; shared `Sheet.tsx` untouched. (e) **Easter-egg** — `easter-egg` fires from `StartoothField.triggerRupture` (the landing's 9-click void rupture; not the idempotent `onBuildComplete`). (f) **Docs** — `LIBRARY.md` Analytics entry + `CLAUDE.md` reference pointer. Verified: `tsc` clean, doc census whole, landing + both case studies render with zero console errors. The proxy, the `case-completed` observer, and the easter egg are deploy / real-browser verified (the headless preview runs at a 0-height viewport, so IntersectionObservers can't fire there).
- **Pending:** deploy via `/release`, then confirm on the live site — a page view in the dashboard **and** `/_stats/api/send` returning 2xx. Optional later: promote CSP from report-only to enforcing once `/csp-report` shows it's clean. The per-visitor "adaptive" track (Track B) stays parked.
