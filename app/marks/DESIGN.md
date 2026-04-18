# /marks — design intent

This file captures the **concept, philosophy, and motion spec** of the `/marks`
route. It is the "why" document — not a tour of the code, not a changelog, not a
list of anomalies. For anomalies and don't-touch items see
[`ANOMALIES.md`](./ANOMALIES.md). For project-level rules see
[`CLAUDE.md`](../../CLAUDE.md).

---

## Concept

`/marks` is a **cinematic credits-reel** of six logo marks designed between 2019
and 2024. It is the only route in the portfolio that is **not** a sheet-stack
case study. It reads as a continuous editorial document — one long reel, not a
workbench.

The reader's job is to watch. The route auto-advances. Manual interaction is
allowed but never required: a user who does nothing sees the full reel loop
indefinitely.

## Why it lives outside `(works)/`

The route is at `app/marks/`, not `app/(works)/marks/`. The `(works)` shell is
built for case-study reading — viewport frame, chapter markers, transition
choreography. `/marks` is a reel, not a case study. Inheriting the workbench
chrome would fight the material.

The only `(works)` primitive reused is the `ExitMarker` pill. Everything else is
route-local.

---

## Page anatomy

```
Hero             (100vh spacer — title lives above, docked via scrollY)
Essay            (editorial intro + preview rows of the six marks)
MarkSection × 6  (one per mark — hero slide + supporting slides carousel)
Buffer           (25vh fade-out → 30vh black → 25vh fade-in)
                 (infinite loop fires here; reader returns to Hero)
```

The title (`MarksTitle`) is a persistent `h1` that spans the whole route,
driven by scrollY. It scales from a hero moment at the top (120px, ~37vh) into
a docked pill (24px, `top: --marker-top`) as the reader scrolls past Hero, then
re-expands inside each mark section as a per-section title (reel-roll ping-pong
between two slots, direction following scroll).

---

## Reveal sequence

Each mark section reveals in three paper-physical phases as its scroll
progress (`--mark-p`) crosses a threshold:

1. **Color** — the `Background` palette tweens from the previous mark's palette
   to this mark's palette. Colors use `@property <color>` so the tween is real,
   not a fade.
2. **Details** — mark artwork, caption, and chrome fade up.
3. **Snap** — a hysteresis latch (`data-settled="true"` at `p ≥ 0.85`, release
   at `p ≤ 0.60`) commits the section. The latch gap is deliberate; see
   ANOMALIES.

All three run on `--ease-paper`.

---

## Auto-advance (the showcase timer)

The reel advances itself. `useShowcaseTimer` fires `onWrap` every `slideMs`
(default 4s per slide) while the section is dominant. The timer pauses on
interaction and resumes after `idleResumeMs` (24s) of user inactivity. It also
pauses when the tab is hidden (`visibilitychange`) and respects
`prefers-reduced-motion`.

Single-slide marks still tick — the timer's only job in that case is to hand
off to the next mark. See ANOMALIES ("Showcase timer ticks on single-slide
marks").

---

## Manual interaction

The reader can override the auto-advance at any time:

| Gesture                     | Effect                                                |
|-----------------------------|-------------------------------------------------------|
| Vertical scroll             | Native — moves between sections                       |
| Click an Essay preview      | `scrollGlide` jump to that mark                       |
| Wheel (horizontal)          | Advance/retreat one slide within the active mark      |
| Touch swipe (horizontal)    | Same — one slide per swipe                            |
| Click a paginator dot       | Jump to that slide                                    |
| Click the MarksTitle (in a mark) | `scrollGlide` back to the grid (Essay)          |

Every manual gesture calls `pauseForInteraction()` so the auto-advance does
not fight the reader's intent.

---

## Infinite loop

At the bottom of the reel, `Buffer` emits three zones (fade-out / black /
fade-in). The loop fires while the black zone dominates the viewport
(`FIRE_OVERLAP = 0.9`), doing a `scrollTo(0, 0)` while the palette has already
swapped back to `HERO_PALETTE`. The reader sees a seamless return to the top.

Threshold tuning (arm/fire/re-fire guard) is documented in ANOMALIES — those
values are load-bearing, not arbitrary.

---

## Motion vocabulary

The route follows the portfolio-wide paper-physical vocabulary (`--ease-paper`,
0.5–0.9s range, no bounce) with two documented exceptions, both tracked in
ANOMALIES:

- **Reel-roll** (title cells) — sits below paper durations (0.3–0.4s) because
  it reads as a shutter/reel, not a settle.
- **Tab tier** (`--ease-snap`, 0.1–0.2s) — not used here, but tokens are
  available if a future UI affordance needs it.

### Token discipline

All route CSS pulls from `globals.css` tokens:

- easings: `--ease-paper`, `--ease-snap`
- durations: `--dur-instant` / `-fast` / `-slide` / `-settle` / `-glide`
- spacing: `--space-*` scale
- tones: `--tone-*` and mark-palette custom properties

Do **not** hardcode hex, easings, or durations inside `marks.css`. If you need
a value that doesn't exist as a token, add the token first.

---

## The six marks

Inventory: `data/marks.ts`. Reading order in the Essay:

1. **Furrmark / Aleyr** — divider (solo, sets the stage)
2. **Codezeros** — wordmark
3. **Slangbusters** — wordmark
4. **Beringer** — wordmark
5. **Ecochain** — glyph
6. **Kilti** — glyph

The array order in `data/marks.ts` *is* the reading order. Reordering the array
re-lays the Essay preview rows.

---

## Mobile

Built responsive-ready from day one (per CLAUDE.md's built-responsive stance).
Desktop is the canonical composition; mobile is a reading fallback, not a
second authored design.

Documented mobile decisions (why values are what they are) live in ANOMALIES
under "Responsive anomalies". The short version:

- Title scale uses a breakpoint-scoped linear formula, not `clamp()`, because
  the dock interpolation is a derived product of scroll progress × size range.
- Essay preview rows flip to `flex-direction: column` with a 48px gap.
- Buffer heights stay in vh — shrinking them would break the infinite-loop
  fire window.
- No tucked pill — `MarksTitle` is the nav and already docks at any viewport.

---

## What this route is not

- Not a case study. No chapters, no project marker, no workbench.
- Not interactive-first. A reader who never touches anything still sees
  everything.
- Not a catalog. The order and pacing are authored, not browsable.
