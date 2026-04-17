# /rr — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/(works)/rr/`. Update it when an
architectural decision changes — not on every edit.

For project-level rules see `CLAUDE.md`.

---

## Mechanics scene — scroll-bound mat split

Lives in `app/(works)/rr/components/Mechanics.tsx` + `app/(works)/rr/rr.css` (Phase 2 block, ~line 1185).

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

Lives in `app/components/nav/useDockedMarker.ts:53-54`.

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

## Rails use inline `transform`, not Framer Motion or class-based CSS rules

Both `RulesRail.tsx` and `NoteRail.tsx` drive the open/close transform via the `style` prop in JSX — not via `motion.div` `animate`, and not via a `.is-open` CSS rule. The CSS only carries the transition timing:

```css
.rr-rules-rail { transition: transform 0.55s var(--ease-paper); }
.rr-note-rail  { transition: transform 0.55s var(--ease-paper); }
```

And the open state is written inline from React state:

```tsx
style={{ transform: isOpen ? 'translateX(163px) rotate(0deg)' : 'rotate(1deg)' }}
```

### Why not Framer Motion?
The rails sit inside `.rr-mech-family`, which consumes `--settle-scale/opacity/rotate` from `useMatSettle`. In that parent context, `motion.div` with an `animate={{ x, rotate }}` prop writes `transform: none` instead of the computed matrix — the rail never moves. FM still works elsewhere in `/rr` (story card, outcome card, rules-group). Specifically inside the mat-settle-driven family it does not.

### Why not a `.is-open` CSS rule?
Same parent context. CSS `transform` transitions on a child of `.rr-mech-family` stay in the `pending` animation state (`currentTime: 0`) and never progress. The final state applies only after a reflow. Inline style, read by the browser as an always-fresh declaration, side-steps this — the transition does kick in on state change.

### Why the game-board nudge is also inline, not CSS `:has()`
Initially the board's nudge was driven by a CSS `:has(.rr-{rules,note}-rail.is-open)` rule. It hit the *same stalled-transition bug* the rails have: the board sits inside `.rr-mech-family`, and CSS `transform` transitions on any child of that family stay in the `pending` animation state (`currentTime: 0`, `playState: running` forever) and never progress. The transition only works via inline style, which the browser reads as an always-fresh declaration each render.

So the board transform lives on the React side: rail open state is lifted to `Mechanics.tsx` (`rulesOpen`, `noteOpen`), and the `.rr-game-board` div carries an inline `transform: translate(-Npx, 0)` driven by that state. The two rails require asymmetric nudges — **rules-open is -12px**, **note-open is -50px** — so the open note has breathing room on the right side of the mat.

### Cross-rail follow-nudge
When one rail opens, the game board nudges left (amount depends on which rail — see above). The **other, tucked** rail also has to translate the same amount so it still reads as glued to the board edge.

Each rail accepts `otherOpen` + `onOpenChange` props and folds `otherOpen` into its own inline transform calculation:

- **NoteRail** tucked + rulesOpen ⇒ `translateX(-12px) rotate(1deg)` (matches the -12 board nudge for rules-open).
- **RulesRail** tucked + noteOpen ⇒ `translateX(-50px) rotate(1deg)` (matches the -50 board nudge for note-open).

All three elements (board, rules, note) use the same 0.55s `--ease-paper` transition so they glide together. The nudge values are load-bearing triples — if you change the board's inline nudge in `Mechanics.tsx`, update the matching TSX `CLOSED_NUDGED_TRANSFORM` constant in the *other* rail, *and* recompute `OPEN_TRANSFORM` for the opening rail so it lands flush with the nudged board edge. (Open math for the note: `note.left_base (129) + translate = board.right_nudged (389 − 50 = 339)` → `translate = 210`.)

### If you refactor:
- Keep the `style` prop writing an absolute transform string. Swapping to `translate:` individual property will break (the property is silently ignored on this element — we tested it).
- Keep the `transition: transform 0.55s var(--ease-paper)` on the base CSS rule, not on `is-open`. Transitions need to live on the element state that's present at both endpoints.
- Do not reintroduce `motion.div` for the rail's open/close. If it seems tempting, re-read this note and test in a preview *inside* the mat-settle family.

---

## Rejected approaches

Things we tried, removed, and should not bring back without revisiting the original reason:

- **Resize model for the primary mat.** Grid cells inside the mat got clipped mid-animation — read as the paper shrinking. See "translate, do not resize" above.
- **Per-session scroll lock at progress=1.** Locked the user into the end-state once reached, but made scrolling back up feel dead (100vh of pinned scroll with no movement). Removed in favor of fully reversible split.
- **Flex centering of the family inside the stage.** When the mat resized, `justify-content: center` on the stage made the family drift horizontally with the shrinking edge. Replaced with `position: absolute; left: 50%; transform: translate(-50%, -50%)` inside the mat. Now that the mat translates instead of resizes, this is even more correct.
- **Stiffness/damping/mass spring tuning.** Replaced with the `duration`/`bounce` API. Both work; the latter is easier to talk about.

---

## Cards section — shader + grid stacking

Lives in `app/(works)/rr/components/Cards.tsx` + `app/(works)/rr/components/RugShader.tsx` + `app/(works)/rr/rr.css` (~line 908).

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

## Hand overlay always clips at mat bottom

The `.rr-story-card__deck-fan` overlay (the photo of a hand holding a fan of
physical cards, inside the mechanics StoryCard) is a **layout rule, not a
tuning value**: the hand must always extend past the mat's bottom edge so
the mat's `overflow: clip` crops the wrist/forearm cleanly. A hand that
floats fully inside the mat with empty space below reads as accidental
placement — the intentional design is "card overlay spills past the mat,
mat clips it."

Enforced by `bottom: -150px` on `.rr-story-card__deck-fan` (rr.css, under
the Story Card block). The value is intentionally generous — enough that
the hand stays clipped even if the card moves vertically within the mat by
a small amount, or the mat height changes within viewport ranges we care
about.

### If you touch this, re-check:
- Mat height. The secondary mat is 100vh; its absolute height changes with
  the browser viewport. `-150px` must still land the hand past mat-bottom.
- `.rr-story-card--mechanics` vertical position. Currently `top: calc(50%
  - 344px)`. Raising the card lifts the hand with it — `bottom` may need to
  grow more negative.
- `.rr-mat--secondary` `overflow`. Must remain clipping (inherited from
  `.mat` base class in globals.css). Do not set it to `visible`.
- The scale/rotate transform in the same rule — a bigger scale enlarges the
  rendered hand; the bottom offset anticipates scale: 1 at p=1.

### Why not compute from the mat bottom instead?
`bottom: -N` is simple, stable, and one value to reason about. Computing
from the mat would require coupling this rule to mat height via a CSS
variable, which nothing else needs. Keep the offset fixed and generous.

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

## Outcome ticker — unified translate + scrollLeft

Lives in `app/(works)/rr/components/Outcome.tsx` (motion-state block) +
`app/(works)/rr/rr.css` (ticker rules).

The bottom-edge ticker is **JS-driven**, not CSS-keyframe driven. Cruise is
a `useAnimationFrame` loop advancing a `trackX` motionValue by a `velocity`
motionValue each tick; hover brakes `velocity` to 0 over 0.9s with
`--ease-paper`; hover-out springs `velocity` back to `-segW/18` with
`stiffness 110, damping 14, mass 1`.

### The coordinate-system trick

Before the refactor, CSS `@keyframes rr-ticker-scroll` drove the track's
`translateX` and the container's native `scrollLeft` ran independently.
When the user scrolled manually to the end, the two stacked and exposed
up to `segW` of empty space past the last copy.

The JS version unifies them into a single state machine (`running`,
`stopped`, `transitioning`, `scrolling`):

- **On first user scroll** — current translate is transferred into
  `scrollLeft` (`scrollLeft += -trackX; trackX = 0`), `velocity` is
  forced to 0, mode flips to `scrolling`. One coordinate system now.
- **On 650ms scroll-idle** — `scrollLeft` is folded back into `trackX`
  via `trackX = -(scrollLeft mod segW)`, `scrollLeft` resets to 0, the
  spring-start fires again. Cruise resumes from the visual position.

The modulo is load-bearing: without it, folding `scrollLeft` straight
into `trackX` would snap the visible copy backward by up to `segW`.

### Intentional overshoot — deviation from `bounce: 0`

The hover-out spring is tuned for **~12% overshoot** — a kick on restart
— at the user's explicit request ("small bounce, like a train starting").
This is a deliberate deviation from CLAUDE.md's paper-motion rule of
`bounce: 0` / no overshoot. Do not normalize it to a critically damped
spring or to the `duration`/`bounce` API with `bounce: 0`. If you
retune, keep the ~10–15% overshoot envelope.

### `overscroll-behavior-x: contain`

On `.rr-outcome-ticker` to stop Mac/iOS rubber-band from bouncing the
whole page horizontally when the user flicks the ticker at its extremes.
Do not remove.

### If you touch this, re-check:
- `segW` (segment width) is measured from a rendered copy. Changing the
  number of copies or the copy layout invalidates the fold math.
- The `scrolling` → `running` handoff depends on `velocity` being 0
  throughout manual scroll. Any code that writes to `velocity` during
  `scrolling` mode will cause a visible jump at idle.
- The CSS `@keyframes rr-ticker-scroll` block and the `animation` /
  `animation-play-state: paused` rules on `.rr-outcome-ticker__track`
  were **removed**. Do not reintroduce them — they would race the JS
  loop and bring back the stacked-coordinate bug.
- The hover brake uses `--ease-paper` (0.9s); the spring uses numeric
  stiffness/damping/mass. Mixing eases here is intentional — brake is a
  controlled stop, restart is a physical kick.

---

## Section entrance animations

`rr.css` no longer has a page-level entrance sequence (the `rr-mat-enter`,
`rr-marker-descend`, `rr-content-settle` keyframes were removed). Section
entrances are now handled by two systems:

- **Hard load / scroll:** `useReveal` hook on Sheet + `.section-reveal` CSS in
  globals.css. Three-phase stagger: mat → content → chapter marker.
- **Client-side navigation:** TransitionSlot animates the first sheet directly
  via Web Animations API (same stagger choreography), then adds `.revealed` to
  hand off to CSS. Below-fold sheets reveal on scroll via useReveal.

Route-specific entrance timing can be customized in `rr.css` by overriding
`--reveal-delay`, `--reveal-y`, or the content/marker transition-delays on
specific sheet IDs.

---

## RR card shadow tokens — route-scoped, not the global ladder

Lives at the top of `rr.css` as `--rr-card-shadow-{rest,lifted,flat,hover}`.

RR cards sit on the rug shader (dark, saturated, high-contrast) — not on the
cream `.mat` that the rest of the portfolio uses. The global elevation ladder
(`--shadow-flat` / `-resting` / `-raised` / `-overlay` in `globals.css`) is
calibrated for cream and would read as washed-out foam on the rug.

The RR card tokens carry:

- **Steeper alpha** (0.22–0.52 vs the global 0.10–0.26)
- **Horizontal bias** (`-2px` / `-3px` X-offset) — matches the rug's overhead-
  raking-light vibe; globals ladder casts straight-down
- **Larger blur radii** — cards feel suspended on a soft surface, not planted

Used by `.rr-story-card` (resting), `.rr-north-star-card` (flat),
`.rr-constraints-card__inner` (flat), `.rr-interface-desktop__img` (lifted),
`.rr-interface-notes` (rest), `.rr-outcome-card` (lifted).

**Do not migrate these to the global ladder.** The separation is intentional:
the global ladder is paper-on-cream, the RR tokens are paper-on-rug.

---

## RugShader palette is CSS-coupled

The GLSL palette in `app/(works)/rr/components/RugShader.tsx` (`COLOUR_1` /
`COLOUR_2` / `COLOUR_3`) was picked against the green-grain reference and is
used by `rr.css` as the reading environment for RR cards. There is a comment
block in `rr.css` at the top of the cards section noting this coupling.

If you change any of the three GLSL colors, re-check:
- card backgrounds and borders in the cards sheet (all `.rr-*-card` surfaces)
- story card callout and text-bold weights (they rely on contrast against rug)
- the `--rr-card-shadow-*` alpha ladder (darker rug may need heavier shadows)

Shader port credit: direct GLSL port of localthunk's Balatro background
(Shadertoy `XXtBRr`), tuned slower (`SPIN_SPEED 3.0` vs original `7.0`) and
softer (`CONTRAST 3.0` vs `3.5`) for a reading environment instead of a game
loop. See also the `COLOPHON.md` at the repo root.

---

## Responsive anomalies

### Lite stance summary

`/rr` carries a retrofit-lite pass (≤767px). Desktop is unchanged. The page grows taller on mobile — each chapter recomposes vertically and preserves its desktop content instead of collapsing or replicating the scaled canvas. Anything below is a deviation or constraint future passes should inherit rather than reinvent.

### Chapter nav — per-section sticky sled with absolute pill

`.route-rr .nav-sled` is `position: sticky; top: 0; height: 0; width: 100%` under mobile and sits inside each `.sheet.mat.section-reveal`. `.route-rr .chapter-nav` is `position: absolute; top: 0; right: 12px` inside that sled, so the chapter pill sits tucked against the right edge of the top frame alongside the project pill.

Critical: `position: fixed` would normally be simpler, but every chapter mat carries `transform` (from `section-reveal`'s translateY reveal — which never returns to `transform: none` after settling) and `overflow: clip` (from the `.mat` base class). Transform ancestors trap `fixed` into their containing block, and `overflow: clip` doesn't block `sticky` resolution against the root scroll container. Sticky is the only mechanism that works here without restructuring JSX to move the sled outside the mat. Each chapter has its own sled, so the pill visible in the viewport always corresponds to the currently-scrolled chapter.

Exit marker is dropped on mobile (`display: none`) — the project pill alone is the exit affordance.

### Mechanics — rails keep their flip-out mechanic; auto-behaviors gated off

The scroll-bound 200vh mat split is unbound on mobile: scene height goes `auto`, `useScroll`-driven progress is inert, primary and secondary mats stack as flow siblings. The rails (`.rr-rules-rail`, `.rr-note-rail`) preserve their desktop content and flip-out behavior, but their **open-state transform** is rewritten in CSS: desktop slides them +163/+210px off the right edge of the board; mobile slides them `-118px/-238px` so the opened sheet lands on-screen inside the 375-wide viewport. The inline style set by the React component is beaten with `!important` here.

Tab peek z-index: `.rr-rules-rail__tab` and `.rr-note-rail__tab` get `z-index: 6; position: relative` so the scorecard that overlaps the board's right edge doesn't eat the tap target. The **full rail** stays at default z-order when closed (so its content tucks behind the board) and promotes to `z-index: 5` only when `.is-open`.

Two JS affordances are gated off by `window.matchMedia('(max-width: 767px)')` — both in `Mechanics.tsx`/`RulesRail.tsx`:

- **Rules first-visit auto-open** (1s delay). Skipped on mobile — competes with initial scroll. On mobile the first click on the rail treats firstVisit as "open + mark seen" in one tap, not "dismiss then re-open" (otherwise the user would have to click twice).
- **End-of-game auto-scroll** to the secondary mat. Skipped on mobile — there is no scroll-bound split to advance to; primary and secondary are sibling blocks, so the scroll jump hijacks the user's position.

Arrow/icon states: when open on mobile, `.rr-rules-rail__arrow` rotates 180° and `.rr-note-rail__tab-icon::before` swaps content to `'close'`.

### Cards — scaled fan + flip-out Interface notes rail

The `Cards` tab keeps its desktop 1200px absolute layout (card positions at `left: 376–864px`). On mobile `.rr-cards-body` gets `overflow: hidden` as a clipping stage, and `.rr-card-fan` gets `width: 1200px; transform: scale(calc((100vw - 2 * var(--rr-safe-x)) / 1200px)); transform-origin: top left`. The fan is a `position: absolute; inset: 0` child of the body so the 1200px layout box doesn't expand the body's scroll width.

Critical: the scale calc **must** divide by `1200px` (length / length = number), not `1200` (length / number = length, which is invalid in `scale()` and falls back to `none`). Earlier pass used `/ 1200` and the transform silently no-op'd.

The `Interface` tab's details panel is promoted to a flip-out rail mirroring the Mechanics note-rail mechanic: `.rr-interface-notes` is `position: absolute; top: 50%; left: auto; right: calc(-1 * var(--rr-safe-x))` inside `.rr-interface-panel`. The `left: auto` override is load-bearing — desktop sets `left: 980px`, which wins over `right` in LTR mode unless explicitly unset. The rail's children (`__frame`, `__body`, `__details`) are desktop-absolute; on mobile they're re-flattened to a flex column with the details label absolute in the top-left corner.

`position: fixed` is **not** viable here either — the rail sits inside the same transform chain as the nav-sled. Absolute-in-panel works because `.rr-interface-panel` is the nearest positioned ancestor and is itself un-transformed.

### Outcome — card edge-to-edge, rules panel horizontally swipeable

`.rr-outcome-card` is pulled out of absolute (`position: relative; inset: auto; width: 100%`) with its scroll-linked entrance force-reset: `transform: none !important; opacity: 1 !important` — the sweep-in maps to a scroll range that collapses when the mat is flow-sized.

`.rr-rules-group` (the 1349×653 rule-card grid) is the main recomposition: it becomes a horizontal scroll strip. The group itself gets `overflow-x: auto; touch-action: pan-x`, and the inner panel keeps its `transform: scale(0.5); transform-origin: top left` so the rules read at roughly half scale. The `.rr-rules-label` header sits as a `position: sticky; left: 0` block at the top of the group with `width: calc(100vw - 2 * var(--rr-safe-x))`, so it stays viewport-wide regardless of the group's 1349-wide scroll extent and doesn't stretch or scroll horizontally with the panel.

### Post-game storycard mat — shrunk card, re-seated fan

The secondary mat (fed by `<StoryCard>` after game-over) takes a mobile-specific treatment: `.rr-story-card--mechanics` gets `max-width: 320px; padding: 92px 14px 24px; margin: 0 auto` so text reads inside the narrow viewport, and `.rr-story-card__deck-fan` is resized to `width: 180px; bottom: -80px; left: -10px; transform: rotate(-12deg) scale(0.9)` so the hand/deck artwork doesn't clip the mat's left edge.

### Intro storycard edge-to-edge

`#intro .rr-story-card` is pulled out of its desktop absolute placement (`position: relative; transform: none !important; width: 100%; padding: 32px 20px`). The peripheral embellishments — expand affordance, card stack, enlarged artwork — drop out under lite (`display: none`), matching the decorative-elements-drop-out rule in the lite stance.

### Mat full-bleed pattern

`.route-rr .mat` gets `width: calc(100% + 2 * var(--workbench-pad-x))` with matching negative horizontal margins, so each mat stretches frame-to-frame. The sheet re-adds the workbench horizontal padding so content inside the mat still respects the safe margin. `#outcome` uses the flex-chain mat-as-last-element pattern to fill remaining viewport height.

---

## Don't-touch list (without reading why first)

- `--rr-mech-progress` cascade location — must be on the stage, not a mat
- `.is-split` visibility gate on the secondary mat
- The fixed 678px width of both mats (this is what makes the desktop choreography feel natural)
- `#mechanics::after { display: none }`
- The `?? sheet` fallback in `ChapterMarker.tsx`
- `rect.top + window.scrollY` (not `offsetTop`) in `handleGameOver`
- `overflow: clip` on `.mat` base class — `hidden` breaks ChapterMarker sticky
- `#cards.mat { background-image: none }` + `#cards::before` grid — z-index control over shader
- RugShader as Fragment sibling, not nested inside `.rr-canvas`
- `BASE_Y` values in `CardFan.tsx` — Figma-matched, hand-tuned
- CSS `scale` (not `transform: scale()`) on `.rr-story-card` backseat — FM owns `transform`
- `.rr-story-card__deck-fan` bottom offset (must always clip at mat bottom) — see "Hand overlay always clips at mat bottom"
- Outcome ticker coordinate-fold: `-(scrollLeft mod segW)` on scroll-idle, and `scrollLeft += -trackX` on first scroll — either alone is wrong
- Outcome ticker hover-out spring `stiffness 110, damping 14, mass 1` — intentional ~12% overshoot per user request, not a normalization candidate
- The absence of `@keyframes rr-ticker-scroll` in `rr.css` — do not re-add a CSS animation to `.rr-outcome-ticker__track`
- `.rr-card-fan` mobile scale divisor is `1200px`, not `1200` — unitless divisor makes `scale()` invalid
- `.rr-interface-notes` mobile `left: auto` override — desktop `left: 980px` wins over `right` without it
- Mobile `matchMedia` gates in `RulesRail.tsx` (first-visit auto-open skip + one-click open-on-first-visit) and `Mechanics.tsx` (auto-scroll-to-storycard skip) — reinstating any of these on mobile fights the flow-sized layout
- The `.nav-sled` sticky+absolute split on mobile — `fixed` is trapped by `section-reveal` transform, `sticky` inside `overflow: clip` still works because it resolves against the root scroll container
- `.rr-rules-rail.is-open` / `.rr-note-rail.is-open` z-index is scoped to open-state only — promoting closed-state rails above the board leaks their content onto the game face
