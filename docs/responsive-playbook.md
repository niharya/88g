# Responsive playbook

Decision tree for responsive work on this portfolio. Read this before starting
any pass — retrofit, review, or forward. The companion files are
[`docs/responsive.md`](./responsive.md) for principles and breakpoints, and
[`docs/vocabulary.md`](./vocabulary.md) for what the words map to in code.

---

## Purpose

**Crafted-lite is the policy.** Two layers:

1. **Content and density → lite.** Drop decorative ornaments, reduce
   proof-artifact density, simplify complex grids, remove what won't read at
   375px. This is the floor — if a route doesn't meet it, it isn't shipped.
2. **Composition → crafted.** What remains must be *authored* for mobile, not
   mechanically column-stacked from desktop. Section order, spacing,
   typographic hierarchy, section-to-section rhythm, and touch affordances are
   chosen for the phone — not inherited from desktop and collapsed.

Crafted-lite replaces the old "mobile as a reading fallback" framing. The
usability floor from `docs/responsive.md` still applies; on top of it,
remaining content gets composed with intent. `/marks` is the quality bar for
what *authored-for-mobile* reads like — use it as the reference.

The practical test: if a designer were authoring this section from scratch
for a 375px viewport, what composition would they choose? That is the
crafted answer. Anything less is a retrofit.

---

## Modes of use

This playbook supports two modes. Know which one you're in before you start.

### Autonomous mode

The implementer walks the decision tree alone — reads the shape, picks the
reduction, authors the composition, commits. The checklist below is a gate.
Used for forward passes on new routes where no CD is driving.

### Eyeballed-collab mode (the default now)

A CD points at a shape by eye and directs the change ("this should wrap
sooner", "hide that on mobile", "move the note under the image, not beside
it"). The implementer's job is to:

1. **Translate intent into clean code.** Use the sanctioned techniques below
   as the toolkit. The CD isn't required to know the playbook — they know
   what they want to see.
2. **Push back with alternatives if the ask would require a banned hack.**
   The banned-hacks list is the spine. If the literal ask can't be delivered
   without `scale()` on a canvas, or `!important` outside the React-inline
   gate, or a JS media query for layout — name the constraint, offer the
   nearest clean option in playbook vocabulary, and let the CD redirect.
3. **Log decisions as they happen.** Every eyeballed change that departs
   from the desktop composition gets a line in the route's `ANOMALIES.md`
   under "Responsive anomalies" — what changed, why, which shape or pattern
   it maps to.

The checklist below still applies in collab mode, but as vocabulary, not a
gate. The CD has already answered "what drops out" by pointing. The
implementer still owns questions 6 (touch targets), 7 (React-inline-style
conflict), 8 (tokens), 9 (mat-as-last), 10 (wide artifact) — the invisible
ones.

**Governing principle.** When in doubt, preserve proof over minimalism.
Portfolio integrity > hide-count. If a directed change would leave a
chapter without its evidence, the implementer flags it before cutting.

---

## Before you touch anything — pre-flight checklist

Run through this before writing CSS. Most responsive regressions come from
skipping one of these.

### Read first

- The route's `ANOMALIES.md` — anomalies you cannot see in the code.
- The route's existing `@media (max-width: 767px)` block in full — don't
  patch around what's already there without knowing the shape.
- `docs/responsive.md` — principles, breakpoints, global mobile patterns.
- `LIBRARY.md` for any shared primitive you're about to touch — responsive
  behavior may be owned by the primitive.
- This file — especially the shape the section matches.

### Screenshot and open the route at

- **375px** — the hard floor. Golden-path, scrolled end-to-end, no horizontal
  overflow, all tap targets reachable.
- **430px** — iPhone Pro Max. Sanity check: composition still reads.
- **768px** — tablet edge. If the mobile block covers this correctly, you
  don't need a tablet block.
- **1024px** and **1440px** — desktop parity. Unchanged vs. before. If
  anything moved on desktop, the pass already went wrong.

### Questions to answer *before* writing CSS

1. **What is the reading order on mobile?** Not the DOM order — the order a
   user's eye should follow. Name it.
2. **What drops out?** (ornaments, hover embellishments, decorative rotation,
   dot clusters, ornamental spacers)
3. **What stays and gets authored?** For each remaining element: what tier of
   spacing, what typographic weight, what rhythm to its neighbors?
4. **What scales, what re-anchors?** Scaling preserves desktop coordinates;
   re-anchoring picks new ones. Re-anchor by default; scale only when
   desktop coordinates carry meaning that can't be re-authored. (Under
   crafted-lite, scaling is rarely the right answer — see Banned hacks.)
5. **Is any hover state essential for function on this section?** If yes,
   there must be a touch equivalent (always-visible, or tappable affordance).
   If no, drop it.
6. **Touch targets ≥ 44px?** Every interactive element — links, buttons,
   rail tabs, toggles. Measure in the preview.
7. **Does React write inline `style={{ }}` on any element you're touching?**
   This determines whether the React-inline-style conflict pattern applies
   (see Named patterns). If React writes `transform` from state, CSS needs
   `!important` in the `@media` block — that's the gate. If it doesn't, you
   don't get to use `!important`.
8. **Spacing tokens?** New CSS uses `--space-*`, `--ease-paper` / `--ease-snap`,
   `--dur-*`. Raw px and ms are allowed only for values that express a
   relationship to viewport geometry (e.g. `var(--rr-safe-x): 12px` is a
   page-safe margin, not a spacing step).
9. **Does the section end the route?** If yes, it needs the mat-as-last
   flex chain (Shape 13) so the mat reaches the bottom frame.
10. **Is any artifact wider than `100vw − 2·safe-x`?** If yes, pick from the
    wide-artifact responses (Shape 11). Do not scale to fit.

If a question gets a hand-wave, stop and answer it before writing CSS.

---

## Decision tree by shape

Each shape has the same entry layout:

- **What it is** — how to recognize the shape in code or comp.
- **Desktop assumption that breaks** — why the shape fails at 375px.
- **Reduction decision** — what drops out, what stays. (Lite layer.)
- **Composition decision** — how the remaining content is authored for mobile.
  The `/marks` route is the quality bar.
- **Sanctioned technique** — the mechanism; one-line code shape.
- **Evidence in repo** — where this shape has been resolved before.
- **Verdict** — sanctioned / banned / sanctioned-with-gate.

Shapes cite routes for evidence only. They are route-agnostic — a future
route should be able to use this tree without reinterpretation.

---

### Shape 1 — Absolute-positioned desktop composition

**What it is.** A section where elements live at hand-chosen `top`/`left`
coordinates on the mat. Timeline bars, cards, dots, year labels, artifacts.

**Desktop assumption that breaks.** Absolute coordinates computed from a
desktop-width mat (e.g. `left: 143px`, `top: 64px`) fall outside a 375px
viewport or collide with each other. The spatial relationships that gave the
section meaning (above, beside, nested inside) stop reading.

**Reduction decision.** Drop decorative bars, dots, year columns — anything
whose job was to *show* a relationship rather than carry content. Keep the
cards, the titles, the essential year.

**Composition decision.** Author the linear sequence. Not "flex column with
24px gap." Ask: what's the reading order? Which items want breathing room
before them? Which are tight to what they annotate? Does a year label want
to sit as a caption above its card, or as a tag inline with the meta line?
Pick a spacing tier per transition (`--space-24` between siblings, `--space-48`
between groups, `--space-88` between sections), and stick to it.

**Sanctioned technique.** `position: static` / `relative` on the section
children; `display: flex; flex-direction: column` on the container; `order:`
to re-sequence if DOM order doesn't match reading order. Authored gaps from
`--space-*`.

```css
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-28); /* authored, not default */
}
.section .card { position: static; order: 3; }
.section .year-label { order: 4; color: var(--tone-800); }
```

**Evidence.** [`selected.css:931`](../app/(works)/selected/selected.css:931) —
main timeline recomposed as flex column with explicit `order:` values and a
28px gap. Decorative bars/dots dropped (`display: none`). Year labels kept
but recomposed as inline text markers.

**Verdict.** Sanctioned.

---

### Shape 2 — Scroll-bound pinned scene

**What it is.** A section whose composition *is* the scroll animation.
200vh wrapper, `position: sticky` stage, motion values driving transforms.

**Desktop assumption that breaks.** Scroll-choreography depends on having
viewport-tall vertical space per "phase." On a short mobile viewport the
phases overlap; more importantly, the set-piece was designed *as* a motion
artifact — re-authoring the motion for touch is a product decision, not a
responsive one. This is explicitly de-scoped under the lite floor
(`docs/responsive.md` → Don't-do list).

**Reduction decision.** The scroll motion does not exist on mobile. Either
(a) linearize as authored sibling mats, treating each phase as a standalone
section, or (b) still the scene to its most representative frame and treat
it as a single mat.

**Composition decision.** If linearizing: author each phase as if it were
its own section — title, spacing, artifact, rhythm. Do not just remove
`position: sticky` and let flow dump everything stacked. If stilling:
choose the frame deliberately (most expressive end-state, usually).

**Sanctioned technique.** `height: auto` on the scene; drop `position:
sticky` on the stage; siblings flow as rows. Pair with a `matchMedia`
gate in JS to disable scroll-dependent affordances (first-visit auto-open,
auto-scroll-to-end, spring followers).

```css
.scene { height: auto; }
.stage { position: static; height: auto; display: flex; flex-direction: column; }
```

```ts
const isMobile = typeof window !== 'undefined'
  && window.matchMedia('(max-width: 767px)').matches
if (!isMobile) { /* desktop-only scroll affordance */ }
```

**Evidence.** [`rr.css:2937`](../app/(works)/rr/rr.css:2937) — Mechanics
scene unbound, mats flow as siblings. [`rr ANOMALIES.md:396-399`](../app/(works)/rr/ANOMALIES.md:396)
— JS gates on first-visit auto-open and end-of-game auto-scroll.

**Verdict.** Sanctioned. The linearization itself is a retrofit; under
crafted-lite it would earn an authored per-phase composition.

---

### Shape 3 — Decorative ornaments

**What it is.** Timeline bars, dot clusters, rotated stamps, dashed dividers,
card stacks behind a surface, hand-placed marginalia, "spray" embellishments.
Elements whose job is to *show relationships spatially* or add visual
texture.

**Desktop assumption that breaks.** The spatial relationship these ornaments
encode is invisible once the section linearizes. A "nested bar inside a
longer bar" meant nothing once both bars become `display: none` candidates.
Hand-placed rotations read as placement accidents at narrow widths.

**Reduction decision.** Drop. If the ornament carried meaning (e.g.
timeline bars showed project nesting), replace with an inline text or
color marker in the flow — not a scaled-down version of the ornament.

**Composition decision.** If you're tempted to keep an ornament "just smaller,"
you're retrofitting. Crafted-lite: either re-express the information in
mobile-native form (an inline colored year tag, a textual "during X" phrase),
or accept that the information was a desktop affordance and drop it.

**Sanctioned technique.** `display: none` inside the mobile `@media` block.
Surviving meta information lives in flow with authored typography.

```css
@media (max-width: 767px) {
  .timeline__bars,
  .timeline__dots,
  .timeline__label-now { display: none; }
  .timeline__year-tag { color: var(--tone-800); font-size: 12px; }
}
```

**Evidence.** [`selected.css:942`](../app/(works)/selected/selected.css:942)
— bars, dot clusters, "Now" label all dropped; year labels survive as
recomposed inline text markers. [`rr.css:2928`](../app/(works)/rr/rr.css:2928)
— intro card-stack, enlarged artwork, expand affordance all dropped.

**Verdict.** Sanctioned.

---

### Shape 4 — Multi-column / wide-gap editorial row

**What it is.** A row of two or more items with large horizontal gaps —
preview rows, card pairs, tab grids, comparison pairs.

**Desktop assumption that breaks.** Horizontal composition expresses the
relationship (parallel, opposed, sequential). At 375px there is no
horizontal axis to compose against.

**Reduction decision.** How many items survive on mobile? Not always all
of them. Sometimes three becomes one hero + "more" link. Sometimes four
demos become two.

**Composition decision.** Pick one of three shapes, deliberately:

1. **Vertical rhythm with authored per-item breathing.** When each item
   deserves its own reading block. Gap is chosen (`--space-48`,
   `--space-56`) to give each item room without over-separation. This is
   the `/marks` Essay preview pattern — 48px between preview items is the
   chosen cadence, not a default.
2. **Horizontal swipe strip.** When scanning is the point — a row of
   related artifacts a user browses, not reads. Use native overflow scroll
   with `overscroll-behavior-x: contain` and `touch-action: pan-x`. The
   content inside must be authored for the strip; do not scale desktop
   content down to fit (Shape 11 / banned hacks).
3. **Hero + collapsed.** When one item dominates and the others support.
   Surface the hero; collapse the others behind a tappable "more" affordance.

**Sanctioned technique.** For pattern 1:

```css
.row {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-48); /* chosen, not inherited */
}
```

For pattern 2: see Shape 11 — but only for natively-mobile content.

**Evidence.** Pattern 1: [`marks.css:661`](../app/marks/marks.css:661) —
Essay preview rows flip to column with 48px gap; desktop 435px / 1136px
gaps do not scale.

**Verdict.** Sanctioned.

---

### Shape 5 — Hover-revealed affordance

**What it is.** Something that appears, moves, highlights, or activates on
`:hover`. "Opens in new tab" pills, hover-dim cross-references (via
`:has(:hover)`), hover-to-play icons, tooltip pops.

**Desktop assumption that breaks.** Touch has no persistent hover. Stale
`:hover` lingers after a tap; `:has(:hover)` chains leave the rest of the
section ghosted until the user taps somewhere else.

**Reduction decision.** Is the affordance essential to function?

- **Decorative** (hint pill, push-apart nudge, hover-dim ambient) → drop.
- **Essential** (play icon that reveals the only way to see a video) →
  surface by default on touch, or replace with an explicit tap target.

**Composition decision.** If surfacing by default, author the always-on
state — don't just leave a transparent button with no label. If replacing,
the tap target is explicitly authored (labeled, sized ≥ 44px, visible).

**Sanctioned technique.** Drop the affordance; reset any `:has(:hover)`
dim chains so a sticky tap doesn't leave the UI in the dimmed state.

```css
@media (max-width: 767px) {
  .entry__hint { display: none; }
  .panel:has(.entry:hover) .entry { filter: none; translate: 0 0; }
}
```

**Evidence.** [`selected.css:1123`](../app/(works)/selected/selected.css:1123)
— `.ap-entry__hint` dropped; hover dim and push-apart reset.

**Verdict.** Sanctioned.

---

### Shape 6 — Nav marker pair docked to top frame

**What it is.** `ProjectMarker` + `ExitMarker` (works routes) need to sit
as a pair at the viewport top, tucked under the 4px black frame. They are
independent React components — no shared parent to flex-center.

**Desktop assumption that breaks.** Desktop positions both markers absolutely
relative to the workbench. On mobile they need to be viewport-docked and
visually paired.

**Reduction decision.** Both markers stay — they are part of the lite floor.

**Composition decision.** Two sub-patterns, pick by component wiring:

- **Measured-widths center pair** — when two independent components need to
  abut and center as a unit. Measured marker widths into CSS vars; computed
  `left` for each.
- **Single sticky with negative margin-top** — when it's one row already
  (e.g. `/selected`'s `.selected-nav-row` wrapper exists). Sticky at
  `top: 0` with negative margin-top equal to `--workbench-pad-y` so the
  initial paint sits flush with viewport top.

**Sanctioned technique (measured pair).**

```css
@media (max-width: 767px) {
  .workbench:has(.route-x) {
    --route-project-marker-w: 151px; /* measured */
    --route-exit-marker-w:    85px;
    --route-pair-offset: calc((var(--route-project-marker-w) + var(--route-exit-marker-w)) / 2);
  }
  .workbench:has(.route-x) .project-marker {
    position: fixed; top: 0; z-index: 40;
    left: calc(50vw - var(--route-pair-offset));
  }
  .workbench:has(.route-x) .exit-marker {
    position: fixed; top: 0; z-index: 40;
    left: calc(50vw - var(--route-pair-offset) + var(--route-project-marker-w));
  }
}
```

**Sanctioned technique (sticky row).**

```css
.route-nav-row {
  position: sticky; top: 0;
  margin-top: calc(-1 * var(--workbench-pad-y));
  z-index: 40;
}
```

**Evidence.** Measured pair: [`rr.css:2759`](../app/(works)/rr/rr.css:2759).
Sticky row: [`selected.css:875`](../app/(works)/selected/selected.css:875).

**Verdict.** Sanctioned. Re-measure the marker widths if marker copy or padding
changes — the computed pair drifts off-center otherwise.

---

### Shape 7 — Chapter marker (nav-sled) per mat

**What it is.** `ChapterMarker` rendered inside each `.sheet` / mat via the
`.nav-sled` slot. On desktop it docks via `useDockedMarker` math.

**Desktop assumption that breaks.** The sled's desktop absolute positioning
falls outside the mat on mobile; its coordinate-system math does not hold.

**Reduction decision.** Marker stays.

**Composition decision.** In-flow, centered, with a small buffer from the
top of the mat (`margin-top: var(--space-16)`). Per-chapter exceptions
*only* when the mat's first content block would collide — e.g. an absolute
surface card at `top: 48px`, or a structural-only section (like the
Mechanics scene) whose first visible mat isn't the chapter section itself.

**Sanctioned technique.**

```css
.route-x .nav-sled {
  position: relative;
  margin-top: var(--space-16);
  display: flex; justify-content: center;
  width: 100%; height: auto;
  transform: none;
}
/* Exception: section whose first content overlaps */
.route-x #chapter-a .nav-sled {
  position: absolute; top: 0; left: 0;
}
```

**Evidence.** [`rr.css:2788`](../app/(works)/rr/rr.css:2788) — in-flow
default. Exceptions at lines 2808 (`#intro`, canvas pushed down) and 2820
(`#mechanics`, pinned absolute so the marker lands inside the first visible
mat).

**Verdict.** Sanctioned.

---

### Shape 8 — Responsive copy (different phrasing per viewport)

**What it is.** Copy that reads naturally on desktop is too long on mobile
("Works from the previous portfolio" → "Previous portfolio").

**Desktop assumption that breaks.** One copy string can't serve both
widths when phrasing is the variable.

**Reduction decision.** Shorter phrasing on mobile.

**Composition decision.** Craft the mobile phrasing — don't truncate. "Prev"
is not a crafted response.

**Sanctioned technique.** Two-span visibility flip. Both strings rendered
in JSX; CSS toggles `display`.

```tsx
<span className="label--desktop">Works from the previous portfolio</span>
<span className="label--mobile">Previous portfolio</span>
```

```css
.label--mobile { display: none; }
@media (max-width: 767px) {
  .label--desktop { display: none; }
  .label--mobile  { display: inline; }
}
```

**Evidence.** [`selected.css:690-694`](../app/(works)/selected/selected.css:690),
[`Timeline.tsx:252-253`](../app/(works)/selected/components/Timeline.tsx:252).

**Verdict.** Sanctioned. The two strings have no shared source of truth —
add a `<ResponsiveCopy>` primitive if the pattern proliferates to a second
route.

---

### Shape 9 — Semantic content hidden on desktop, surfaced on mobile

**What it is.** Content that is semantically part of an element's meaning
(e.g. the year in a "Role • Company • Year" meta line) but is redundant on
desktop because a parallel visual element already carries it (e.g. a
dedicated year label column).

**Desktop assumption that breaks.** Dropping the parallel visual element on
mobile (per Shape 3) would remove the information entirely.

**Reduction decision.** Leave the content in the DOM on desktop; toggle
visibility at the breakpoint so it surfaces when the visual carrier is gone.

**Composition decision.** The content has to be correct at both viewports —
this is a semantic mirror, not a mobile-only string. Copy discipline:
write the meta line as the source of truth; the desktop-only visual label
*derives* from it.

**Sanctioned technique.**

```tsx
<span className="meta">
  Product Designer • Connektion<span className="meta__year"> • 2021</span>
</span>
```

```css
.meta__year { display: none; }
@media (max-width: 767px) { .meta__year { display: inline; } }
```

**Evidence.** [`selected.css:686`](../app/(works)/selected/selected.css:686)
(desktop hides) and [`selected.css:1118`](../app/(works)/selected/selected.css:1118)
(mobile surfaces). See also [`selected ANOMALIES.md:531`](../app/(works)/selected/ANOMALIES.md:531)
on the desktop/mobile semantic mismatch this introduces for assistive tech.

**Verdict.** Sanctioned with the caveat that the content is already in the
DOM on both viewports. This is *not* a license for arbitrary
desktop-hidden-mobile-shown content tricks — the semantic payload must be
correct at both widths.

---

### Shape 10 — Rail drawer (tucked-under side panel)

**What it is.** A side panel docked under the edge of a parent artifact —
labels visible at rest, content revealed on click via a transform. Both
`/rr` rails and the BIPs notes rail are instances.

**Desktop assumption that breaks.** The open transform places the panel
using desktop coordinates — usually a translate that lands it to the side
of a wide artifact. On mobile, those coordinates send the panel off-screen
or misaligned with the shrunken artifact.

**Reduction decision.** Is the rail essential? If yes, keep. If its only
job was marginalia (a loose design note), drop under lite.

**Composition decision.** Recompute the open/closed transforms *for the
mobile coordinate system*. Don't carry desktop values. Pick the resting
position so the tab peeks past the visible edge of its parent; pick the
open position so the content lands on-screen, over the parent. These are
authored values, not scaled ones.

**Sanctioned technique.** Override the transforms in the mobile `@media`
block, scoped to the rail. If the consumer writes the transform as
`style={{ transform }}` from React state, `!important` is required — see
Named patterns → React-inline-style conflict.

```css
/* If state is className-driven (no inline style): */
@media (max-width: 767px) {
  .route-x .rail { transform: translateX(0) rotate(1deg); }
  .route-x .rail.is-open { transform: translateX(-50px) rotate(0deg); }
}

/* If state is inline-style-driven: add !important with the gate comment. */
```

**Evidence.** `/rr` rails carry the inline-style conflict — see
[`rr.css:3007-3022`](../app/(works)/rr/rr.css:3007) and
[`rr ANOMALIES.md:88-113`](../app/(works)/rr/ANOMALIES.md:88) for the reason.
`/biconomy` BIPs rail is className-driven (no conflict) —
[`BIPs.tsx:104`](../app/(works)/biconomy/components/BIPs.tsx:104) applies
`is-open` to the rail's className string.

**Verdict.** Sanctioned. `!important` only under the React-inline-style gate.

---

### Shape 11 — Horizontally-wide reading content

**What it is.** An artifact wider than the mobile viewport — a screenshot,
a rules panel, a comparison table, a wide diagram.

**Desktop assumption that breaks.** The content was authored at
desktop-artifact width (1200px, 1349px). Squeezing it into 375px produces
illegibility; scaling it down produces a miniature that reads as "this was
desktop content shrunk."

**Reduction decision.** Can the content be represented differently on
mobile? Options, in order of preference:

1. **Re-authored asset.** A narrower version of the same artifact, authored
   at mobile widths. A smaller screenshot, a re-rendered table, a
   representative crop.
2. **Representative still.** A single hero frame of the wide content with
   a caption. The reading cost of "scroll sideways through a miniature"
   is often higher than the gain.
3. **Horizontal swipe strip with native-mobile content.** Acceptable *only*
   if the inner content is authored for the strip (not scaled down
   desktop). Scanning-focused content: a row of card previews, a photo
   strip, a tab carousel.

**Composition decision.** The artifact is re-expressed, not scaled. Author
for mobile if budget allows; otherwise accept reduction.

**Sanctioned technique (swipe strip with native content).**

```css
.wide {
  overflow-x: auto;
  overscroll-behavior-x: contain;
  touch-action: pan-x;
}
.wide::-webkit-scrollbar { display: none; }
```

**Banned.** Desktop-width content with inner `transform: scale(0.5)`.
See Banned hacks.

**Evidence.** Crafted example: [`marks.css:661`](../app/marks/marks.css:661)
— Essay preview flipped to vertical column with authored gap. Retrofit
example (flagged for reauthor): [`rr.css:3225-3258`](../app/(works)/rr/rr.css:3225)
— rules-group swipe strip with inner `scale(0.5)`. Shipped under old lite;
would be recomposed under crafted-lite.

**Verdict.** Option 1 and 2 sanctioned. Option 3 sanctioned only with
native-mobile authored content. Scaled-down desktop content inside a
strip is banned.

---

### Shape 12 — Mat full-bleed

**What it is.** Mat extends to viewport edges on mobile; content inside
respects the safe margin.

**Desktop assumption that breaks.** Desktop mats have visible left/right
borders and sit inside workbench padding. On mobile, the safe margin is
too narrow to give both the mat border *and* the content padding
breathing room — the mat reads as a thin band.

**Reduction decision.** Drop left/right mat borders on mobile.

**Composition decision.** Mat reaches viewport edges; content inside
sits within `--workbench-pad-x`. The sheet re-adds that padding so
content respects the safe column even though the mat bleeds past it.

**Sanctioned technique.**

```css
@media (max-width: 767px) {
  .route-x .mat {
    width: calc(100% + 2 * var(--workbench-pad-x));
    margin-left:  calc(-1 * var(--workbench-pad-x));
    margin-right: calc(-1 * var(--workbench-pad-x));
    border-left: none;
    border-right: none;
  }
  .route-x .sheet {
    padding-left: var(--workbench-pad-x);
    padding-right: var(--workbench-pad-x);
  }
}
```

**Evidence.** [`rr.css:2736`](../app/(works)/rr/rr.css:2736),
[`selected.css:907`](../app/(works)/selected/selected.css:907).

**Verdict.** Sanctioned.

---

### Shape 13 — Mat-as-last-element (flex chain)

**What it is.** The final mat of a route should fill remaining viewport
height, so the paper grid surface meets the bottom 4px frame and the
workbench background doesn't peek through.

**Desktop assumption that breaks.** On desktop the mat has enough content
to be tall. On mobile, if the last mat's content is short (an archive,
an outcome card), the mat ends mid-viewport and the workbench background
orphans below it.

**Reduction decision.** None — structural.

**Composition decision.** Three-link flex chain: workbench → layout →
mat, each declaring `flex: 1` or `flex: 1 0 auto` where appropriate. The
final mat bleeds to the bottom frame via negative `margin-bottom` equal
to `--workbench-pad-y`.

**Sanctioned technique.**

```css
@media (max-width: 767px) {
  .route-x .workbench {
    min-height: calc(100vh - 2 * var(--workbench-pad-y));
    display: flex; flex-direction: column;
  }
  .route-x .sheet-stack {
    flex: 1;
    display: flex; flex-direction: column;
  }
  .route-x #last-chapter { flex: 1 0 auto; display: flex; flex-direction: column; }
  .route-x #last-chapter > .mat {
    flex: 1 0 auto; min-height: 0;
    margin-bottom: calc(-1 * var(--workbench-pad-y));
  }
}
```

**Evidence.** [`rr.css:2714-2746`](../app/(works)/rr/rr.css:2714) (sheet-stack chain),
[`selected.css:852-920`](../app/(works)/selected/selected.css:852) (layout chain).

**Verdict.** Sanctioned. Any sibling added *after* the last mat inside the
layout chain will steal the grow and orphan the mat.

---

### Shape 14 — Derived CSS values that can't be expressed with clamp()

**What it is.** A CSS property whose value depends on two axes —
typically, a scroll-interpolated value that also needs a viewport-dependent
range. `font-size: calc(hero - (hero - docked) * var(--scroll))`.

**Desktop assumption that breaks.** `clamp(min, ideal, max)` handles a
single-axis fluid scale. It cannot express "hero size shrinks to docked
size as scroll progresses, and the hero size itself depends on viewport."

**Reduction decision.** None — it's a derived expression.

**Composition decision.** Per-viewport endpoints. On mobile, choose a new
hero size and a new docked size; let the derivation formula keep its
shape.

**Sanctioned technique.** Re-declare the property inside a breakpoint with
a breakpoint-scoped linear formula.

```css
.hero-title {
  font-size: calc(104px - 64px * var(--scroll, 0)); /* desktop */
}
@media (max-width: 767px) {
  .hero-title {
    font-size: calc(56px - 32px * var(--scroll, 0)); /* mobile */
  }
}
```

**Evidence.** [`marks.css:646`](../app/marks/marks.css:646) — MarksTitle
dock interpolation re-declared at mobile widths.

**Verdict.** Sanctioned when `clamp()` genuinely can't express the formula.
Verify this before reaching for the pattern — most derived values can be
expressed in `clamp()` with some algebra.

---

### Shape 15 — Content overlay clipped at mat bottom (or edge)

**What it is.** A decorative element (hand overlay, torn edge, ghost
sketch) positioned to bleed past its parent mat; the mat's `overflow:
clip` produces the bleed effect.

**Desktop assumption that breaks.** The overlay's desktop position assumes
a mat of known aspect ratio. On mobile the mat reshapes — if the overlay
keeps its desktop `bottom: -150px` it lands in a different visual relation
to the scaled artifact.

**Reduction decision.** If decorative and not carrying meaning: drop. If
the bleed is essential to the composition (the overlay represents a hand
holding a physical card, and the bleed is the card-in-hand effect):
re-anchor.

**Composition decision.** Re-anchor for the mobile coordinate system.
Shift the anchor point (e.g. from bottom-left to mid-left), pick a new
transform-origin, pick new translates. Don't preserve desktop edge-clipping
coordinates — they encode a relationship to a mat that no longer exists.

**Sanctioned technique.**

```css
@media (max-width: 767px) {
  .overlay {
    bottom: auto;
    top: 42%;
    left: 0;
    transform-origin: 0% 50%;
    transform: translate(-160px, -50%) rotate(90deg) scale(0.88);
  }
}
```

**Evidence.** [`rr.css:3089-3100`](../app/(works)/rr/rr.css:3089) — deck-fan
overlay re-anchored from bottom-pinned to mid-left for mobile storycard.

**Verdict.** Sanctioned when the re-anchor is authored. Carrying desktop
coordinates with scale adjustment is not — that's a retrofit.

---

## Named patterns

### React-inline-style conflict

A named cluster for the specific case where CSS needs `!important` to beat
a React-driven inline `style={{ }}`. This is the **only** sanctioned reason
to use `!important` in responsive passes.

**The gate.** `!important` is sanctioned *if and only if* a React consumer
writes `style={{ transform, opacity, ... }}` on the element from state,
and the CSS rule needs to override that inline style inside a `@media`
block. Without this gate, `!important` becomes an excuse.

**Why it happens.** Inline styles have higher specificity than any
class-based CSS rule. When desktop logic writes `style={{ transform:
'translateX(210px) rotate(0deg)' }}` from an `isOpen` state, the mobile
`@media` block can't redirect that transform without `!important`.

**How to apply.**

1. Confirm the consumer writes inline style. Read the component — look for
   `style={{ }}` on the target element.
2. In the CSS override, add `!important` *only* on the properties that
   conflict (usually just `transform`), not as a blanket suffix.
3. Leave a comment noting the gate, so a later reader understands why.

```css
/* Inline style from React state — !important beats it, only here. */
@media (max-width: 767px) {
  .route-x .rail            { transform: translateX(0)   rotate(1deg) !important; }
  .route-x .rail.is-open    { transform: translateX(-50px) rotate(0deg) !important; }
  .route-x .rail            { transition: transform 0.95s var(--ease-paper) !important; }
}
```

**Where it applies (in this repo, today).**

- `/rr` rails — `RulesRail.tsx` and `NoteRail.tsx` both write
  `style={{ transform }}` from React state. See
  [`rr ANOMALIES.md:74-113`](../app/(works)/rr/ANOMALIES.md:74) for why the
  rails *can't* use a `.is-open` CSS rule or Framer Motion here.
- `/rr` outcome card — scroll-linked Framer Motion inline style on
  `.rr-outcome-card` and `.rr-rules-group`. `transform: none !important;
  opacity: 1 !important` in the mobile block forces rest state because
  the scroll range collapses. See [`rr.css:3207-3216`](../app/(works)/rr/rr.css:3207).

**Where it does NOT apply.**

- `/biconomy` BIPs — rail state is className-driven (`is-open` toggled on
  className). No inline style, no `!important`.
- Any consumer where React drives state by adding/removing classes, not
  by writing `style={{ }}`.

**If you're tempted to use `!important` outside this gate**, you are
almost always fighting specificity from a different source. Raise the
selector specificity, move the rule later in source order, or scope more
tightly — do not reach for `!important`.

---

## Sanctioned techniques (consolidated)

Single reference of what you can reach for in a crafted-lite pass.

| Technique | Use for | Token shape |
|---|---|---|
| `flex-direction: column` + authored gap | Linearize an absolute or multi-column composition | `gap: var(--space-24)` etc. |
| `order:` on flex children | Re-sequence when DOM order ≠ reading order | integer values per child |
| `display: none` on decoratives | Drop ornaments whose spatial meaning doesn't carry | inside `@media` block |
| Two-span visibility flip | Different copy per viewport | `.x--desktop` / `.x--mobile` pair |
| DOM-present / display-toggle year | Semantic content that surfaces only when visual carrier is gone | `display: none` → `display: inline` at breakpoint |
| Mat full-bleed (width + neg margin) | Edge-to-edge mats on mobile | `calc(100% + 2 * var(--workbench-pad-x))` + matching neg margins |
| Mat-as-last flex chain | Final mat fills remaining viewport height | three `flex: 1`/`1 0 auto` links; neg `margin-bottom` |
| Sticky nav row with neg margin-top | Single-row marker tucks under 4px frame | `position: sticky; top: 0; margin-top: calc(-1 * var(--workbench-pad-y))` |
| Measured-widths center pair | Two independent marker components abut as one unit | `--marker-w` CSS vars + computed `left` |
| In-flow chapter marker with per-chapter absolute exception | `.nav-sled` placement per mat | `position: relative; margin-top: var(--space-16)` default; `position: absolute` exception |
| Horizontal swipe strip (native-mobile content only) | Scanning-focused row of native-authored items | `overflow-x: auto; touch-action: pan-x; overscroll-behavior-x: contain` |
| Scene unbind | Release scroll-pinned scenes to sibling flow | `height: auto` on scene; drop `position: sticky` on stage |
| `matchMedia` gate in JS | Disable desktop-only JS affordances on mobile | `window.matchMedia('(max-width: 767px)').matches` at call site |
| Breakpoint-scoped linear formula | Derived CSS values `clamp()` can't express | `calc(A - B * var(--signal))` inside `@media` |
| Re-anchored overlay | Decorative bleeds that need new coordinates | new `top`/`left` + new `transform-origin` |
| Hover-dim chain reset | Undo `:has(:hover)` ambient effects on touch | `filter: none; translate: 0 0` in mobile block |
| `!important` under the React-inline-style gate | Beat inline `style={{ }}` from React state | *only* with the gate; see Named patterns |

---

## Banned hacks

Do not use these under crafted-lite. Existing instances flagged in the
retrofit-review below.

### `transform: scale()` on text

Produces sub-pixel rendering and breaks line-height / letter-spacing
relationships. Use `font-size: clamp()` or a breakpoint-scoped value.

### `!important` without the React-inline-style gate

If there is no inline `style={{ }}` to beat, `!important` is a specificity
hack. Raise specificity or re-scope the rule instead.

### `transform: scale()` on a whole authored canvas

The clearest retrofit tell — preserving desktop composition at a miniaturized
scale. Produces content that reads as "this was desktop, shrunk." If a
desktop composition can't live on mobile without being scaled, the mobile
version should be authored differently — not miniaturized.

Under the old lite stance this was sanctioned-with-conditions (rr intro,
cards, secondary mat). Under crafted-lite it is banned for new work.

### Horizontal scroll strip with inner `scale(0.5)` on desktop-width content

Same retrofit tell as the preceding, scoped to scan-scroll strips. Scaling
a 1349×653 panel down and letting users swipe through the miniature is
not a mobile composition — it is the desktop composition shrunk.

Strips are sanctioned (Shape 11, option 3) *only* if the inner content is
natively authored for mobile. Re-author or accept reduction.

### Mobile-only class names for scaling

`.section--mobile` as a class that carries desktop-coordinate + scale
pattern. Caution: mobile-only class names are OK for *recomposing* (the
two-span flip, the year folded inline). They are not OK for introducing
scaled desktop composition.

### JS media queries for layout

`useEffect` / `useState` branches that render different layouts based on
`window.innerWidth`. Risks hydration mismatch and produces a flash of
wrong layout before hydration. Use CSS `@media` for layout; use
`matchMedia` only for JS *behaviors* (disabling a scroll animation, gating
a localStorage auto-open).

### `transform: scale()` on decorative ornaments "to fit"

If an ornament doesn't fit, drop it (Shape 3). Don't shrink it.

### Arbitrary hidden DOM tricks

`display: none` on content that differs between viewports, producing a
semantic mismatch between desktop and mobile for screen readers. Sanctioned
only for Shape 9 (DOM-present-year pattern), where the content is correct
for both viewports and just rendered differently.

---

## Per-route field notes

Three modes live under one heading. Routes are either in forward-pass
mode, retrofit-review mode, or reference-only.

### `/biconomy` — forward pass (pending)

**Mode.** Forward pass. The first crafted-lite pass on `/biconomy` is the
reference application that accompanies this playbook (BIPs chapter). The
remaining chapters are not covered. Populate this entry with per-chapter
notes as each one gets its pass.

**Pass log.**

- BIPs chapter — *populated by the reference pass alongside this playbook*.
  See [`/biconomy ANOMALIES.md`](../app/(works)/biconomy/ANOMALIES.md) →
  "Responsive anomalies".

### `/rr` — retrofit-review

**Mode.** Retrofit-review. The existing mobile block shipped under the old
lite stance; classify each authored hack without fixing. `/rr` is a
reference for *mechanics learned* (scroll unbind, matchMedia gate,
measured-pair docked markers, React-inline-style conflict discovery) — not
for composition quality. The composition bar is `/marks`.

**Flagged items.**

- **Shape 11 retrofit — rules-group horizontal swipe strip with inner
  `scale(0.5)`.** `rr.css:3225-3258`. Shipped under old lite; banned under
  crafted-lite. Would be recomposed as a mobile-authored rules summary
  (hero rule + "open full rules" affordance, or native-mobile asset). No
  fix now; flagged for future reauthoring.
- **Shape 11 retrofit — Cards section scales full 1440×900 canvas to
  viewport (`--rr-cards-scale: 0.5`).** `rr.css:3121-3180`. Shipped under
  old lite; banned under crafted-lite. Would be re-authored as a mobile
  card-fan composition. Flagged.
- **Shape 15 retrofit — Intro storycard scaled from 430×624 to viewport
  via `--rr-intro-scale`.** `rr.css:2891-2928`. Same retrofit pattern.
  Flagged.
- **Shape 15 retrofit — secondary mat storycard scaled via
  `translateX(-50%) scale((100vw - ..) / 384 * 0.85)`.** `rr.css:3065-3082`.
  Same retrofit pattern. Flagged.
- **Pending — Manufacturing Consent font for `' lite'` badge.** Already
  documented in `rr ANOMALIES.md` as pending SVG replacement. Not a
  crafted-lite issue per se; a token-discipline issue.
- **Sanctioned-under-playbook.** Scene unbind (Shape 2), chapter marker
  in-flow with per-chapter exceptions (Shape 7), measured-pair docked
  markers (Shape 6), mat full-bleed (Shape 12), mat-as-last flex chain
  (Shape 13), React-inline-style gate on rails and outcome-card (Named
  patterns). No action.

### `/selected` — retrofit-review

**Mode.** Retrofit-review. Existing mobile block is mostly compliant with
crafted-lite. Composition decisions (linearize main timeline, fold year
into meta, drop bars and dots, re-author archive panel as flow list) are
deliberate.

**Flagged items.**

- **Sanctioned-under-playbook.** Shape 1 (absolute timeline linearized to
  flex column with `order:`), Shape 3 (timeline bars / dot clusters /
  "Now" label dropped), Shape 5 (hover hint hidden, `:has(:hover)` dim
  reset), Shape 6 (sticky nav row with neg margin-top), Shape 8 (archive
  toggle label two-span flip), Shape 9 (year folded into meta line),
  Shape 12 (mat full-bleed), Shape 13 (mat-as-last chain). No action.
- **Minor retrofit-with-gate — project-card footer absolute → static.**
  `selected.css:984-1030`. Absolute card internals pulled to static flow
  with author gaps. Sanctioned under Shape 1; no action.
- **No banned-but-shipped items identified.**

### `/` (landing) — retrofit-review

**Mode.** Retrofit-review. Landing uses authored mobile positions via
per-viewport CSS variables (`--hero-top`, `--projects-top`, `--spectrum-top`,
etc.) rather than reflowing. This is its own pattern — the landing is a
single spatial composition at all widths, just re-authored per viewport.

**Flagged items.**

- **Sanctioned-under-playbook (extension).** Landing's per-viewport
  authored-position pattern is a local instance of Shape 1's composition
  layer — instead of linearizing to flex, the composition stays spatial
  and the coordinates are re-authored per breakpoint. Not mechanical, not
  miniaturized. `landing.css:1200-1303`. No action.
- **Sanctioned — component-level width overrides.** `.hero-card`,
  `.about-card`, `.spectrum`, `.contact-card` drop to `width: 100%` with
  authored padding. Shape 1 linearization at the component level. No action.
- **Caution — `scale(0.9)` on `.landing--default .landing__section--*`.**
  `landing.css:1242`. This is a *pre-enter* state (sections are collapsed
  before the user expands the landing), not a mobile scale-down of a
  desktop composition. Compositional, not a retrofit. No action; note for
  future readers.
- **No banned-but-shipped items identified.**

### `/marks` — reference-only

**Mode.** Reference-only. Built responsive-ready from day one. Do not
retrofit. Do not copy its exact breakpoint values — each route authors its
own. Copy its **quality bar**: authored gaps, breakpoint-scoped derived
formulas, per-viewport asset decisions, no retrofits.

**Quality signals.**

- `flex-direction: column` on essay preview rows is paired with a
  *chosen* 48px gap, not a default (`marks.css:661`).
- Title scale is a breakpoint-scoped linear formula (Shape 14), not a
  naive `clamp()` (`marks.css:646`).
- BlankSection + HeroClone stay at 100vh on every viewport — they are
  dominance candidates for the wrap-on-dock teleport; shrinking them
  below `DOMINANCE_RATIO` (0.72) would make the wrap unreachable
  (`marks ANOMALIES.md` → "Responsive anomalies").
- Mark carousel already uses `min(…vw, …px)` — no mobile override needed.
- No tucked marker because `/marks` doesn't use the works nav shell; the
  title itself is the nav.

**Do not touch.**

---

## When to break the playbook (and how to log it)

The playbook is not a law. It is evidence distilled from shipped work. If
a section you're authoring matches none of the 15 shapes, or a shape's
sanctioned response clearly won't hold, you may author a new response —
but log the decision so the next reader can reason about it.

**How to log it.**

1. **In the route's `ANOMALIES.md`** under "Responsive anomalies": describe
   the section, the shape you tried, why it broke, and the new response
   you chose. Cite lines.
2. **In this playbook, if the pattern is likely to repeat**: either extend
   the matching shape (add a new "Sanctioned technique" variant) or add a
   new shape entry. The playbook should grow from evidence, not speculation
   — one instance is an anomaly, two instances is a shape.
3. **Flag in the per-route field notes** as a new item with its
   classification (sanctioned-with-gate, banned-but-shipped, etc.).

**What not to do.**

- Don't silently invent a new technique. A pattern that isn't in this
  file and isn't logged in `ANOMALIES.md` has no gate — the next reader
  cannot tell whether it's a considered choice or a shortcut.
- Don't force a section into a shape that doesn't fit. A misfit entry
  weakens every other entry.
- Don't promote a one-off to this playbook. Wait for the second instance.

### Under eyeballed-collab mode specifically

When the CD proposes a response outside the 15 shapes, the implementer's
job is to build it *if* it can be built with sanctioned techniques. If not,
the order of operations is:

1. Name the constraint out loud (e.g. "that ask needs `scale()` on the
   canvas, which is banned under crafted-lite").
2. Offer the nearest clean alternative in playbook vocabulary (e.g.
   "re-authored asset, representative still, or column-linearize with
   authored gap").
3. Let the CD pick, redirect, or accept the compromise.
4. Log the outcome in `ANOMALIES.md` with enough detail that the next
   reader can tell it was a considered choice, not a shortcut.

Never build a banned hack to satisfy an eyeballed ask. The CD is directing
the surface; the implementer holds the floor.
