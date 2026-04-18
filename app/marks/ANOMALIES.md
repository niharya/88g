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

## Infinite loop wrap — armed/fire thresholds

`components/hooks/useInfiniteLoop.ts` wraps the reel by `scrollTo(0, 0)`
while the Buffer's black zone is fully opaque. Three constants are tuned,
not arbitrary:

- `ARM_OVERLAP = 0.6` — any mark section crossing 60% visibility arms the
  loop. Below this, a user poking the top of the Essay can't accidentally
  trigger a wrap if they then scroll to the buffer.
- `FIRE_OVERLAP = 0.9` — black zone must fully dominate the viewport before
  firing, so the palette swap (handled in `Background.tsx`) is
  imperceptible. Lowering this risks the jump happening while the fade
  gradient is still partially transparent.
- `1000 ms re-fire guard` — prevents a second fire during the `scrollTo`'s
  own scroll event dispatch.

The palette reset is the other half of the illusion: `Background.tsx`
recognises the black-zone element and swaps to `HERO_PALETTE` when it
dominates. Those two pieces are co-authored; touch one, verify the other.

---

## Buffer zone fractions

`Buffer.tsx` emits three zones sized in `marks.css` as 25vh / 30vh / 25vh.
The 30vh black middle is the fire window for the infinite loop — shrinking
it below the loop's `FIRE_OVERLAP` threshold (0.9) would make the wrap
unreachable on tall viewports. If the buffer height changes, re-tune
`FIRE_OVERLAP` in lockstep.

---

## MarkSection horizontal nav thresholds

Wheel / touch constants in `MarkSection.tsx`:

- `WHEEL_THRESHOLD = 30` (min |deltaX|) and `WHEEL_COOLDOWN_MS = 400` — tuned
  against trackpad inertia so a single flick advances one slide, not three.
- `TOUCH_THRESHOLD = 40` — minimum horizontal drag before a swipe registers.
  Below this, accidental sideways motion during vertical scroll fires.

Manual advance also pauses the showcase timer for `idleResumeMs` (24s per
`useShowcaseTimer`) via `pauseForInteraction()` — leaving this out lets the
auto-advance fight the user's manual intent.

---

## MarkChrome active-dot remount key

`MarkChrome.tsx` keys the active paginator dot as `active-${index}` while
inactive dots use stable `inactive-${i}` keys. This forces React to remount
the active dot on every slide change, which restarts the CSS fill animation
from `scaleX(0)`. If you unify the keys, the fill animation won't restart
and the dot appears "stuck" across slide transitions.

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
- **Buffer heights stay in vh.** The 25/30/25vh split works at all
  viewports; shortening them to accommodate small viewports would break the
  infinite-loop fire window. Left alone deliberately.
- **Mark carousel + chrome** already use `min(…vw, …px)` / `min(100%, …px)`;
  no mobile override needed.
- **No tucked pill** — `/marks` does not use the `ProjectMarker` /
  `ChapterMarker` shell. The `MarksTitle` itself is the nav; it already
  docks to `--marker-top` at any viewport width.
