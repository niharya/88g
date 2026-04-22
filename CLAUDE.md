# CLAUDE.md — niharya/88g

This file is the persistent working contract for Claude Code sessions on this repo.
Read it at the start of every session. Do not drift from it without explicit instruction.

## The document system

The working contract is distributed across five documents. Read the ones relevant to the task at hand:

* **`CLAUDE.md`** (this file) — working contract: identity, focus, principles, workflow
* **`LIBRARY.md`** — catalog of shared primitives (components + modules used in two or more places)
* **Per-route `DESIGN.md`** — intent, philosophy, behavior spec for one route. Stable; doesn't rot
* **Per-route `ANOMALIES.md`** — load-bearing wiring, don't-touch items, cross-file constraints. Read before editing the route
* **`COLOPHON.md`** — origins, credits, historical sources
* **`docs/claude/memory.md`** — durable project identity memory
* **`docs/responsive.md`** — full responsive rules and crafted-lite stance (summary lives in this file)
* **`docs/responsive-playbook.md`** — shape-by-shape decision tree for responsive passes. Read before any retrofit, review, or forward pass
* **`docs/vocabulary.md`** — design-language ↔ code-identifier mapping (mat, sheet, surface, rail, marker, etc.). Read this when feedback or a commit message names something and you're not sure which class / component it refers to.

Older routes (`/biconomy`, `/rr`, `/selected`) predate `DESIGN.md` and only have `ANOMALIES.md`; their intent is captured in the case-study copy itself.

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

**It does not contain:**
* implementation details or code tours → route `ANOMALIES.md` or the code itself
* per-route architectural anomalies → that route's `ANOMALIES.md` (anomalies + don't-touch only)
* reusable primitive catalog with usage notes → `LIBRARY.md`
* credits, historical sources, colophon items → `COLOPHON.md`
* durable project identity memory → `docs/claude/memory.md`
* route design intent (philosophy, behavior spec, motion vocab for one route) → that route's `DESIGN.md`
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

### Stream 3 — responsive (crafted-lite)

See "Responsive rules → Crafted-lite stance" below, plus `docs/responsive-playbook.md` for the shape-by-shape decision tree. Lite-floor passes have shipped on `/`, `/selected`, `/rr`, and `/biconomy`. `/marks` is the composition quality bar (built responsive-ready). The BIPs chapter on `/biconomy` is the reference application that accompanies the playbook.

## Shared design system

`app/components/` and `app/globals.css` together are the shared design system layer. Every route consumes from it directly. Routes do **not** import from each other.

Current shared inventory:

* **`app/components/`**
  * `Sheet`, `useReveal`, `PaperFilter` — paper/reveal primitives
  * `Monostamp` — monospace stamp (pill + tall variants, four tones, active state)
  * `SlideInOnNav` — entrance wrapper tied to page navigation
  * `nav/` — `ChapterMarker`, `ProjectMarker`, `ExitMarker`, `MarkerSlot`, `useDockedMarker`. **Before changing anything in `app/components/nav/`, read `LIBRARY.md` → "Nav pill system" and `app/components/nav/README.md`.** Architectural anomalies in `nav/ANOMALIES.md`.
  * `icons/` — hand-rolled animatable SVG icons (`IconArrowRight`, `IconChevronRight`, `IconExternalLink`)
* **`app/lib/`** — shared utilities (`greeting`, `titleCase`, `motion` — tab-switch motion tokens)
* **`app/globals.css`** — design tokens, `.mat` surface, `.fonts-ready` gating, typography scale, `.section-reveal` entrance system, `.transition-slot`/`.transition-pane` layout, four-tier elevation ladder (`--shadow-flat` / `-resting` / `-raised` / `-overlay`), `--backseat-dim`, spacing scale (`--space-2` through `--space-112`), motion tokens (`--ease-paper`, `--ease-snap`, `--dur-instant` / `-fast` / `-slide` / `-settle` / `-glide`)

New shared primitives can originate in any route once they're needed twice. `/biconomy` is the historical donor for much of what's currently shared, but it is not a code dependency.

Anything shared and non-obvious gets an entry in `LIBRARY.md`.

## Route-level anomalies

Each route has an `ANOMALIES.md` file. Its purpose is narrow: **architectural anomalies, cross-file wiring, and don't-touch items** that a reader would not figure out from the code alone.

Out of scope for ANOMALIES.md: tours of the codebase, general explanations of how the feature works, changelog entries, aspirational notes.

* `app/_landing/ANOMALIES.md` — landing route (code at `app/page.tsx` + `app/landing.css`)
* `app/(works)/biconomy/ANOMALIES.md`
* `app/(works)/rr/ANOMALIES.md`
* `app/(works)/selected/ANOMALIES.md`
* `app/components/nav/ANOMALIES.md`

Log anomalies in the route they affect. If a global change causes a side effect in a specific route, document it in that route's ANOMALIES.md. If it affects multiple routes, log it in each.

## Files in play

### For `/marks` (active build)

* **Route lives at `app/marks/`, NOT `app/(works)/marks/`.** This is deliberate — `/marks` is a continuous editorial document, not a sheet-stack project. It opts out of the workbench shell (no 8px frame, no `TransitionSlot`, no `ProjectMarker`). Only `ExitMarker` is carried in via `app/marks/layout.tsx`.
* `app/marks/DESIGN.md` — route intent: concept, auto-scroll behavior, infinite-loop spec, motion vocab, mobile guidance. Stable; doesn't rot.
* `app/marks/ANOMALIES.md` — load-bearing wiring and don't-touch items.
* Route-local: `app/marks/{page,layout}.tsx`, `app/marks/marks.css`, `app/marks/components/`, `app/marks/data/marks.ts`
* Mark SVG components are **route-local** at `app/marks/components/marks/` — one consumer, no promotion yet. Promote to `app/components/marks/` the moment a second route (landing spotlight, tooltip, etc.) needs them.
* Source SVGs live at `app/marks/_source/` (underscore prefix → Next.js ignores at routing time).
* Assets: `public/marks/<mark-id>/*.{jpg,gif,png}`

### Refining phase — everywhere

* Existing route files under `app/(works)/{biconomy,rr,selected}/`
* `app/page.tsx`, `app/landing.css`, `app/_landing/` — landing page
* Shared: `app/components/`, `app/globals.css`, `app/lib/`
* Shell: `app/(works)/{layout,ShellNav,TransitionSlot}.tsx`

### Private / stashed folders

Folders prefixed with `_` are ignored by Next.js for routing. Used for two things: in-route private directories (e.g. `app/marks/_source/` — SVG sources that shouldn't become pages), and **stashed dev utilities** (`app/_dev-tools/` — tools that helped build the portfolio, kept as reference code but not served). When a once-live dev route graduates to "artifact," move it under `app/_dev-tools/<name>/` rather than deleting it.

## Reference material

Everything under `reference/` is read-only context. Never modify it.

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
6. **Tab/micro-interaction tier.** Tab switches and quick UI reactions use `--ease-snap` (`cubic-bezier(0.45, 0, 0.15, 1)`) at 0.1–0.2s — a separate, snappier tier that exists because a tapped tab must resolve inside attention. This is the only documented deviation from rules 1 and 2. Do not unify with `--ease-paper`. The CSS token `--ease-snap` is mirrored in JS as `TAB_EASE` in `app/lib/motion.ts` — keep them in sync. See `LIBRARY.md` → "Tab-switch motion tokens".
7. **Use tokens, not raw values.** Durations come from `--dur-instant` (0.1s), `--dur-fast` (0.2s), `--dur-slide` (0.3s), `--dur-settle` (0.5s), `--dur-glide` (0.8s). Easings come from `--ease-paper` or `--ease-snap`. New values imply a new tier — flag before authoring.

### Section reveal choreography

Mats are loose sheets in a stack. Scrolling browses through them.

* **Phase 1 — mat glides in.** Translates 32px upward, opacity 0.7s / transform 0.8s. Feels like a mat sliding to rest against the previous one.
* **Phase 2 — content placed.** Objects on the mat settle with a random micro-rotation (±1.5°, truly random per visit) and a shadow that shrinks as they land. Shadow goes from lifted (diffuse, 8px offset) to resting (tight, 1px offset). 0.7s, staggered 0.15s after mat.
* **Phase 3 — nav-sled docks.** Chapter marker settles last. 0.5s, staggered 0.25s after mat.

All three phases use `--ease-paper`.

Random rotation is set via `--place-rotate` CSS custom property, assigned by `Sheet.tsx` on mount.

## Responsive rules (summary)

Full reference: [`docs/responsive.md`](./docs/responsive.md). Read it before starting a responsive pass.

Core principles:

* **Breakpoints:** mobile < 768px, tablet 768–1023px, desktop ≥ 1024px.
* **Recompose, don't replicate.** Mobile is a purposeful different composition, not desktop scaled down.
* **No hacks.** No `transform: scale()` on text, no `!important` chains, no hidden-but-present DOM tricks.
* **Structural breakpoints for layout, fluid scaling for sizing** (clamp, vw). No JS media queries.
* **Crafted-lite stance.** Two layers: content/density → lite floor (drop ornaments, reduce density, meet 375px usability minimums); composition → crafted (what remains is authored for mobile, not mechanically column-stacked). `/marks` is the composition quality bar. `/rr` is the mechanics reference (scroll unbind, React-inline-style gate) but not a composition reference — its canvas scales predate crafted-lite. `/biconomy`'s pass has shipped; see its `ANOMALIES.md` → "Responsive anomalies" and `RESPONSIVE.md` for the chapter-by-chapter record.
* **Newly banned under crafted-lite:** `transform: scale()` on whole authored canvases; horizontal scroll strips with inner `scale()` on desktop-width content. See `docs/responsive-playbook.md` → Banned hacks.
* Log crafted-lite decisions in each route's `ANOMALIES.md` under "Responsive anomalies".

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
4. For a new `/marks` section, read `app/marks/DESIGN.md` for the intent and `app/marks/ANOMALIES.md` for the wiring
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

Every push bumps the **minor** version in `package.json` by one (`0.1.0` → `0.2.0` → `0.3.0` …). Current tip: `v0.38.0`.

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
* read `app/marks/DESIGN.md` and `app/marks/ANOMALIES.md` if working on `/marks`
* read `COLOPHON.md` only if the question is about origins, credits, or where a pattern comes from
* read `docs/claude/memory.md` only if the question is about project identity/audience

## Images

**Always use the shared `<Img>` primitive** (`app/components/Img`) for content imagery — never raw `<img>` or `next/image` directly. `Img` handles LQIP (dominant color or ThumbHash placeholder), materialize reveal, and Next.js optimization in one. See `LIBRARY.md` → "Img" for sizing modes (`default` / `fill` / `intrinsic`) and placeholder variants.

When you add or replace an image under `public/`, run `npm run lqip` to regenerate the manifest. `npm run build` runs the generator automatically via `prebuild`, so production is always fresh; dev falls back gracefully (raw `<img>`) with a console warning when an image isn't in the manifest yet.

The only raw `<img>` exceptions are tiny decorative icons where LQIP is wasted (twitter avatar, deck-strip chip, rule-card icon).

## Not using

Tailwind, shadcn/Radix, state libraries, Storybook, MDX, test frameworks. TransitionSlot stays on Framer Motion (not View Transitions API) — it's load-bearing and works.
