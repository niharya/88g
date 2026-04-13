# Navigation System

A scroll-aware, sticky chapter navigation system for sheet-stack project pages.

---

## Using this on a new page

### 1. Declare your chapters

Every page using this nav must define its own chapter list. Create a `chapters.ts` in your route folder:

```ts
import type { Chapter } from '@/app/biconomy/nav'

export const chapters: Chapter[] = [
  { id: 'section-one', title: 'Section One', year: '2024' },
  { id: 'section-two', title: 'Section Two', year: '2024' },
]
```

`id` must match the `id` attribute on the corresponding `<section>` element in the DOM — this is what scroll targeting uses.

### 2. Import nav styles in your route layout

```ts
// app/your-route/layout.tsx
import '../nav/nav.css'  // or wherever nav.css lives relative to your layout
```

### 3. Wire up the markers in your page

```tsx
import { ProjectMarker, ExitMarker } from '@/app/biconomy/nav'
import { chapters } from './chapters'
import Sheet from './components/Sheet'  // must pass chapters through to ChapterMarker

export default function Page() {
  return (
    <main className="workbench">
      <ProjectMarker projectName="Your Project" />
      <ExitMarker />
      <div className="sheet-stack">
        {chapters.map(chapter => (
          <Sheet key={chapter.id} chapter={chapter} chapters={chapters}>
            {/* section content */}
          </Sheet>
        ))}
      </div>
    </main>
  )
}
```

### 4. Required CSS tokens

These must be defined before `nav.css` loads (typically in your route's main CSS `@root`):

| Token | Purpose |
|---|---|
| `--marker-top` | Sticky top offset for chapter marker. Must match `MARKER_TOP` in `ChapterMarker.tsx`. |
| `--workbench-pad-x` | Horizontal padding of the workbench — positions fixed markers. |
| `--sheet-bleed` | How far sheets extend past the workbench — used in sled positioning formula. |
| `--stack-gap` | Normal gap between sheets. Triples when tray is open. |
| `--z-chapter-marker` | Z-index for the sticky chapter marker. |
| `--z-project-marker` | Z-index for the fixed project and exit markers. |
| `--grey-880`, `--grey-640`, `--grey-480` | Border and text colors for nav markers. |

---

## Component responsibilities

### `ProjectMarker`
Fixed to the top-left of the viewport. On mount, measures its own right edge and writes it to `--project-marker-right`. Every `ChapterMarker`'s sled reads this variable to align flush with the project marker — no hardcoded offsets.

### `ExitMarker`
Fixed to the top-right. A `<Link>` to `/selection` (or wherever the project index lives). No JS behavior.

### `ChapterMarker`
The core of the system. Sticky within its sheet's `nav-sled`. Handles:
- Scroll-driven arrow rotation (points toward sheet center via `Math.atan2`)
- Docked detection (toggles `.is-docked` when within 4px of `--marker-top`)
- Tray open/close (only openable when docked)
- Non-docked click → smooth scroll to that section
- Menu navigation → instant gap snap + smooth scroll to target
- Sheet tilt on tray open (random per element, rerandomised each open)

---

## Key behaviors

### Docking and border halving
When a `ChapterMarker` docks (sticks to the top), it toggles `.is-docked` on its `.chapter-nav` wrapper. CSS `:has()` picks this up and halves the touching borders between the project marker and the chapter marker — so the combined border reads as 2px, not 4px. No JS coordination between components.

### Tray open conditions
The tray only opens when the marker is docked. Clicking an undocked marker scrolls that section into view instead. The scroll target accounts for `borderTopWidth` so the marker lands exactly at `--marker-top`.

### Undock on open
When the tray opens, the marker switches from `position: sticky` to `position: relative`. Before switching, `openTray()` instant-scrolls the sheet top to `y=0` — this keeps the marker visually at `MARKER_TOP` with no jump.

### Navigate from tray
`navigate()` suppresses the gap contraction animation (`data-navigating` attr) before calling `closeTray()`. This makes the layout snap to its settled state instantly, so `getBoundingClientRect()` reads the correct post-contraction position before smooth scroll is fired.

### Tray close triggers
- Tap/click outside the tray
- A *different* chapter marker docks (user scrolled into another chapter)
- Does **not** close when the user's own marker undocks — allows scrolling up to see tray items above.

### Background dim and tilt
When the tray opens, all sheet content (`.sheet > :not(.nav-sled)`) receives `filter: brightness(0.68) saturate(0.2)` and a random `rotate(--tilt)`. Tilt values are drawn from `{-2, -1, +1, +2}deg` only — rerandomised on every open.

---

## Sync points

These two values must always match:

| Location | Value |
|---|---|
| `ChapterMarker.tsx` → `const MARKER_TOP = 24` | JavaScript |
| `nav.css` → `--marker-top: 24px` | CSS |

If you change the sticky offset, update both.

---

## File structure

```
nav/
  README.md          ← you are here
  index.ts           ← public exports (import from here)
  nav.css            ← all nav styles (import in route layout)
  ChapterMarker.tsx  ← sticky chapter marker + tray behavior
  ProjectMarker.tsx  ← fixed left marker + CSS variable measurement
  ExitMarker.tsx     ← fixed right marker + exit link
  chapters.ts        ← biconomy-specific chapter data (not shared)
```

`chapters.ts` is page-specific and stays in this folder. For other pages, create an equivalent file alongside their own route and pass it in — the components are data-agnostic.
