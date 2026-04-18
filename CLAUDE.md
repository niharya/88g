# CLAUDE.md — niharya/88g

This file is the persistent working contract for Claude Code sessions on this repo.
Read it at the start of every session. Do not drift from it without explicit instruction.

## What this file is (and isn't)

CLAUDE.md is a **working contract**, not a knowledge base. Keep it tight.

**It contains:**
* project identity + audience + tone
* project status at a glance
* current focus and working mode
* design principles (motion, responsive, core)
* workflow discipline and session-start checklist
* shared architecture overview (primitives + promotion rule)
* agent routing
* versioning and push rules
* upcoming tech-stack changes as one-line pointers

**It does not contain:**
* implementation details or code tours → route `ANOMALIES.md` or the code itself
* per-route architectural anomalies → that route's `ANOMALIES.md` (anomalies + don't-touch only)
* reusable primitive catalog with usage notes → `LIBRARY.md`
* credits, historical sources, colophon items → `COLOPHON.md`
* durable project identity memory → `docs/claude/memory.md`
* route build briefs → that route's brief file (e.g. `MARKS_BRIEF.md`)
* changelog, session logs, recent-work summaries → git history
* ephemeral state (current blockers, today's tasks) → conversation or plan tool

If a section of this file starts explaining *how* something works, it belongs in ANOMALIES.md. If it starts cataloging *reusable* pieces, it belongs in LIBRARY.md. Resist bloat.

## Project

This is Nihar Bhagat's portfolio site — built for studio heads, creative directors, and product leaders.

* Live site: `https://nihar.works`
* Repo: `niharya/88g`
* Stack: **Next.js 15 (App Router), React 19, Framer Motion 12, TypeScript**

The portfolio contains long-form editorial project routes built as sheet-stack reading environments.

Tone: precise, calm, human. Avoid hype and abstraction.

Protect: evidence, docking relationships, material coherence.

Common failure modes: over-cleaning, generic polish, broken relationships.

## Project status

| Route | Description | Status |
|---|---|---|
| `/` | Landing — spectrum color selector, contact form | Shipped |
| `/selected` | Works index — timeline, archive panel, project cards | Shipped |
| `/biconomy` | Biconomy case study — 6 chapters | Shipped |
| `/rr` | Rug Rumble case study — card game design + development | Shipped |
| `/marks` | Marks & Symbols — cinematic credits-reel showcase | **In build** |
| `/names` | Names Coined — naming work showcase | Planned (brief TBD, paper-stage) |

## Current focus

**`/marks` (build) + refining phase (everywhere else).**

`/names` is being wireframed on paper. Do not scaffold or speculate on it yet — wait for a brief file.

## Refining phase

The site is shipped. The work now is polish, consistency, and selective responsive. Three streams run in parallel.

### Stream 1 — desktop polish

Per-route. Replace placeholders with real proof artifacts, fine-tune components and modules, tighten spacing and typographic rhythm where hand-authored values have drifted.

* Do not normalize hand-authored offsets or rotations just because they look unusual. Read `ANOMALIES.md` before touching anything that feels off — it may be load-bearing.
* Work one view / section at a time. Review before moving on.

### Stream 2 — consistency and reuse

Goal: a single source of truth for everything used more than once.

* **`LIBRARY.md` at repo root is the catalog.** Every component or module used (or intended to be used) in two or more places gets a `LIBRARY.md` entry: name, plain description, code paths, AI notes. See existing entries (Train Marquee, Monostamp) for format.
* **Promotion rule.** A primitive moves into `app/components/` the **second** time it is needed — not the first. Flag the move before doing it; don't silent-promote. When a pattern is repeated across routes, stop and promote.
* **Grep before editing shared.** If you're touching anything under `app/components/` or a token in `app/globals.css`, grep both routes for consumers first.
* **Route-local stays route-local until it isn't.** If only one route uses it, leave it in that route's `components/`. NavPill (biconomy-local, two biconomy consumers) is the reference for this.

#### Refining a component — the loop

When refining any component during this phase, run this short loop. It makes the promotion rule actionable instead of aspirational.

1. **Intent tag (you say it).** At the start of each component, tag it: `one-off`, `reused`, or `maybe`. `one-off` stays route-local with no catalog entry. `reused` triggers promotion now. `maybe` stays local but is built promotion-ready — tokens only, no route-specific hardcoding.
2. **Essential behavior in one sentence (you say it).** What must be identical across instances vs. what's allowed to vary per consumer. This is the contract the primitive has to hold.
3. **Map before touching (I do it).** Grep for existing cousins, read the closest match, summarize what exists, what the shared shape looks like, and what's route-specific. Wait for confirmation before writing.
4. **API shape rules when promoting.**
   * Tokens, not values. Colors via `--tone-*`, ease via `--ease-paper`, spacing via clamp or token. No hex, no magic px inside.
   * Stateless where possible. Consumer owns state (Monostamp's `active` is the reference).
   * Variants via props, not forks. `tone` / `variant` / `appearance` enums.
   * Route-specific bits stay in the consumer — content, icons, copy passed in as children or props.
5. **Promotion is one commit.** Move to `app/components/<Name>/`, update all consumer imports, add the `LIBRARY.md` entry. Not three PRs.
6. **Anomalies split by scope.** Load-bearing internals of the primitive go in its `LIBRARY.md` AI notes. Route-specific consequences of consuming it go in that route's `ANOMALIES.md`.

### Stream 3 — responsive (lite)

See "Responsive rules → Responsive-lite stance" below. Reference passes have shipped on `/`, `/selected`, and `/rr`. `/marks` is being built responsive-ready from day one. `/biconomy` has not yet had a lite pass.

## Shared design system

`app/components/` and `app/globals.css` together are the shared design system layer. Every route consumes from it directly. Routes do **not** import from each other.

Current shared inventory:

* **`app/components/`**
  * `Sheet`, `useReveal`, `PaperFilter` — paper/reveal primitives
  * `Monostamp` — monospace stamp (pill + tall variants, four tones, active state)
  * `SlideInOnNav` — entrance wrapper tied to page navigation
  * `nav/` — `ChapterMarker`, `ProjectMarker`, `ExitMarker`, `MarkerSlot`, `useDockedMarker` (see `nav/ANOMALIES.md`)
  * `icons/` — hand-rolled animatable SVG icons (`IconArrowRight`, `IconChevronRight`, `IconExternalLink`)
* **`app/lib/`** — shared utilities (`greeting`, `titleCase`, `motion` — tab-switch motion tokens)
* **`app/globals.css`** — design tokens, `.mat` surface, `.fonts-ready` gating, typography scale, `.section-reveal` entrance system, `.transition-slot`/`.transition-pane` layout, four-tier elevation ladder (`--shadow-flat` / `-resting` / `-raised` / `-overlay`), `--backseat-dim`, `--ease-paper`

New shared primitives can originate in any route once they're needed twice. `/biconomy` is the historical donor for much of what's currently shared, but it is not a code dependency.

Anything shared and non-obvious gets an entry in `LIBRARY.md`.

## Route-level anomalies

Each route has an `ANOMALIES.md` file. Its purpose is narrow: **architectural anomalies, cross-file wiring, and don't-touch items** that a reader would not figure out from the code alone.

Out of scope for ANOMALIES.md: tours of the codebase, general explanations of how the feature works, changelog entries, aspirational notes.

* `app/(works)/biconomy/ANOMALIES.md`
* `app/(works)/rr/ANOMALIES.md`
* `app/(works)/selected/ANOMALIES.md`
* `app/components/nav/ANOMALIES.md`

Log anomalies in the route they affect. If a global change causes a side effect in a specific route, document it in that route's ANOMALIES.md. If it affects multiple routes, log it in each.

## Files in play

### For `/marks` (active build)

* `MARKS_BRIEF.md` at repo root — full build brief, chunked plan, data shape, motion spec
* Route-local (scaffold pending per the brief): `app/(works)/marks/{page,layout}.tsx`, `app/(works)/marks/marks.css`, `app/(works)/marks/ANOMALIES.md`, `app/(works)/marks/components/`, `app/(works)/marks/data/marks.ts`
* Shared marks primitive (promoted because marks are reused across routes): `app/components/marks/` — inline SVG components using `currentColor`, with a typed registry
* Assets: `public/marks/<mark-id>/*.{jpg,gif,png}`

### Refining phase — everywhere

* Existing route files under `app/(works)/{biconomy,rr,selected}/`
* `app/page.tsx`, `app/landing.css`, `app/_landing/` — landing page
* Shared: `app/components/`, `app/globals.css`, `app/lib/`
* Shell: `app/(works)/{layout,ShellNav,TransitionSlot}.tsx`

## Reference material

Everything under `reference/` is read-only context. Never modify it.

* `reference/marks-source/` — the six mark SVG source files for `/marks`

Historical references (the original Biconomy source, the vanilla portfolio, and the v0 Rug Rumble prototype) have been removed from the repo now that their routes are shipped.

## Stack and implementation philosophy

* Plain CSS files. No Tailwind. No CSS modules. No styled-components.
* CSS handles presentation.
* React handles state and interaction.
* Framer Motion is for spring physics, presence transitions, and scroll-linked transforms — only where it materially helps.
* Route-local modules with clear ownership.
* Shared tokens live in `globals.css`. Route tokens live in route CSS files.

If a simple CSS transition is enough, use CSS.

## Motion vocabulary

All motion in the portfolio follows a paper-physical language. Things glide, settle, and land — never snap, bounce, or overshoot.

### Rules

1. **One easing curve.** `--ease-paper: cubic-bezier(0.5, 0, 0.2, 1)` — confident start, long gentle deceleration. Used for section reveals, page transitions, and all CSS transitions. Defined in `globals.css`, mirrored as `EASE` in `TransitionSlot.tsx`.
2. **Long durations.** 0.5–0.9s range. Nothing should feel fast or urgent.
3. **No bounce, no overshoot.** Springs may be used for dampened settle only (bounce: 0). Never elastic. (Documented deviations exist — the train ticker overshoot, the Flows nav settle — and live in their route ANOMALIES.md.)
4. **Native scroll.** No smooth-scroll libraries, no scroll hijacking. The browser's physics stay in control.
5. **Scroll-mapped transforms where useful.** `useScroll` + `useTransform` + `useSpring` for elements that respond to scroll position — not just trigger-on-intersection.
6. **Tab/micro-interaction tier.** Tab switches and quick UI reactions use `TAB_EASE` (`[0.45, 0, 0.15, 1]`) at 0.12–0.15s from `app/lib/motion.ts` — a separate, snappier tier that exists because a tapped tab must resolve inside attention. This is the only documented deviation from rules 1 and 2. Do not unify with `--ease-paper`. See `LIBRARY.md` → "Tab-switch motion tokens".

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

### Responsive-lite stance (refining phase)

All remaining responsive work on this portfolio is "lite" — a usability floor, not a composition pass. The goal is: the route does not break on mobile or tablet, touch users can read and navigate it, and nothing implies an interaction that fails. That is the gate. Do not auto-escalate past it.

**What "lite" means.**

* Usability and non-breakage at mobile/tablet widths, nothing more.
* Accommodations are made *per-route*, scoped inside media queries, with zero desktop side effects.
* Desktop remains the canonical composition. Mobile is a reading fallback.
* A route is "done" under lite when a phone user can read it end-to-end without horizontal scroll, overflowing text, or tap targets that miss.

**What "lite" is not.**

* Not a second authored composition.
* Not visual parity with the desktop reading experience.
* Not a reason to redesign sections whose meaning depends on spatial layout.
* Not a license to rebuild scroll-bound or absolute-positioned desktop set pieces for small screens.

**Minimum floor every route must meet under lite.**

* No horizontal overflow at 375px.
* Body copy readable at 375px without zoom; no `transform: scale()` fixes.
* Touch targets ≥ 44px for anything interactive.
* Mobile tucked pill nav present (project marker + chapter marker), per the global pattern above.
* 4px viewport frame active on mobile (the halved brand detail).
* Mat-as-last-element flex chain where the page ends on a mat.
* Responsive copy variants via the two-span CSS visibility pattern when phrasing differs.
* `:hover`-only affordances disabled or replaced on touch.

**Explicitly de-scoped under lite.**

* Decorative desktop elements (timeline bars, dot clusters, spatial markers) may be removed on mobile rather than recomposed.
* Hand-placed desktop embellishments (rotated stamps, offset notes, marginalia) are allowed to drop out on mobile.
* Proof-artifact-dense sections (multi-pane game boards, scroll-choreographed splits, dense editorial grids) do **not** get a bespoke mobile composition. They render in a simplified single-column form or collapse to a representative still.
* Per-section mobile art direction. If the desktop section doesn't fit, simplify — don't re-author.

**Per-route precedent.**

* `/`, `/selected`, and `/rr` are the reference implementations for a retrofit-lite pass. Follow their patterns when adding lite to `/biconomy`.
* `/marks` is the reference for a *built-responsive-ready* route: `clamp()` for type and spacing, `flex-direction: column` flips for row compositions, tucked pill + 4px frame from day one, no separate mobile pass. Future routes built from scratch should prefer this model.
* Distinction: retrofit-lite accepts pragmatic drop-outs; built-responsive-ready avoids them by designing the primitives to bend.

**Don't-do list (tempting, out of scope).**

* Don't rebuild `/rr`'s Mechanics scroll-bound mat-split for mobile. Collapse or still it.
* Don't redesign `/biconomy`'s Flows standby/active composition for mobile. Linearize it.
* Don't re-author dense editorial grids as custom mobile layouts — stack them.
* Don't invent new mobile-only primitives. If a route needs one, flag it and confirm before building.
* Don't promote lite patterns to shared until a second route actually needs them.

Log lite decisions and drop-outs in each route's `ANOMALIES.md` under a "Responsive anomalies" section, following `app/(works)/selected/ANOMALIES.md` (line 477+) as the template.

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

If a route shows sketches, screenshots, game boards, cards, or mockups, preserve the feeling of evidence. Do not leave placeholder emptiness. Replacing placeholders with real artifacts is an active refining-phase task.

### 2. Controls must not lie

If something looks interactive, it must work, or it must stop implying interaction.

### 3. Route-specific ownership

Keep styles, state, and logic close to the route. Promote to shared only when two routes genuinely need the same thing. When promoting, add a `LIBRARY.md` entry in the same commit.

### 4. Preserve authored values

Do not normalize hand-authored spacing, sizing, or offsets just because they are unusual. Preserve values that contribute to the reading environment.

### 5. Chapter tray tilt behavior

Do not change the established chapter tray tilt behavior unless explicitly asked.

## Workflow discipline

### Analyze before you build

Before implementing any section or touching shared code:

1. Read the relevant route's `ANOMALIES.md` for decisions, anomalies, and don't-touch items
2. Read `LIBRARY.md` to see if the pattern you need already exists as a shared primitive
3. Read only the closest matching existing pattern — not broad swathes
4. For a new `/marks` section, read `MARKS_BRIEF.md` for the plan and read the matching shared primitive
5. Present a short mapping of the plan to the current system
6. Wait for confirmation before writing code

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
* read only the current section's source, the closest matching pattern, and directly relevant shared files
* keep responses tight and scoped to the active chunk

## Versioning and pushing

Every push bumps the **minor** version in `package.json` by one (`0.1.0` → `0.2.0` → `0.3.0` …). Current tip: `v0.25.0`.

Before pushing:

0. Run `/prepush` — pre-push hygiene review. Scans the branch diff against `main` and surfaces promotion candidates, anomaly notes, doc drift, token discipline, dead references, agent suggestions, and verification reminders. Non-automated — triage the report, act on what matters, then continue with the bump. See `.claude/skills/prepush/SKILL.md`.
1. Bump `package.json` `version` (minor +1, patch reset to 0)
2. Verify the change works (typecheck, dev server smoke check) — never push unverified work
3. Commit the bump (either bundled with the work or as a dedicated `release: vX.Y.0` commit)
4. Tag the tip: `git tag vX.Y.0`
5. Push commits **and** tags: `git push && git push --tags`

Confirm with the user before pushing. Don't push unannounced.

## Agent usage

Before implementation, select the relevant agent(s):

* **portfolio-guardian** → tone, integrity, portfolio fit
* **route-auditor** → before touching any route; checks ANOMALIES.md and constraints
* **frontend-craft** → layout, motion, CSS, interaction decisions
* **responsive-guardian** → responsive passes; desktop parity, lite-stance adherence
* **anomaly-librarian** → when a non-obvious constraint or side-effect is discovered

Before writing code: identify the task, select agent(s), summarize constraints briefly, then implement. Do not make agent usage verbose in responses.

## Session-start checklist

Before implementing anything, confirm:

* current file/folder structure still matches this document
* shared primitives still exist where expected
* `globals.css` tokens have not materially changed
* anything promoted to shared is imported from the new location and has a `LIBRARY.md` entry
* read the `ANOMALIES.md` for the route you are about to work on — anomalies and don't-touch items you will not find in the code alone
* read `LIBRARY.md` if you're about to build something that might already exist
* read `MARKS_BRIEF.md` if working on `/marks`
* read `COLOPHON.md` only if the question is about origins, credits, or where a pattern comes from
* read `docs/claude/memory.md` only if the question is about project identity/audience

## Tech-stack decisions

Short list of stack moves considered during the refining phase. Each entry records the current stance and why, so the question does not keep re-opening.

1. **Self-host fonts — blocked, revisit later.** `next/font/google`'s bundled catalog in Next 15.5 is missing Google Sans, Google Sans Flex, and Material Symbols Rounded (only Fraunces and Google Sans Code are available). Full migration isn't cleanly possible today. Options if we come back: (a) wait for next/font's catalog to catch up; (b) use `next/font/local` — check woff2 files for the three missing families into `public/fonts/` and wire manually. The CDN `<link>` loading in `app/layout.tsx` stays. One independent improvement landed alongside the investigation: a new `--font-symbols` token in `globals.css`, and five direct `font-family: 'Name'` references across route CSS were routed through `var(--font-*)` tokens so the consumption surface is centralized.
2. **Biome — skipped.** Solo-dev shipped portfolio; no drift to correct; toolless preference. Revisit only if a collaborator joins.
3. **`@next/bundle-analyzer` — audited once, no action items.** First-load shared chunks ~102 kB (React DOM + Next runtime baseline), Framer Motion ~30 kB gz, app code ~65 kB gz. Heaviest route /biconomy at 184 kB first-load. No duplicate libs, no dead chunks, EmailJS tree-shaken cleanly. One future candidate noted: **LazyMotion + `m` alias refactor** could trim ~6–8 kB gz by deferring Framer Motion's projection/drag/pan features — site-wide swap of `motion.*` → `m.*` inside a `<LazyMotion features={domAnimation}>` wrapper. Not urgent; flagged for a future pass if bundle size becomes a priority.

**Not doing:** Tailwind, shadcn/Radix, state libraries, Storybook, MDX, test frameworks, View Transitions API migration (TransitionSlot is load-bearing and works).

*Last updated: April 2026.*
