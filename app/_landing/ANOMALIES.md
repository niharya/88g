# / (landing) — Anomalies

Route-level architectural anomalies, cross-file wiring, and don't-touch items for the landing route. Code lives at `app/page.tsx` + `app/landing.css` (no dedicated route folder; `app/_landing/` is a stash/docs dir — the `_` prefix keeps Next.js from routing it).

Read this before touching the expand choreography or anything in the secondary stack.

---

## Two-group card system

The landing has two logical groups of cards, and their entrance/exit motion must stay in separate idioms:

- **Group A — hero-tucked.** `about-short`, `about-long`. These live *inside* the hero's mental frame in the default state and tuck out on expand via `top`/`transform` **transitions** (the `hero-glide-*` keyframes are mount-entrance only — not expand choreography). No random rotation exists anywhere in Group A; that system was removed.
- **Group B — secondary stack.** `spectrum`, `about-practice`, `contact` (in DOM order; see "Group B order" below). These live *below* the hero in the expanded state only. In the default state they are opacity 0 with a small upward `translateY(-var(--stack-settle))` offset and `pointer-events: none`. On expand, they settle from above into place.

**Do not mix idioms.** Do not apply Group A's hero-tuck transitions to Group B cards, and do not apply Group B's opacity-fade-settle to Group A. `about-practice` is part of Group B, not an extension of `about-long`, even though the copy continues.

### Choreography tokens

Defined on `.landing` in `landing.css`:

- `--stack-stagger-start: 0.22s` — delay before Group B begins its entrance, so Group A is ~73% through its tuck-out before Group B starts. Lower values cause visual competition.
- `--stack-settle: var(--space-24)` — Y-offset Group B cards start from (above their resting top). Creates the "settling from above" read.
- `--stack-gap: 40px` — design intent for vertical rhythm between Group B cards' unrotated boundaries. Used when positioning new stack cards.

**Cascade offsets.** After the spectrum/practice swap, the order is spectrum (#1, no offset), about-practice (#2, `+0.02s`), contact (#3, `+0.04s`). If you add a fourth Group B card, it continues the cascade (+0.06s). Do not restart at 0.

### Group B order

Spectrum sits above about-practice in the expanded stack (post-swap). `--spectrum-top` is the first Group B slot below `about-long`; `--practice-top` is computed from `--spectrum-top + spectrum-block`. `--contact-top` and `--expanded-h` are unchanged by the swap because spectrum-block + practice-block totals the same in either order — they're a linked set anchored at long-top and contact-top. If you change either card's height, remeasure both intermediate tops in tandem.

## Group B card rotation — pinned to 0deg

`about-practice` (and any future Group B card) opens at 0deg. The earlier random-rotation system (`--practice-rot`, `rerollStackRotations()`, `@property --practice-rot` registration) was removed in favour of an axis-aligned rest. If a future Group B card needs random tilt, restore the `@property <angle>` typing AND batch the reroll with `setExpanded` in the same React commit (untyped custom properties snap mid-transition; a `useEffect([expanded])` reroll lags one render and ghost-flickers).

## Group B collapsed-state contract

Every Group B card in `.landing--default` must:

- set `top` to its final expanded position (not off-screen)
- set `opacity: 0`
- set `pointer-events: none`
- include a `translateY(calc(-1 * var(--stack-settle)))` offset in its transform

This pattern is what gives Group B its "settle from above" read. A card that drops any of these four properties will enter the stack with the wrong physics.

**Historical note.** Spectrum and contact previously violated this contract — they started at `--hero-top` with `scale(0.9)` and slid ~1000–1350px down to their final positions while fading in. The long descent read as ghost cards trailing behind the settled hero. They were brought into full compliance so all three Group B cards now settle from ~24px above in place. Do not regress this by re-anchoring spectrum/contact to `--hero-top` or reintroducing `scale()` on them.

**Static artistic rotation is separate from Group B 0deg rest.** Spectrum carries a fixed `rotate(-1deg)` at all breakpoints — this is an authored artistic tilt, not a rerolled rotation. The "Group B pinned to 0deg" rule above refers specifically to the removal of the random `--practice-rot` reroll system; static per-card rotations baked into the transform chain are fine and should be preserved.

## Expanded-state transition timing

Group B cards transition `top`, `opacity`, and `transform` on expand. All three use `var(--dur-slide)` with `var(--ease-paper)`, delayed by `--stack-stagger-start` (+ cascade offset per card). Do not stagger these three properties against each other within a single card — they must move as one.

**Documented mobile deviation (spectrum only).** The mobile block puts spectrum's `transform` on `--dur-settle` with a +0.12s extra delay while `top`/`opacity` stay on the base beat. Shipped and authored — don't "fix" it to match the desktop rule, and don't copy the stagger to other cards.

## Form-open height bump

`.landing--expanded:has(.contact-card--form-open)` adds +600px to both `.landing--expanded` and `.landing__content` heights. Without this, the open contact card overflows past the fixed `--expanded-h` (overflow is `visible`, so the form renders, but the document ends flush against the form's last pixel — no breathing gap below). The bump is wired via `:has()` so React doesn't have to thread a `--form-open` modifier up to `.landing`. If you change `--contact-top`, the contact card collapsed height, or the form's `max-height` reveal target, remeasure the +600 value at all breakpoints (target ~96px gap below the fully-open form).

## Contact form `inert` when closed

`.contact-card__form-reveal` carries both `aria-hidden={!formOpen}` and `inert={!formOpen ? true : undefined}` in `page.tsx`. `aria-hidden` removes the form from the accessibility tree but does **not** block keyboard focus — a keyboard-only user (no screen reader) could Tab into the invisible fields inside the `overflow: hidden` / zero `max-height` container while the form is collapsed. `inert` closes that gap: it suppresses both keyboard focus and AT access in a single attribute. Don't remove `inert` thinking `aria-hidden` is sufficient — they serve different users.

## `--expanded-h` follows practice card height

`--expanded-h` (page height in expanded state) was measured with the practice card at ~471px tall (padding 72 + para 84 + divider 49 + para block 266). If practice card content changes materially, remeasure and update `--expanded-h`, `--spectrum-top`, and `--contact-top` together — they are a linked set, not independent values.

---

## Responsive anomalies

### `about-short` is natural-height; dock is manual per viewport

`.about-card--short` has **no** `min-height`. The card shrinks to its natural content height (centered paragraph + tight padding + a divider above the bottom edge on desktop), and the hero docks against that natural bottom via a manually-tuned `--hero-top` per viewport:

- desktop: `--hero-top: 178px`, `--short-top: var(--space-56)` (56), natural card height ~122 → 56 + 122 = 178 ✓
- mobile: `--hero-top: 116px`, `--short-top: var(--space-24)` (24), natural card height ~92 (no divider) → 24 + 92 = 116 ✓

**Why this changed.** The original architecture locked `min-height: calc(var(--hero-top) - var(--short-top))` so the card always filled the dock space at every breakpoint. That worked when the short-copy was the long-form three-clause paragraph it used to be, but the current copy ("I never fit neatly…") is shorter, and the locked min-height left 30–55px of empty space inside the card. Switching to natural-height + token-tuned dock removed that whitespace without breaking the dock.

**If the copy ever grows back.** Either bump `--hero-top` (desktop and mobile) by the new card-height delta, or restore the calc + min-height approach. Don't ship a hardcoded `px` min-height without a tuned `--hero-top` — they'll desync.

`--long-top` and `--projects-top` are part of the cascade — they were shifted by the same delta when `--hero-top` moved, so:

- desktop: long-top 385 sits **33px above** hero-bottom 418 (the long card peeks 33px behind the hero from the bottom edge). projects-top 414 sits 4px above hero-bottom.
- mobile: long-top 347 sits **9px above** hero-bottom 356 (a tighter overlap — there's less space behind the hero on mobile, and only the nav-pill row has to clear). projects-top 352 sits 4px above hero-bottom.

If `--hero-top` changes again, move both `--long-top` and `--projects-top` by the same delta per viewport — they're a linked set, not independent values. Don't unify the desktop and mobile overlap figures; the 9px vs 33px split is intentional.

### About-long horizontal padding is pinned to the discipline copy

`.about-card--long` has `padding-left/right: var(--space-24)` (instead of the standard about-card 32). The reason is that "Studio-building and creative direction" + a trailing `<Monostamp>` chip would not fit on one line at `t-p3` with 32 horizontal padding (text width 320 too narrow). The tighter 24 padding gives text-width 336, which fits.

The mobile `.about-card` rule already uses `var(--space-24)` padding all around, so the two viewports happen to agree — but the *intent* differs. If desktop copy ever changes and you need to widen the inner area further, scope the change with a viewport guard so mobile doesn't follow.

### About-long copy is centered

`.about-card--long .about-card__text` is `text-align: center` — a lead paragraph (`.about-card__lead`, added v0.89) above three discipline rows (row 3 wraps to two lines) reads as a centered list of authored typographic units, with each chip sitting inline after its anchor word. This was a deliberate move *away* from right-edge chip docking; an earlier ledger composition right-aligned the chips, which read as "paying too much attention to the numbers." Don't propose tabular right-alignment again without re-checking that design intent.

### "Growth experiments" is a single typographic unit on row 3

`app/page.tsx` wraps the words "growth experiments" in a `<span style={{ whiteSpace: 'nowrap' }}>` inside row 3 of about-long. This is load-bearing for the wrap shape: with the wrap, line 1 breaks after "and" and line 2 reads "growth experiments [3y]" — keeping the two words together feels like one verbal cluster. Without the wrap, "growth" lands at the end of line 1 and "experiments" sits alone on line 2 next to the chip. Don't remove this `nowrap` span when editing the copy; if you replace "growth experiments" with a different phrase, decide whether the new phrase wants the same treatment.

### Collapsed about-long tuck differs per viewport (v0.90)

The desktop collapsed state lifts about-long **above** the hero top (`top: calc(var(--hero-top) - 20px)`) and scales it to `0.82`, so the card's center aligns with the hero's center and the scaled height fits inside the hero's bounds — the card grew with the v0.89 lead paragraph and the old recipe let it peek out from behind the hero. Mobile keeps the original recipe (`top: var(--hero-top)`, `scale(0.9)`). Both offsets are hand-tuned against the current copy (the inline comment in `landing.css` carries the math); if the card's content changes, re-measure. Don't unify the two viewports' collapsed recipes.

### Mobile about-short — divider hidden, padding dropped

On mobile (`max-width: 767px`), `.about-card--short` deviates from the desktop card recipe:

- the bottom `.about-card__divider` is `display: none`
- `padding-bottom` is `0`
- `padding-top` is `var(--space-16)`
- `--short-top` is `var(--space-24)` (vs desktop `var(--space-56)`)

**Why.** Above-hero space on mobile is tight (`--hero-top: 116px`) and the about-short card needs every pixel for the centered copy. The hero's top edge already serves as the visual seam below the short card, so the decorative divider isn't load-bearing here. Don't restore it on mobile without re-measuring above-hero space and bumping `--hero-top` to absorb the extra height.

### Landing scrollbar hidden

`html:has(.landing)` hides the scrollbar via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` + `-ms-overflow-style: none`. Native scroll is preserved; only the visual indicator goes away. macOS/iOS/Android already overlay-hide, so the rule is mainly for Windows/Linux. The expand-on-click affordance carries the "more content" signal that the scrollbar would otherwise telegraph — if that affordance changes, reconsider.

## Don't-touch list

- `--stack-stagger-start` value (0.22s is tuned against Group A's tuck-out duration)
- The four-property collapsed-state contract for Group B cards
- The cascade offset sequence (+0.02s on about-practice, +0.04s on contact) following spectrum's base delay
- Group B 0deg rest pose (do not reintroduce random rotation without restoring the typed `@property` + batched reroll safety nets)

---

## Startooth canvas

The Startooth canvas replaces the old static `.landing-pattern-bg` SVG div. It consists of three files: `app/_landing/StartoothField.ts` (engine), `app/_landing/StartoothCanvas.tsx` (React shell), and `app/_landing/startooth-canvas.css` (canvas layout). The canvas is dynamically imported in `app/page.tsx` with `ssr: false`.

### Canvas is `position: fixed`, not `position: absolute`

**What it is.** `.startooth-canvas-root` (in `startooth-canvas.css`) uses `position: fixed`.

**Why.** The landing expands to its full `--expanded-h` height when the user clicks through. An `absolute`-positioned canvas would scroll away with the document, leaving the expanded state with no background. `fixed` keeps the canvas anchored to the viewport behind the landing at all scroll positions.

**What breaks if removed.** Changing to `position: absolute` causes the canvas to disappear as the user scrolls the expanded landing, leaving a white or black gap behind the lower Group B cards.

### CSS transition must live in the before-change rule, not the `:not()` guard

**What it is.** The build-gate in `landing.css` (`html.fonts-ready .landing:not(.landing--built)` selector) sets `opacity: 0` and `pointer-events: none` to hold the landing invisible during the 7s canvas build. The `transition` declaration lives only in the sibling base rule `html.fonts-ready .landing` (specificity 0,0,2,1), not inside the `:not()` rule.

**Why.** Per CSS spec, a transition fires only if it is defined in the **before-change style** — the computed style at the moment the property change is triggered. The `:not(.landing--built)` rule has specificity 0,0,3,1 (higher than the base rule). If `transition: none` were placed inside the `:not()` rule it would win in the before-change state, meaning when `.landing--built` is added the engine sees `transition: none` and opacity jumps to 1 instantly — no fade. Keeping `transition` only in the base rule (0,0,2,1) ensures it is always defined regardless of which class combination is active.

**What breaks if violated.** Adding any `transition` override to the `:not(.landing--built)` rule — or moving the `transition` declaration out of the base rule — kills the opacity fade and makes the landing snap in.

### Black first-paint gap — two layers required

**What it is.** `html:has(.landing), html:has(.landing) body { background-color: #000 }` in `landing.css`, and separately `background: #000` on `.startooth-canvas-root` in `startooth-canvas.css`.

**Why.** `StartoothCanvas` is dynamically imported (`ssr: false`) so there is a window between server-rendered HTML and the first canvas paint. During that window, the document background would show through (white in light mode, whatever the user's system default is) causing a flash. The CSS body rule closes the gap before the canvas element exists; the `.startooth-canvas-root` background covers the period between the element mounting and the engine's first draw call. Both layers are needed — the body rule alone fails on slower connections where the canvas chunk hasn't loaded yet; the root rule alone has no effect before the element is in the DOM.

**What breaks if either layer is removed.** Removing the body rule produces a white flash on first load on slow connections or large screens. Removing the canvas root rule produces a brief flicker between element mount and first draw.

### Pointer-events inversion — landing passes through, sections opt in

**What it is.** `html.fonts-ready .landing { pointer-events: none }` in `landing.css` overrides the `globals.css` rule of the same specificity (same selector, later cascade position — `landing.css` loads after `globals.css`). Three elements explicitly re-enable: `.landing__section--hero`, `.landing__section--projects`, and `.caption-tag`.

**Why.** The canvas sits below the landing in z-order and needs to receive pointer events in empty areas (the engine uses hover for parallax/interaction). If `.landing` absorbed all clicks (as `globals.css`'s `pointer-events: auto` would give it), nothing would reach the canvas. Group B sections (spectrum, about-practice, contact) already self-manage their pointer-events in their own landing.css rules and are not affected by the `.landing` inversion.

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

### Staged entrance — card settles first, then the tabs snap in

**The sequence.** Build reveals → the hero card *settles* slowly onto the field → only after it lands do the nav row (Nihar/Works) and the Startooth caption slide in, snappily. Three gated stages, not one block fade:

1. **Build fires at on-screen-fill-complete, not the tail.** `drawBuild()` returns true at `prog > 0.85`, not `0.98`. The lattice is oversized for the -15° tilt, so the regions that finish last (~0.88) sit off-screen; every VISIBLE region is filled by ~0.79. `bakeSettled` redraws the full pattern regardless of `prog`, so firing at 0.85 starts the card sooner with no visible pop.
2. **The card settles (build path only).** On `.landing--built:not(.landing--skip):not(.landing--slide-in)`, `.hero-card__bg` runs `hero-card-settle` over `--dur-place` (slowest tier, ≈ the build's outline→fill wait). The motion is **rise-then-sit**: the card rises up slightly past its rest line then comes back down a few px to "sit", with the box-shadow deepening flat→`--shadow-raised` as it lands. **Opacity is NOT in the keyframe** — the block reveal owns it at `--dur-fast` (see below), so the card reads opaque almost immediately while the settle motion stays slow. The single overshoot above rest is an authored dampened settle (no oscillation) — a deliberate deviation from the "no overshoot" motion rule, requested for the throne-sit feedback. Skip/return keep the quick `hero-glide-up`; slide-in keeps `hero-glide-from-left`.
3. **Block opacity is fast and decoupled.** `html.fonts-ready .landing` reveals on `--dur-fast` (not `--dur-glide`). Because every element except the hero card is individually gated, this only governs the card's fade-in — which is why the card can hit full opacity quickly while its transform settles slowly.
4. **About-cards are held hidden during the settle.** They tuck directly behind the hero; while the hero is still fading in they would bleed through it. `.landing--built:not(.landing--staged):not(.landing--expanded) .about-card { opacity: 0 }` keeps them invisible until the card lands (they're occluded by the opaque hero at rest, so flipping them visible at `staged` is imperceptible). The `:not(.landing--expanded)` guard releases them if the user expands before staging.
5. **The tabs trail it.** A `staged` React state (separate from `built`) flips after the card has settled — its `page.tsx` setTimeout is `--dur-place` + a beat (~1500ms) so the tabs clearly FOLLOW the sit rather than overlap it. It adds `.landing--staged`, releasing the nav row's `works-tuck-out` (`--ease-snap`, held by `:not(.landing--staged) .landing-nav-row { animation-play-state: paused }`) and the about-cards, and showing the caption (its `visible` is `!expanded && staged`).

**Why the gates exist — entrances run on MOUNT.** `hero-card-settle`/`hero-glide-up` and `works-tuck-out` are CSS animations that fire at element mount — i.e. *during* the build, while the landing is `opacity: 0`. Without `animation-play-state: paused` gating they play out entirely behind the curtain and finish before the reveal, so nothing animates when the curtain lifts. The pause gates hold each at its from-state until its trigger (`.landing--built` for the card, `.landing--staged` for the tabs).

**Two knobs are linked across CSS and JS.** `--dur-place` (globals.css) sets the card-settle duration AND the `staged` setTimeout in `page.tsx` mirrors it (+ a beat) so the tabs fire just after the card lands. Retune both together.

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

### `onBuildComplete` fires again on every regrow — keep it idempotent

The rupture's `rebuildFrom` runs the full build, so `onBuildComplete` → `handleBuildComplete` → `setBuilt(true)` fires again. `built` is already true by then, so it's a no-op and the landing does NOT re-reveal — the canvas just regrows behind the settled content. Don't add side effects to `handleBuildComplete` that assume it runs once.

### Don't-touch

- Rupture branch stays first in `loop()`; `advancePalette()` stays before `rebuildFrom`.
- `chargeLive()` stays timestamp-based; clear `chargeVoid` on every lattice rebuild (`start()` + `resize()`).
- `N`, `CHARGE_DECAY`, `DECAY_FALL` and the flicker/tremor tuning live in the engine constants block — the easter-egg feel is tuned, not incidental.
