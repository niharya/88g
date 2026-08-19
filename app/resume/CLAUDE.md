# /resume — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/resume/` are touched.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale, what-breaks, and rejected approaches. This digest is the seatbelt; the archive is the manual. Read the archive section before structurally changing anything an item below names.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Don't-touch digest

- Site-wide `X-Frame-Options` stays `SAMEORIGIN` in BOTH `netlify.toml` and `next.config.mjs`; `DENY` forbids our own pages from framing our own PDF and blanks this route in production only. ANOMALIES.md → "X-Frame-Options must never be DENY"
- The embed is an `<object>` with `ResumeSheet` as its fallback children — never an `<iframe>`, and never a JS "did it paint" check; a browser that won't render a PDF still reports `contentType: 'application/pdf'` with an empty body. ANOMALIES.md → "The embed is an `<object>`, and the choice is not made in JavaScript"
- `ResumeViewer.tsx` gates on `isMobile === true`, never `!isMobile` — the `null` first paint must keep the embed or every desktop visitor sees the sheet flash first. ANOMALIES.md → "The phone gate is the only deterministic mechanism"
- `MOBILE_MQ` in `ResumeViewer.tsx` and the `@media` block in `resume.css` must stay identical, landscape clause included. ANOMALIES.md → "The phone gate is the only deterministic mechanism"
- The sheet is the authored mobile composition, not an error state — don't add "your browser couldn't…" copy, and don't restyle the action with `t-btn1` (it capitalises to "Open The PDF" and double-signals inside a bordered control). ANOMALIES.md → "Responsive anomalies"
- Re-versioning the PDF is a one-line change: drop the new file into `public/` and update `PDF_FILE` in `page.tsx`. No rewrite chain exists — don't reintroduce one. ANOMALIES.md → "X-Frame-Options must never be DENY"
