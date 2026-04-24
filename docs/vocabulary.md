# Object vocabulary

The words we use to describe the portfolio's structural primitives. Design
language on the left, code identifier on the right. Read this when a piece of
feedback or a commit message names something and you're not sure which class /
component it points to.

---

## Workbench

The page-level field. Everything else sits on it.

- **Visual role:** the desk surface. Cream/paper color, 8px black viewport
  frame on desktop (4px on mobile), consistent padding from viewport edge.
- **Code:** `.workbench` in `globals.css`. Tokens: `--workbench-bg`,
  `--workbench-pad-x/y`, `.workbench::before` for the frame.

## Mat

The grid-paper surface **at any scale**. Base primitive.

- **Visual role:** a graph-paper sheet with subtle noise and grid lines.
  `overflow: clip` — nothing escapes the mat.
- **Code:** `.mat` in `globals.css`. Tokens: `--mat-bg`, `--mat-grid-size`,
  `--mat-line-color`, `--mat-line-weight`. Noise is a PNG data URI on
  `.mat::after`.
- **Appears at three scales:**
  - **Chapter-scale mat** → see **Sheet** below.
  - **Route-scale mat** → e.g. `.selected-mat.mat` (full-route grid surface).
  - **Secondary mat inside a chapter** → e.g. rr Mechanics'
    `.rr-mat--primary.mat` and `.rr-mat--secondary.mat`.

## Sheet

A chapter-scale **composition** of a mat with chapter chrome.

- **What it adds to the mat:** top/bottom padding (enforced), left/right
  padding (softer), a stroke, the three-phase section-reveal choreography,
  and the nav-sled slot for `ChapterMarker`.
- **Code:** `.sheet` in `globals.css`; `Sheet.tsx` in `app/components/`.
  Rendered as `section.sheet.mat.section-reveal`. Tokens:
  `--sheet-padding-x/y`, `--sheet-border`, `--sheet-bleed`.
- **Informal phrasing:** *"each chapter has a mat"* — the chapter container
  you think of as "the mat" is in code a sheet (which IS a mat plus chrome).

## Surface

The content panel that sits on top of a mat. This is what Biconomy's **blue
sheets** actually are in code.

- **Visual role:** the content card. Colored fill (`--surface-color`, which
  defaults to `--blue-80`), no noise, optionally bordered, optionally
  shadowed.
- **Code:** `.surface` in `globals.css`. Token: `--surface-color` (override
  per route). Variants: `.surface--shadowed`.
- **Note on naming:** your design language says "sheet" for these; the code
  says "surface." Both are fine; the table below maps the two.

## Rail

A sheet-like side panel tucked under a parent. Only the label is visible
until clicked; opening pushes the parent slightly and reveals the rail's
content.

- **Visual role:** note/annotation drawer docked to a chapter surface.
- **Code:** currently route-local — `NoteRail.tsx` + `RulesRail.tsx` in rr,
  Flows rail in biconomy. Scheduled for promotion to
  `app/components/Rail/` (see `LIBRARY.md`).

## Marker

The docked nav system. Three components, one shared slot.

- **Visual role:** small markers docked to the top of the viewport.
  `ProjectMarker` is persistent across the route; `ChapterMarker` updates
  per section; `ExitMarker` is the back-to-index affordance.
- **Code:** `app/components/nav/` — `ProjectMarker.tsx`,
  `ChapterMarker.tsx`, `ExitMarker.tsx`, `MarkerSlot.tsx`,
  `useDockedMarker.ts`. LIBRARY calls the group "Nav cluster."

## Story card (rr, informal)

Not a code primitive — a design-language family. In rr: the Intro card with
the inset button, the Mechanics game board, the Mechanics secondary-mat
toggle card, and the Cards chapter Scorecard. Only the Scorecard is
currently implemented behind a `StoryCard.tsx` component.

---

## Quick mapping table

| Design language | Code identifier |
|---|---|
| "the workbench" | `.workbench` |
| "the mat" (chapter container) | `.sheet.mat` (Sheet.tsx) |
| "a mat" (generic grid surface at any scale) | `.mat` |
| "a blue sheet" / "content panel on the mat" | `.surface` |
| "a rail" | route-local rail components (pending promotion) |
| "a marker" (chapter / project / exit variant) | three separate components under `app/components/nav/` |
| "a story card" | design-language family; only Scorecard is coded |

---

## Why not rename the code to match the language?

Renaming `.surface` → `.sheet` would flip the meaning of the existing
`.sheet` class and touch every consumer. The names in code came from the
sheet-stack metaphor (`.sheet` is the paper chapter container) and are
load-bearing in LIBRARY.md and `Sheet.tsx`. Documenting the mapping is
cheaper and accurate.
