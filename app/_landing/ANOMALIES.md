# / (landing) — Anomalies

Route-level architectural anomalies, cross-file wiring, and don't-touch items for the landing route. Code lives at `app/page.tsx` + `app/landing.css` (no dedicated route folder; `app/_landing/` is a stash/docs dir — the `_` prefix keeps Next.js from routing it).

Read this before touching the expand choreography or anything in the secondary stack.

**How to read this file: grep the heading named by the digest's pointer and read only
that section.** Never read the whole archive — the Index below is the cheap map; full
entries load per-section, on demand.

## Index

- **Two-group card system** — Group A (hero-tuck) vs Group B (settle-from-above) idioms, choreography tokens, cascade offsets, Group B order.
- **Group B card rotation — pinned to 0deg** — Group B cards rest at 0deg; what's required to restore random tilt.
- **Spectrum scroll-driven tilt** — scroll-mapped `--spec-scroll-tilt` CSS var; why Framer Motion was rejected here.
- **Spectrum hover + press affordance** — desktop-gated lift/press on `.spectrum__frame`, composing `translate:`/`scale:` over the click reroll.
- **Group B collapsed-state contract** — the four required properties on every collapsed Group B card; historical ghost-cards regression.
- **Expanded-state transition timing** — top/opacity/transform must move together per card; spectrum's mobile deviation.
- **Form-open height bump** — the `:has(.contact-card--form-open)` +600px height compensation.
- **Contact form `inert` when closed** — `aria-hidden` + `inert` both required to block keyboard focus.
- **Self-adjusting cascade (desktop) — tops derive off the settled hero bottom** — the desktop `calc()` chain vs mobile's hardcoded tops.
- **`--hero-h` is JS-measured (ResizeObserver), not hand-authored** — why `--hero-h` is a live `offsetHeight` read, not a hand-typed literal; the `contentRect`/`getBoundingClientRect` traps to avoid.
- **`--expanded-h` follows practice card height** — desktop/mobile expanded scroll-height tails.
- **About-long is the practice timeline** — the practice-timeline card's framing, shared bento keyline, grid footgun, REC accent, Geist Pixel numerals, mobile type recompose.
- **Responsive anomalies** — wrapper: mobile-only landing behaviors below.
- **`about-short` is natural-height; dock is manual per viewport** — no min-height; hero docks via hand-tuned `--hero-top`.
- **Mobile about-short can't overlap the hero — the offsets differ in KIND** — desktop overlaps, mobile gaps; don't unify.
- **Mobile hero headline is 20px — sized to clear the docked nav** — load-bearing size tied to the hardcoded mobile `--projects-top`.
- **Mobile about-short — divider hidden, padding dropped** — mobile-only card recipe deviation for tight above-hero space.
- **Landing scrollbar hidden** — `html:has(.landing)` hides the scroll indicator; native scroll unaffected.
- **Full-bleed canvas needs `viewport-fit: cover` (global)** — the root layout viewport export + the `.landing--built` background swap, together.
- **Don't-touch list** — quick-reference summary of the Two-group card system constraints.
- **Startooth canvas** — wrapper: the three canvas files and how they're loaded.
- **Framed sheet — the canvas is a centered page, not full-bleed (DESKTOP-ONLY for now)** — the desktop framed-sheet geometry, matte, mobile full-bleed reset, caption/footer tuck.
- **Staged sheet intro — the sheet PLACES itself, holds grey, inks at build-start, frame last (DESKTOP-ONLY)** — the six-beat desktop sheet arrival sequence and its JS grey-hold.
- **Sheet harmonization (Phase 3) — content coupled + centred to the frame** — the `--sheet-scale` JS bridge, viewport-centring, footer bar, portrait/landscape cap rules.
- **Nav row is scale-exempt (counter-scales the plate)** — the nav row's constant-size counter-scale trick.
- **Canvas is `position: fixed`, not `position: absolute`** — why `absolute` breaks the expanded state.
- **Expand-dissolve — the field cross-fades to a line drawing when expanded** — the filled↔line cross-fade and its time-based easing.
- **CSS transition must live in the before-change rule, not the `:not()` guard** — why the build-gate fade transition can't move to the `:not()` selector.
- **Black first-paint gap — two layers required, breakpoint-split** — the two `#000` layers, and the desktop-only grey override.
- **Pointer-events inversion — landing passes through, interactive ELEMENTS opt in (not sections)** — why the opt-in is scoped to elements, not sections.
- **Build gate — three triggers and a JS failsafe** — the three paths to `.landing--built`, and why `builtThisLoad` is module-level.
- **Hero headline cycling — localStorage (not module state/sessionStorage), useLayoutEffect with a default-0 initializer (not a lazy one)** — persistence choice and the hydration-safe swap pattern.
- **Failsafe fires before build completes on slow-connection mobile — expected degradation** — why the failsafe timer shouldn't be lowered.
- **A rebuild always animates — `reduced` splits from `skipBuild`** — why `StartoothField` keeps two reduced-motion flags.
- **Staged entrance — card settles first, then the tabs, then the caption** — the six-beat reveal sequence and its linked timing knobs.
- **Skip-on-return reveal must be instant — `.landing--skip` defeats a transition pin** — why the skip path needs `transition: none`.
- **Hover-release fade — three deliberate divergences from the handoff (no jerk)** — `stepFocus()`'s fade-from-capture, lit-key hold, and linger/smootherstep.
- **Touch uses press-and-hold for the lamp effect — intentional, not a hover state** — the touch substitute for hover on keys.
- **Icon subset — system Python fallback for `icon_subset.py`** — the `pyexpat` Homebrew breakage workaround.
- **Idle breathing** — the self-scheduling idle-swell timer and its guards.
- **Void rupture (the 9-click easter egg)** — the hidden interaction's loop ordering, charge model, stale-pointer clearing, haptic, and asymmetric tile range.

---

## Two-group card system

The landing has two logical groups of cards, and their entrance/exit motion must stay in separate idioms:

- **Group A — hero-tucked.** `about-short` only. It lives *inside* the hero's mental frame in the default state and tucks out on expand via `top`/`transform` **transitions** (the `hero-glide-*` keyframes are mount-entrance only — not expand choreography). No random rotation exists anywhere in Group A; that system was removed.
- **Group B — secondary stack.** `about-long`, `spectrum`, `about-practice`, `contact` (in DOM order; see "Group B order" below). These live *below* the hero in the expanded state only. In the default state they are opacity 0 with a small upward `translateY(-var(--stack-settle))` offset and `pointer-events: none`. On expand, they settle from above into place.

**Do not mix idioms.** Do not apply Group A's hero-tuck transitions to Group B cards, and do not apply Group B's opacity-fade-settle to Group A. `about-practice` is part of Group B, not an extension of `about-long`, even though the copy continues.

**`about-long` migrated A→B (practice-timeline redesign).** about-long used to be Group A — it tucked behind the hero via `top`/`scale`. The practice-timeline redesign (see "About-long is the practice timeline" below) made the card ~370px tall (desktop) / ~379px (mobile), too tall to tuck behind the 240px hero without poking far below it — the same height reason about-practice is Group B. So about-long moved to Group B: settle-from-above via opacity + `translateY(-stack-settle)`, no scale. It was already invisible on the collapsed home screen when tucked, so Group B preserves its visibility behavior (hidden collapsed, revealed on expand) while removing the poke. Its inner `.about-card--long` now sets `animation: none` to opt out of the `hero-glide-up` mount keyframe (same as about-practice), so the section transition owns the entrance. Don't move it back to Group A without shrinking the card back under the hero.

### Choreography tokens

Defined on `.landing` in `landing.css`:

- `--stack-stagger-start: 0.22s` — delay before Group B begins its entrance, so Group A is ~73% through its tuck-out before Group B starts. Lower values cause visual competition.
- `--stack-settle: var(--space-24)` — Y-offset Group B cards start from (above their resting top). Creates the "settling from above" read.
- `--stack-gap: 40px` — design intent for vertical rhythm between Group B cards' unrotated boundaries. Used when positioning new stack cards.

**Cascade offsets.** spectrum (no offset), about-practice (`+0.02s`), contact (`+0.04s`), about-long (`calc(var(--stack-stagger-start) + 0.06s)`). about-long is positionally the FIRST Group B card in the expanded stack but its expand delay was **appended** at +0.06s rather than restarting the cascade at 0 — honoring the "continue, never restart at 0" rule. The 60ms spread is sub-perceptual; spectrum/practice/contact delays were left untouched. Do not reorder these to match DOM/visual order.

### Group B order

about-long is the first Group B slot, spectrum sits below it, about-practice below that, contact last. On desktop these tops are now a SELF-ADJUSTING `calc()` chain — see "Self-adjusting cascade (desktop)" below: `--projects-top`/`--long-top`/`--spectrum-top`/`--practice-top`/`--contact-top`/`--expanded-h` all derive off the settled hero bottom, each offset = the block above's height + gap. So changing the hero height re-docks the whole stack automatically; only the per-block offset constants need touching if a CARD's height changes. **Mobile still uses its own hardcoded px values** for all of these (the `@media (max-width: 767px)` block) — there the old "remeasure the linked set in tandem, per viewport" rule still applies until mobile is migrated to the same chain.

## Group B card rotation — pinned to 0deg

`about-practice` (and any future Group B card) opens at 0deg. The earlier random-rotation system (`--practice-rot`, `rerollStackRotations()`, `@property --practice-rot` registration) was removed in favour of an axis-aligned rest. If a future Group B card needs random tilt, restore the `@property <angle>` typing AND batch the reroll with `setExpanded` in the same React commit (untyped custom properties snap mid-transition; a `useEffect([expanded])` reroll lags one render and ghost-flickers).

## Spectrum scroll-driven tilt

The spectrum sheet's artistic angle is driven by scroll position, replacing the old static `rotate(-1deg)` (see the rewritten note in "Group B collapsed-state contract").

**What it is.** `0°` at the top of the page, easing to `−1°` over the first **120px** of scroll. Applied as a CSS custom property `--spec-scroll-tilt` on `.spectrum` (`transform: rotate(var(--spec-scroll-tilt, 0deg))`, **no CSS transition** on the rotate), set by a rAF-throttled window-scroll listener in `app/page.tsx` (a `useEffect` writing `el.style.setProperty`). The sheet reads straight as you reach it and tilts to its rest as you scroll down; scrolling back up straightens it. Frozen at `0°` under `prefers-reduced-motion: reduce`.

**Composes with the click reroll on a different element.** The scroll rotate lives on the parent `.spectrum`; the click reroll (`specRotation` React state, ±1/±2°, inline `transform: rotate()` with a `transform` CSS transition) lives on the child `.spectrum__frame`. Two elements, two transforms — they multiply, they don't fight. The click reroll is otherwise unchanged.

**Framer Motion was tried and rejected here — do not "modernize" it back.** First attempt used `useScroll`/`useSpring`/`useTransform` + a `motion.div`. Those motion values were **inert in this component**: scroll- and spring-driven updates never propagated to the DOM (only a manual `.set()` moved the element). The CSS-var + rAF-throttled scroll listener replaced it and works. If you see the imperative `el.style.setProperty('--spec-scroll-tilt', …)` and reach for `useScroll`/`useSpring` to tidy it, you will reintroduce the inert-motion-value bug.

## Spectrum hover + press affordance

The spectrum is genuinely interactive (clicking cycles the palette), so it carries site-consistent hover/press feedback. This replaced an older inset-shadow-on-`.spectrum__inner` hover.

**Hover (desktop-gated).** Behind `@media (hover: hover) and (min-width: 768px) and (min-height: 501px)`: a mild paper lift on `.spectrum__frame` — `translate: 0 -2px` + `box-shadow: var(--shadow-raised)`, on `--dur-slide`/`--ease-paper`. The frame carries a **transparent base shadow** (`0 3px 8px -1px rgba(0,0,0,0)`) so the hover shadow can fade in — box-shadow can't interpolate from `none`. Don't drop the transparent base or the lift will pop instead of fade.

**Press.** `.spectrum--pressed .spectrum__frame { scale: 0.99 }`, toggled by `specPressed` React state via `onPointerDown`/`onPointerUp`/`onPointerLeave` in `page.tsx`, on `--dur-instant`/`--ease-snap`.

**Hover also strengthens the gradient bar.** Hovering anywhere on `.spectrum` (`.spectrum:hover`) deepens the vertical gradient bar `.spectrum__gradient`: opacity rises (base `0.1` → hover `0.32`) and the gradient's top stop lifts (its `var(--orange-800)` mix from ~5% → ~26%). It eases on `--dur-slide`/`--ease-paper`, so the base `.spectrum__gradient` rule carries a `transition` on `opacity` + `background` for it to interpolate. This is the spectrum-wide hover read (alongside the frame lift); don't drop the transition on the base rule or the gradient will snap rather than swell.

**Lift and press use standalone `translate:`/`scale:`, NOT `transform` (load-bearing).** `.spectrum__frame` already owns `transform: rotate()` (the click reroll). The hover lift and press scale are expressed via the standalone `translate:` and `scale:` CSS properties so they **compose** with that rotate instead of overriding it — the same idiom rr's StoryCard uses. Folding any of these into `transform` would clobber the click reroll.

## Group B collapsed-state contract

Every Group B card in `.landing--default` must:

- set `top` to its final expanded position (not off-screen)
- set `opacity: 0`
- set `pointer-events: none`
- include a `translateY(calc(-1 * var(--stack-settle)))` offset in its transform

This pattern is what gives Group B its "settle from above" read. A card that drops any of these four properties will enter the stack with the wrong physics.

**Historical note.** Spectrum and contact previously violated this contract — they started at `--hero-top` with `scale(0.9)` and slid ~1000–1350px down to their final positions while fading in. The long descent read as ghost cards trailing behind the settled hero. They were brought into full compliance so all three Group B cards now settle from ~24px above in place. Do not regress this by re-anchoring spectrum/contact to `--hero-top` or reintroducing `scale()` on them.

**Spectrum's artistic tilt is now scroll-driven, not a static `rotate(-1deg)`.** Spectrum *used to* carry a fixed `rotate(-1deg)` baked into its transform at all breakpoints. That static rotation was **removed from all four `.landing__section--spectrum` rules** (desktop + mobile, collapsed + expanded) — those rules now carry only the Group-B settle transform (translateX/translateY), and the settle contract is otherwise untouched (no ghost-cards regression). The tilt now lives on `.spectrum` and animates with scroll — see "Spectrum scroll-driven tilt" below. The "Group B pinned to 0deg" rule still refers specifically to the removed random `--practice-rot` reroll; this scroll tilt is the authored artistic angle, just relocated and made motion-aware.

## Expanded-state transition timing

Group B cards transition `top`, `opacity`, and `transform` on expand. All three use `var(--dur-slide)` with `var(--ease-paper)`, delayed by `--stack-stagger-start` (+ cascade offset per card). Do not stagger these three properties against each other within a single card — they must move as one.

**Documented mobile deviation (spectrum only).** The mobile block puts spectrum's `transform` on `--dur-settle` with a +0.12s extra delay while `top`/`opacity` stay on the base beat. Shipped and authored — don't "fix" it to match the desktop rule, and don't copy the stagger to other cards.

## Form-open height bump

`.landing--expanded:has(.contact-card--form-open)` adds +600px to both `.landing--expanded` and `.landing__content` heights. Without this, the open contact card overflows past the fixed `--expanded-h` (overflow is `visible`, so the form renders, but the document ends flush against the form's last pixel — no breathing gap below). The bump is wired via `:has()` so React doesn't have to thread a `--form-open` modifier up to `.landing`. If you change `--contact-top`, the contact card collapsed height, or the form's `max-height` reveal target, remeasure the +600 value at all breakpoints (target ~96px gap below the fully-open form).

## Contact form `inert` when closed

`.contact-card__form-reveal` carries both `aria-hidden={!formOpen}` and `inert={!formOpen ? true : undefined}` in `page.tsx`. `aria-hidden` removes the form from the accessibility tree but does **not** block keyboard focus — a keyboard-only user (no screen reader) could Tab into the invisible fields inside the `overflow: hidden` / zero `max-height` container while the form is collapsed. `inert` closes that gap: it suppresses both keyboard focus and AT access in a single attribute. Don't remove `inert` thinking `aria-hidden` is sufficient — they serve different users.

## Self-adjusting cascade (desktop) — tops derive off the settled hero bottom

**What it is.** In `:root` (`landing.css`), only `--hero-top` + `--hero-h` are free measurements. `--projects-top`, `--long-top`, `--spectrum-top`, `--practice-top`, `--contact-top`, and `--expanded-h` are DERIVED as a `calc()` chain off the settled hero bottom (`--hero-top + --hero-h`): each value = the block above's position + that block's height + its gap (e.g. `--spectrum-top: calc(var(--long-top) + 477px)`, where the inline comment names the block — about-long 447 + 30 gap). `--projects-top` and `--long-top` tuck a few px UP under the hero (the `- 6px` / `- 31px` terms) so the markers + about-long's statement read as docked into the card.

**Why.** Changing the hero height (the common edit, when about-short copy or hero copy shifts) used to require manually re-pushing the whole marker + Group-B stack in tandem, per viewport — a linked set that desynced easily. The chain re-docks everything automatically: move `--hero-top`/`--hero-h` and the markers and entire Group-B stack follow. The per-block offset constants (the `+ Npx` terms = each card's height + gap) only need touching if a CARD's height changes — rare, vs. the hero, common.

**Mobile is NOT on the chain.** The `@media (max-width: 767px)` block overrides all of these with its own hardcoded px values — so on mobile the old "remeasure the linked set together, per viewport" discipline still holds. (The framed sheet is desktop-only for now; mobile's framed-sheet adaptation, and likely its migration to the same derived chain, is deferred.)

**What breaks if flattened back to literals.** Hardcoding the derived tops back to px (as mobile still is) means a hero-height change silently floats the markers and throws off every Group-B dock until each is re-measured by hand — the exact failure the chain was built to remove. Don't "simplify" the desktop `calc()` chain to fixed values.

## `--hero-h` is JS-measured (ResizeObserver), not hand-authored

**What it is.** `--hero-h` (the one free measurement the whole cascade above derives from) used to be a hand-typed literal in `landing.css` (`289px`) — a guess that drifted the moment the hero's real rendered height changed (the headline cycle, the time-of-day greeting, font load, viewport reflow). A drifted `--hero-h` desyncs the entire derived chain even though the chain math itself is correct — this is exactly what left the Nihar/Works nav row visibly offset from the card. Now a `ResizeObserver` in `page.tsx` (`heroBgRef`, attached to `.hero-card__bg`) writes the element's REAL height to `--hero-h` on `.landing` (the var's declared scope — not `:root`, matching the `--sheet-scale` bridge) every time it changes. `landing.css`'s `--hero-h: 240px` is now just the SSR/pre-mount bootstrap value (matches `.hero-card__bg`'s own `min-height: 240px` floor) — overwritten the instant the effect mounts.

**The measurement must be `offsetHeight`, not `contentRect.height` or `getBoundingClientRect()`.** `entry.contentRect.height` (the observer's own callback arg) is CONTENT-BOX only — it undercounts by the card's own padding (`32px 64px 40px`), so it fed the chain a value ~72px too short (measured: 168px instead of 240px). `getBoundingClientRect()` is wrong for a different reason: `--hero-h` feeds the UNSCALED `calc()` chain, but `getBoundingClientRect()` would pick up the `--sheet-scale` transform applied to an ancestor (`.landing__content`, Phase-3 harmonization) — double-applying the scale. `el.offsetHeight` is border-box, in the element's own untransformed coordinate space — the one reading that matches what the chain expects.

**Mobile joins partially.** `--projects-top` (the nav marker) now derives off the same live `--hero-h` on mobile too (`calc(var(--hero-top) + var(--hero-h) - 6px)`, replacing a hand-typed `350px` that had the identical drift bug). The rest of the mobile Group-B stack (`--long-top`/`--spectrum-top`/`--practice-top`/`--contact-top`) stays its own hardcoded set, untouched — scoped deliberately to the nav marker, since that's what the change was asked to fix; migrating the rest of the mobile stack onto the chain is a separate, larger pass.

**Don't** revert to a hand-typed `--hero-h` literal, and don't swap the ResizeObserver callback to read `contentRect.height` or measure via `getBoundingClientRect()`.

## `--expanded-h` follows practice card height

On desktop `--expanded-h` is the tail of the self-adjusting cascade (`calc(var(--contact-top) + 345px + var(--space-48))` = contact block + footer margin + a `--space-48` footer-clearance pad so the fixed footer bar never tucks under the contact card at rest) — see "Self-adjusting cascade" above. The per-block offset constants in that chain (the 345px tail) were measured against the current card heights; if a card's content changes materially, update that block's offset constant. On mobile `--expanded-h` mirrors the same clearance (`calc(2292px + var(--space-48))`), still a hardcoded px base alongside `--spectrum-top`/`--contact-top` — remeasure those together there.

## About-long is the practice timeline

`.about-card--long` is no longer a centered lead-paragraph + discipline-year-chip list. It was redesigned as the **practice timeline**: a proportional data-viz where each segment's WIDTH encodes years in a specialization (Interface ~20% / Brand / Product), running end-to-end so "one thing at a time" reads literally. Recomposed from the 800×480 handoff at `reference/design_handoff_practice_card` into the landing column. Migration to Group B and the retuned linked tops are covered above ("Two-group card system" → "`about-long` migrated A→B"; "Group B order"). The framing, accent, and footgun notes specific to this card:

**Framing recompose — black border shed, terra keyline kept.** Width is 458px (= spectrum's, to give the timeline room). The handoff's black 2px border + heavy drop shadow were dropped in favor of our `--shadow-resting` plus a `terra-560` keyline `::before` (inset `var(--space-8)`, echoing the about-practice mat idiom). Ground stays `--terra-160`. Don't reintroduce the handoff's hard border/shadow — it reads as a foreign card, not part of the mat family.

**The bento tiles share ONE keyline idiom.** about-long, about-practice, and spectrum all draw the same 1px hairline keyline inset `var(--space-8)` in `terra-560` — this card's `::before` is one instance of that shared idiom, not a one-off. Contact's keyline is deliberately DISTINCT: its own ground `terra-100` + a different border colour (`terra-800`) — don't unify contact's keyline with the other three. Spectrum's old dark `--surface-bg` frame was replaced by this same keyline (`.spectrum__frame::before`, `z-index: 2`, sitting over the terra-160 `.spectrum__bg`); spectrum's hover/press affordance still rides `.spectrum__frame` independently (see "Spectrum hover + press affordance"). Don't reintroduce spectrum's old dark frame, and don't drift any of the three shared-idiom cards off the `terra-560` inset value.

**Graph-paper grid MUST stay `background-image` longhand (footgun).** A terra-tinted graph-paper grid (`rgba(140,110,45,0.06)`, 32px cell) is layered via the `background-image` longhand. The base `.about-card` rule owns the ground color through a `background:` **shorthand**, and the shorthand resets `background-image`. If you fold this grid into a shorthand on `.about-card--long`, or move the ground to a shorthand here, the grid is wiped. Keep it longhand.

**REC/NOW red `#D23A02` is a deliberate out-of-ramp literal.** The recording-signal red on the NOW tick and the pulsing REC dot is intentionally OUTSIDE the terra ramp — a single-use, route-local accent, not a system token. Don't "fix" it to a terra value or promote it to `globals.css`.

**Hover hatch reconciled to our motion; segments are not controls.** The per-segment hatch (dots/rules/crosshatch) rides a `::after` overlay that fades in via `opacity var(--dur-fast) var(--ease-snap)` — NOT the handoff's instant `background-image` swap — so feedback eases like the rest of the site. Segments are tactile surfaces only: `cursor` stays `auto` (no false click affordance, per the "controls must not lie" hard rule). The REC dot pulse is the `recpulse` keyframe (1.4s), guarded by `prefers-reduced-motion: reduce`. Don't restore the instant swap, and don't add a click cursor/handler to segments.

**Card top padding clears the nav-pill row.** Top padding is `--space-80` (desktop) / `--space-56` (mobile), sides `--space-32` — the larger top clears the Nihar/Works nav pill row that overlays the card top. (This replaced the old card's `--space-24` side padding pinned to the discipline-chip line.)

### Mobile type recompose (practice timeline)

At the ~60px Interface segment (~20% of 458 → narrowest column), the desktop type sizes overflow. The mobile block (`max-width: 767px`) overrides: statement 20px, captions 7px (so "Interaction" clears the column without colliding), seg padding `0 8px`, seg-label 9px. The seg-num size is a single 24px value across breakpoints (see "Seg numerals are Geist Pixel" below) — the earlier mobile 26px override was removed. These are pinned to the segment widths at the mobile column — re-measure if the year proportions or column width change.

### Seg numerals are Geist Pixel (route-local `@font-face`)

The segment numerals (`.practice-timeline__seg-num`, the 02 / 03 / 05) render in **Geist Pixel**, a pixel/grid display font, instead of Fraunces — a recording-counter look that suits the card's REC/NOW motif.

**Route-local `@font-face`, shared public asset.** The font is declared by an `@font-face` at the TOP of `app/landing.css` (`font-family: 'Geist Pixel'`, `src: url('/images/rr/GeistPixel-Grid.woff2')`). It reuses the same public asset that `app/(works)/rr/rr.css` declares for rr's structure-view title — **routes don't share fonts via imports**, so the landing redeclares its own `@font-face` against the shared file. Note the coupling: the asset path is rr-named but it's a public file addressable from anywhere; if rr's asset is renamed or moved, this declaration breaks silently (numerals fall back to `monospace`).

**Size is one 24px value (desktop + mobile).** Chosen to match rr's Geist Pixel title and `t-h2`. The earlier mobile 26px numeral override was removed — 24px fits the narrow 20% Interface segment without clipping. The timeline bar is fixed-height, so the font/size swap did NOT change card height or any of the linked tops (see "Group B order").

---

## Responsive anomalies

## `about-short` is natural-height; dock is manual per viewport

`.about-card--short` has **no** `min-height`. The card shrinks to its natural content height (a single short centered line — wrapping to ~2 lines on mobile — + tight padding + a divider above the bottom edge on desktop), and the hero docks against that natural bottom via a manually-tuned `--hero-top` per viewport:

- desktop: `--hero-top: 132px`, `--short-top: var(--space-56)` (56), natural card height ~76 → the hero docks with a small overlap into about-short's bottom padding / hidden divider (the desktop clip-buffer — see "Mobile about-short can't overlap the hero" below).
- mobile: `--hero-top: 84px`, `--short-top: var(--space-24)` (24), natural card height ~78 (no divider) → the hero docks just BELOW the card bottom, not overlapping it (see the same entry).

**Why this changed.** The original architecture locked `min-height: calc(var(--hero-top) - var(--short-top))` so the card always filled the dock space at every breakpoint. That worked when the short-copy was the long-form three-clause paragraph it used to be, but the current copy is a single short line (it has only shrunk further since), and the locked min-height left dead space inside the card. Switching to natural-height + token-tuned dock removed that whitespace without breaking the dock.

**If the copy ever grows back.** Either bump `--hero-top` (desktop and mobile) by the new card-height delta, or restore the calc + min-height approach. Don't ship a hardcoded `px` min-height without a tuned `--hero-top` — they'll desync.

`--long-top` and `--projects-top` are part of the cascade — they shift with the hero height per viewport. DESKTOP derives them (`--projects-top = calc(--hero-top + --hero-h - 6)`, so bumping `--hero-h` when the hero copy changes re-docks the nav automatically); MOBILE hardcodes them (bump the mobile `--projects-top` by hand when the mobile hero grows — see "Mobile hero headline… clears the docked nav"). The desktop and mobile hero-overlap behaviors differ in KIND, not just amount — see "Mobile about-short can't overlap the hero" below.

`--long-top` is about-long's expanded resting top; since the practice-timeline redesign about-long is a Group B card (opacity 0 when collapsed, settles from above on expand — see "Two-group card system"), so the overlap figures describe the expanded layout, not a collapsed peek-behind. `--long-top` itself was NOT changed by that redesign — only the settle-stack tops below it moved (see "Group B order"). If `--hero-top` changes again, move both `--long-top` and `--projects-top` by the same delta per viewport — they're a linked set, not independent values. Don't unify the desktop and mobile hero docking; they're intentionally different in kind (desktop overlaps about-short, mobile sits just below it — see "Mobile about-short can't overlap the hero").

## Mobile about-short can't overlap the hero — the offsets differ in KIND

The desktop and mobile hero↔about-short relationships are not the same offset at different magnitudes — they are different in kind. **Desktop OVERLAPS:** `--hero-top` docks the hero ~27px into about-short's bottom, which is safe because `.about-card--short` carries bottom padding plus a divider (`.about-card__divider`, hidden on mobile) below the text — that padding + divider act as a clip buffer, so the hero overlapping the card edge eats only dead space, not text.

**Mobile does NOT overlap — it docks just below (~6px gap).** On mobile (`max-width: 767px`), `.about-card--short` sets `padding-bottom: 0` and the divider is `display: none` (see "Mobile about-short — divider hidden, padding dropped"), so the copy runs right to the card's bottom edge with no buffer. Any hero overlap would CLIP the live text. So mobile sits the hero just below about-short's bottom instead of overlapping it.

**Don't "fix" the mobile gap into an overlap to match desktop** — it would clip the last line of about-short. The gap is the correct read for a card with no bottom buffer. This is why the two `--hero-top` dock figures (relative to about-short's bottom) read as overlap vs gap rather than just two different overlap depths — relates to "`about-short` is natural-height; dock is manual per viewport" above.

## Mobile hero headline is 20px — sized to clear the docked nav

On mobile (`max-width: 767px`), `.hero-card__headline` is set to `font-size: 20px` (+ `max-width: none`), overriding the desktop `font-size: 24px`. This is **not** a cosmetic size tweak — it is load-bearing on the hero→nav dock.

**Why.** The redesigned hero holds the full statement copy (about-short was merged into the hero card). At the desktop 24px that copy ran ~6 lines on the narrow mobile frame, growing `.hero-card__bg` tall enough to fully SWALLOW the docked Nihar/Works nav row (`.landing-nav-row`, tucked under the hero in `.landing__section--projects`). Unlike desktop, the mobile cascade tops (`--projects-top`, `--long-top`, etc.) are HARDCODED px (see "Self-adjusting cascade (desktop)" — mobile is NOT on the derived `calc()` chain), so a taller hero is not compensated: the nav ends up entirely behind the hero ("drowning") instead of peeking below it. 20px keeps the headline ~4 lines, so the hero is short enough that the nav peeks ~18px below its bottom edge.

**What breaks.** Bumping the mobile headline back toward 24px — or any change that grows the mobile hero height (longer copy, larger padding, added lines) — re-swallows the nav row, UNLESS `--projects-top` is retuned in the same pass to push the nav down by the height delta. The clean fix (deferred with the rest of the mobile framed-sheet work) is to convert the mobile hero→nav dock to self-adjust like desktop (measure the hero's height and derive `--projects-top` off its bottom), which would make the headline size a free variable again. Until then, treat the mobile headline size and `--projects-top` as a linked pair.

## Mobile about-short — divider hidden, padding dropped

On mobile (`max-width: 767px`), `.about-card--short` deviates from the desktop card recipe:

- the bottom `.about-card__divider` is `display: none`
- `padding-bottom` is `0`
- `padding-top` is `var(--space-16)`
- `--short-top` is `var(--space-24)` (vs desktop `var(--space-56)`)

**Why.** Above-hero space on mobile is tight (`--hero-top: 84px`) and the about-short card needs every pixel for the centered copy. The hero's top edge already serves as the visual seam below the short card, so the decorative divider isn't load-bearing here. Don't restore it on mobile without re-measuring above-hero space and bumping `--hero-top` to absorb the extra height.

## Landing scrollbar hidden

`html:has(.landing)` hides the scrollbar via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` + `-ms-overflow-style: none`. Native scroll is preserved; only the visual indicator goes away. macOS/iOS/Android already overlay-hide, so the rule is mainly for Windows/Linux. The expand-on-click affordance carries the "more content" signal that the scrollbar would otherwise telegraph — if that affordance changes, reconsider.

## Full-bleed canvas needs `viewport-fit: cover` (global)

The Startooth canvas must reach the true screen edges on mobile Safari. By default (`viewport-fit: auto`) iOS insets the viewport to the safe area, so the fixed canvas (`inset: 0`) only covers that — the status-bar band (top) and home-indicator/toolbar band (bottom) fall outside it and show the landing's `#000` body background as **black bars**. `viewport.viewportFit = 'cover'` in `app/layout.tsx` makes the layout viewport span the whole screen so the canvas fills behind the chrome.

**It's global, not landing-scoped** — the landing is a `'use client'` page with no layout of its own (it sits directly under the root layout), so a per-route viewport export isn't possible without a route-group restructure. Acceptable because interior pages are light + scrollable (cover reads seamlessly) and `/marks` already guards its edges with `env(safe-area-inset-*)`. **Cost of cover:** any element pinned to a screen edge now sits under the notch/home-indicator unless it guards with `env(safe-area-inset-*)`. The landing's only edge element is the decorative bottom `CaptionTag` — left unguarded on purpose: its show/hide is a JS-measured `translateY` tuck (`--tuck`/`--tuck-hidden` from `offsetHeight`), and folding a safe-area offset into that risks a sliver of the "hidden" caption peeking. If it ever needs guarding, adjust the tuck math and `--tuck-hidden` together, verified on a real device.

**Cover alone is NOT enough — the page background shows in the bars.** iOS Safari paints the backdrop behind its translucent status bar (top) and bottom toolbar with the **page background** (`<html>`/`<body>`), not the fixed canvas — a browser can't render a live `<canvas>` behind its own chrome. So with the first-paint `#000` page bg, those bands stay black even under `viewport-fit: cover`. Fix: once `.landing--built`, swap the page background (`html:has(.landing--built)` + its `body`) from `#000` to `var(--workbench-bg)` (the `/all` desk colour, matching the framed-sheet matte margins — see "Framed sheet" below), eased over `--dur-place`, so the bands blend into the settled field. **The swap target is now `--workbench-bg`, not `--surface-bg`** — it was retargeted when the canvas became the framed sheet sitting on the `/all` desk ground. It's gated on `.landing--built` rather than applied at first paint **on purpose**: the canvas is `ssr:false` (client-only), so the page bg IS the whole-viewport first-paint color — recolouring it before the canvas mounts would flash `#000`→ground as the black-starting canvas appears. Keep the `#000` base; only the built-state swap is safe. (theme-color isn't the lever here — iOS uses the page bg for these bands, which is why the light global `#f2f3ef` theme-color never showed in them.)

**The desktop grey first-paint override does NOT touch this mobile logic.** The framed-sheet complement (`@media (min-width:768px) and (min-height:501px)`) swaps DESKTOP first paint to `var(--workbench-bg)` (see "Black first-paint gap" + "Staged sheet intro"), but this whole iOS-bar reasoning — the `#000` base and the `.landing--built` swap — is MOBILE-ONLY (the iOS status/toolbar bands only exist on the phone). Mobile keeps the black base + built-swap intact; the desktop override lives under a non-overlapping media query and never fires on the phone. Don't fold the two: the desktop grey is a first-paint desk colour, the mobile swap is a built-state bar fix.

## Don't-touch list

- `--stack-stagger-start` value (0.22s is tuned against Group A's tuck-out duration)
- The four-property collapsed-state contract for Group B cards
- The cascade offset sequence (+0.02s on about-practice, +0.04s on contact) following spectrum's base delay
- Group B 0deg rest pose (do not reintroduce random rotation without restoring the typed `@property` + batched reroll safety nets)

---

## Startooth canvas

The Startooth canvas replaces the old static `.landing-pattern-bg` SVG div. It consists of three files: `app/_landing/StartoothField.ts` (engine), `app/_landing/StartoothCanvas.tsx` (React shell), and `app/_landing/startooth-canvas.css` (canvas layout). The canvas is dynamically imported in `app/page.tsx` with `ssr: false`.

## Framed sheet — the canvas is a centered page, not full-bleed (DESKTOP-ONLY for now)

**What it is.** The Startooth canvas is no longer full-bleed. It's clipped into a centered "page" with a brown frame, sitting on the `/all` desk ground. The ratio is **orientation-dependent: 3:4 portrait (the Linotype Bulletin cover ratio) on iPad/vertical tablets, 4:3 landscape on horizontal displays** (see the geometry section). Two cooperating fixed elements build it (both in `startooth-canvas.css`, rendered by `StartoothCanvas.tsx`):

- **`.startooth-canvas-root`** (z:0) — the sheet itself. `overflow: hidden` clips the pattern to the sheet; the engine sizes the canvas to this host, so narrowing the host clips the field.
- **`.startooth-sheet-matte`** (z:15, `pointer-events: none`) — the passe-partout. Its transparent centre is the sheet "window"; a `box-shadow: 0 0 0 9999px var(--workbench-bg)` floods the surrounding margins with the `/all` desk colour. This is what produces the framed read AND the clip-on-scroll: content still scrolls via the page, but anything that scrolls past the sheet edges is covered by the matte's flooded margins (the clip is purely VISUAL, not a scroll change).

**Mobile is FULL-BLEED, enforced by a reset block (not just "deferred").** The framed-sheet ADAPTATION for mobile is still deferred (a future editor re-derives the sheet width/shift + caption/footer insets for the narrow viewport, likely moving mobile onto the self-adjusting cascade — see "Self-adjusting cascade"). But mobile must render the SAME full-bleed pattern main ships — and it did NOT, silently, until this block. **The base `.startooth-canvas-root` geometry is UNGATED** (`width: var(--sheet-width)`, `top`/`bottom: var(--sheet-margin)`, centred `translateX`), so on a phone the canvas was rendering as a NARROW CENTRED SHEET (~311px on a 375px phone) with the matte still drawing its brown frame + 9999px flood — an undersized frame, not full-bleed. A `@media (max-width: 767px), (max-height: 500px)` block (the complement of the desktop framed-sheet gate; landscape phones via `max-height:500`) now RESETS it: `.startooth-canvas-root { inset: 0; width: auto; transform: none }` fills the viewport and `.startooth-sheet-matte { display: none }` drops the frame + flood entirely. This restores main's full-bleed. Removing it re-leaks the desktop sheet geometry onto the phone.

**Sheet geometry — HEIGHT-DRIVEN, on `:root` in `startooth-canvas.css`.** Don't restate the numbers the tokens own; the structure is:

- `--sheet-margin` — top/bottom inset of the sheet from the viewport edge.
- `--sheet-width` is HEIGHT-DRIVEN and ORIENTATION-DEPENDENT:
  - **Portrait base** (iPad / vertical) = `min(calc((100svh − 2*--sheet-margin) / 1.3333), 760px, calc(100vw − 2*var(--sheet-gutter)))`. Width DERIVED FROM VIEWPORT HEIGHT at the 3:4 ratio (divisor = 4÷3) — proportion identical on every screen, scales with the viewport at a constant ratio. The `760px` cap matters: above tall viewports the height-driven width would keep growing, so it holds at the cap, keeping the fixed hero card at ~76% of the sheet on large/4K monitors (the sheet just gains a taller pattern field below) instead of the card shrinking proportionally.
  - **Landscape override** (`@media (orientation:landscape) and (min-width:768px) and (min-height:501px)`) = `min(calc((100svh − 2*--sheet-margin) * 1.3333), calc(100vw − 2*var(--sheet-gutter)))`. Same height-driven size, width relationship FLIPPED (× ratio → 4:3 landscape). The **760 cap is DROPPED** here — it would re-clamp the wide sheet back to a strip; only the gutter bounds width. The `min-height:501` guard keeps landscape phones (>768 wide, <501 tall) out of the framed sheet (they stay full-bleed mobile).
  - The `--sheet-gutter` clamp is the shared "always placed" outer margin (globals.css), same as the `/all` sheets. **Portrait cap stays FIXED 760, not a relative `min(80vw,…)`** — see "Sheet harmonization (Phase 3)" → "Cap stays FIXED 760".
- `--sheet-shift` keeps a `16px` BASE (mobile = live), but is **zeroed to `0` on iPad+desktop** (a `@media (min-width:768px) and (min-height:501px)` `:root` override) so the sheet sits dead-centre on the viewport, matching the now-centred content + footer — see "Sheet harmonization (Phase 3)" → "Viewport-centred". (It's a literal, not `var(--gutter)`, because `.startooth-canvas-root`/`.startooth-sheet-matte` sit OUTSIDE `.landing` and can't read its scoped token.)

Both the root and the matte read the SAME `--sheet-*` tokens (same `top`/`bottom`/`left`/`width`/`transform`) — that's what keeps the window and the clipped pattern locked together. Don't give one its own geometry.

**The frame (matte) is a single brown rule.** The matte's `4px solid var(--surface-bg)` border is the frame, drawn on top (z:15) so cards can never cover it; `--surface-bg` is the same structural brown as the "Startooth Pattern" caption tab. The old `::after` 1px `--terra-80` inner keyline (the `/all` bench-card double-frame idiom) was REMOVED — the frame is now a single rule. (Don't reintroduce the keyline.)

**The sheet lifts off the desk (sibling of the `/all` blue bench-card).** The matte carries a two-layer drop shadow with the SAME geometry/opacity as the `/all` blue invitation card (`0 2px 5px 0` @ 0.10 + `0 18px 40px -12px` @ 0.28), re-tinted warm — `rgba(40,24,10,…)` instead of the bench-card's cool `rgba(20,40,80,…)` — so it sits under the brown frame and Startooth palette while still reading as the same lifted card. **Paint order is load-bearing:** the two drop shadows are listed BEFORE the `0 0 0 9999px` flood, because box-shadows paint first-listed-on-top — the opaque `--workbench-bg` flood would otherwise bury them, and a "hole cut in a matte" can't cast a shadow any other way. Don't reorder the `box-shadow` list or fold the flood ahead of the lift.

**The body background swap target is now `--workbench-bg`.** `html:has(.landing--built)` + `body` swap to `var(--workbench-bg)` (the `/all` desk colour, matching the matte margins), NOT `--surface-bg` — see "Full-bleed canvas needs viewport-fit: cover" for why the swap exists; this just notes the retargeted value.

**Caption + footer were pulled INTO the frame.** Both sat at the viewport edge (in the void margin below the sheet) and were lifted inside the bottom edge:

- `.caption-tag` (colophon tab) gets `z-index: 12` — below the matte's z:15 so any overflow past the sheet bottom is TRIMMED by the matte, keeping it "within" the sheet. The bottom/tuck is **DESKTOP-GATED** (`@media min-width:768 + min-height:501`) at `bottom: calc(var(--sheet-margin) − 4px)`: docking at the FULL `--sheet-margin` left the fixed `--tuck` peek floating ~24px above the sheet edge ("too up"), while 10px below over-tucked it under the matte ("too in"); −4px sits the title just above the edge (the −4px is the dial). **The gate is load-bearing:** MOBILE is full-bleed with NO matte, so it keeps the CaptionTag base `bottom:0` (dock to viewport edge, `--tuck` pushes the description off-screen). An ungated bottom put the dock line above the mobile viewport edge, and with no matte to trim it, the tucked description spilled into the gap ("too much out"). Its JS tuck/peek (`--tuck`/`--tuck-hidden`) rides on top of this anchor.
- `.footer--caption` (the colophon slab, a shared component) gets `bottom: 44px` via `html:has(.landing) .footer--caption` — the `:has()` scope out-specifies the shared `footer.css` rule (which loads AFTER landing.css). **This is now the MOBILE/base behaviour only — SUPERSEDED on iPad+desktop**, where the slab tucks UNDER the frame as a full-width bar (`z:12`, `bottom:30`, `width:var(--sheet-width)`); see "Sheet harmonization (Phase 3)" → "Footer is a full-width bar". The "sits above the matte / deliberate slab, not trimmed" rationale below applies to the mobile/base path only.

**The trap — caption/footer overrides MUST stay on their own selectors (was a real bug).** These positional overrides (`bottom`, `z-index`) are deliberately NOT folded into the shared `.hero-card, .landing-nav-row, .caption-tag { pointer-events: auto }` rule. Doing so applied `bottom: 32px` to the relatively-positioned `.hero-card`, which shifted the WHOLE card up ~32px (effectively `top: -32`), floating the markers and silently throwing off the cascade. Keep positional props out of the pointer-events opt-in rule.

**What breaks if removed.** Drop the matte and the pattern bleeds full-bleed again and scrolled content shows in the margins (no clip). Give the matte different geometry than the root and the frame desyncs from the clipped pattern. Read both `startooth-canvas.css` (geometry + matte) and the caption/footer override block in `landing.css` before touching any sheet dimension or edge element.

## Staged sheet intro — the sheet PLACES itself, holds grey, inks at build-start, frame last (DESKTOP-ONLY)

**What it is.** The framed sheet doesn't arrive finished — it places itself onto the desk, then earns its pattern and frame in sequence. A "Staged intro" block in `startooth-canvas.css`, gated to `@media (min-width: 768px) and (min-height: 501px)` (the framed-sheet complement, so mobile is byte-identical), plus a JS mount delay in `StartoothCanvas.tsx`, run the sheet through six beats:

1. **Nothing — bare grey desk.** First paint is the `/all` desk grey (see "Black first-paint gap"). Both sheet layers start `opacity: 0` (the `sheet-place` from-frame), so only the desk shows.
2. **The card PLACES itself.** On mount both `.startooth-canvas-root` and `.startooth-sheet-matte` run `animation: sheet-place var(--dur-place) var(--ease-paper) 0.2s both` — `@keyframes sheet-place` fades opacity `0→1` with a mild `scale` `0.94→1` and a slight `rotate` `-2deg→0` settling straight. The `0.2s` delay + `both` fill = the desk shows ALONE first, then the card appears. Card is `border-radius: 12px` (rounded), lifted by the shadow, with a thin darker-grey hairline (`box-shadow: inset 0 0 0 1px …`); the matte is `border-color: transparent` — NO brown frame yet — with matching `border-radius: 12px`.
3. **It holds grey for a beat.** The blank grey card (root `background: var(--workbench-bg)`) holds because the engine mount is DELAYED — see "the JS grey-hold" below. Until the canvas draws, the CSS grey card is all there is.
4. **Build is CUED → grey inks to dark grey + corners straighten.** When the held mount fires, `StartoothCanvas` calls `onBuildStart` → `page.tsx` sets `.landing--building`. The ink is the CANVAS ELEMENT (`.startooth-canvas-root canvas`) easing `opacity` `0→1` (held `0` through the grey hold via `html:has(.landing--building) .startooth-canvas-root canvas { opacity: 1 }`), so the dark pattern + growing lattice rise smoothly out of the grey card — NOT a `background-color` swap on the root: the canvas paints its ground OPAQUELY on top of the root, so a bg transition is invisible and the cut reads abrupt (this was the fix for an abrupt grey→ink). **The ink target is `--grey-80` (the darkest grey), not `#000` (and not brown):** the engine's ground — `bakeSettled()`, the main-loop pre-settle clear, AND `drawBuild()`'s clear — fills `this.ground` = `--grey-80` (read at mount, fallback `#141414`). The line-twin keeps its own `--surface-bg` brown (a separate expand-dissolve surface). So the grey card inks to the dark-grey ground, not a hard black. `html:has(.landing--building) .startooth-canvas-root { border-radius: 0 }` + `… .startooth-sheet-matte { border-radius: 0 }` square the corners — all as the pattern BEGINS to grow (transition on `--dur-place`). **This triggers at build START, not build complete** — the old `.landing--built` trigger for ink + corners was replaced by `.landing--building`. Reduced motion shows the canvas at `opacity: 1` with no fade.
5. **Objects + caption reveal** (hero + footer + caption — owned by `landing.css` / the "Staged entrance" stages).
6. **Frame LAST.** At `.landing--frame` (after the caption — the `frameIn` stage, see "Staged entrance"), `html:has(.landing--frame) .startooth-sheet-matte { border-color: var(--surface-bg) }` fades the brown frame in and `html:has(.landing--frame) .startooth-canvas-root { box-shadow: none }` retires the grey hairline in the same beat, so they never read as a double-frame.

**Individual `scale`/`rotate` props (NOT `transform`) — load-bearing.** `sheet-place` animates the standalone `scale:`/`rotate:` CSS properties, never `transform`, because both layers already carry `transform: translateX(calc(-50% + var(--sheet-shift)))` for centring. The individual props COMPOSE with that translateX; folding the entrance into `transform` would clobber the centring and the card would jump off-centre during the place.

**The JS grey-hold — why the mount is delayed.** The grey card can't hold from CSS alone: the engine's own initial `BUILD_HOLD_MS` draws the ink ground (`--grey-80`, the dark grey — not the light desk grey), so the moment the canvas mounts the sheet goes dark. The only way to hold grey is to DELAY the engine mount. `StartoothCanvas.tsx` does exactly that — on a fresh DESKTOP load it schedules `field.mount()` via `setTimeout(mount, GREY_HOLD_MS)` (`GREY_HOLD_MS` in `StartoothCanvas.tsx`) instead of the usual idle slot. The delay is gated two ways: `!skipBuild` (return trips don't hold) AND `window.matchMedia('(min-width: 768px) and (min-height: 501px)').matches` (the framed-sheet complement — mobile full-bleed doesn't hold). Mobile and skip keep the ORIGINAL post-hydration `requestIdleCallback` idle-slot mount, unchanged. `mount` calls `onBuildStart?.()` immediately before `field.mount()`, so `.landing--building` (ink + corners) fires in lockstep with the pattern starting.

**Why `html:has()` on the stage classes.** The matte and canvas-root are SIBLINGS of `.landing` (rendered by `StartoothCanvas`, not inside `.landing`), so `.landing`'s stage classes don't cascade to them. `html:has(.landing--building/--frame)` reaches back up to the root and down to the siblings — the only way to drive the sheet off React's stage state without threading props into the canvas shell.

**Reduced motion — `sheet-place` dropped, and it's the safe fallback.** A `@media (prefers-reduced-motion: reduce)` block sets `animation: none` on both layers → the sheet is simply THERE (opacity resolves to `1`, scale/rotate to identity). This is ALSO the safe fallback if the entrance ever can't run: because the animated `from` is `opacity: 0`, without the animation the card can never strand invisible — it resolves to the settled `1`.

**Why the frame is decoupled from the always-on matte.** The matte's `4px` border is the permanent frame in the settled state — but the intro keeps the 4px WIDTH (for layout stability, so nothing shifts when the colour arrives) while zeroing only its `border-color` to transparent. The brown is thus a colour transition, not a width/layout change, and can be sequenced independently as the last beat without reflowing the sheet.

**Skip path.** `html:has(.landing--skip) .startooth-canvas-root, html:has(.landing--skip) .startooth-sheet-matte { animation: none }` — on client-side return the sheet is already settled, so the placement animation is silenced (the skip path also keeps the original idle mount, no grey-hold). `--building` + `--frame` are set synchronously (in the `useLayoutEffect`), so square corners, black fill, and the brown frame are the initial UNTRANSITIONED values; only `sheet-place` had to be explicitly killed. (Note: `sheet-place` replaced the old `sheet-ink` on-mount ink animation, which was removed — ink is now a `background-color` transition fired by `.landing--building`.)

**What breaks if changed.** Drop the `@media` gate → the intro leaks onto mobile (which must stay full-bleed live). Fold `sheet-place` into `transform` → the card jumps off-centre during the place (loses the centring translateX). Remove the JS grey-hold → the sheet snaps straight to the engine's BUILD_HOLD (the `--grey-80` ink ground), no grey beat. Move the ink/corners back to `.landing--built` → they fire when the pattern FINISHES instead of when it begins. Fold the frame colour into a width change → the sheet reflows when the frame lands. Remove the `.landing--skip` animation kill → returning visitors watch the placement replay. Move the stage rules off `html:has()` (e.g. try to scope them under `.landing`) → they never reach the sibling matte/root.

## Sheet harmonization (Phase 3) — content coupled + centred to the frame

The framed sheet (above) is height-driven; the landing CONTENT (`.landing__section--*`) is authored at FIXED px on a **760px baseline** (hero = 76% of a 760 sheet). They agree only at the sheet's 760 cap — below it (any viewport shorter than ~828 CSS px, i.e. most laptops) the frame shrinks but the content doesn't, so without coupling the fixed-px cards would poke past the frame and the matte flood would clip them. Phase 3 couples them: the plate scales to fit the frame AND keeps a constant `--sheet-content-inset` gutter inside it (Scale bridge, below), so the cards keep that margin off the sheet border at every viewport — including portrait/iPad (frame at the 760 cap), where at scale 1 the plate would otherwise run edge-to-edge and touch/overflow the border. **All of it is gated to `@media (min-width: 768px) and (min-height: 501px)`** — the exact COMPLEMENT of the mobile block — so mobile keeps its full-bleed composition (enforced by the reset block — see "Framed sheet") and the base rules carry no Phase-3 changes. This sheet is a *page* member of the shared family (LIBRARY.md → "Framed-sheet spine"), via the bridge below.

**Scale bridge — the plate scales as one unit (a JS scalar, deliberately).** `page.tsx` writes `--sheet-scale` on `:root` (= `min(1, (frameWidth − 2 * inset) / 760)`, read from the rendered `.startooth-canvas-root` width, recomputed on resize; forced to 1 on the mobile breakpoint `(max-width:767px),(max-height:500px)`). `inset` is the `--sheet-content-inset` token (globals.css, sits by `--sheet-gutter`), read once via `getComputedStyle` — the constant gutter the plate keeps INSIDE its own frame so cards never touch the sheet border (distinct from `--sheet-gutter`, the sheet-to-viewport margin). At scale 1 the plate width would equal the frame width exactly, i.e. ZERO gutter, so portrait/iPad (frame at the 760 cap) ran the cards edge-to-edge and touched/overflowed the border; insetting by `2 * inset` leaves a constant margin each side, still fully relative (tracks the frame). `landing.css` applies `transform: scale(var(--sheet-scale, 1))` + `transform-origin: 50% top` to `.landing__content`, and scales the EXPANDED scroll height (`.landing--expanded` and the form-open `:has()` bump) by the same factor so the shrunken plate leaves no dead scroll. Default `1` (SSR / no-JS / pre-mount) = design size — a graceful fallback. **Why a JS scalar** (the `/all` blue card REMOVED its `--card-scale` for cqi; this re-introduces one, knowingly): CSS cannot divide two lengths into the unitless number `transform: scale()` needs, so any transform-scale approach REQUIRES the scalar. This is the sanctioned LIGHT bridge — the full cqi/`--bu` conversion (every width + cascade top + padding + type + Group A/B settle → `calc(N * --bu)`) is the deferred, motion-heavy follow-up; for a *page* archetype the bridge is visually identical to cqi. **Containing-block safety (load-bearing):** a transform makes `.landing__content` a containing block for any `position: fixed` descendant — but the canvas root + matte (siblings of `.landing`), `.caption-tag` (inside `.landing`, OUTSIDE `.landing__content`), and the footer (outside `.landing` entirely) are all OUTSIDE the wrapper, so the frame is never trapped or scaled. Don't move a fixed edge element inside `.landing__content`. The sections' own Group A/B `translateY` settles compose UNDER the scale (proportionally smaller — motion intact); `--sheet-scale` must live on `:root`, not `.landing`, so the sibling footer can read it.

**Viewport-centred — the vestigial grid offsets were flattened.** The sheet + content used to ride `+16px` right of the viewport centre (the old `.landing --gutter`), with cards at a mixed `+16 / +12 / 0` (hero·long·contact / about-practice / spectrum). Every section `translateX` is now plain `translateX(-50%)` and `--sheet-shift` is `0` on iPad+desktop, so the sheet, every card, AND the footer sit dead-centre on the viewport (measured 0 offset) — matching the `/cases` sheet. `--sheet-shift` keeps its `16px` BASE so mobile stays live; the `:root` override that zeroes it is the desktop-MQ complement (in `startooth-canvas.css`). The about-practice `+12` and spectrum `+0` were authored offsets — flattening them was a user-approved normalization (flagged per "preserve authored values", then approved).

**Footer is a full-width bar tucked UNDER the frame (SUPERSEDES "deliberate slab, z:20").** Earlier the colophon `.footer--caption` sat at `z:20` ABOVE the matte ("deliberate slab, not trimmed" — see the Framed sheet entry, now amended). It read as a slab stuck ON TOP of the frame and, shrink-wrapped + viewport-centred, spilled past a shrunken sheet. On iPad+desktop it is now, mirroring `.caption-tag`: `z-index: 12` (below the matte's 15) so the frame border draws OVER it and it emerges from under the bottom edge as it slides up; `bottom: 30px` (flush with the matte bottom, = the tab); `width: var(--sheet-width)` so it's a full-bleed bar spanning the sheet (outer edges tuck under the brown border, brown-on-brown seamless; the row's own padding keeps text clear); and the row is `justify-content: space-between` (credit ↔ links across the full bar). NO `scale` — the width IS the sheet, so it tracks the frame directly. Mobile keeps the base (`bottom: 44`, `z: 20`, `fit-content`, centred row) = live.

**PORTRAIT cap stays FIXED 760 (not the `/cases` relative `min(80vw, …)`); LANDSCAPE drops the cap entirely.** In PORTRAIT: the relative cap fits an aspect-locked CARD (blue card) that nests concentrically on iPads; the landing sheet is FULL-HEIGHT (`top:30; bottom:30` fills the viewport, content scrolls + the matte clips), so a relative cap would shrink iPad portrait to a tall narrow strip, and a higher ceiling would break the hero = 76%-of-sheet proportion the fixed 760 guarantees. Different height model → different cap; evaluated and the fixed cap kept on purpose. In LANDSCAPE (4:3 override): the cap is DROPPED — the sheet is deliberately wide (width = height × 4/3), so a 760 cap would re-clamp it to a strip; the hero column just centres on a broader pattern field and only the gutter bounds width. See LIBRARY.md → "Framed-sheet spine" → "Caps are model-specific".

**What breaks if violated.** Remove the `@media` gate → the scale/centring leak onto mobile (which must stay full-bleed). Set `--sheet-scale` on `.landing` instead of `:root` → the sibling footer can't read it. Move a fixed edge element inside `.landing__content` → the scale traps it. Forget to scale `.landing--expanded` height → the shrunken plate leaves dead scroll below it. Restore the footer to `z:20` → it floats over the frame again instead of tucking under it. Drop the `− 2 * inset` term (or set `--sheet-content-inset: 0`) → the plate runs edge-to-edge and the cards touch/overflow the sheet border on portrait/iPad.

## Nav row is scale-exempt (counter-scales the plate)

**What it is.** The landing nav row (`.landing-nav-row` in `landing.css` — the Nihar + Works tabs docked under the hero) holds a CONSTANT size instead of shrinking with the plate on small/portrait frames. It rides `.landing__content`'s `transform: scale(var(--sheet-scale))` (the Phase-3 scale bridge above) like everything else, then cancels it locally: `scale: calc(1 / var(--sheet-scale, 1))` + `transform-origin: top center`. Net constant size; a no-op at scale 1 (wide desktop, and mobile where `--sheet-scale` is forced to 1). Fixed the tabs reading "too small" on scaled-down frames.

**Why the specifics (all load-bearing).**
- **Individual `scale` property, NOT `transform`.** The nav row's entrance is `animation: works-tuck-out`, which animates `transform: translateY`. The counter-scale uses the standalone `scale:` property so it COMPOSES with that animation instead of clobbering it — folding it into `transform` would kill the tuck-out entrance. (Same idiom as spectrum's standalone `translate:`/`scale:` composing over the click reroll's `transform`.)
- **`transform-origin: top center`.** Scales about the top edge so the nav stays docked under the hero and viewport-centred; a default `center` origin would grow it up into the hero.

**Precedent.** Same "fixed UI inside scaled content" idea as the `/all` docked ticket (held at a constant size, not scaled with the sheet) — the Phase-3 scale bridge intentionally exempts the nav from the plate.

**Trade-off (accepted).** At very small plate scales (~0.6, rare short viewports) the constant nav reads a touch large against the shrunken hero. Acceptable: real devices sit ~0.86+, and the goal is a readable/tappable nav. Don't "fix" this by letting the nav ride the scale — it reintroduces the too-small tabs. Don't fold the counter-scale into `transform` or change the `top center` origin without reading this + the tuck-out entrance.

## Canvas is `position: fixed`, not `position: absolute`

**What it is.** `.startooth-canvas-root` (in `startooth-canvas.css`) uses `position: fixed`.

**Why.** The landing expands to its full `--expanded-h` height when the user clicks through. An `absolute`-positioned canvas would scroll away with the document, leaving the expanded state with no background. `fixed` keeps the canvas anchored to the viewport behind the landing at all scroll positions.

**What breaks if removed.** Changing to `position: absolute` causes the canvas to disappear as the user scrolls the expanded landing, leaving a white or black gap behind the lower Group B cards.

## Expand-dissolve — the field cross-fades to a line drawing when expanded

**What it is.** On expand the Startooth field cross-fades from the filled pattern to a **line-only twin**, and back on collapse. `bakeSettled()` bakes two offscreen canvases: `settled` (filled) and `settledLines` (a `--surface-bg` ground + a terra-toned stroke). The two values are read from CSS at mount into `lineGround` / `lineStroke`. `drawInteractive()` blits `settled`, then blits `settledLines` at `globalAlpha = expandAmt` over it — both bakes share the same `linePath` so the wireframe holds steady through the fade while only the fills come and go.

**How it's driven.** React passes the `expanded` prop to `StartoothCanvas`, whose effect calls `field.setExpanded(on)` → sets `expandTarget` (0 filled / 1 line). `stepFocus()` eases `expandAmt` toward it on a **time-based smootherstep over `EXPAND_DUR` (800 ms)** — NOT a per-frame exponential. The exponential was tried first and front-loaded the change (~60 % in the first 0.25 s): fine fading the fills *out* (expand), but it "popped" them back *in* on collapse. The time-based curve makes expand and collapse mirror exactly. `setExpanded(true)` also calls `resetFocus()`.

**Interaction gate.** While expanded (`expandTarget === 1`), `pointer()` early-returns — hover lamps, click ripples, and the void-rupture easter egg are all suppressed so the field reads as a quiet backdrop behind the framed sheet. `resetFocus()` (above) clears any key lit just before the expand.

**What breaks if changed.** Reverting to a per-frame exponential reintroduces the collapse "pop". Dropping the `expandTarget === 1` guard in `pointer()` lets the canvas light up / ripple under the expanded content. `lineGround` / `lineStroke` must stay read at mount so they track the `--surface-bg` / terra tokens.

## CSS transition must live in the before-change rule, not the `:not()` guard

**What it is.** The build-gate in `landing.css` (`html.fonts-ready .landing:not(.landing--built)` selector) sets `opacity: 0` and `pointer-events: none` to hold the landing invisible during the 7s canvas build. The `transition` declaration lives only in the sibling base rule `html.fonts-ready .landing` (specificity 0,0,2,1), not inside the `:not()` rule.

**Why.** Per CSS spec, a transition fires only if it is defined in the **before-change style** — the computed style at the moment the property change is triggered. The `:not(.landing--built)` rule has specificity 0,0,3,1 (higher than the base rule). If `transition: none` were placed inside the `:not()` rule it would win in the before-change state, meaning when `.landing--built` is added the engine sees `transition: none` and opacity jumps to 1 instantly — no fade. Keeping `transition` only in the base rule (0,0,2,1) ensures it is always defined regardless of which class combination is active.

**What breaks if violated.** Adding any `transition` override to the `:not(.landing--built)` rule — or moving the `transition` declaration out of the base rule — kills the opacity fade and makes the landing snap in.

## Black first-paint gap — two layers required, breakpoint-split

**What it is.** `html:has(.landing), html:has(.landing) body { background-color: #000 }` in `landing.css`, and separately `background: #000` on `.startooth-canvas-root` in `startooth-canvas.css`.

**Why.** `StartoothCanvas` is dynamically imported (`ssr: false`) so there is a window between server-rendered HTML and the first canvas paint. During that window, the document background would show through (white in light mode, whatever the user's system default is) causing a flash. The CSS body rule closes the gap before the canvas element exists; the `.startooth-canvas-root` background covers the period between the element mounting and the engine's first draw call. Both layers are needed — the body rule alone fails on slower connections where the canvas chunk hasn't loaded yet; the root rule alone has no effect before the element is in the DOM.

**Desktop first paint is the GREY desk, not black.** A `@media (min-width: 768px) and (min-height: 501px)` override (the framed-sheet complement) re-swaps the body/`:has()` first-paint bg to `var(--workbench-bg)` — so on desktop the sheet arrives on the grey `/all` desk with no black flash, then INKS grey→dark-grey itself (the canvas ground is `--grey-80`, not `#000` — see "Staged sheet intro"). MOBILE keeps the black `#000` base (full-bleed, mobile behaviour) unchanged. The two are deliberately different: black is the full-bleed first paint mobile still uses; grey is the framed-sheet desk. Don't unify them or drop the desktop override.

**What breaks if either layer is removed.** Removing the body rule produces a white flash on first load on slow connections or large screens. Removing the canvas root rule produces a brief flicker between element mount and first draw. Removing the desktop grey override brings back the black flash before the sheet inks.

## Pointer-events inversion — landing passes through, interactive ELEMENTS opt in (not sections)

**What it is.** `html.fonts-ready .landing { pointer-events: none }` in `landing.css` overrides the `globals.css` rule of the same specificity (same selector, later cascade position — `landing.css` loads after `globals.css`). The opt-in re-enable is scoped to the actual interactive ELEMENTS — `.hero-card`, `.landing-nav-row`, `.caption-tag` — **not** their sections.

**Why.** The canvas sits below the landing in z-order and needs to receive pointer events in empty areas (the engine uses hover for parallax/interaction). If `.landing` absorbed all clicks (as `globals.css`'s `pointer-events: auto` would give it), nothing would reach the canvas. Group B sections (spectrum, about-practice, contact) already self-manage their pointer-events in their own landing.css rules and are not affected by the `.landing` inversion.

**Why the opt-in is on the card/row, NOT the section (load-bearing — was a bug).** `.landing__section--hero` and `.landing__section--projects` have boxes that run FAR taller than their content (the hero section measured 132→878px). Giving the *sections* `pointer-events: auto` made their empty area swallow clicks meant for the docked tabs AND the expanded cards below them. Scoping the opt-in to `.hero-card` + `.landing-nav-row` (the genuinely interactive elements) means only they capture; the empty section area passes through to the tabs/canvas. Do not revert the opt-in to the `.landing__section--*` selectors.

**Why CaptionTag is in the opt-in list.** `.caption-tag` uses `position: fixed` which removes it from normal document flow, but it is still a DOM descendant of `.landing` and inherits `pointer-events: none` through the tree. It must be in the explicit opt-in list or its links and hover states stop working.

**What breaks if the inversion is removed.** Restoring `pointer-events: auto` on `.landing` blocks all canvas interaction. Removing `.caption-tag` from the opt-in list makes caption links unclickable even though the element is visually present.

## Build gate — three triggers and a JS failsafe

**What it is.** The `landing--built` class (gates the landing reveal via the `:not()` rule) is set via three code paths in `app/page.tsx`:

1. `handleBuildComplete` callback, called by `StartoothField` when the build animation finishes. Also sets the module-level `builtThisLoad = true`.
2. `useLayoutEffect` at mount: reads `builtThisLoad`; if true, sets `built`, `skipBuild`, `buildStarted`, `staged`, `captionIn`, and `frameIn` to `true` synchronously before first paint. This collapses the build to a single settled frame.
3. A `FAILSAFE_MS` (`page.tsx`, ~10s) `setTimeout` failsafe (in a `useEffect`) that calls `setBuilt(true)` if `onBuildComplete` never fires — guards against canvas engine failure, missing WebGL context, or a failed dynamic import.

**`onBuildStart` is the sibling build-START callback.** Separate from `onBuildComplete`, `StartoothCanvas` calls `onBuildStart` the instant the (grey-held) mount is cued — right before `field.mount()`. `page.tsx`'s `handleBuildStart` sets `buildStarted` → `.landing--building`, which drives the sheet's ink + corner-straighten as the pattern begins (see "Staged sheet intro"). On the skip path `buildStarted` is set synchronously in the `useLayoutEffect`. Don't conflate the two callbacks: `onBuildStart` cues the ink/corners, `onBuildComplete` reveals the content.

**Why `FAILSAFE_MS` must clear the grey-hold + build.** The desktop grey-hold (`GREY_HOLD_MS`, see "Staged sheet intro") DELAYS the engine mount, so a healthy build completes only after `GREY_HOLD_MS` + the build animation. The failsafe must clear that or it would fire before a healthy build finishes — cutting the build short for everyone. The value tracks the hold: it was trimmed alongside `GREY_HOLD_MS` (both got faster), so keep them in step — a smaller grey-hold means the failsafe can come in sooner, but it must still sit past `GREY_HOLD_MS` + build-complete.

**Why `builtThisLoad` is a MODULE-LEVEL variable, not `sessionStorage` (load-bearing).** The skip must reset on a hard refresh — the build replays — but persist across client-side navigation, so a return trip from `/selected` jumps straight to settled instead of replaying a 7s build on an in-app back-trip. A module var is exactly that scope: fresh per page load (new JS context), shared across route transitions within the same context. `sessionStorage` survives the hard refresh and would wrongly skip the build on every reload — the original bug. Do NOT move this to `sessionStorage`/`localStorage`.

**What breaks if the failsafe is removed.** A user whose browser fails to initialize the canvas (WebGL unavailable, script error, network timeout on the dynamic import) would see a permanently black screen — the landing never becomes visible.

**What breaks if `useLayoutEffect` is changed to `useEffect`.** The `builtThisLoad` read would happen after paint, meaning a client-side return would flash hidden→visible at first paint before `built` is set. `useLayoutEffect` ensures the class is applied before the browser paints (paired with `.landing--skip` — see the skip-pin entry).

## Hero headline cycling — localStorage (not module state/sessionStorage), useLayoutEffect with a default-0 initializer (not a lazy one)

**What it is.** `.hero-card__headline` alternates between two lines (`HERO_HEADLINES`, a module-level array just above `TIMELINE_PHASES` in `app/page.tsx`) on each hard reload. `headlineIdx` state defaults to `0`; a `useLayoutEffect` (placed right after the existing nav-direction slide-in `useLayoutEffect`) reads `localStorage.getItem('hero-headline-idx')`, calls `setHeadlineIdx(next)`, and writes `(next + 1) % HERO_HEADLINES.length` back for the NEXT load. Both the read and the write are wrapped in try/catch (non-fatal), matching the sessionStorage try/catch idiom already used elsewhere in this file (e.g. the nav-direction read).

**Why `localStorage`, not module state or `sessionStorage` — the persistence requirement is the OPPOSITE of `builtThisLoad`.** Contrast with "Why `builtThisLoad` is a MODULE-LEVEL variable" above: that flag must RESET on hard refresh and persist only across client-side nav, so module state is correct there. Headline cycling needs the inverted property — it must SURVIVE a hard refresh (that's the entire point of "each reload") and persist indefinitely across sessions, so module state is wrong (resets every load) and `sessionStorage` is also wrong (resets on a fresh tab/session, which isn't "cycle on reload"). `localStorage` is the only one of the three whose persistence shape matches the requirement. Don't "fix" this to match the `builtThisLoad` pattern — they're deliberately different because the requirements are opposite.

**Why `useState(0)` + `useLayoutEffect`, not a lazy `useState(() => …)` initializer reading localStorage directly.** A lazy initializer runs during SSR (no `window`/`localStorage`) and would need a guard, and even guarded, the client's first render would differ from the server-rendered HTML the instant it read a stored index ≠ 0 — a hydration mismatch (server renders headline A, client wants headline B on the very first render). Instead the state defaults to `0` so SSR and the client's first render always agree (headline A), and the swap happens in a `useLayoutEffect` — which runs synchronously BEFORE the browser paints, unlike `useEffect` — so the index changes with no visible flash and no hydration warning. This mirrors the existing nav-direction slide-in flag in the same file (same file, same pre-paint-swap trick, same reason).

**What breaks if changed.** Moving the read to `sessionStorage` makes the headline reset every new tab instead of truly cycling across reloads. Moving it to module state makes it reset on every hard refresh (same headline every time, defeating the feature). Reading localStorage in a lazy `useState` initializer (or in a plain `useEffect`) reintroduces a hydration mismatch / visible flash respectively.

## Failsafe fires before build completes on slow-connection mobile — expected degradation

**What it is.** The failsafe `setTimeout` in `page.tsx` sets `built = true` to prevent a stranded black screen if the canvas engine fails. On a slow mobile connection (3G, cold load), the dynamic `import('./_landing/StartoothCanvas')` bundle may not arrive until 3–5s after hydration. Combined with the `BUILD_HOLD_MS` ink-ground hold and the build animation, the engine can take longer than the failsafe gate to fire `onBuildComplete`. (Mobile has no grey-hold, so its failsafe budget is the raw `FAILSAFE_MS` — extra headroom helps here too.)

**What happens.** The failsafe reveals the landing and the staged entrance plays normally, but the canvas build animation continues behind the now-revealed content. This is expected behavior: the failsafe was designed for engine failure (context error, hard crash, failed dynamic import), and the build animating visibly through a settled landing on very slow connections is an acceptable degradation — the canvas is decorative, the copy is readable.

**What breaks if you change the timer.** Do not lower the failsafe timer to fix perceived slow loads. Doing so would fire the failsafe during the build on normal connections, permanently cutting the build animation short for all users. `FAILSAFE_MS` accounts for the full normal-path window including the desktop grey-hold (see "Build gate" → "Why `FAILSAFE_MS` must clear the grey-hold + build"); early firing is not a fix.

## A rebuild always animates — `reduced` splits from `skipBuild`

**What it is.** `StartoothField` keeps two flags, not one: `prefersReduced` (from `matchMedia('(prefers-reduced-motion: reduce)')`, permanent, accessibility) and `reduced` (the per-build "collapse to one frame" switch). At mount `reduced = prefersReduced || skipBuild`. `rebuildFrom(x, y)` (the public re-grow seam — see the void-rupture spec) resets `reduced` to `prefersReduced` alone.

**Why.** A rebuild is an explicit request to WATCH the field regrow. If `reduced` stayed conflated with `skipBuild`, a page that loaded in skip mode (client-side return) would rebuild *instantly* — invisibly. Splitting the flags lets a rebuild animate even on a skip-loaded page while still honouring a genuine reduced-motion preference. `rebuildFrom` also subtracts `HOLD` from `buildStart` so the rebuild begins immediately rather than flashing ~900ms of black behind the visible content (the black HOLD is initial-load anticipation, pointless on a re-grow). There is currently no UI calling `rebuildFrom` — it is the wired seam the deferred void-rupture feature will drive.

## Staged entrance — card settles first, then the tabs, then the caption

**The sequence.** Build reveals (as the last visible corner paints) → the hero card *settles* onto the field → after it lands the nav row (Nihar/Works) slides in → then a beat later the Startooth caption follows → then (desktop) the brown sheet frame fades in LAST. Distinct gated steps, not one block fade:

1. **Build fires as the last visible corner paints, not at the tail.** `drawBuild()` returns true at `prog > 0.76`, not `0.98`. The lattice is oversized for the -15° tilt, so the regions that finish last (~0.88) sit off-screen; every VISIBLE region is filled by ~0.79. `bakeSettled` redraws the full pattern regardless of `prog`, so firing at 0.76 reveals the card just as that final visible corner is being laid down — they overlap, with no pop. Don't wait for the full coat (don't push back toward 0.85+) — the corners that finish later are off-screen anyway.
2. **The card rises-then-sits (build path only).** On `.landing--built:not(.landing--skip):not(.landing--slide-in)`, `.hero-card__bg` runs `hero-card-settle` over `--dur-place` (slowest tier, ≈ the build's outline→fill wait): a short run-up slightly past its rest line, then a settle back down to rest, with the box-shadow deepening flat→`--shadow-raised` as it lands. The single small overshoot above rest is an authored dampened settle (no oscillation) — a deliberate, deliberately-shallow deviation from the "no overshoot" motion rule, requested for the settle feel. **Opacity is NOT in the keyframe** — the block reveal owns it at `--dur-fast` (see below), so the card reads opaque almost immediately while the settle motion stays slow. Skip/return keep the quick `hero-glide-up`; slide-in keeps `hero-glide-from-left`.
3. **Block opacity is fast and decoupled.** `html.fonts-ready .landing` reveals on `--dur-fast` (not `--dur-glide`). Because every element except the hero card is individually gated, this only governs the card's fade-in — which is why the card can hit full opacity quickly while its transform settles slowly.
4. **About-cards are held hidden during the settle.** They tuck directly behind the hero; while the hero is still fading in they would bleed through it. `.landing--built:not(.landing--staged):not(.landing--expanded) .about-card { opacity: 0 }` keeps them invisible until the card lands (they're occluded by the opaque hero at rest, so flipping them visible at `staged` is imperceptible). The `:not(.landing--expanded)` guard releases them if the user expands before staging.
5. **The tabs trail the card, then the caption trails the tabs.** A `staged` React state (separate from `built`) flips after the card has docked — its `page.tsx` setTimeout (`STAGE_SETTLE_MS`, ≈ `--dur-place` so the tabs land as the hero settles) FOLLOWS the dock closely without overlapping it. It adds `.landing--staged`, releasing the nav row's `works-tuck-out` (`--ease-snap`, held by `:not(.landing--staged) .landing-nav-row { animation-play-state: paused }`) and the about-cards. The caption is a SEPARATE stage: a `captionIn` state flips `REVEAL_BEAT_MS` after `staged` (a second `page.tsx` setTimeout), and the caption's `visible` is `!expanded && captionIn` — so it slides up a beat after the tabs, not with them.
6. **The brown sheet frame is the LAST beat (desktop).** A `frameIn` state flips a further `REVEAL_BEAT_MS` after `captionIn` (a third `page.tsx` setTimeout, `[captionIn, frameIn]` effect) — the caption and frame now share the ONE uniform `REVEAL_BEAT_MS` beat (previously two different delays) — adding `.landing--frame`. The startooth-canvas.css "Staged intro" block reads it to fade the matte's brown `border-color` in (transparent → `--surface-bg`) and retire the canvas root's grey hairline — the frame earns its place only after the pattern, hero, footer, and caption have all arrived (see "Staged sheet intro"). `staged`, `captionIn`, AND `frameIn` all flip synchronously on the skip/return path (in the `useLayoutEffect`), so the returned page is already framed with no intro.

**Why the gates exist — entrances run on MOUNT.** `hero-card-settle`/`hero-glide-up` and `works-tuck-out` are CSS animations that fire at element mount — i.e. *during* the build, while the landing is `opacity: 0`. Without `animation-play-state: paused` gating they play out entirely behind the curtain and finish before the reveal, so nothing animates when the curtain lifts. The pause gates hold each at its from-state until its trigger (`.landing--built` for the card, `.landing--staged` for the tabs).

**Knobs are linked across CSS and JS.** `--dur-place` (globals.css) sets the card-dock duration AND `STAGE_SETTLE_MS` (`page.tsx`) mirrors it (≈ `--dur-place`) so the tabs land as the hero settles; then `REVEAL_BEAT_MS` — one uniform beat shared by BOTH the `captionIn` and `frameIn` setTimeouts — trails `staged` for the caption and again for the frame, so caption then frame each follow by the same beat. Retune together — if `--dur-place` changes, keep `STAGE_SETTLE_MS` clearing it, and keep the shared `REVEAL_BEAT_MS` beat after it.

**What breaks if a pause gate is removed.** That stage's entrance is spent behind the build curtain and never seen — the card flat-fades in, or the tabs appear already-present instead of snapping in after the card.

## Skip-on-return reveal must be instant — `.landing--skip` defeats a transition pin

**What it is.** On client-side return (`builtThisLoad` is set), `page.tsx` adds `.landing--skip` alongside `.landing--built`, and `landing.css` sets `html.fonts-ready .landing.landing--skip { transition: none }`.

**Why — the pin.** The skip path flips `built` from `false`→`true` inside `useLayoutEffect`, i.e. before the first paint (required: a `useEffect` would flash hidden→visible, and the SSR/hydration render must start from `built=false`). That means the landing's `opacity` goes `0`→`1` before the browser ever paints the `0` from-state. A transition armed from a never-painted from-state **pins at `currentTime: 0`** and strands the landing at `opacity: 0` forever (confirmed: forcing `transition: none` inline snaps it to 1). The build path does not hit this — its `opacity: 0` from-state is painted for the whole duration of the build, so the reveal transition fires cleanly. There is no build to wait for on return, so the correct reveal is simply instant.

**What breaks if `.landing--skip` is removed.** Returning visitors land on a permanently invisible page (`opacity: 0`, pinned transition) until something forces a style recalc. This is a silent, intermittent-looking failure — it only reproduces on the skip path, so it is easy to miss in a first-load test.

## Hover-release fade — three deliberate divergences from the handoff (no jerk)

The original handoff's key-hover release jerked. `stepFocus()` reworks it in three ways; all are improvements over the reference — **do NOT "restore" the handoff behaviour:**

1. **Fade from `fadeFrom`, not `1 - t`.** The dim ramp-up (`focusAmt += (1-focusAmt)*0.13`) takes ~0.66s to reach 1, so a short hover releases mid-ramp. The handoff's `focusAmt = 1 - t` (with `t` starting at 0) forces `focusAmt` to **1** for a frame before easing down — a snap-to-full. We capture `fadeFrom = focusAmt` at release and fade `fadeFrom * (1 - smoother(t))`.
2. **Keep the released key lit through the fade (`fadeUnit`).** The handoff clears `focusUnit` to null the instant you leave, so the lit key + its lamp snap dark on the first fade frame while only the veil eases out. We capture `fadeUnit = prevDu` at release and `drawInteractive` reads `focusUnit ?? fadeUnit`, so the key dims *with* the veil instead of snapping.
3. **Linger + smootherstep.** A short `LINGER` holds the dim before the fade begins (it doesn't collapse the instant you leave), and the fade uses `smoother(t)` so it starts at zero velocity — no jerk at the hand-off from the ramp-up. `fadeUnit` clears when the fade completes.

## Touch uses press-and-hold for the lamp effect — intentional, not a hover state

**What it is.** On `pointerType === 'touch'`, keys activate the lamp focus effect via `pressFocus = true` on `pointerdown`. There is no hover state on touch devices (pointer devices only). The `pointerType === 'touch'` branch in `pointer()` is a deliberate design decision: a touch press activates the same lamp-dim effect a mouse hover does, making keys feel tactile and pressable.

**Why this exists.** Without this branch, touch presses on keys would do nothing — the lamp effect and lock trigger would be entirely absent for touch users because the hover path never fires on touch. The branch is the touch substitute for hover.

**What breaks if removed.** Removing or no-op-guarding the `pointerType === 'touch'` branch means touch presses on keys produce no lamp effect and never trigger a lock. Do not remove it, unify it with mouse handling, or add a guard that skips `pressFocus` for touch.

## Icon subset — system Python fallback for `icon_subset.py`

**What it is.** When the landing's icon set changes (`ICON_NAMES` in `app/lib/icons.ts`), the font subset is rebuilt with `/usr/bin/python3 scripts/icon_subset.py`. (History: the `replay` icon was added here for the canvas replay button, then removed with the button — leaving 15 icons.)

**Why the fallback exists.** The project's `npm run icons` script invokes the Homebrew-managed `python3.14`, which has a broken `pyexpat.so` on this machine — it errors out before fontTools can run. The system Python at `/usr/bin/python3` has fontTools installed and works correctly. The pre-push hook runs `npm run icons:check` and will block a push with a stale subset.

**What to do when changing icons.** Run `npm run icons` first. If it fails with "fontTools not found" or a `pyexpat` import error, fall back to `/usr/bin/python3 scripts/icon_subset.py` directly. Never skip the subset rebuild — the pre-push hook will catch it, but catching it at push time is later than catching it locally.

## Idle breathing

**What it is.** Full intent + spec live in [`./DESIGN.md`](./DESIGN.md) → "Idle breathing"; this entry carries the implementation constraints. After `IDLE_BREATH` (~9s) of no user activity, random key-tops swell gently — a low-`mag` version of the same `topScatter` path used elsewhere, wrapped in a `swell` envelope so the motion reads as a breath rather than a poke.

**Self-scheduling, not a continuous rAF.** The effect is driven by `idleTick`/`scheduleIdle`, a self-scheduling timer that kicks the animation loop only once per breath — it does NOT run a continuous `requestAnimationFrame` loop waiting to check idle state every frame. `lastActivity` (updated on both pointer input and build-complete) resets the idle clock, so any interaction pushes the next breath out by a fresh `IDLE_BREATH` window.

**Guards.** Skipped entirely under `prefers-reduced-motion: reduce` (same `prefersReduced` flag used across the engine — see "A rebuild always animates"). `idleTimer` is cleared in `destroy()` so a torn-down field can't fire a breath into a dead canvas.

**What breaks if changed.** Converting `idleTick`/`scheduleIdle` to a continuous rAF loop burns idle CPU for no visual gain (the breath only needs to fire once per window). Forgetting to clear `idleTimer` in `destroy()` risks a breath firing against a torn-down field. Dropping the `lastActivity` reset on build-complete would let a breath fire immediately after the build finishes, before the user has had a chance to look at the settled field.

## Void rupture (the 9-click easter egg)

Full intent + sequence: [`./DESIGN.md`](./DESIGN.md) → "Void Rupture". This archive carries the load-bearing implementation constraints. It's a hidden interaction in `StartoothField` — no on-screen affordance.

### The rupture branch must lead the loop, and reuses the `done` gate

`loop()` checks `if (this.rupturing)` **before** the `!done` build branch and the `stepFocus` interactive branch. `triggerRupture` sets `done = false`, which the existing `pointer()` early-return (`if (!this.done) return`) already turns into "no interaction mid-rupture" — the same gate the initial build uses. When `drawRupture` reports the flicker spent, the loop sets `rupturing = false`, calls `advancePalette()`, then `rebuildFrom(origin)` (which sets `done = false` again for the regrow). **Order matters:** advance the palette BEFORE `rebuildFrom`, because `build()`/`bakeSettled()` read `this.COL` — the regrow must use the new tones.

### Charge is timestamp-derived, never accumulated per frame

`chargeLive()` computes the live charge from `chargeBase` (value at the last click) and `chargeAt` (last-click time): full through `CHARGE_DECAY`, then minus `over / DECAY_FALL`. This is frame-rate independent — do NOT convert it to a per-frame decrement. A click does `chargeBase = min(N, chargeLive() + 1)` so it continues from the decayed value; clicking a different void (or after full bleed) restarts at 1. `stepFocus` retires `chargeVoid` once `chargeLive()` hits 0 so the next poke starts fresh, and the `chargeVoid !== null` term in `stepFocus`'s return keeps the rAF loop alive while a charge glows.

### `chargeVoid` is a live `Unit` pointer — clear it whenever the lattice rebuilds

`chargeVoid` references a `Unit` from the current `units[]`. Any rebuild (`start()`, and the `resize()` `done`-block) makes that pointer stale, so both clear `chargeVoid`/`chargeBase`. Forgetting this would draw the glow against a stale region path after a resize-mid-charge.

### `lockedKeys` stale pointer on resize

**What it is.** The `lockedKeys` Map holds live `Unit` references from `this.units[]`. Every `resize()` call triggers `build()`, which constructs a fresh `this.units[]`.

**Why it matters.** Any `Unit` in `lockedKeys` after a rebuild is a stale pointer to an object from the old lattice. The `drawInteractive` locked-key render loop draws paths from stale `Unit.regs` indices against the new `this.regs[]` — wrong-region highlights or silent array misreads. iOS Safari address-bar show/hide is the primary trigger for this path: the address bar collapsing or re-appearing fires a resize event, which rebuilds the lattice.

**Fix in place.** `this.lockedKeys.clear()` was added to `resize()`'s `done` block alongside the existing `this.chargeVoid = null` clear. Both hold live `Unit` pointers from the old lattice; the pattern is the same class of bug.

**What breaks if removed.** On mobile, the iOS address-bar toggle rebuilds the lattice while `lockedKeys` still holds pre-resize `Unit` references. The next `drawInteractive` pass draws locked-key highlights against stale geometry.

### The break is a pulled plug, not a dissolve

`buildFlickerSchedule()` precomputes the sequence at rupture time: a hard overexposed flash → a sharp blackout (the cut) → 5–7 uneven on/off stutters → a steady beat on the bare outline. `drawRupture()` looks up the active `level` per frame and strokes `linePath` at that alpha (tinting toward `EFFECT.ripple` when `level > 1`), and adds two glitch layers on top: a random horizontal **tear** (translate before stroke, ~40% of frames) and **dropout bands** (black `fillRect` strips, heavier through the stutters, easing off as it settles). No gradual radial dissolve — the abrupt, glitchy break is the point. Reduced motion collapses the schedule to a single short cut and skips the tear/bands.

### `build()` tile range is origin-relative and asymmetric — never a symmetric ±count

**What it is.** `build(originX, originY)` computes its lattice tile bounds as a span reaching from the origin out to each canvas edge independently: `iLo = floor((0 - cx) / (PERX*ss)) - 2`, `iHi = ceil((W - cx) / (PERX*ss)) + 2` (and `jLo`/`jHi` likewise), then loops `i = iLo..iHi`. The bounds extend asymmetrically — fewer tiles toward the near edge, more toward the far one.

**Why.** The old code used a symmetric `iN = ceil((W/2) / (PERX*ss)) + 2` and looped `i = -iN..iN`. That reaches both edges only when the origin is the canvas centre — which is the initial-build case. But `rebuildFrom(x, y)` (the void-rupture regrow seam) passes the *ruptured void's* coordinates as the origin. When that void sits near a corner, the symmetric range ran out of tiles roughly half-way across the canvas and left a large black wedge on the far side once the field rebuilt. The asymmetric origin-relative bounds reach the far edge regardless of where the origin sits. For a centred origin they reduce to the old symmetric range. Total iteration count is unchanged — the span is always ~one canvas wide either way — so there is no perf cost.

**What breaks if reverted to a symmetric ±count.** Corner-origin rebuilds (the only non-centre origins, all of them void ruptures) regrow with a black wedge on the far side. It will NOT show on normal load — the initial build is always centre-origin, where symmetric and asymmetric agree — so a "simplification" back to `±iN/±jN` passes a first-load test and silently breaks the easter egg. Verified: a 9-click rupture on a corner void regrows to full edge-to-edge coverage only with the asymmetric bounds.

### `onBuildComplete` fires again on every regrow — keep it idempotent

The rupture's `rebuildFrom` runs the full build, so `onBuildComplete` → `handleBuildComplete` → `setBuilt(true)` fires again. `built` is already true by then, so it's a no-op and the landing does NOT re-reveal — the canvas just regrows behind the settled content. Don't add side effects to `handleBuildComplete` that assume it runs once.

### Don't-touch

- Rupture branch stays first in `loop()`; `advancePalette()` stays before `rebuildFrom`.
- `chargeLive()` stays timestamp-based; clear `chargeVoid` on every lattice rebuild (`start()` + `resize()`).
- `build()`'s tile range stays origin-relative + asymmetric (reach each edge independently) — never "simplify" it back to a symmetric ±count, which only reaches both edges from a centre origin and leaves a corner-origin rebuild (void rupture) with a far-side black wedge.
- `N`, `CHARGE_DECAY`, `DECAY_FALL` and the flicker/tremor tuning live in the engine constants block — the easter-egg feel is tuned, not incidental.
- The rupture haptic is `flickerSchedule` mapped segment-for-segment to `navigator.vibrate` (the schedule's on→off→on alternation IS the `[buzz, pause, …]` contract). It must stay derived from the schedule, not a hand-written pattern, so buzz and visual can't drift — and the schedule's leading on / trailing on alternation must hold. Guarded by `!this.prefersReduced && navigator.vibrate` (the `&&` is the iOS no-op — Safari has no web haptics). The per-charge wind-up tick scales pulse *length* (the API has no amplitude); don't reach for a non-existent intensity arg.
