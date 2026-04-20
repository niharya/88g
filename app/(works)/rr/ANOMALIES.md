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

## Post-mechanics sheet gap doubled

```css
.route-rr #mechanics ~ .sheet { margin-top: calc(var(--stack-gap) * 2); }
```

The mechanics sheet is dense (board + rails + post-game storycard). Every
sheet that follows it (Cards, Outcome) gets a doubled top margin so the
stack breathes after the density. Uses the general sibling combinator
(`~`) so it applies to every following sheet, not just the immediate one.

Shared across desktop and mobile — the rule sits above the media query.
If the sheet ordering ever changes so that mechanics is not followed by
further sheets, this rule becomes inert (no-op) rather than wrong.

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

### Mobile open transforms live inline, not in CSS
Mobile (<768px) needs different open-state offsets than desktop — desktop's `translateX(163px)` for rules and `translateX(210px)` for note run the panels off the right edge of the 520px-wide mech-family. Early mobile work overrode these via CSS `.route-rr .rr-rules-rail.is-open { transform: … !important }` rules; they appeared to *land* on the final transform but never transitioned — the exact stall described above. The rails sat inside `.rr-mech-family` so the CSS-driven transition hit `playState: pending / currentTime: 0` and the class swap looked instant.

Current path: each consumer (`RulesRail.tsx`, `NoteRail.tsx`) reads `matchMedia('(max-width: 767px)')` into state and branches to an `OPEN_TRANSFORM_MOBILE` constant. Closed-state nudges (`CLOSED_NUDGED_TRANSFORM`) are skipped on mobile — the board doesn't nudge there. The transform channel stays the same inline `style.transform` the browser accepts as a fresh declaration, so the `transition: transform var(--dur-glide) var(--ease-paper)` on the base CSS rule actually runs.

Mobile constants (keep in sync with `.rr-mech-family` mobile layout):
- Rules open: `translateX(-50px) rotate(0deg)` — pulls the body left over the board.
- Note open: `translateX(0) rotate(0deg)` — note's base `left: 129` already lands it on the board face.

If you change the mobile mat width or rail base `left` values, recompute these offsets. Do not move them back into CSS — they will stall.

### Shared shell: `Rail.tsx`
Both rails render through a shared stateless shell at `app/(works)/rr/components/Rail.tsx` (see `LIBRARY.md` → Rail). The shell owns: class composition (`is-open`, `is-revealing`), the whole-rail button mode toggled by `onToggle`, and emitting `onOpenChange`. The **transform string itself is still computed in each consumer** — the pixel math (210, 163, -12, -50) is tuned per the rail's position in the coordinate system and cannot be shared. The anomaly rules above (inline transform, no `motion.div`, no `.is-open` CSS transform rule) still hold because the shell passes `style={{ transform }}` through unchanged.

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

### Nav-sled left — route-scoped override on mobile

The shared formula in `nav.css` positions the sled relative to the sheet's viewport-left, which it derives as `workbench-pad-x − sheet-bleed` (i.e. the sheet bleeds out by `--sheet-bleed`). On `/rr` mobile the sheet is recomposed so its margin-left is `-workbench-pad-x` instead of `-sheet-bleed` (see `.route-rr .mat` and sheet overrides in rr.css) — this puts the sheet's viewport-left at 0. The shared formula assumes −24px, lands 10px short, and a visible gap opens between the project pill and the chapter pill when docked.

Mobile-only override:

```css
.route-rr .nav-sled {
  left: calc(var(--project-marker-right) - 2px);
}
```

This sits inside the `@media (max-width: 767px)` block and gives the chapter pill's 2px border a 2px overlap onto the project pill's 2px border — matching desktop's docked-border-halving geometry. Desktop is untouched and still uses the shared formula.

If `/rr` mobile sheet margin is ever brought back in line with `-sheet-bleed`, delete this override. If the shared formula is rewritten to read actual sheet geometry instead of token-based arithmetic, this override becomes redundant.

### Nav pills — use shared defaults, no route-specific overrides

`/rr` uses the shared nav pill system for content and behavior — no route-scoped pill markup, no route-scoped tray logic, no route-scoped docked detection. Project + Exit are fixed to the viewport corners via `app/components/nav/nav.css`; Chapter is sticky inside each `<Sheet>` via `.nav-sled`. Token recomposition at ≤767px happens through `:root`-scoped overrides in `globals.css` plus two workbench-scoped overrides in rr.css (`--workbench-pad-x: 12px` and `--marker-top: 8px` under `.workbench:has(.route-rr)`).

One documented carve-out exists: **`.route-rr .nav-sled { left }`** — see the next section. It's a geometry-only override forced by `/rr`'s mobile mat recomposition, not a re-positioning of the pill itself.

**Do not reintroduce per-route pill positioning beyond that.** A previous pass centre-docked Project + Exit as a pair (via measured `--rr-project-pill-w` / `--rr-exit-pill-w` tokens), pulled the chapter pill into flow inside each mat, and added per-chapter absolute overrides for `#intro` and `#mechanics` — all deleted in v0.30.0. See `LIBRARY.md` → "Nav pill system" and `app/components/nav/README.md` for the full rationale and rejected approaches.

### Mechanics — rails: tab peeks past board's right edge; opens onto board

The scroll-bound 200vh mat split is unbound on mobile: scene height goes `auto`, `useScroll`-driven progress is inert, primary and secondary mats stack as flow siblings. Rails (`.rr-rules-rail`, `.rr-note-rail`) keep their desktop content and click-to-flip behavior, but the closed and open transforms are rewritten in CSS so the visible rest position has the rail body tucked under the board with only the tab peeking past the board's right edge:

- **Closed**: both rails sit at their natural desktop positions (`translateX(0)`); the body lies under the board (board is z:4, rails default z), and the tab — which protrudes past the rail body's right edge — is the only visible element. Game board is `position: relative; z-index: 4`; tabs are `z-index: 6` so they remain tappable above the scorecard.
- **Open**: rules slides `translateX(-50px)` so the panel lands on top of the board; note slides `translateX(0)` (already in position). Both promote to `z-index: 5` when `.is-open`.

The inline-style transform set by the React component is beaten with `!important`. Transition is `transform 0.95s var(--ease-paper)` — same easing token as everything else, longer duration for the rail-glide feel.

Stacking ladder is local and tight (board:4 / rail-open:5 / tab:6). Adding any new positioned sibling under `.rr-mech-family` should explicitly land outside this band or the closed-state tuck breaks.

Two JS affordances are gated off by `window.matchMedia('(max-width: 767px)')` — both in `Mechanics.tsx`/`RulesRail.tsx`:

- **Rules first-visit auto-open** (1s delay). Skipped on mobile — competes with initial scroll. On mobile the first click on the rail treats firstVisit as "open + mark seen" in one tap, not "dismiss then re-open" (otherwise the user would have to click twice).
- **End-of-game auto-scroll** to the secondary mat. Skipped on mobile — there is no scroll-bound split to advance to; primary and secondary are sibling blocks, so the scroll jump hijacks the user's position.

Arrow/icon states: when open on mobile, `.rr-rules-rail__arrow` rotates 180° and `.rr-note-rail__tab-icon::before` swaps content to `'close'`.

### Cards — whole canvas scaled to viewport

Instead of recomposing the cards/interface layout, the entire authored 1440×900 canvas is preserved and scaled. `--rr-cards-scale: 0.5` on `#cards.mat` sets the rendered scale; `.rr-canvas--cards-evo` keeps its desktop dimensions and gets `transform: translateY(...) scale(var(--rr-cards-scale)) !important; transform-origin: top left` (the `!important` beats the sweeping `.route-rr .rr-canvas` mobile reset above). Canvas is positioned at `left: calc(50vw - 720px * var(--rr-cards-scale))` so the title (canvas-x 720) sits on viewport midline. Mat is `min-height: 100vh; height: max(scaled-canvas + 96px, 100vh)` so the shader background reads full-bleed.

Title and tab font-sizes are bumped (44/22/24px) inside `.rr-canvas--cards-evo` to compensate for the 0.5 down-scale and stay readable at mobile widths. Card-fan items are nudged inward 10% (`left: 403/513/650/747/843px`) so the fan reads slightly more grouped.

**`-33px` mobile lift.** The canvas `transform` on mobile is `translateY(calc(-450px * var(--rr-cards-scale) - 33px))`. The −450 × scale term vertically centres the scaled canvas inside the mat; the extra −33 physical px is an eyeballed lift that nudges the whole block (header + body) upward for breathing room under the chapter pill. Scaled-px lives inside the `calc`'s first term; physical-px outside — don't merge them.

`.rr-interface-notes` only gets `cursor: pointer` on mobile — no flip-out rail mechanic. Tap behavior comes for free from the desktop component.

### Outcome — card edge-to-edge, rules panel horizontally swipeable

`.rr-outcome-card` is pulled out of absolute (`position: relative; inset: auto; width: 100%`) with its scroll-linked entrance force-reset: `transform: none !important; opacity: 1 !important` — the sweep-in maps to a scroll range that collapses when the mat is flow-sized.

`.rr-rules-group` (the 1349×653 rule-card grid) becomes a native horizontal scroll strip on mobile: `overflow-x: auto; overflow-y: visible; overscroll-behavior-x: contain; touch-action: pan-x pan-y` (page-vertical scroll still works). Scrollbar is hidden via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }`. The inner panel keeps `transform: scale(0.5); transform-origin: top left` so rules read at half scale, with `margin-right: calc(-1349px * 0.5)` and `margin-bottom: calc(-653px * 0.5)` collapsing the layout box to the visual size. The `.rr-rules-label` uses `position: sticky; left: 0; width: calc(100vw - 2 * var(--rr-safe-x))` so the caption stays viewport-wide and pinned to the left edge while the panel scrolls independently. An earlier iteration used Framer drag with elastic spring-back (`.rr-rules-dragwrap` wrapper, `dragConstraints`, `bounceStiffness/Damping`) — reverted because the drag felt laggy vs. native momentum scroll.

### Cards — interface tab stays inside the scaled canvas

The interface tab does **not** escape the scale(0.5) canvas. This is deliberate: the title, tabs, subtitle slot, shader background, and mat height must stay identical between the cards tab and the interface tab. Switching tabs should feel seamless — only the body content changes, and the body content is repositioned in canvas-px so it fits inside the scaled viewport.

Earlier iterations let the interface tab exit scale (flex-column flow, auto height, tightened gutter, typography resets, tuck-in notes). That approach was reverted: the constant-chrome requirement is the contract now. If you're tempted to break out of scale again — don't. Reposition in canvas-px instead.

- `.rr-canvas--cards-evo[data-tab='interface']` overrides only `overflow: visible`. Everything else about the canvas — position, size, transform, scale — is inherited from the shared cards-canvas rule. `overflow: visible` exists so the expanded notes body can extend below canvas-y 900 into the mat (mat still clips at its bottom).
- `.rr-interface-desktop` is repositioned in canvas coords: `left: 377; top: 248; width: 686; height: auto`. Visible canvas-x on a 375px viewport is roughly `[345, 1095]`, so left 377 + width 686 centers with ~16px physical gutter each side; height:auto lets the image preserve its natural aspect (image is also set to `height: auto; object-fit: contain`).
- `.rr-interface-notes` sits below the image at the same horizontal extent: `left: 377; top: 760; width: 686; height: auto; transform: none`. The desktop `rotate(1deg)` is intentionally cancelled — on a stacked mobile composition the aligned read beats the playful skew.
- Reveal transforms (`translateX(-110)` on image, `translateX(85)` on notes) are cancelled on mobile. The reveal is the notes accordion, not a slide-apart.
- Notes card becomes a `flex-direction: column` container so flex `order` can invert the DOM sequence: DOM is `[frame (body), details]`, visual is `[details (order:1), body (order:2)]`. Details pill stays pinned at the top; body grows downward when revealed. Without this inversion the pill would fall to the bottom when the body grows.
- Body is a `max-height` accordion. Collapsed `max-height: 0`, revealed `max-height: calc(100vh - 386px); overflow-y: auto`. The formula is derived from the physical box math: canvas is vertically centered in a 100vh mat, so canvas-top-physical = `50vh − 225`. Notes top in physical = canvas-top + `(760 + 76) × 0.5 = 50vh + 193`. Available physical = `100vh − (50vh + 193) = 50vh − 193`. Doubled to canvas-px (since body lives inside scale(0.5)) = `100vh − 386`. On tall viewports (≥812) the full notes list fits; on shorter ones the body scrolls internally.
- **First `<hr>` hidden.** `InterfacePanel.tsx` emits one `<hr class="rr-interface-note__divider">` before the `.map()` call, producing a stray divider above the first note. CSS hides it via `.rr-interface-notes__body > .rr-interface-note__divider:first-child { display: none }` — scoped to `[data-tab='interface']` mobile so the desktop layout is untouched.
- Note, label, arrow, and pill font-sizes/paddings are **boosted in canvas-px** (notes 22px, label 22px, arrow 36×36, pill padding 20/28) so rendered output at scale 0.5 lands in mobile-readable range.
- Notes label switches from vertical writing mode to horizontal; arrow rotates `-90deg` closed / `90deg` open. Details row uses `justify-content: space-between` so label is left, arrow right.

### Post-game storycard mat — scaled card, re-anchored deck-fan

The secondary mat (`.rr-mat--secondary`, fed by `<StoryCard>` after game-over) preserves the desktop 384×688 card dimensions and scales the whole card via transform: `transform: translateX(-50%) scale(calc((100vw - 2 * var(--rr-safe-x)) / 384px * 0.85))` with `transform-origin: top center`. The 0.85 multiplier trims ~15% off a strict fit-to-viewport scale so the card has breathing room. Mat height is computed from the scaled card height: `calc((100vw - 2 * var(--rr-safe-x)) * 688 / 384 + 112px)`.

The `.rr-story-card__deck-fan` overlay (hand holding card fan) is re-anchored from the desktop bottom-pinned position to the card's mid-left: `top: 42%; left: 0; transform-origin: 0% 50%; transform: translate(...) rotate(90deg) scale(0.88)`. The translate is driven by `--rr-mech-progress` so the hand slides in as the scene scrolls into view (this CSS variable is inert on mobile since the scroll choreography is unbound, so the fan rests at its end position).

### Intro storycard — biconomy-style natural flow

`#intro` on mobile mirrors the biconomy blue-card pattern: the mat becomes a flex container centering a single column (`max-width: 430px`). `.rr-canvas` drops its absolute frame (`position: relative; width: 100%; height: auto; transform: none`). `.rr-story-card` becomes a vertical `flex-direction: column; gap: 32px` stack; its three absolute-positioned children (body, constraints, north-star) are flattened to relative flow and ordered via CSS `order` (body:1, constraints:2, north-star:3) so reading order on mobile matches desktop visual order (constraints above north-star). Peripheral embellishments — expand affordance, card stack, enlarged artwork — drop out (`display: none`) per the lite decorative-drop-out rule.

**Constraint overlay — `:has()` + negative margin:** On expand, Framer animates `.rr-constraints-card__hidden` from height 0→123px in flow. To prevent this from pushing North Star down, North Star gets `margin-top: calc(-123px + var(--space-8))` when `.rr-constraints-card--expanded` is present (via `:has()`), exactly cancelling the height push. Constraints card gets `z-index: 3`; North Star gets `z-index: 1` so constraints overlay it. The negative margin is derived from `HIDDEN_OPEN_H = 3*28 + 3*13 = 123px` (3 rows × 28px + 3 dividers × 13px). If the hidden row count or row/divider heights change, recompute and update both the CSS `calc()` and the `HIDDEN_OPEN_H` constant in `Intro.tsx`.

**Margin-top ease must match the constraint height ease.** The North Star `margin-top` transition uses `var(--ease-snap)` (not `--ease-paper`) because the constraint hidden-div height is animated by Framer with `EASE = [0.45, 0, 0.15, 1]` — the same curve as `--ease-snap`. If the two curves diverge, the subtraction (`constraint_h + NS_margin = 8px` constant) only holds at t=0 and t=1; mid-animation the storycard's total height briefly pulses by a few pixels, which reads as "the whole card animating on toggle." Keep both on the snap curve.

### Dotted path (StoryCard) — scale-corrected measurement

`StoryCard.tsx` measures the link ("only test") and North Star positions via `getBoundingClientRect()` to compute path origin and endpoint. On mobile, `.rr-story-card--mechanics` has a CSS scale transform (`translateX(-50%) scale(calc(...))` with ~0.777 factor). `getBoundingClientRect` returns post-transform screen coordinates, but `pathPos.top/left` and `dotEnd.dx/dy` are set as CSS `top/left` and SVG coordinates — which live in the card's **local (pre-transform) space**. Without correction, dots are ~110px below and ~40px left of target.

Fix: `measure()` divides all offsets by `cr.width / card.offsetWidth` (scaleX) and `cr.height / card.offsetHeight` (scaleY). On desktop (no scale, ratio = 1) this is a no-op.

SVG coordinate system: `viewBox="0 0 ${vbW} ${vbH}"` with vbX=0 so SVG coordinate (0,0) aligns with the path div's CSS position (link bottom-center). `overflow="visible"` handles any bezier curve segments that extend leftward. An earlier attempt used `vbX = -30` as a left-side buffer, which shifted all dots 30px right in local space; removed.

**Dot sampling.** The path renders as many small dots forming a dotted line (not 3 large dots). Implementation: sample the cubic bezier at 120 subdivisions, accumulate arc length, then place dots at ~13px spacing along the arc. This keeps spacing visually uniform along the curve regardless of the bezier's parametric speed. Circle radius is `1.6` — deliberately small so the line reads as a trail, not a necklace. Curve has two bends from perpendicular control-point offsets (`amp = clamp(22, dy*0.09, 36)`) for a hand-drawn feel. If the spacing or radius changes, re-check that the final dot still lands on the North Star top-center at both mobile and desktop scales.

`ResizeObserver` re-fires `measure()` whenever the card resizes — deck-fan image load shifts the card's rendered height, invalidating a fonts-only measurement.

### Outcome card — preserved desktop composition

`.rr-outcome-card` on mobile keeps the authored desktop dimensions (288×330, 8px outer padding, 15px inner padding) — only unpinned from absolute (`position: relative; inset: auto; margin: 0 auto; align-self: center`) so the card flows inside the mat. The entrance scroll-map and FM transform are neutralized with `transform: none !important; opacity: 1 !important` (React-inline-style gate) since the sweep-in maps to a scroll range that collapses when the mat is flow-sized.

### Rules panel — swipeable image with co-scrolling caption

The rules image keeps its desktop 1349×653 composition, scaled 0.5 inside a horizontal-overflow container (`.rr-rules-group`). The group breaks out of the mat's `--rr-card-inset-x` via negative margins and adds `padding: 0 --space-24 --space-16` so the image has a small gap at both scroll extremes.

`.rr-rules-label` is in flow (not sticky) with `white-space: nowrap`, so the caption ("Rules of the game | Appears at the start…") reads as one continuous line that trails off past the viewport and scrolls horizontally with the rules card. The earlier sticky + `width: 100vw` configuration wrapped the note to a second line and pinned it to the left edge; both were rejected — the caption is meant to belong to the image and move with it, single line, overflow allowed.

**Divider pseudo:** A 1px × 10px `--grey-720` divider separates the two labels via `.rr-rules-label__note::before` — 8px flex-gap sits before it (from the parent's `gap: 8px`), 8px `margin-right` sits after it. Height is deliberately shorter than the text line-box (10px vs ~15px) so the divider reads as a quiet mark, not a full stroke; colour is one stop lighter than `--grey-640` (the copy) for the same reason. Label `align-items: center` keeps the divider aligned with the x-height of both spans. This is a shared rule — desktop gets the divider too.

Click-to-expand is disabled on mobile (`.rr-rules-inner { pointer-events: none }`) because the scroll gesture is the mobile reading affordance; the overflow container still receives pan because pointer events bypass the inner.

### Deck-fan end position — by-eye on mobile

`.rr-story-card__deck-fan` inside `.rr-mat--secondary` uses a translate range `-220px → +80px` keyed to `--rr-mech-progress`. On mobile `--rr-mech-progress` rests at 1 so the fan lands at x = +80 — pushed inside the card's left edge so the hand reads as holding the deck against the card rather than hanging off the side. The original `-300 → 0` range had the fan anchored at the card's left edge; the +80 offset is an eyeballed-collab nudge.

### Chapter pill — date subtitle hidden on rr

`.route-rr .nav-marker__year { display: none }` inside the mobile block — chapter dates (Sep 2024 etc.) are suppressed at ≤767px to keep the pill tight. Desktop still shows them. No effect on other routes since the rule is `.route-rr`-scoped.

### First sheet top-bleed

`.route-rr .sheet-stack > .sheet:first-child { margin-top: calc(-1 * var(--workbench-pad-y)) }` — intro's mat extends under the top workbench padding so it reads edge-to-edge on all four sides. Pills (fixed at `--marker-top`) still land on the mat surface because they sit above it in z-order.

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
- `.rr-canvas--cards-evo` mobile transform uses `!important` to beat the sweeping `.route-rr .rr-canvas` reset above it — without this the canvas reverts to flex flow and the scaled composition collapses
- `--rr-cards-scale` divisor pattern (`* var(--rr-cards-scale)`) for canvas positioning — `left: calc(50vw - 720px * var(--rr-cards-scale))` keeps the title centered as the scale changes
- `.rr-mat--secondary` height formula `(100vw - safe-x*2) * 688 / 384 + 112px` is locked to the storycard's 384×688 aspect — changing card dimensions requires recomputing both the scale denominator and this height
- Mobile `matchMedia` gates in `RulesRail.tsx` (first-visit auto-open skip + one-click open-on-first-visit) and `Mechanics.tsx` (auto-scroll-to-storycard skip) — reinstating any of these on mobile fights the flow-sized layout
- `.rr-rules-rail.is-open` / `.rr-note-rail.is-open` z-index is scoped to open-state only — promoting closed-state rails above the board leaks their content onto the game face
- Rails mobile open-state translateX values (`-50px` for rules, `0` for note) — these aren't symmetric because each rail has a different desktop natural position; recomputing requires reading current bounding rect with the board overlay in place
- `z-index: 1` on `#intro .rr-north-star-card` (mobile only) — must stay below `z-index: 3` on constraints card; flex `order: 3` paints it last in a same-z stack, so an explicit lower z-index is required
- `StoryCard.tsx` `measure()` scale correction: `scaleX = cr.width / card.offsetWidth` — the storycard has a CSS scale transform on mobile; without the divisor, dots land ~110px below the North Star. The SVG uses `viewBox="0 0 ..."` (vbX=0), not `vbX=-pad`, for the same reason
- `StoryCard.tsx` `ResizeObserver` on the card root — re-fires `measure()` when the deck-fan image loads and shifts card height; without it, `document.fonts.ready` fires before the image and produces stale geometry
- Interface tab accordion uses a **viewport-derived max-height** (`calc(100vh - 386px)`) with `overflow-y: auto`, not a fixed ceiling. The formula is tied to the canvas vertical centering + notes position + scale — see "Cards — interface tab stays inside the scaled canvas" above. If the notes canvas-y position (760), pill height (76 canvas-px), or canvas scale (0.5) changes, recompute.
- `#intro .rr-story-card:has(.rr-constraints-card--expanded) .rr-north-star-card { margin-top: calc(-123px + var(--space-8)) }` — the 123px is derived from `HIDDEN_OPEN_H` in `Intro.tsx`; if hidden-row count or heights change, update both
