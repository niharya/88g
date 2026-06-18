# app/ — branch node

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). This tiny node auto-loads for any work under `app/` and exists to route you to the right protective digest. **Keep it small** — it is paid on every app edit.

## Binding pointer — the landing lives at this level

`app/page.tsx` and `app/landing.css` are the landing route. Their protective docs live in `app/_landing/` and will NOT auto-load when you edit those two files. **Before editing either, read [`app/_landing/CLAUDE.md`](./_landing/CLAUDE.md)** (digest) and, for structural changes, [`app/_landing/ANOMALIES.md`](./_landing/ANOMALIES.md). This pointer is binding.

## Family map

- `(works)/` — shell + `rr/`, `biconomy/`, `all/` (the Work Essay hub at route **`/all`**; folder renamed from `selected/`; "bench"/"selected" remain internal codenames; each has its own CLAUDE.md digest + ANOMALIES.md archive)
- `marks/`, `shape-of-product/` — routes outside the shell (own digests + archives)
- `components/` — shared layer (digest at `components/CLAUDE.md`; nav cluster deeper at `components/nav/`)
- `_landing/` — landing docs (see binding pointer above)
- `globals.css` — all shared tokens; values live here only, docs never restate them
