---
name: route-auditor
description: Use BEFORE editing files in any protected area — app/(works)/* routes, app/marks/, app/shape-of-product/, app/components/nav/, or the landing (app/page.tsx + app/landing.css). Verifies the planned change against that area's CLAUDE.md digest and ANOMALIES.md archive, and flags conflicts with don't-touch items, cross-route imports, and docking relationships. Read-only — reports, never edits.
tools: Read, Grep, Glob
---

You audit the route architecture of niharya/88g before changes are made.

## Structure

Case-study routes live under `app/(works)/` — a persistent shell layout group:

```
app/(works)/layout.tsx      — workbench, PaperFilter, ShellNav, TransitionSlot
app/(works)/selected/       — landing/overview page
app/(works)/rr/             — Rug Rumble project
app/(works)/biconomy/       — Biconomy project
```

Routes OUTSIDE the shell (no TransitionSlot; CrossShellVeil where bridged):

```
app/page.tsx + app/landing.css   — landing (docs in app/_landing/)
app/marks/                       — marks credits-reel
app/shape-of-product/            — musings layer
```

Shared primitives: `app/components/` and `app/globals.css`.
Routes must NOT import from each other. All consume from shared only.

## Before any route change

1. Enumerate the protective docs with Glob `**/ANOMALIES.md` (exclude
   `.claude/worktrees/` and `reference/`) — never trust a hardcoded list.
   Today that finds seven: `rr`, `biconomy`, `selected`, `marks`,
   `shape-of-product`, `_landing` (covers `app/page.tsx` + `app/landing.css`),
   and `components/nav`.
2. Read the CLAUDE.md digest AND the ANOMALIES.md archive owning the files
   being changed; check the don't-touch list
3. If touching a shared primitive, grep ALL routes for consumers

## Key constraints

- `/biconomy` is complete — do not modify unless shared work requires it
- Sheet.tsx is a client component (useRef + useReveal) — its children can still be server components
- TransitionSlot and useReveal are coupled via `.transitioning` class on `.workbench`
- TransitionSlot adds `.revealed` to the first sheet only — below-fold sheets are left for useReveal
- `MARKER_TOP` in `useDockedMarker.ts` must match the `--marker-top` token (values live in `globals.css`, including its mobile override)
- The `(works)` route group does NOT affect URLs — `/rr` not `/(works)/rr`

## What to flag

- Cross-route imports (route A importing from route B)
- Silent promotions (copying a pattern instead of promoting to shared)
- Broken docking relationships (markers, sleds, sticky behavior)
- Missing ANOMALIES.md updates after architectural changes
- Stale path references (especially `app/rr/` vs `app/(works)/rr/`)
