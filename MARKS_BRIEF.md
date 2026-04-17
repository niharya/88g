# `/marks` — Marks & Symbols route build brief

## Read first
Before touching anything:
1. `CLAUDE.md` at repo root — working contract, motion vocabulary, responsive rules, token discipline
2. `app/(works)/selected/ANOMALIES.md`
3. `app/(works)/biconomy/ANOMALIES.md` — historical donor for shared primitives
4. `app/(works)/rr/ANOMALIES.md` — current focus route, closest reference
5. `app/components/nav/ANOMALIES.md`
6. `app/(works)/layout.tsx`, `app/(works)/TransitionSlot.tsx`, `app/(works)/ShellNav.tsx`
7. `app/components/` — Sheet, PaperFilter, ExitMarker, etc.
8. `app/globals.css` — tokens, `--ease-paper`, `.mat`, `.fonts-ready`, reveal system
9. `LIBRARY.md` at repo root

## Concept

`/marks` (Marks & Symbols) is a top-level route under `app/(works)/`, sibling to `/biconomy` and `/rr`. It opens from `/selected` but lives at the root.

The route is an editorial showcase of six logo marks and symbols, built in the spirit of film end-credits and opening-title sequences (Panavision, dts, Color by Deluxe cards on a black field). The marks themselves are the artifact — no mockups, no device frames. They are treated like specimens.

The page is designed to be left running on a laptop as a slow, idle showcase. If the user doesn't interact, it advances itself on a timer like a credits reel. Vertically, it is an infinite loop.

Tone: precise, calm, cinematic. No hype.

## Page anatomy (single continuous document)

```
HERO          ~100vh   Fraunces 120px "MARKS & SYMBOLS" centered
                       Dark gradient mat with paper noise.
                       No top pill, no bottom chrome.

ESSAY         auto     Title docks → Fraunces 24px sticky top-center.
                       Body essay (two text blocks around a glyph divider).
                       Row of 6 mark previews — wordmarks + glyphs at
                       editorial scale, greyscale by default.
                       Previews colorize on hover with that mark's own
                       color; click = paper-glide to that mark's section.

MARK 1–6      100vh    Each mark = one viewport-tall section.
 each                  Top chrome: [grid-icon] MarkName (sticky pill).
                       Center: carousel (slide 1 = SVG mark, slides 2+
                       = supporting JPEG/GIF/PNG).
                       Bottom chrome: dot paginator → thin horizontal
                       divider → slide caption → "MarkName, Year".
                       Gradient + noise bespoke per mark, full-bleed.

BUFFER        ~80vh    Mark 6 gradient fades to pure black (~25vh),
                       ~30vh pure black with slow noise drift,
                       then black fades into Hero's gradient (~25vh).
                       Silent scroll-shift reset happens here.

[loops back to HERO seamlessly]
```

## Infinite scroll implementation

**Pattern: double-render + silent scroll-shift.**

Render the full sequence twice in the DOM (cycle A + cycle B). Total scrollable height = 2 × cycleHeight.

```
on scroll:
  if scrollY >= cycleHeight:
    window.scrollTo({ top: scrollY - cycleHeight, behavior: 'instant' })
  if scrollY < 0:
    window.scrollTo({ top: scrollY + cycleHeight, behavior: 'instant' })
```

All visual state (active mark, gradient, title docking, MarkNav contents, paginator) is derived from `scrollY % cycleHeight`, so it's continuous across the reset.

The reset is invisible because content at any `scrollY` is identical to content at `scrollY + cycleHeight`. The Buffer's fade-to-black additionally masks any frame-imperfection — conceptually, it's the cinema reel-change cut.

Use `requestAnimationFrame` for the detection (not throttled scroll events — less reliable).

## Behavior spec

### Showcase timer (auto-advance)

- 4s per slide within a mark.
- After last slide of a mark → paper-glide vertical scroll into the next mark, slide index resets to 0.
- After last slide of Mark 6 → paper-glide through Buffer into next Hero.
- Runs by default when the page loads.
- Any user interaction pauses it. Resumes after 24s of no interaction.
- Paused when `document.visibilityState === 'hidden'`.
- Disabled entirely under `prefers-reduced-motion: reduce`.

### Manual interaction

| Action | Effect |
|---|---|
| Vertical scroll | Moves through phases (Hero → Essay → Marks → Buffer → Hero) |
| Horizontal trackpad/wheel | Advances/retreats carousel slide within current mark |
| Click paginator dot | Jumps to that slide |
| Click grid-icon in MarkNav | Paper-glides back to current cycle's Hero |
| Click mark in Essay preview row | Paper-glides to that mark's section |
| Any of the above | Pauses timer, schedules resume in 24s |

### Magnetic settle

- 4 seconds after vertical scroll stops, check viewport.
- If a mark section fills ≥ 70% of viewport, programmatic paper-glide to center it.
- Cancelled if user scrolls again during the delay.
- Does not apply inside Hero, Essay, or Buffer — only to mark sections.

### Always-on ambient motion

- **Gradient drift:** each mark has two palette stops. CSS keyframe oscillates between them on a ~14s loop.
- **Noise drift:** `background-position` slow loop on the paper-noise layer, ~30s.
- Both suspend on `visibilityState: hidden` and disable under `prefers-reduced-motion`.

### Cross-mark transition

- Bespoke per-mark gradient crossfades (not snaps) to the next mark's palette over ~0.9s when the active mark changes.
- Uses `--ease-paper`.

## Motion vocabulary (from CLAUDE.md)

- One easing curve: `--ease-paper: cubic-bezier(0.5, 0, 0.2, 1)`.
- Durations: 0.5–0.9s range. No snappy motion.
- No bounce, no overshoot.
- Native browser scroll physics preserved.

## Component structure

### Route-local

```
app/(works)/marks/
  page.tsx
  layout.tsx
  marks.css
  ANOMALIES.md
  data/
    marks.ts              # typed mark inventory (MARKS: MarkEntry[])
  components/
    Hero.tsx              # 120 → 24 docking title, scroll-mapped
    Essay.tsx             # body + glyph dividers + 6-mark preview row
    MarkSection.tsx       # one viewport-tall mark with chrome + carousel
    MarkCarousel.tsx      # horizontal translateX track, index-driven
    MarkChrome.tsx        # bottom: dots + divider + caption + attribution
    MarkNav.tsx           # sticky top-center pill, context-aware
    Background.tsx        # fixed gradient + noise, derives active mark
    Buffer.tsx            # fade-to-black reel cut
    hooks/
      useShowcaseTimer.ts   # 4s/slide + 24s idle + visibility + reduced-motion
      useMagneticSettle.ts  # scroll-end → snap-to-mark if ≥70% in view
      useActiveMark.ts      # scrollY → which mark is "current"
      useInfiniteLoop.ts    # double-render + silent scroll-shift
```

### Shared (promoted to design system because marks will be reused)

```
app/components/marks/
  index.ts                # barrel export + typed registry
  types.ts                # MarkComponent type, MarkId union
  Aleyr.tsx               # inline SVG, uses currentColor on fill/stroke
  Codezeros.tsx
  OscarBeringer.tsx
  <mark-4>.tsx
  <mark-5>.tsx
  <mark-6>.tsx
```

Every fillable path uses `fill="currentColor"` (or `stroke="currentColor"` if stroke-based). This gives free coloring via CSS, free sizing, and path-level animation options later.

Barrel exports both individual components and a registry:

```ts
export const marks = { aleyr: Aleyr, codezeros: Codezeros, /* ... */ }
export type MarkId = keyof typeof marks
```

### Supporting media

```
public/marks/
  aleyr/
    01.jpg
    02.gif
    ...
  codezeros/
    01.png
    ...
```

Slide ordering follows filename ordering. Use Next's `<Image>` component.

### Data shape

```ts
// app/(works)/marks/data/marks.ts
import { marks as markComponents, type MarkId } from '@/app/components/marks'

export type MarkSlide =
  | { kind: 'mark' }                                // slide 1, always
  | { kind: 'image'; src: string; caption: string }
  | { kind: 'gif';   src: string; caption: string }

export type MarkEntry = {
  id: MarkId
  name: string                  // "Aleyr"
  year: number                  // 2021
  story: string                 // "This mark is the face your pet makes…"
  palette: { stopA: string; stopB: string; angle: number }
  previewColor: string          // hover color in essay preview row
  slides: MarkSlide[]           // variable length per mark (2–6 typical)
}

export const MARKS: MarkEntry[] = [ /* 6 entries */ ]
```

## Assets

Source SVGs are in `/Users/nihar.bico/88g/reference/marks-source`.

For each SVG:
1. Clean through SVGOMG if not already optimized.
2. Convert to a React component in `app/components/marks/<Name>.tsx`.
3. Replace hardcoded fills/strokes with `currentColor` on the paths that should color-shift (check each one — some marks may have multiple colors that are intentional).
4. Remove width/height attributes on the root `<svg>`; keep `viewBox` so it scales from the CSS.

The user will provide per-mark metadata (name, year, story caption, palette stops, angle, per-slide captions) — if not in the brief's content file, stub with placeholders and flag for fill-in.

## Mobile

Same flow, not a different composition. Implementation costs stay cheap:

- Hero title scales via `clamp()` — not a breakpoint flip.
- Essay column narrows naturally; 6-mark preview row stacks vertically via `flex-direction: column` at mobile breakpoint.
- MarkNav follows the global mobile pattern in CLAUDE.md: centered sticky pill, `top: 0`, tucked into the 4px black frame via negative `margin-top` equal to workbench padding.
- Carousel scales fluidly; bottom chrome stays anchored.
- Horizontal touch swipe on mark sections = trackpad-swipe equivalent. Use `touchstart`/`touchmove`/`touchend` with a 40px threshold.
- Viewport frame: 8px desktop → 4px mobile (already in `globals.css`).

Don't design a separate mobile pass. The above accommodations are enough for this build.

## Build order (chunked, each chunk reviewed before next)

1. **Route skeleton** — layout.tsx, page.tsx, marks.css, ANOMALIES.md, empty components, data/marks.ts with 6 placeholder entries.
2. **Shared marks primitive** — `app/components/marks/` with the six mark components from the source SVGs. Promote, update `LIBRARY.md`.
3. **Hero** — static 120px title, gradient + noise mat. No docking yet.
4. **Essay** — body text, glyph dividers, 6-mark preview row (no hover color yet).
5. **Mark section (single)** — build MarkSection for Mark 1 only. Static carousel at slide 0. Chrome (nav + paginator + caption). Bespoke gradient.
6. **All 6 mark sections** stacked. Continuous scroll works, no auto-advance yet.
7. **Hero docking** — scroll-mapped 120 → 24 title transform.
8. **Gradient ambient motion** — per-mark drift keyframe + cross-mark crossfade.
9. **Showcase timer** — `useShowcaseTimer`, 4s/slide, idle 24s, visibility pause, reduced motion respect. Wire to carousel state + programmatic scroll at slide-boundaries.
10. **Magnetic settle** — `useMagneticSettle`, 4s after scroll stop, ≥70% rule.
11. **Preview row hover + jump** — colorize on hover, paper-glide on click.
12. **Essay preview row alignment** — confirm the 6 preview slots match the 6 MARKS entries by id.
13. **Buffer + infinite loop** — `Buffer.tsx` fade-to-black, `useInfiniteLoop` double-render + silent scroll-shift.
14. **Mobile adjustments** — clamp(), stack preview row, MarkNav tucked pill, touch swipe.
15. **ANOMALIES.md** — document the anomalies: infinite-loop reset mechanics, settle delay overlap with carousel timer, scroll-state derivation, why marks were promoted to shared.
16. **LIBRARY.md** — entry for `app/components/marks/` with reuse notes.

Each chunk: implement, verify in dev server at 1440px (per user's memory), then stop and present for review before moving on. Do not combine chunks unless explicitly told to.

## Constraints (from CLAUDE.md, non-negotiable)

- No Tailwind, no CSS modules, no styled-components. Plain CSS only.
- Framer Motion only for spring physics, presence transitions, or scroll-linked transforms where it materially helps. CSS transitions preferred.
- No `transform: scale()` on text. No `!important` chains. No JS media queries (hydration risk).
- Don't normalize hand-authored spacing. Preserve authored offsets.
- Don't touch `/biconomy` unless a shared primitive needs to move.
- Verify at 1440px first. Never push unverified work.
- Before pushing: bump `package.json` minor version, tag `vX.Y.0`, push commits and tags — and always confirm with user before pushing.

## Agents to engage

- **portfolio-guardian** — tone, integrity, portfolio fit (on hero + essay copy)
- **route-auditor** — before touching shared layout or any existing route
- **frontend-craft** — motion, carousel mechanics, infinite-loop CSS
- **anomaly-librarian** — when documenting infinite-loop reset + magnetic settle in ANOMALIES.md

## Deliverable at end

A working `/marks` route that:
- Loads at `/marks` with the hero, essay, 6 mark sections, buffer.
- Auto-advances slides and marks on timer if left idle.
- Scrolls infinitely in both directions.
- Responds correctly to manual scroll, horizontal swipe, dot clicks, grid-icon, essay preview row clicks.
- Settles magnetically after 4s idle.
- Respects `prefers-reduced-motion` and tab visibility.
- Works on mobile with the same flow, just narrower.
- `LIBRARY.md` updated with the new shared `marks/` primitive.
- `ANOMALIES.md` captures the non-obvious wiring.
- `package.json` bumped, commit prepared, tag prepared — but **not pushed** without explicit user confirmation.
