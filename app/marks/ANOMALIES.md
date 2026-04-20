# /marks — anomalies

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/marks/`. Update it when an
architectural decision changes — not on every edit.

For route intent and philosophy see `app/marks/DESIGN.md`. For project-level
rules see `CLAUDE.md`.

---

## Route sits outside the (works) shell

`/marks` is at `app/marks/`, **not** `app/(works)/marks/`. It is a continuous
editorial document, not a sheet-stack project, and must not inherit the works
workbench chrome.

Consequences:

- `app/marks/layout.tsx` is standalone — no 8px viewport frame, no workbench
  padding, no `TransitionSlot`, no `ProjectMarker`. Only the `ExitMarker` pill
  is reused.
- `app/(works)/ShellNav.tsx` and `app/(works)/TransitionSlot.tsx` have **no**
  `marks` wiring and should stay that way. If a future pass needs `/marks` to
  participate in the works transition choreography, that's a re-architecture
  (moving the route back under `(works)/`), not a one-line addition.
- `nav.css` is imported directly from the marks layout because it used to come
  from the works shared layout. Keep that import if EXIT pill / `.nav-icon`
  styles are touched.

---

## Route-local marks, not shared

The six mark SVG components live at `app/marks/components/marks/`, not at
`app/components/marks/`.

Per [CLAUDE.md](../../CLAUDE.md): *"A primitive moves into shared the **second**
time it's needed, not the first. Flag the move before doing it."* There is
currently exactly one consumer — `/marks` itself. `/selected`'s archive
references a few of the same project names (Ecochain, Codezeros, Slangbusters)
but draws colored bars and text, not the mark artwork. That's name reuse, not
primitive reuse.

**When to promote:** if a landing-page spotlight, a site-wide tooltip, or any
second route genuinely needs to render the mark artwork, flag the move and
promote to `app/components/marks/` at that point — update all imports in
`app/marks/` and add a `LIBRARY.md` entry noting the promotion.

---

## The six marks

Inventory lives in `data/marks.ts`. Entry shape per mark: `id`, `name`, `year`,
`story`, `palette` (with optional `stopMid` for gradient smoothing),
`previewColor`, `slides[]`. The first slide MUST be `{ kind: 'mark' }` —
that renders the hero SVG at editorial scale; later slides are supporting
media (`kind: 'image' | 'gif'`) or flipped-mark placeholders until real
media lands. Slide media paths follow `public/marks/<id>/NN.ext` with
filename ordering preserved.

Essay reading order is encoded by array order: divider (Furrmark/Aleyr) →
wordmarks (Codezeros, Slangbusters, Beringer) → glyphs (Ecochain, Kilti).
Reordering the array re-lays the Essay preview row.

Source SVGs ship in `app/marks/_source/` (underscore prefix — Next.js App
Router ignores it at routing time). Temporary — removed once the route ships.

---

## Don't-touch list

- `.route-marks` class on the top-level wrapper — all route-local CSS tokens
  are scoped to this selector in `marks.css`. Removing or renaming it strips
  every token from the subtree.
- `<Background />` sits at the top of the route's JSX and renders a `fixed`
  layer at `z-index: 0`. Every phase should stay at `z-index: 1` so the
  background reads through but never covers content.
- Title dock (`components/MarksTitle.tsx` + marks.css): the hero title is
  driven by a scroll-listener-written CSS custom property `--marks-s`, not
  framer-motion. The framer-motion path produced SSR `NaN` hydration
  mismatches on first render. Do not port it back.
- Per-section reveal latch: `data-settled="true"` flips at `p ≥ 0.85` and
  releases at `p ≤ 0.60`. The hysteresis gap is deliberate — narrowing it
  causes visible flicker when a section parks mid-reveal.

---

## scrollGlide — singleton rAF tween

`lib/scrollGlide.ts` is the route's paper-physics programmatic scroller, used
by `MarksTitle.handleActivate` (grid-back), `Essay` preview-click jumps, and
`MarkSection.advanceToNextMark` slide-wrap. Do not replace calls with
`window.scrollTo({ behavior: 'smooth' })` — the browser's smooth-scroll
easing does not match `--ease-paper`, and the two easings side-by-side on
the same route read as inconsistent motion.

Module-scope singleton `activeRaf` + `activeCancel` is load-bearing: if two
glides overlap (a user clicks a preview while `onWrap` is already gliding),
the first is cancelled so the second starts from current `scrollY`. Removing
the singleton produces a tug-of-war.

---

## Title reel-roll runs below motion vocabulary

`.marks-title` `:hover` color (0.3s), `.marks-title__cell` width (0.4s), and
`.marks-title__slot` transform (0.4s) sit below the 0.5–0.9s "paper" range
in CLAUDE.md. The reel-roll is intentionally mechanical — it reads as a
shutter/reel on a film projector, not a settle. Longer durations turn it
into a slow morph that fights the scroll-driven pace. Keep as-is.

---

## Clone-and-teleport infinite reel

The tail of the document is two 100vh sections, `BlankSection` and
`HeroClone`, that together close the loop. The pattern is the same one
used by slider libraries (Embla, Swiper, keen-slider): place a visual
duplicate of the start at the end, then swap scroll position silently
while the duplicate is on screen. Three components cooperate:

1. **HeroClone.tsx** fires the teleport. It uses `useDominanceSnap`'s
   `onDocked` callback — when the clone's top crosses into ±2px of the
   viewport top, it runs `window.scrollTo(0, 0)`. Instant, no animation.
   An `armedRef` requires one observation of the clone off-dock (top
   offset > 8px) before firing, so a restored scroll position near the
   clone on page-load can't accidentally teleport on mount. The 8px
   threshold (rather than > 2px matching the dock band) absorbs sub-pixel
   jitter around the dock without requiring the user to scroll
   meaningfully away to re-arm.
2. **Background.tsx** treats `.marks-blank` and `.marks-hero-clone` as
   dominance candidates alongside `.marks-section`. Blank paints the
   pure-black palette; the clone paints `HERO_PALETTE` — the same palette
   as the real Hero at `y=0`. By the time the clone is docked, the fixed
   background already matches the destination.
3. **MarksTitle.tsx** drives `--marks-s` from `distToNearestHero(y)`, not
   `scrollY` directly. The function measures the nearer of two anchors —
   the real Hero at `y=0` or the HeroClone at its page-top — so
   `--marks-s` reads 0 (big hero state) at **both** anchors. The title
   therefore looks identical on both sides of the teleport, leaving no
   visual artifact to betray the jump. Graceful-degradation invariant:
   when no `.marks-hero-clone` element exists (pre-mount, or a future
   short-viewport opt-out) the helper returns raw `y`, so the dock math
   still works from the real Hero alone.

All three pieces are co-authored. Touch one, verify the other two. In
particular: if the clone's CSS class changes, update both Background's
selector list and MarksTitle's `distToNearestHero` lookup.

The reader can't scroll up from the real Hero because the browser has
nothing above `y=0` — the reel only goes forward, and the infinity is
real from the reader's perspective.

---

## MarkSection horizontal nav thresholds

Wheel / touch / keyboard constants in `MarkSection.tsx`:

- `WHEEL_THRESHOLD = 30` (min |deltaX|) and `WHEEL_COOLDOWN_MS = 400` — tuned
  against trackpad inertia so a single flick advances one slide, not three.
- `TOUCH_THRESHOLD = 40` — minimum horizontal drag before a swipe registers.
  Below this, accidental sideways motion during vertical scroll fires.
- Keyboard arrows (ArrowLeft / ArrowRight) are bound on `window` but gated
  by `active` so only the dominant mark consumes them. Bounded within the
  mark via modulo — no cross-mark hop.

All three input paths (wheel, touch, keyboard) route through the same
`nudge()` which calls `pauseForInteraction()` → 12s idle-resume via
`useShowcaseTimer`. Leaving this out lets auto-advance fight user intent.

---

## Showcase timer — two pause sources with different semantics

`useShowcaseTimer` exposes `clickPaused` and `hoverPaused` separately. Both
halt the JS tick (combined as `paused`), but CSS reads them independently on
the paginator via `data-click-paused` / `data-hover-paused`:

- **Click-pause** — "I've seen this / I jumped here." Fill locks to `scaleX(1)`
  (consumed). Auto-releases after `idleResumeMs` (12s). Triggered by paginator
  click, wheel, swipe, keyboard arrows.
- **Hover-pause** — "I'm reading." Fill freezes in place via
  `animation-play-state: paused`. JS tick freezes via deadline tracking
  (`remainingRef` + `deadlineRef` in the hook) so the slide resumes from
  where it stopped when the cursor leaves — no idle-resume delay.

Deadline tracking is load-bearing: the tick effect's cleanup computes
remaining time from `deadlineRef - performance.now()`. If the effect is
refactored to re-schedule from `slideMs` every run, hover-pause reverts to a
reset, not a freeze.

Hover listeners live on the `.mark-chrome` block (paginator + divider +
caption + year), not on the full `<section>`. Hovering the mark artifact
itself does **not** freeze — the freeze is specifically for reading the
caption/paging, which is where lingering intent lives.

---

## MarkChrome active-dot remount key

`MarkChrome.tsx` keys the active paginator dot as `active-${index}-${active ? 'on' : 'off'}`
while inactive dots use stable `inactive-${i}` keys. This forces React to
remount the active dot on **both** slide change and section-becomes-dominant
transitions, which restarts the CSS fill animation from `scaleX(0)`. The
`active` flag in the key is load-bearing: without it, the fill animation
completes on mount for every section and lands at `scaleX(1)` (forwards fill
mode) before the reader arrives — making auto-advance handoffs land on a
pre-filled pill. The animation is also CSS-gated by `[data-active-section='true']`
for the same reason.

---

## Dominance-based landing-snap (not CSS scroll-snap)

`components/hooks/useDominanceSnap.ts` is the shared scroll-idle snap
engine consumed by every full-viewport section — `MarkSection`,
`BlankSection`, and `HeroClone`. On 150ms scroll idle, if the section's
visibility ratio is ≥ 0.72 (DOMINANCE_RATIO) AND it isn't already docked
(|rect.top| > SNAPPED_TOL_PX = 2), glide to the section top via
`scrollGlide(--dur-settle)`.

Load-bearing choices:

- **Dominance, not velocity.** An earlier version gated on peak velocity
  to distinguish "flick that decayed near a boundary" from "deliberate
  slow positioning." That broke the case users actually want: a slow
  scroll that lands with a mark 85% visible still needs to snap, because
  the mark content is designed to fill 100vh — off-dock positions inside
  a mark aren't meaningful. Dominance-only captures both the flick case
  (decay ends dominant → snap) and the slow case (drag ends dominant →
  snap) without needing to guess intent from velocity.
- **The 72% threshold is the "mark takes over" line.** Below 72% nobody
  is dominant — 50/50 midpoints between two marks are a valid rest
  state by design. A user who stops exactly between two marks meant to
  stop there. If the mid-state feels too sticky in practice, consider a
  direction-aware tiebreak (snap toward last scroll direction) rather
  than lowering the threshold — lowering captures legitimate "both in
  view" reading positions.
- **Idle debounce, not scroll-time.** Snap fires 150ms after the last
  scroll event, not during scroll. This means the browser's natural
  momentum decay completes first, then we paper-glide from rest to
  dock. Firing during scroll would fight momentum.
- **`gliding` flag prevents re-snap feedback.** The tween's own scroll
  writes would otherwise restart the idle timer. The flag is released
  after `--dur-settle + 80ms` so the next real scroll re-arms the
  detector.
- **CSS `scroll-snap-type` was considered and rejected.** Native
  proximity snap hands easing to the browser — the landing glide would
  no longer use `--ease-paper` and would visibly mismatch paginator-click
  / slide-wrap-advance glides. The JS version trades implementation
  simplicity for motion-vocabulary consistency.

Keyboard page-scroll (spacebar, PageDown, arrow keys) participates
automatically: it's just a scroll event, subject to the same dominance
check on idle.

Consumer callbacks (load-bearing contract):

- `onScroll(el, rect, vh)` — per-frame hook for consumers to write scroll-
  linked CSS custom properties without spinning a second scroll listener.
  MarkSection writes `--mark-p` / `--mark-v` / `data-settled` here.
- `onDocked()` — edge-triggered once each time `rect.top` crosses into
  ±SNAPPED_TOL_PX from outside. **Fires on both snap landings and manual
  precise stops** — HeroClone relies on this so a user who slow-scrolls
  exactly to the clone top still wraps. `gliding` suppresses `maybeSnap`
  but not `onDocked`, by design.

Reduced-motion contract: `prefers-reduced-motion: reduce` short-circuits
`maybeSnap` but leaves `onScroll` / `onDocked` running. Reduced-motion
users keep scroll-linked reveals and get no auto-glide; a refactor must
preserve both halves.

Constants live at the top of `useDominanceSnap.ts` (`IDLE_MS`,
`DOMINANCE_RATIO`, `SNAPPED_TOL_PX`). Changing them affects all three
consumers.

---

## Paginator click glides at --dur-settle, not --dur-glide

`MarkSection`'s `onJump` reads `--dur-settle` (500ms) from `:root` and
passes it to `scrollGlide` — faster than the 800ms `--dur-glide` default
used by `advanceToNextMark` and the Essay preview jumps. A paginator click
is a direct UI response and needs to resolve inside attention; the auto-
advance handoff is cinematic and takes the longer glide. Do not unify.

---

## Showcase timer ticks on single-slide marks

`useShowcaseTimer` guards `total < 1`, not `total <= 1`. A mark with exactly
one slide still ticks, because its only role is to fire `onWrap` after
`slideMs` — that's how `MarkSection` hands off to the next mark. If a
future refactor tightens this back to `<= 1`, single-slide marks will
park the reel indefinitely.

---

## Responsive anomalies

`/marks` is built responsive-ready (per CLAUDE.md). The mobile pass lives in
one `@media (max-width: 767px)` block at the end of `marks.css`. Documented
deviations / drop-outs:

- **Title scale** uses a breakpoint-scoped linear formula
  (`calc(56px - 32px * var(--marks-s))`) rather than `clamp()`, because the
  dock interpolation is a derived value from `--marks-s` (scroll position)
  × a size range. `clamp()` only handles one axis at a time; breakpoint-
  scoped per-viewport formulas keep the dock math readable.
- **Essay preview rows** flip to `flex-direction: column` with a 48 px gap.
  Desktop `gap: 435px` (glyph row) does not scale — a mobile-specific layout
  is the clean path here, not a recomposition.
- **Blank + Hero-clone stay at 100vh** on every viewport. They are
  dominance candidates for the wrap-on-dock teleport — shrinking them
  would push visibility below `DOMINANCE_RATIO` (0.72) on tall viewports
  and make the wrap unreachable. Left alone deliberately.
- **Mark carousel + chrome** already use `min(…vw, …px)` / `min(100%, …px)`;
  no mobile override needed.
- **No tucked pill** — `/marks` does not use the `ProjectMarker` /
  `ChapterMarker` shell. The `MarksTitle` itself is the nav; it already
  docks to `--marker-top` at any viewport width.
