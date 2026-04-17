# /marks — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/(works)/marks/`. Update it when
an architectural decision changes — not on every edit.

For project-level rules see `CLAUDE.md`. The full build brief is in `MARKS_BRIEF.md`
at the repo root (temporary — removed when the route ships).

---

## Chunk status

| Chunk | Status  | What landed |
|-------|---------|-------------|
| 1     | DONE    | Route skeleton + 3 shell edits (this file, marks.css, placeholder components, data stub) |
| 2     | pending | Mark SVG components (route-local) |
| 3–14  | pending | See MARKS_BRIEF.md build order |

---

## Shared shell touchpoints

Three small, additive edits to the persistent (works) shell were made during
chunk 1 to register the route. None change existing route behavior.

**[app/(works)/ShellNav.tsx](../ShellNav.tsx)** — `segmentNames` gets
`marks: 'Marks & Symbols'`. Drives the left pill label on `/marks`.

**[app/(works)/TransitionSlot.tsx](../TransitionSlot.tsx)** — two additions:

1. `isProject()` now includes `'marks'`. This means page transitions in and out
   of `/marks` use the project-direction choreography (going deeper from
   `/selected`: ghost exits up, new enters from below; coming back: reversed).
   Without this, transitions would treat `/marks` like `/selected` (flat, no
   dock offset) and land in the wrong spatial register.
2. The ghost-content-dim selector now includes `.route-marks > *` alongside
   `.sheet > :not(.nav-sled)` and `.selected-workbench > *`. `/marks` is a
   continuous document — not a sheet stack — so it needs its own entry in
   that selector or the exit dim silently no-ops. The NOTES comment in
   TransitionSlot.tsx explicitly warns about this.

---

## Route-local, not shared

The six mark SVG components live at
`app/(works)/marks/components/marks/`, not at `app/components/marks/`.

Per [CLAUDE.md](../../../CLAUDE.md): *"A primitive moves into shared the **second**
time it's needed, not the first. Flag the move before doing it."* There is
currently exactly one consumer — `/marks` itself. `/selected`'s archive
references a few of the same project names (Ecochain, Codezeros, Slangbusters)
but draws colored bars and text, not the mark artwork. That's name reuse, not
primitive reuse.

**When to promote:** if a landing-page spotlight, a site-wide tooltip, or any
second route genuinely needs to render the mark artwork, flag the move and
promote to `app/components/marks/` at that point — update all imports in
`app/(works)/marks/` and add a LIBRARY.md entry noting the promotion.

---

## The six marks

Inventory lives in `data/marks.ts`. Fill-in is tracked there with `// TODO`
comments. Metadata fields to resolve before chunk 2 goes live:

- `year`
- `story` (1–2 line caption for the Essay preview row)
- `palette.stopA` / `palette.stopB` / `palette.angle`
- `previewColor` (hover color in the Essay preview row)
- `slides[1..n]` — supporting media for slides 2+ (JPG/GIF/PNG). Paths follow
  `public/marks/<id>/NN.ext` with filename ordering preserved.

Source SVGs ship in `reference/marks-source/` (temporary — deleted with the
brief once the route is shipped). Slide media is pending.

---

## Don't-touch list

- `.route-marks` class on the top-level wrapper — contracted against
  TransitionSlot's ghost-content-dim selector.
- `<Background />` sits at the top of the route's JSX and renders a `fixed`
  layer at `z-index: 0`. Every phase should stay at `z-index: 1` so the
  background reads through but never covers content.
