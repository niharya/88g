# /marks — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/marks/` are touched.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale, what-breaks, rejected approaches. Intent/philosophy: [`./DESIGN.md`](./DESIGN.md). This digest is the seatbelt; the archive is the manual. Read the archive section before structurally changing anything an item below names.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Don't-touch digest

- Route lives at `app/marks/` OUTSIDE `(works)/` — never add marks wiring to ShellNav.tsx or TransitionSlot.tsx; pulling /marks into works choreography is a re-architecture, not a one-line add.
- `app/marks/layout.tsx` must keep importing `app/components/nav/nav.css` AND `NavMarker/navmarker.css` — EXIT/`.nav-icon` styles no longer arrive via the works layout.
- EXIT uses route-local `MarksExitMarker` + shared CrossShellVeil: timing is owned by `useCrossShellNav('/all?cases')`, and the veil ID `cross-shell-veil` is a cross-route contract — don't consolidate into the shared ExitMarker or duplicate timings locally.
- In `data/marks.ts` the first slide of every mark MUST be `{ kind: 'mark' }`, and array order IS the Essay reading order — reordering also invalidates `FIRST_MARK_ID` in autoScroll.ts.
- Video slides must keep `muted` + `playsInline` (iOS blocks autoplay / goes fullscreen without them) and keep `loop` (the showcase timer cuts slides, not onEnded).
- Never remove or rename the `.route-marks` wrapper class — every route-local CSS token is scoped to it.
- Background is `position: fixed; z-index: 0`; all phases stay at `z-index: 1` via source order — adding z-indexes or stacking contexts on sections severs layering and blend modes.
- The title is TWO cooperating elements — HeroText.tsx (hero presentation, writes `--hero-recede`) and MarksTitle.tsx (always-docked marker, reads it) — do NOT reintroduce a single morphing title element.
- `data-settled` hysteresis in MarkSection.tsx (in 0.85 / out 0.60) is deliberate — narrowing the gap causes flicker when a section parks mid-reveal.
- All programmatic scrolls go through shared `scrollGlide` (`app/lib/scrollGlide.ts`) — never `window.scrollTo({behavior:'smooth'})`; its singleton cancel prevents overlapping-glide tug-of-war.
- Title reel-roll durations intentionally sit BELOW the paper tier — it reads as a shutter, not a settle; keep as-is.
- BlankSection + HeroClone + Background are co-authored for the clone-and-teleport loop — touch one, verify the other two; if the clone's CSS class changes, update Background's dominance-candidate selector list; HeroClone's `armedRef` 8px re-arm threshold is deliberate.
- MarkSection input constants are tuned (wheel 30 / cooldown 400 / touch 40) and every gesture must route through `nudge()` → `pauseForInteraction()` or auto-advance fights the reader.
- useShowcaseTimer's deadline tracking (`remainingRef` + `deadlineRef`) is what makes hover-pause a FREEZE — re-scheduling from `slideMs` on every effect run silently regresses it to a reset; hover listeners belong on `.mark-chrome` only.
- MarkChrome's two-level key split — stable `key={i}` on each li, inner fill span keyed on `${index}-${active}`, plus the `[data-active-section]` CSS gate — prevents both the width-transition snap and premature fill completion; keep all three.
- useDominanceSnap is SHARED (`app/components/hooks/`) — constant changes also hit /biconomy and /rr Sheet chapters; don't replace with CSS scroll-snap; `onDocked` fires on manual docks too (HeroClone's wrap depends on it); reduced-motion disables snap but must keep onScroll/onDocked running.
- Paginator clicks glide at `--dur-settle`; auto-advance wrap and Essay preview jumps glide at `--dur-glide` — do not unify the tiers.
- Outro is veil-only: fade in → `scrollTo(0,0)` under cover → inline intro hand-off (mirrors startAutoScroll's body; the public call no-ops on running) → fade-out over the hero hold; `VEIL_FADE_IN_MS` must stay in sync with the `--marks-veil-in` CSS token.
- MarkSection gates both useShowcaseTimer AND MarkChrome's fill key with `active && !autoScrolling` via subscribeAutoScroll — removing the gate skips Furrmark's first slides and shows a pre-emptied fill.
- Auto-scroll short-circuits on `prefers-reduced-motion` AND `pointer: coarse` — the manual HeroClone.onDocked path must keep closing the loop for those readers.
- useShowcaseTimer's guard is `total < 1`, NOT `<= 1` — single-slide marks must still tick so onWrap hands off the reel.
- Video dwell wiring: MarkCarousel's preloader must keep its `onLoadedMetadata`, and `slideMsFor`'s identity must bump with `durationsVersion`; keep the video min-size/background CSS so pre-metadata videos have a footprint.
- `scrollAccum` in autoScroll.ts is load-bearing — at the slow cruise rate per-frame deltas fall below scrollBy's rounding floor; never simplify to `scrollBy(0, dy)`; stopAutoScroll must reset it.
- Cursor-movement slowdown must ride `CRUISE_SPRING` in BOTH directions — raw `velocity.set` reads as a step; CRUISE_SPRING's ~12% overshoot is a documented bounce:0 deviation shared with /rr.
- HeroText must keep its subscribeOutroVeil lock (parks `--hero-recede` at 0 while the veil is opaque); its two stage formulas anchor to `.marks-essay`'s bounding rect, so moving the essay's geometry shifts when the recede engages.
- Mobile kills `mix-blend-mode` (Safari/Chrome isolation groups sever it) and re-injects each mark's ink via per-`data-mark-id` rules that MUST mirror `previewColor`/`previewAccent` in data/marks.ts — never re-enable overlay on mobile.
- All phase heights use `svh` (never `vh` or `dvh` — iOS URL-bar resize fights the snap engine) while JS deliberately reads `window.innerHeight`; don't switch JS to visualViewport.height without re-deriving the dominance threshold.
- BlankSection and HeroClone must stay full-viewport (100svh) so their visibility can clear `DOMINANCE_RATIO` for the wrap-on-dock teleport.
- iOS safe-area `max()` overrides live on `.exit-marker` (top/right) and `.mark-chrome` (bottom) — if either element moves to a new selector, mirror the `env(safe-area-inset-*)` overrides there.
- Mobile hero title wraps to two lines via the `.marks-hero-text__break` span flipping to `display: block` — keep HeroText's three-span structure.
- Mobile Essay preview rows are an authored recomposition (flex row + wrap, asymmetric gap so wrapped Beringer reads as its own line) — don't column-stack them; the mobile glyph standardization is accepted-cost authored, including Codezeros rendering thin.
- Aleyr/Furrmark is the canonical mark-view composition — change the primitive there first, never fork a per-mark variant.
