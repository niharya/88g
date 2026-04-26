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
  padding, no `TransitionSlot`, no `ProjectMarker`. Only the `ExitMarker`
  is reused.
- `app/(works)/ShellNav.tsx` and `app/(works)/TransitionSlot.tsx` have **no**
  `marks` wiring and should stay that way. If a future pass needs `/marks` to
  participate in the works transition choreography, that's a re-architecture
  (moving the route back under `(works)/`), not a one-line addition.
- `nav.css` is imported directly from the marks layout because it used to come
  from the works shared layout. Keep that import if EXIT marker / `.nav-icon`
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
media (`kind: 'image' | 'video'`) or flipped-mark placeholders until real
media lands. Slide media paths follow `public/marks/<id>/NN.ext` with
filename ordering preserved.

Video slides render a plain `<video autoPlay muted loop playsInline>` in
`MarkCarousel.tsx`. `muted` and `playsInline` are load-bearing for iOS —
without them Safari blocks autoplay or takes the video fullscreen. Do not
drop them. Video files live alongside stills in `public/marks/<id>/NN.mp4`.

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
- Title system is **two cooperating elements**, not one morphing element.
  `HeroText.tsx` owns the big 120px hero presentation at 37vh; `MarksTitle.tsx`
  owns the always-docked 24px marker at `--marker-top`. HeroText writes
  `--hero-recede` (0 → 1 over the first 60vh of scroll) to the `.route-marks`
  wrapper; both consume it via CSS (HeroText fades out + grows a text-shadow
  halo; MarksTitle fades in). Do NOT reintroduce a single morphing element —
  the earlier `--marks-s` interpolation conflated two responsibilities (the
  hero visual moment and the docked nav marker) and made both harder to reason
  about. The `--hero-recede` inverse-fade keeps the two elements from
  competing for attention when they would otherwise overlap at y=0.
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
3. **OutroVeil.tsx** covers the teleport for the autonomous reel. Outro
   no longer cruises through Blank / HeroClone — it fades a black overlay
   to opaque, teleports, then fades back. See "Outro veil" below for the
   full timeline. The manual path (reader coasts in under their own power)
   still routes through HeroClone.onDocked.

All three pieces are co-authored. Touch one, verify the other two. In
particular: if the clone's CSS class changes, update Background's
selector list to match.

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

## MarkChrome paginator — two-level key split

`MarkChrome.tsx` uses **stable `key={i}` on each `<li>`** so the dot's
`width` transition runs smoothly when the active dot moves (circle → pill
and back). The fill-animation restart lives on an **inner keyed `<span
className="mark-chrome__dot-fill" key={`${index}-${active ? 'on' : 'off'}`} />`**
— remounting the inner span restarts the CSS fill animation from `scaleX(0)`
without tearing down the outer dot that owns the width transition. The
`active` flag in the inner key is load-bearing: without it, the fill would
complete on mount for every section and land at `scaleX(1)` (forwards fill
mode) before the reader arrives. The animation is also CSS-gated by
`[data-active-section='true']` for the same reason.

The earlier design keyed the entire `<li>` on slide change, which remounted
both the old-active and new-active dots — the width transition never had
matching endpoints to tween between, producing a visible snap. The
two-level split is what fixes the snap.

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

## Credits-reel auto-scroll — intro scroll + outro veil

`lib/autoScroll.ts` + `components/AutoScroll.tsx` drive two cinematic
transitions, mediated by a `mode` argument to `startAutoScroll`:

- `'intro'` — Hero → Furrmark (first mark). Fires 1.5s after the route
  mounts. Ticks scroll at `RATE_VH_PER_S` (3.5 vh/s) through a velocity
  spring. Stops permanently when Furrmark's section top reaches the
  viewport. Mark machinery (showcase timer + advanceToNextMark +
  dominance snap) owns everything from there through Kilti.
- `'outro'` — **Not a scroll cruise.** A veil-only timeline: fade a
  black overlay to opaque (900 ms), `scrollTo(0, 0)` silently under the
  cover, then hand off to intro (which holds 1500 ms on the Hero before
  beginning) while the veil fades back out (700 ms). Total wall-clock
  from Kilti's last-slide wrap to the real Hero becoming visible again:
  ~1.6 s. Fires when Kilti's `useShowcaseTimer.onWrap` runs inside
  `advanceToNextMark` and detects "no next mark".

Why two different mechanisms: the old outro cruised scrollY through
Blank + HeroClone at 3.5 vh/s, which read as ~28 s of dead black. Filmic
cuts are faster — the veil gives the reel a punctuating "blackout →
hero-reveal" beat instead of a long flat scroll. Intro stays as a
cruise because the reader is reading while it runs (it carries them
from the Hero into the first mark, which is an earned introduction,
not a chapter break).

Why intro and outro don't run inside mark sections: intra-mark motion
is a composed system — slide auto-advance, dominance snap, paginator
jumps, and paper-glided wrap-advance each want exclusive `scrollY`
ownership for their easing to land. Outro's veil doesn't nudge scroll
at all, so it composes cleanly with the mark machinery that was still
paused just before Kilti wraps.

Four pieces of coordination (intro mode):

1. **Train-start spring on (re)start.** Velocity springs from 0 to
   `RATE_VH_PER_S` via `CRUISE_SPRING` (shared with /rr Outcome — see
   `app/lib/motion.ts`). Perceptible ~12% overshoot, no elastic ringing.
   Linear ramps read mechanical; the spring reads as a reel starting.
   Applies on every resume — mount, pause-release, glide-release, tab
   return, and the outro → intro hand-off. This is a deliberate deviation
   from CLAUDE.md's paper-motion `bounce: 0` rule — see `CRUISE_SPRING`
   in `app/lib/motion.ts`.

2. **Intro stop target.** Each tick queries `introStopTop()` — Furrmark's
   document-space top. When `scrollY >= target - 2`, intro calls
   `stopAutoScroll()`. DOM query per-frame is fine — one selector lookup,
   sections exist for the whole route lifetime after hydration.

3. **Yields during `scrollGlide`.** Programmatic glides (essay preview
   jump, grid-back, mid-reel paginator click) need exclusive scrollY
   ownership so ease-paper lands cleanly. `scrollGlide.isGlideActive()`
   is polled each frame; while it's true, velocity springs back down
   to 0 and the tick skips. On release, velocity springs back up —
   same train-start kick.

4. **User input pauses for `COOLDOWN_MS` (500ms).** `AutoScroll.tsx`
   binds window-level wheel / touchstart / touchmove / keydown and calls
   `pauseAutoScroll()` on any of them. After the cooldown, velocity
   springs back up from 0 — the reel resumes from wherever the reader
   ended up. Keys that move the document (Space, PgUp/Dn, ArrowUp/Dn,
   Home, End) count; ArrowLeft / ArrowRight do not — those drive
   intra-mark slide navigation and shouldn't stop the reel.

Outro veil timeline (outro mode):

- `startAutoScroll('outro')` — marks `running = true`, calls `notify(true)`
  so MarkSection's showcase-timer gate stays closed for the entire
  transition, then `notifyVeil('opaque')` to start the CSS fade-in on
  `.marks-outro-veil`.
- After `VEIL_FADE_IN_MS` (900 ms): `scrollTo(0, 0)` — instant teleport
  under the opaque veil. `running` stays true across the swap so the
  showcase timer never briefly re-arms.
- Inline hand-off to intro: `mode = 'intro'`, reset `holdUntil` /
  `lastTime` / `velocity`, schedule `requestAnimationFrame(tick)`. The
  public `startAutoScroll('intro')` is NOT called here — its early-return
  on `running === true` would no-op; we mirror its body inline instead.
- `notifyVeil('hidden')` — CSS fade-out runs (700 ms) while intro holds
  on the Hero for 1500 ms. The reader sees the Hero emerge from black,
  holds the title moment, then the reel begins.
- `stopAutoScroll()` also clears `outroTimeout` and drops the veil back
  to hidden, so a route unmount or reduced-motion flip during the fade
  doesn't leave the screen covered in black.

BlankSection + HeroClone remain in the DOM. They are no longer part of
the autonomous reel — they're the manual-scroll fallback path. If the
reader scrolls past Kilti under their own power (faster than the auto-
advance would wrap), `HeroClone.onDocked` still fires the same teleport
+ intro re-arm without the veil.

Showcase-timer gate (`subscribeAutoScroll`): MarkSection subscribes to
auto-scroll's running state and passes `active: active && !autoScrolling`
into `useShowcaseTimer` AND into MarkChrome (for the dot fill animation
key). Without this gate: (a) Furrmark's first slide could tick past
before the reader arrives, landing them on slide 2 or 3; (b) the pill
fill animation would visually empty before the timer had started,
reading as a broken clock. The subscribe callback fires synchronously
with current state on subscribe, so mount-order doesn't matter.

Load-bearing constants in `autoScroll.ts`:

- `HOLD_MS = 1500` — hero hold before the intro reel starts. Matches
  the "the page looks like it's still loading" opening beat. The outro
  → intro hand-off re-uses this hold so the reader gets the same beat
  on every loop (Hero re-emerges from black, holds, then reel begins).
- `RATE_VH_PER_S = 3.5` — snail-slow credits pace, ~31px/s at 900px
  viewport. Intro only — outro does not cruise.
- `COOLDOWN_MS = 500` — "few microseconds, then continues" per the spec.
- `DT_CLAMP_S = 0.1` — bound per-frame dt so a tab-switch doesn't jolt
  the reel forward by seconds of accumulated time on the first tick
  after return.
- `FIRST_MARK_ID = 'furrmark'` — intro hand-off target. If the first
  mark is ever reordered in `data/marks.ts`, update this constant.
- `VEIL_FADE_IN_MS = 900` — outro fade-to-opaque duration. Fade-out is
  700 ms and lives in CSS (`.marks-outro-veil` transition-duration). The
  asymmetry is deliberate: fade-in needs a firm landing on opaque before
  teleport; fade-out rides over a 1500 ms hero-hold so it can breathe
  faster without rushing the reveal.

Reduced-motion contract: `startAutoScroll()` short-circuits entirely
under `prefers-reduced-motion: reduce` regardless of mode. Readers keep
the route fully navigable via manual scroll; the showcase timer is
already gated by the same media query; the manual HeroClone onDocked
fallback still runs, so the loop closes when the reader reaches the
clone on their own.

---

## Showcase timer ticks on single-slide marks

`useShowcaseTimer` guards `total < 1`, not `total <= 1`. A mark with exactly
one slide still ticks, because its only role is to fire `onWrap` after
`slideMs` — that's how `MarkSection` hands off to the next mark. If a
future refactor tightens this back to `<= 1`, single-slide marks will
park the reel indefinitely.

---

## Cursor-idle slowdown on the reel

`autoScroll.ts` drops the cruise from `RATE_VH_PER_S` (3.5 vh/s) to
`RATE_VH_PER_S_SLOW` (1.2 vh/s) while the reader's cursor is moving, and
returns to full speed only after `CURSOR_IDLE_MS` (450 ms) of no mousemove.

Load-bearing details:

- Both directions ride `CRUISE_SPRING` (shared with /rr Outcome ticker).
  `springUp()` animates `velocity` toward `targetRate()`; a raw `velocity.set`
  on either transition would read as a step change, not a settle.
- The idle timer resets on every mousemove — the reader must truly stop
  moving for 450 ms before the reel accelerates. This matters: a reader
  tracking the cursor along with the text should not fight with a reel that
  keeps resuming the instant they pause between words.
- Reduced-motion readers never enter this path — auto-scroll is off entirely.

If you change the slow-rate constant, also walk the subpixel accumulator
note below: at rates much under ~0.18 px/frame the accumulator is the only
thing keeping the reel moving on some engines.

---

## Subpixel scroll accumulator

`scrollAccum` in `autoScroll.ts` is load-bearing, not a micro-optimization.
At `RATE_VH_PER_S_SLOW` (1.2 vh/s) on a 900 px viewport the per-frame delta
is ~0.18 px at 60 fps — below the `window.scrollBy` rounding floor on some
browser engines. Without the accumulator the reel appears to freeze
entirely while the cursor is moving.

The tick accumulates fractional pixels into `scrollAccum`, flushes
`Math.floor(scrollAccum)` via `scrollBy`, and keeps the remainder. Do not
"simplify" this to `scrollBy(0, dy)` — that regresses the slow-rate path.

`stopAutoScroll()` resets the accumulator to 0 so a fresh intro doesn't
inherit sub-pixel debt from the previous run.

---

## HeroText two-stage fade + veil-lock

`HeroText` on the marks hero is a watermark that fades under the scrolling
essay. It exposes a CSS custom property `--hero-recede` (0 → 1) that drives
opacity between 1 and `WATERMARK_FLOOR` (0.12) — the essay reads on top, but
the hero title is still legible behind it.

Two stages, both anchored to the essay element (not the viewport):

- **Stage A** runs from essay-top-enters-viewport → essay-top-at-40%-of-viewport.
  Opacity falls from 1 to `WATERMARK_FLOOR`. This is the "drop well below
  20% by the time essay is ~40% in" behavior the spec calls for.
- **Stage B** runs from essay-bottom-enters-viewport → essay-bottom-leaves.
  Opacity falls from `WATERMARK_FLOOR` to 0. Hero is gone by the time the
  reader exits the essay.

**Veil-lock** is the non-obvious bit. During the outro (veil opaque →
teleport → intro re-arm), the essay geometry jumps. Without gating, the
stage math produces a visible flash as the hero title snaps from 0 back to
1 behind the black veil. `HeroText` subscribes to `subscribeOutroVeil` and
parks `--hero-recede` at 0 (fully visible) while the veil state is
`'opaque'` — the teleport happens while the veil hides the route, and the
two-stage math resumes only after `'hidden'` is broadcast. Do not remove
the veil subscription.

---

## Essay has no negative margin peek

The essay element sits at the natural document position immediately after
the hero — `margin-top: 0`. It scrolls *up into* the hero, not out of a
pre-placed anchor inside the hero.

Any historical notes referencing a `-13.78vh` (or `y=776` Figma) peek
position are obsolete. The earlier design had the essay sitting partially
inside the hero viewport at rest; the current behavior is that the essay
enters from below when the reader scrolls, which is why the two-stage
`HeroText` fade keys off essay-top-crosses-viewport rather than a static
offset.

---

## Boot gating — `.route-marks` joins `.fonts-ready`

`/marks` is the first non-workbench route to opt into the global
`.fonts-ready` opacity gate on `<html>`. Reason: on hard reload the
startooth (which boots before fonts) was visually competing with the
`MarksTitle` "MARKS AND SYMBOLS" lockup painting in its fallback face.

Two things had to land together for the clean boot:

- `.route-marks` is included in the `.fonts-ready` opacity selector in
  `globals.css` so marks content is hidden until fonts resolve — startooth
  alone on the black field until ready.
- `:root:has(.route-marks) { background: #000 }` in `globals.css` flips the
  html background to black for the duration of the route. Without it the
  browser's first paint flashes the default light paper behind the boot
  mark. The `#000` literal is deliberate — see the comment block in
  `globals.css` (there is no token for pure black; the grey scale bottoms
  at `#141414`).

If a future dark route needs the same boot hygiene, model it on the marks
block rather than inventing a parallel pattern.

---

## Responsive anomalies

`/marks` is built responsive-ready (per CLAUDE.md). The mobile pass lives in
one `@media (max-width: 767px)` block at the end of `marks.css`. Documented
deviations / drop-outs:

- **Hero title splits to two lines on mobile** (`MARKS &` / `SYMBOLS`) at
  `clamp(48px, 16vw, 80px)` with `letter-spacing: -0.03em` and
  `line-height: 0.95`. Implementation: `HeroText.tsx` renders three spans
  (line / break / line); the `.marks-hero-text__break` span flips to
  `display: block` inside the mobile media query to force the wrap, while
  desktop ignores the break and renders the lockup on one line. Single-line
  at 56px overflowed below ~390px viewports, and shrinking further made the
  watermark feel decorative — the two-line stack keeps editorial scale.
- **Essay preview rows recompose, don't column-stack.** Mobile sets
  `flex-direction: row; flex-wrap: wrap; justify-content: center` with
  asymmetric `gap: 64px 48px` (row > column). Wordmarks pair Codezeros +
  Slangbusters on row 1 and Beringer wraps centered to row 2; glyphs pair
  Ecochain + Kilti. The 64px row-gap is deliberately larger than the 48px
  column-gap so the wrapped Beringer reads as a distinct line, not a third
  item crammed under the pair. Caption + preview vertical rhythm uses 80px
  (vs desktop 120px) so a 375px viewport doesn't feel cavernous between
  blocks.
- **Mark-section glyph sizes are standardized on mobile.** Wide marks
  (codezeros, slangbusters, beringer) all render at width 230px (matching
  Slangbusters' natural mobile width); squarish marks (furrmark, ecochain,
  kilti) all render at width 120px (matching Ecochain). Both also reset
  `height: auto` because the desktop rules pin the opposite axis. Side
  effect: Codezeros's 7.8:1 aspect renders quite thin (~29px tall) at
  width 230px — accepted as the cost of the standardization.
- **Essay preview-btn at rest sits at `opacity: 0.8`** and lifts to 1.0
  on hover/focus. Marks read a touch quieter against the dark field at
  rest; hover/focus brings them back to full presence. The opacity
  transition rides `--dur-slide` + `--ease-paper` alongside the existing
  color transition. Removing the dim would re-balance the essay rhythm
  toward "marks dominant" — not the intended editorial weight.
- **Phase heights use `svh`, not `vh`.** `--marks-hero-h`, `--marks-section-h`,
  `.marks-essay min-height`, `.marks-blank` / `.marks-hero-clone min-height`,
  the hero text `top`, and the carousel `max-height` all use `svh`. Reason:
  iOS Safari's URL bar collapse/expand resizes `vh` mid-scroll, jumping
  every section and fighting the dominance-snap engine. `svh` is the small
  viewport — stable across URL bar state. `dvh` would resize dynamically
  (same problem as `vh`), so don't switch to it. The dominance ratio is
  preserved because `useDominanceSnap` uses `window.innerHeight` at runtime,
  which scales with the section together.
- **Blank + Hero-clone are still full-viewport** (now `100svh`). Dominance
  candidates for the wrap-on-dock teleport — they need to fully fill the
  small viewport so visibility climbs past `DOMINANCE_RATIO` (0.72).
- **Mark carousel media** caps at `min(70vw, 900px)` desktop / `min(86vw, 900px)`
  mobile. The mobile override prevents the artifact from feeling cramped at
  narrow widths (70vw of 375px = 262px); border + tilt unchanged.
- **No tucked marker** — `/marks` does not use the `ProjectMarker` /
  `ChapterMarker` shell. The `MarksTitle` itself is the nav; it already
  docks to `--marker-top` at any viewport width.
- **Auto-scroll opts out on coarse pointer.** `startAutoScroll` short-circuits
  on both `prefers-reduced-motion: reduce` AND `pointer: coarse`. On touch
  devices the cinematic reel fights the reader's natural scroll gesture and
  the cursor-idle slowdown never engages (no mousemove). The HeroClone
  teleport still closes the loop manually.
- **iOS safe-area insets on EXIT + mark chrome (mobile only).**
  `.exit-marker` overrides `top` / `right` to `max(<token>, env(safe-area-inset-*))`
  and `.mark-chrome` overrides `bottom` to `max(32px, env(safe-area-inset-bottom))`.
  `max()` falls through to the existing tokens on devices without insets, so
  non-iOS browsers see no change. Without these, the EXIT label can sit under
  the iPhone notch in landscape, and the paginator chrome can collide with
  the home indicator. If a future change scopes the EXIT marker outside
  `.exit-marker` or moves the chrome out of `.mark-chrome`, mirror the
  insets in the new selector.
- **JS reads `window.innerHeight` (dvh-equivalent) while CSS uses `svh`.**
  `useDominanceSnap`, `MarksTitle`, `HeroText`, `Background`, and `autoScroll`
  all normalize against `window.innerHeight`, which on iOS Safari tracks the
  *large* viewport (URL bar collapsed). Sections render at `100svh` (the
  *small* viewport). The mismatch is benign: when the URL bar is expanded,
  the dominance ratio caps near 0.85–0.95 — still well above the 0.72
  threshold — and scroll-progress math (`--mark-p`, `--hero-recede`)
  normalizes both numerator and denominator against the same `vh`, so the
  reveal still hits 1 at the right scroll position. Don't switch the JS to
  `visualViewport.height` or any svh-equivalent without re-deriving the
  dominance threshold.
