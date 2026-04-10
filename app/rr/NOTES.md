# /rr — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/rr/`. Update it when an
architectural decision changes — not on every edit.

For project-level rules see `CLAUDE.md`.

---

## Mechanics scene — scroll-bound mat split

Lives in `app/rr/components/Mechanics.tsx` + `app/rr/rr.css` (Phase 2 block, ~line 1185).

### Sticky scene pattern
- `.rr-mech-scene` is **200vh** tall; `.rr-mech-stage` is `position: sticky; height: 100vh`.
- This gives the choreography 100vh of scroll distance while both mats stay glued to the viewport.
- The section itself (`#mechanics`) is structural only: `padding:0; border:none; background:none`.
- `#mechanics::after { display: none }` — the section inherits `.mat`, but its paper-noise pseudo-element would scroll with the 200vh wrapper. Visible mats inside render their own noise via the `.mat` class from `globals.css`.

### CSS variable cascade
- `--rr-mech-progress` is set on the **stage**, not on either mat.
- Reason: the two mats are siblings, and CSS variables do not cross sibling boundaries. Both mats must inherit from a shared ancestor.
- `Mechanics.tsx` writes to `stageRef.current.style`. Do not move this write to a mat.

### The mats translate, they do not resize
- Both mats are **fixed at 678px wide from the start**.
- Primary slides from stage-center → flush-left (`left` interpolated by progress).
- Secondary slides from off-right → 28px-gap from primary's right edge.
- Why: an earlier model resized the primary mat from 100% width down to 678px. It made the grid cells inside the mat appear to be clipped mid-animation, which read as the *paper itself* shrinking. Translating instead of resizing means the grid is never disturbed. Do not reintroduce the resize model.

### `.is-split` visibility gate
- `Mechanics.tsx` toggles `.is-split` on the primary mat when progress crosses ~0.0005.
- The CSS selector `.rr-mat--primary.is-split ~ .rr-mat--secondary` flips the secondary from `visibility: hidden` to `visible`.
- Why: at p=0 the secondary is at `left: 100%` (off the right edge) but its border still renders. Without the gate, you see a stray vertical line at the seam. Do not remove the gate.

### Spring follower
- Pipeline: `useScroll → useTransform([HOLD, 1] → [0,1]) → useSpring → useMotionValueEvent → CSS var`.
- `HOLD = 0.15`: the first 15% of scroll is a dead zone so the user reads the centered mat before anything moves.
- `useSpring` uses the `duration`/`bounce` API (not stiffness/mass) — easier to tune by feel.
- The spring still chases scrollYProgress, so the choreography remains 100% scroll-bound. The spring just adds lag + overshoot.

### Auto-advance on game over
- When the game ends *and* the split hasn't completed *and* the scene is in view, `handleGameOver` smooth-scrolls to the end of the pin.
- Target is computed as `rect.top + window.scrollY + offsetHeight - innerHeight`.
- Do **not** use `scene.offsetTop` — the offset parent is the section, not the document, so `offsetTop` resolves to 0 and the scroll jumps backward. (We hit this bug on the first attempt.)

---

## Global nav coupling — `[data-arrow-target]`

Lives in `app/components/nav/ChapterMarker.tsx:50-51`.

- ChapterMarker's rotating arrow normally points at the sheet's visual center.
- That breaks for sections with a pinned scroll scene (like Mechanics): the section is taller than the viewport, so the section center is always off-screen and the arrow points at nothing useful.
- Fix: ChapterMarker prefers `sheet.querySelector('[data-arrow-target]')` if present, falls back to the sheet itself.
- The Mechanics primary mat carries `data-arrow-target`. The arrow now tracks what the user actually sees.
- **Do not remove the `?? sheet` fallback.** Other routes (like `/biconomy`) do not set the attribute and rely on the fallback for their default arrow behavior.

This is the only global file changed for `/rr`. Treat it as load-bearing for both routes.

---

## Note rail reveal latch

- `noteRevealed` state in `Mechanics.tsx`, persisted in `localStorage` under `'rr-note-revealed'`.
- Hidden until the first game-end, then permanent across visits.
- `justRevealed` is a one-shot flag passed as `playReveal` to `NoteRail` so the entrance animation only plays the very first time, not on every mount.
- Known smell: `setJustRevealed(true)` is called inside the `setNoteRevealed` updater function. Strict Mode may double-invoke updaters. Both side effects (`setJustRevealed`, the localStorage write) are idempotent so it's harmless. Do not "fix" it without checking that the entrance animation still only plays once.

---

## Rejected approaches

Things we tried, removed, and should not bring back without revisiting the original reason:

- **Resize model for the primary mat.** Grid cells inside the mat got clipped mid-animation — read as the paper shrinking. See "translate, do not resize" above.
- **Per-session scroll lock at progress=1.** Locked the user into the end-state once reached, but made scrolling back up feel dead (100vh of pinned scroll with no movement). Removed in favor of fully reversible split.
- **Flex centering of the family inside the stage.** When the mat resized, `justify-content: center` on the stage made the family drift horizontally with the shrinking edge. Replaced with `position: absolute; left: 50%; transform: translate(-50%, -50%)` inside the mat. Now that the mat translates instead of resizes, this is even more correct.
- **Stiffness/damping/mass spring tuning.** Replaced with the `duration`/`bounce` API. Both work; the latter is easier to talk about.

---

## Cards section — shader + grid stacking

Lives in `app/rr/components/Cards.tsx` + `app/rr/components/RugShader.tsx` + `app/rr/rr.css` (~line 908).

### `overflow: clip`, not `hidden`
- `#cards.mat` uses `overflow: clip` to contain the shader within the mat boundary.
- **Do not change to `overflow: hidden`.** `hidden` creates a scroll container that breaks `position: sticky` on ChapterMarker. `clip` clips visually without affecting scroll/sticky behavior.

### RugShader is a mat-level sibling, not a canvas child
- `Cards.tsx` returns a Fragment: `<RugShader />` + `<div className="rr-canvas ...">`.
- Both are direct children of the mat (via Sheet's `{children}`).
- Why: the shader must fill the entire mat height (1128px), but `.rr-canvas` is only 900px tall. Placing the shader inside the canvas left 114px gaps top and bottom. Do not nest the shader back inside the canvas.

### Grid is promoted to `::before`
- `#cards.mat` sets `background-image: none` to suppress the default `.mat` grid.
- The grid is redrawn on `#cards::before` at `z-index: 1` with `mix-blend-mode: color-burn; opacity: 0.4`.
- Why: the shader sits at `z-index: 0`. The default grid is part of `background-image` and can't be z-indexed above the shader. The pseudo-element solves this. Paper noise (`::after`) stays at `z-index: 2`.

### Card fan vertical stagger (`BASE_Y`)
- `CardFan.tsx` uses `BASE_Y = [-4, -12, -14, -9, 2]` alongside `BASE_ROT` for per-card vertical offsets.
- `BASE_Y` feeds into all three transform functions: `restTransform`, `hoverTransform`, `spreadTransform`.
- Values are hand-tuned to match the Figma reference — do not normalize to a computed curve.

---

## Global mat containment (`overflow: clip`)

Added in v0.10.0. `overflow: clip` now lives on the `.mat` base class in `globals.css` — every mat clips its children. This was introduced to prevent the mechanics secondary mat from causing horizontal page scroll, and to enforce the principle that all content lives within its mat.

### Biconomy clipping anomaly

Two biconomy sections have pre-existing content that extends past the mat edge and now clips:

- **ux-audit** — intro surface card clips at the right mat boundary
- **demos** — header card and text clip at the right mat boundary

These are not regressions — the content was always overflowing, just never visually caught. They need layout adjustment during biconomy fine-tuning.

### Why `clip` not `hidden`

`overflow: hidden` creates a scroll container that breaks `position: sticky` on ChapterMarker. `clip` clips visually without affecting scroll/sticky behavior. This was already established for `#cards.mat` — now it's the base rule.

---

## Overlay backseat choreography

Two interactions use a shared "backseat" pattern where background content recedes to give the foreground overlay clear focus:

1. **Intro enlarged scans** — triggered by `data-enlarged` on `.rr-canvas`
2. **Outcome rules panel** — triggered by `data-rules-expanded` on `.rr-canvas--outcome`

### What happens

- Mat background → `var(--blue-960)`
- Background content → `filter: var(--backseat-dim)` + `scale: 0.9` + `pointer-events: none`
- `--backseat-dim` is `brightness(0.68) saturate(0.2)`, defined in `globals.css` — shared with the chapter tray dim in `nav.css`

### Story card + Framer Motion transform

The story card uses Framer Motion inline `transform` (spring-animated `x`, `rotate`, `scale`). The backseat uses the CSS `scale` property (separate from `transform`) to avoid conflict. Do not switch to `transform: scale()` — it would be overridden by FM's inline style.

---

## Don't-touch list (without reading why first)

- `--rr-mech-progress` cascade location — must be on the stage, not a mat
- `.is-split` visibility gate on the secondary mat
- The fixed 678px width of both mats (this is what makes the choreography feel natural)
- `#mechanics::after { display: none }`
- The `?? sheet` fallback in `ChapterMarker.tsx`
- `rect.top + window.scrollY` (not `offsetTop`) in `handleGameOver`
- `overflow: clip` on `.mat` base class — `hidden` breaks ChapterMarker sticky
- `#cards.mat { background-image: none }` + `#cards::before` grid — z-index control over shader
- RugShader as Fragment sibling, not nested inside `.rr-canvas`
- `BASE_Y` values in `CardFan.tsx` — Figma-matched, hand-tuned
- CSS `scale` (not `transform: scale()`) on `.rr-story-card` backseat — FM owns `transform`
