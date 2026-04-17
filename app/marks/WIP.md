# /marks — WIP

> **Temp file.** Delete this once the route ships, or when the next pass
> supersedes the notes below. It's a handoff scratchpad, not canonical docs.

Where the scaffold stands after the exploratory pass. Pairs with
`MARKS_BRIEF.md` (the full build spec) and `NOTES.md` (architectural
don't-touch list).

---

## What landed this pass

**Route shell** — `app/marks/page.tsx`, `layout.tsx`, `marks.css` are in
place. Route is deliberately sibling to `(works)/`, not inside it: `/marks`
is a continuous editorial document, not a sheet-stack project.

**Supporting assets colocated** — brief moved from repo root into
`app/marks/MARKS_BRIEF.md`; the 6 source SVGs moved from
`reference/marks-source/` into `app/marks/_source/` (underscore prefix →
Next.js App Router ignores it at routing time).

**Title dock choreography** (`components/DockedTitle.tsx`)
The `MARKS & SYMBOLS` hero title smoothly docks into the header **before the
essay reaches the top of the viewport**. Implemented as a CSS custom
property `--marks-s` written by a scroll listener; font-size, top offset,
and letter-spacing all `calc()` against it. No framer-motion — that path
produced SSR `NaN` hydration mismatches on first render.

**Essay typography** — reduced to 20px with `line-height: 2.4` and
`letter-spacing: -0.6px`. The doubled line spacing and slightly smaller
body set the editorial register (space + proximity, not density).

**Per-mark reveal sequence** (`components/MarkSection.tsx` + `marks.css`)
The sequence is **color → details → snap**, not "everything at once":

1. **Color first** — `Background.tsx` uses viewport-overlap scoring
   (`(min(rect.bottom, vh) - max(rect.top, 0)) / vh`) to pick the dominant
   section and writes `--marks-bg-stop-a/b/angle` as inline custom
   properties. `@property <color>` registration in `marks.css` makes the
   browser interpolate over 0.9s `--ease-paper`.
2. **Details on more scroll** — each `.marks-section` writes `--mark-p`
   (entry progress 0→1) on scroll. `--content-reveal` is a CSS `clamp`
   over `(p − 0.45) / 0.35`, so carousel/nav/chrome stay hidden until the
   section is ~45% into entry and fade in across the next 35%.
3. **800ms snap** — a hysteresis latch flips `data-settled="true"` at
   `p ≥ 0.85` (and releases at `p ≤ 0.60`). When settled,
   `--content-reveal` is forced to 1 with a 0.8s `--ease-paper` transition,
   so the composition "lands" even if the user stops scrolling mid-reveal.

**Scaffolding inventory** — `page.tsx` renders only Beringer (red) +
Ecochain (olive) right now: `[MARKS[0], MARKS[2]].map(...)`. Two distinct
palettes let the color-morph → details → settle sequence be read at a
glance. Ecochain got a real (placeholder) palette
(`#4CB400 → #0A2E10`) and flipped-mark placeholder slides to exercise the
carousel.

---

## Where we're headed

- **Remaining 4 marks** — Codezeros, Furrmark, Kilti, Slangbusters all
  still have TODO'd year/story/palette/previewColor in `data/marks.ts`.
  Unscaffold `page.tsx` back to `MARKS.map(...)` once palettes are real.
- **Real supporting media** — slides 2+ are currently `{ kind: 'mark',
  flip: 'x' | 'y' }` placeholders. Replace with JPGs/GIFs in
  `public/marks/<id>/NN.ext`.
- **Mobile composition** — not designed yet. Current layout is
  desktop-only. Follow CLAUDE.md responsive rules (recompose, don't
  replicate).
- **NOTES.md refresh** — stale paths. It still references
  `app/(works)/marks/` and shell edits to ShellNav/TransitionSlot that
  reflect an earlier plan. Reconcile against current reality before next
  pass.
- **Copy pass** — essay body, per-mark story lines. Currently
  placeholder.

---

## Known oddities

- **`app/(works)/ShellNav.tsx` and `app/(works)/TransitionSlot.tsx` are
  modified in git status** but the changes are from the earlier plan
  where `/marks` lived inside `(works)/`. Those edits are no longer
  reachable from the current route (it's at `app/marks/`, outside the
  works group). Decide on next pass whether to revert them or re-wire.
- **Preview tool quirks** — IntersectionObserver callbacks don't fire in
  Claude Preview; `preview_screenshot` sometimes renders blank at
  mid-scroll positions even when `getComputedStyle` shows correct state.
  Verified behavior programmatically rather than visually in preview.
