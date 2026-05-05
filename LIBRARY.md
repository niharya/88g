# LIBRARY.md

Staging catalog for components and modules built inside this portfolio that may later be extracted into a standalone library.

This is a **pointer list + AI context** — not a source of truth. The code itself lives at the paths each entry references. When something gets extracted to the external library later, the entry is updated rather than copied here.

Living document. Entries are added as new reusable pieces are built; a sweep will catalog existing qualifying code later.

File-path links resolve from repo root on GitHub. This file isn't rendered by the site.

---

## Entry format

Each entry has four things:

1. **Name** — short and descriptive
2. **What it does** — one or two sentences in plain language, human-readable
3. **Where it lives** — file paths to the code (and CSS, if separate)
4. **AI notes** — non-obvious dependencies, load-bearing values, don't-touch warnings, and what's route-specific vs library-ready. Written for a future AI session or contributor who has never seen this repo.

Add new entries **above the divider at the bottom**, most recent first.

---

## Caption (`.t-caption`)

The standardized treatment for short text that sits below (or above) an image, video, or other media surface. Carries the full caption spec — `t-p4` typography baseline, `--grey-480` color, `text-align: center` default. One class on the `<p>` is the entire treatment; the 8px gap from media is composed by the consumer's wrapper layout.

**Where it lives**
- [app/globals.css](app/globals.css) — the `.t-caption` rule, alongside the other `.t-*` typography utilities.
- Consumers in [/biconomy](app/(works)/biconomy/biconomy.css) — `.multiverse__after-sub`, `.bips__footnote`, `.api__caption`, `.demos__caption`. Each consumer's CSS holds only layout-specific bits (width, text-align overrides, hover-state color shifts), never the typography or default color.

**AI notes**
- **One class is the whole treatment.** `<p className="t-caption">…</p>` — don't apply both `t-p4` and `t-caption`; t-caption already includes the t-p4 typography.
- **Color and centering are defaults, both overridable.** Consumers can write `.x { text-align: start; }` on the same element to override (e.g. `/biconomy` API caption sits in a 2-col row with the NavPill, so it left-aligns). They can also override color for state — `/biconomy` Demos video caption keeps a `transition: color` for the playing-state shift to `--grey-240`.
- **Gap from media is consumer-owned.** Default pattern: parent flex-column with `gap: var(--space-8)`. Demos uses 8px between image-frame and caption-row (was 16px before standardization). API uses `padding-top: var(--space-8)` because the parent grid handles columns. Never bake the gap into `.t-caption` itself — different consumers compose it differently (e.g. caption-plus-nav rows, or captions paired with a play icon below).
- **What's route-specific** — wrapper layout (flex/grid, gap value), per-consumer width caps, state-driven color shifts.
- **What's library-ready** — the `.t-caption` class itself. Already in `globals.css`; the four /biconomy consumers all use it.
- **Promotion history.** Multiverse `.multiverse__after-sub` was the original benchmark; BIPs / API / Demos were aligned in two passes (color match, then full token promotion).

---

## NavMarker

The single nav-marker primitive — the shared shell behind every `ChapterMarker`, `ProjectMarker`, `ExitMarker`, and the landing's Nihar / Works markers. Emits the `.nav-marker` class structure that `nav.css` already consumes, so adoption is a visual no-op; tone / state / acknowledgment modifiers layer new behavior on top. Supports three element shapes (`a` / `button` / `div`) via a discriminated `as` union, three slot roles (`project` / `chapter` / `exit`), three tones (`neutral` / `terra` / `mint`), two states (`default` / `active`), and three click acknowledgments (`navigate` / `shake` / `morph`). Optional `wipHint` reveals a Monostamp chip beside the label on click (auto-dismiss after 8s). When the chapter marker docks, it + the adjacent project marker share a muted mat-coloured shell (`--mat-bg` + `--mint-100` border) so the pair reads as one unit.

**Where it lives**
- [app/components/NavMarker/NavMarker.tsx](app/components/NavMarker/NavMarker.tsx) — component, `NavMarkerProps` discriminated union, `NavMarkerRole` / `NavMarkerTone` / `NavMarkerState` / `NavMarkerAcknowledge` types, `useShakeState` + `useWipHintState` hooks.
- [app/components/NavMarker/navmarker.css](app/components/NavMarker/navmarker.css) — tones, press translate, shake keyframe (`nav-marker-arrow-shake`, 360ms, origin bottom), morph rotation (`.is-morphed` → 45°), `.nav-marker__wip.is-shown` chip reveal, and the docked fill rule covering the chapter marker and the adjacent project marker.
- [app/components/NavMarker/index.ts](app/components/NavMarker/index.ts) — barrel.
- Consumers: `app/components/nav/{ChapterMarker,ProjectMarker,ExitMarker}.tsx`, `app/page.tsx` (landing Nihar + Works markers), `app/(works)/selected/page.tsx` (Works nameplate), `app/(works)/selected/components/{NiharHomeLink,Timeline}.tsx`.
- Route layouts must `import 'app/components/NavMarker/navmarker.css'`. Wired from `app/(works)/layout.tsx`, `app/marks/layout.tsx`, and `app/page.tsx`. Import the CSS alongside `nav.css` — the two files complement each other (`nav.css` owns positioning + the `.nav-marker` base; `navmarker.css` owns the primitive's own modifiers).

**AI notes**
- **"Marker," not "pill," inside the nav domain.** The primitive is deliberately named to match `ChapterMarker` / `ProjectMarker` / `ExitMarker`. The word "pill" was removed from the nav module on purpose — these are page-position markers. Do not rename back. Biconomy's slide prev/next component at `app/(works)/biconomy/components/NavPill.tsx` is a separate, literal pill; it is intentionally left alone.
- **Discriminated `as` union is the public surface.** `as: 'a'` requires `href`; `as: 'button'` forbids `href` and takes an optional `type`; `as: 'div'` forbids both `href` and `onClick` (inert presence marker). Don't flatten the union into one `BaseProps` with all three — TS would stop catching consumer mistakes.
- **Docked fill.** When the chapter marker docks (`.chapter-nav.is-docked` — written by `useDockedMarker`) the chapter marker and the adjacent project marker both switch to `--mat-bg` with a `--mint-100` border so the pair reads as cut from the mat. Hover progresses to `--grey-880`, press to `--grey-800`. Flyout items are excluded (they live in the tray, not against the mat). Inks inherit from the base role rules — only the shell changes. On `/selected` the same treatment applies statically via `.chapter-nav--static` + `.selected-nav-row` selectors. On landing the Nihar + Works pair reuses this via `.landing-nav-row`.
- **Acknowledgment contract.**
  - `navigate` (default) — no visual click feedback; the route change is the feedback. Used by ExitMarker and NiharHomeLink.
  - `shake` — arrow shakes on click for same-page markers (Works marker on `/selected`). The hook `useShakeState` flips `data-shaking` for exactly 360ms to match the CSS keyframe. Keyframe origin is `center bottom` so the glyph pivots from its base.
  - `morph` — icon rotates 45° while `state === 'active'`. Used by the landing's Nihar toggle (`+` → `×`). Requires the consumer to pass `state="active"` when expanded; the component itself does not track this.
- **`wipHint` chip.** Optional string; when provided, clicking the marker runs its normal `onClick` (navigation, toggle, etc.) *and* reveals a Monostamp chip (olive / light) inline to the right of the label for 8s via `useWipHintState`. Re-clicking resets the timer. CSS animates `max-width` + `opacity` + `margin-left` on `.nav-marker__wip.is-shown` (`var(--dur-slide)` / `var(--ease-paper)`). The chip sits inside `.nav-marker__content`, so the marker's 32px right padding applies equally to the chip's trailing edge.
- **`state` is stateless by design.** Consumer owns `default` / `active`. `active` drives the morph acknowledgment when `acknowledgeOnClick === 'morph'`.
- **`tone` is orthogonal to `role` and `state`.** Any role can take any tone; states layer cleanly over any tone. New tones require a matching `.nav-marker--tone-<name>` block in `navmarker.css`.
- **Flyout items still emit raw `.nav-marker` classes** from `ChapterMarker`'s `motion.button` — they have not been migrated through the primitive because Framer Motion drives their layout animation directly. Keep an eye out: if flyout behavior diverges from docked-marker styling in a future change, either migrate them or document the split here.
- **Hover convention is dotted→1px-solid crossfade.** The site-wide `t-btn1` rule in `globals.css` runs the swap via two composed opacity transitions: `text-decoration-color` fades to transparent while a `::after` 1px bar (positioned at `bottom: -2px` to land on the same axis as the rest underline) fades in. Both ride `var(--dur-fast)` (currently 150ms post-v0.56 perf retune) on `var(--ease-snap)` so they crossfade in lockstep. Direct interpolation of `text-decoration-style` / `text-decoration-thickness` isn't reliable across browsers — the pseudo carries the solid state. **Shell-level delegation lives in `navmarker.css`:** `button.nav-marker:hover .t-btn1` (and `:focus-visible`, plus the `a.nav-marker` variants) trigger the same crossfade so the underline swaps when the cursor is anywhere on the marker, not only on the label text. `__exit-label` does NOT use `t-btn1`; it keeps its own bespoke transparent-dotted → currentColor fade in `nav.css`. If you ever change the t-btn1 hover technique, mirror the change in the shell delegation block above so the two rule sets stay in sync.
- **`iconRef` is forwarded to the icon span** so `useDockedMarker` can rotate the arrow toward the sheet center on every scroll frame. The icon is treated as an arrow when `role === 'chapter' | 'exit'` or `acknowledgeOnClick === 'shake'` — the `nav-arrow` class is added in those cases.
- **Mobile short labels** live on the consumer via `.nav-marker__title-full` / `.nav-marker__title-short` spans, not on the primitive's `label` prop. `label` accepts `ReactNode` so the consumer can pass both spans as children; see `ChapterMarker`'s `ChapterTitle` helper. This keeps the short-label mechanic where it already lives (nav.css `:has()` rule inside `@media (max-width: 767px)`).
- What's route-specific (owned by the consumer): icon glyph/element, label text, sublabel, onClick behavior, `wipHint` copy, `state` bookkeeping.
- What's library-ready: the full primitive. Promoted on first build — there were already four consumer routes the moment it existed.

---

## Img

The one image primitive the portfolio uses. Wraps `next/image` with an instant LQIP placeholder (dominant color or ThumbHash), a "materialize" reveal (blur→sharp focus pull, 700ms, `--ease-paper`), and graceful fallback for images not yet in the manifest.

**Where it lives**
- [app/components/Img/Img.tsx](app/components/Img/Img.tsx) — the component.
- [app/components/Img/img.css](app/components/Img/img.css) — placeholder, materialize keyframe, `--fill` and `--intrinsic` modifiers.
- [app/components/Img/manifest.generated.ts](app/components/Img/manifest.generated.ts) — **generated, do not hand-edit**. Regenerated by `npm run lqip` (also wired into `prebuild`).
- [scripts/generate-image-manifest.mjs](scripts/generate-image-manifest.mjs) — walks `public/` and extracts dominant color, ThumbHash, width, height for every raster via `sharp`.

**AI notes**
- **Always use `<Img>`, never raw `<img>` or `next/image` directly** for content imagery. The only raw `<img>` exceptions in the codebase are tiny decorative icons where LQIP is wasted (twitter avatar, deck-strip chip, rule-card icon). If you add a photo anywhere, import `Img`.
- **Three sizing modes.** Pick one:
  - Default — wrapper is `inline-block`, NextImage fills 100%/100%. Use when the consumer has explicit wrapper dimensions (the `/rr` card-stack pattern, the CardFan card images).
  - `fill` — wrapper is `display: block; width/height: 100%`, NextImage uses `fill` internally. Consumer parent must be `position: relative` and sized. Used by `MarkCarousel` and the API card-stack (where the black 4:3 monitor frame is the parent).
  - `intrinsic` — wrapper is `display: block`, NextImage scales to the wrapper's width and height follows natural aspect. Consumer drives width via CSS. Used by `BeforeAfter`, `StayingAnchored`. **Use only when you genuinely want the wrapper to shrink to the image** — letterboxing inside a fixed-aspect parent needs `fill` instead, otherwise the parent's background bleeds around the image.
- **Object-fit lives on `.img__inner`, not the wrapper.** The wrapper class (e.g. `.api__card-img`, `.rr-card-item__img`) sits on a `<span>`; `object-fit` there is a no-op. The base `.img__inner { object-fit: cover }` is the default — to letterbox instead of crop, write `.img.<consumer-class> .img__inner { object-fit: contain }`. The `.img.<class>` specificity (0,2,0) beats both the base rule and the `.img--intrinsic .img__inner { object-fit: unset }` reset. This was the v0.48 migration's number-one footgun — every consumer that used to set `object-fit` on its `<img>` needs the rule re-routed.
- **Placeholder variants.** `placeholder="hash"` uses the ThumbHash as an unblurred pixelated preview (crisp, not blurred — an aesthetic choice, picked for the `/biconomy` photo stack). `placeholder="color"` fills the wrapper with the image's dominant color. `placeholder="none"` disables. **Default is auto-resolved from the manifest's `hasAlpha`** — opaque assets get `'color'`, transparent ones get `'none'` so a flat dominant-color tile doesn't bleed through alpha regions of a PNG (the v0.48 black-bg-behind-hand-fan bug). Pass an explicit `placeholder` to override.
- **`.img--intrinsic .img__inner` is `position: relative`.** Static positioning would let the absolutely-positioned placeholder paint over the loaded image (it sits at `z-index: 0`; the inner is `z-index: 1`, but z-index needs a non-static position to apply). Don't change back to `static`.
- **Graceful fallback.** If an image isn't in the manifest, `Img` renders a raw `<img>` and in dev logs a console warning pointing at `npm run lqip`. So new images work immediately but without LQIP until the manifest is regenerated.
- **`prebuild` hook.** `package.json` runs `node scripts/generate-image-manifest.mjs` before every `next build` — production never ships a stale manifest. Contributors can also run `npm run lqip` manually during dev.
- **Scroll-linked-transform ancestor stall.** CSS animations on descendants of `useMatSettle` / other scroll-linked-transform ancestors freeze at `t=0`. The materialize keyframe is disabled inside `.rr-canvas` via a route-scoped override (see `app/(works)/rr/ANOMALIES.md` → "Img materialize animation stalls"). If a future route uses a scroll-linked transform ancestor, it will need the same override.
- **Cross-mount cache (`is-cached`).** A module-level `loadedSrcs` Set tracks every `src` that has fired `onLoad` in the current page session. When `Img` mounts, it consults that Set: if the src already loaded once, the component starts in `loaded: true` and adds the `is-cached` class, which the CSS uses to skip the materialize keyframe entirely (`.img.is-loaded.is-cached .img__inner { animation: none; opacity: 1 }`). Without this, every re-mount of the same image (e.g. /biconomy `BeforeAfter` swapping between `before.webp` ↔ `after.webp`, or `Flows` advancing through a 4-slide sequence with a hidden preload) replayed the 700ms blur-and-scale reveal on a frame already cached by the browser — read as a flash. The cache lives for the page's lifetime; navigating away and back resets it (intended).
- **Props forwarded to NextImage.** `sizes`, `priority`, `draggable`, `unoptimized`, `loading`, `prefetchMargin`. Anything else spread via `...rest`.
- **Prefetch ahead of viewport.** An `IntersectionObserver` on the wrapper flips `loading="lazy"` → `"eager"` when the image enters an extended `rootMargin` (default `'1500px'`) — the fetch begins ~1.5 screens before the section is scrolled into view, so artifacts are already painted when the user arrives. Opt out per-consumer with `prefetchMargin={false}` or `'0'`. Skipped automatically when `priority` or `loading="eager"` is already set.
- **Accepts a ref.** `Img` is a `forwardRef<HTMLSpanElement>` — the ref points at the wrapper `<span>`, not the inner `<img>`. Needed by scroll-linked consumers like `Multiverse`'s `posterRef` (feeds `useScroll({ target })`).
- **Manifest schema.** `{ [src]: { dominantColor: 'rgb(r,g,b)', thumbHash: base64, width, height, hasAlpha } }`. Keys are absolute paths (`/images/...`, `/marks/...`). Width and height are the natural raster dimensions — NextImage uses these unless the consumer overrides. `hasAlpha = !sharp.stats().isOpaque` — true if the asset has any transparent pixel; drives the placeholder default above.
- **What's route-specific** — consumer-owned className, sizing props, placeholder choice, onClick.
- **What's library-ready** — the whole component. Already lives under `app/components/` and is used by all four active routes.
- **Weight hygiene.** Every raster in `public/images/` is `.webp`. Raw assets over ~400 KB must be optimized via `npm run optimize-images` (writes a `.webp` sibling) before commit. Soft per-file budgets and the full hygiene contract live in `docs/performance.md` → "Images".

---

## Fonts

The five typefaces the portfolio uses, all self-hosted via `next/font/local`. Configured once in `app/layout.tsx`, exposed as CSS variables, consumed everywhere by token. Migrated off external Google Fonts in v0.56; mobile rendering and variation-axis support repaired in v0.58.

**Where it lives**
- [app/layout.tsx](app/layout.tsx) — the five `localFont(...)` blocks and the `<html>` className wiring. Each block sets `display: 'swap'` and an explicit `fallback` chain.
- [app/fonts/](app/fonts/) — the `.woff2` files. `Fraunces-{normal,italic}`, `GoogleSans-{normal,italic}`, `GoogleSansFlex-variable`, `GoogleSansCode-{normal,italic}`, `MaterialSymbolsRounded-normal`.
- [app/globals.css](app/globals.css) — the `--font-*` tokens are **commented but never redeclared**. next/font sets the variables themselves on `<html>`.

**The five tokens**
- `--font-display` (Fraunces) — display serif. Hero, section titles. Variable axes: `opsz`, `wght`, `SOFT`, `WONK`.
- `--font-body` (Google Sans) — primary body. Long-form copy.
- `--font-ui` (Google Sans Flex) — UI labels, controls, micro-copy. **Variable file** (`GoogleSansFlex-variable.woff2`, ~628 KB) with axes `wdth`, `wght`, `GRAD`, `ROND`, `opsz`. Drives `.t-h5` and `.t-btn1` `font-variation-settings`. The `slnt` axis was pinned to 0 during subsetting (italic comes from regular Google Sans).
- `--font-mono` (Google Sans Code) — code, technical labels.
- `--font-symbols` (Material Symbols Rounded) — icon ligatures. **Subsetted** to a fixed list of 13 icons (~1.1 MB instead of 5.1 MB). Adding a new icon requires re-subsetting — see `docs/performance.md` → "Material Symbols icons".

**AI notes**
- **`display: 'swap'` on every font, with explicit `fallback` chains.** Fallback renders immediately and swaps when the real face arrives — never a blank page on slow mobile. Do **not** change to `'block'`: the v0.56 attempt did exactly that and produced 3-second blanks plus Material-Symbols ligature words flashing in as fallback text on slow connections.
- **Bounded font gate (v0.59).** Top-level surfaces (`.landing`, `.workbench`, `.route-marks`) carry `opacity: 0` until `<html>` gains `.fonts-ready`. The gate script in `app/layout.tsx` releases the class either when `document.fonts.ready` resolves or when an **800 ms cap** fires — whichever first. The `.page-boot` startooth lives in `<body>` outside the gated surfaces and is visible during the hold; it fades out on release. Do **not** raise the cap past ~1000 ms. The cap is also the implicit filter on Material Symbols (1.18 MB) — typography fonts almost always finish well inside 800 ms and the page reveals in real fonts; MS finishes loading after release and ligature glyphs paint in.
- **Never redeclare `--font-*` in `globals.css :root`.** next/font sets each variable on `<html>` to a hashed family name (e.g. `'fraunces'`, `'fraunces Fallback'`) that scopes the generated `@font-face` rules. Redeclaring with literal names (`'Fraunces'`, `'Google Sans'`, …) detaches the cascade — the woff2 files are downloaded but never applied. On desktops with the family installed locally it appears to work; on mobile it falls back to system fonts. This was the v0.56 → v0.58 mobile-fonts regression.
- **`preload: true` only on landing-critical fonts** — Fraunces, Google Sans, Google Sans Flex. Code and Symbols are `preload: false` because the landing page doesn't render them. (Preload tags only appear in production builds, not dev.)
- **Five fonts, six files.** Italic/roman pairs for Fraunces, Google Sans, Google Sans Code. Single variable file for Google Sans Flex (covers all weights/widths from one file). Single file for Material Symbols (`weight: '100 700'`).
- **CSS variables, never font-family strings.** Anywhere you'd write `font-family: 'Fraunces'`, write `font-family: var(--font-display)`. The token layer is what lets future migrations be one-line changes.
- **Banned patterns.** `display: 'block'` on primary fonts. Redeclaring `--font-*` in `globals.css :root`. The 3-second JS font-gate. External `<link rel="stylesheet">` to `fonts.googleapis.com` for the five primary fonts. Adding the full Material Symbols woff2 (5+ MB). Full context in `docs/performance.md` → "Fonts".
- **Adding a new font.** Drop `.woff2` in `app/fonts/`. Add a `localFont(...)` block in `layout.tsx` with `display: 'swap'`, an explicit `fallback` chain, and `preload` based on landing usage. Add the className to `<html>`. Update this entry. Do **not** add a `--font-*` declaration in `globals.css :root` — next/font handles it.
- **Adding a new Material Symbols icon.** Update the icon list in `docs/performance.md`, re-run the subsetting curl flow documented there, replace `app/fonts/MaterialSymbolsRounded-normal.woff2`. Do **not** swap in the full font.

---

## Rail (rr-local-shared)

Stateless shell for the tuck-push-reveal drawer pattern in `/rr` — the primitive behind `NoteRail` and `RulesRail`. Renders a positioned `<div>` that composes `is-open` / `is-revealing` classes, applies an inline transform, and optionally wraps itself as a role="button". Consumer owns state, transform math, CSS class prefix, and tab/content JSX.

**Where it lives**
- [app/(works)/rr/components/Rail.tsx](app/(works)/rr/components/Rail.tsx) — the component.
- Consumers: [NoteRail.tsx](app/(works)/rr/components/NoteRail.tsx), [RulesRail.tsx](app/(works)/rr/components/RulesRail.tsx).
- CSS lives per-consumer in [rr.css](app/(works)/rr/rr.css) under `── Rules Rail ──` and `── Note Rail ──`. No shared `.rr-rail` base class — the shared layer is the React shell, not the CSS.

**AI notes**
- **Route-local-shared, not globally shared.** Two consumers, both in `/rr`. Per CLAUDE.md's promotion rule (count is measured across routes, not call sites), stays at `app/(works)/rr/components/` until a non-rr consumer needs it.
- **Stateless by design.** Consumer owns `isOpen`, sibling-open coordination, first-visit logic. This is what lets NoteRail and RulesRail have different state models (NoteRail is a pure toggle; RulesRail has a first-visit localStorage auto-open path + external dismiss signal) without the shell growing branches.
- **Transform values are not shared.** NoteRail and RulesRail have different open transforms (210px vs 163px) and different nudged transforms (-12px vs -50px) because they tuck under different edges of the game board. These are coordinate-system tunings, not tokens — keep them inline in each consumer.
- **Two interaction shapes via one prop.** Passing `onToggle` makes the whole rail a button (RulesRail pattern — vertical text, click anywhere). Omitting it leaves interactions to inner children (NoteRail pattern — icon tab button, click-content-to-close). Don't add a third shape; if the third consumer needs something different, the shell can grow a variant then.
- **The reveal-keyframe escape hatch.** NoteRail has a one-shot `rr-note-rail-reveal` CSS keyframe on mount. While the keyframe is running, it owns the transform — the consumer passes `transform={undefined}` during that phase. The shell forwards nothing (no inline style), so the animation is uncontested. Don't collapse the `transform ? { transform } : undefined` guard into `{ transform }`; passing `undefined` as a style value still applies, which fights the keyframe.
- **Promotion path.** Lift to `app/components/Rail/` the moment a non-rr consumer needs the same mechanism. At that point, consider: (a) promoting the `.rr-*-rail` CSS into a shared `.rail` base with variant modifiers; (b) making `className` optional / defaulting to `.rail`.
- What's route-specific: CSS class prefixes, transform values, tab + content JSX, first-visit state semantics.
- What's library-ready: the shell logic (class composition, open-change emission, dual-interaction-shape prop).

---

## Sheet

The paper chapter container used by every works route. Renders a `section.sheet.mat.section-reveal`, wires up a nav-sled with `ChapterMarker`, triggers the entrance reveal via `useReveal`, runs a scroll-linked "card placement" glide on the first `.surface` element inside, and (when opted in) glide-snaps to its top via `useDominanceSnap`.

**Where it lives**
- [app/components/Sheet.tsx](app/components/Sheet.tsx) — the component.
- [app/globals.css](app/globals.css) — `.sheet`, `.mat`, `.section-reveal` three-phase choreography, `.nav-sled` slot. Search for "── Sheet ──" and "── Section reveal ──".

**AI notes**
- **Section ID comes from `chapter.id`.** The sheet's own `id` attribute is used as a scroll target by `ChapterMarker` and by hash navigation. Don't rename without checking ChapterMarker consumers.
- **Random micro-rotation is set on mount, not re-rolled.** A `rotationRef` holds `±1.5°` for the scroll-linked card glide, and each non-nav-sled child gets its own `--place-rotate` CSS custom property (also `±1.5°`) via `querySelectorAll(':scope > :not(.nav-sled)')`. These are stable per mount — navigating away and back re-rolls them, which is intended (each visit settles differently).
- **Scroll-linked card placement is inline-styled, not CSS-classed.** The first `.surface` in the sheet receives per-frame `transform` and `boxShadow` writes from `useMotionValueEvent` on `scrollYProgress`. Endpoint shadow matches `--shadow-flat` exactly so the card reads flat at rest. Do not try to move this to CSS — values are lerped.
- **Three-phase reveal is choreography, not independent transitions.** Phase 1 (mat glide 0.8s), Phase 2 (content settle 0.7s + `--place-rotate`), Phase 3 (nav-sled dock 0.5s) are tuned as a set. Changing one phase's duration without the others breaks the cascade. The odd-valued durations (0.7, 0.9) are deliberate and sit outside the `--dur-*` tier vocabulary.
- **`useReveal` needs a ref on the element that should receive `.revealed`.** Sheet passes its own `sectionRef`. If children need their own one-shot reveals, they import `useReveal` separately.
- **`snap?: boolean` opts the sheet into dominance-snap.** Defaults `false`. When true, Sheet calls `useDominanceSnap(sectionRef, { topProximityPx: 80, idleMs: snapIdleMs, glideDurationMs: 800, dockOffsetPx: 2 })` so the chapter glide-docks on scroll-idle when its top edge is within 80px of the viewport top. /biconomy passes `snap` for all chapters; /rr passes it for everything except Mechanics (the pinned-scroll scene must run untouched). See each route's ANOMALIES → "Chapter dominance-snap" for the calibration rationale.
- **`snapIdleMs?: number` overrides the scroll-idle window.** Defaults `2000` so brief reading pauses do not trigger a snap. Both /biconomy and /rr pass `100` for the FIRST chapter only (`i === 0` in page.tsx) so the route lands docked from frame zero rather than two seconds in. Interior chapters keep the 2s default — a short idle there would yank readers during reading pauses. See each route's ANOMALIES → "First-chapter idleMs override".
- What's route-specific: the children. Everything else (the chapter-marker wiring, the reveal, the scroll-linked glide) is identical across routes.
- What's library-ready: the whole component.

---

## useReveal

One-shot scroll-triggered entrance hook. Adds `.revealed` to a target element the first time it enters the viewport, then disconnects.

**Where it lives**
- [app/components/useReveal.ts](app/components/useReveal.ts) — the hook.
- [app/globals.css](app/globals.css) — the `.section-reveal` → `.revealed` state transitions. Search for "── Section reveal ──".

**AI notes**
- **Coordinates with TransitionSlot.** If `.workbench` has `.transitioning` (page-level transition in flight), the hook uses a `MutationObserver` to wait for it to clear before setting up the IntersectionObserver. Without this, section reveals fight the page transition and stutter. Hard loads skip this branch (no `.transitioning` class ever gets set).
- **`once` is implicit.** The hook disconnects the observer after the first intersect and holds a `revealed` ref guard so strict-mode double-mounts don't re-arm it.
- **`rootMargin: '-60px'`** means the reveal fires slightly before the element reaches the viewport edge, so content is already visible when the transition starts. Don't change without eyes on the page.
- **Consumed by Sheet, but usable standalone.** Any element that uses the `.section-reveal` base class and wants one-shot entrance can use this hook directly.
- What's library-ready: the whole hook. The CSS side is a companion that lives in globals.css — extract together.

---

## Nav cluster (shared docked nav)

The docked-nav system used by every works route: chapter marker, project marker, exit marker, slot primitive, and the hook that drives docking state. Works as a single unit — components are designed to be imported together from the barrel.

**Where it lives**
- [app/components/nav/](app/components/nav/) — `ChapterMarker.tsx`, `ProjectMarker.tsx`, `ExitMarker.tsx`, `MarkerSlot.tsx`, `useDockedMarker.ts`, `types.ts`, `nav.css`, `index.ts`. Every marker in this cluster renders through the shared [`NavMarker`](#navmarker) primitive — see its entry for the shell / class contract.
- [app/components/nav/ANOMALIES.md](app/components/nav/ANOMALIES.md) — **load-bearing internals live here.** Docking math, viewport-frame coordination, and the reason each marker is structured the way it is.
- [app/globals.css](app/globals.css) — `--marker-top`, `--project-marker-right`, `--z-chapter-marker`, `--z-project-marker` tokens.

**AI notes**
- **Import from the barrel (`./nav`), not from individual files.** `index.ts` is the public API. Reaching past it couples consumers to the internal file layout.
- **Docked threshold is read live from the `--marker-top` CSS property** via `readMarkerTopFrom(nav)` in `useDockedMarker.ts` — not a constant. This lets routes override the token per breakpoint (`/rr` mobile uses 8px) without desyncing the JS dock check. Don't cache the read; don't switch the source element to `document.documentElement`. Full rationale in `nav/ANOMALIES.md`.
- **`MarkerSlot` publishes `--project-marker-right` through four triggers** — ResizeObserver (size), IntersectionObserver (visibility), matchMedia on 767 + 1023 (marker left-shift at breakpoint), MutationObserver on `.workbench` class/childList (route swap + `:has()`-scoped pad overrides). All four are load-bearing; removing any one reintroduces stale variable bugs. Rationale in `nav/ANOMALIES.md`.
- **`Chapter.shortTitle?`** is an optional mobile-only label. When set, `ChapterMarker` renders both `.nav-marker__title-full` and `.nav-marker__title-short` spans; `nav.css` swaps them via a `:has()` rule inside `@media (max-width: 767px)`. Don't collapse the two-span markup back to bare `{chapter.title}` — that deletes the mobile affordance silently.
- **Route layouts must import `./nav/nav.css`** to activate the system. Importing the components alone renders them unstyled.
- **Each route defines its own `Chapter[]`** in its `nav/chapters.ts`. The nav cluster itself is content-free.
- **Mobile pattern is in `CLAUDE.md`, not in nav.css alone.** The tucked-under-top-frame behavior is documented in CLAUDE.md's "Global mobile patterns" section and implemented through `.workbench::before` (frame) + `--marker-top` (0 on mobile). Nav.css only handles the marker side.
- **Route-level consequences of consuming this system** live in each route's `ANOMALIES.md` (e.g. `/rr` documents the sled-in-mat absolute positioning for mobile). Nav's own `ANOMALIES.md` is for internals.
- **`ProjectMarker` `infoCard` prop.** When passed a ReactNode, the marker swaps from scroll-to-top to a toggle that opens an absolutely-positioned `.marker-info-anchor` companion below the marker, fills the info icon (FILL axis 0→1 via `.is-info-open`), paints the marker in its hover shell (`--grey-960` floating, `--grey-880` on the docked pair) so the click reads as a switch "pressed" for as long as the card is visible, and applies `aria-expanded`. Dismissal: any scroll >4px, a second toggle click, or a 12s idle auto-close (safety net). Each route owns its own info card content (route-local under `app/(works)/<route>/components/MarkerInfoCard.tsx`) — currently `/biconomy` and `/rr`. Route cards are authored with absolute-positioned children on desktop; each route's CSS recomposes to a flow layout at `@media (max-width: 767px)` so the card fits inside a 375px viewport.
- What's route-specific: `Chapter[]` data, each route's `nav/chapters.ts` file, and (optionally) a route-local `MarkerInfoCard` passed to `ProjectMarker`.
- What's library-ready: the whole cluster. Extracting means pulling the CSS file, the four components, the hook, the types, AND the matching globals.css tokens together.

---

## SlideInOnNav

Signals directional entrance between landing (`/`) and `/selected` — the two routes that don't share a TransitionSlot because landing lives outside the `(works)` route group. Outgoing page sets a `sessionStorage` flag; incoming page mounts this component, which reads the flag and adds an entrance class.

**Where it lives**
- [app/components/SlideInOnNav.tsx](app/components/SlideInOnNav.tsx) — the component (returns `null`; pure effect).

**AI notes**
- **Uses `useLayoutEffect`, not `useEffect`** — the class must be on the element before the browser paints the first frame, or the default animation plays briefly before the swap.
- **No cleanup function.** Returning one would strip the class during React StrictMode's double-invoke, leaving the class off on the real mount. A module-level `consumed` guard handles the StrictMode edge case instead.
- **Flag is consumed once per session.** Hard loads or navigations from elsewhere see no flag, no class.

---

## PaperFilter

Off-screen SVG `<defs>` that exposes a `#paper-displace` displacement filter (fractal noise + displacement map). CSS references it via `filter: url(#paper-displace)` to add subtle paper-surface warping.

**Where it lives**
- [app/components/PaperFilter.tsx](app/components/PaperFilter.tsx) — the component (render once near the root; the `<defs>` becomes globally addressable by id).

**AI notes**
- **Render once per document.** Two copies would create two `#paper-displace` defs and the CSS reference would resolve to whichever renders first — harmless but wasteful. Route layouts typically render it near the top of the tree.
- The filter is aria-hidden and absolutely positioned at 0×0 — it contributes no layout, only the `<defs>`.

---

## Icons (hand-rolled SVGs)

Three inline SVG icon components with animatable internal paths. Used for hover choreography where an icon font would freeze the internals.

**Where it lives**
- [app/components/icons/IconArrowRight.tsx](app/components/icons/IconArrowRight.tsx)
- [app/components/icons/IconChevronRight.tsx](app/components/icons/IconChevronRight.tsx)
- [app/components/icons/IconExternalLink.tsx](app/components/icons/IconExternalLink.tsx)

**AI notes**
- **Why hand-rolled, not an icon font:** consumers animate internal paths on hover (e.g. the chevron shaft translates, the external-link arrow lifts). Icon fonts render as a single glyph and cannot be animated piecewise.
- **Stroke uses `currentColor`** so consumers style via `color`, not a prop.
- New icons should follow the same pattern: named path elements (e.g. `.icon-chevron-shaft`) that consumer CSS can target.

---

## ExpandToggle

The portfolio's expand/collapse glyph as an inline SVG. Hand-drawn-feel hooks pointing into opposite quadrants. Used by every expand/collapse pill in the site so the icon family is consistent across landing, /rr, and /biconomy.

**Where it lives**
- [app/components/ExpandToggle/ExpandToggle.tsx](app/components/ExpandToggle/ExpandToggle.tsx)
- Consumers: [app/page.tsx](app/page.tsx) (landing pill-btn, terra), [app/(works)/rr/components/Intro.tsx](app/(works)/rr/components/Intro.tsx) (rr-story-card pill, yellow). /biconomy's mobile pill renders the route-local `IconHighlighter` instead — the marker (empty ↔ filled) keeps the UX Audit chapter's highlighter motif consistent with the desktop slide-out toggle (see biconomy ANOMALIES → "Pill icon: hand-rolled marker").

**AI notes**
- **Promoted in v0.59.** Previously the SVG lived inline in `app/page.tsx` and the two case-study consumers used Material Symbols `expand_content`/`collapse_content` ligatures — three call sites, two visual families. Now one component, one shape.
- **Stateless.** Consumer owns `expanded: boolean`. The component swaps between the two SVGs accordingly.
- **`fill="currentColor"` on both paths.** The parent pill (`.pill-btn`, `.rr-story-card__expand`, `.intro-expand`) sets `color: var(--terra-800 | --yellow-720 | --blue-720)` and the SVG inherits. Do not pass colour as a prop.
- **Sizing comes from the consumer.** Each consumer's CSS provides a sizing class (e.g. `.pill-btn__icon { width: 20px; height: 20px }`, `.rr-story-card__expand-icon { 18×18 }`, `.intro-expand__icon { 18×18 }`). The component itself is unstyled.
- **Material Symbols `expand_content` / `collapse_content`** are no longer used anywhere in the portfolio. They can stay in the subset list (don't bother re-subsetting just to drop them) but new consumers should always use `<ExpandToggle>` instead.

---

## Page boot mark (startooth)

Centered SVG shown during the font-gate hold on hard refresh. Kept plain on purpose — a patience-manager, not a loader. Fades in ~200ms after mount (so fast loads never flash it), fades out when `html.fonts-ready` applies. Each route recolors the stroke + fill to match its own palette.

**Where it lives**
- [app/layout.tsx](app/layout.tsx) — inlined SVG (two paths: `.startooth__diamond` + `.startooth__base`) inside a `.page-boot` div, sibling of `{children}`.
- [app/globals.css](app/globals.css) — `.page-boot` / `.page-boot__mark` positioning + fade animations, startooth path defaults, and `:root:has(<route-root>)` per-route color overrides.

**AI notes**
- **Inlined, not `<img src=".svg">`.** Inline gives CSS access to `stroke` / `fill` on individual paths — which is the whole point of the per-route recolor. Don't "simplify" back to an `<img>` tag.
- **Colors come from `--startooth-stroke` + `--startooth-fill`.** Defaults in `globals.css` (`#31abcc` / `#d9d9d9`) cover the brief first-paint window before any route CSS applies. Actual per-route values live in the `:root:has(.route-biconomy)` / `:root:has(.route-rr)` / `:root:has(.selected-workbench)` / `:root:has(.landing)` / `:root:has(.route-marks)` blocks in `globals.css`. The `/marks` block uses `stroke: #fff` + `fill: var(--grey-960)` and is the only route block that *also* sets `html { background: #000 }` — flipping the default light paper to black so the first paint on the dark route doesn't flash white behind the boot mark. If a future dark route needs the same treatment, model it on the marks block.
- **Route detection is via `:has()`, not a `<html>` class.** `app/layout.tsx` is a server component with no pathname awareness; `:has()` keeps the whole thing CSS-only. Any new route wanting its own startooth colors needs a matching `:root:has(...)` block.
- **`html { background: #f2f3ef }`** (default workbench-bg) is load-bearing alongside the boot mark. It's what kills the *white* flash so the boot mark has paper to sit on. If you ever change it, pick a tone that harmonizes with every route's workbench-bg — the browser paints the html bg before any route CSS applies, and a mismatch here reads as a swap.
- **No breathing/pulse animation.** We tried; it felt like a loader. Kept static on purpose.
- **Source SVG** preserved at `reference/startooths/startooth-2.svg` and copied to `public/boot/startooth.svg` (kept in case we ever revert to `<img>` or add animated variants).

---

## Small utils

Pure functions shared across routes. No UI, no state.

**Where they live**
- [app/lib/greeting.ts](app/lib/greeting.ts) — time-of-day greeting string ("Good morning", etc.). Consumed on landing.
- [app/lib/titleCase.ts](app/lib/titleCase.ts) — APA title case. Used anywhere UI copy is authored in sentence case but rendered as a title. `.t-h5` assumes inputs are already APA-cased via this function.
---

## useExpand

Expand/collapse primitive for in-place overlays that live inside their parent's flow (no `<dialog>`, no top layer). Owns five pieces that together give a non-modal overlay the *feel* of a modal without paying platform-modal costs: Escape dismiss, click-outside dismiss, `inert` on siblings, focus save/restore, and the `is-overlay-open` body class (which `useDominanceSnap` reads to pause section-snap while the user is inspecting). Adds an `isClosing` state that batches with `setExpanded(false)` in the same React update so consumers can run an exit animation before unmount without a render gap.

**Where it lives**
- [app/lib/useExpand.ts](app/lib/useExpand.ts) — `useExpand<T>()` returns `{ expanded, isClosing, expand, collapse, toggle, ref, markClosingDone }`.
- Consumers: `/rr` Intro (`.rr-enlarged` sketches strip) and `/rr` Outcome (`.rr-rules-group` rules panel).

**AI notes**
- **Why not `<dialog>.showModal()`.** Both consumers want the overlay clipped to its mat (so the page keeps scrolling), scrolling with the canvas, and the route header reachable. `showModal()` promotes to the top layer with a viewport-fixed containing block — fundamentally fights all three. The "modal feel" here comes from receding surroundings (existing `:has()` mat dim + `inert` on siblings), not from the platform's modal pseudo-classes.
- **`inert` on siblings is the semantic half of the mat dim.** When expanded, the hook walks the parent and sets `inert` on every non-self child, recording what it toggled so collapse only restores those. Pairs with `:has([data-enlarged])` / `:has([data-rules-expanded])` — visual receding + interaction blocking come from the same idea, applied in two layers.
- **Click-outside is rAF-deferred.** Without the deferral, the `pointerdown` that triggered expand would still be propagating when the listener attaches and would immediately re-collapse. Capture phase + rAF is the canonical fix; don't remove the rAF.
- **Focus save/restore mirrors `showModal()`'s native behaviour.** The activeElement at expand-time is captured, the first focusable inside the overlay auto-focuses one frame later (so React has committed the children), and on collapse focus returns to the trigger — but only if it's still inside the overlay (otherwise the user moved focus deliberately and we shouldn't fight them).
- **`is-overlay-open` body class pauses section-snap.** Set on expand, cleared on collapse-end. `useDominanceSnap.maybeSnap()` early-returns when present, so a reader inspecting an overlay isn't yanked to the next chapter on idle. Cross-file coupling — log it in `rr/ANOMALIES.md` if you change either side.
- **`isClosing` + `markClosingDone` decouple unmount from collapse.** When the user dismisses, the hook flips `expanded → false` AND `isClosing → true` in the same React batch (via a setExpanded updater). Consumers gate their JSX mount on `expanded || isClosing` so an exit animation has time to play; when the animation lands they call `markClosingDone()` to flip `isClosing` back off and let React unmount. Without this, FM's `style` motion values would override the close `animate` target and the overlay would snap to rest instead of springing out.
- **Consumer owns motion.** The hook only owns state + dismiss + a11y + snap-pause wiring. Intro uses CSS animations with per-image L→R cascade (open and close); Outcome uses imperative `animate(motionValue, target, spring)` calls gated by `isClosing` so scroll-sync doesn't fight the close spring.
- What's library-ready: the whole hook.

---

## scrollGlide

rAF-tween of `window.scrollY` under `--ease-paper`. The native `scrollTo({ behavior: 'smooth' })` curve doesn't match the route easing — this util is the shared path for any programmatic scroll that needs to feel like every other transition in the route.

**Where it lives**
- [app/lib/scrollGlide.ts](app/lib/scrollGlide.ts) — `scrollGlide(targetY, durationMs?)` returns a cancel fn; `isGlideActive()` is a peek for callers that need to yield while a glide is in flight.
- Consumers: every `/marks` programmatic scroll (Essay preview jump, MarksTitle home, MarkSection paginator) and `useDominanceSnap` itself.

**AI notes**
- **Singleton.** A new call cancels any glide in flight. Two callers cannot run simultaneous glides — the second wins.
- **Default duration is `--dur-glide` (0.8s).** Callers that want the section-reveal feel pass `--dur-settle` (0.5s) explicitly — `useDominanceSnap` does this.
- **`isGlideActive()` is the hand-off for continuous-motion systems** (`/marks` autoScroll yields while a glide is writing scrollY, otherwise the additive dy corrupts the easing).
- Cubic-bezier evaluated as direct `y(t)` for performance — visually indistinguishable from a proper de Casteljau solve at 60fps.
- No SSR guard needed at call sites; the util short-circuits when `window` is undefined.

---

## useDominanceSnap

Scroll-idle landing snap for full-viewport sections. On 150ms scroll-idle, if the section's visibility ratio is ≥ 0.72 and its top isn't already docked (within 2px), glide to its top via `scrollGlide(--dur-settle)`. Below 0.72 nothing is dominant — the scroll is in-transit and no snap fires. Replaces CSS `scroll-snap-type` for routes that need paper-easing parity.

**Where it lives**
- [app/components/hooks/useDominanceSnap.ts](app/components/hooks/useDominanceSnap.ts) — `useDominanceSnap(ref, { onScroll?, onDocked? })`.
- Consumers: `/marks` MarkSection, BlankSection, HeroClone. Adopted by `/biconomy` Sheet and `/rr` Sheet (selected chapters) — see each route's ANOMALIES.

**AI notes**
- **Stateless.** Hook owns no state visible to consumers; the callbacks are the only escape hatch.
- **`onScroll(el, rect, vh)`** runs on every scroll frame *before* the idle-debounce arms — consume this for scroll-linked CSS custom properties instead of spinning a second listener.
- **`onDocked()`** fires once each time the section's top crosses into the 2px docked tolerance from outside. Useful for "I just landed" triggers (HeroClone uses it for reel-wrap).
- **Honors `prefers-reduced-motion`** — snap is disabled, but `onScroll` and `onDocked` still fire. Consumers should not assume snap is the only path to docked.
- **Tall sections need `topProximityPx`, `idleMs`, `glideDurationMs`, and often `dockOffsetPx`.** The dominance check uses `min(rect.height, vh)` as denominator, so a chapter much taller than the viewport stays "dominant" for ~one viewport's worth of mid-section scroll — without a proximity gate, that yanks the reader back to the chapter top mid-read. Sheet (biconomy/rr) currently sets `topProximityPx: 80`, `idleMs: 2000`, `glideDurationMs: 800` (= `--dur-glide`), and `dockOffsetPx: 2` (corrects a 2px visual gap between ChapterMarker and ProjectMarker after dock). Marks consumers leave all four undefined to keep the original 150ms / 500ms / no-proximity behavior.
- **Tokens, not magic.** Glide duration reads from `--dur-settle` at call time; ratio (0.72) and idle (150ms) are constants in the file — change them there, not at call sites.
- **Conflicts to watch.** Programmatic scrolls from elsewhere (TransitionSlot, anchor jumps) can land mid-section. The 150ms idle means the snap will glide-correct them; if that's unwanted, exclude that section or guard the consumer.
- **Pauses while an overlay is open.** `maybeSnap()` early-returns when `document.body` carries the `is-overlay-open` class — set/cleared by `useExpand`. Reader inspecting an enlarged scan or rules card on /rr won't get yanked to the next chapter on idle. Cross-file coupling; both sides logged in `rr/ANOMALIES.md`.

---

## Tab-switch motion tokens

The default feel for any tabbed section where a title/subtitle morphs and a body panel crossfades between tab states. Captures the six constants (title enter/visible/exit + transition, body variants + transition) that /rr Cards and /biconomy Demos both use.

**Where it lives**
- [app/lib/motion.ts](app/lib/motion.ts) — the six exports (`TAB_TITLE_ENTER`, `TAB_TITLE_VISIBLE`, `TAB_TITLE_EXIT`, `TAB_TITLE_TRANSITION`, `TAB_BODY_VARIANTS`, `TAB_BODY_TRANSITION`) and the shared `TAB_EASE` tuple.
- Consumers: [app/(works)/rr/components/Cards.tsx](app/(works)/rr/components/Cards.tsx), [app/(works)/biconomy/components/Demos.tsx](app/(works)/biconomy/components/Demos.tsx).

**AI notes**
- **Ease is `[0.45, 0, 0.15, 1]`, not `--ease-paper`.** This is deliberate — paper glide is for section reveals; tab switches need to feel responsive to input, not cinematic. Do not unify the two curves.
- **Both title and body wrap in `AnimatePresence mode="wait"`.** Old content fully exits before new content enters. Do not use `popLayout` here — it produces cross-fades that make the wipe feel uncertain.
- **Title wipe is clip-path from the top** (`inset(0 0 100% 0)` → `inset(0 0 0% 0)`) plus a small -6px y nudge. Duration 0.12s.
- **Body is scale 0.985 → 1 + opacity.** Duration 0.15s. The scale is small on purpose; larger values read as zoom, not settle.
- **Skip first-mount animation via a `hasSwitched` ref.** Flip it to `true` inside the tab handler; pass `initial={hasSwitched.current ? TAB_TITLE_ENTER : false}` on the title. Without this, the page-load reveal replays the wipe, which reads as a glitch.
- **Body uses `initial={false}` on the `<AnimatePresence>` wrapper** instead of a ref — the motion.div's `initial="enter"` still applies on subsequent tab switches because the key changes.
- Route-specific bits stay in the consumer: tab state, the title text source (ScrambleText in rr, plain text in biconomy), and any scroll-linked entrance applied on the outer header/body wrappers.
- **CSS mirror exists: `--ease-snap`** in `globals.css` carries the same `cubic-bezier(0.45, 0, 0.15, 1)` curve for use in CSS transitions (micro UI reactions that aren't paper settles). Keep the two in sync: if one changes, change the other. Do NOT try to unify `TAB_EASE` / `--ease-snap` with `--ease-paper` — the two tiers exist on purpose.
- The full motion object constants stay in JS because Framer Motion consumes the variants/transitions directly. Only the raw easing curve crosses the CSS/JS boundary.

---

## Cruise spring — "train start"

An underdamped spring tuned for a perceptible kick when a motion value restarts from rest toward a cruise target — the feel of a reel (or a train) beginning to move, not a motor ramping up.

**Where it lives**
- [app/lib/motion.ts](app/lib/motion.ts) — `CRUISE_SPRING` export (`type: 'spring'`, stiffness 110, damping 14, mass 1).
- Consumers: [app/(works)/rr/components/Outcome.tsx](app/(works)/rr/components/Outcome.tsx) (the last ticker in the Outcome section, hover-out + scroll-end resume); [app/marks/lib/autoScroll.ts](app/marks/lib/autoScroll.ts) (credits-reel resume after hold / pause / glide).

**AI notes**
- **Target envelope: ~10–15% overshoot.** Deliberate deviation from CLAUDE.md's paper-motion `bounce: 0` rule. Do not normalize to critically damped. The overshoot is the "train start" — without it, the resume reads mechanical.
- **Drive via `animate(motionValue, target, CRUISE_SPRING)`** from Framer Motion; each frame reads `.get()` on the motion value. Not meant as a `transition` prop on `motion.div`s — it's for driving a value you consume inside an animation frame, not a layout property.
- **Both consumers share the same tune.** If you retune, keep the overshoot envelope; both rr Outcome's ticker and /marks autoScroll rely on the same feel. Log the retune in this entry and both consumers' `ANOMALIES.md`.
- **Not a replacement for `--ease-paper` or `--ease-snap`.** This is for motion-value-driven springs that restart from rest. Section reveals still use `--ease-paper`; tab switches still use `--ease-snap`.

---

## Train Marquee

A continuously scrolling horizontal marquee. Decelerates to a stop on hover, spring-starts on hover-out, and lets the user manually scroll to the true end of the track without exposing empty space past the last copy.

**Where it lives**
- [app/(works)/rr/components/Outcome.tsx](app/(works)/rr/components/Outcome.tsx) — motion state, event handlers, JSX (search for `Ticker motion state`)
- [app/(works)/rr/rr.css](app/(works)/rr/rr.css) — `.rr-outcome-ticker` and `.rr-outcome-ticker__track` rules (near "Bottom-edge ticker")

**AI notes**
- Three identical segments are required in the DOM. The wrap is seamless only because copy 2 lands exactly where copy 1 started; the third copy is what gives manual scroll room to reach a true "end" without content running out.
- Motion is JS-driven — a Framer Motion `motionValue` (`trackX`) advanced inside `useAnimationFrame`. Cruise velocity is `-segmentWidth / 18` px/s. The first segment's width is measured on mount via `ResizeObserver` and stored in a ref.
- Four modes tracked in refs (not React state, to avoid re-renders inside the animation loop): `running`, `stopped`, `transitioning`, `scrolling`.
- The manual-scroll transfer is the critical fix. On first user scroll event, the current `trackX` is moved into `scrollLeft` (`container.scrollLeft += -trackX`), `trackX` is zeroed, and mode flips to `scrolling`. On 650ms idle, `scrollLeft` is folded back into `trackX` via `-(scrollLeft mod segW)`, `scrollLeft` is reset to 0, and the cruise spring-start fires. Without this, the CSS translate and container scrollLeft compound and expose dead space past the last copy at max scroll.
- Spring-start: `stiffness 110, damping 14, mass 1` — roughly 12% overshoot before settling. This is an intentional deviation from the repo's default `bounce: 0` motion rule in CLAUDE.md. Do not normalize.
- Hover brake: tween, `duration 0.9s, ease [0.5, 0, 0.2, 1]` (paper ease).
- `overscroll-behavior-x: contain` on the container is load-bearing — it gives the native rubber-band at scroll extremes on Mac/iOS without chaining to the page.
- `programmaticScrollRef` guards programmatic `scrollLeft` writes from being re-interpreted as fresh user scrolls; reset in the next `requestAnimationFrame`.
- What's route-specific (parameterize on extraction): text content, the masked icon, colors, fonts, the 18s cruise duration, and the per-segment visual styling.
- What's library-ready: the state machine, the translate↔scrollLeft transfer math, the spring/brake timing constants, the `overscroll-behavior-x: contain` choice.

---

## Monostamp

A small monospace stamp — hairline-bordered pill or vertical stamp housing one or two monospace characters. Two variants (`default` horizontal pill, `tall` fixed-height vertical), two appearances (`light` for paper surfaces, `dark` for screenshots and dark artefacts), four tones (`neutral`, `mint`, `olive`, `yellow`), and an `active` prop that brightens the border + ink into the tone's "selected" palette.

**Where it lives**
- [app/components/Monostamp.tsx](app/components/Monostamp.tsx) — component, types (`MonostampTone`, `MonostampVariant`, `MonostampAppearance`, `MonostampProps`), known-consumer list in header comment.
- [app/globals.css](app/globals.css) — `.monostamp` base rule, `.monostamp--tall` override, per-tone light rules, per-tone dark-appearance rules, per-tone dark `is-active` overrides. Search for "── Monostamp ──".

**AI notes**
- Stateless. The consumer drives `active` — the component does not listen for hover or focus itself. This is deliberate so reciprocal-hover patterns (where a stamp brightens because something *else* was hovered) work by just passing `active={isHovered}`.
- **No color/border/background transitions on `.monostamp`.** An earlier version transitioned these; consumer re-renders (scroll springs, motion values, hover toggles) restart the transition every paint, stack running CSS Animation objects, and the `is-active` palette never actually applies. The palette swap is intentionally instant. Do not reintroduce a transition here — it will silently break active/rest on every dark consumer. Documented in the component header comment and in globals.css above the Monostamp block.
- Tones correspond 1:1 to the `--tone-{560,720,800,960}` token family in globals.css. To add a new tone, add all four tokens AND the matching light + dark + dark.is-active CSS rules — the naming is load-bearing (the classes are composed via template string `monostamp--${tone}`).
- The light-appearance is the base rule (paper-cream `--grey-960` fill, `--grey-880` hairline); the `monostamp--light` class exists on the element but has no explicit rules — it's reserved for future light-appearance tone-specific shell changes. The `.monostamp--dark.monostamp--<tone>` selector uses double class specificity to guarantee override of the base.
- Live consumer: /biconomy Flows note pointers (`tone="olive" variant="tall" appearance="dark"`). Queued consumer: /selected archive "opens in new tab" hint.
- Consumes `--font-mono` (Google Sans Code), loaded site-wide from `app/layout.tsx`.
- What's route-specific (none today, by design): nothing — Monostamp is already parameterized for reuse.
- What's library-ready: the full API surface. Extractable as-is once the globals.css token family is ported alongside, or rewritten with caller-supplied color tokens.

---

## CaptionTag

Museum-label caption docked to the viewport bottom. Collapsed state shows only a plus-icon + "Title, Year" row resting ~6px above the viewport edge; clicking anywhere on the card calls the whole sheet up — the card slides up and docks flush against the viewport bottom, revealing a divider + description below the title. The plus icon rotates 45° to become a cross when open. Hover nudges the closed tag up another 4px. Width shrink-wraps to the title row so the card sits flush with its own label. Background matches page bg so the tag reads as a docked label, not a surface.

**Where it lives**
- [app/components/CaptionTag/CaptionTag.tsx](app/components/CaptionTag/CaptionTag.tsx) — component + `CaptionTagProps` type. Known-consumer list in header comment.
- [app/components/CaptionTag/caption-tag.css](app/components/CaptionTag/caption-tag.css) — all visuals + transform math. Scoped with `.caption-tag` and `data-open` / `data-visible` / `data-ready` attributes.
- [app/components/CaptionTag/index.ts](app/components/CaptionTag/index.ts) — default export.

**AI notes**
- **Visibility is consumer-driven.** The `visible` prop is the only signal for "does this belong to the current reading moment." When false, the tag slides fully below the viewport edge via `translateY(var(--tuck-hidden))` (set to measured `cardHeight` in px — see the `@property` note below), opacity 0, `pointer-events: none`, `tabIndex: -1`. The landing uses this to hide the tag while expanded — the collapsed browsing state owns the label; the expanded task-doing state doesn't.
- **Two-pass layout measurement.** The card's height depends on its width, and the width is only set inline AFTER the first render (once we've measured the title-row's natural width). Pass 1 (`useLayoutEffect`) reads the title-row width and writes it to `handleWidth` state — this triggers a re-render that applies `width: calc(handleWidth + var(--space-16))` inline to the root. Pass 2 (`useLayoutEffect`, keyed on `handleWidth`) measures root height AFTER width has settled, so the description has reflowed to the correct column. Writes `cardHeight` and `--tuck = cardHeight - titleBottom - CLOSED_PEEK`. A single-pass measure would read cardHeight at the wrong width (description on one long line) and tuck too short.
- **The handle is observed with `ResizeObserver`, not just measured once.** Web fonts load AFTER mount and grow the title row by a few px when they swap in. Without the observer, the card locks to the fallback-font width and the real-font title leaks past the right edge. Observing `handleRef.current` catches the swap and re-runs pass 1 automatically.
- **`--tuck` and `--tuck-hidden` are registered as typed `<length>` custom properties via `@property`.** The transform transitions between `translateY(var(--tuck-hidden))` (hidden, cardHeight px) and `translateY(var(--tuck))` (closed, tuck px). A percentage-based hidden state like `translateY(100%)` cannot interpolate to a px-based visible state — the browser pins the transition at `currentTime=0` (element stuck at the start). Both endpoints MUST be registered lengths in px for the interpolation to resolve. Do not revert to `100%`.
- **Transitions are gated on `data-ready="true"`, and the ready flip is deferred via double `requestAnimationFrame`.** The component flips `ready` after the first paint of the measurement-driven render. Without the gate, the intro hidden→visible state change fires a transition before the element paints at its target and pins at `currentTime=0`. Single-rAF isn't enough — React can auto-batch the ready flip with the measurement state updates, so `data-ready="true"` lands in the same render as `data-visible="true"`, arming the transition on the very state change we want to skip. Double-rAF lets the visible transform paint first, then arms the transition one frame later. Subsequent changes (hover, open, consumer `visible` toggling) animate normally.
- **Hover lift is suppressed briefly after a toggle-close with the mouse still over.** Without suppression, the `:hover` rule keeps the card raised 4px so the close-transition never lands at its resting Y. `hoveredRef` (ref, not state) tracks whether the pointer is currently over the card. When `performToggle` runs and the card is going from open → closed AND `hoveredRef.current` is true, `hoverSuppressed` state flips to `true`, which toggles `data-hover-suppressed` on the root. The CSS hover rule is scoped to `[data-hover-suppressed="false"]` so suppression switches it off. Cleared on `onMouseLeave`. Ref-based hovered tracking avoids setting suppression from keyboard-close (no pointer over → stays `false`).
- **State rules each declare their own full transform.** Hidden, closed-resting, open, hover — each `[data-visible][data-open]` permutation writes its own `translateX(-50%) translateY(...)` string. Do not indirect through a `--caption-ty` variable — the interpolation safety comes from the `@property` registrations, not from sharing a variable.
- **Open state docks flush, no lift.** Open transform is `translateY(0)` — the card sits flush against the viewport bottom. Do not re-introduce a lift; the caption is a label, not a floating dialog.
- **All motion via `transform`.** The only transitioned properties are `transform` and `opacity`. Animating `bottom` or `height` would be janky and affect layout. Keep it this way.
- **Click-outside and Escape both close.** Click-outside uses `mousedown` on `document`, registered with a `setTimeout(0)` defer so the same click that opened doesn't immediately close. Do not move to `click` — pointer-down semantics are what "dismiss" expects.
- **The whole card is the toggle target.** The root `<div>` carries `role="button"`, `tabIndex` + keyboard handlers, and the click handler — not a nested `<button>`. Clicking anywhere on the card (title row, description text, padding) toggles open. `user-select: none` on the root so the card never accidentally enters text-selection mode during a tap. If/when the card gains a use case that needs selectable description text, split the click zone to a dedicated handle again.
- **Open/close toggling is gated on `description`.** If no description is passed, the root has no `role`, `tabIndex=-1`, no click or key handlers, no plus icon — the tag becomes a static stamp. A tag without a drawer has nothing to reveal.
- **Plus icon is internal, not a prop.** A small inline SVG (two rounded rects forming a plus) renders in the title slot when `hasDrawer`. It uses `currentColor` so it matches the title color and opacity. On open, CSS rotates it 45° to become a cross. Don't add an external icon-prop back — the icon IS the toggle affordance and must be consistent across consumers.
- **Asymmetric padding and a 3px title right-inset balance the composition.** Card padding is `4px 8px 10px` (top / left-right / bottom) — more weight on the bottom so the closed peek reads as a solid resting base. The plus icon's visible glyph sits ~3px inside its 18px bounding box, so the visual left gap from card edge to the X is 8px + 3px. The title carries `padding-right: 3px` so the text ends at the matching inset on the right.
- **Divider between title and description.** The description has `border-top: 1px solid color-mix(in srgb, currentColor 24%, transparent)` and `padding-top: calc(var(--space-4) + var(--space-2))`. The root flex `gap` is also `calc(var(--space-4) + var(--space-2))`, giving 2px extra breathing on each side of the divider line. Low-alpha currentColor keeps the divider tonal rather than drawn.
- **Title row carries 80% opacity** per Figma — it's the quiet identifier. The description renders at full opacity when open. Both share color `#c96f42` (no matching terra token today; literal kept deliberately).
- **Motion uses the snap tier, not paper.** The caption is a micro-interaction (quick toggle, not a settling reveal), so transitions use `--ease-snap` + `--dur-slide` (transform) and `--dur-fast` (opacity / icon rotation). Paper-ease on a 500ms settle felt heavy for this affordance. Do not revert to `--ease-paper` / `--dur-settle` without re-confirming the feel.
- Consumes `--surface-bg` (background — matches page), `--space-2 / -4 / -8 / -16`, `--dur-slide / -fast`, `--ease-snap` from globals.css. Font classes `.t-h5` (title) and `.t-p4` (description).
- Live consumer: `/` landing — Startooth Pattern caption, hides while landing is expanded.
- What's route-specific (none today, by design): nothing — the component is parameterized via props only.
- What's library-ready: the full API. Migrating `/marks`' `mark-chrome__year` stamp to a non-interactive `CaptionTag` (no `description`) is a natural second consumer but not done yet.

---

## Sticker

Shared shell for the portfolio's "fun play" elements — the paper-roll and RR diamond on /selected, the web3-abstractor on biconomy/Demos, the zhao.eth card on biconomy/API, the notes USB on biconomy/StayingAnchored, and the BiconomyChip dice in biconomy/Multiverse. Family contract: every sticker reads as printed and pressed onto the page (drop-shadow follows the alpha mask), and every sticker lifts on hover. Tilt is per-instance via the `tilt` prop. Some consumers are static images, some are interactive (`as="button" | "a"`); future stickers join by wrapping their content in this shell — no inner-art changes needed.

**Where it lives**
- [app/components/Sticker.tsx](app/components/Sticker.tsx) — component + `StickerProps` (as / tilt / jitter / clickRotate / className / aria-*). `'use client'` because `jitter`, `clickRotate`, and the press-down `:active` interaction need DOM event handlers.
- [app/globals.css](app/globals.css) — `.sticker` rules + the `--sticker-shadow-rest / -lift / -press / lift-y / tilt / jitter / dur` tokens. Tune the family from this one block.

**AI notes**
- **Family treatment via tokens.** `--sticker-shadow-rest` and `--sticker-shadow-lift` are now **dedicated two-layer drop-shadows** (tight contact line + small ambient halo, warm-tinted), not aliases of `--filter-shadow-resting/-raised`. Stickers live on a different physical layer than cards — they're nearly flush with the substrate. Tweaking these re-skins every sticker; don't author per-consumer shadows. `--sticker-shadow-press` is the snap-tight press-down value used on `:active` for interactive consumers.
- **drop-shadow, not box-shadow.** `filter: drop-shadow(...)` follows the inner art's alpha mask so PNGs/WebPs with custom silhouettes (and inline SVGs with non-rectangular paths) cast a shadow on their actual outline rather than a rectangle. Reverting to `box-shadow` makes paper-roll and the RR diamond look like cards.
- **Lift is small (`-2px`).** Real stickers don't levitate. Don't crank this back up to "card lift" values; the contact-line shadow is doing most of the work.
- **Interactive consumers can opt out of the lift.** BiconomyChip applies `.sticker` for the shadow but sets `--sticker-lift-y: 0px` inline so the chip's press-scale stays the headline interaction. Pattern: keep the shadow, suppress the translate, let the consumer's own click/press effect own the motion.
- **Tilt is per-instance, not random.** The `tilt` prop sets `--sticker-tilt` inline. Stable per consumer so siblings on the same page don't drift between renders. Don't randomize the resting pose — it's part of the composition.
- **`clickRotate` is per-click, persists between clicks (default true).** On every click, the sticker re-rolls a random ±2° offset into `--sticker-jitter` and *keeps* it (no leave-reset). Each click nudges the rotation again. Sells the sticker as something you pushed and shifted. Opt out (`clickRotate={false}`) when the click is navigation (rotating the instant before route-change is wasted motion — /selected ProjectCard is the reference) or when the consumer owns its own click choreography (BiconomyChip, which doesn't go through `<Sticker>` anyway).
- **`jitter` and `clickRotate` share the same `--sticker-jitter` channel.** Don't enable both on the same sticker — `jitter` clears on pointer leave, which would wipe a click rotation if both were active. Today only /selected uses parent-driven jitter (and opts out of clickRotate); the biconomy stickers use clickRotate only. If a future sticker needs both flavors, give it a second var (e.g., `--sticker-click`) and compose three terms in the transform calc.
- **`jitter` is per-hover, composes on top of `tilt`.** When `jitter` is true, the sticker re-rolls a random ±2° offset on each pointer enter and writes it to `--sticker-jitter` inline. `.sticker`'s transform is `rotate(calc(--sticker-tilt + --sticker-jitter))`, so resting pose is preserved and the jitter is a hover-only flourish that feels alive without breaking placement.
- **Parent-driven jitter.** When the hover trigger lives on a parent surface (e.g. /selected ProjectCard, where the whole card is the hover target), don't use the `jitter` prop — the parent handles its own pointerenter/leave and sets `--sticker-jitter` on itself. CSS-var inheritance carries it down to the sticker. /selected ProjectCard is the reference.
- **Every sticker feels clickable.** `.sticker` ships `cursor: pointer` and `:active` press-down for *all* consumers — decorative spans included — so the family reads as something you could pick up and play with. Real handlers are wired per consumer as we add interactivity. When a consumer becomes truly interactive, switch its `as` to `button` or `a` and the existing semantics carry through.
- **Press-down on `:active`.** `.sticker:active` collapses the lift to 0 and snaps the shadow to `--sticker-shadow-press`, using the snap motion tier (`--dur-instant` + `--ease-snap`). Mimics finger-pressing the sticker back into contact. Fires on any element being mouse-pressed (browsers honor `:active` on spans), so even decorative consumers get the press feedback.
- **`pointer-events: none` on a parent will kill the hover.** `/selected` previously had `.project-card__illus { pointer-events: none }` to keep the parent `<Link>`'s click clean — that was removed when stickers landed there because it disabled the hover lift on the sticker itself. Click events still bubble through to the Link, so removing the rule was safe.
- Consumers (today): `/biconomy` Demos web3-abstractor, API zhao.eth card, StayingAnchored notes USB, Multiverse BiconomyChip; `/selected` ProjectCard illustrations (paper-roll, RR diamond).
- What's route-specific: per-consumer positioning classes (e.g. `.api__trailing-sticker`, `.project-card__illus--paperroll`) layer on top of `.sticker` for placement only.
- What's library-ready: the entire API.

---

## LabelSticker

Text-based sticker variant. Composes `<Sticker>` for the family contract (drop-shadow, hover lift, `:active` press, `tilt`, `clickRotate`, `jitter`) and adds a typeset label as the inner art. Adding a new label sticker is a `shape` + `tone` + `children` call — no new SVG, no new raster. The shape vocabulary references the bookish library-sticker family (FRANCINE plaque, DUE DATE ticket, etc.).

**Where it lives**
- [app/components/LabelSticker/LabelSticker.tsx](app/components/LabelSticker/LabelSticker.tsx) — component + `LabelStickerProps` (`children` / `shape` / `tone` / forwarded `StickerProps`). `'use client'` only because `<Sticker>` is.
- [app/components/LabelSticker/label-sticker.css](app/components/LabelSticker/label-sticker.css) — shape blocks (`pill`, `plaque`, `ticket`) and tone blocks (`cream`, `orange`, `green`).

**AI notes**
- **Composition over duplication.** LabelSticker wraps `<Sticker>` rather than re-implementing it. The wrapper element is the `.sticker` (with all its shadow/lift/press semantics); the `.label-sticker__face` inside is just the visible silhouette + label. Don't add shadow/lift CSS to `.label-sticker__face` — the family contract already provides it.
- **Drop-shadow alignment.** The wrapper sets `display: inline-block` and `line-height: 0` so the `filter: drop-shadow(...)` on `.sticker` follows the rounded silhouette of the inner face, not the line-box around it. Removing either will detach the shadow from the shape.
- **Shapes are silhouettes.** `pill` is a true capsule — `border-radius: 999px` so the ends always render as half-circles regardless of font-size. `plaque` is a rounded rectangle with visible corners (FRANCINE / READERS reference). `ticket` is a rounded rectangle with an outer outline + an inset dashed perforation drawn via `::before` (DUE DATE reference). The dashed line is *inside* the fill — the wrapper's drop-shadow follows the outer rounded rectangle, not the dashes. Adding a shape (e.g. `seal`, `banner`) is a new block in `label-sticker.css` keyed off a face modifier — flag promotion before growing the vocabulary further.
- **Tones are two-tone presets.** Each tone resolves to `--label-fill` + `--label-ink` via portfolio palette tokens (`--terra-80`, `--terra-320`, `--mint-960`). No freeform hex inside the component. Adding a tone = a new `.label-sticker__face--tone-X` block. Don't expose a `fill` / `ink` prop — that breaks the "stays on system" contract.
- **Type voice.** The face carries the shared `.t-h5` typography token — that's where `font-family: var(--font-ui)`, `font-variation-settings: 'wdth' 120, 'wght' 640, 'GRAD' 64, 'opsz' 18`, `letter-spacing`, and `line-height` come from. Don't re-declare those in `label-sticker.css`. Strings are passed in **title case** (`Engineers`, `Due Date`) — there is no `text-transform` on the face, so what you pass is what renders. If `.t-h5` ever evolves, every label sticker follows automatically.
- **Sizing is em-based.** `padding`, `border`, `border-radius`, and the inset perforation are all in `em`s, so changing `font-size` on the face scales the whole sticker proportionally. Consumers control size by setting `font-size` on `.label-sticker__face` via a route-local class.
- **Routes own placement.** LabelSticker does not own position, scale, or layout. Consumers add a route-local class (passed as `className`) for placement, the same way `/biconomy` consumes `<Sticker>` with `.api__trailing-sticker`.
- Consumers (today): none yet — primitive lives ahead of its first consumer page (a planned `/marks`-sibling route).
- What's library-ready: the entire API.

---

## CrossShellVeil

Bridge between routes that don't share a layout boundary (currently `/marks` ↔ `/selected`; future cross-shell routes will use this too). TransitionSlot can't cross those boundaries — its DOM-snapshot trick relies on staying mounted. CrossShellVeil instead fades a single black `<div>` up on the outgoing side, holds it opaque through `router.push`, and the incoming side fades it down. The veil lives on `document.body` so it survives the layout swap. One DOM node, two halves, one beat.

**Where it lives**
- [app/components/CrossShellVeil/useCrossShellNav.ts](app/components/CrossShellVeil/useCrossShellNav.ts) — outgoing hook. Returns an `onClick` handler for the link.
- [app/components/CrossShellVeil/CrossShellEntryFader.tsx](app/components/CrossShellVeil/CrossShellEntryFader.tsx) — incoming half. Mount in the destination's layout; finds the in-flight veil and fades it out on first paint.
- [app/components/CrossShellVeil/cross-shell-veil.css](app/components/CrossShellVeil/cross-shell-veil.css) — styles + phase tokens. Loaded from `app/layout.tsx` so both shells have the rules immediately.
- [app/components/CrossShellVeil/index.ts](app/components/CrossShellVeil/index.ts) — barrel.

**AI notes**
- **Both halves are required.** Outgoing without incoming = the veil never clears. Incoming without outgoing = the fader is a harmless no-op (it only acts if a veil is actually present), so dropping `<CrossShellEntryFader />` into a layout speculatively is safe.
- **Veil ID is the contract.** The hook appends `id="cross-shell-veil"` and the fader queries by the same id. Don't rename without updating both.
- **Timings mirror the marks-outro-veil**: 900 ms in / 700 ms out. Symmetry with `/marks`'s internal Kilti→Hero teleport veil. If you tune one, tune the other (and the existing tokens `--marks-veil-in` / `--marks-veil-out`).
- **Modifier-clicks bypass.** `useCrossShellNav` lets cmd/ctrl/shift/alt clicks fall through to the anchor's normal behavior so "open in new tab" still works.
- **Don't stack veils.** Rapid double-click is guarded — the hook returns early if a veil already exists.
- **Don't combine with TransitionSlot.** A route uses TransitionSlot (in-shell, snapshot-clone slide) OR CrossShellVeil (cross-shell, opacity bridge). Wiring both creates competing animations on the same navigation.
- **Consumers today**:
  - Outgoing from `/selected` to `/marks`: `app/(works)/selected/components/Timeline.tsx` (the "Marks and Symbols Made" nameplate).
  - Outgoing from `/marks` to `/selected`: `app/marks/components/MarksExitMarker.tsx`.
  - Incoming on `/marks`: `app/marks/layout.tsx`.
  - Incoming on `(works)`: `app/(works)/layout.tsx` (covers all three works routes).
- See `CLAUDE.md` → "Cross-shell navigation" for the rule.

---

## Footer

Site colophon — rendered in two variants depending on consumer.

- **Where it lives:** [app/components/Footer/](app/components/Footer/) — `Footer.tsx`, `footer.css`, `index.ts`.
- **Consumers:** mounted once in [app/(works)/layout.tsx](app/(works)/layout.tsx) (default variant covers `/selected`, `/rr`, `/biconomy`); also mounted on the landing in [app/page.tsx](app/page.tsx) when `expanded` is true (caption variant).
- **Variants:**
  - `default` — black `.footer-stage` slab below the workbench (rendered OUTSIDE `<main className="workbench">` so the workbench's bottom padding doesn't sit between the divider and viewport bottom). Hairline divider flush with workbench bottom edge, single row beneath: credit (left, `t-h5`) + framed link cells (right, `t-btn1`). Each `<li>` carries a vertical hairline border; the first item also gets a left border so the row reads as fully enclosed cells.
  - `caption` — fixed-positioned dark terra slab (`var(--surface-bg)` bg, `#c96f42` text — mirrors CaptionTag's literal exactly so the two artifacts share voice). Slides up from below via the `translate` CSS property (Y: `100% → 0`) when `visible` prop flips true; slides back down on scroll-up. No opacity transition — only Y position changes.
- **Per-route hover palette (default):** `usePathname()` selects two hues at the **800** luminance step:
  - `/selected` → blue + terra
  - `/rr` → yellow + terra
  - `/biconomy` → blue + olive
  Cell hover rolls a fresh pick via `onMouseEnter`, but **never the same color twice in a row** — a shared `lastColorRef` filters the previous hue. With 2-color palettes this collapses to strict alternation.
- **Click state (default):** `:active` switches to the matching **960** hue (deeper, "pressed in") and translates the cell `translateY(1px)`. Same paper-tag press as `NavMarker:active`. Transition tier: `--dur-instant` + `--ease-snap`.
- **Hover underline:** the link's text is wrapped in an inner `<span class="footer__link-label t-btn1">` — `t-btn1`'s `::after` solid bar positions at `bottom: -2px` of its containing block. Without the inner span, the bar lands at the bottom of the 60-px padded cell (visually disconnected from the text). The cell's `:hover` forwards to the span via descendant selectors.
- **Dynamic Privacy back-link:** Footer's `onClick` writes the source pathname to `sessionStorage.privacy-from`. The privacy page's `PrivacyBackLink` component reads that flag in a `useLayoutEffect` and renders a NavMarker labelled / toned to match the source (`/selected → "Works" terra`, `/biconomy → "Biconomy" mint`, `/rr → "Rug Rumble" terra`, `/ → "Back" neutral`).
- **Caption visibility on landing:** controlled by `pastForm` state, which a scroll listener flips true when the document is parked at the bottom (`scrollHeight − scrollY − innerHeight ≤ 64`). The threshold is small on purpose — any honest upward scroll gesture clears the slab immediately rather than lingering until the form leaves the viewport. Resets on collapse so a re-expand starts hidden.
- **Mobile composition (default, ≤640px):** the row recomposes from a single line into a centered column — top hairline, centered credit, mid-divider hairline, centered link cluster. The mid-divider is a second `.footer__divider--mid` element, hidden on desktop. Cells are 44 px tall (Apple HIG min tap target), horizontal padding tuned so all four pipe-bracketed cells fit at 375 px without clipping.
- **Touch tap-light parity:** taps on mobile never fire `onMouseEnter`, so the link `<a>` also carries `onTouchStart` that rolls the same `--hover-color` / `--active-color` from `ROUTE_PALETTES`. Without this, the press state falls back to the gray rgba and the cell lights up dim instead of in the route's hue. Don't drop one handler without the other.

**AI notes:**
- Don't extract Footer to a route layer or duplicate it. Single shared primitive, two variants via `variant` prop.
- The caption variant's `translate: -50% 100%` ↔ `-50% 0%` is intentional — the dedicated `translate` property is used (not `transform`), because Chrome's matrix conversion on fixed-position transforms with mixed `%` units stuck the transition at the start value.
- The 800-step hover palette is keyed on the route via `usePathname()`. New work routes (e.g. /case-x) need an entry in `ROUTE_PALETTES`; absent that, the fallback palette (blue + terra) applies. The 960 click-state map (`ACTIVE_FOR_HOVER`) is keyed off the 800 var-string, so don't change one without the other.
- Mobile breakpoint is `max-width: 640px` (not 767px) — the row recomposes earlier than the route mobile threshold because the credit + four cells start crowding before chapter content does.

---

## RR GameBoard (cross-route consumer)

The Rug Rumble playable game module — [app/(works)/rr/components/game/](app/(works)/rr/components/game/) — has two consumers as of v0.69:

- `/rr` Mechanics chapter (primary, with rails + scroll choreography around it).
- `/` 404 page ([app/not-found.tsx](app/not-found.tsx)) — bare GameBoard, editorial copy, home link.

**Not physically promoted to `app/components/`.** The game.css uses `--rr-game-*`, `--rr-z-game`, and `--rr-font-game` tokens that resolve under the `.route-rr` cascade in [app/(works)/rr/rr.css](app/(works)/rr/rr.css). A clean extraction would mean either copying those tokens into a shared file or sourcing rr.css globally — both add cost without changing the API. Both consumers wrap GameBoard in a `route-rr` ancestor and import `rr.css` + `game.css` directly. If a third consumer appears, revisit promotion at that point.

**Component contract:**
- `GameBoard` is the entry point. Optional callbacks: `onResultsChange`, `onGameOver`, `onGameStart`. No props are required for a standalone playable mount.
- The board is `'use client'` — animations, input, and game state are all local.
- `not-found.tsx` is the reference cross-route consumer. Copy its scoping pattern if a fourth surface ever needs the game.

---

<!-- New entries above this line, most recent first. Keep entries tight — link to the source, don't copy it. -->

---

## Promotion candidates

Pieces not yet shared but expected to be needed in a second route. Per CLAUDE.md's promotion rule, the move happens at the second consumer — these entries exist so the move is fast when the moment comes.

### Paginator (dot-row with active-pill morph)

- **Current home:** [app/marks/components/MarkChrome.tsx](app/marks/components/MarkChrome.tsx) — the `.mark-chrome__paginator` `ol` plus its `.mark-chrome__dot` / `.mark-chrome__dot--active` rules in [app/marks/marks.css](app/marks/marks.css).
- **Shape when promoted:** stateless. Props `count`, `activeIndex`, optional `onSelect(index)`. Active-dot fill is a CSS animation attached to `.mark-chrome__dot--active::before` — no JS restart or `key=` remount trick. The animation plays from the start whenever the `--active` modifier class lands on a dot. If a future consumer re-uses a single `<li>` across indices instead of re-rendering the list, they'll need `key={activeIndex}` to force the restart — flag at promotion time. Tone via `--tone-*` tokens, not hex. No route-specific class names inside.
- **Why not yet:** single consumer today (MarkChrome).
- **Likely next consumer:** case-study chapter pager, `/names` category slider, or any future carousel.
- **Pre-promotion hygiene:** keep route-local but authored with tokens + stateless API so the eventual move is a lift, not a rewrite. This is the `maybe` tag from CLAUDE.md's refining-component loop.

### Gradient + banding recipe

Not a component — a recipe. When a future route needs a large flat gradient that animates between palettes:

1. Declare each stop as `@property <color>` with `inherits: false` and a sensible initial-value (see `--marks-bg-stop-a/b` in [app/marks/marks.css](app/marks/marks.css)). Browser interpolates between palettes automatically — no JS tween loop.
2. Transition those custom properties under `--ease-paper` (0.9s is the calibrated value on /marks).
3. If banding shows, layer a tile-noise `::after`: balanced **black/white threshold** noise (via `<feComponentTransfer>` with `feFuncR/G/B type='discrete' tableValues='0 1'`), `opacity: 0.12–0.18`, `mix-blend-mode: normal`. Greyscale noise can't dither under normal blend — it only darkens uniformly. The threshold step is load-bearing. Pattern inspired by js-noisy-gradient (apankrat).
4. Keep the noise tile ~160–220px with `background-repeat: repeat`; the tile edge is invisible at these sizes and seeds.

Live instance: [app/marks/marks.css](app/marks/marks.css) — `.marks-background` + `.marks-background::after`.
