# /components/nav — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/components/nav/`. Update it
when an architectural decision changes — not on every edit.

This is the **global** nav module: `ChapterMarker`, `ProjectMarker`, `ExitMarker`,
`MarkerSlot`, `useDockedMarker`, `nav.css`. Used by every long-form project route.
Treat changes here as load-bearing for both `/biconomy` and `/rr` (and any future
route).

For project-level rules see `CLAUDE.md`. For route-specific consumers see
`app/<route>/NOTES.md`.

---

## Module structure (post-restructure)

| File | Role |
|------|------|
| `useDockedMarker.ts` | Hook — owns all scroll-coupled behaviors (arrow rotation, is-docked, tray open/close, tilt, outside-click, navigate). Accepts explicit `containerRef` for the sheet. Uses `.closest('.sheet-stack')` for tray operations (4 call sites). |
| `MarkerSlot.tsx` | Positioning wrapper — fixed left/right pill container. Left slot measures right edge via ResizeObserver → `--project-marker-right`. Future persistence point for cross-route transitions. |
| `ChapterMarker.tsx` | Two modes: **dynamic** (full docked behavior via `useDockedMarker`) and **static** (inert pill, no hooks). Dynamic requires `containerRef` prop. |
| `ProjectMarker.tsx` | Content-only — renders icon + name. No positioning or measurement (handled by MarkerSlot). |
| `ExitMarker.tsx` | Fixed right pill linking to /selected. Not wrapped in MarkerSlot (uses its own `.exit-marker` positioning). |
| `Sheet.tsx` | `'use client'` — creates `useRef` for the `<section>`, passes to ChapterMarker as `containerRef`. Also calls `useReveal` for scroll-triggered section entrance. |
| `useReveal.ts` | Hook — one-shot IntersectionObserver, adds `.revealed` to a ref'd element. Gates itself behind `.transitioning` removal to avoid fighting TransitionSlot. |

---

## `containerRef` replaces `.closest('.sheet')`

ChapterMarker previously used `navRef.closest('.sheet')` to find its parent
section for arrow rotation and tray-open scroll alignment. This created a tight
coupling to the DOM structure.

Now: Sheet creates a `useRef<HTMLElement>` and passes it to ChapterMarker as
`containerRef`. The `useDockedMarker` hook uses `containerRef.current` for:
- Arrow rotation target: `containerRef.current.querySelector('[data-arrow-target]') ?? containerRef.current`
- Tray-open scroll alignment: reading sheet's `getBoundingClientRect().top`

The 4 `.closest('.sheet-stack')` calls were **kept as-is** because the sheet-stack
is a page-level singleton, not a per-section container. Changing these would add
complexity with no benefit.

---

## MarkerSlot measurement replaces ProjectMarker useEffect

Previously, ProjectMarker measured its own right edge on mount via a single
`useEffect` with `getBoundingClientRect`. This was fragile — missed font loads,
text changes, and layout shifts.

Now: MarkerSlot (left) uses a `ResizeObserver` + resize listener to continuously
publish `--project-marker-right` on `<html>`. The measurement is always current.

The `.project-marker` CSS class lives on MarkerSlot's wrapper div, not on
ProjectMarker itself. All existing CSS selectors (nav.css, selected.css, rr.css)
target `.project-marker` and continue to work.

---

## Static mode on ChapterMarker

`<ChapterMarker static chapter={...} chapters={[]} />` renders an inert pill with:
- `position: static` (via `.chapter-nav--static`)
- `borderLeftWidth: 1` for docked border halving
- No scroll listeners, no tray, no arrow rotation
- No hooks called at all (early return in component)

Used on `/selected` for the "Works 2018-25" pill. Replaces the previous hand-coded
fake chapter pill.

---

## Nav-sled formula

The sled converts viewport-based `--project-marker-right` to sheet-relative coords:

```css
left: calc(var(--project-marker-right) - (var(--workbench-pad-x) - var(--sheet-bleed) + 2px));
```

The `2px` = sheet border width (from `--sheet-border`). The workbench has no
layout border (the `::before` viewport frame is a fixed overlay with
`pointer-events: none`).

**Known issue:** At viewports below 1024px, the media query overrides workbench
padding and sheet margins with hardcoded values (24px) but doesn't update the CSS
custom properties. The sled formula uses stale variable values on narrow viewports.
This is a pre-existing issue, not introduced by the restructure.

---

## `[data-arrow-target]` — opt-in for arrow rotation

`useDockedMarker` has a rotating arrow that points at the sheet's visual
center. For most sections that's correct: the section is roughly viewport-sized
and its center is what the user is looking at.

But sections that host a **pinned scroll scene** (a sticky inner stage inside a
taller wrapper) are taller than the viewport. The section midpoint is permanently
off-screen, so the arrow ends up pointing at nothing useful.

Fix lives in `useDockedMarker.ts`:

```ts
const target = sheet.querySelector('[data-arrow-target]') as HTMLElement | null
            ?? sheet
```

A route opts in by adding `data-arrow-target` to whatever element actually
represents the visible focal point. The arrow rotates toward *that* element
instead of the sheet.

**Currently used by:** `/rr` Mechanics scene (the primary mat carries the
attribute — see `app/(works)/rr/NOTES.md`).

**Don't break:**
- The `?? sheet` fallback. Routes that do not set the attribute (e.g. all of
  `/biconomy`) rely on the fallback for default behavior. Removing it silently
  breaks every existing route.
- The query is scoped to `containerRef.current.querySelector(...)`, not
  `document.querySelector`. This means each section can have its own arrow
  target without colliding. Don't widen the scope.

---

## `MARKER_TOP` is duplicated in JS and CSS

`useDockedMarker.ts` has `const MARKER_TOP = 24`. This **must** match
`--marker-top` in `nav.css`. The JS uses it for two things:

- Docked detection: `Math.abs(navRect.top - MARKER_TOP) < 4` decides whether the
  sticky marker is currently stuck.
- Tray-open scroll alignment: when the tray opens, the page is nudged so the
  marker stays visually at MARKER_TOP after `position: sticky` switches to
  `relative`.

If you change one, change both. There is no CSS-only way to detect "is this
sticky element currently stuck", so the JS measurement is necessary.

---

## Tray open requires the marker to be docked

`openTray` measures the marker position directly with `getBoundingClientRect`
and bails if it's not at MARKER_TOP. The `.is-docked` class is intentionally
**not** trusted here because it can be stale during layout transitions.

If the user clicks a non-docked marker, the click instead scrolls that section
into view (does not open the tray). The tray opening is reserved for the
currently active section only.

---

## Sheet tilt on tray open

When the tray opens, `useDockedMarker` randomises a CSS `--tilt` variable on every
`.sheet > :not(.nav-sled)` element on the page. This is the "tilted papers"
effect.

`CLAUDE.md` calls this out explicitly: **do not change the chapter tray tilt
behavior unless explicitly asked.** It's load-bearing for the visual identity of
all routes.

---

## Outside-click uses `pointerdown`, not `click`

`pointerdown` covers mouse, touch, and stylus in one listener. Don't add a
separate `touchstart` listener — it'll fire twice on touch devices.

---

## Sheet.tsx is a client component

Sheet uses `'use client'` because it creates a `useRef` for the section element
and passes it to ChapterMarker. Its children are passed as `ReactNode` props —
they can still be server components rendered by the parent page.

---

## Sheet.tsx section reveal (useReveal)

Sheet adds `.section-reveal` to every `<section>` and calls `useReveal(sectionRef)`.
This produces a three-phase entrance when the section scrolls into view:

1. **Mat slides in** — sheet opacity + translateY (0.45s)
2. **Content settles** — children (`:not(.nav-sled)`) fade in (+0.12s delay)
3. **Chapter marker docks** — nav-sled fades in and descends (+0.22s delay)

CSS lives in `globals.css` (`.section-reveal` / `.revealed` block).

### TransitionSlot handshake

On client-side navigation, TransitionSlot adds `.transitioning` to `.workbench`
during the page transition. `useReveal` detects this via MutationObserver and
**defers** its IntersectionObserver until `.transitioning` is removed. This
prevents section reveals from fighting the page-level entrance animation.

After TransitionSlot's WAAPI entrance completes, it adds `.revealed` to the
first (above-fold) sheet directly. Below-fold sheets are left for `useReveal`
to handle on scroll.

On hard load, `.transitioning` is never set, so `useReveal` observes
immediately. The first viewport's sections reveal as fonts load.

**Don't break:**
- The `.transitioning` class name must match between TransitionSlot and useReveal.
- TransitionSlot must only `.revealed` the first sheet, not all sheets.
- useReveal must check `revealed.current` to avoid re-observing sheets that
  TransitionSlot already revealed.

---

## Don't-touch list (without reading why first)

- The `?? sheet` fallback in the arrow target query
- `MARKER_TOP` / `--marker-top` synchronisation
- The `.is-docked` precondition for opening the tray (measured fresh, not from
  the class)
- The sheet tilt behavior on tray open
- `pointerdown` (not `click`) for outside-click dismiss
- The 4 `.closest('.sheet-stack')` calls in useDockedMarker
- `.project-marker` class name on MarkerSlot (targeted by 4 CSS sites)
- `.section-reveal` class on Sheet — consumed by globals.css and by TransitionSlot
- `.transitioning` on `.workbench` — the contract between TransitionSlot and useReveal
