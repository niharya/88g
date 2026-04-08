# /components/nav — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/components/nav/`. Update it
when an architectural decision changes — not on every edit.

This is the **global** nav module: `ChapterMarker`, `ProjectMarker`, `ExitMarker`,
`nav.css`. Used by every long-form project route. Treat changes here as
load-bearing for both `/biconomy` and `/rr` (and any future route).

For project-level rules see `CLAUDE.md`. For route-specific consumers see
`app/<route>/NOTES.md`.

---

## `[data-arrow-target]` — opt-in for arrow rotation

`ChapterMarker.tsx` has a rotating arrow that points at the sheet's visual
center. For most sections that's correct: the section is roughly viewport-sized
and its center is what the user is looking at.

But sections that host a **pinned scroll scene** (a sticky inner stage inside a
taller wrapper) are taller than the viewport. The section midpoint is permanently
off-screen, so the arrow ends up pointing at nothing useful.

Fix lives in `ChapterMarker.tsx:50-51`:

```ts
const target = sheet.querySelector('[data-arrow-target]') as HTMLElement | null
            ?? sheet
```

A route opts in by adding `data-arrow-target` to whatever element actually
represents the visible focal point. The arrow rotates toward *that* element
instead of the sheet.

**Currently used by:** `/rr` Mechanics scene (the primary mat carries the
attribute — see `app/rr/NOTES.md`).

**Don't break:**
- The `?? sheet` fallback. Routes that do not set the attribute (e.g. all of
  `/biconomy`) rely on the fallback for default behavior. Removing it silently
  breaks every existing route.
- The query is scoped to `sheet.querySelector(...)`, not `document.querySelector`.
  This means each section can have its own arrow target without colliding.
  Don't widen the scope.

---

## `MARKER_TOP` is duplicated in JS and CSS

`ChapterMarker.tsx:17` has `const MARKER_TOP = 24`. This **must** match
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

When the tray opens, `ChapterMarker` randomises a CSS `--tilt` variable on every
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

## Don't-touch list (without reading why first)

- The `?? sheet` fallback in the arrow target query
- `MARKER_TOP` / `--marker-top` synchronisation
- The `.is-docked` precondition for opening the tray (measured fresh, not from
  the class)
- The sheet tilt behavior on tray open
- `pointerdown` (not `click`) for outside-click dismiss
