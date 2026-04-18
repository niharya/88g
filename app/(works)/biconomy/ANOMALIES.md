# /biconomy — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/(works)/biconomy/`. Update it when an
architectural decision changes — not on every edit.

For project-level rules see `CLAUDE.md`.

---

## Known anomalies

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
capture button that posts the current chip layout to `/api/hud-capture`. That
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
- The 403 guard in `app/api/hud-capture/route.ts` must stay — this is a
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
