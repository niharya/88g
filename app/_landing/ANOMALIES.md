# / (landing) — Anomalies

Route-level architectural anomalies, cross-file wiring, and don't-touch items for the landing route. Code lives at `app/page.tsx` + `app/landing.css` (no dedicated route folder; `app/_landing/` is a stash/docs dir — the `_` prefix keeps Next.js from routing it).

Read this before touching the expand choreography or anything in the secondary stack.

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

## `--expanded-h` follows practice card height

On desktop `--expanded-h` is the tail of the self-adjusting cascade (`calc(var(--contact-top) + 345px)` = contact block + footer margin) — see "Self-adjusting cascade" above. The per-block offset constants in that chain (including this 345px tail) were measured against the current card heights; if a card's content changes materially, update that block's offset constant. On mobile `--expanded-h` is still a hardcoded px value alongside `--spectrum-top`/`--contact-top` — remeasure those together there.

## About-long is the practice timeline

`.about-card--long` is no longer a centered lead-paragraph + discipline-year-chip list. It was redesigned as the **practice timeline**: a proportional data-viz where each segment's WIDTH encodes years in a specialization (Interface ~20% / Brand / Product), running end-to-end so "one thing at a time" reads literally. Recomposed from the 800×480 handoff at `reference/design_handoff_practice_card` into the landing column. Migration to Group B and the retuned linked tops are covered above ("Two-group card system" → "`about-long` migrated A→B"; "Group B order"). The framing, accent, and footgun notes specific to this card:

**Framing recompose — black border shed, terra keyline kept.** Width is 458px (= spectrum's, to give the timeline room). The handoff's black 2px border + heavy drop shadow were dropped in favor of our `--shadow-resting` plus a `terra-560` keyline `::before` (inset 6px, echoing the about-practice mat idiom). Ground stays `--terra-160`. Don't reintroduce the handoff's hard border/shadow — it reads as a foreign card, not part of the mat family.

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

### `about-short` is natural-height; dock is manual per viewport

`.about-card--short` has **no** `min-height`. The card shrinks to its natural content height (a single short centered line — wrapping to ~2 lines on mobile — + tight padding + a divider above the bottom edge on desktop), and the hero docks against that natural bottom via a manually-tuned `--hero-top` per viewport:

- desktop: `--hero-top: 132px`, `--short-top: var(--space-56)` (56), natural card height ~76 → the hero docks with a small overlap into about-short's bottom padding / hidden divider (the desktop clip-buffer — see "Mobile about-short can't overlap the hero" below).
- mobile: `--hero-top: 84px`, `--short-top: var(--space-24)` (24), natural card height ~78 (no divider) → the hero docks just BELOW the card bottom, not overlapping it (see the same entry).

**Why this changed.** The original architecture locked `min-height: calc(var(--hero-top) - var(--short-top))` so the card always filled the dock space at every breakpoint. That worked when the short-copy was the long-form three-clause paragraph it used to be, but the current copy is a single short line (it has only shrunk further since), and the locked min-height left dead space inside the card. Switching to natural-height + token-tuned dock removed that whitespace without breaking the dock.

**If the copy ever grows back.** Either bump `--hero-top` (desktop and mobile) by the new card-height delta, or restore the calc + min-height approach. Don't ship a hardcoded `px` min-height without a tuned `--hero-top` — they'll desync.

`--long-top` and `--projects-top` are part of the cascade — they shift with `--hero-top` per viewport (current: `--long-top: 339` / `--projects-top: 368` desktop, `--long-top: 315` / `--projects-top: 320` mobile). The desktop and mobile hero-overlap behaviors differ in KIND, not just amount — see "Mobile about-short can't overlap the hero" below.

`--long-top` is about-long's expanded resting top; since the practice-timeline redesign about-long is a Group B card (opacity 0 when collapsed, settles from above on expand — see "Two-group card system"), so the overlap figures describe the expanded layout, not a collapsed peek-behind. `--long-top` itself was NOT changed by that redesign — only the settle-stack tops below it moved (see "Group B order"). If `--hero-top` changes again, move both `--long-top` and `--projects-top` by the same delta per viewport — they're a linked set, not independent values. Don't unify the desktop and mobile hero docking; they're intentionally different in kind (desktop overlaps about-short, mobile sits just below it — see "Mobile about-short can't overlap the hero").

### Mobile about-short can't overlap the hero — the offsets differ in KIND

The desktop and mobile hero↔about-short relationships are not the same offset at different magnitudes — they are different in kind. **Desktop OVERLAPS:** `--hero-top` docks the hero ~27px into about-short's bottom, which is safe because `.about-card--short` carries bottom padding plus a divider (`.about-card__divider`, hidden on mobile) below the text — that padding + divider act as a clip buffer, so the hero overlapping the card edge eats only dead space, not text.

**Mobile does NOT overlap — it docks just below (~6px gap).** On mobile (`max-width: 767px`), `.about-card--short` sets `padding-bottom: 0` and the divider is `display: none` (see "Mobile about-short — divider hidden, padding dropped"), so the copy runs right to the card's bottom edge with no buffer. Any hero overlap would CLIP the live text. So mobile sits the hero just below about-short's bottom instead of overlapping it.

**Don't "fix" the mobile gap into an overlap to match desktop** — it would clip the last line of about-short. The gap is the correct read for a card with no bottom buffer. This is why the two `--hero-top` dock figures (relative to about-short's bottom) read as overlap vs gap rather than just two different overlap depths — relates to "`about-short` is natural-height; dock is manual per viewport" above.

### Mobile about-short — divider hidden, padding dropped

On mobile (`max-width: 767px`), `.about-card--short` deviates from the desktop card recipe:

- the bottom `.about-card__divider` is `display: none`
- `padding-bottom` is `0`
- `padding-top` is `var(--space-16)`
- `--short-top` is `var(--space-24)` (vs desktop `var(--space-56)`)

**Why.** Above-hero space on mobile is tight (`--hero-top: 84px`) and the about-short card needs every pixel for the centered copy. The hero's top edge already serves as the visual seam below the short card, so the decorative divider isn't load-bearing here. Don't restore it on mobile without re-measuring above-hero space and bumping `--hero-top` to absorb the extra height.

### Landing scrollbar hidden

`html:has(.landing)` hides the scrollbar via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` + `-ms-overflow-style: none`. Native scroll is preserved; only the visual indicator goes away. macOS/iOS/Android already overlay-hide, so the rule is mainly for Windows/Linux. The expand-on-click affordance carries the "more content" signal that the scrollbar would otherwise telegraph — if that affordance changes, reconsider.

### Full-bleed canvas needs `viewport-fit: cover` (global)

The Startooth canvas must reach the true screen edges on mobile Safari. By default (`viewport-fit: auto`) iOS insets the viewport to the safe area, so the fixed canvas (`inset: 0`) only covers that — the status-bar band (top) and home-indicator/toolbar band (bottom) fall outside it and show the landing's `#000` body background as **black bars**. `viewport.viewportFit = 'cover'` in `app/layout.tsx` makes the layout viewport span the whole screen so the canvas fills behind the chrome.

**It's global, not landing-scoped** — the landing is a `'use client'` page with no layout of its own (it sits directly under the root layout), so a per-route viewport export isn't possible without a route-group restructure. Acceptable because interior pages are light + scrollable (cover reads seamlessly) and `/marks` already guards its edges with `env(safe-area-inset-*)`. **Cost of cover:** any element pinned to a screen edge now sits under the notch/home-indicator unless it guards with `env(safe-area-inset-*)`. The landing's only edge element is the decorative bottom `CaptionTag` — left unguarded on purpose: its show/hide is a JS-measured `translateY` tuck (`--tuck`/`--tuck-hidden` from `offsetHeight`), and folding a safe-area offset into that risks a sliver of the "hidden" caption peeking. If it ever needs guarding, adjust the tuck math and `--tuck-hidden` together, verified on a real device.

**Cover alone is NOT enough — the page background shows in the bars.** iOS Safari paints the backdrop behind its translucent status bar (top) and bottom toolbar with the **page background** (`<html>`/`<body>`), not the fixed canvas — a browser can't render a live `<canvas>` behind its own chrome. So with the first-paint `#000` page bg, those bands stay black even under `viewport-fit: cover`. Fix: once `.landing--built`, swap the page background (`html:has(.landing--built)` + its `body`) from `#000` to `var(--workbench-bg)` (the `/all` desk colour, matching the framed-sheet matte margins — see "Framed sheet" below), eased over `--dur-place`, so the bands blend into the settled field. **The swap target is now `--workbench-bg`, not `--surface-bg`** — it was retargeted when the canvas became the framed sheet sitting on the `/all` desk ground. It's gated on `.landing--built` rather than applied at first paint **on purpose**: the canvas is `ssr:false` (client-only), so the page bg IS the whole-viewport first-paint color — recolouring it before the canvas mounts would flash `#000`→ground as the black-starting canvas appears. Keep the `#000` base; only the built-state swap is safe. (theme-color isn't the lever here — iOS uses the page bg for these bands, which is why the light global `#f2f3ef` theme-color never showed in them.)

## Don't-touch list

- `--stack-stagger-start` value (0.22s is tuned against Group A's tuck-out duration)
- The four-property collapsed-state contract for Group B cards
- The cascade offset sequence (+0.02s on about-practice, +0.04s on contact) following spectrum's base delay
- Group B 0deg rest pose (do not reintroduce random rotation without restoring the typed `@property` + batched reroll safety nets)

---

## Startooth canvas

The Startooth canvas replaces the old static `.landing-pattern-bg` SVG div. It consists of three files: `app/_landing/StartoothField.ts` (engine), `app/_landing/StartoothCanvas.tsx` (React shell), and `app/_landing/startooth-canvas.css` (canvas layout). The canvas is dynamically imported in `app/page.tsx` with `ssr: false`.

### Framed sheet — the canvas is a centered "page", not full-bleed (DESKTOP-ONLY for now)

**What it is.** The Startooth canvas is no longer full-bleed. It's clipped into a centered "page": a 3:4 portrait (the Linotype Bulletin cover ratio) with a brown double-frame, sitting on the `/all` desk ground. Two cooperating fixed elements build it (both in `startooth-canvas.css`, rendered by `StartoothCanvas.tsx`):

- **`.startooth-canvas-root`** (z:0) — the sheet itself. `overflow: hidden` clips the pattern to the sheet; the engine sizes the canvas to this host, so narrowing the host clips the field.
- **`.startooth-sheet-matte`** (z:15, `pointer-events: none`) — the passe-partout. Its transparent centre is the sheet "window"; a `box-shadow: 0 0 0 9999px var(--workbench-bg)` floods the surrounding margins with the `/all` desk colour. This is what produces the framed read AND the clip-on-scroll: content still scrolls via the page, but anything that scrolls past the sheet edges is covered by the matte's flooded margins (the clip is purely VISUAL, not a scroll change).

**Mobile is deferred.** The `@media (max-width: 767px)` framed sheet is NOT done — the geometry tokens and overrides below are tuned for desktop only. A future editor adapting mobile needs to re-derive the sheet width/shift and the caption/footer insets for the narrow viewport, and likely move mobile onto the self-adjusting cascade (see "Self-adjusting cascade").

**Sheet geometry — HEIGHT-DRIVEN, on `:root` in `startooth-canvas.css`.** Don't restate the numbers the tokens own; the structure is:

- `--sheet-margin` — top/bottom inset of the sheet from the viewport edge.
- `--sheet-width` = `min(calc((100vh − 2*--sheet-margin) / 1.3333), 760px, calc(100vw − 64px))`. The width is DERIVED FROM VIEWPORT HEIGHT at the 3:4 ratio (divisor = 4÷3) — so the proportion is identical on every screen and the sheet scales with the viewport at a constant ratio. The `760px` cap matters: above tall viewports the height-driven width would keep growing, so it holds at the cap, which keeps the fixed hero card at ~76% of the sheet on large/4K monitors (the sheet just gains a taller pattern field below) instead of the card shrinking proportionally.
- `--sheet-shift` = `16px`, **hardcoded** = the `.landing`-scoped `--gutter`. It's a literal, not `var(--gutter)`, because `.startooth-canvas-root`/`.startooth-sheet-matte` sit OUTSIDE `.landing` and can't read its scoped token. It centres the sheet on the hero/cards axis. If `--gutter` changes, this literal must change with it.

Both the root and the matte read the SAME `--sheet-*` tokens (same `top`/`bottom`/`left`/`width`/`transform`) — that's what keeps the window and the clipped pattern locked together. Don't give one its own geometry.

**The frame (matte) is a double-frame.** The matte's `4px solid var(--surface-bg)` border is the outer frame, drawn on top (z:15) so cards can never cover it; `--surface-bg` is the same structural brown as the "Startooth Pattern" caption tab. Its `::after` is a 1px `--terra-80` hairline inset `3px` — the lighter inner keyline. Together they read as the engraved double-frame (dark outer rule + light inner keyline), the `/all` bench-card idiom.

**The body background swap target is now `--workbench-bg`.** `html:has(.landing--built)` + `body` swap to `var(--workbench-bg)` (the `/all` desk colour, matching the matte margins), NOT `--surface-bg` — see "Full-bleed canvas needs viewport-fit: cover" for why the swap exists; this just notes the retargeted value.

**Caption + footer were pulled INTO the frame.** Both sat at the viewport edge (in the void margin below the sheet) and were lifted inside the bottom edge:

- `.caption-tag` (colophon tab) gets `bottom: 30px` + `z-index: 12` — below the matte's z:15 so any overflow past the sheet bottom is TRIMMED by the matte, keeping it "within" the sheet. Its JS tuck/peek (`--tuck`/`--tuck-hidden`) rides on top of this anchor.
- `.footer--caption` (the colophon slab, a shared component) gets `bottom: 44px` via `html:has(.landing) .footer--caption` — the `:has()` scope out-specifies the shared `footer.css` rule (which loads AFTER landing.css), and the slab sits above the matte so it reads as a deliberate slab rather than being trimmed like the tab.

**The trap — caption/footer overrides MUST stay on their own selectors (was a real bug).** These positional overrides (`bottom`, `z-index`) are deliberately NOT folded into the shared `.hero-card, .landing-nav-row, .caption-tag { pointer-events: auto }` rule. Doing so applied `bottom: 32px` to the relatively-positioned `.hero-card`, which shifted the WHOLE card up ~32px (effectively `top: -32`), floating the markers and silently throwing off the cascade. Keep positional props out of the pointer-events opt-in rule.

**What breaks if removed.** Drop the matte and the pattern bleeds full-bleed again and scrolled content shows in the margins (no clip). Give the matte different geometry than the root and the frame desyncs from the clipped pattern. Read both `startooth-canvas.css` (geometry + matte) and the caption/footer override block in `landing.css` before touching any sheet dimension or edge element.

### Canvas is `position: fixed`, not `position: absolute`

**What it is.** `.startooth-canvas-root` (in `startooth-canvas.css`) uses `position: fixed`.

**Why.** The landing expands to its full `--expanded-h` height when the user clicks through. An `absolute`-positioned canvas would scroll away with the document, leaving the expanded state with no background. `fixed` keeps the canvas anchored to the viewport behind the landing at all scroll positions.

**What breaks if removed.** Changing to `position: absolute` causes the canvas to disappear as the user scrolls the expanded landing, leaving a white or black gap behind the lower Group B cards.

### Expand-dissolve — the field cross-fades to a line drawing when expanded

**What it is.** On expand the Startooth field cross-fades from the filled pattern to a **line-only twin**, and back on collapse. `bakeSettled()` bakes two offscreen canvases: `settled` (filled) and `settledLines` (a `--surface-bg` ground + a terra-toned stroke). The two values are read from CSS at mount into `lineGround` / `lineStroke`. `drawInteractive()` blits `settled`, then blits `settledLines` at `globalAlpha = expandAmt` over it — both bakes share the same `linePath` so the wireframe holds steady through the fade while only the fills come and go.

**How it's driven.** React passes the `expanded` prop to `StartoothCanvas`, whose effect calls `field.setExpanded(on)` → sets `expandTarget` (0 filled / 1 line). `stepFocus()` eases `expandAmt` toward it on a **time-based smootherstep over `EXPAND_DUR` (800 ms)** — NOT a per-frame exponential. The exponential was tried first and front-loaded the change (~60 % in the first 0.25 s): fine fading the fills *out* (expand), but it "popped" them back *in* on collapse. The time-based curve makes expand and collapse mirror exactly. `setExpanded(true)` also calls `resetFocus()`.

**Interaction gate.** While expanded (`expandTarget === 1`), `pointer()` early-returns — hover lamps, click ripples, and the void-rupture easter egg are all suppressed so the field reads as a quiet backdrop behind the framed sheet. `resetFocus()` (above) clears any key lit just before the expand.

**What breaks if changed.** Reverting to a per-frame exponential reintroduces the collapse "pop". Dropping the `expandTarget === 1` guard in `pointer()` lets the canvas light up / ripple under the expanded content. `lineGround` / `lineStroke` must stay read at mount so they track the `--surface-bg` / terra tokens.

### CSS transition must live in the before-change rule, not the `:not()` guard

**What it is.** The build-gate in `landing.css` (`html.fonts-ready .landing:not(.landing--built)` selector) sets `opacity: 0` and `pointer-events: none` to hold the landing invisible during the 7s canvas build. The `transition` declaration lives only in the sibling base rule `html.fonts-ready .landing` (specificity 0,0,2,1), not inside the `:not()` rule.

**Why.** Per CSS spec, a transition fires only if it is defined in the **before-change style** — the computed style at the moment the property change is triggered. The `:not(.landing--built)` rule has specificity 0,0,3,1 (higher than the base rule). If `transition: none` were placed inside the `:not()` rule it would win in the before-change state, meaning when `.landing--built` is added the engine sees `transition: none` and opacity jumps to 1 instantly — no fade. Keeping `transition` only in the base rule (0,0,2,1) ensures it is always defined regardless of which class combination is active.

**What breaks if violated.** Adding any `transition` override to the `:not(.landing--built)` rule — or moving the `transition` declaration out of the base rule — kills the opacity fade and makes the landing snap in.

### Black first-paint gap — two layers required

**What it is.** `html:has(.landing), html:has(.landing) body { background-color: #000 }` in `landing.css`, and separately `background: #000` on `.startooth-canvas-root` in `startooth-canvas.css`.

**Why.** `StartoothCanvas` is dynamically imported (`ssr: false`) so there is a window between server-rendered HTML and the first canvas paint. During that window, the document background would show through (white in light mode, whatever the user's system default is) causing a flash. The CSS body rule closes the gap before the canvas element exists; the `.startooth-canvas-root` background covers the period between the element mounting and the engine's first draw call. Both layers are needed — the body rule alone fails on slower connections where the canvas chunk hasn't loaded yet; the root rule alone has no effect before the element is in the DOM.

**What breaks if either layer is removed.** Removing the body rule produces a white flash on first load on slow connections or large screens. Removing the canvas root rule produces a brief flicker between element mount and first draw.

### Pointer-events inversion — landing passes through, interactive ELEMENTS opt in (not sections)

**What it is.** `html.fonts-ready .landing { pointer-events: none }` in `landing.css` overrides the `globals.css` rule of the same specificity (same selector, later cascade position — `landing.css` loads after `globals.css`). The opt-in re-enable is scoped to the actual interactive ELEMENTS — `.hero-card`, `.landing-nav-row`, `.caption-tag` — **not** their sections.

**Why.** The canvas sits below the landing in z-order and needs to receive pointer events in empty areas (the engine uses hover for parallax/interaction). If `.landing` absorbed all clicks (as `globals.css`'s `pointer-events: auto` would give it), nothing would reach the canvas. Group B sections (spectrum, about-practice, contact) already self-manage their pointer-events in their own landing.css rules and are not affected by the `.landing` inversion.

**Why the opt-in is on the card/row, NOT the section (load-bearing — was a bug).** `.landing__section--hero` and `.landing__section--projects` have boxes that run FAR taller than their content (the hero section measured 132→878px). Giving the *sections* `pointer-events: auto` made their empty area swallow clicks meant for the docked tabs AND the expanded cards below them. Scoping the opt-in to `.hero-card` + `.landing-nav-row` (the genuinely interactive elements) means only they capture; the empty section area passes through to the tabs/canvas. Do not revert the opt-in to the `.landing__section--*` selectors.

**Why CaptionTag is in the opt-in list.** `.caption-tag` uses `position: fixed` which removes it from normal document flow, but it is still a DOM descendant of `.landing` and inherits `pointer-events: none` through the tree. It must be in the explicit opt-in list or its links and hover states stop working.

**What breaks if the inversion is removed.** Restoring `pointer-events: auto` on `.landing` blocks all canvas interaction. Removing `.caption-tag` from the opt-in list makes caption links unclickable even though the element is visually present.

### Build gate — three triggers and a JS failsafe

**What it is.** The `landing--built` class (gates the landing reveal via the `:not()` rule) is set via three code paths in `app/page.tsx`:

1. `handleBuildComplete` callback, called by `StartoothField` when the 7s build animation finishes. Also sets the module-level `builtThisLoad = true`.
2. `useLayoutEffect` at mount: reads `builtThisLoad`; if true, sets `built`, `skipBuild`, and `staged` to `true` synchronously before first paint. This collapses the build to a single settled frame.
3. An 8s `setTimeout` failsafe (in a `useEffect`) that calls `setBuilt(true)` if `onBuildComplete` never fires — guards against canvas engine failure, missing WebGL context, or a failed dynamic import.

**Why `builtThisLoad` is a MODULE-LEVEL variable, not `sessionStorage` (load-bearing).** The skip must reset on a hard refresh — the build replays — but persist across client-side navigation, so a return trip from `/selected` jumps straight to settled instead of replaying a 7s build on an in-app back-trip. A module var is exactly that scope: fresh per page load (new JS context), shared across route transitions within the same context. `sessionStorage` survives the hard refresh and would wrongly skip the build on every reload — the original bug. Do NOT move this to `sessionStorage`/`localStorage`.

**What breaks if the failsafe is removed.** A user whose browser fails to initialize the canvas (WebGL unavailable, script error, network timeout on the dynamic import) would see a permanently black screen — the landing never becomes visible.

**What breaks if `useLayoutEffect` is changed to `useEffect`.** The `builtThisLoad` read would happen after paint, meaning a client-side return would flash hidden→visible at first paint before `built` is set. `useLayoutEffect` ensures the class is applied before the browser paints (paired with `.landing--skip` — see the skip-pin entry).

### 8s failsafe fires before build completes on slow-connection mobile — expected degradation

**What it is.** The 8s `setTimeout` failsafe in `page.tsx` sets `built = true` to prevent a stranded black screen if the canvas engine fails. On a slow mobile connection (3G, cold load), the dynamic `import('./_landing/StartoothCanvas')` bundle may not arrive until 3–5s after hydration. Combined with the `BUILD_HOLD_MS` black hold and the 6.2s build animation, the engine can take 10–12s total to fire `onBuildComplete` — well past the 8s gate.

**What happens.** The failsafe reveals the landing and the staged entrance plays normally, but the canvas build animation continues behind the now-revealed content. This is expected behavior: the failsafe was designed for engine failure (context error, hard crash, failed dynamic import), and the build animating visibly through a settled landing on very slow connections is an acceptable degradation — the canvas is decorative, the copy is readable.

**What breaks if you change the timer.** Do not lower the failsafe timer to fix perceived slow loads. Doing so would fire the failsafe during the build on normal connections, permanently cutting the build animation short for all users. The 8s value accounts for the full normal-path build window; early firing is not a fix.

### A rebuild always animates — `reduced` splits from `skipBuild`

**What it is.** `StartoothField` keeps two flags, not one: `prefersReduced` (from `matchMedia('(prefers-reduced-motion: reduce)')`, permanent, accessibility) and `reduced` (the per-build "collapse to one frame" switch). At mount `reduced = prefersReduced || skipBuild`. `rebuildFrom(x, y)` (the public re-grow seam — see the void-rupture spec) resets `reduced` to `prefersReduced` alone.

**Why.** A rebuild is an explicit request to WATCH the field regrow. If `reduced` stayed conflated with `skipBuild`, a page that loaded in skip mode (client-side return) would rebuild *instantly* — invisibly. Splitting the flags lets a rebuild animate even on a skip-loaded page while still honouring a genuine reduced-motion preference. `rebuildFrom` also subtracts `HOLD` from `buildStart` so the rebuild begins immediately rather than flashing ~900ms of black behind the visible content (the black HOLD is initial-load anticipation, pointless on a re-grow). There is currently no UI calling `rebuildFrom` — it is the wired seam the deferred void-rupture feature will drive.

### Staged entrance — card settles first, then the tabs, then the caption

**The sequence.** Build reveals (as the last visible corner paints) → the hero card *settles* onto the field → after it lands the nav row (Nihar/Works) slides in → then a beat later the Startooth caption follows. Distinct gated steps, not one block fade:

1. **Build fires as the last visible corner paints, not at the tail.** `drawBuild()` returns true at `prog > 0.76`, not `0.98`. The lattice is oversized for the -15° tilt, so the regions that finish last (~0.88) sit off-screen; every VISIBLE region is filled by ~0.79. `bakeSettled` redraws the full pattern regardless of `prog`, so firing at 0.76 reveals the card just as that final visible corner is being laid down — they overlap, with no pop. Don't wait for the full coat (don't push back toward 0.85+) — the corners that finish later are off-screen anyway.
2. **The card rises-then-sits (build path only).** On `.landing--built:not(.landing--skip):not(.landing--slide-in)`, `.hero-card__bg` runs `hero-card-settle` over `--dur-place` (slowest tier, ≈ the build's outline→fill wait): a short run-up slightly past its rest line, then a settle back down to rest, with the box-shadow deepening flat→`--shadow-raised` as it lands. The single small overshoot above rest is an authored dampened settle (no oscillation) — a deliberate, deliberately-shallow deviation from the "no overshoot" motion rule, requested for the settle feel. **Opacity is NOT in the keyframe** — the block reveal owns it at `--dur-fast` (see below), so the card reads opaque almost immediately while the settle motion stays slow. Skip/return keep the quick `hero-glide-up`; slide-in keeps `hero-glide-from-left`.
3. **Block opacity is fast and decoupled.** `html.fonts-ready .landing` reveals on `--dur-fast` (not `--dur-glide`). Because every element except the hero card is individually gated, this only governs the card's fade-in — which is why the card can hit full opacity quickly while its transform settles slowly.
4. **About-cards are held hidden during the settle.** They tuck directly behind the hero; while the hero is still fading in they would bleed through it. `.landing--built:not(.landing--staged):not(.landing--expanded) .about-card { opacity: 0 }` keeps them invisible until the card lands (they're occluded by the opaque hero at rest, so flipping them visible at `staged` is imperceptible). The `:not(.landing--expanded)` guard releases them if the user expands before staging.
5. **The tabs trail the card, then the caption trails the tabs.** A `staged` React state (separate from `built`) flips after the card has docked — its `page.tsx` setTimeout (~1300ms) clears `--dur-place` + a short beat so the tabs FOLLOW the dock closely without overlapping it. It adds `.landing--staged`, releasing the nav row's `works-tuck-out` (`--ease-snap`, held by `:not(.landing--staged) .landing-nav-row { animation-play-state: paused }`) and the about-cards. The caption is a SEPARATE stage: a `captionIn` state flips ~700ms after `staged` (a second `page.tsx` setTimeout), and the caption's `visible` is `!expanded && captionIn` — so it slides up a beat after the tabs, not with them. Both `staged` and `captionIn` flip synchronously on the skip/return path.

**Why the gates exist — entrances run on MOUNT.** `hero-card-settle`/`hero-glide-up` and `works-tuck-out` are CSS animations that fire at element mount — i.e. *during* the build, while the landing is `opacity: 0`. Without `animation-play-state: paused` gating they play out entirely behind the curtain and finish before the reveal, so nothing animates when the curtain lifts. The pause gates hold each at its from-state until its trigger (`.landing--built` for the card, `.landing--staged` for the tabs).

**Knobs are linked across CSS and JS.** `--dur-place` (globals.css) sets the card-dock duration AND the `staged` setTimeout in `page.tsx` mirrors it (+ a beat) so the tabs fire just after the card lands; a second `captionIn` setTimeout then trails `staged` so the caption follows the tabs. Retune the three together — if `--dur-place` changes, bump the `staged` delay to keep clearing it.

**What breaks if a pause gate is removed.** That stage's entrance is spent behind the build curtain and never seen — the card flat-fades in, or the tabs appear already-present instead of snapping in after the card.

### Skip-on-return reveal must be instant — `.landing--skip` defeats a transition pin

**What it is.** On client-side return (`builtThisLoad` is set), `page.tsx` adds `.landing--skip` alongside `.landing--built`, and `landing.css` sets `html.fonts-ready .landing.landing--skip { transition: none }`.

**Why — the pin.** The skip path flips `built` from `false`→`true` inside `useLayoutEffect`, i.e. before the first paint (required: a `useEffect` would flash hidden→visible, and the SSR/hydration render must start from `built=false`). That means the landing's `opacity` goes `0`→`1` before the browser ever paints the `0` from-state. A transition armed from a never-painted from-state **pins at `currentTime: 0`** and strands the landing at `opacity: 0` forever (confirmed: forcing `transition: none` inline snaps it to 1). The build path does not hit this — its `opacity: 0` from-state is painted for the whole duration of the build, so the reveal transition fires cleanly. There is no build to wait for on return, so the correct reveal is simply instant.

**What breaks if `.landing--skip` is removed.** Returning visitors land on a permanently invisible page (`opacity: 0`, pinned transition) until something forces a style recalc. This is a silent, intermittent-looking failure — it only reproduces on the skip path, so it is easy to miss in a first-load test.

### Hover-release fade — three deliberate divergences from the handoff (no jerk)

The original handoff's key-hover release jerked. `stepFocus()` reworks it in three ways; all are improvements over the reference — **do NOT "restore" the handoff behaviour:**

1. **Fade from `fadeFrom`, not `1 - t`.** The dim ramp-up (`focusAmt += (1-focusAmt)*0.13`) takes ~0.66s to reach 1, so a short hover releases mid-ramp. The handoff's `focusAmt = 1 - t` (with `t` starting at 0) forces `focusAmt` to **1** for a frame before easing down — a snap-to-full. We capture `fadeFrom = focusAmt` at release and fade `fadeFrom * (1 - smoother(t))`.
2. **Keep the released key lit through the fade (`fadeUnit`).** The handoff clears `focusUnit` to null the instant you leave, so the lit key + its lamp snap dark on the first fade frame while only the veil eases out. We capture `fadeUnit = prevDu` at release and `drawInteractive` reads `focusUnit ?? fadeUnit`, so the key dims *with* the veil instead of snapping.
3. **Linger + smootherstep.** A short `LINGER` holds the dim before the fade begins (it doesn't collapse the instant you leave), and the fade uses `smoother(t)` so it starts at zero velocity — no jerk at the hand-off from the ramp-up. `fadeUnit` clears when the fade completes.

### Touch uses press-and-hold for the lamp effect — intentional, not a hover state

**What it is.** On `pointerType === 'touch'`, keys activate the lamp focus effect via `pressFocus = true` on `pointerdown`. There is no hover state on touch devices (pointer devices only). The `pointerType === 'touch'` branch in `pointer()` is a deliberate design decision: a touch press activates the same lamp-dim effect a mouse hover does, making keys feel tactile and pressable.

**Why this exists.** Without this branch, touch presses on keys would do nothing — the lamp effect and lock trigger would be entirely absent for touch users because the hover path never fires on touch. The branch is the touch substitute for hover.

**What breaks if removed.** Removing or no-op-guarding the `pointerType === 'touch'` branch means touch presses on keys produce no lamp effect and never trigger a lock. Do not remove it, unify it with mouse handling, or add a guard that skips `pressFocus` for touch.

### Icon subset — system Python fallback for `icon_subset.py`

**What it is.** When the landing's icon set changes (`ICON_NAMES` in `app/lib/icons.ts`), the font subset is rebuilt with `/usr/bin/python3 scripts/icon_subset.py`. (History: the `replay` icon was added here for the canvas replay button, then removed with the button — leaving 15 icons.)

**Why the fallback exists.** The project's `npm run icons` script invokes the Homebrew-managed `python3.14`, which has a broken `pyexpat.so` on this machine — it errors out before fontTools can run. The system Python at `/usr/bin/python3` has fontTools installed and works correctly. The pre-push hook runs `npm run icons:check` and will block a push with a stale subset.

**What to do when changing icons.** Run `npm run icons` first. If it fails with "fontTools not found" or a `pyexpat` import error, fall back to `/usr/bin/python3 scripts/icon_subset.py` directly. Never skip the subset rebuild — the pre-push hook will catch it, but catching it at push time is later than catching it locally.

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
