# Nav pill system

The sheet-stack navigation surface that appears on every long-form project route
(`/biconomy`, `/rr`, `/marks`, and any future brief-driven route).

This file is the **canonical behavior doc**. If you're touching anything in
`app/components/nav/` — or considering a route-level override of anything inside
`nav.css` or the nav-sled formula — read this first.

For architectural anomalies (cross-file wiring, don't-touch items), see
`ANOMALIES.md` next to this file.

---

## What it is

Three fixed/sticky pills docked to the top of every long-form route:

| Pill | Component | Position | Role |
|---|---|---|---|
| Project | `<ProjectMarker>` inside `<MarkerSlot left>` | `position: fixed; top: var(--marker-top); left: var(--workbench-pad-x)` | Identity — the project title. Always visible. |
| Chapter | `<ChapterMarker>` rendered inside each `<Sheet>`'s `.nav-sled` | `position: sticky; top: var(--marker-top)` | Wayfinding — the current section title, plus a tray that lists every chapter. |
| Exit | `<ExitMarker>` | `position: fixed; top: var(--marker-top); right: var(--workbench-pad-x)` | Escape — links back to `/selected`. |

The chapter pill docks horizontally next to the project pill via the nav-sled
formula, which reads `--project-marker-right` (measured live by `MarkerSlot`)
and converts it to a sheet-relative coordinate. See `nav.css` `.nav-sled` rule.

At all viewport widths, everything resolves through CSS tokens
(`--workbench-pad-x`, `--sheet-bleed`, `--marker-top`, `--project-marker-right`).
There is no per-route math, no per-route fixed pixel offset, no per-viewport
JavaScript. If you find yourself writing any of those to position a pill on
mobile, stop — you're fighting the system.

---

## Responsive behavior (default, works everywhere)

On mobile (≤767px), `globals.css` overrides the shared tokens:

```css
@media (max-width: 767px) {
  :root {
    --workbench-pad-x: 24px;
    --marker-top: 16px;
    --sheet-bleed: 24px;
    --sheet-padding-x: 24px;
    /* ... */
  }
}
```

Because every nav rule reads those tokens, the whole system recomposes for free:

- Project pill slides to `top: 16px; left: 24px`.
- Exit pill mirrors on the right.
- Nav-sled's `left: calc(var(--project-marker-right) - …)` formula reads the live
  `--project-marker-right` (the measured width of the project pill in its new,
  smaller-padded form) and lands the chapter pill next to it.
- `nav.css` internally tightens `.nav-marker__content` padding on mobile
  (32px → 16px right) so the pills are compact at small widths.

**What the user sees on mobile:**

- Project pill fixed at the top-left.
- Exit pill fixed at the top-right.
- Chapter pill sticky inside each sheet — it pins to the viewport top as the
  user scrolls that section. It appears *next to* the project pill in the
  horizontal axis (docked via the sled formula), but may visually read as a
  second row at narrow viewports when the pill widths don't both fit on the
  same line after accounting for the exit pill on the other side.

**This is correct.** The second-row behavior is biconomy's reference feel and
is preserved intentionally — do not rewrite the pills to center-dock them as a
single unit on mobile, and do not pull the chapter pill into flow inside each
mat. Both were tried on `/rr` and are logged in "Rejected approaches" below.

---

## Don't build a mobile composition. Consume the defaults.

Every long-form route (biconomy, rr, marks) gets the same nav pill behavior at
every breakpoint by doing nothing. This is load-bearing — the pills are how
the user orients in the sheet stack, and a drifting identity between routes
breaks that.

If you are writing CSS that looks like this:

```css
/* ❌ Don't. */
.workbench:has(.route-foo) .project-marker {
  position: fixed;
  left: calc(50vw - ...);
  /* ... per-route pill math ... */
}

.route-foo .nav-sled {
  position: relative;
  /* ... pulling the sled into flow ... */
}
```

…stop. The default sticky-sled-next-to-fixed-project pattern works. If it
doesn't appear to work for your route, something **else** is broken — usually
one of:

- A route CSS file is overriding `--workbench-pad-x` or `--sheet-bleed` on
  `.sheet` instead of on `:root` inside a media query. The sled formula reads
  from tokens; override the **token**, not the consumer. See
  `ANOMALIES.md` → "Responsive breakpoints — override the token, not the
  consumer".
- A route section has structural anomalies (a `padding: 0` mat, a 200vh pinned
  scene, an absolute-positioned first child) that displace the sled's absolute
  flow position within the sheet. Fix the section, not the pill.

If you genuinely need a route-specific pill behavior: flag it, confirm with the
user, and document why the default doesn't serve the route. Do not silently
author a parallel system.

---

## API surface

Imports come from `app/components/nav` (the index re-exports):

```ts
import {
  ProjectMarker,
  ChapterMarker,
  ExitMarker,
  MarkerSlot,
  useDockedMarker,
  type Chapter,
} from '@/app/components/nav'
```

Shell wiring (pattern used by the `(works)` layout):

```tsx
// Shell (app/(works)/ShellNav.tsx equivalent)
<MarkerSlot left>
  <ProjectMarker name={projectName} />
</MarkerSlot>
<ExitMarker />
```

Per-section wiring (inside a `<Sheet>`):

```tsx
// Sheet.tsx already renders the nav-sled + ChapterMarker for you.
// You just pass `chapter` + `chapters` down.
<Sheet id="intro" chapter={introChapter} chapters={allChapters}>
  {/* section content */}
</Sheet>
```

### ChapterMarker modes

- **Dynamic** (default) — docks on scroll, opens a tray on click, rotates an
  arrow toward the sheet's visual focal point. Requires `containerRef` (Sheet
  provides it).
- **Static** — `<ChapterMarker static chapter={…} chapters={[]} />`. Inert pill
  with the docked-border halving applied, no scroll listeners. Used on
  `/selected` for the "Works 2018-25" label.

### `[data-arrow-target]` — per-section arrow focus

Sections that host a pinned scroll scene (a `sticky` inner stage inside a
taller wrapper) are taller than the viewport. The arrow would point at the
section's off-screen midpoint by default. Add `data-arrow-target` to the
element that *is* visible (e.g., the pinned mat) and the arrow rotates toward
that instead. Currently used by `/rr` Mechanics. See `ANOMALIES.md` →
`[data-arrow-target]` for full wiring notes.

---

## Rejected approaches (tried, removed, don't bring back)

### Centered project+exit pair on mobile

`/rr` previously docked the project and exit pills as a single horizontally-
centered pair via measured-width tokens (`--rr-project-pill-w`,
`--rr-exit-pill-w`, `--rr-pair-offset`). This fought the default system on
every dimension: it required the pill widths to be hand-measured and kept
in sync with copy/padding changes; the chapter pill had to be ripped out of
the sled and pinned per-mat; two chapters (`#intro`, `#mechanics`) needed
further per-chapter absolute-positioning overrides because their first
content blocks overlapped the in-flow pill.

Deleted in favor of the defaults. If you're tempted to re-author this pattern
for a new route, re-read the "Don't build a mobile composition" section above.

### "lite" badge stapled onto the project pill via `::after`

`/rr`'s old mobile pass appended a ` lite` pseudo-element to
`.nav-marker--project .nav-marker__name`, loading a Google Fonts
`Manufacturing Consent` `<link>` in the route layout just for that one string.
It shipped the font to all viewports despite being mobile-only and bypassed
the `--font-*` token convention.

Deleted. If the portfolio ever wants a per-route pill embellishment, it should
be an SVG mark or a variant prop on `<ProjectMarker>` — not a pseudo-element
hack with a per-route font link.

### Chapter pill in flow inside each mat

Tried on `/rr` as `position: relative; display: flex; justify-content: center;
margin-top: 16px`. Immediately broke on two sections whose first visible
content already occupied the space the pill needed (intro's
absolute-positioned surface card, mechanics' structural-only section). Patched
with per-chapter absolute-position overrides, at which point it was no longer
"in flow" — just a more fragile version of the default sticky sled.

Deleted. Sticky nav-sled is the right primitive; don't compete with it.

---

## Don't-touch list (without reading ANOMALIES.md first)

These are load-bearing for both routes. `ANOMALIES.md` has the full "why" for
each — read it if you need to touch any of them.

- The nav-sled `left: calc(--project-marker-right - (--workbench-pad-x - --sheet-bleed + 2px))` formula.
- The `?? sheet` fallback in the arrow-target query.
- The sheet tilt on tray open.
- `MARKER_TOP` / `--marker-top` synchronisation (JS and CSS both hold a copy).
- The `.is-docked` precondition for opening the tray (measured fresh via
  `getBoundingClientRect`, not trusted from the class).
- The `.project-marker` class name on `MarkerSlot` (targeted by 4 CSS sites).

---

## Related docs

- `app/components/nav/ANOMALIES.md` — architectural anomalies, cross-file
  wiring, the `containerRef`/`.closest` history, the measurement contract.
- `LIBRARY.md` (repo root) → "Nav pill system" — catalog entry with
  cross-route reuse notes.
- `CLAUDE.md` — project-level contract; the nav pill entry there points back
  here.
