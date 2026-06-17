# /rr — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/(works)/rr/` are touched.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale, what-breaks, and rejected approaches. This digest is the seatbelt; the archive is the manual. Read the archive section before structurally changing anything an item below names.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this file exists and stays paired with the archive.

## Don't-touch digest

- `--rr-mech-progress` is written to the stage element (shared ancestor of both mats), never to a mat — CSS variables don't cross sibling boundaries.
- Both mechanics mats are fixed 678px wide and translate, never resize — the resize model clipped grid cells mid-animation and was reverted.
- Keep the `.is-split` visibility gate toggled on the primary mat — without it the secondary's border renders as a stray line at p=0.
- Keep `#mechanics::after { display: none }` — the section's paper-noise pseudo would scroll with the 200vh wrapper; visible mats render their own.
- In Mechanics `handleGameOver`, compute the scroll target from `rect.top + window.scrollY`, never `scene.offsetTop` (resolves to 0 and scrolls backward).
- `snap={chapter.id !== 'mechanics'}` in page.tsx is structural (pinned scene fights snap) — never uniformize the snap prop, at any breakpoint.
- Intro's `snapIdleMs={100}` override must not be extended to Cards or Outcome — near-zero idle yanks the reader during reading pauses.
- Keep the `?? sheet` fallback after the `[data-arrow-target]` query in `app/components/nav/useDockedMarker.ts` — other routes rely on it; this is the only global file /rr changed.
- Rails open/close, the game-board nudge, and mobile open transforms must stay inline `style.transform` strings written from React state — CSS-class, `:has()`, and Framer Motion transform transitions all stall (playState pending, currentTime 0) on children of `.rr-mech-family`; transition timing stays on the base CSS rule, never on `.is-open`.
- Never swap the rails' inline transform string for the standalone `translate:` property — it is silently ignored on these elements (tested).
- Board-nudge values are a load-bearing triple: the board's inline nudge in Mechanics.tsx, the other rail's `CLOSED_NUDGED_TRANSFORM`, and the opening rail's `OPEN_TRANSFORM` must be recomputed together so everything lands flush.
- Mobile rail open transforms live in `OPEN_TRANSFORM_MOBILE` constants in each rail's TSX, asymmetric by coordinate system — never move them back into CSS (they stall); recompute from bounding rects if mat width or rail base left changes.
- `overflow: clip` (not `hidden`) on the `.mat` base class and `#cards.mat` — hidden creates a scroll container that breaks ChapterMarker's `position: sticky`.
- RugShader stays a Fragment sibling of `.rr-canvas` at mat level — nesting it in the canvas leaves 114px gaps top/bottom.
- Keep `#cards.mat { background-image: none }` plus the `#cards::before` redrawn grid — the only way to layer the grid above the z:0 shader.
- `BASE_Y` card-fan offsets in CardFan.tsx are Figma-matched hand-tuned values — do not normalize to a curve.
- Keep `.rr-cards-tab` typography inlined at `'wght' 800` instead of `.t-btn1` (720) — lighter weight exposes Chrome's dotted-vs-solid underline width mismatch on the tabs.
- The deck-fan hand overlay must always clip past the mat bottom (generous negative bottom); never let it float inside the mat and never set `.rr-mat--secondary` overflow to visible.
- The story card's backseat recede uses the standalone CSS `scale:` property — `transform: scale()` would be overridden by Framer Motion's inline transform on the same element.
- `useExpand` stays in-flow — `<dialog>`/`showModal()` was tried and reverted; the rAF deferral on its click-outside listener is load-bearing.
- The `is-overlay-open` body class couples useExpand (setter) and useDominanceSnap.maybeSnap (reader) — rename or delete both sides together.
- Intro.tsx's `setTimeout(markEnlargedClosed, 550)` must equal the CSS close-cascade sum — change both sides together.
- Outcome ticker: never reintroduce CSS `@keyframes` on the track (races the JS loop); the coordinate fold needs BOTH halves — `scrollLeft += -trackX` on first user scroll, `trackX = -(scrollLeft mod segW)` on idle — and velocity must stay 0 throughout 'scrolling' mode.
- Ticker hover-out keeps `CRUISE_SPRING` (~12% overshoot) — a documented user-requested deviation from bounce:0, shared with /marks autoScroll, so any retune affects both.
- Keep `overscroll-behavior-x: contain` on `.rr-outcome-ticker`.
- RR cards use route-scoped `--rr-card-shadow-*` tokens, never the global elevation ladder — globals are calibrated for cream paper, these for the dark rug shader.
- The RugShader GLSL palette is coupled to rr.css card surfaces, text contrast, and shadow alphas — changing any color requires re-checking all three.
- The mobile nav-sled override `.route-rr .nav-sled` exists because rr's mobile mat margin breaks the shared sled formula — delete only if the margin returns to `-sheet-bleed`; add no other per-route marker positioning (the measured-pair approach was deleted in v0.30.0).
- Mobile cards canvas transform keeps its `!important` (beats the sweeping `.route-rr .rr-canvas` reset) and its term split: scaled px inside the calc's first term, the eyeballed physical lift outside — don't merge them.
- The interface tab never escapes the scaled cards canvas — constant chrome between tabs is the contract; reposition content in canvas-px instead, and recompute the accordion's viewport-derived max-height if notes canvas-y, pill height, or scale change.
- Mobile mechanics z ladder is fixed and tight (board 4 / open rail 5 / tab 6) — any new positioned sibling in `.rr-mech-family` must land outside that band.
- The mobile matchMedia gates (rules first-visit auto-open skip, one-tap-open-on-first-visit, end-of-game auto-scroll skip) must stay — each reinstated behavior fights the flowed mobile layout.
- Intro mobile: North Star's `margin-top: calc(-123px + var(--space-8))` is paired with `HIDDEN_OPEN_H` in Intro.tsx (recompute both together) and its transition stays on `--ease-snap` to match Framer's height curve.
- Mobile `#intro` North Star keeps explicit `z-index: 1` below the constraints card's 3, and `.rr-north-star-card::before` relies on the card keeping `z-index: var(--rr-z-game)` to contain its stacking context.
- StoryCard `measure()` divides offsets by `cr.width / card.offsetWidth` (scale correction) and the SVG keeps vbX=0 — removing either misplaces the dotted path; keep the ResizeObserver (deck-fan image load shifts geometry after fonts.ready).
- `.rr-mat--secondary`'s mobile height formula is locked to the storycard's 384×688 aspect — changing card dimensions requires recomputing both the scale denominator and the height calc.
- Keep `.rr-canvas .img__inner { opacity: 1; animation: none }` — the Img materialize keyframe stalls under useMatSettle's scroll-linked transform ancestors.
- `object-fit` for CardFan and interface images goes on `.img.<class> .img__inner` — setting it on the wrapper span is a no-op.
- Never give the deck-fan Img `placeholder='color'` — the asset is transparent; a color placeholder bleeds a dark rectangle through every pixel.
- Mechanics card tab-toggle rotation lives on the standalone `rotate:` property (and the deck-fan slide-out on `translate:`) so both compose with useMatSettle's inline transform — don't consolidate onto `transform:`.
- Rules first-visit auto-open keeps its single-fire IntersectionObserver (threshold 0.6) with a one-way open cue — scroll listeners fire continuously and re-open after dismissal.
- `.rr-canvas--outcome` stays at height 860px (not 900) — the trim lifts the bottom ticker into the reading band.
- The 'only test' underline and the descent to North Star are one arc-length-parameterized SVG path; keep `text-decoration` suppressed on the link or a second misaligned dotted line stacks on the SVG.
- `.rr-rules-rail__tab-inner` keeps `text-decoration: none` and `::after { display: none }` — under `writing-mode: vertical-lr`, t-btn1's decoration renders as a stray vertical line.
- Constraints-card title keeps `line-height: 1.3` with asymmetric padding `8px 0 4px` — Google Sans Flex caps sit high; symmetric padding reads top-aligned.
- The three rr decorative fonts stay `next/font/local` with `preload: false` — never reintroduce a fonts.googleapis.com link.
- Do not reinstate any rejected approach: mat resize model, per-session scroll lock at p=1, flex-centering of the mech family, CSS-keyframe ticker, Framer drag for the mobile rules strip, sticky full-width rules caption, `<dialog>` overlays, mount-time setTimeout for rules auto-open.
