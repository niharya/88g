# / (landing) — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family").

**Scope warning:** this digest protects `app/page.tsx` + `app/landing.css` at the `app/` root — directory auto-loading will NOT fire when those files are edited. `app/CLAUDE.md` (the branch node) carries the pointer; treat it as binding.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale and what-breaks. This digest is the seatbelt; the archive is the manual.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

**Startooth engine vocabulary** (voids/keys/faces/top terms + the static-data-in-constants rule): ANOMALIES.md → "Startooth engine vocabulary".

## Don't-touch digest

- Group A (about-short) hero-tucks, Group B settles from above — never mix idioms; `--stack-stagger-start` is tuned against Group A's tuck-out, lowering it makes them compete. ANOMALIES.md → "Two-group card system"
- Group B cascade delays are sequential and append-only (never restart at 0) — reordering to match DOM order breaks the continuation. ANOMALIES.md → "Two-group card system"
- Every Group B card must hold all four collapsed-state properties (top/opacity/pointer-events/translateY); never re-anchor spectrum/contact to `--hero-top` or reintroduce `scale()` — breaks the settle physics / ghost-cards bug. ANOMALIES.md → "Group B collapsed-state contract"
- Group B cards rest at 0deg — reintroducing rotation needs a typed `@property` AND a batched reroll. ANOMALIES.md → "Group B card rotation — pinned to 0deg"
- Spectrum hover/press use standalone `translate:`/`scale:`, not `transform` — folding into `transform` clobbers the click reroll. ANOMALIES.md → "Spectrum hover + press affordance"
- Spectrum's tilt is scroll-driven via a CSS var, not Framer Motion — those motion values are inert on this component. ANOMALIES.md → "Spectrum scroll-driven tilt"
- Group B card top/opacity/transform must transition together, never staggered within one card — except spectrum's authored mobile deviation. ANOMALIES.md → "Expanded-state transition timing"
- The contact form-open +600px height bump must be remeasured when contact sizing or the reveal target changes. ANOMALIES.md → "Form-open height bump"
- Desktop cascade tops are a self-adjusting `calc()` chain off `--hero-top` + `--hero-h`; mobile hardcodes the rest — don't flatten desktop, remeasure mobile's linked set together. ANOMALIES.md → "Self-adjusting cascade (desktop) — tops derive off the settled hero bottom"
- `--hero-h` is JS-MEASURED via `ResizeObserver` (`offsetHeight`, not `contentRect`/`getBoundingClientRect`) — mobile `--projects-top` derives off it too. ANOMALIES.md → "`--hero-h` is JS-measured (ResizeObserver), not hand-authored"
- `.about-card--short` has no min-height; the hero docks via hand-tuned `--hero-top` — never hardcode min-height without retuning `--hero-top`. ANOMALIES.md → "`about-short` is natural-height; dock is manual per viewport"
- `--long-top`/`--projects-top` move with `--hero-top`; desktop overlaps about-short, mobile gaps — don't unify, it'd clip mobile text. ANOMALIES.md → "Mobile about-short can't overlap the hero — the offsets differ in KIND"
- `.about-card--long` (458px; `terra-560` keyline shared with about-practice/spectrum, `terra-160` ground) — don't restore the handoff's border or unify contact's keyline; graph-paper grid stays a `background-image` longhand (shorthand wipes it); REC/NOW red `#D23A02` is an out-of-ramp accent (don't token-ize); segments are tactile, not controls. ANOMALIES.md → "About-long is the practice timeline"
- Hover-open splits by width — Product uses `scale: 1.04 1`, narrow Interface/Brand widen via `width` (a nested counter-scale JUMPS on hover-out); only Product shows "years" at rest on desktop; seg numerals are a Geist Pixel `@font-face` reusing rr's public asset (renaming rr's file breaks it silently). ANOMALIES.md → "About-long is the practice timeline"
- Mobile `.hero-card__headline` is 20px, not desktop's 24px — self-corrects off live `--hero-h` now, but 20px stays the shipped floor. ANOMALIES.md → "Mobile hero headline is 20px — sized to clear the docked nav"
- Mobile about-short drops its divider and bottom padding — don't restore without re-measuring and bumping `--hero-top`. ANOMALIES.md → "Mobile about-short — divider hidden, padding dropped"
- The landing scrollbar is hidden — the expand-on-click affordance carries the "more content" signal in its place. ANOMALIES.md → "Landing scrollbar hidden"
- The framed sheet (desktop-only, mobile-reset enforced) fills the viewport minus a uniform `--sheet-margin` (no ratio/cap); `.caption-tag`/footer overrides stay on their OWN selectors — reordering the `box-shadow` list buries the lift shadow, folding them into the shared `pointer-events` opt-in floats the markers. ANOMALIES.md → "Framed sheet — the canvas is a centered page, not full-bleed (DESKTOP-ONLY for now)"
- `--sheet-scale` is a flat 1.02 readability nudge (desktop/iPad) / 1 (mobile) on `:root`, NOT a frame-coupled clamp; moving it off `:root`, or dropping the `.landing--expanded` height scale, desyncs the plate/footer. ANOMALIES.md → "Sheet harmonization (Phase 3) — content coupled + centred to the frame"
- The nav row counter-scales the plate ONLY when it shrinks (`scale: max(1, 1/--sheet-scale)`) so it grows with the 1.02 up-nudge; dropping `max(1,…)` shrinks it, folding into `transform` kills its `works-tuck-out` entrance. ANOMALIES.md → "Nav row is scale-exempt (counter-scales the plate)"
- Expand-dissolve eases on a time-based smootherstep, not a per-frame exponential — the exponential pops fills back in on collapse. ANOMALIES.md → "Expand-dissolve — the field cross-fades to a line drawing when expanded"
- `.landing--expanded` uses `overflow-x: clip` (not `hidden`) — swallows the 1.02-scaled plate's phantom horizontal scrollbar without making a scroll container that would trap vertical scroll. ANOMALIES.md → "Expanded state clips the overspilled plate on the X axis"
- `.startooth-canvas-root` must stay `position: fixed` — `absolute` lets the canvas scroll away when the landing expands. ANOMALIES.md → "Canvas is `position: fixed`, not `position: absolute`"
- The build-gate fade's `transition` must live only in the base rule, never the `:not(.landing--built)` guard — else the reveal snaps instead of fading. ANOMALIES.md → "CSS transition must live in the before-change rule, not the `:not()` guard"
- The first-paint background is two-layer and breakpoint-split (black mobile, grey desktop) — removing either layer or unifying the two flashes. ANOMALIES.md → "Black first-paint gap — two layers required, breakpoint-split"
- The staged sheet intro relies on a JS `GREY_HOLD_MS` mount delay — moving ink/corners back to `.landing--built` breaks the six-beat sequence. ANOMALIES.md → "Staged sheet intro — the sheet PLACES itself, holds grey, inks at build-start, frame last (DESKTOP-ONLY)"
- Full-bleed mobile Safari needs BOTH `viewport-fit: cover` AND the `.landing--built` bg swap — cover alone leaves black status/toolbar bars. ANOMALIES.md → "Full-bleed canvas needs `viewport-fit: cover` (global)"
- The pointer-events opt-in is scoped to interactive elements (`.hero-card` etc), never their sections — opting in sections swallows clicks meant for the canvas. ANOMALIES.md → "Pointer-events inversion — landing passes through, interactive ELEMENTS opt in (not sections)"
- `.landing--built` skips on `builtThisLoad` OR a `nav-direction: to-landing` return (one-shot token consumed IN the build gate, not the slide-in effect), plus a `FAILSAFE_MS` timeout — removing the failsafe strands a failed canvas at black; `builtThisLoad` stays module-level, never `sessionStorage`. ANOMALIES.md → "Build gate — three triggers and a JS failsafe"
- Hero headline cycling uses `localStorage` with a `useState(0)`+`useLayoutEffect` swap, not a lazy initializer — a lazy initializer hydration-mismatches. ANOMALIES.md → "Hero headline cycling — localStorage (not module state/sessionStorage), useLayoutEffect with a default-0 initializer (not a lazy one)"
- `markToBench` body-appends the `.route-hold` marker (React would unmount it); releases: `/all` mount, 8s failsafe, `pageshow`/`popstate`. ANOMALIES.md → "`markToBench` mounts the departure hold"
- `StartoothField` splits `prefersReduced` from `reduced` — merging them makes a rebuild run instantly even on a skip-loaded page. ANOMALIES.md → "A rebuild always animates — `reduced` splits from `skipBuild`"
- `stepFocus()`'s hover-release fades from captured `fadeFrom` with a linger — restoring the handoff's snap-to-full reintroduces the jerk. ANOMALIES.md → "Hover-release fade — three deliberate divergences from the handoff (no jerk)"
- Staged entrance is six gated, paused-until-triggered stages — retune `--dur-place`/`STAGE_SETTLE_MS`/`REVEAL_BEAT_MS` together or stages desync. ANOMALIES.md → "Staged entrance — card settles first, then the tabs, then the caption"
- `.landing--skip` disables the reveal transition (else returning visitors pin at `opacity:0`); the skip path mounts the field via `requestAnimationFrame`, not `requestIdleCallback` — the idle slot's blank-gap pop reads as "restarting". ANOMALIES.md → "Skip-on-return reveal must be instant — `.landing--skip` defeats a transition pin"
- Changing landing icons: run `npm run icons`, fall back to `/usr/bin/python3 scripts/icon_subset.py` on a `pyexpat` error. ANOMALIES.md → "Icon subset — system Python fallback for `icon_subset.py`"
- Idle breathing is driven by a self-scheduling `idleTick` timer, not a continuous rAF. ANOMALIES.md → "Idle breathing"
- Void rupture: the `rupturing` branch must lead `loop()`, `advancePalette()` must run before `rebuildFrom`, and the haptic must stay derived from `flickerSchedule`. ANOMALIES.md → "Void rupture (the 9-click easter egg)"
- `build()`'s lattice tile range is origin-relative/asymmetric (a symmetric ±count black-wedges corner rebuilds); on resize, `lockedKeys`/`chargeVoid` must both be cleared (stale `Unit` pointers). ANOMALIES.md → "Void rupture (the 9-click easter egg)"
- Touch presses activate the lamp effect via `pressFocus` — the touch substitute for hover, don't remove it. ANOMALIES.md → "Touch uses press-and-hold for the lamp effect — intentional, not a hover state"
- On slow mobile connections the failsafe may reveal the landing before the build completes — expected, don't lower the timer to fix it. ANOMALIES.md → "Failsafe fires before build completes on slow-connection mobile — expected degradation"
- `.contact-card__form-reveal` needs both `aria-hidden` and `inert` when closed — `aria-hidden` alone doesn't block keyboard focus. ANOMALIES.md → "Contact form `inert` when closed"
