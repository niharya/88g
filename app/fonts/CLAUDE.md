# app/fonts — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/fonts/` are touched. No `ANOMALIES.md` — a pure pointer to the performance contract, because these are the highest-stakes, easiest-to-break-cold rules in the repo.

**Read [`docs/performance.md`](../../docs/performance.md) → "Fonts" before changing anything here.** The non-negotiables:

- Each face is wired through `next/font/local` in `app/layout.tsx` and produces a `--font-*` token. **Never redeclare `--font-*` in `globals.css`** — next/font sets hashed family names on `<html>`; redeclaring detaches the cascade and silently breaks all fonts on mobile (the v0.56→0.58 regression).
- `display: 'swap'` on every face (never `'block'` — banned), with a `fallback` chain.
- No external `<link>` to `fonts.googleapis.com` for primary fonts; no CDN-hosted font files.
- Material Symbols is **subsetted** — a new ligature won't render until the font is re-subsetted (see performance.md → "Material Symbols icons"). Never commit the full 5 MB font.
- The font gate is **bounded** (≈1 s JS cap + CSS failsafe) — don't make it uncapped.
- Adding a font is a checklist in performance.md → "Adding a new font" (includes the `LIBRARY.md` → Fonts entry).
