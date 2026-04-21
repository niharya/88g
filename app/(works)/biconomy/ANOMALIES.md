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

`/biconomy` has only just begun its crafted-lite pass. The BIPs chapter is
the reference section that ships with `docs/responsive-playbook.md` — the
remaining chapters (Intro, UX Audit, Flows, Multiverse, Demos, API, Situational
Awareness) have **not yet had a pass**. Until they do, any mobile breakage in
those sections is expected and unaddressed.

The BIPs mobile block lives at the end of `biconomy.css` under the heading
`/* ── BIPs — crafted-lite pass ── */`. Each composition decision below
maps to a shape in the playbook; read that entry before modifying.

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

## `#1DA1F2` (v0.35.0)

One hardcoded hex in `biconomy.css` — Twitter's brand blue, used only for
the `.tweet-card__bird` hover color. It is a brand citation, not part of
the portfolio's token ladder. Leave it hardcoded; do not introduce a
`--twitter-blue` token unless a second consumer appears.
