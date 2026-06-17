# /selected — Route Notes

## Overview (v0.94+)

The `/selected` page is a single vertical flow:
- **AboutCard** — centered intro at the top, in-flow, with an inset hairline frame inside the mint border. Big breath below (`--space-80`).
- **Prelude** — copy block (left) + Timeline tile (right) side-by-side. The Nihar/Works nav chips are absolute-positioned children of the Timeline column so they sit half-on-top of the mat's top edge.
- **HintRow** — keycap glyphs explaining the click/esc model. Sits between the Prelude and the masonry with `margin-top: var(--space-64)`.
- **Showcase grid** — CSS Grid masonry of the 10 tiles below. Timeline is **not** part of this grid; the masonry is its own surface.

---

## Showcase grid

Route-local under [app/(works)/selected/components/Showcase/](app/(works)/selected/components/Showcase). `Showcase.tsx` owns `activeId` + per-piece `toggles`. Tiles render via `ShowcasePiece.tsx`; media-per-kind via `PieceMedia.tsx` (a thin switch that delegates to per-renderer files under `media/`); the focused note via `SpecNote.tsx`. Timeline tile wrapper is `TimelineTile.tsx`. Data lives in `data.ts`. Page composition is `Prelude.tsx` → `HintRow.tsx` → `Showcase.tsx`, all rendered by `SelectedContent.tsx`.

### Layout idiom — 9-col CSS Grid with JS-measured row spans
- `.sc-grid` is a single CSS Grid: `grid-template-columns: repeat(9, minmax(0, 1fr))`, `grid-auto-rows: 8 px` (`--sc-row`), `grid-auto-flow: dense`, `gap: 36 px` (`--sc-gap`).
- Each slot's `--sc-rowspan` is written by `Showcase.tsx` after measuring the slot's first child: `span = ceil((h + gap) / (row + gap))`. The slot itself is constrained by the last-written span, so the measurement reads `slot.firstElementChild` — measuring the slot directly is a chicken-and-egg trap.
- The measurement pass is rAF-debounced. Re-triggers: ResizeObserver on each slot AND on the grid container itself, window resize, `activeId` change (the `.is-active` translateY + scale changes rendered height), and `<img>` load events (LQIP → real bytes can change perceived height for unframed/cropped media).
- Constants `ROW_HEIGHT_PX = 8`, `GAP_PX = 36`, `MOBILE_GAP_PX = 24` in `Showcase.tsx` mirror the CSS tokens; if you change `--sc-row` or `--sc-gap`, change them here too.
- **Per-piece column span** is `cols: 1..9` on the `Piece` type (`data.ts`). Default is 3 (one-third). Two canonical values:
  - **3** → one-third (default; most pieces)
  - **6** → two-thirds (hero — currently `paymaster` and `ecochain`)
  - 9 is full-width (rare). Off-canonical values (4, 5, 7, 8) work but leave more orphan whitespace.
- **Showcase.tsx writes two CSS custom properties** per slot via `slotStyle`:
  - `--sc-cols-d` = raw `cols` value (desktop, 9-col grid).
  - `--sc-cols-t` = `max(1, ceil(cols / 3))` (tablet, 3-col grid). The formula preserves proportions — a desktop "third" stays a tablet "third", a "two-thirds hero" stays a "two-thirds hero".
  - `.sc-slot { grid-column: span var(--sc-cols-d, 3) }` on desktop; the tablet @media block swaps to `--sc-cols-t`; mobile drops everything to `span 1`. No modifier classes — span is data-driven via inline style.
- **Responsive collapse**:
  - Tablet (768–1023, min-height 501): grid drops to **3 columns**. Each slot uses its `--sc-cols-t` value, preserving the thirds rhythm proportionally (`3 → 1`, `6 → 2`, `9 → 3`).
  - Mobile (≤767 or ≤500h): grid drops to 1 column. Every slot spans 1 regardless of `cols`. `--sc-gap` reduces to 24 px (mirror constant `MOBILE_GAP_PX = 24`).
- `grid-auto-flow: dense` packs short tiles into gaps that wider tiles would otherwise leave. Visual order can deviate from DOM order; reading-order DOM in `PIECES` is by `num` (1 → 10).
- **Trade-off with 9-col**: no clean two-up (`4 + 5 = 9` is asymmetric; `4.5` isn't an integer). If you ever want two equal pieces side-by-side filling a row, this grid can't do it. The trade is editorial-thirds composition in exchange for losing halves.

### Prelude
- `.sc-prelude` is a 2-column grid: `1fr 608px`. Copy LEFT, Timeline RIGHT. On tablet/mobile it collapses to 1 column.
- Timeline lives inside `.sc-prelude__timeline`, which is `position: relative` so the `.selected-nav-row` (`position: absolute; top: -22px; left: 24px`) can dock on top of the Timeline mat's top edge.
- The Timeline mat (`.selected-mat`) has its width neutralized inside the Prelude via the contextual selector `.sc-prelude__timeline .sc-timeline-tile`. The `sc-timeline-tile` is a dedicated class added alongside `selected-mat` (see §"Timeline tile coupling" below).

### Timeline tile coupling — IMPORTANT
- The Timeline lives inside `TimelineTile.tsx` and renders `<section class="selected-mat mat sc-timeline-tile">`. `selected-mat` keeps the original mint-bordered styling and dimensions; `sc-timeline-tile` is the showcase-context hook for overrides like `width: 100%`.
- The Timeline owns its own archive open/close state locally (was previously owned by `SelectedContent`). Archive open grows the mat to 1201 px tall; the Prelude row grows; the masonry below pushes down. No row-span re-measure is required because the masonry is a separate surface.
- **Do not** rename `.selected-mat` without auditing both `selected.css` and `showcase.css` — multiple media-query overrides reference it.

### Click + focus interaction
- Click any tile (or its caption dot) → tile gets `.is-active`, lifts via `translateY(-12px) scale(1.025)`, siblings dim to `opacity 0.30 / saturate 0.6`. On desktop / tablet, `SpecNote` renders inline beside the frame on the side decided at activation by `ShowcasePiece` (column-position measurement → `left` or `right`). On mobile, `SpecNote` is rendered once by `ShowcaseBottomSheet` as a singleton portal at `document.body` (see §"Index card placement rule" below).
- **Active tile click triggers the tile's primary affordance**: switch tiles (Paymaster, Ecochain, Interface) flip the switch; video tiles (Furrmark, Ecochain) play/pause; everything else is no-op. Close happens via the dot's `×` glyph, Esc, or the backdrop.
- Dimmed siblings get `position: relative; z-index: 30` so they sit above the backdrop (z 20) and stay clickable — clicking one switches focus to that piece.
- **Focus trap**: while a tile is open, Tab cycles inside its caption dot + switch + note link instead of escaping to the next tile. Esc still closes.
- **No magnifying cursors** — default `pointer` on the body, `default` on the active tile. The cardstack tile's media has its own click handler (expand fan) that `stopPropagation`s so it doesn't open the spec note; the caption row click bubbles up and opens the note as normal.

### Spec note (`.sc-note`)
- **Desktop animation.** Two horizontal toss keyframes only (`sc-note-toss-left` / `sc-note-toss-right`) — the desktop placement is always one of those two sides. Each variant translates by `--sc-toss-d` (28 px default) and settles with a per-mount random rotation `--sc-note-rotate` between −2° and +2°. Duration `--dur-slide` (0.3 s, snappier than the previous 0.5 s settle), easing `--ease-snap`. Square corners, 1 px dot-tinted border (see colour cascade), lifted shadow that matches the active tile's lift.
- **Layout structure.** Title alone in `.sc-note__head` (close button anchored top-right, sheet-only); lead paragraph `.sc-note__whatis` directly under the title (no mono tag label — the old `.sc-note__line` / `.sc-note__tag` two-column grid was retired); rule; `.sc-note__notice` row with the notice copy left (an `<h5>` carrying H5 typography: Google Sans Flex ExtraBold wght 640, 12 px, capitalize) + decorative `.sc-note__notice-eye` glyph right (24×24, grey, not dot-tinted — quiet "look at this" beat, not a brand accent); rule; `.sc-note__foot` with the `…from {project} ↗` link on the LEFT and a `.sc-note__foot-end` stack on the RIGHT. The stack holds the `01` serial (`.sc-note__no`, in flow) **and** the "opens in new tab" hint pill (`.sc-note__hint`, absolutely positioned over the serial) — see "Foot hover swap" below. Sheet variant uses the **same JSX** — only the dock/border/animation skin differ.
- **Spacing (Figma 1:1).** Card padding `24 px / 16 px` (`py / px`); card width `min(322 px, 92 vw)` = 290 px Figma content column + 16 px × 2 horizontal padding. Vertical rhythm: title → whatIs **12 px**, whatIs → rule₁ **48 px**, rule₁ → notice **24 px**, notice → rule₂ **24 px**, rule₂ → foot **24 px**. Notice row text → eye gap **44 px**. Rule = 1 px `--grey-880`, margin 0 (rhythm carried by siblings).
- **Per-piece colour cascade — two-tier (560 + 720).** Two parallel tone maps in `data.ts`:
  - `DOT_VAR` (560 step) — consumed by the tile's caption dot, Switch tint, and DotPager tint via `ShowcasePiece.tsx`. The closed tile reads soft.
  - `DOT_VAR_DEEP` (720 step) — consumed by SpecNote only, set as `--sc-dotc` inline on `.sc-note`. **Four** accents read this var: the foot serial (`.sc-note__no`), the foot link (label + chevron + hint pill), and the card's own `border` (`border: 1px solid var(--sc-dotc, …)`). The mobile sheet's viewport-edge `border-top` also reads `--sc-dotc` so the dock seam matches.
  - Palette is **4 tones only**: `blue` / `terra` / `orange` / `mint`. Olive, yellow, and grey were dropped (v0.93) — the four-tone family reads more in-system. `DOT_PALETTE` in `Showcase.tsx` and both `DOT_VAR` maps are pinned to these four; the `ShowcaseDot` type union enforces it.
- **Foot link** (`.sc-note__link`): `…from {project} ↗` with `IconExternalLink` (size 14) carrying the archive's `className="icon-ext"` so the arrow group slides diagonally on hover (`translate: 2px -2px`, `--dur-slide / --ease-paper`) — same recipe as `.ap-entry .icon-ext .icon-ext-arrow`. `target="_blank" rel="noopener noreferrer"`. **Persistent 2 px dotted underline** on `.sc-note__link-label` at rest; on hover/focus-visible the dotted color fades to transparent while a `::after` 1 px solid bar fades in — same crossfade pattern as `.t-btn1` in `globals.css` (text-decoration-style isn't smoothly interpolable, so the pseudo carries the solid state). On `:active` the whole link translates down 1 px. Pieces without `href` (currently only **subway** and **startooth** — subway's project IS this site, startooth's project is the author's sketchbook) render `.sc-note__credit` as plain text instead of a link, and the hint pill is omitted.
- **Foot hover swap.** `.sc-note__foot-end` is a `position: relative` inline-flex stack containing the serial (in flow) and the hint pill (`position: absolute; right: 0; top: 50%`). At rest the serial reads at full opacity; the pill is `opacity: 0; translate: 4px -50%` (slid 4 px to the right). On link hover or focus, both swap: serial fades to 0, pill fades to 1 and lands at `translate: 0 -50%`. The toggle uses `.sc-note__foot:has(.sc-note__link:hover) .sc-note__no { opacity: 0 }` (and the matching `:focus-visible` and `.sc-note__hint` rules) — `:has()` reaches up from the link so the entire swap lives at one stable selector, no JS state, no prop drilling. The pill is omitted in JSX when `piece.href` is undefined, so there's nothing to swap to on credit-only pieces.

### Index card (spec note) placement rule — IMPORTANT
The `.sc-note` no longer reads `piece.noteSide` for its side at runtime. Two distinct rendering paths split by viewport, **owned by different components**:

1. **Mobile** (`max-width: 767px` OR `max-height: 500px`, single source `responsive.ts` → `MOBILE_BP`):
   - The note is rendered by **`ShowcaseBottomSheet`**, a *singleton* mounted once by `Showcase.tsx` when `activeId && isMobile`. Each tile does NOT render its own SpecNote on mobile.
   - The sheet portals through `createPortal` into `document.body`, so `position: fixed` resolves against the viewport — not against any transformed ancestor in the tile tree (the random tile rotation creates a containing block that would otherwise trap a fixed-position child).
   - SpecNote renders with `variant="sheet"` → `.sc-note--sheet` CSS skin: `inset: auto 0 0 0`, `width: 100vw`, no border-radius, edge-to-edge, slides up via `sc-sheet-rise`.
   - The sheet owns its own **body scroll-lock** for its lifetime (sets `document.body.style.overflow = 'hidden'`, restores previous value on unmount). ShowcasePiece does NOT lock scroll.
   - On activation, ShowcasePiece (still per-tile) scrolls itself so its top sits 24 px below the viewport top — that's the only mobile-activation work it does. One `requestAnimationFrame` deferral lets layout settle before measuring.
   - Showcase tracks `isMobile` as reactive state via `matchMedia.addEventListener('change')`, so rotation / orientation / devtools resize mounts and unmounts the sheet correctly.

2. **Desktop / tablet** — note rendered inline by **`ShowcasePiece`**. Side measured at activation:
   - Center in the **left third** of `.sc-grid` → `activeSide = 'right'` (note opens to the right of the tile).
   - Center in the **middle or right third** → `activeSide = 'left'` (note opens to the left).
   - The note renders **INSIDE** the `.sc-frame` wrapper around `.sc-media`. Anchored at `top: 4 px`, `left/right: calc(100% + 12 px)`, `transform-origin` set to the open-toward corner. Anchoring to `.sc-frame` (not `.sc-piece`) keeps the note pinned to the media frame's geometry — never offset by the `.sc-cap` row below.
   - Toss keyframes `sc-note-toss-left` / `sc-note-toss-right` bring the card in from the open direction with a per-mount random ±2° settle.

3. **Column placement is dynamic** because `.sc-grid` is a 9-column CSS Grid with `grid-auto-flow: dense` — a tile's visual column depends on its `cols` integer + the dense packer fitting it next to neighbours, not on its DOM index. The measurement uses `getBoundingClientRect()` against the closest `.sc-grid` ancestor, run inside a `useLayoutEffect` keyed on `active`.

If you change which container owns which path, update both `ShowcaseBottomSheet.tsx` and `ShowcasePiece.tsx` together; don't split the responsibility across files.

### Per-piece controls slot (`ExtraControlsContext`)
ShowcasePiece's `.sc-controls` bar composes pause + switch + a per-piece **extras slot** (`.sc-controls__extras`). Per-piece renderers that need their own inline control (currently: `PaymasterAuditController` → page chip) consume `ExtraControlsContext` and `createPortal` their control into the slot. The tile shell does NOT know which pieces have extras. State for those extras (e.g. paymaster's `flowIndex`) lives in the per-piece controller, never on the generic shell. The slot collapses (`:empty { display: none }`) when no consumer is portaling, so the inline-flex row stays tight on tiles that have no extras.

### Random per-mount values — three independent rolls
Three patterns roll fresh values on every page load. Each is documented here so future sessions don't mistake them for bugs:

1. **`--sc-tile-rotate` — per-tile rotation, −1° to +1°.** Set in `ShowcasePiece.tsx` via a `useEffect` that writes the CSS custom property on the `.sc-piece` element on mount. Hover and active states override the rotation back to `0deg` so the tile straightens under cursor; the resting state shows the random angle. SSR-safe because the effect runs only client-side (the SSR paint is `rotate(0deg)` from the var default).
2. **Per-page-load dot shuffle.** `Showcase.tsx` `dotMap` state, populated once via `useEffect` from the **4-tone palette** (`['blue', 'terra', 'orange', 'mint']` — see §Spec note → "Per-piece colour cascade — two-tier (560 + 720)" for the canonical list; olive / yellow / grey were dropped v0.93). The shuffle pads the palette to `PIECES.length` (10 entries) so every colour appears at least once, then Fisher-Yates shuffles. The mapped piece flows through `piecesWithDots`, and `DOT_VAR[piece.dot]` cascades to every consumer of `--sc-dotc` (caption dot, switch tint, page chip, index card serial number + link + hint pill). First client paint uses authored dots; the effect's `setDotMap` swaps to the rolled distribution on the next render — a sub-100 ms colour flash on cold load. **Do not move this to `useMemo(initial state)` — that would run on the server and break hydration.**
3. **PosterStack deck shuffle.** `media/PosterStack.tsx` keeps `POSTERS` (3 entries, authored order) as the SSR baseline + first-paint state, then Fisher-Yates shuffles into local state in `useEffect`. First paint shows the authored order's index-0 poster on top; the post-effect render shows the rolled deck's index-0 poster on top. The deck is otherwise stable for the session — `advance()` cycles the rolled order on click.

All three patterns deliberately accept a SSR → client value swap; none of them depend on the SSR value visually because the swap completes within one frame of hydration.

**`--sc-note-rotate` is a fourth random roll**, documented in §"Spec note" above. It uses `useMemo`, not `useEffect` — `Math.random()` runs during render. This is hydration-safe **only because** `SpecNote` is rendered conditionally on `active`, which is `false` on every tile during SSR. If a future change starts rendering `SpecNote` unconditionally (e.g. for animation pre-warming), the `useMemo` will need to move to `useEffect` to avoid a hydration mismatch on the rotation value.

### Pause-when-any-tile-active rule
`Showcase` passes `anyActive={activeId !== null}` to every `ShowcasePiece`. Each tile ORs this with its local pause state and the inverted self-active flag — `paused || (anyActive && !active)` — before passing to `PieceMedia`. Result: opening any tile pauses every OTHER video tile across the grid. Ambient motion quiets under the dim so the focused artefact owns the room.

### Scroll cue → Showcase, anchored to the mat
- `.selected-firstview` is rendered by `FirstView.tsx` (client; formerly `FirstViewSnap` — name stuck around from an earlier auto-snap pass). It wraps `selected-layout` + the `.sc-cue` button, given `position: relative` + `min-height: calc(100svh - var(--workbench-pad-y) * 2)`. The relative-positioning context is what hosts the absolutely-positioned cue.
- **The cue is `position: absolute`** with `top: calc(var(--sc-cue-top, 100%) + var(--space-12))`, `left: var(--sc-cue-left, 0)`, `right: var(--sc-cue-right, 0)`. All three vars are written by `FirstView` via `ResizeObserver`. Result: cue sits a few px below the mat, with left + right edges pinned to the **stage's** edges (`.selected-layout` — the canonical canvas rail). ResizeObserver picks up archive open/close (mat grows by ~470 px) and any reflow automatically.
- **Two anchor elements opt in via `data-*` attributes** — class names are styling, `data-*` is the cross-component wiring contract:
  - `data-cue-v-anchor` on the mat `<section>` in `SelectedContent.tsx` → vertical (top).
  - `data-cue-h-anchor` on the stage `<div>` in `page.tsx` → horizontal (left + right).
  - If either attribute moves to a different element, update `CUE_V_ANCHOR_SELECTOR` / `CUE_H_ANCHOR_SELECTOR` in `FirstView.tsx`. Missing anchors → cue falls back to spanning the full wrapper at `top: 100%`.
- **Why the horizontal anchor is the stage, not AboutCard.** AboutCard has a Framer Motion spring entrance — measuring it captured stale mid-flight positions, and `ResizeObserver` doesn't fire for transform changes. The stage doesn't animate, so the cue's horizontal rails are deterministic. AboutCard itself sits at the stage's left edge (`left: 0`), so they coincide visually — but the *anchor* is the stage, which is the honest contract.
- **`SHOWCASE_DOCK_ID` is exported from `FirstView`** and imported by `ShowcaseSection`. Single source of truth — renaming the id in one place can't silently break the click-glide.
- The cue is a real `<button>`. Click → `scrollGlide` to `#${SHOWCASE_DOCK_ID}` under `--ease-paper`, minus `--workbench-pad-y` so the section header lands a breathing-room below viewport top instead of pasted to the edge. CSS resets default button chrome; the rule + caps label render unchanged.
- The earlier sticky / fixed / portal attempts all lifted the cue out of the page's stacking context and felt overlaid rather than docked. The absolute-against-the-wrapper + measured-anchor pattern is the smallest thing that gives the user "in the layout, but a few px below the mat" without any of those side effects.
- There is **no auto/dominance snap** on this route. An earlier pass wired `useDominanceSnap` on `ShowcaseSection`; the auto-pull felt unrequested and messy in this context, so hand-off is click-only. Don't reintroduce it without explicit ask.
- The `ShowcaseSection` follows `FirstView` and uses its own `margin-top` to start the visuals grid below. The cue is the only thing that lives in the firstview wrapper besides the layout block — don't accidentally hoist HeaderBlock or HintRow into the wrapper.

### `.selected-layout`'s `min-height: 777px` is a first-view canvas floor, not a cue anchor
The 777 px (and the `--archive-open` 1249 px variant) used to size the wrapper so the cue, when it was in flex flow with `margin-top: auto`, landed at a predictable bottom. The cue is now absolute-positioned against `.selected-firstview` and anchored to the mat via `--sc-cue-top` — the layout's min-height no longer controls cue placement. It still sizes the visible first-view canvas (the area the cards + mat sit on), so don't "clean it up" by removing it: the AboutCard and nav-row are absolutely-positioned inside `.selected-layout`, and without a min-height the layout would collapse to 0. Read the value as **"how much vertical canvas the first view reserves,"** not as part of any cue arithmetic.

### Centered design canvas (`.selected-layout` + `.sc-section` at `max-width: 1224px`)
`/selected` was authored against a 1224 px design canvas (mat at `left: 536px` + `width: 688px`). For a long time `.selected-layout` was `width: 100%`, so on viewports wider than the authored canvas the whole first-view group sat anchored to the workbench's left padding with the surplus space dumped on the right — visually "stuck to the left." Same for `.sc-section` and the showcase grid.

Fix: both `.selected-layout` (first-view stage) and `.sc-section` (showcase stage) are capped at `max-width: 1224px` and centered with `margin-inline: auto`. The whole column — cards, mat, divider, showcase grid — sits on the same centered rails on wide viewports. Below ~1352 px (where `1224 + 2×workbench-pad-x` stops fitting) the max-width caps to 100% and tablet/mobile media queries (already authored) take over.

**Residual ~16 px asymmetry by design.** AboutCard sits at `left: 24px` inside `.selected-layout`, so the group's *visual* left edge is 24 px inside the stage's left edge while the mat hugs the stage's right edge flush. After centering the stage in the workbench, that 24 px shows up as ~16 px asymmetry between left-of-AboutCard and right-of-mat (16 not 24 because the inner offset partially absorbs into rounding + viewport math). Preserved per CLAUDE.md's "preserve authored values" — fixing it would mean shifting AboutCard's authored `left`, not the stage. The divider follows automatically via the data-anchor measurements.

**`.selected-firstview` is no longer a flex column.** Removing flex was a precondition for the centering fix: `margin-inline: auto` on a flex-column item along the cross-axis collapses the item to its content width, and `.selected-layout`'s children are all absolutely-positioned (intrinsic width = 0). The flex was a leftover from when the cue used `margin-top: auto` to dock; with the cue now absolute and measured-anchor-driven, flex served no purpose.

### Per-tile kind class hook (`.sc-piece--{piece.kind}`)
- `ShowcasePiece.tsx` emits a `sc-piece--${piece.kind}` class on every tile. This is the targeting hook for **per-kind visual overrides** in `showcase.css` — corner radius, border on/off, video object-position. Used by:
  - `.sc-piece--cardstack .sc-media { border-radius: 0; }`
  - `.sc-piece--interface .sc-media { border-radius: 6px; }`
  - `.sc-piece--paymaster .sc-media { border-radius: 10px; }`
  - `.sc-piece--ecochain .sc-media { border-radius: 8px; }`
  - `.sc-piece--ecochain .sc-video { object-position: 22% 50%; }`  (per-tile crop offset on the looping ecochain video)
  - `.sc-piece--startooth .sc-media { border-radius: 10px; background: #311700; }`  _(v0.93: bg recolored from `--mat-bg` cream to the deep brown Startooth ground; the vector cards SVG sits on top, no bg layer needed in the SVG)_
  - `.sc-piece--multiverse .sc-media { border-radius: 18px; }`
  - `.sc-piece--dual .sc-media { border: none; }`  (overrides the `.sc-media--plain` default hairline — now redundant because the `.sc-media--plain:not(:has(.sc-dual))` exclusion handles the same case; kept as belt-and-suspenders)
- Why a kind class instead of `:has()` on a descendant: it survives empty / null media states and reads cleanly when scanning the CSS. Don't migrate to `:has()` without a real reason — the per-kind list above is the source-of-truth lookup table.

### Cardstack alpha-clip + drop-shadow (load-bearing)
- The five RR card webps carry their own rounded corners baked into the alpha channel. `.sc-cardfan__card` is intentionally transparent (no background, no border, no border-radius, no overflow:hidden, no box-shadow on the wrapper). If you put a background or border-radius back on the wrapper, the stacked cards bleed through each other at the alpha edges as ghost halos — the exact bug we fixed by porting `/rr`'s pattern.
- All shadow weight lives on the inner `<img>` via `filter: drop-shadow(...)` so the shadow traces the alpha shape, not a square wrapper box. Two-tier recipes:
  - Rest: `drop-shadow(-2px 4px 8px rgba(0,0,0,0.38))`
  - Selected: `drop-shadow(-3px 18px 22px rgba(0,0,0,0.52))`
  - Pushed-back (others while one is selected): drop-shadow + `brightness(0.78) saturate(0.6)`
  - Hovered while pushed-back: drop-shadow + `brightness(0.92) saturate(0.85)`
- Mirrors `/rr/components/cards/CardFan.tsx` + `.rr-card-item__img` in `rr.css`. Don't migrate this to `box-shadow` without re-thinking the alpha — they're not interchangeable.

### Cardstack split-click model
- The cardstack tile media (`.sc-cardfan`) owns its own click — toggle between *stacked* (default fan) and *expanded* (cards splay wider, upright). `stopPropagation` on that handler keeps it from bubbling up to the tile's "open spec note" click.
- The caption row click does NOT have `stopPropagation`, so clicking on the caption bubbles up to the tile and opens the spec note.
- Esc collapses the expanded cardfan (separate effect from the spec-note Esc handler).

### Cardstack scale-up + aspect (v0.93+)
- `.sc-cardfan__card` width is **34%** of tile (bumped from the original 30% per user direction "scale up the cardstack"). Cards grow upward from the bottom anchor (`bottom: 6%` + `transform-origin: 50% 100%`) — the tile's vertical headroom absorbs the increase.
- The cardstack piece's `aspect` is **1.4** (down from 1.6) to give the scaled-up cards enough room for click-spread (`scale: 1.18` + `lift -8%`) without poking past the `.sc-media`'s `overflow: hidden` top edge. Math: at 30%×258 the click-spread top was at -4 px (clipping); at 34%×295 it sits ~30 px clear.
- Going wider than 34% needs another aspect bump in the same direction — `width` and `aspect` are coupled here. Don't tune one without the other.

### Posters aspect (v0.93+)
- The posters piece's `aspect` is **0.70** (down from 0.80). The fan transforms — particularly slot-4's `translate(-65%, -62%) rotate(-9deg)` — pushed the back-of-stack poster's top corners past the tile's `overflow: hidden` top edge at the prior aspect. Bumping aspect makes the tile ~74 px taller so the fan corners clear.
- Bonus: row-4 height delta with `ecochain` narrows from 132 → 58 px — the posters + ecochain row reads more balanced post-bump.
- `PosterStack.tsx` now ships **four** posters (`falah-faisal`, `cutting-1`, `cutting-2`, `gong`) — the fourth (`gong`) carries the IG-story aspect 0.5625 instead of the print 0.707, fed into the slot via the `aspect` field on each `Poster` entry and consumed by `.sc-poster { aspect-ratio: var(--poster-aspect, 1222 / 1722) }`. Slot-4 transform was authored ahead of v0.93 to support the fourth card.

### Dual tile (Connektion specimens) — cols 3 stacked
- Piece is **cols 3 + aspect 1.1** (not the off-canonical cols 4 it briefly was). `.sc-dual` is a single flex column — chip on top, gauge below, both centered horizontally with `gap: var(--space-32)`. No pane wrappers, no pane borders — each artefact self-frames (chip on its light card, gauge inside its dark frame), so a container would read as a tray around something that doesn't need one.
- The override `.sc-piece--dual .sc-media { border: none }` keeps its meaning — frameless tile, the artefacts sit directly on the bench. The `.sc-media--plain` default hairline rule's `:not(:has(.sc-dual))` exclusion still applies.

### Connektion specimens — JobChipStack + LifecycleGauge (`media/`)
- **Imported wholesale** from `/Users/nihar.bico/88g/reference/connektion-resources/` — two AI-built artefacts representing the Connektion product. The only project-side edits to each file: a `'use client'` directive (both use hooks) and a swap of `motion/react` → `framer-motion` on the chip (same API; project ships `framer-motion`).
- **Motion timings restored to the reference's original choreography** after a brief unification pass under GLIDE/PRESS/FADE was reverted. The chip's `MOVE` (spring `{stiffness: 420, damping: 26}`, critically-damped, no bounce), `BAR` (0.40 s tween easeInOut), and `FADE` (0.20 s easeOut) drive slot positions, bar/typography, and swatch opacities respectively. The push reaction is **0.38 s easeOut** with `y: [0, -4, 0]` + `scale: [1, 1.014, 1]` (outward lurch — the stack pushes the chip forward from behind; bar updates trail on the longer BAR beat as the chip's response).
- **Offer paint-fill `PAINT_IN` timing tightened** from the reference's 0.72 s → **0.40 s** (same curve, `cubic-bezier(0.22, 0.8, 0.36, 1)`). Reason: at 0.72 s the dark-green clip-path expansion lagged behind the BAR 0.40 s text-color shift to white, leaving white text on the still-light chip surface for ~320 ms (the "see-through" the user reported). At 0.40 s the paint covers on the same beat the text reaches white. `PAINT_OUT` stays at the reference's 0.25 s.
- **Auto-cycle dwell is 2500 ms on both** — JobChipStack `setInterval(advance, 2500)` and LifecycleGauge `dwellMs = 2500`. Both mount simultaneously inside `DualPlaceholder`, so their cycles stay in lock-step (the gauge had a `+ 400` ms rewind delay in the reference; removed for sync). Changing one without the other will desynchronize them.
- **Stack opacity for slot 1 bumped 0.80 → 1.00** (the swatch directly behind the front chip). At 0.80 the bright Offer green (`#4ade80`) read as a translucent wash against the workbench-bg; full opacity makes it solid. Slots 2 + 3 keep their 0.52 / 0.28 fades for the back-of-stack depth implication.
- **Stage taxonomy is 6 stages** — Saved · Applied · Reviewed · Interview · Offer · Accepted — matched verbatim to the LifecycleGauge's stage list so both specimens model the same product lifecycle. The reference shipped 4 stages (Shortlist / Applied / In Review / Offer). Bar widths re-spaced at 40 → 240 in 40 px steps.
- **Accepted's `hideDot: true`** flag fades the moving dot to opacity 0 and uses the dot tone (`#15803d`) as the full bar color — reads as "filled to completion." Label tone bumped to `#d1fae5` (light) for swatch contrast on the deep-green ground.
- **Gauge press recipe is user-click only**, not auto-advance. The `is-pressed` class triggers a `0.24 s` scale-down (`lcg-press` keyframes) AND a needle filter transition: rest filter `drop-shadow(0 2px 4px rgba(0,0,0,0.45)) saturate(1) brightness(1)` → pressed `... saturate(0.15) brightness(0.7)` over `0.12 s var(--ease-snap)`. On release the filter returns over the longer `var(--glide)` paper curve so the orange comes back warmly. Don't add the press tick to the auto-loop — the reserved on-click cue is deliberate.
- **Typography aligned across both** to Connektion's size-contrast pair: title 16 px / weight 600 / -0.2 px tracking, subtitle 12 px / weight 400. Both use `'Inter'` (the Connektion product font, kept as-is — does NOT route through the portfolio's `--font-ui` Google Sans Flex). Caps labels (`.sc-startooth-svg__cards` SHORTLIST / OFFER etc) stay at 10 px / 700 / 0.1em as a deliberate third tier.

### Caption descenders (v0.93+)
- `.sc-cap` uses `line-height: 1.2` (not `1`) at `font-size: 11px`. With `line-height: 1` the line box exactly equals the font-size, so descenders (y, g, p, q, j) sat at or past the line box's bottom edge and got clipped by the row's `overflow: hidden` — most visibly on the mono caption row where descenders are common. 1.2 grows the line box to 13.2 px, giving descenders ~1 px of breathing room inside the line box. The `min-height: 20px` row lock is preserved (13.2 px line box still fits comfortably under 20 px) so dot growth behavior on hover/active is unchanged.

### Bento reading order (v0.93+)
- `PIECES` array order is the visual reading order in the masonry: **cardstack → furrmark → subway → multiverse → paymaster → startooth → interface → dual → posters → ecochain**. Specifically: `dual` precedes `posters` (positions 8/9 were swapped v0.93 — see commit history). This packs the bento into:
  - Row 1: cardstack · furrmark · subway (3 × cols 3 = 9)
  - Row 2: multiverse · paymaster (cols 3 + cols 6 = 9)
  - Row 3: startooth · interface · dual (3 × cols 3 = 9)
  - Row 4: posters · ecochain (cols 3 + cols 6 = 9)
- The dual / posters swap was the v0.93 rearrangement that closed the orphan-cols gap left by `dual`'s previous off-canonical cols 4. Don't reorder the array without re-validating bento packing — `grid-auto-flow: dense` will pack around changes but the row narrative (artifacts → audit hero → quiet specimens → closing weight) was authored deliberately.

### Header + Hint as a single visual unit (v0.93+)
- `.sc-header` carries the **only** divider — its `border-bottom`. `.sc-hint` has no `border-top` (was 1 px var(--grey-880) before the collapse). `.sc-header` `margin-bottom: 0` and `.sc-hint` `margin-top: 0` so the hint sits flush against the header's bottom rule — reads as one continuous block.
- `.sc-hint` keeps its `margin-bottom: var(--space-64)` so the masonry grid still breathes downward.
- The HeaderBlock JSX shed the eyebrow row (`"nihar.works · selected visuals"`) and the `"one bench"` qualifier on the count label. The unused `.sc-header__eyebrow` / `.sc-header__eyebrow-dot` CSS rules are kept for revert-friendliness.

### Frameless-tile border exclusion list
- The `.sc-media--plain:not(:has(.sc-cardfan)):not(:has(.sc-poster-stack)):not(:has(.sc-dual)):not(:has(.sc-rr-scene))` rule maintains a per-tile-kind opt-out list for the default 1 px hairline border.
- `.sc-rr-scene` is the exclusion for the /selected interface tile — it stays `frame: false` because the live Rug Rumble scene's artefacts (You panel + Peace Treaty card) self-frame on the workbench. The `:has()` selector reads the scene's own root class instead of a marker class on the wrapper — same effect, one fewer class to keep in sync. See "Rug Rumble interface scene" below for the live-scene component.

### Startooth — vector composition (v0.93+)
- The startooth tile renders **vector SVG** (not the prior raster PNG). The cards artwork is a single SVG at `public/images/startooth/sc-startooth-cards.svg` (~340 KB, the Figma export). The dark ground (`#311700`) is provided by a per-kind CSS override on `.sc-piece--startooth .sc-media { background: #311700 }` rather than embedded in the SVG — keeps the bg tunable from one CSS line.
- JSX is a `<div className="sc-startooth-svg">` + raw `<img>` of the SVG (NOT the `<Img>` primitive — manifest doesn't index SVGs, raw `<img>` is the cleanest for vector). Two tunable CSS vars on the wrapper: `--st-cards-w` (default 80%) for cards width as % of tile, and `--st-cards-y` (default 0) for vertical translate.
- The prior `sc-startooth.webp` raster and its `_source/images/startooth/sc-startooth.png` master are still on disk, **unreferenced**. Safe to clean up in a future pass.

### Video tiles (Furrmark, Ecochain)
- Both use `media/VideoSlot.tsx` — autoplay + loop + muted + playsInline. A `paused` prop controlled by the parent tile drives `video.play()` / `video.pause()` via ref.
- Source video aspects are **baked into data.ts** (Furrmark: 998/668, Ecochain: 16/9). No runtime measurement, so first paint never letterboxes.
- Ecochain has a `toggle` config that swaps between two source URLs (`interface-introduction.mov` ↔ `audit-status-icons.mov`). The active-tile click flips it. _(Files were `.mp4` until v0.93; replaced with `.mov` originals at user request — kept as-is, no transcode, served `Content-Type: video/quicktime`.)_

### Design-language polish
- **Switch** matches biconomy `.flows__ba-switch` exactly: 24×16 rectangular track at 4 px radius, 8×12 thumb at 2 px radius, 1 px border in the piece's category colour, light tinted background (color-mix 14%) → solid colour on active. Tinted per piece via `--sc-dotc`.
- **Rounded edges are conditional**: only `.sc-media--framed` (UI screenshots) gets 8 px radius + 1 px border + flat shadow. Plain (frameless) tiles — cardstack, posters, multiverse, startooth, dual — stay sharp because posters and printed/tiled surfaces have hard corners.
- **Plain active tiles have no shadow**: the cards/posters read fully transparent on focus (no implied tile rectangle behind them).
- **Multiverse poster** is `border-radius: 8px` and width-capped (80% of its tile) via `.sc-multiverse` — sits inset rather than dominating its column.
- **Video / GIF badge** is a paper pill (mat-bg + 1 px grey-880 + mono caps), not a dark UI chip.

### Helper file split (Fast Refresh)
- Per-renderer helpers live in their own files under `media/`: `VideoSlot.tsx`, `CardstackFan.tsx`, `PosterStack.tsx`, `Misc.tsx` (Placeholder + DualPlaceholder), `RrInterface/` (live Rug Rumble scene — see next section). `PieceMedia.tsx` is a thin switch that delegates.
- This was a fix for a recurring React Fast Refresh trap: helper function declarations defined *after* the default-exported component in the same module produced `ReferenceError: X is not defined` at runtime even though tsc passed. Splitting kills the pattern. If you add a new renderer, **make it its own file under `media/`**.

### Rug Rumble interface scene (`media/RrInterface/`)
The `interface` piece renders a live, autoplaying Rug Rumble battle scene — a foreign artefact with its own design language. **Don't normalize it to portfolio tokens.** Treat it the way you'd treat embedded third-party artwork: keep its hex values, fonts, easings, and radii sealed inside its folder.

- **Folder layout:** `Scene.tsx` (orchestrator + autoplay loop), `StatsPanel.tsx`, `CardPanel.tsx`, `PeaceTreatyCard.tsx`, `paths.ts` (verbatim SVG path data from the Figma export), `masks.ts` (verbatim data-URI mask SVGs), `fonts.ts` (next/font/google declarations), `rr-interface.css` (the scene wrapper + canvas only — everything else is inline style because every value is bespoke Figma).
- **Source provenance:** ported from `/reference/rr-interface-3x/rr-health-gauge/` (Figma Make export). The reference bundle ships shadcn/Radix/MUI/Tailwind/canvas-confetti and 60+ unused files — none of that came across. Only what the scene actually renders.
- **Tailwind → inline style.** The source was Tailwind v4 with bracketed values (`gap-[7.898px]`, `bg-[#13182c]`). Converted directly to inline `style={{ ... }}` because every value is one-off bespoke Figma export. No hover/focus states exist in this scene, so loss of CSS pseudo-classes doesn't matter. Don't refactor these to classes — there's nothing to gain.
- **Doubled px values.** The source authored the scene at 1× and wrapped it in `transform: scale(2)` at the App level. Both the wrapper and the scale are dropped during port; every px value in the JSX is the doubled value (e.g. `padding: 12.416` not `6.208`). The canvas renders at intrinsic **548 × 560 px**.
- **transform: scale() on the canvas — documented exception.** The crafted-lite ban on `transform: scale()` for whole authored canvases (`docs/responsive.md`) does not apply here. This is a *foreign* embedded artefact at fixed intrinsic dimensions; the scale is the embedding mechanism, not a responsive shortcut. The canvas is held at 548 × 560 and scaled to the tile width via `scale(calc(100cqw / 548px))` in `rr-interface.css`. Tile `aspect` in `data.ts` (`548 / 560`) matches so the artefact fills without letterbox or crop. The container query needs the wrapper's `container-type: inline-size` — don't remove it.
- **Three mirrored values that must change together.** Five places encode the canvas width/height. If you change one, change them all:
  1. `rr-interface.css` `.sc-rr-scene__canvas { width: 548px; height: 560px }`
  2. `rr-interface.css` `transform: scale(calc(100cqw / 548px))` — the divisor is the canvas width literal
  3. `data.ts` interface piece `aspect: 548 / 560`
  4. `CardPanel.tsx` `playing`/`default` `y: -480` — chosen so the card fully clears the canvas top with margin (`(560 + 360) / 2 = 460`, plus a 20 px safety margin)
  5. The 360 in (4) is the card's own intrinsic height — `PeaceTreatyCard.tsx` border + content sums to 355.43 px. Treat 360 as the locked card height.
- **`contain: layout paint` is load-bearing.** The wrapper's `contain: layout paint` is what prevents the scaled canvas from painting outside the tile bounds — the scale visually exceeds the wrapper's layout box during card-exit, and without containment the artwork would bleed into siblings on the workbench. Don't drop it.
- **Class name `.sc-rr-scene` is a cross-file contract.** Three files agree on the name:
  - `rr-interface.css:4` (the wrapper's own class)
  - `Scene.tsx` (the JSX className)
  - `showcase.css` `:not(:has(.sc-rr-scene))` (frameless-tile border exclusion list)
  Renaming the wrapper breaks the hairline suppression silently — the tile gains a 1 px border with no other symptom.
- **`motion/react` → `framer-motion`.** Source used the renamed `motion` package; we already have `framer-motion`. Same API surface. If `motion/react` reappears in a re-port, swap it.
- **Fonts: `next/font/google`, not local.** Gluten (weight 600) and Playpen Sans (weights 400/600/700). Both are integral to the design language and absent from our stack. CLAUDE.md prefers `next/font/local` for the portfolio's five primary fonts; this is a scoped exception for a foreign component. `next/font/google` downloads the woff2 at build time and serves it from the local Next.js asset path — no runtime fetch to `fonts.googleapis.com`, so the external-link ban isn't violated. Variable mode keeps the public surface to two CSS custom properties (`--font-rr-gluten`, `--font-rr-playpen`) applied only to `.sc-rr-scene`. **Don't promote these fonts to globals.css** — they belong to one tile.
- **Pause contract.** `Scene.tsx` consumes the `paused` prop from `PieceMedia.tsx`. The Showcase grid's "anyActive pauses every other video tile" rule applies here too — when any other tile is focused, the loop tears down at the next checkpoint via `aliveRef`. When `paused` flips back to `false`, the `useEffect`'s dependency triggers a fresh loop start.
- **`aliveRef` re-arm is load-bearing.** The autoplay effect sets `aliveRef.current = true` at the *top of the effect body*, before calling `run()`. The cleanup sets it `false`. If a future "simplification" removes the re-arm assuming it's redundant, the second un-pause never starts — the previous cleanup left the ref `false` and `run()`'s `while (aliveRef.current)` never enters. Keep the explicit re-arm.
- **`tickHealth()` is fire-and-forget — don't add `await`.** Inside the playing phase, `tickHealth()` ticks the health number down by 1 every 160 ms × 4 = 640 ms, concurrent with the rest of the loop's card-animation phases (120 ms hold → 520 ms exit → 200 ms gone → 1500 ms cooldown). Adding `await` would serialize the 640 ms of ticks against the card phases and desynchronize the choreography. The dangling promise observes the shared `aliveRef` and bails cleanly when `paused` flips.
- **`prefers-reduced-motion` is reactive *and* extends to the idle bob.** Scene watches the media query via `addEventListener('change')` so it reacts to OS-level toggle mid-session. When `reducedMotion === true`, the autoplay loop never starts AND `CardPanel` receives the flag, which suppresses the `idle` phase's `y: [0, -10, 0]` keyframes (substitutes static `y: 0`). The flag is reactive, so flipping the OS setting during a session re-arms the loop or pauses to the static pose without a remount.
- **Ghost border colour.** The `gone`/`cooldown` placeholder ring is `2px solid #CCCCCC` (grey-800 hex inlined, not the portfolio CSS var) with opacity pulse `0.6 → 1 → 0.6`. This is the only foreign-component colour that intentionally borrows the portfolio's neutral scale — readability of the "card slot" on the workbench mat required it. Kept inline so the scene stays sealed.
- **Toggle removed.** The static-image era had a `clean / UI Map` toggle that overlaid a `UiMapPlaceholder`. With the live scene as the proof, the toggle and the placeholder were dropped. If a future UI-map state returns, it has to be designed against the moving scene, not the still frame.

---

This document covers the **archive panel timeline** — the expandable section under "Works from the previous portfolio."

---

## Archive timeline model

The archive timeline is a vertical strip of colored bars, year labels, and entry cards. It represents a chronological work history reading **top (recent) to bottom (older)**.

### Core concepts

**Bars** represent time spans. Each project has a colored bar whose height is proportional to the project's duration.

**Nesting** encodes relationships. A short bar sitting inside a longer bar means that project was done as part of the longer engagement. Example: the olive bar (Ecochain) sits inside the mint bar (Slangbusters) — Ecochain was a client project done during the Slangbusters tenure.

**Year labels** are anchored to bar edges or entry meta lines. They mark when a project started or ended. A year belongs to whichever project it contextualizes — `20` sits on the mint bar but marks when Ecochain started within Slangbusters.

**Entries** are the text cards (title + role/company) positioned alongside their bars.

### Current projects (top to bottom)

| Color     | Project      | Role              | Year | Bar type   |
|-----------|--------------|-------------------|------|------------|
| yellow    | Connektion   | Product Designer  | 2021 | Standalone |
| aleyr     | Aleyr        | Creative Director | 2020 | Nested inside mint |
| olive     | Ecochain     | Creative Director | 2019 | Nested inside mint |
| codezeros | Codezeros    | Creative Director | 2018 | Nested inside mint |
| mint      | Slangbusters | Creative Director | 2018–20 | Long, contains aleyr/olive/codezeros |

All five archive projects use page-local tokens in `selected.css` under `.selected-workbench`, derived from actual brand hex values with a primary/secondary color system:
- Primary hue → light fill (`-100`, or `-80` for mint), `-800` (text; also the standalone Connektion bar's border), `-960` (borders on the mint bar and the nested bars). The `-800`/`-960` border mix is shipped and deliberate — read `selected.css` for the per-bar choice.
- Secondary hue → `-240` (hover bar fill)

Token origins: Connektion teal #01F2F5, Aleyr purple #723CC5 / pink #FF5581, Ecochain green #4CB400 / off-white, Codezeros orange-red #FF4B3F / golden #F9A12E.

---

## Spacing system

All values are multiples of **4px** or **8px**.

### Grid tokens

| Token | Value | Usage |
|-------|-------|-------|
| Number-to-bar-edge | 4px | Year label to its corresponding bar edge |
| Bar gap | 16px minimum | Space between non-touching bars (the shipped yellow→mint gap is 23px — authored; preserve) |
| Entry spacing | 88px | Vertical distance between entry tops |
| Title height | 36px | Fixed height of `.ap-entry__title` (2-line max) |
| Dot cluster gap | 8px | Between dots in the dot clusters |
| Nested bar height | 20px | Small marker for nested projects |

### Position math

All positions are **relative to the archive panel** (`.selected-archive-panel`).

**Entry positions** follow the 88px rhythm:
```
entry[0].top = 36
entry[n].top = 36 + (n * 88)
```

**Meta line center** (where year labels align):
```
meta_center = entry.top + title_height(36) + half_meta_height(10) = entry.top + 46
```

**Year label CSS `top`** = meta_center (labels use `transform: translate(-100%, -50%)` so `top` is their visual center).

**Bar positioning from year labels** (4px padding rule):
- Year at TOP of bar: `bar.top = year_center - 6(half_label) - 4(padding)` = `year_center - 10`
- Year at BOTTOM of bar: `bar.bottom = year_center + 6 + 4` = `year_center + 10`

**Bar gap**: bottom of bar N to top of bar N+1 = 16px minimum (shipped yellow→mint is 23px — preserve shipped values).

### Current positions

```
Dots:            top: 2    (12px gap to yellow bar at 36)

Yellow bar:      top: 36,  h: 55,  bottom: 91
  Connektion:    top: 36
  21:            top: 81   (at Connektion meta)

  ── gap ──

Mint bar:        top: 114, h: 329, bottom: 443
  20 (mint):     top: 124  (at mint bar top, belongs to Slangbusters)

  Aleyr:         top: 124
  Aleyr bar:     top: 159, h: 20,  bottom: 179  (nested)
  20 (aleyr):    top: 169  (at Aleyr meta)

  Ecochain:      top: 212
  Ecochain bar:  top: 247, h: 20,  bottom: 267  (nested)
  19:            top: 257  (at Ecochain meta)

  Codezeros:     top: 300
  Codezeros bar: top: 335, h: 20,  bottom: 355  (nested)
  18 (codezeros):top: 345  (at Codezeros meta)

  Slangbusters:  top: 388
  18 (mint):     top: 433  (at mint bar bottom, belongs to Slangbusters)

Entry width:     300px (left: 17px → 12px gap from bar)
Panel width:     340px
Panel height:    468px
```

---

## Main timeline positions

All positions relative to `.selected-tl` (which is the full mat area).

```
Now dot:         left: 143, top: 64, 16×16
Now label:       left: 139 (4px gap to dot left), top: 72, anchor: right-center
Greeting:        left: 163 (4px gap from dot right), top: 72

Top dots:        left: 148, top: 92   (12px gap below dot bottom 80)
Blue bar:        left: 148, top: 126, h: 374, bottom: 500
Yellow bar:      left: 148, top: 256, h: 46
2025:            left: 144, top: 136  (bar-top marker)
Q4•25:           left: 144, top: 280  (Terra role center)
23:              left: 144, top: 478  (Blue role center)
Bot dots:        left: 148, top: 512  (12px gap below bar bottom 500)

Card Terra:      left: 164, top: 126  (aligns with blue bar top)
Card Blue:       left: 164, top: 324

Nameplates:      left: 133
  Names Coined:  top: 545
  Marks/Symbols: top: 595
Single dots:     left: 148
  mid1:          top: 585
  mid2:          top: 635
Archive toggle:  left: 133, top: 645
Archive panel:   left: 148, top: 685
```

---

## Now dot — time-of-day shapes

The Now dot's painted shape mirrors the greeting stage from `app/lib/greeting.ts` (`getGreetingStage()`). The 16×16 box and `left: 143, top: 64` position are **constant** across all three stages so the timeline alignment never moves — what changes is what's painted inside the box.

- **Morning** (`selected-tl__dot--morning`) — `clip-path: inset(0 0 50% 0)` clips the bottom half of the disk, leaving a top-half dome (sun above horizon). The dome's flat bottom lands at `y = 72`, aligning to the "Now" label's vertical center as a horizon line.
- **Afternoon** (`selected-tl__dot--afternoon`) — no modifier rule by design; the base `.selected-tl__dot` IS the afternoon shape (full 16×16 yellow disk). Don't add an empty `.selected-tl__dot--afternoon {}` rule "for symmetry" — the modifier class is inert by intent.
- **Evening** (`selected-tl__dot--evening`) — a `::before` pseudo-element offset `-2px / -2px` at the top-right, sized `14×14` with `border-radius: 50%`, painted in `var(--mat-bg)`, carves a bite out of the disk and leaves a crescent opening to the bottom-left.

**Load-bearing details:**
- The crescent carve color is `var(--mat-bg)`, **not transparent**. If the dot is ever placed over a surface that isn't `--mat-bg`, the crescent will paint the wrong color and the bite will be visible as a rectangle of the wrong shade. The dot lives inside `.selected-tl` which sits over the workbench mat, so this currently holds.
- The crescent geometry — `-2px / -2px` offset and `14×14` carve diameter — is tuned for the crescent's visual thinness. Don't tweak without checking the silhouette.
- Stage selection inlines `getGreetingStage()` in JSX render (matching the existing pattern of `getGreeting()` next to it). Both share the same minor SSR/CSR hour mismatch risk if server timezone differs from client — accepted as inherited behavior, not a new concern.
- Mobile inheritance: the mobile reposition of `.selected-tl__dot` (`selected.css` mobile block) doesn't restate the modifier rules; the morning `clip-path` and evening `::before` carry through because both are geometry-relative to the dot's box, not to absolute coordinates.

---

## Typography

### Year labels (both timelines)

`var(--font-mono)` — Google Sans Code via next/font (the system mono stack is only its fallback chain) — at 11px / 600 / -0.3px letter-spacing, for even digit widths.

### Meta / role text (archive entries + project cards)

Uses the shared `.t-h5` utility (`globals.css`), applied via JSX — the Google Sans Flex variable-axis values live in that one shared rule, not inline in this route.

### Now label

Same `--font-mono` token as year labels. Anchored right (`transform: translate(-100%, -50%)`).

---

## Spacing grid

### Consistent gaps

| Gap | Value | Where |
|-----|-------|-------|
| Dots-to-bar | 12px | Top dots → blue bar, blue bar → bot dots, archive dots → yellow bar |
| Content-to-bar | 12px | Entry left edge to bar (entry `left: 17px`, bar at `left: 1px` + `width: 4px` = 5px → 17-5 = 12px gap) |
| Label-to-dot | 4px | "Now" label right edge to dot left; greeting left to dot right |
| Year-to-bar edge | ~4.5px | Year text edge to nearest bar edge (year_center ± 10px from bar edge) |
| Entry flex gap | 2px | Between title and meta within each archive entry |
| Dot cluster gap | 8px | Between dots within a cluster |

### 4px horizontal gap rule

Labels maintain 4px clearance to adjacent elements:
- "Now" at `left: 139px` → 4px to dot at 143px
- Greeting at `left: 163px` → 4px from dot right edge (143 + 16 = 159)

---

## Icons

Two custom Lucide-geometry SVG icons with CSS-only hover animations. Both are hand-rolled (not imported from `lucide-react`), using the same pattern: a named inner class (`<path>` or `<g>`) gets `translate` on parent hover, `0.3s ease-in-out`.

Both icons were promoted to the shared layer — they live at `app/components/icons/` (`IconExternalLink.tsx`, `IconChevronRight.tsx`; see `LIBRARY.md`). The hover rules stay route-local in `selected.css`:

**IconExternalLink** — archive entries. Arrow group slides diagonally:
```css
a.ap-entry:hover .icon-ext .icon-ext-arrow { translate: 2px -2px; }
```

**IconChevronRight** — project cards. Chevron path nudges right, gated on the stale-hover guard:
```css
.project-card[data-armed="true"]:hover .project-card__arrow .icon-chevron-shaft { translate: 3px 0; }
```

Arrow color inherits from variant: `--terra-720` (Terra) / `--blue-800` (Blue), set on `.project-card__arrow`.

Material Symbols remains for non-animated icons (nav markers, archive toggle).

---

## Pending migration — `.ap-entry__hint` → `<Monostamp>`

The "Opens in new tab" hint pill on archive entries (the `.ap-entry__hint` block in `selected.css`) is the
original instance of the shell pattern that has been promoted to
`app/components/Monostamp.tsx` — monospace text, paper-cream fill, hairline
border, tone-colored ink. The second consumer (note-pointer stamps in
`/biconomy`) already uses `<Monostamp>`.

This hint is still inline CSS for now. Migration is safe but non-trivial:
the hint has **route-specific hover behavior** (hidden by default, slides
in on `a.ap-entry:hover` with opacity + translate transitions) that must
stay in `selected.css`. Only the **visual shell** — bg, border, typography,
padding, radius — should move to the `<Monostamp>` component, keeping the
positioning/transition overrides local.

Tones needed: `connektion`, `aleyr`, `olive` (ecochain), `codezeros`, `mint`.
`mint` / `olive` are already in `MonostampTone`. `connektion`, `aleyr`,
`codezeros`, `ecochain` are **not** — their color tokens currently live only
in [selected.css:18+](selected.css:18) (route-scoped), not in `globals.css`.
Migration sequence:
1. Decide: promote those tokens to `globals.css` (makes tones available
   anywhere), or keep them in `selected.css` and scope a route-local
   `MonostampTone` extension.
2. Add the matching ramps (560 / 720 / 800 / 960) — some are missing today.
3. Extend `MonostampTone` + the dark/light/is-active CSS blocks with the
   new tones.
4. Swap `.ap-entry__hint` shell styles to use `<Monostamp>`.

**What will break if this isn't done:** nothing immediate. It's technical
debt — drift risk if the Monostamp base styling changes later.

---

## Component ownership

The `/selected` page has three components:

| Component | Owns | Props |
|-----------|------|-------|
| **SelectedContent** | State (`archiveOpen`), scroll behavior | — |
| **Timeline** | Entire vertical sequence: Now dot → dots → bars → cards → year labels → nameplates → single dots → archive toggle | `isArchiveOpen`, `onArchiveToggle` |
| **ArchivePanel** | Expandable archive content only (AnimatePresence) | `isOpen` |

The **archive toggle button** lives in Timeline, not ArchivePanel. It's visually part of the main timeline sequence and must participate in the unified delay train. ArchivePanel only contains the content that appears/disappears.

---

## Animation: train metaphor

All elements animate in a **top-to-bottom sequence**, as if an imaginary cursor is drawing the timeline downward. Bars grow via `scaleY` from `transform-origin: top center`.

The train runs across **two scopes**:

1. **Timeline** — unified delay map from Now dot (0.30s) through archive toggle (1.28s)
2. **ArchivePanel** — internal delay map starting at 0.06s (relative to panel mount)

### Sequencing rules

1. Bars are **sequential** — the next bar starts only after the previous bar's spring is visually complete.
2. Years and entries appear **as the train reaches their vertical position** within the current bar's growth.
3. Nested bars (olive, aleyr, codezeros) appear mid-parent (mint) when the train reaches their `top`.

### Animation patterns

| Element type | Initial | Animate | Spring | Direction |
|-------------|---------|---------|--------|-----------|
| Dots | `opacity: 0, scale: 0` | `opacity: 1, scale: 1` | SPRING_POP (0.3s/0.35) | Pop in place |
| Bars | `scaleY: 0` | `scaleY: 1` | SPRING or SPRING_LONG | Grow top-to-bottom |
| Cards/Entries | `opacity: 0, y: -8` | `opacity: 1, y: 0` | SPRING_PLACE (0.45s/0.25) or SPRING_ENTRY (0.3s/0.12) | Fall from above (top-to-bottom) |
| Nameplates | `opacity: 0, y: -8` | `opacity: 1, y: 0` | SPRING_PLACE (0.45s/0.25) | Fall from above |
| Year labels | `opacity: 0` | `opacity: 1` | duration 0.14–0.25s | Fade |

**Important**: all cards, entries, nameplates, and the archive toggle animate `y: -8 → 0` (top-to-bottom), matching the train direction. Never use `y: positive → 0` (bottom-to-top).

### Delay calculation

For elements during a bar's growth, delay is proportional to their position within the bar's range:

```
element_delay = bar_start_delay + ((element.top - bar.top) / bar.height) * bar_spring_duration
```

### Timeline delay table (Timeline.tsx)

```
D.dot       = 0.30   Now dot + label + greeting
D.dotsTop0  = 0.38   Top dot cluster (staggered)
D.dotsTop1  = 0.42
D.dotsTop2  = 0.46
D.barBlue   = 0.50   Blue bar (spring 0.5s, done ~1.00)
D.year2025  = 0.51   136 — just inside bar top
D.cardTerra = 0.51   126 — at bar top
D.barYellow = 0.68   256 — 35% into blue
D.yearQ425  = 0.70   280 — 41% into blue (Terra role center)
D.cardBlue  = 0.76   324 — 53% into blue
D.year23    = 0.98   478 — 94% into blue
D.dotsBot0  = 1.02   Bottom dot cluster (staggered)
D.dotsBot1  = 1.06
D.dotsBot2  = 1.10
D.names     = 1.14   Names Coined nameplate
D.dotMid1   = 1.18   Single dot
D.marks     = 1.20   Marks And Symbols nameplate
D.dotMid2   = 1.24   Single dot
D.archive   = 1.28   Archive toggle (last element)
```

### Archive delay table (ArchivePanel.tsx)

```
D.dots          = 0.06   (staggered +0.04 per dot)
D.barYellow     = 0.12   (spring 0.4s, done ~0.52)
D.connektion    = 0.28
D.year21        = 0.42
D.barMint       = 0.54   (spring 0.65s, done ~1.19)
D.year20top     = 0.56   (mint-colored, at bar top)
D.aleyr         = 0.58
D.barAleyr      = 0.65   (spring 0.3s)
D.year20        = 0.66   (aleyr-colored)
D.ecochain      = 0.74
D.barEcochain   = 0.82   (spring 0.3s)
D.year19        = 0.83
D.codezeros     = 0.92
D.barCodezeros  = 1.00   (spring 0.3s)
D.year18        = 1.01   (codezeros-colored)
D.slangbusters  = 1.09
D.year18bot     = 1.17   (mint-colored, at bar bottom)
```

### Spring types

| Name | Duration | Bounce | Used for |
|------|----------|--------|----------|
| SPRING | 0.4–0.5s | 0.15 | Standard bars (Timeline: 0.5s, Archive: 0.4s) |
| SPRING_POP | 0.3s | 0.35 | Dots (high bounce, snappy) |
| SPRING_PLACE | 0.45s | 0.25 | Cards, nameplates, archive toggle |
| SPRING_PILL | 0.4s | 0.15 | (reserved) |
| SPRING_LONG | 0.65s | 0.12 | Tall bars (mint in archive) |
| SPRING_ENTRY | 0.3s | 0.12 | Archive entries, short bars |

---

## Hover system

When an entry is hovered, its **bar, year labels, and text highlight** while everything else dims.

### Mechanism

CSS `:has()` on `.selected-archive-panel` — no JS state needed. `filter: opacity()` is used instead of `opacity` to avoid conflicting with Framer Motion's inline styles.

Transition: `0.35s ease-in-out` on both filter and background, applied to all interactive elements on their base state (so hover-out is equally gentle).

### Highlight behavior

- Dimmed state: `filter: opacity(0.35)`
- Highlighted bar: `filter: opacity(1)` + background stepped up one token (e.g., `--yellow-100` to `--yellow-240`)
- Highlighted years/entries: `filter: opacity(1)`

### Hover groupings

**Main timeline** (CSS `:has()` on `.selected-tl`):

| Card hovered | Highlights | Note |
|--------------|------------|------|
| Terra (Rug Rumble) | yellow bar, Q4•25, card | 2025 dims — it's a bar-top marker, not Terra-specific |
| Blue (Biconomy) | blue bar, 2025, 23, card | Q4•25 dims |

**Archive** (CSS `:has()` on `.selected-archive-panel`):

| Entry hovered | Highlights | Note |
|---------------|------------|------|
| Connektion (yellow) | yellow bar, year 21 | |
| Aleyr | aleyr bar, year 20 | |
| Ecochain (olive) | olive bar, year 19 | |
| Codezeros | codezeros bar, year 18 | |
| Slangbusters (mint) | mint bar, years 20 (top) & 18 (bottom) | Mint-colored year labels at bar edges |

---

## Recipe: adding a new project

### 1. Decide placement

- Where in the chronological order does it go?
- Is it standalone or nested inside another bar?
- Pick a color token. Use globals if it exists, otherwise define page-local tokens in `selected.css` under `.selected-workbench`.

### 2. Calculate positions

```
new_entry.top = previous_entry.top + 88
meta_center = new_entry.top + 46
```

For the bar:
- If year at top: `bar.top = year_center - 10`
- If year at bottom: `bar.bottom = year_center + 10`
- Maintain at least a 16px gap from adjacent non-nested bars (match the shipped neighbours)
- Nested bars: 20px height, positioned within parent bar's range

### 3. Update CSS (`selected.css`)

Add under each section:
- `.ap-entry--{color} { top: __px; }` — entry position
- `.ap-entry--{color} .ap-entry__meta { color: var(--{color}-800); }` — meta color
- `.selected-ap-year--{id} { top: __px; color: var(--{color}-800); }` — year label(s)
- `.selected-ap-bar--{id} { top: __px; height: __px; background: var(--{color}-100); border: 1px solid var(--{color}-960); }` — bar (match the shipped bars: nested/mint use `-960`; only the standalone Connektion bar uses `-800`)

Add hover group:
```css
.selected-archive-panel:has(.ap-entry--{color}:hover) .ap-entry--{color},
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-bar--{id},
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-year--{id} {
  filter: opacity(1);
}
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-bar--{id} {
  background: var(--{color}-240);
}
```

### 4. Update component (`ArchivePanel.tsx`)

- Add to `ARCHIVE_ENTRIES` array
- Add bar, year(s), and entry JSX in the correct top-to-bottom position
- Calculate delay using the train formula and add to `D` object
- Recalculate delays for any elements pushed down

### 5. Adjust panel height

Update `.selected-archive-panel` height if content extends beyond current value (468px). Also update `.selected-mat--archive-open` min-height and `.selected-layout:has(...)` min-height.

---

## Don't-touch items

- **Hover uses `filter: opacity()` not `opacity`** — Framer Motion sets inline `opacity` after entrance animations, which would override CSS class rules. `filter` is a separate property and works.
- **Bar `transform-origin: top center`** is set on the base `.selected-ap-bar` class. All bars grow top-to-bottom. Don't override per-bar unless explicitly asked.
- **Year label `transform: translate(-100%, -50%)`** — `top` value = visual center. Account for this in all position math.
- **The `D` delay object uses absolute values, not relative** — changing one bar's timing requires updating everything below it.
- **Archive toggle lives in Timeline, not ArchivePanel** — it participates in the main delay train. Moving it to ArchivePanel would break the sequencing.
- **Animation direction is always top-to-bottom** — entries/cards/nameplates use `y: -8 → 0`. Never use positive `y` initial values (bottom-to-top) as this contradicts the train metaphor.
- **Dots use pop animation, not fade** — `scale: 0 → 1` with SPRING_POP. Dot clusters are staggered (+0.04s per dot).
- **Year labels use system monospace**, not the variable display font. This ensures even digit widths without needing tabular-nums or variable font tricks.
- **No autoscroll on archive toggle** — `handleToggle` simply flips state. Scroll behavior was removed because it was disorienting.
- **12px gap grid** — dots-to-bar and content-to-bar gaps are consistently 12px. Do not change without recalculating all adjacent positions.
- **4px label clearance** — "Now" label and greeting maintain 4px gaps to the dot. Year labels maintain ~4.5px from bar edges.
- **Icon arrow animation is CSS-only** — `translate` on `.icon-ext-arrow` group, triggered by parent `a.ap-entry:hover`. No Framer Motion involvement.

### Hint pill

The "opens in new tab" pill uses a neutral shell (grey bg/border) with only the text color themed per project. This avoids visual noise while still tying the pill to its entry.

```
background: var(--grey-960);  /* #F5F5F5 */
border-color: var(--grey-880);  /* #E0E0E0 */
color: var(--{project}-800);  /* themed text */
```

---

## Responsive anomalies (mobile ≤767px)

The first responsive pass on `/selected` introduced several structural constraints
that are not obvious from reading the code. Mobile changes live in the
`@media (max-width: 767px), (max-height: 500px)` blocks of `selected.css`;
tablet overrides in the `(min-width: 768px) and (max-width: 1023px)` block
(search the queries — line numbers drift).

### `.selected-archive-panel` is a **sibling** of `.selected-tl`, not a child

Both live inside `.selected-mat`. On desktop this doesn't matter because
everything is positioned absolutely. On mobile it does: the archive panel
cannot inherit horizontal padding from `.selected-tl`, so it repeats its own
`padding: 16px 32px 32px` to land in the same content column. If you change
the mat's horizontal inset, you must change **both** places.

**What breaks if you assume nesting:** archive entries drift out of the column
established by project cards and nameplates.

### Mat fills remaining viewport height via a three-link flex chain

```
.selected-workbench  { min-height: calc(100vh - 2*var(--workbench-pad-y));
                       display: flex; flex-direction: column; }
.selected-layout     { flex: 1; display: flex; flex-direction: column; }
.selected-mat        { flex: 1 0 auto; }
```

The mat grows to fill whatever vertical space the about card + nav-row leaves
behind, so the grid surface always reaches the black viewport frame at the
bottom. The chain is load-bearing: **any sibling added after `.selected-mat`
inside `.selected-layout` will steal the grow and orphan the mat short of
the frame.** If you need to add content below the mat, move it inside the
mat or re-engineer the chain.

### Sticky nav row uses negative margin-top to sit flush against the viewport top

```css
.selected-nav-row {
  position: sticky;
  top: 0;
  margin-top: calc(-1 * var(--workbench-pad-y));
  z-index: 40;
}
```

Without the negative margin, the sticky row would stick **below** the
workbench's top padding (the first position it could occupy in normal flow).
The negative margin pulls its initial position up by exactly the pad-y so
that `top: 0` sits the marker flush at the viewport edge (the black frame is desktop-only and hidden on mobile).

**Don't touch without reading:** the negative margin value is tied to
`--workbench-pad-y`, not a magic number. If `--workbench-pad-y` is retuned
for mobile (currently 32px), this continues to work. Hardcoding `-32px`
here would re-introduce a stale-value bug.

### Archive year lives in the DOM on desktop, hidden by CSS

`ArchivePanel.tsx` renders every entry's meta as
`{role} • {company}<span className="ap-entry__year"> • {year}</span>`.
Globally `.ap-entry__year { display: none }`, and the mobile block flips
it to `display: inline`.

Implications:
- **Semantic payload:** screen readers, search engines, and link scrapers see
  the full string `"Product Designer • Connektion • 2021"` on desktop even
  though the visible text is shorter. This is arguably a feature (the
  chronological context is carried to assistive tech via the hidden year),
  but it is a deliberate desktop/mobile **semantic mismatch** — flag it if
  a future a11y pass treats `display: none` content as "not for AT".
- **Copy discipline:** the year source of truth is the `ARCHIVE_ENTRIES`
  array in `ArchivePanel.tsx`. The desktop year-label components
  (`.selected-ap-year--*`) are separate, hand-placed elements. If the
  visible desktop year and the inline meta year ever disagree, the
  archive entries array is wrong.

### Responsive copy pattern — two sibling spans with CSS display toggling

`Timeline.tsx` renders both copies (search `archive-toggle-label`):

```tsx
<span className="... archive-toggle-label--desktop">Works from the previous portfolio</span>
<span className="... archive-toggle-label--mobile">Previous portfolio</span>
```

CSS toggles `display: inline` vs `display: none` at the 767px breakpoint.

**Don't update one without the other.** There is no shared source of truth —
the two strings will drift silently unless a linter or convention catches it.
If this pattern proliferates, consider promoting a `<ResponsiveCopy desktop mobile />`
primitive into shared components rather than copying the two-span pattern
into more routes.

### Hover-only affordances disabled on mobile

`.ap-entry__hint` (the "opens in new tab" pill) and the push-apart translation
on entry hover are both turned off in the mobile block because touch devices
don't have persistent hover. The hover highlights (`:has(:hover)` rules) are
explicitly reverted via `filter: none`. Don't assume
these work on touch; they're desktop-only embellishments.

## Stale-hover gate — `data-armed` on ProjectCard

[ProjectCard.tsx](components/ProjectCard.tsx) sets `data-armed="true"` on its `<Link>` only after the first real cursor `mousemove` (with a position-change check that ignores synthetic moves emitted by layout/transform settles). Both the card-level `:hover` rules **and** the `.selected-tl:has(.project-card[data-armed="true"]:hover)` timeline cascade in [selected.css](selected.css) — five selectors total: dim-all, terra highlight, terra bar, blue highlight, blue bar — are gated on this attribute.

**Why:** without the gate, arriving on `/selected` with the cursor parked over a card on first paint triggers the `:has(:hover)` cascade on mount, dimming the timeline and highlighting one card before the user has moved the mouse. The `data-armed` mousemove latch defers all hover-driven state to a real cursor input, which is the actual signal of intent.

**Don't drop the gate from any of the five cascade rules.** They're a unit. Removing it from one breaks the others' parity (e.g. dim fires but highlight doesn't, or vice versa). The mobile override under `:has(...:hover)` to undo the desktop dim on touch also uses the same `[data-armed="true"]` gate so synthesized touch hover doesn't bypass it.

**Why on the Link, not the outer motion.div:** the cascade selectors are `.selected-tl:has(.project-card[data-armed="true"]:hover)`. Putting `data-armed` on the inner Link is what makes the `:has()` query match. Earlier attempts (timer-based gates, gate on the outer motion.div) all failed because the `:has()` query was operating on the inner element. The `:has()` cascade was the actual hover trigger — root-cause fix lives where the selector looks.

*Last updated: 15 April 2026.*
