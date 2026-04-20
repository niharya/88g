# /selected — Route Notes

## Overview

The `/selected` page is the portfolio landing. It has two main areas:
- **AboutCard** (left) — editorial statement
- **Timeline + Archive** (right) — vertical timeline with project cards and an expandable archive of previous works

This document covers the **archive panel timeline** — the expandable section under "Works from the previous portfolio."

---

## Archive timeline model

The archive timeline is a vertical strip of colored bars, year labels, and entry cards. It represents a chronological work history reading **top (recent) to bottom (older)**.

### Core concepts

**Bars** represent time spans. Each project has a colored bar whose height is proportional to the project's duration.

**Nesting** encodes relationships. A short bar sitting inside a longer bar means that project was done as part of the longer engagement. Example: the olive bar (Ecochain) sits inside the mint bar (Slangbusters) — Ecochain was a client project done during the Slangbusters tenure.

**Year labels** are anchored to bar edges or entry meta lines. They mark when a project started or ended. A year belongs to whichever project it contextualizes — `20` sits on the mint bar but marks when Ecochain started within Slangbusters.

**Entries** are the text cards (title + role/company) positioned alongside their bars.

### Current projects (top to bottom)

| Color     | Project      | Role              | Year | Bar type   |
|-----------|--------------|-------------------|------|------------|
| yellow    | Connektion   | Product Designer  | 2021 | Standalone |
| aleyr     | Aleyr        | Creative Director | 2020 | Nested inside mint |
| olive     | Ecochain     | Creative Director | 2019 | Nested inside mint |
| codezeros | Codezeros    | Creative Director | 2018 | Nested inside mint |
| mint      | Slangbusters | Creative Director | 2018–20 | Long, contains aleyr/olive/codezeros |

All five archive projects use page-local tokens in `selected.css` under `.selected-workbench`, derived from actual brand hex values with a primary/secondary color system:
- Primary hue → `-100` (bg), `-800` (text/borders), `-960` (dark borders)
- Secondary hue → `-240` (hover bar fill)

Token origins: Connektion teal #01F2F5, Aleyr purple #723CC5 / pink #FF5581, Ecochain green #4CB400 / off-white, Codezeros orange-red #FF4B3F / golden #F9A12E.

---

## Spacing system

All values are multiples of **4px** or **8px**.

### Grid tokens

| Token | Value | Usage |
|-------|-------|-------|
| Number-to-bar-edge | 4px | Year label to its corresponding bar edge |
| Bar gap | 16px | Space between non-touching bars |
| Entry spacing | 88px | Vertical distance between entry tops |
| Title height | 36px | Fixed height of `.ap-entry__title` (2-line max) |
| Dot cluster gap | 8px | Between dots in the dot clusters |
| Nested bar height | 16px | Small marker for nested projects |

### Position math

All positions are **relative to the archive panel** (`.selected-archive-panel`).

**Entry positions** follow the 88px rhythm:
```
entry[0].top = 36
entry[n].top = 36 + (n * 88)
```

**Meta line center** (where year labels align):
```
meta_center = entry.top + title_height(36) + half_meta_height(10) = entry.top + 46
```

**Year label CSS `top`** = meta_center (labels use `transform: translate(-100%, -50%)` so `top` is their visual center).

**Bar positioning from year labels** (4px padding rule):
- Year at TOP of bar: `bar.top = year_center - 6(half_label) - 4(padding)` = `year_center - 10`
- Year at BOTTOM of bar: `bar.bottom = year_center + 6 + 4` = `year_center + 10`

**Bar gap**: bottom of bar N to top of bar N+1 = 16px.

### Current positions

```
Dots:            top: 2    (12px gap to yellow bar at 36)

Yellow bar:      top: 36,  h: 55,  bottom: 91
  Connektion:    top: 36
  21:            top: 81   (at Connektion meta)

  ── gap ──

Mint bar:        top: 114, h: 329, bottom: 443
  20 (mint):     top: 124  (at mint bar top, belongs to Slangbusters)

  Aleyr:         top: 124
  Aleyr bar:     top: 159, h: 20,  bottom: 179  (nested)
  20 (aleyr):    top: 169  (at Aleyr meta)

  Ecochain:      top: 212
  Ecochain bar:  top: 247, h: 20,  bottom: 267  (nested)
  19:            top: 257  (at Ecochain meta)

  Codezeros:     top: 300
  Codezeros bar: top: 335, h: 20,  bottom: 355  (nested)
  18 (codezeros):top: 345  (at Codezeros meta)

  Slangbusters:  top: 388
  18 (mint):     top: 433  (at mint bar bottom, belongs to Slangbusters)

Entry width:     300px (left: 17px → 12px gap from bar)
Panel width:     340px
Panel height:    468px
```

---

## Main timeline positions

All positions relative to `.selected-tl` (which is the full mat area).

```
Now dot:         left: 143, top: 64, 16×16
Now label:       left: 139 (4px gap to dot left), top: 72, anchor: right-center
Greeting:        left: 163 (4px gap from dot right), top: 64

Top dots:        left: 148, top: 92   (12px gap below dot bottom 80)
Blue bar:        left: 148, top: 126, h: 374, bottom: 500
Yellow bar:      left: 148, top: 256, h: 46
2025:            left: 144, top: 136  (bar-top marker)
Q4•25:           left: 144, top: 280  (Terra role center)
23:              left: 144, top: 478  (Blue role center)
Bot dots:        left: 148, top: 512  (12px gap below bar bottom 500)

Card Terra:      left: 164, top: 126  (aligns with blue bar top)
Card Blue:       left: 164, top: 324

Nameplates:      left: 133
  Names Coined:  top: 545
  Marks/Symbols: top: 595
Single dots:     left: 148
  mid1:          top: 585
  mid2:          top: 635
Archive toggle:  left: 133, top: 645
Archive panel:   left: 148, top: 685
```

---

## Typography

### Year labels (both timelines)

System monospace stack for even digit widths:
```
font-family: ui-monospace, 'SF Mono', 'Cascadia Mono', 'Segoe UI Mono', Menlo, Monaco, Consolas, monospace;
font-size: 11px;
font-weight: 600;
letter-spacing: -0.3px;
```

### Meta / role text (archive entries + project cards)

Uses h5 weight via Google Sans Flex variable axes:
```
font-weight: 640;
font-variation-settings: 'wdth' 120, 'wght' 640, 'GRAD' 64, 'ROND' 0, 'opsz' 18;
```

### Now label

Same monospace stack as year labels. Anchored right (`transform: translate(-100%, -50%)`).

---

## Spacing grid

### Consistent gaps

| Gap | Value | Where |
|-----|-------|-------|
| Dots-to-bar | 12px | Top dots → blue bar, blue bar → bot dots, archive dots → yellow bar |
| Content-to-bar | 12px | Entry left edge to bar (entry `left: 17px`, bar at `left: 1px` + `width: 4px` = 5px → 17-5 = 12px gap) |
| Label-to-dot | 4px | "Now" label right edge to dot left; greeting left to dot right |
| Year-to-bar edge | ~4.5px | Year text edge to nearest bar edge (year_center ± 10px from bar edge) |
| Entry flex gap | 2px | Between title and meta within each archive entry |
| Dot cluster gap | 8px | Between dots within a cluster |

### 4px horizontal gap rule

Labels maintain 4px clearance to adjacent elements:
- "Now" at `left: 139px` → 4px to dot at 143px
- Greeting at `left: 163px` → 4px from dot right edge (143 + 16 = 159)

---

## Icons

Two custom Lucide-geometry SVG icons with CSS-only hover animations. Both are hand-rolled (not imported from `lucide-react`), using the same pattern: a named inner class (`<path>` or `<g>`) gets `translate` on parent hover, `0.3s ease-in-out`.

**IconExternalLink** (`components/IconExternalLink.tsx`) — archive entries. Arrow group slides diagonally:
```css
a.ap-entry:hover .icon-ext .icon-ext-arrow { translate: 2px -2px; }
```

**IconChevronRight** (`components/IconChevronRight.tsx`) — project cards. Chevron path nudges right:
```css
.project-card:hover .project-card__arrow .icon-chevron-shaft { translate: 3px 0; }
```

Arrow color inherits from variant: `--terra-720` (Terra) / `--blue-800` (Blue), set on `.project-card__arrow`.

Material Symbols remains for non-animated icons (nav markers, archive toggle).

---

## Pending migration — `.ap-entry__hint` → `<Monostamp>`

The "Opens in new tab" hint pill on archive entries ([selected.css:705-734](selected.css:705)) is the
original instance of the shell pattern that has been promoted to
`app/components/Monostamp.tsx` — monospace text, paper-cream fill, hairline
border, tone-colored ink. The second consumer (note-pointer stamps in
`/biconomy`) already uses `<Monostamp>`.

This hint is still inline CSS for now. Migration is safe but non-trivial:
the hint has **route-specific hover behavior** (hidden by default, slides
in on `a.ap-entry:hover` with opacity + translate transitions) that must
stay in `selected.css`. Only the **visual shell** — bg, border, typography,
padding, radius — should move to the `<Monostamp>` component, keeping the
positioning/transition overrides local.

Tones needed: `connektion`, `aleyr`, `olive` (ecochain), `codezeros`, `mint`.
`mint` / `olive` are already in `MonostampTone`. `connektion`, `aleyr`,
`codezeros`, `ecochain` are **not** — their color tokens currently live only
in [selected.css:18+](selected.css:18) (route-scoped), not in `globals.css`.
Migration sequence:
1. Decide: promote those tokens to `globals.css` (makes tones available
   anywhere), or keep them in `selected.css` and scope a route-local
   `MonostampTone` extension.
2. Add the matching ramps (560 / 720 / 800 / 960) — some are missing today.
3. Extend `MonostampTone` + the dark/light/is-active CSS blocks with the
   new tones.
4. Swap `.ap-entry__hint` shell styles to use `<Monostamp>`.

**What will break if this isn't done:** nothing immediate. It's technical
debt — drift risk if the Monostamp base styling changes later.

---

## Component ownership

The `/selected` page has three components:

| Component | Owns | Props |
|-----------|------|-------|
| **SelectedContent** | State (`archiveOpen`), scroll behavior | — |
| **Timeline** | Entire vertical sequence: Now dot → dots → bars → cards → year labels → nameplates → single dots → archive toggle | `isArchiveOpen`, `onArchiveToggle` |
| **ArchivePanel** | Expandable archive content only (AnimatePresence) | `isOpen` |

The **archive toggle button** lives in Timeline, not ArchivePanel. It's visually part of the main timeline sequence and must participate in the unified delay train. ArchivePanel only contains the content that appears/disappears.

---

## Animation: train metaphor

All elements animate in a **top-to-bottom sequence**, as if an imaginary cursor is drawing the timeline downward. Bars grow via `scaleY` from `transform-origin: top center`.

The train runs across **two scopes**:

1. **Timeline** — unified delay map from Now dot (0.30s) through archive toggle (1.28s)
2. **ArchivePanel** — internal delay map starting at 0.06s (relative to panel mount)

### Sequencing rules

1. Bars are **sequential** — the next bar starts only after the previous bar's spring is visually complete.
2. Years and entries appear **as the train reaches their vertical position** within the current bar's growth.
3. Nested bars (olive, aleyr, codezeros) appear mid-parent (mint) when the train reaches their `top`.

### Animation patterns

| Element type | Initial | Animate | Spring | Direction |
|-------------|---------|---------|--------|-----------|
| Dots | `opacity: 0, scale: 0` | `opacity: 1, scale: 1` | SPRING_POP (0.3s/0.35) | Pop in place |
| Bars | `scaleY: 0` | `scaleY: 1` | SPRING or SPRING_LONG | Grow top-to-bottom |
| Cards/Entries | `opacity: 0, y: -8` | `opacity: 1, y: 0` | SPRING_PLACE (0.45s/0.25) or SPRING_ENTRY (0.3s/0.12) | Fall from above (top-to-bottom) |
| Nameplates | `opacity: 0, y: -8` | `opacity: 1, y: 0` | SPRING_PLACE (0.45s/0.25) | Fall from above |
| Year labels | `opacity: 0` | `opacity: 1` | duration 0.14–0.25s | Fade |

**Important**: all cards, entries, nameplates, and the archive toggle animate `y: -8 → 0` (top-to-bottom), matching the train direction. Never use `y: positive → 0` (bottom-to-top).

### Delay calculation

For elements during a bar's growth, delay is proportional to their position within the bar's range:

```
element_delay = bar_start_delay + ((element.top - bar.top) / bar.height) * bar_spring_duration
```

### Timeline delay table (Timeline.tsx)

```
D.dot       = 0.30   Now dot + label + greeting
D.dotsTop0  = 0.38   Top dot cluster (staggered)
D.dotsTop1  = 0.42
D.dotsTop2  = 0.46
D.barBlue   = 0.50   Blue bar (spring 0.5s, done ~1.00)
D.year2025  = 0.51   136 — just inside bar top
D.cardTerra = 0.51   126 — at bar top
D.barYellow = 0.68   256 — 35% into blue
D.yearQ425  = 0.70   280 — 41% into blue (Terra role center)
D.cardBlue  = 0.76   324 — 53% into blue
D.year23    = 0.98   478 — 94% into blue
D.dotsBot0  = 1.02   Bottom dot cluster (staggered)
D.dotsBot1  = 1.06
D.dotsBot2  = 1.10
D.names     = 1.14   Names Coined nameplate
D.dotMid1   = 1.18   Single dot
D.marks     = 1.20   Marks And Symbols nameplate
D.dotMid2   = 1.24   Single dot
D.archive   = 1.28   Archive toggle (last element)
```

### Archive delay table (ArchivePanel.tsx)

```
D.dots          = 0.06   (staggered +0.04 per dot)
D.barYellow     = 0.12   (spring 0.4s, done ~0.52)
D.connektion    = 0.28
D.year21        = 0.42
D.barMint       = 0.54   (spring 0.65s, done ~1.19)
D.year20top     = 0.56   (mint-colored, at bar top)
D.aleyr         = 0.58
D.barAleyr      = 0.65   (spring 0.3s)
D.year20        = 0.66   (aleyr-colored)
D.ecochain      = 0.74
D.barEcochain   = 0.82   (spring 0.3s)
D.year19        = 0.83
D.codezeros     = 0.92
D.barCodezeros  = 1.00   (spring 0.3s)
D.year18        = 1.01   (codezeros-colored)
D.slangbusters  = 1.09
D.year18bot     = 1.17   (mint-colored, at bar bottom)
```

### Spring types

| Name | Duration | Bounce | Used for |
|------|----------|--------|----------|
| SPRING | 0.4–0.5s | 0.15 | Standard bars (Timeline: 0.5s, Archive: 0.4s) |
| SPRING_POP | 0.3s | 0.35 | Dots (high bounce, snappy) |
| SPRING_PLACE | 0.45s | 0.25 | Cards, nameplates, archive toggle |
| SPRING_PILL | 0.4s | 0.15 | (reserved) |
| SPRING_LONG | 0.65s | 0.12 | Tall bars (mint in archive) |
| SPRING_ENTRY | 0.3s | 0.12 | Archive entries, short bars |

---

## Hover system

When an entry is hovered, its **bar, year labels, and text highlight** while everything else dims.

### Mechanism

CSS `:has()` on `.selected-archive-panel` — no JS state needed. `filter: opacity()` is used instead of `opacity` to avoid conflicting with Framer Motion's inline styles.

Transition: `0.35s ease-in-out` on both filter and background, applied to all interactive elements on their base state (so hover-out is equally gentle).

### Highlight behavior

- Dimmed state: `filter: opacity(0.35)`
- Highlighted bar: `filter: opacity(1)` + background stepped up one token (e.g., `--yellow-100` to `--yellow-240`)
- Highlighted years/entries: `filter: opacity(1)`

### Hover groupings

**Main timeline** (CSS `:has()` on `.selected-tl`):

| Card hovered | Highlights | Note |
|--------------|------------|------|
| Terra (Rug Rumble) | yellow bar, Q4•25, card | 2025 dims — it's a bar-top marker, not Terra-specific |
| Blue (Biconomy) | blue bar, 2025, 23, card | Q4•25 dims |

**Archive** (CSS `:has()` on `.selected-archive-panel`):

| Entry hovered | Highlights | Note |
|---------------|------------|------|
| Connektion (yellow) | yellow bar, year 21 | |
| Aleyr | aleyr bar, year 20 | |
| Ecochain (olive) | olive bar, year 19 | |
| Codezeros | codezeros bar, year 18 | |
| Slangbusters (mint) | mint bar, years 20 (top) & 18 (bottom) | Mint-colored year labels at bar edges |

---

## Recipe: adding a new project

### 1. Decide placement

- Where in the chronological order does it go?
- Is it standalone or nested inside another bar?
- Pick a color token. Use globals if it exists, otherwise define page-local tokens in `selected.css` under `.selected-workbench`.

### 2. Calculate positions

```
new_entry.top = previous_entry.top + 88
meta_center = new_entry.top + 46
```

For the bar:
- If year at top: `bar.top = year_center - 10`
- If year at bottom: `bar.bottom = year_center + 10`
- Maintain 16px gap from adjacent non-nested bars
- Nested bars: 16px height, positioned within parent bar's range

### 3. Update CSS (`selected.css`)

Add under each section:
- `.ap-entry--{color} { top: __px; }` — entry position
- `.ap-entry--{color} .ap-entry__meta { color: var(--{color}-800); }` — meta color
- `.selected-ap-year--{id} { top: __px; color: var(--{color}-800); }` — year label(s)
- `.selected-ap-bar--{id} { top: __px; height: __px; background: var(--{color}-100); border: 1px solid var(--{color}-800); }` — bar

Add hover group:
```css
.selected-archive-panel:has(.ap-entry--{color}:hover) .ap-entry--{color},
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-bar--{id},
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-year--{id} {
  filter: opacity(1);
}
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-bar--{id} {
  background: var(--{color}-240);
}
```

### 4. Update component (`ArchivePanel.tsx`)

- Add to `ARCHIVE_ENTRIES` array
- Add bar, year(s), and entry JSX in the correct top-to-bottom position
- Calculate delay using the train formula and add to `D` object
- Recalculate delays for any elements pushed down

### 5. Adjust panel height

Update `.selected-archive-panel` height if content extends beyond current value (468px). Also update `.selected-mat--archive-open` min-height and `.selected-layout:has(...)` min-height.

---

## Don't-touch items

- **Hover uses `filter: opacity()` not `opacity`** — Framer Motion sets inline `opacity` after entrance animations, which would override CSS class rules. `filter` is a separate property and works.
- **Bar `transform-origin: top center`** is set on the base `.selected-ap-bar` class. All bars grow top-to-bottom. Don't override per-bar unless explicitly asked.
- **Year label `transform: translate(-100%, -50%)`** — `top` value = visual center. Account for this in all position math.
- **The `D` delay object uses absolute values, not relative** — changing one bar's timing requires updating everything below it.
- **Archive toggle lives in Timeline, not ArchivePanel** — it participates in the main delay train. Moving it to ArchivePanel would break the sequencing.
- **Animation direction is always top-to-bottom** — entries/cards/nameplates use `y: -8 → 0`. Never use positive `y` initial values (bottom-to-top) as this contradicts the train metaphor.
- **Dots use pop animation, not fade** — `scale: 0 → 1` with SPRING_POP. Dot clusters are staggered (+0.04s per dot).
- **Year labels use system monospace**, not the variable display font. This ensures even digit widths without needing tabular-nums or variable font tricks.
- **No autoscroll on archive toggle** — `handleToggle` simply flips state. Scroll behavior was removed because it was disorienting.
- **12px gap grid** — dots-to-bar and content-to-bar gaps are consistently 12px. Do not change without recalculating all adjacent positions.
- **4px label clearance** — "Now" label and greeting maintain 4px gaps to the dot. Year labels maintain ~4.5px from bar edges.
- **Icon arrow animation is CSS-only** — `translate` on `.icon-ext-arrow` group, triggered by parent `a.ap-entry:hover`. No Framer Motion involvement.

### Hint pill

The "opens in new tab" pill uses a neutral shell (grey bg/border) with only the text color themed per project. This avoids visual noise while still tying the pill to its entry.

```
background: var(--grey-960);  /* #F5F5F5 */
border-color: var(--grey-880);  /* #E0E0E0 */
color: var(--{project}-800);  /* themed text */
```

---

## Responsive anomalies (mobile ≤767px)

The first responsive pass on `/selected` introduced several structural constraints
that are not obvious from reading the code. Mobile changes begin at
`selected.css` line ~842; tablet overrides begin at line ~1178.

### `.selected-archive-panel` is a **sibling** of `.selected-tl`, not a child

Both live inside `.selected-mat`. On desktop this doesn't matter because
everything is positioned absolutely. On mobile it does: the archive panel
cannot inherit horizontal padding from `.selected-tl`, so it repeats its own
`padding: 16px 32px 32px` to land in the same content column. If you change
the mat's horizontal inset, you must change **both** places.

**What breaks if you assume nesting:** archive entries drift out of the column
established by project cards and nameplates.

### Mat fills remaining viewport height via a three-link flex chain

```
.selected-workbench  { min-height: calc(100vh - 2*var(--workbench-pad-y));
                       display: flex; flex-direction: column; }
.selected-layout     { flex: 1; display: flex; flex-direction: column; }
.selected-mat        { flex: 1 0 auto; }
```

The mat grows to fill whatever vertical space the about card + nav-row leaves
behind, so the grid surface always reaches the black viewport frame at the
bottom. The chain is load-bearing: **any sibling added after `.selected-mat`
inside `.selected-layout` will steal the grow and orphan the mat short of
the frame.** If you need to add content below the mat, move it inside the
mat or re-engineer the chain.

### Sticky nav row uses negative margin-top to sit flush against the viewport top

```css
.selected-nav-row {
  position: sticky;
  top: 0;
  margin-top: calc(-1 * var(--workbench-pad-y));
  z-index: 40;
}
```

Without the negative margin, the sticky row would stick **below** the
workbench's top padding (the first position it could occupy in normal flow).
The negative margin pulls its initial position up by exactly the pad-y so
that `top: 0` sits the pill flush at the viewport edge (the black frame is desktop-only and hidden on mobile).

**Don't touch without reading:** the negative margin value is tied to
`--workbench-pad-y`, not a magic number. If `--workbench-pad-y` is retuned
for mobile (currently 32px), this continues to work. Hardcoding `-32px`
here would re-introduce a stale-value bug.

### Archive year lives in the DOM on desktop, hidden by CSS

`ArchivePanel.tsx` renders every entry's meta as
`{role} • {company}<span className="ap-entry__year"> • {year}</span>`.
Globally `.ap-entry__year { display: none }`, and the mobile block flips
it to `display: inline`.

Implications:
- **Semantic payload:** screen readers, search engines, and link scrapers see
  the full string `"Product Designer • Connektion • 2021"` on desktop even
  though the visible text is shorter. This is arguably a feature (the
  chronological context is carried to assistive tech via the hidden year),
  but it is a deliberate desktop/mobile **semantic mismatch** — flag it if
  a future a11y pass treats `display: none` content as "not for AT".
- **Copy discipline:** the year source of truth is the `ARCHIVE_ENTRIES`
  array in `ArchivePanel.tsx`. The desktop year-label components
  (`.selected-ap-year--*`) are separate, hand-placed elements. If the
  visible desktop year and the inline meta year ever disagree, the
  archive entries array is wrong.

### Responsive copy pattern — two sibling spans with CSS display toggling

`Timeline.tsx` lines 252–253 render both copies:

```tsx
<span className="... archive-toggle-label--desktop">Works from the previous portfolio</span>
<span className="... archive-toggle-label--mobile">Previous portfolio</span>
```

CSS toggles `display: inline` vs `display: none` at the 767px breakpoint.

**Don't update one without the other.** There is no shared source of truth —
the two strings will drift silently unless a linter or convention catches it.
If this pattern proliferates, consider promoting a `<ResponsiveCopy desktop mobile />`
primitive into shared components rather than copying the two-span pattern
into more routes.

### Hover-only affordances disabled on mobile

`.ap-entry__hint` (the "opens in new tab" pill) and the push-apart translation
on entry hover are both turned off in the mobile block because touch devices
don't have persistent hover. The hover highlights (`:has(:hover)` rules) are
explicitly reverted via `filter: none` / `background: revert`. Don't assume
these work on touch; they're desktop-only embellishments.

*Last updated: 15 April 2026.*
