# CLAUDE.md — niharya/88g

This file is the persistent working contract for Claude Code sessions on this repo.
Read it at the start of every session. Do not drift from it without explicit instruction.

## Project

This is Nihar Bhagat's portfolio site — built for studio heads, creative directors, and product leaders.

* Live site: `https://nihar.works`
* Repo: `niharya/88g`
* Stack: **Next.js 15 (App Router), React 19, Framer Motion 12, TypeScript**

The portfolio contains long-form editorial project routes built as sheet-stack reading environments.

Tone: precise, calm, human. Avoid hype and abstraction.

Protect: evidence, docking relationships, material coherence.

Common failure modes: over-cleaning, generic polish, broken relationships.

## Reference material

Everything under `reference/` is read-only context. Never modify it.

* `reference/88g-source/` — original Biconomy source
* `reference/portfolio-vanilla/` — original vanilla portfolio source
* `reference/v0-duel-game/` — React/TypeScript Rug Rumble game source

## Current focus

**Current focus: `/rr` (Rug Rumble).**

`/biconomy` is complete. The patterns it established have been promoted into the shared design system layer (see *Shared design system* below) and are consumed by `/rr` from there.

Do not modify `/biconomy` unless:

* a shared primitive genuinely needs to move into the shared layer
* a shared bug is discovered during `/rr` work
* a shared global token/class must become parameterizable

## RR working mode

Rug Rumble should be built in **two distinct phases**.

### Phase 1 — clean port

* Port the vanilla section faithfully into the Next.js route
* Reuse established shared primitives, tokens, and route patterns
* Preserve structure and interaction before compositional reinvention
* Do **not** rearrange during this phase unless explicitly instructed

### Phase 2 — rearrangement

* Rearrangement happens only after the clean port of that section is approved
* Prefer recomposition over rewriting
* Keep logic and working interactions intact unless explicitly asked to change them

Do not combine Phase 1 and Phase 2 by default.

## Shared design system

`app/components/` and `app/globals.css` together are the project's shared design system layer. Both `/biconomy` and `/rr` consume from it directly. Neither route imports from the other.

What currently lives in shared:

* `app/components/` — `Sheet`, `PaperFilter`, `useReveal`, `ChapterMarker`, `ProjectMarker`, `ExitMarker`, `MarkerSlot`, `useDockedMarker`
* `app/globals.css` — design tokens, the `.mat` surface (grid + paper noise), `.fonts-ready` gating, typography scale, `.section-reveal` entrance system, `.transition-slot`/`.transition-pane` layout

**Promotion rule.** A primitive moves into shared the **second** time it's needed, not the first. Flag the move before doing it — don't silent-promote. If you find yourself copying a pattern from one route to another, stop and promote instead. If you find yourself touching a shared primitive, grep both routes first.

`/biconomy` was built before `/rr`, so much of what's currently in shared was originally prototyped there. That makes it the historical donor — but it is not a code dependency. New shared primitives can originate in any route once they're needed twice.

## Route-level notes

Each route has a `NOTES.md` file that documents architectural decisions, anomalies, cross-file wiring, and don't-touch items specific to that route. These are not code tours — they record things you would not figure out by reading the code in isolation.

* `app/(works)/rr/NOTES.md`
* `app/(works)/biconomy/NOTES.md`
* `app/(works)/selected/NOTES.md`
* `app/components/nav/NOTES.md`

**Log anomalies in the route they affect.** If a global change (e.g. a shared primitive update) causes a side effect in a specific route, document it in that route's `NOTES.md`. If it affects multiple routes, document it in each.

## Files in play for `/rr`

Route-local:

* `app/(works)/rr/page.tsx`
* `app/(works)/rr/layout.tsx`
* `app/(works)/rr/rr.css`
* `app/(works)/rr/components/`
* `app/(works)/rr/NOTES.md`

Shell (persistent across routes):

* `app/(works)/layout.tsx` — workbench, PaperFilter, ShellNav, TransitionSlot
* `app/(works)/TransitionSlot.tsx` — page transitions (DOM ghost-clone + WAAPI)
* `app/(works)/ShellNav.tsx` — persistent ProjectMarker + ExitMarker

Shared layers (see *Shared design system* above):

* `app/components/`
* `app/globals.css`

## Stack and implementation philosophy

* Use plain CSS files. No Tailwind. No CSS modules. No styled-components.
* CSS handles presentation.
* React handles state and interaction.
* Framer Motion is for spring physics, presence transitions, and scroll-linked transforms only where it materially helps.
* Use route-local modules with clear ownership.
* Shared tokens live in `globals.css`. Route tokens live in route CSS files.

If a simple CSS transition is enough, use CSS.

## Motion vocabulary

All motion in the portfolio follows a paper-physical language. Things glide, settle, and land — never snap, bounce, or overshoot.

### Rules

1. **One easing curve.** `--ease-paper: cubic-bezier(0.5, 0, 0.2, 1)` — confident start, long gentle deceleration. Used for section reveals, page transitions, and all CSS transitions. Defined in `globals.css`, mirrored as `EASE` in `TransitionSlot.tsx`.
2. **Long durations.** 0.5–0.9s range. Nothing should feel fast or urgent.
3. **No bounce, no overshoot.** Springs may be used for dampened settle only (bounce: 0). Never elastic.
4. **Native scroll.** No smooth-scroll libraries, no scroll hijacking. The browser's physics stay in control.
5. **Scroll-mapped transforms where useful.** `useScroll` + `useTransform` + `useSpring` for elements that respond to scroll position — not just trigger-on-intersection.

### Section reveal choreography

Mats are loose sheets in a stack. Scrolling browses through them.

* **Phase 1 — mat glides in.** Translates 32px upward, opacity 0.7s / transform 0.8s. Feels like a mat sliding to rest against the previous one.
* **Phase 2 — content placed.** Objects on the mat settle with a random micro-rotation (±1.5°, truly random per visit) and a shadow that shrinks as they land. Shadow goes from lifted (diffuse, 8px offset) to resting (tight, 1px offset). 0.7s, staggered 0.15s after mat.
* **Phase 3 — nav-sled docks.** Chapter marker settles last. 0.5s, staggered 0.25s after mat.

All three phases use `--ease-paper`.

Random rotation is set via `--place-rotate` CSS custom property, assigned by `Sheet.tsx` on mount.

## Responsive rules

Breakpoints: mobile < 768px, tablet 768–1023px, desktop ≥ 1024px.

### Principles

* **Recompose, don't replicate.** Mobile gets a purposefully different composition that preserves editorial intent. Don't scale desktop down.
* **No hacks.** If a responsive need comes up, implement it cleanly. No `transform: scale()` on text. No `!important` chains. No hidden-but-present-in-DOM tricks that misrepresent content. If the clean solution takes five more minutes, spend them.
* **Structural breakpoints for layout changes** (absolute → flow). **Fluid scaling for spacing/sizing** (clamp, vw, container queries). Don't use JS media queries — risks hydration mismatches.
* **Halve, don't delete, brand details** that carry identity. The 8px black viewport frame becomes 4px on mobile, not hidden.
* **Different copy per viewport**: render both spans in JSX and use CSS visibility classes (`.xxx--desktop` / `.xxx--mobile`). Clean, no hydration risk, no JS.
* **Decorative elements** (timeline bars, dot clusters, spatial markers) are desktop features. Remove or reduce on mobile in favor of inline color-coding, textual markers, or simple dividers.

### Global mobile patterns

* **Nav pills (project marker + chapter marker)**: centered horizontally, sticky at `top: 0`, tucked into the top black frame. Pulled up via negative `margin-top` equal to the workbench padding so the pill's top edge sits flush with the viewport top; the 4px black frame (z: 9999) overlaps the pill's first few pixels for the tucked feel. Stays in place on scroll.
* **Mat as last element**: when a `.mat` (or `.selected-mat`, etc.) is the final content block on a page, it extends full-bleed horizontally **and** fills remaining vertical viewport space via `flex: 1 0 auto` on the mat with its ancestor as a flex column. This avoids orphaning the page background below the mat. Negative `margin-bottom` equal to workbench padding lets it bleed to the bottom frame edge.
* **Black viewport frame**: 8px on desktop, 4px on mobile (in `globals.css` `.workbench::before`).

### When implementing

Start with the mobile composition as a separate design, not a derivative of desktop. If an approach feels hacky, it probably is — find a better mechanism (CSS visibility classes, clamp, container queries, breakpoint-scoped property overrides) before committing.

## Core design principle

**Elements should feel docked, tucked, or suspended with intention — not placed nearby.**

This applies across all routes.

Concretely:

* notes should feel docked to evidence
* cards should feel stacked, not listed
* reveal states should feel latent and released, not spawned
* controls must work or not look interactive
* sheets should feel physically related through the mat surface

## Implementation constraints

### 1. Proof artifacts must remain proof artifacts

If a route shows sketches, screenshots, game boards, cards, or mockups, preserve the feeling of evidence. Do not leave placeholder emptiness.

### 2. Controls must not lie

If something looks interactive, it must work, or it must stop implying interaction.

### 3. Route-specific ownership

Keep styles, state, and logic close to the route. Promote to shared only when two routes genuinely need the same thing.

### 4. Preserve authored values

Do not normalize hand-authored spacing, sizing, or offsets just because they are unusual. Preserve values that contribute to the reading environment.

### 5. Chapter tray tilt behavior

Do not change the established chapter tray tilt behavior unless explicitly asked.

## Workflow discipline

### Analyze before you build

Before implementing any section:

1. Read the route's `NOTES.md` for decisions, anomalies, and don't-touch items
2. Read only the relevant vanilla source for that section
3. Read only the closest existing pattern from `/biconomy` or shared primitives
4. Present a short mapping of vanilla structure to the current system
5. Wait for confirmation before writing code

Do not skip this.

### Respect for design

* Do not invent layout structure
* Do not add spacing, padding, or margins casually
* Preserve intentional offsets, rotations, and gaps
* If something has no clear precedent, flag it before building

### Work rhythm

* Work in chunks
* One section or sub-part at a time
* Review before moving on
* Do not move to the next chunk automatically unless explicitly told to continue

### Token discipline

To reduce token use and drift:

* do not read the entire repo eagerly
* do not read full reference directories
* read only the current section’s source, the closest matching pattern, and directly relevant shared files
* keep responses tight and scoped to the active chunk

## Versioning and pushing

Every push bumps the **minor** version in `package.json` by one (`0.1.0` → `0.2.0` → `0.3.0` …).

Before pushing:

1. Bump `package.json` `version` (minor +1, patch reset to 0)
2. Verify the change works (typecheck, dev server smoke check) — never push unverified work
3. Commit the bump (either bundled with the work or as a dedicated `release: vX.Y.0` commit)
4. Tag the tip: `git tag vX.Y.0`
5. Push commits **and** tags: `git push && git push --tags`

Confirm with the user before pushing. Don't push unannounced.

## Agent usage

Before implementation, select the relevant agent(s):

* **portfolio-guardian** → tone, integrity, portfolio fit
* **route-auditor** → before touching any route; checks NOTES.md and constraints
* **frontend-craft** → layout, motion, CSS, interaction decisions
* **anomaly-librarian** → when a non-obvious constraint or side-effect is discovered

Before writing code: identify the task, select agent(s), summarize constraints briefly, then implement. Do not make agent usage verbose in responses.

## Session-start checklist

Before implementing anything, confirm:

* current file/folder structure still matches this document
* shared primitives still exist where expected
* `globals.css` tokens have not materially changed
* anything promoted to shared is imported from the new location
* read the `NOTES.md` for the route you are about to work on — it contains decisions, anomalies, and don't-touch items you will not find in the code alone

*Last updated: April 2026.*
