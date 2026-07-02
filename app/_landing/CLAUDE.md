# / (landing) — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family").

**Scope warning:** this digest protects `app/page.tsx` + `app/landing.css`, which live at the `app/` root — directory auto-loading will NOT fire from here when those files are edited. `app/CLAUDE.md` (the branch node) carries the hard pointer; treat that pointer as binding.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale and what-breaks. This digest is the seatbelt; the archive is the manual.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Startooth engine vocabulary

**Voids** — `star` (8-sided) and `diamond` (4-sided, below the star). `isVoid(u)` checks both.
**Keys** — `shortkey` (upper, between two stars; FACES_SHORTKEY + TOP_SHORTKEY) and `tallkey` (lower, between star and diamond; FACES_TALLKEY + TOP_TALLKEY). `isKey(u)` checks both. Key parts: **faces** (left+right panels) and **top** (protruding cap, distinctly coloured).
**Static data** — all geometry, palette, and timing live in `startooth-constants.ts`. `StartoothField` holds them as `private readonly` aliases — method bodies are unchanged. Editing a constant: change it in `startooth-constants.ts` only.

## Don't-touch digest

- Group A (about-short) hero-tucks, Group B (about-long, spectrum, about-practice, contact) settles from above — never mix idioms; `--stack-stagger-start` is tuned against Group A's tuck-out, lowering it makes them compete. ANOMALIES.md → "Two-group card system"
- Group B cascade delays are sequential and append-only (never restart at 0) — reordering to match DOM order breaks the continuation. ANOMALIES.md → "Two-group card system"
- Every Group B card must hold all four collapsed-state properties (top/opacity/pointer-events/translateY); never re-anchor spectrum/contact to `--hero-top` or reintroduce `scale()` — either breaks the settle physics / recreates the ghost-cards bug. ANOMALIES.md → "Group B collapsed-state contract"
- Group B cards rest at 0deg — reintroducing rotation needs a typed `@property` AND a batched reroll. ANOMALIES.md → "Group B card rotation — pinned to 0deg"
- Spectrum hover/press use standalone `translate:`/`scale:`, not `transform` — folding into `transform` clobbers the click reroll. ANOMALIES.md → "Spectrum hover + press affordance"
- Spectrum's tilt is scroll-driven via a CSS var, not Framer Motion — those motion values are inert on this component. ANOMALIES.md → "Spectrum scroll-driven tilt"
- Group B card top/opacity/transform must transition together, never staggered within one card — except spectrum's authored mobile deviation. ANOMALIES.md → "Expanded-state transition timing"
- The contact form-open +600px height bump must be remeasured whenever contact sizing or the form's reveal target changes. ANOMALIES.md → "Form-open height bump"
- Desktop cascade tops are a self-adjusting `calc()` chain off `--hero-top`; mobile hardcodes them — don't flatten desktop, remeasure mobile's linked set together. ANOMALIES.md → "Self-adjusting cascade (desktop) — tops derive off the settled hero bottom"
- `.about-card--short` has no min-height; the hero docks via hand-tuned `--hero-top` — never hardcode min-height without retuning `--hero-top`. ANOMALIES.md → "`about-short` is natural-height; dock is manual per viewport"
- `--long-top`/`--projects-top` move with `--hero-top`; desktop overlaps about-short, mobile gaps — don't unify, it'd clip mobile text. ANOMALIES.md → "Mobile about-short can't overlap the hero — the offsets differ in KIND"
- `.about-card--long` (458px, `terra-560` keyline shared with about-practice/spectrum, `terra-160` ground) — don't restore the handoff's border, or unify contact's distinct keyline. ANOMALIES.md → "About-long is the practice timeline"
- Its graph-paper grid must stay a `background-image` longhand (shorthand wipes it); REC/NOW red `#D23A02` stays an out-of-ramp accent, don't token-ize it; segments are tactile not controls (`cursor: auto`). ANOMALIES.md → "About-long is the practice timeline"
- Seg numerals use a Geist Pixel `@font-face` reusing rr's public asset — renaming rr's file breaks it silently; mobile type is recomposed smaller, re-measure if proportions change. ANOMALIES.md → "About-long is the practice timeline"
- Mobile `.hero-card__headline` is 20px, not desktop's 24px — bumping it swallows the hardcoded mobile nav dock unless `--projects-top` is retuned too. ANOMALIES.md → "Mobile hero headline is 20px — sized to clear the docked nav"
- Mobile about-short drops its divider and bottom padding — don't restore without re-measuring and bumping `--hero-top`. ANOMALIES.md → "Mobile about-short — divider hidden, padding dropped"
- The landing scrollbar is hidden — the expand-on-click affordance carries the "more content" signal in its place. ANOMALIES.md → "Landing scrollbar hidden"
- The framed sheet (desktop-only, mobile-reset enforced) is height-driven with shared `--sheet-*` tokens; `.caption-tag`/footer positional overrides must stay on their OWN selectors — reordering the `box-shadow` list buries the lift shadow, folding overrides into the shared `pointer-events` opt-in floated the markers (a real bug). ANOMALIES.md → "Framed sheet — the canvas is a centered page, not full-bleed (DESKTOP-ONLY for now)"
- Phase 3's `--sheet-scale` bridge is gated to iPad+desktop, must live on `:root` — moving it, or missing the `.landing--expanded` height scale, desyncs the plate/footer. ANOMALIES.md → "Sheet harmonization (Phase 3) — content coupled + centred to the frame"
- The nav row counter-scales via standalone `scale:` with a `top center` origin — folding into `transform` kills its `works-tuck-out` entrance. ANOMALIES.md → "Nav row is scale-exempt (counter-scales the plate)"
- Expand-dissolve eases on a time-based smootherstep, not a per-frame exponential — the exponential pops fills back in on collapse. ANOMALIES.md → "Expand-dissolve — the field cross-fades to a line drawing when expanded"
- `.startooth-canvas-root` must stay `position: fixed` — `absolute` lets the canvas scroll away when the landing expands. ANOMALIES.md → "Canvas is `position: fixed`, not `position: absolute`"
- The build-gate fade's `transition` must live only in the base rule, never the `:not(.landing--built)` guard — else the reveal snaps instead of fading. ANOMALIES.md → "CSS transition must live in the before-change rule, not the `:not()` guard"
- The first-paint background is two-layer and breakpoint-split (black mobile, grey desktop) — removing either layer or unifying the two flashes. ANOMALIES.md → "Black first-paint gap — two layers required, breakpoint-split"
- The staged sheet intro relies on a JS `GREY_HOLD_MS` mount delay — moving ink/corners back to `.landing--built` breaks the six-beat sequence. ANOMALIES.md → "Staged sheet intro — the sheet PLACES itself, holds grey, inks at build-start, frame last (DESKTOP-ONLY)"
- Full-bleed mobile Safari needs BOTH `viewport-fit: cover` AND the `.landing--built` bg swap — cover alone leaves black status/toolbar bars. ANOMALIES.md → "Full-bleed canvas needs `viewport-fit: cover` (global)"
- The pointer-events opt-in is scoped to interactive elements (`.hero-card` etc), never their sections — opting in sections swallows clicks meant for the canvas. ANOMALIES.md → "Pointer-events inversion — landing passes through, interactive ELEMENTS opt in (not sections)"
- `.landing--built` has three triggers including a `FAILSAFE_MS` timeout — removing it strands a failed canvas at black; `builtThisLoad` is module-level, never `sessionStorage`, or every reload wrongly skips the build. ANOMALIES.md → "Build gate — three triggers and a JS failsafe"
- Hero headline cycling uses `localStorage` with a `useState(0)`+`useLayoutEffect` swap, not a lazy initializer — a lazy initializer hydration-mismatches. ANOMALIES.md → "Hero headline cycling — localStorage (not module state/sessionStorage), useLayoutEffect with a default-0 initializer (not a lazy one)"
- `StartoothField` splits `prefersReduced` from `reduced` — merging them makes a rebuild run instantly even on a skip-loaded page. ANOMALIES.md → "A rebuild always animates — `reduced` splits from `skipBuild`"
- `stepFocus()`'s hover-release fades from captured `fadeFrom` with a linger — restoring the handoff's snap-to-full reintroduces the jerk. ANOMALIES.md → "Hover-release fade — three deliberate divergences from the handoff (no jerk)"
- Staged entrance is six gated, paused-until-triggered stages — retune `--dur-place`/`STAGE_SETTLE_MS`/`REVEAL_BEAT_MS` together or stages desync. ANOMALIES.md → "Staged entrance — card settles first, then the tabs, then the caption"
- `.landing--skip` disables the reveal transition — without it, returning visitors pin at `opacity:0` forever. ANOMALIES.md → "Skip-on-return reveal must be instant — `.landing--skip` defeats a transition pin"
- Changing landing icons: run `npm run icons`, fall back to `/usr/bin/python3 scripts/icon_subset.py` on a `pyexpat` error. ANOMALIES.md → "Icon subset — system Python fallback for `icon_subset.py`"
- Idle breathing is driven by a self-scheduling `idleTick` timer, not a continuous rAF — don't convert it to one. ANOMALIES.md → "Idle breathing"
- Void rupture: the `rupturing` branch must lead `loop()`, `advancePalette()` must run before `rebuildFrom`, and the haptic must stay derived from `flickerSchedule`. ANOMALIES.md → "Void rupture (the 9-click easter egg)"
- `build()`'s lattice tile range is origin-relative/asymmetric (a symmetric ±count black-wedges corner rebuilds); on resize, `lockedKeys`/`chargeVoid` must both be cleared (stale `Unit` pointers). ANOMALIES.md → "Void rupture (the 9-click easter egg)"
- Touch presses activate the lamp effect via `pressFocus` — it's the touch substitute for hover, don't remove it. ANOMALIES.md → "Touch uses press-and-hold for the lamp effect — intentional, not a hover state"
- On slow mobile connections the failsafe may reveal the landing before the build completes — expected, don't lower the timer to fix it. ANOMALIES.md → "Failsafe fires before build completes on slow-connection mobile — expected degradation"
- `.contact-card__form-reveal` needs both `aria-hidden` and `inert` when closed — `aria-hidden` alone doesn't block keyboard focus. ANOMALIES.md → "Contact form `inert` when closed"
