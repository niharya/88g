# CLAUDE.md — niharya/88g

This file is the persistent working contract for Claude Code sessions on this repo.
Read it at the start of every session. Do not drift from it without explicit instruction.

## Project

This is Nihar Bhagat's portfolio site.

* Live site: `https://nihar.works`
* Repo: `niharya/88g`
* Stack: **Next.js 15 (App Router), React 19, Framer Motion 12, TypeScript**

The portfolio contains long-form editorial project routes built as sheet-stack reading environments.

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

* `app/components/` — `Sheet`, `PaperFilter`, `ChapterMarker`, `ProjectMarker`, `ExitMarker`
* `app/globals.css` — design tokens, the `.mat` surface (grid + paper noise), `.fonts-ready` gating, typography scale

**Promotion rule.** A primitive moves into shared the **second** time it's needed, not the first. Flag the move before doing it — don't silent-promote. If you find yourself copying a pattern from one route to another, stop and promote instead. If you find yourself touching a shared primitive, grep both routes first.

`/biconomy` was built before `/rr`, so much of what's currently in shared was originally prototyped there. That makes it the historical donor — but it is not a code dependency. New shared primitives can originate in any route once they're needed twice.

## Files in play for `/rr`

Route-local:

* `app/rr/page.tsx`
* `app/rr/layout.tsx`
* `app/rr/rr.css`
* `app/rr/nav/`
* `app/rr/components/`

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

1. Read only the relevant vanilla source for that section
2. Read only the closest existing pattern from `/biconomy` or shared primitives
3. Present a short mapping of vanilla structure to the current system
4. Wait for confirmation before writing code

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

## Session-start checklist

Before implementing anything, confirm:

* current file/folder structure still matches this document
* shared primitives still exist where expected
* `globals.css` tokens have not materially changed
* anything promoted to shared is imported from the new location

*Last updated: April 2026.*
