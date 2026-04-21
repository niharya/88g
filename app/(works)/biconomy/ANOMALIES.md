# /biconomy — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/(works)/biconomy/`. Update it when an
architectural decision changes — not on every edit.

For project-level rules see `CLAUDE.md`.

---

## Known anomalies

### Flows title + toggle blur-swap on flow change (v0.38.0)

`components/Flows.tsx` wraps the flow title and before/after pill in a single
`AnimatePresence mode="popLayout"` block keyed on `currentSlide`. On flow
navigation the group blur-exits and the new group blur-enters, crossfading via
`popLayout` so layout never goes empty. This is what makes the flow swap feel
deliberate rather than instant.

Load-bearing bits:

- **`mode="popLayout"`**, not `"wait"`. `wait` runs exit-then-enter sequentially, leaving a visible empty gap. `popLayout` pops the outgoing element out of flow so incoming mounts immediately.
- **Key is `currentSlide`, not `animationKey` or `showAfter`**. The blur must only fire on flow navigation — toggling before/after within the same flow keeps the same key so the title/toggle stay put while the image fades.
- **Timing is one stop above snap** (`duration: 0.5` enter, `0.3` exit, snap/paper curves). Matched-ish to the 700ms img-materialize but intentionally lands slightly earlier — the label arrives, then the image resolves under it. Don't "harmonize" durations to exactly match — the stagger is what reads as intentional.
- A `.flows__title-group` flex wrapper exists purely so the new motion.div preserves the pre-existing row layout. Removing it collapses the title and toggle onto separate lines.

### Flows switch-thumb overshoot (documented deviation)

`biconomy.css:468` — the `.flows__ba-switch-thumb` transitions `transform` with
`cubic-bezier(0, 1, 0.31, 1.05)`. The `1.05` final y deliberately overshoots `1`,
giving the thumb a tiny settle-past-target before landing. This is one of the
two documented deviations from the "no bounce, no overshoot" rule in `CLAUDE.md`
(the other being the train ticker). Do not normalize to `--ease-paper` or
`--ease-snap` — the micro-overshoot is what makes the switch feel physical.

### Note-pointer bounce (documented deviation)

`biconomy.css:740` — `.ba__note-pointer` uses `0.14s cubic-bezier(0.3, 1.3, 0.5, 1)`
with a peak >1 for a dampened springy nudge on hover. Intentional. Same rule:
do not flatten to paper/snap.

### Demos video-item tilt + radius pair (v0.28.0)

The figma-tab video pair in `.demos__media-row--figma` is load-bearing in three ways:

- **Two-child tilt assumption.** The ±1° V-tilt is applied via `:nth-child(1)` and `:nth-child(2)` in `biconomy.css`. A third video in that row would land untilted and read as a bug. If the shape ever changes, move the tilt to a `--tilt` prop-driven scheme.
- **Matched 24px radius pair.** `.demos__video-frame` and `.demos__video-player` both carry `border-radius: 24px`. The outer frame clips the inner player — if they drift, the poster/video corners expose under the frame shadow.
- **`tabIndex={-1}` on the `<video>` element.** The entire `.demos__video-item` is a single `<button>`; the inner video must not be focusable or the tab order double-stops. Looks removable — is not.

### Mat clipping (v0.10.0)

`overflow: clip` was added to the `.mat` base class in `globals.css` during `/rr` work. This is the correct containment rule — all content should live within its mat. Two biconomy sections have pre-existing content that now clips at the mat edge:

- **ux-audit** — intro surface card extends past the right mat boundary
- **demos** — header card and text extend past the right mat boundary

These are not regressions — the content was always overflowing, just never visually caught because nothing was containing it. They need layout adjustment during biconomy fine-tuning.

### Section reveal shadow vs. scroll-linked shadow

The `.section-reveal` CSS animation (globals.css) includes a shadow phase on
`.surface` elements during entrance. After the reveal completes and the user
scrolls, `Sheet.tsx` applies an inline `boxShadow` via `useMotionValueEvent`
that overrides the CSS-animated shadow.

Both must remain. The CSS shadow provides the entrance look; the scroll-linked
shadow takes over for the reading state. See `app/components/nav/ANOMALIES.md` for
full details.

**What breaks if the CSS shadow is removed:** surface cards appear flat/shadowless
during the reveal entrance on all biconomy sections.

**What breaks if the inline shadow is removed:** surface shadow does not respond
to scroll position; cards feel static during reading.

### Shadow token migration (v0.17.0)

Four biconomy card outers (`.bips__card-outer`, `.multiverse__card-outer`,
`.demos__card-outer`, `.api__card-outer`) previously carried a hardcoded
`0 1px 2px rgba(0,0,0,0.15)` shadow repeated in-place. These were unified onto
`var(--shadow-flat)` (0.10 alpha) as part of the four-tier elevation ladder
(flat / resting / raised / overlay) in `globals.css`.

Two biconomy shadows remain **off-ladder by design** and are annotated in the
CSS:

- `.api__card-frame` — upward-cast backlight (`0 -4.84px 4.84px rgba(0,0,0,0.25)`).
  Not elevation; simulates a panel backlit from below. Do not migrate to the ladder.
- The 1px hairline inside the api card — structural edge, not a shadow.

If you find yourself authoring a new shadow on a biconomy surface, use the
ladder first. Only introduce a new hardcoded value if it expresses a mechanic
the ladder cannot (motion-state, glow, inset press) and document why inline.

### Flows HUD mode (legacy dev authoring tool — retained as artifact)

**Status:** retired. The HUD was used once to author the chip coordinates for
the audit Flows (before/after number overlays), and those coordinates now
live statically in `flowSlides.ts`. The HUD is not used by anyone going
forward. It is retained in the codebase as a working artifact — do not
remove it, but also do not treat it as an active feature. If it ever breaks
under a refactor, breakage is acceptable; fixing it is not a priority.

`Flows.tsx` ships with a chip-coordinate authoring HUD gated by the `?hud=1`
URL param. When active, BeforeAfter chips become draggable via NATIVE pointer
events (`setPointerCapture` + `pointermove`) and a floating HudPanel exposes a
capture button that posts the current chip layout to `/api/dev-tools/hud-capture`. That
route writes to `.claude/hud-captures.json` on POST and returns 403 in
production — the endpoint is intentionally dev-only. Captures are also
mirrored to `localStorage` under `__hudAllCaptures`, keyed by
`${slideIdx}-${state}`, and Flows rehydrates these overrides on mount so chip
positions survive page reloads during an authoring session.

**Don't touch without reading first:**

- The HUD drag path in `BeforeAfter.tsx` deliberately does NOT use
  framer-motion's `drag` prop. Framer re-applies its own transform during
  drag, which fights the state-driven `left/top` writes and produces stuck or
  snapping chips. `hudMode` triggers the native-pointer code path for this
  reason.
- The 403 guard in `app/api/dev-tools/hud-capture/route.ts` must stay — this is a
  filesystem-writing endpoint.
- Leave `__hudAllCaptures` under that exact key; the rehydrate-on-mount path
  reads it literally.

### Standby → active choreography (Flows)

Flows has two composed states per slide: a standby layout and an active
reading layout. The transition is driven by `useScroll({ target: frameRef })`
→ `activeTRaw` (clamped 0→1 over the scroll range) → `activeT` (a `useSpring`
with `duration: 0.6, bounce: 0.35`). Two derived motion values —
`navTranslateX` (−120 → 0) for the right-side nav slide-in and
`leftTranslateX` (32 → 0) for the left-group recentering — read off the same
spring so they land in lockstep. A restrained overshoot is intentional here:
it gives the active composition a small settle, not a snap. `isActive`
(boolean) flips at the midpoint of `activeT`, and that threshold is what gates
`pointer-events` and `aria-hidden` on the two layouts so interactive targets
don't overlap during the transition.

`activeT` is also threaded into CSS as `--active-t` via an inline style on the
`<motion.section>` root (`style={{ '--active-t': activeT }}`). This makes the
live MotionValue readable by CSS `calc()` expressions in `biconomy.css` for
any property that should interpolate with the standby transition without
needing a JS motion value. If you add a CSS rule that uses `var(--active-t)`,
it will update at 60fps driven by the same spring — no separate JS needed.

**Don't touch without reading first:**

- The bounce value (`0.35`) is the restrained-settle amount. Changing it to
  `0` kills the land-feel; raising it makes the nav visibly rubber-band.
- If you split `navTranslateX` and `leftTranslateX` onto separate springs, the
  recenter and slide-in stop landing together and the composition looks
  fractured.
- `isActive` *must* flip at the midpoint, not at `activeT === 1`. Flipping at
  completion leaves a window where both layouts are pointer-interactive.

### Reciprocal hover (Flows ↔ BeforeAfter)

The notes rail and the BeforeAfter overlay chips share a single
`hoveredNoteIndex` in `Flows.tsx`. Both sides write to it: the notes rail list
items call `setHoveredNoteIndex` on enter/leave, and the overlay chips call
back through `onNoteHoverChange` / `onChipHoverChange`. Either side hovering
lifts both — the chip's `.is-hovered` class and the rail's selected-state
Monostamp are driven from the same source of truth.

On each hover-enter edge (chip side), `Flows` rolls a fresh binary ±2°
rotation: `setLiftRotate(Math.random() < 0.5 ? -2 : 2)`. The value is passed
to BeforeAfter and applied as `--lift-rotate` on the `.ba__note-pointer`
wrapper; CSS consumes it in `transform: scale(1.2) rotate(var(--lift-rotate,
0deg))` with a 0.14s snappy cubic-bezier. The binary (not continuous) random
keeps the lift crisp — it reads as "picked up on one side or the other," not
a wiggle.

The `.is-hovered` class activates via reciprocal state AND `:hover` activates
directly on the chip. Both are needed: `:hover` covers direct-chip hover even
when state-writing ordering is delayed, and `.is-hovered` covers the
rail-driven case. Removing either breaks one direction of the pairing.

**Don't touch without reading first:**

- Don't make the rotation continuous (e.g. random −2..+2). Binary is the
  intended character — continuous feels drunk.
- The default fallback `var(--lift-rotate, 0deg)` matters for the non-hovered
  baseline; don't drop it.
- Keep both `:hover` and `.is-hovered` as activators.

### NavPill is biconomy-local-shared

`app/(works)/biconomy/components/NavPill.tsx` is used by both Flows and the
API section. Despite appearing twice, it has NOT been promoted to
`app/components/` — both consumers live within the same route, so it stays
route-local. Per the shared-layer promotion rule (CLAUDE.md: "a primitive
moves into shared the *second* time it's needed"), the count is measured
across routes, not call sites. Promote NavPill to `app/components/` the
moment a third consumer outside `/biconomy` needs it, and flag the move
before doing it.

---

## Responsive anomalies (mobile ≤767px)

`/biconomy` has completed its first crafted-lite pass across every
chapter (BIPs, Intro, UX Audit/Flows, Multiverse, Demos, API, Situational
Awareness). All mobile blocks live at the end of `biconomy.css` under
the heading `/* Crafted-lite pass — mobile */`. Each composition
decision below maps to a shape in `docs/responsive-playbook.md`; read
that entry before modifying.

**Known gaps deferred for a second pass** (tracked when relevant, not
blockers):

- `--biconomy-card-inset-x` token for gutter consistency across chapter
  surfaces (BIPs / Intro / Demos share an inset but still use literals).
- Full mat-bleed (Shape 12 left/right) — only the first-mat top bleed
  has been applied.
- Situational Awareness chip-row / prose spacing audit (only photostack
  scale touched this pass).

### BIPs — grid unbind (Shape 1)

Desktop is a 4-col grid with two deliberate overlaps on row 1: the header
card occupies `grid-column: 2 / 4` while the stats row occupies
`grid-column: 1 / -1` with `align-items: flex-end`, so the Fraunces stats
phrases ("Seven ideas surfaced" / "Three shipped") anchor to the bottom of
row 1, visually *under* the card. That overlap is the composition.

On mobile the overlap cannot survive — there is no horizontal axis to
compose against. The mobile block drops the grid entirely (`display: flex;
flex-direction: column; gap: var(--space-48)`) so all three row groups
(card, stats, notion section) flow as linear siblings. The authored
48px step between them is chosen, not inherited from the desktop 96px
grid-gap.

### BIPs — stats couplet (Shape 4)

Desktop's `.bips__stats` is a `repeat(4, 1fr)` grid with `.bips__stats-left`
at col 1 and `.bips__stats-right` at col 4, leaving cols 2-3 as deliberate
negative space. On mobile that space collapses; the stats are re-composed
as a centered vertical couplet — `display: flex; flex-direction: column;
align-items: center; gap: var(--space-8)` — so the two Fraunces highlights
read as a paired editorial statement instead of opposed bookends.

### BIPs — notion section padding

Desktop uses `padding-left: 128px; padding-right: 128px` on
`.bips__notion-section` to frame the iframe as a scholarly insert. At 375px
viewport minus 24px workbench pad-x per side, no content would fit under
that cushion. The mobile block zeroes both padding values.

### BIPs — notes rail re-authored as inline accordion (Shape 10)

This is the main composition decision. On desktop the notes rail is an
**absolute-positioned rotated drawer** — `position: absolute; right: 0;
max-width: 240px; transform: translateX(0) rotate(1deg)` at rest,
`translateX(112px) rotate(0deg)` when open; the iframe column simultaneously
shifts `translateX(-128px)` so the rail emerges into negative space. The
rail tab is a `writing-mode: vertical-lr` button pinned at `right: -32px`.

None of those coordinates translate to 375px. Under crafted-lite, the rail
is **re-anchored**, not scaled:

- `position: static`, full width, flex column — rail joins the flow below
  the iframe.
- Tab becomes a **horizontal full-width button** with `writing-mode:
  horizontal-tb`, `min-height: 44px` (touch target floor), authored
  `var(--space-12) var(--space-16)` padding.
- Rotation removed (`transform: none` in both closed and `.is-open` states).
- Iframe-column `translateX(-128px)` disabled — full-width iframe.
- Content behaves as a classic accordion: `max-height: 0` collapsed →
  `max-height: none` when `.is-open`, padding-top/bottom toggled in lock-step.
  Outline restored only in the open state (outline on a zero-height element
  ghosts an orphan hairline).
- **No max-height transition** on the accordion. A CSS transition between
  `0` and a fixed-px max-height was tried first and behaved unreliably on
  the first toggle — the animation registered in `getAnimations()` but
  never advanced. Instant toggle is the kept behavior. The tactile feedback
  comes from the class change, padding jump, and outline delta — not from
  a height sweep. Do not re-add the transition without a measured-scrollHeight
  JS hook; the naive CSS form does not work here.
- **`flex: 0 0 auto` on `.bips__notes-content` mobile.** The desktop rule
  sets `flex: 1 1 0%` so content fills the rail. On mobile the rail is
  `height: auto` and the parent can't provide space to grow into, so
  `flex: 1 1 0%` resolves to zero and the content collapses even with
  `max-height` set. Switching to `flex: 0 0 auto` lets the content size to
  itself (capped by max-height). Do not remove this override.
- Tab arrow direction is re-targeted for vertical expansion:
  `rotate(-90deg)` = ↑ (open/collapse), `.is-flipped rotate(90deg)` = ↓
  (closed/expand). On desktop the same rotations indicate left/right
  emergence.

**No `!important` required.** BIPs rail state is className-driven in
`BIPs.tsx:104` — the consumer toggles `is-open` on the rail's className, not
an inline `style={{ transform }}`. The React-inline-style conflict gate
(playbook → Named patterns) does not apply here, which is the cleanest
version of Shape 10. Compare to `/rr` rails, which *do* require the gate.

### BIPs — iframe height cap

Desktop passes `height="600"` as an iframe attribute. CSS overrides to
`480px` on mobile — at 375px width, a 600px-tall Notion embed dominates the
scroll and buries the notes accordion beneath it. 480px is authored, not
scaled; it is the height at which the embed reads as a framed artifact and
the surrounding composition stays legible.

### Don't touch

- **Do not reintroduce `transform: scale()` on any BIPs canvas.** The
  desktop card, stats, iframe are all preserved at their desktop
  compositions via the mobile re-authoring; none are scaled. This is the
  crafted-lite stance and the playbook's Banned hacks section spells it
  out.
- **Do not add `!important` to the BIPs mobile block.** Rail state is
  className-driven, so the gate does not apply. If you are reaching for
  `!important`, you are fighting specificity from a different source.
- **Do not assume other biconomy chapters will follow the BIPs shape.**
  UX Audit, Flows, Multiverse, Demos, and the API section exercise
  different shapes (scroll-linked chip layers, before/after media, dense
  demo grids) and will need their own authored decisions.

*Reference pass: 19 April 2026 (playbook v1).*

### Flows — crafted-lite pass (UX Audit)

Mobile re-composes the Flows section into a four-row vertical
sequence, mirroring BIPs Shape 10 for the notes rail but with an
extra mechanic to handle Flows' scroll-linked standby→active state.

**Row order (mobile):**

1. title + BA switch (adjacent, left-aligned — same pairing as desktop)
2. image frame
3. counter + NavPill (space-between)
4. notes accordion

**DOM flattening via `display: contents`.** `.flows__nav` is nested
inside `.flows__header` in the DOM, so CSS `order` can't relocate it
to row 3 without restructuring. Instead, `.flows__main` and
`.flows__header` both get `display: contents` on mobile — their
children become flex items of `.flows` directly, and `order: 1–4`
places them independently. Desktop DOM is untouched. If the Flows
section ever needs an accessibility landmark on `.flows__main`,
`display: contents` may strip it in some older browsers; current
usage has no landmark role, so this is fine.

**React-inline-style gate (required here).** Unlike BIPs, Flows
writes Framer motion values as inline `style={{ x: ... }}` on
`.flows__header-left` (leftTranslateX) and `.flows__nav`
(navTranslateX). On mobile the standby→active choreography is
visually disabled — the layout renders statically active — so these
inline transforms must be overridden with
`transform: none !important` on both elements. This is the gate the
playbook names under "Named patterns." Removing `!important` lets
the springs re-assert themselves and the title group drifts +32px
right on scroll-in.

**Force `--active-t: 1 !important` on `.flows`.** `Flows.tsx` sets
`style={{ '--active-t': activeT }}` as an inline CSS variable on
`<motion.section>` so CSS `calc()` interpolations (pill saturation,
switch-wrap expansion, label color mix) track the spring. Inline CSS
variables win over stylesheet rules at equal specificity, so the
mobile override needs `!important` to force the saturated/expanded
look at all scroll positions.

**Notes rail → inline accordion.** Same architectural move as BIPs:
`.flows__notes-wrap` flips `position: absolute → static`; rail loses
rotation + drawer translate; tab flips from `writing-mode:
vertical-lr` absolute-pinned to horizontal full-width 44px-min
button; content `flex: 0 0 auto` with `max-height: 0 ↔ none` instant
toggle (the same first-render max-height-transition bug BIPs
documented applies here — do not re-add the transition without a
measured-scrollHeight JS hook). Outline on rail deferred to `.is-open`
to avoid a zero-height ghost hairline. `.flows__main.is-notes-open`
transform is irrelevant under `display: contents` but kept neutralized
for clarity.

**Snap-on-open (mobile only).** When `showNotes` flips to `true`,
`Flows.tsx` scrolls so the title row sits ~72px below the viewport
top (clear of the project/chapter pill strip + breathing space).
Implementation:

- Ref on `.flows__header-left` — not on `.flows` — because the
  title row is the anchor the user should land on, not the section
  top.
- `matchMedia('(max-width: 767px)')` gate — desktop behavior
  unchanged (rail emerges beside main, no scroll needed).
- `requestAnimationFrame` wrapper so the class toggle + layout
  reflow complete before `getBoundingClientRect()` measures.
- `window.scrollTo({ top, behavior: 'smooth' })` — 72px offset
  absorbs `--workbench-pad-y` + pill row + a small cushion. If the
  shell's top pill strip changes height, revisit the offset.

**Don't touch:**

- The `display: contents` on `.flows__main` and `.flows__header` is
  load-bearing for the row re-order. If a background/border/padding
  is ever added to either wrapper for desktop purposes, scope it
  away from mobile or the re-order stops working.
- Keep both `transform: none !important` overrides. Removing one
  while the other stays produces a half-drifted layout that's
  visibly broken at scroll-in.
- Keep the snap ref on `.flows__header-left`. Moving it to
  `.flows` means landing ~20px above where the user expects
  (section padding above the title).
- Snap fires on open only — not close. Closing in place preserves
  the user's reading position.

### Demos — crafted-lite pass (tabs + videos)

Two composition moves — tab re-stack and video scroll strip — plus
two collapsed-cushion fixes for `.demos__title-header` and
`.demos__media-row--single`.

**Tab re-stack → two-row box.** Desktop is a single horizontal strip
with graduated left→right padding (8/12 → 10/14 → 12/16) and
"Evolution of the Demos" appended as a disabled tag. At 375px the
row would overflow and the graduated padding reads as broken rather
than intentional. Mobile composition:

```
┌────────────────────────────────────┐
│      Evolution of the Demos        │  row 1
├──────────┬──────────┬──────────────┤
│  Figma   │   Web    │    Game      │  row 2
└──────────┴──────────┴──────────────┘
```

- `.demos__tab-group` becomes `flex-wrap: wrap; align-items: stretch`.
- `.demos__tab-disabled` gets `order: 0; flex: 1 1 100%` → row 1
  full-width. Desktop-only `.grey-*` styling kept intact.
- Three `.demos__tab-label` items get `order: 1; flex: 1 1 0` →
  row 2 equal thirds.
- Graduated padding dropped — all three active tabs land on
  `padding: var(--space-12) var(--space-8)` with `min-height: 44px`.
- Row 2 top edge hugs row 1 bottom edge via `margin-top: -1px` on
  the labels — borders overlap so the stack reads as one box even
  though row 1 uses grey tokens and row 2 uses orange.
- First row-2 tab (`--figma`) drops the `margin-left: -1px` desktop
  overlap — sits flush to the container's left edge instead.

**No JSX change.** The re-order is purely CSS `order`. The DOM stays
radio / label / radio / label / radio / label / disabled-span; only
mobile visual order differs. Keyboard tab order follows DOM, so
radio-arrow navigation still cycles figma → web → game (the
disabled span is not focusable either way).

**Video scroll strip (Shape 11 option 3).** Root cause of the
pre-pass invisibility: desktop `padding: 0 128px` on both
`.demos__media-row--figma` and `.demos__media-row--single`. At
375px that leaves negative content width — videos had no room, not
just bad sizing. Mobile:

- Figma row (two videos): `overflow-x: auto; scroll-snap-type: x
  mandatory; scroll-padding-inline: var(--space-24)`. Each
  `.demos__video-item` locks to `flex: 0 0 80vw` with
  `scroll-snap-align: start`. Second video peeks past the right
  edge as the scroll affordance. Scrollbar hidden
  (`scrollbar-width: none` + `::-webkit-scrollbar { display: none }`).
- Single row (web / game): drops the 128px padding, gets a 24px
  cushion. Stays single-column — one image, no strip.
- `max-height: 100dvh` dropped — the 1:1 aspect ratio drives height
  from width now.
- `.demos__video-frame { width: 100% }` replaces the desktop 90%.
  90% was the inset inside the desktop tilted-pair composition;
  irrelevant when items are authored-sized.
- `.demos__video-item .demos__caption { width: auto; max-width:
  100% }` — desktop locks `width: 20rem` (320px), which crushes the
  layout at 375px.
- **±1° tilts dropped.** Desktop sets `--tilt: -1deg` / `1deg` on
  `:nth-child(1)` / `(2)`. When only one video is visible at a
  time in the scroll strip, a lone tilted item reads as broken
  rather than composed. Override both nth-child rules to
  `--tilt: 0deg`.

**Don't-touch:**

- Keep the DOM order radio/label triples + trailing disabled span.
  If you reorder the JSX to put evolution first (matching mobile
  visual order), desktop's graduated left→right composition
  breaks.
- Keep `margin-top: -1px` on row-2 labels. Without it the box
  shows a 1px gap between evolution and the three tabs and the
  "flush" composition fails.
- Don't reintroduce `padding: 0 128px` on any demos media row on
  mobile. That cushion is the desktop composition — 24px is the
  mobile authored value.
- Don't reintroduce the tilts behind a media query. If you think
  they should return, revisit the whole scroll-strip shape — the
  two aren't compatible.
- Title-header cushion (`padding: 20px 128px 0` → `20px 24px 0`) is
  a literal 24px today. When the `--biconomy-card-inset-x` token
  lands (plan item #6), swap literals for token.

### Nav pills — year hide (Shape 6 / Shape 7)

Biconomy's project/exit/chapter pills inherit the shared mobile behavior
from [`app/components/nav/nav.css`](../../components/nav/nav.css) at
`<768px` — tightened pill padding (4/16/4/6) and the short-title swap
(unused here; "Biconomy" is already short). Route-local addition: hide
`.nav-marker__year` on mobile so chapter date subtitles like "2022–24"
don't widen the pill past comfortable at 375px. Mirrors the `/rr` pattern
at [`rr.css:2810`](../rr/rr.css:2810).

**Deferred.** The nav-sled `left` override that `/rr` carries
([`rr.css:2819`](../rr/rr.css:2819)) is not needed yet — biconomy mats are
not full-bleed (Shape 12 hasn't been applied), so the shared sled formula
still aligns to the project pill. Revisit when the mat-bleed pass lands.

### Intro — first-mat top bleed + open-travel + toggle anchor (UX Audit)

First chunk of the UX Audit chapter's mobile pass. Three changes:

- **First mat top bleed (Shape 12 partial).** The first sheet's mat
  extends to the viewport top via `margin-top: calc(-1 * var(--workbench-pad-y))`
  on `.route-biconomy .sheet-stack > .sheet:first-child`. Pills land on
  the mat surface as the top row. Left/right mat-bleed is deferred until
  the chapter-wide mat pass.
- **Open travel on mobile is `-60%` instead of `-50%`.** Desktop
  half-shifts the surface because the memo cards sit beside it with
  horizontal room. On a 375px viewport, `-50%` leaves the cards partly
  covered, but anything past `-60%` throws the blue surface off-screen
  instead of letting it rest adjacent to the green memo cards.
  `Intro.tsx` reads `matchMedia('(max-width: 767px)')` into an
  `isMobile` state and feeds `-60%` into Framer's `animate.x` when open.
  SSR default is `false` — matches the closed-state x:0 so there's no
  hydration mismatch.

The intro surface's inner padding is *not* touched on mobile — the 48px
frame is load-bearing for the card's visual framing. An earlier pass
tightened it to 24px; that was reverted.

- **Toggle anchor shift (`right: 0` → `right: 34px`) on mobile.** The
  toggle's Framer rest state (inline `translateX(50%)` — `whileInView`
  at `once:true` never re-fires on hydration, so this is the effective
  resting transform) pushes the handle past the memo container's right
  edge by half its own width. On desktop that lands the icon + dots
  past the surface right edge, visible. On a 375px viewport that same
  translate throws both past the viewport right edge; only a 14px green
  strip shows between surface-right and viewport-right, and it was
  empty. Shifting the CSS anchor from `right: 0` to `right: 34px` at
  `<768px` moves the natural anchor 34px left, so the translated rest
  position lands with the dots at ~367–371 — inside the visible strip
  with ~6px of breathing room on both sides.

On mobile the slide-out handle is hidden entirely (`display: none`) and
replaced by a **single-icon expand pill** inset into the top-right of
the blue surface (`.intro-expand`). The pill's DOM + CSS is **ported
shape-for-shape from `/rr` Intro's first story card**
(`.rr-story-card__expand` at `rr.css:175`, consumed in
`app/(works)/rr/components/Intro.tsx`) — not from the two-slot
`.rr-switch-pill` used elsewhere in RR. Blue tokens in place of yellow:

- 36×40, `border-radius: 18px`, `background: var(--blue-100)`,
  `box-shadow: inset 0 0.5px 2px var(--blue-560)`, icon color
  `var(--blue-720)`.
- Positioned `top: 20px; right: 20px` inside `.intro__surface` —
  breathing room from both edges (RR uses 24/24; scaled down because
  the biconomy surface is more compact).
- Single Material Symbols icon — `expand_content` when closed,
  `collapse_content` when open. Swap happens by rendering the glyph
  text from the `open` state; no knob, no slots.
- States (`:hover`, `:active`, `:focus-visible`) use `--blue-160 /
  -480 / -800` mirroring RR's yellow chain.

The pill shares `setOpen` + `aria-expanded` with the (desktop-only)
slide-out handle — the two affordances are mutually exclusive but
functionally equivalent. Desktop hides the pill (default
`display: none`) and keeps the handle.

- **"dashboard" as an inline trigger.** `.intro__dashboard-trigger` is
  a `<button>` wrapping the `.text-marker` highlight. `onClick` calls
  the same `setOpen` as the pill + handle. No visible affordance —
  `text-decoration: none`; reads as part of the running text and is
  clickable (cursor: pointer + focus-visible outline for keyboard
  users). An earlier pass added a dotted underline; it was removed on
  request.

**Don't touch (expand pill).** Keep `type="button"` and keep it inside
`.intro__surface` so it translates with the surface on open. Keep the
icon swap driven by the `open` state (not CSS content) — Material
Symbols resolves the glyph from the child text node. If `/rr`'s
`.rr-story-card__expand` ever gets promoted into a shared primitive,
re-source this intro pill from the shared module — they should stay
structurally identical.

**Don't touch (dashboard trigger).** Keep `type="button"` and the
`.text-marker` class. Removing `text-marker` drops the yellow
highlight; omitting `type="button"` makes it a form submitter in any
future `<form>` wrapper.

**Don't touch.** The surface's `animate.x` is dual-valued per viewport.
If you change the closed resting x (currently `0`), keep the open value
as a derived constant — the open/closed interpolation needs to start
from wherever closed rests.

## StayingAnchored photostack (v0.35.0)

The original grid of 7 placeholder slots was replaced with a single pile of
10 personal photos. Load-bearing choices:

- **Rotations are seeded once on mount**, client-side only, via `useEffect`
  (initial state is a zero array to keep SSR output deterministic and avoid
  hydration mismatches). Cycling through the stack does **not** reshuffle
  tilts — only a page reload does. This is intentional; if a future session
  wires rotation re-rolls onto click/keydown, the stack stops feeling like a
  physical pile and starts feeling animated.
- **No transitions on the z-swap.** The "tak-tak" snap is the interaction.
  No Framer Motion, no CSS `transition` on `rotate`, `z-index`, `opacity`.
- **Prints preserve native aspect ratios.** The wrapper `.sa__photo` is
  `width: fit-content; height: fit-content` with `line-height: 0` to kill
  inline-image baseline gap. The image itself is capped at `max-width:
  400px; max-height: 480px`. Do not add a fixed frame — portraits and
  landscapes must read at their natural shapes.
- **Forward cycle semantics.** Clicking the stack advances; the first
  image reappears only after the last. NavPill arrows scrub both
  directions. If you unify them to forward-only, the arrow UI lies.

## BiconomyChip hover roll (v0.35.0)

The header note used to say "source-locked: exact transforms from original
BiconomyChip.js." That is no longer true. The component now:

- Keeps the three base rotations (`2.3`, `-1.7`, `3.9`) as rest state.
- On hover per mark, rolls a fresh `±2°` offset via `Math.random()` and
  settles via paper easing.

If you grep for "source-locked" and find it in the old comment, it's gone
on purpose — the rest state is preserved, the hover is the net-new gesture.
Vertical offsets (`y: -10.5`, etc.) were dropped — marks now sit on the
chip midline, aligned with the dividers.

## Tweet-card hover chain via `:has()` (v0.35.0)

The API section's tweet column uses a `:has()` selector on the parent
`.api__tweet-col` to drive animations on the *label row* (h5 title with
external-link icon + "opens in new tab" hint pill) when the sibling
`.tweet-card` anchor is hovered. The label row is not inside the anchor —
it sits above the card — so `:has()` is doing the cross-sibling work.

Touch points if this breaks:

- The anchor must remain `.tweet-card`; renaming it silently breaks the
  selector.
- Browsers without `:has()` (older Safari/Firefox pre-2023) will simply
  show the label statically — no fallback needed, degrades gracefully.

### BIPs — footer bleed + row2 alignment

Two small but non-obvious moves in the BIPs card footer on mobile.

- **Bleed relaxation.** Desktop `.bips__card-footer { margin: 32px -32px
  -32px -32px }` cancels exactly against the 48–64px card-inner padding,
  leaving a visible inset between the card outer edge and the footer
  content. On mobile we collapse card-inner padding to 32px, which means
  the desktop -32px bleed would leave the footer content literally flush
  to the card outer edge. Mobile overrides the margin to `32px -16px
  -32px -16px` — 16px of breathing inset at both sides. The hairline
  rule in row 1 still reads wide; the text no longer butts the edge.
- **Row 2 per-child text-align.** Desktop's `.bips__footer-row2` uses
  `justify-content: space-between` to distribute three phrases
  ("from an insight" / "to a proposal with legs" / "to a mock project.")
  across the full width as a left / center / right triad. Column-stacking
  at the mobile breakpoint would normally collapse this into three
  left-aligned lines, losing the distribution semantics. Per-child
  `text-align: left | center | right` on `:nth-child(1..3)` preserves
  the desktop placement vertically — the triad reads the same left →
  center → right cadence, just down instead of across.

### Multiverse — crafted-lite pass

Composition moves:

- **Grid unbind.** Desktop `.multiverse` is a 4-col grid with the
  poster-col at `grid-column: 2 / 4` and captions at `1 / -1` or
  `1 / 3`. Mobile drops the grid entirely (`display: flex;
  flex-direction: column; gap: var(--space-48)`) and resets each
  child's `grid-column` concerns via a flex-only composition.
- **Poster cap relaxation.** Desktop caps the poster at
  `max-width: fit-content; max-height: 80vh`. The `fit-content` cap
  makes the image render at its natural width (small on mobile) even
  though its parent is full-width — visually undersized. Mobile overrides
  both caps to `max-width: 100%; max-height: none; width: 100%` so the
  image fills the column with a narrow 16px gutter inside
  `.multiverse__poster-col`. Border-radius reduced from 24 → 16.
  The `useScroll`-driven dissolve and blur are **untouched** —
  motion survives the static-value edits.
- **Caption max-widths unbound.** Desktop pins `.multiverse__before-text`
  and `.multiverse__after-text` to `max-width: 240px` inside their grid
  columns. Mobile drops the cap so captions use the full column width
  with a standard `--space-24` cushion.

### API — crafted-lite pass

Composition moves:

- **Both section grids unbound.** `.api__two-col` (6-col grid: slider
  4/5 + side-col 5/7) and `.api__twitter-row` (flex row, 48px gap) both
  collapse into single flex columns on mobile. DOM order was already
  correct for the desired vertical stacking — no JSX re-order needed:
  - **Block 1**: slider (images + caption w/ arrows) → olive side-sheet
    (flows list + Asimov text).
  - **Block 2**: white quote-card (Medium×X spin badge) → olive tweet-col
    (label + TwitterEmbed).
- **Slider depth padding halved.** Desktop `.api__slider-inner`
  reserves `padding-left: 128px; padding-top: 128px` so the 2nd and
  3rd stacked cards peek up-left of the front card. At 375px that
  crushes usable image width. Halved to 64px — the depth read
  survives with ~30% less reveal room, adequate for the tight layout.
- **Slider gap.** 24px added between the stack and the caption row so
  the stack peek doesn't run into the caption on switch.
- **Caption viewport-left alignment.** `.api__caption-row` gets
  `margin-left: calc(var(--space-64) * -1)` to cancel the slider-inner's
  64px depth padding and land the caption at the sheet's natural left
  edge (not the image's left). This is a mobile-only trick — desktop
  keeps the caption aligned with the image.
- **Raw-variant caption reset.** `.api__slider--raw .api__caption-row`
  carries `width: 56.25%; margin-inline: auto` on desktop to match the
  portrait image's letterboxed width. Mobile resets both (`width: 100%;
  margin-inline: 0`) because the raw image also fills the width on
  mobile.
- **Caption jump prevention.** `.api__caption { min-height: calc(1.4em
  * 4) }` reserves four lines. Captions vary from 1 to 4 lines across
  slides and flows; without this, AnimatePresence `mode="wait"` collapses
  the row mid-exit and content below jumps. Pair with `align-items:
  start` on the row so the NavPill stays pinned at the first-line
  position rather than centering in the reserved block.
- **Quote-card repadded.** Desktop `.api__quote-card { padding-right:
  160px }` reserves space for the absolute spin badge in the bottom-right.
  At mobile widths 160px eats most of the column; override to
  `padding: var(--space-40); padding-bottom: var(--space-96);
  padding-right: var(--space-40)`. The spin badge shrinks from 64 → 56px
  (inner icon 56 → 48) and re-pins to `bottom: 16; right: 16` so it
  clears the prose that now flows where the padding used to be.
- **Tweet card desaturation.** `.tweet-card { filter: saturate(0.3) }`
  on mobile only. The olive palette reads as dominant in the shortened
  single-column layout; low saturation keeps the material cue without
  the green overpowering the block. First and only use of `filter` in
  this route — if another surface needs the same treatment, consider
  promoting to a CSS variable.

**Don't touch:**

- Keep the caption `margin-left: -64px` in lock-step with the
  slider-inner's `padding-left: 64px`. If one changes, the other must.
- Keep the caption `min-height: calc(1.4em * 4)`. Reducing it re-introduces
  the jump on slide/flow switch. Increasing it wastes vertical space.
- Keep `.api__caption-row { align-items: start }` on mobile. Without
  it the NavPill either stretches (default grid) or floats mid-row
  (centered) — both read as broken.

### Staying Anchored — photostack breathability

`.sa__stack` desktop reserves a 440×560 bounding box with image caps
of 400×480. At 375px this overflows the viewport. Mobile reduces the
authored values to 320×420 bounding box + 280×360 image caps (roughly
72–75% of desktop) — the photostack now fits with ~28px breathing on
each side of a 375px viewport.

- **No `transform: scale()`.** Crafted-lite bans `scale()` on authored
  canvases (playbook → Banned hacks) because it crushes pixel fidelity
  and interaction hit targets proportional to the scale. Reducing
  static values is the sanctioned approach.
- **Rotations track automatically.** `StayingAnchored.tsx` seeds the
  print rotations once on mount based on the stack bounding box.
  Smaller box → same angular variance but scaled stack → rotations
  read correctly without any JS adjustment.

---

## `#1DA1F2` (v0.35.0)

One hardcoded hex in `biconomy.css` — Twitter's brand blue, used only for
the `.tweet-card__bird` hover color. It is a brand citation, not part of
the portfolio's token ladder. Leave it hardcoded; do not introduce a
`--twitter-blue` token unless a second consumer appears.
