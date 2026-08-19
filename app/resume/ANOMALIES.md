# /resume — anomalies

This file is **not** a tour of the codebase. It is the protective archive for this
route: decisions, anomalies, and cross-file wiring you would not figure out by
reading the code in isolation. The compressed digest lives in `./CLAUDE.md`
(auto-loaded); this archive carries the why. Update it when an architectural
decision changes — not on every edit, and always together with its digest line.

**How to read this file: grep the heading named by the digest's pointer and read
only that section.** Never read the whole archive — the Index below is the cheap
map; full entries load per-section, on demand.

## Index

- **X-Frame-Options must never be DENY** — the production-only header that blanked this route for twelve weeks.
- **The embed is an `<object>`, and the choice is not made in JavaScript** — why detection was tried, and why it cannot work.
- **The phone gate is the only deterministic mechanism** — phones never mount an embed.
- **Responsive anomalies** — the sheet is the composition, not a shrunken desktop.

---

## X-Frame-Options must never be DENY

**What.** The site-wide `X-Frame-Options` header must stay `SAMEORIGIN`. `DENY`
forbids framing by *any* page including our own, so the browser refuses to render
the PDF and `/resume` paints nothing at all.

**Where.** `netlify.toml` `[[headers]]` (the PDF is a `public/` file, served by the
Netlify CDN) and the `SECURITY_HEADERS` list in `next.config.mjs` (every
Next-rendered response). Both must agree — see "Security headers" in `LIBRARY.md`.

**Why it is easy to get wrong.** The header exists only in production. `next dev`
serves none of it, so the route renders perfectly on every local check while being
completely blank on nihar.works. It shipped that way from v0.84.0 to v0.131.0 —
twelve weeks, 47 releases — because nothing had ever asserted anything about the
deployed site. The console error is explicit when you finally look for it:
`Refused to display … in a frame because it set 'X-Frame-Options' to 'deny'`.

**What breaks.** `/resume` is an empty viewport. The footer's Resume link appears
to work — it navigates, the tab title is right — and shows nothing.

**Guard.** `npm run smoke` asserts the deployed PDF is not `DENY`, and fails loudly
naming this entry. That check is the reason the route is safe to leave alone.

**Also.** The CSP in both files keeps `frame-src 'self'` and `frame-ancestors 'self'`
so promoting it from report-only to enforcing cannot resurrect the same failure.

---

## The embed is an `<object>`, and the choice is not made in JavaScript

**What.** `ResumeViewer.tsx` renders an `<object type="application/pdf">`, not an
`<iframe>`, with `ResumeSheet` nested inside as its fallback children. The browser
decides whether it can display the file; when it can't, it renders the nested
sheet on its own.

**Why not JavaScript.** Detecting "did the PDF actually paint" was implemented and
removed. It cannot be done reliably: a browser that will not render a PDF still
reports the embedded document as `contentType: 'application/pdf'` with a document
body of zero children. Measured directly — the frame claims success and paints
nothing. Every heuristic built on that signal either misses the failure or, worse,
false-positives and hides a *working* viewer.

**Rejected approaches, in the order they were tried.**
1. `contentDocument.contentType !== 'application/pdf'` after a timeout — never
   fires; the pathological browsers report the PDF type correctly.
2. Checking for an `<embed>` child inside the frame document — absent in working
   viewers too (Chrome's is out-of-process), so it hides good viewers.
3. `<noscript>` — the original. Keys off scripting, not off whether the frame
   painted, so it never fired for the case it named. Removed in v0.132.0.

**What breaks.** Replacing the `<object>` with an `<iframe>` silently removes the
native fallback path; the route goes back to showing empty space wherever a
browser declines the file.

**Known limit.** A *desktop* browser that claims success while painting nothing is
still uncovered — the browser lies and there is nothing to test. Accepted: desktop
Chrome, Safari, Firefox and Edge all have working viewers. The phone case, which
is the common one, is covered deterministically by the gate below.

---

## The phone gate is the only deterministic mechanism

**What.** `MOBILE_MQ` in `ResumeViewer.tsx` — the site-standard
`(max-width: 767px), (max-height: 500px)` including the landscape-phone clause.
On a confirmed phone the embed is never mounted; the sheet is the page.

**Why.** Chrome on Android has no inline PDF viewer at all, and neither do most
in-app browsers — LinkedIn's especially, which is the likeliest place this link is
ever tapped. Mounting an embed there guarantees an empty page, and per the entry
above nothing in JS can detect it afterwards. Not mounting it is the only
guarantee that does not depend on the browser telling the truth.

**Where the `=== true` matters.** SSR renders the embed; only a *confirmed* phone
removes it. `isMobile` starts `null`, and the check is `isMobile === true`, never
`isMobile ?? …` — so the first paint (and any JS-off client) keeps the embed, where
the `<object>` fallback still covers the failure natively. Same shape as the gate
`/biconomy`'s Demos uses for its Figma embed, for the same reason.

**What breaks.** Loosening it to `!isMobile` drops the embed on the `null` first
paint, so every desktop visitor sees the sheet flash before the PDF arrives.

**Keep in lock-step.** The `@media` block in `resume.css` must match `MOBILE_MQ`
exactly. When they drift, phones get desktop sheet metrics or vice versa.

---

## Responsive anomalies

**The sheet is the mobile composition, not a fallback that apologises.** On phones
the sheet is not a degraded view of the PDF — it *is* the page, so it is authored
for that job: no "your browser couldn't display this" line, because for the people
who see it nothing went wrong. It carries the star mark, the title, the standfirst,
the route's own positioning line, one action, and the file's weight.

**Where.** `ResumeSheet.tsx` + the `@media (max-width: 767px), (max-height: 500px)`
block in `resume.css`, which adjusts padding and two type sizes only. No
`transform: scale()`, no shrunken desktop canvas — the composition is the same at
both sizes because it was authored small.

**Material.** The framed sheet reuses `/privacy`'s stationery construction (outer
hairline, 7px gap, inner sheet, noise multiply) in its own warm-paper-on-graphite
colourway, aliased from the canonical ramps at the top of `.resume-sheet`. Values
live in `globals.css`; the aliases are pointers, not new values.

**The action label is deliberately not `t-btn1`.** That class is the inline-link
treatment — dotted underline crossfading to solid, plus `text-transform:
capitalize`, which renders the label "Open The PDF". Inside a bordered control the
underline double-signals and the capitalisation is simply wrong. The border is the
affordance; the label is styled directly in `resume.css`.
