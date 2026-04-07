# CLAUDE.md — niharya/portfolio

This file is the persistent working contract for Claude Code sessions on this repo.
Read it at the start of every session. Do not drift from it without explicit instruction.

---

## Project

This is Nihar Bhagat's portfolio site.

- Live site: `https://nihar.works`
- Repo: `niharya/portfolio`
- Stack: **Next.js 15 (App Router), React 19, Framer Motion 12, TypeScript**

The portfolio has multiple project routes. Each route is a long-form editorial
case study rendered as a sheet-stack reading environment.

### Reference material

Everything under `reference/` is read-only context — never modify it.

- `reference/88g-source/` — Original Biconomy page (Next.js 16 / React 18 / Tailwind / Jotai).
  Built by another dev. Used as content/interaction reference for the Biconomy port.
- `reference/portfolio-vanilla/` — The original vanilla HTML/CSS/JS portfolio site.
  Contains the source-of-truth content and structure for all routes being ported.
- `reference/v0-duel-game/` — React/TypeScript port of the Rug Rumble card game.
  Created with Vercel v0. Game logic is framework-agnostic. UI uses Tailwind + CSS vars.

---

## Active working context

**Current focus: `/rr` (Rug Rumble) — porting from vanilla to Next.js.**

`/biconomy` is already ported and serves as the **design system donor**. The Biconomy
route established how the vanilla design language maps to React/Next.js. New routes
should reuse its patterns (Sheet, surface, mat, ChapterMarker, notes rails) and
re-skin them for the route's own palette.

### Files in play for `/rr`

Route-specific (being created):
- `app/rr/page.tsx` — main page, sheet-stack composition
- `app/rr/layout.tsx` — font-ready gate (same pattern as biconomy)
- `app/rr/rr.css` — route-specific layout and surface tokens
- `app/rr/nav/` — chapters data, any RR-specific nav overrides
- `app/rr/components/` — section components and RR-unique interactions

Shared layers (may be touched):
- `app/globals.css` — design tokens, typography, shared surface classes
- `app/biconomy/nav/` — ChapterMarker, ProjectMarker, ExitMarker (reuse directly)
- `app/biconomy/components/Sheet.tsx` — sheet container (reuse directly)
- `app/biconomy/components/PaperFilter.tsx` — SVG displacement filter (reuse directly)

When a component is reused across routes, consider promoting it from
`app/biconomy/` to a shared `app/components/` directory. Flag this explicitly.

### Files in play for `/biconomy` (maintenance only)

`/biconomy` is complete. Do not modify it unless:
- A shared component needs to move to `app/components/`
- A shared CSS class in `globals.css` needs to become parameterizable
- A bug is found during RR work that traces back to a shared primitive

Route files:
- `app/biconomy/page.tsx`, `app/biconomy/layout.tsx`, `app/biconomy/biconomy.css`
- `app/biconomy/components/` — Intro, Flows, Demos, BIPs, Multiverse, API, StayingAnchored, etc.
- `app/biconomy/nav/` — ChapterMarker, ProjectMarker, ExitMarker, chapters.ts

---

## Stack and implementation philosophy

This repo is **Next.js / React / Framer Motion** — but with a vanilla-informed
sensibility. The original vanilla portfolio was hand-authored with intention.
The port preserves that.

### What this means in practice

- CSS handles presentation. Use plain CSS files, not CSS-in-JS or Tailwind utilities.
- JS/React handles state and interaction. Use `useState`, `useRef`, `useEffect`.
- Framer Motion handles physics-based animation (springs, AnimatePresence, scroll-driven
  transforms). Do not wrap everything in `<motion.div>` — only where springs or
  presence transitions genuinely earn their keep. Simple CSS transitions are fine.
- Route-specific modules with clear ownership. Each route has its own components/,
  nav/, and CSS file.
- No Tailwind. No CSS modules. No styled-components. Plain `.css` imports.
- Shared tokens live in `globals.css`. Route tokens live in route CSS files.

### When to use Framer Motion vs CSS transitions

**Framer Motion:** Spring physics, AnimatePresence (mount/unmount animation),
scroll-driven transforms (useScroll + useTransform), layout animations, staggered
entry sequences.

**CSS transitions:** Simple hover states, opacity fades, color changes, transform
tweens with known durations. If you can express it as `transition: X 0.3s ease`,
use CSS.

---

## Vanilla → Next.js mapping

This is the established translation table. Use it when porting any vanilla page.

| Vanilla concept | Next.js equivalent | Notes |
|---|---|---|
| `.layout`, `.pattern-bg` | `.workbench` | Page-level field |
| Section containers | `<Sheet>` component | Wraps each chapter in `.sheet.mat` |
| Graph-paper grid background | `.mat` with CSS grid pattern | Biconomy: 32px mint grid. RR: adapt color. |
| Paper texture overlay | `<PaperFilter>` SVG displacement | Shared across routes |
| Card surfaces | `.surface` with displaced paper effect | Background color varies per route |
| Sticky section nav | `<ChapterMarker>` per sheet | Interactive with tray + flyout |
| Fixed left pill | `<ProjectMarker>` | Route name (e.g. "Rug Rumble") |
| Fixed right pill | `<ExitMarker>` | Links to `/selection` |
| `document.querySelector` + class toggles | React state + conditional classNames | — |
| `IntersectionObserver` | Framer Motion `useInView` or custom hook | — |
| `setTimeout` cascades | `useEffect` with cleanup returns | — |
| Scroll listeners | Framer Motion `useScroll` + `useTransform` | — |
| DOM event pub-sub | React state/context or prop passing | — |
| `tokens.css` | `globals.css` | 1:1 token mapping (colors, spacing, typography, shadows) |
| `components/components.css` | `globals.css` utilities section | Merged into global styles |
| Route-specific CSS | `app/{route}/{route}.css` | Scoped to route |

---

## Rug Rumble: section plan

RR has 4 chapters. Each becomes a `<Sheet>` with a `<ChapterMarker>`.

| # | ID | Title | Date | Key content |
|---|---|---|---|---|
| 1 | `intro` | Introduction | Sep 2024 | Story card, North Star card, Constraints card, card stack (6 sketches) |
| 2 | `mechanics` | Game Mechanics | Oct 2024 | Rules card with tabs, game board mount, "incoming" subsection, photo clip |
| 3 | `cards` | Cards & UI | Nov 2024 | Card fan (5 evolution versions), tab-switching interface panel, notes overlay |
| 4 | `outcome` | Outcome | Dec 2024 | Outcome text, quote block, scrollable rules showcase strip |

### Component reuse from Biconomy

These Biconomy components apply directly to RR (re-skin colors):
- `Sheet` — section container with mat and nav-sled
- `PaperFilter` — SVG displacement texture
- `ProjectMarker` / `ExitMarker` — fixed nav pills
- `ChapterMarker` — sticky chapter marker with tray and flyout
- Notes rail pattern (from Flows) — for Cards & UI section's notes overlay

### RR-unique components to build

- `StoryCard` — text container with decorative strip/callout
- `NorthStarCard` — icon + label card
- `ConstraintsCard` — bordered grid with labeled rows
- `CardStack` — 6 sketch images that fan out on toggle
- `GameBoard` — mount point for v0-duel-game
- `RulesCard` — tabbed card container
- `CardFan` — 5 card versions with hover/click inspection states
- `InterfacePanel` — mockup viewer with notes
- `QuoteBlock` — quote with icon (potentially shared)
- `RulesShowcase` — horizontal scrollable rule card strip
- `SwitchPill` — two-state toggle

### Game integration

The v0-duel-game (`reference/v0-duel-game/`) provides:
- `lib/game-logic.ts` — pure functions, framework-agnostic. Copy as-is.
- `hooks/use-game.ts` — React hook wrapping game state. Copy as-is.
- `components/game/` — 7 UI components (game-board, number-card, face-down-card,
  score-tracker, deck-strip, rules-panel, peek-timer). Drop in raw, re-skin to
  portfolio tokens in a later pass.

The game mounts inside the Mechanics sheet. No shader — use a solid background.

---

## Page archetype

Both `/biconomy` and `/rr` are **editorial sheet-stack projects**:

- Long authored routes with structured reading progression
- Stacked paper / sheet feeling with chapter markers
- Local section interactions (carousels, toggles, reveals)
- Tactile surfaces with paper texture
- Designed reading environments

`/rr` is more playful than `/biconomy` — it includes an interactive game, a card
fan with hover states, and a showcase strip. But the underlying architecture
(sheet-stack, chapter nav, surface cards, notes rails) is the same.

---

## Core design principle

> **Elements should feel docked, tucked, or suspended with intention —
> not placed nearby.**

This applies across all project routes. Concretely:

- Notes should feel docked to evidence, not parked beside it
- Cards should feel physically stacked, not listed vertically
- Reveal states should feel latent and released, not detached and spawned
- Interactive controls must work or not look interactive (no dead affordances)
- Sheets should feel physically related through the mat surface, not flatly rendered

---

## Implementation constraints

### 1. Proof artifacts must remain proof artifacts

If the original page shows real evidence — sketches, screenshots, game boards,
card iterations, interface mockups — the port must preserve that feeling of proof.
Do not leave placeholder emptiness.

### 2. Controls must not lie

If something looks interactive (tabs, arrows, toggles, reveal states), it must
either work correctly or be restyled to not imply interactivity.

### 3. Route-specific ownership

Keep styles, state, and logic close to the route. Promote to shared only when
two routes genuinely need the same component.

### 4. Preserve authored values

Do not normalize hand-authored spacing, positioning, or sizing decisions.
These pages are composed by eye. Preserve authored values that contribute
to the reading environment.

### 5. Chapter tray — tilt behavior (do not revert)

When the chapter tray opens, every large element within each sheet
(`.sheet > :not(.nav-sled)`) gets an individual random tilt. Rules:

- Values from `{-2, -1, +1, +2}deg` only — no in-between, no zero
- Each element tilts independently (not the whole sheet)
- Tilts re-randomise on every open
- `--tilt` set as inline CSS custom property via JS; CSS consumes it
- Tray darkens background (`brightness(0.68)`) without blur
- Tray closes when a *different* chapter pill docks
- Do not close on "own pill undocks"

---

## Workflow discipline

### The cardinal rule: analyze before you build

The shared layout system (Sheet, mat, surface, PaperFilter, ChapterMarker,
ProjectMarker, ExitMarker) is **already working and proven**. It is not up
for reinvention. Every new section must be composed using this vocabulary.

Before implementing any section, you must:

1. **Read the vanilla HTML** for that section only (specific line range).
2. **Read the corresponding Biconomy component** that's closest in pattern.
3. **Present a mapping** to the user: "In the vanilla, X is a card surface
   with Y inside it. In our system, this maps to a `.surface` with Z. The
   interaction is similar to Biconomy's [component]. Does that read right?"
4. **Wait for confirmation** before writing code.

Do not skip this. Do not assume. If something in the vanilla doesn't clearly
map to an existing pattern, say so and ask.

### Respect for design

You are a senior developer working with a designer who cares about every
placement decision. That means:

- Do not invent layout structure. Map vanilla structure to existing patterns.
- Do not add spacing, padding, or margins that aren't in the reference.
- If something looks compositionally intentional in the vanilla (an offset,
  a rotation, a specific gap), preserve it and ask if unsure.
- If you're about to build something that has no Biconomy precedent, flag it:
  "This is new — here's my plan for it. Confirm?"

### Work rhythm

- Work in **chunks** by section or area — do not mix concerns.
- Every section starts with analysis, not code.
- After each chunk: review diffs before moving on.
- Commit after each working chunk with a clear, scoped message.
- If context gets long or ambiguous: **"where are we?"**
- Do not proceed past a section if controls don't work or surfaces feel flat.

### What not to read eagerly

Do not read the entire vanilla reference or the entire biconomy codebase at
session start. Read only what's needed for the current section. This saves
tokens and keeps focus tight. Specifically:

- Read the vanilla HTML for the section you're about to build (by line range).
- Read the Biconomy component that's closest in pattern.
- Read `globals.css` only if you need to check a token value.
- Do not read JS interaction files until you're implementing that interaction.

---

## Session-start checklist

Before implementing anything, confirm:

- [ ] Current file/folder structure matches this document
- [ ] Shared components referenced here still exist where stated
- [ ] `globals.css` tokens haven't changed since last session
- [ ] Any components promoted to shared are imported from the new location

---

*Last updated: April 2026. Update when active working context changes.*
