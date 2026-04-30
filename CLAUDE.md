# CLAUDE.md — niharya/88g

This file is the persistent working contract for Claude Code sessions on this repo.
Read it at the start of every session. Do not drift from it without explicit instruction.

## The document system

* **`CLAUDE.md`** (this file) — working contract: identity, principles, workflow
* **`LIBRARY.md`** — catalog of shared primitives (anything used in two or more places)
* **Per-route `DESIGN.md`** — intent + behavior spec for one route. Stable
* **Per-route `ANOMALIES.md`** — load-bearing wiring, don't-touch items. **Read before editing the route**
* **`docs/responsive.md`** + **`docs/responsive-playbook.md`** — full responsive rules and shape-by-shape decision tree
* **`docs/vocabulary.md`** — design-language ↔ code-identifier mapping
* **`docs/claude/memory.md`** — durable project identity memory
* **`COLOPHON.md`** — origins, credits, historical sources

Older routes (`/biconomy`, `/rr`, `/selected`) predate `DESIGN.md`; their intent is captured in the case-study copy itself.

## What this file is (and isn't)

CLAUDE.md is a **working contract**, not a knowledge base. If a section starts explaining *how* something works, it belongs in `ANOMALIES.md`. If it starts cataloging *reusable* pieces, it belongs in `LIBRARY.md`. Ephemeral state (current tasks, project status, blockers) belongs in conversation, plans, or git — not here. Resist bloat.

## Project

This is Nihar Bhagat's portfolio site — built for studio heads, creative directors, and product leaders.

* Live site: `https://nihar.works`
* Repo: `niharya/88g`
* Stack: **Next.js 15 (App Router), React 19, Framer Motion 12, TypeScript**

The portfolio contains long-form editorial project routes built as sheet-stack reading environments.

**Stage: finishing (90–100%).** Designs are final. Work is polish only — no new sections, no re-authoring, no speculative refactors. Default to the smallest correct change. If a task implies net-new structure or design, flag it before touching code.

Tone: precise, calm, human. Avoid hype and abstraction.

Protect: evidence, docking relationships, material coherence.

Common failure modes: over-cleaning, generic polish, broken relationships.

## Component refinement loop

When refining or building any component, run this short loop. It makes the promotion rule actionable instead of aspirational.

1. **Intent tag (you say it).** Tag the component: `one-off`, `reused`, or `maybe`. `one-off` stays route-local with no catalog entry. `reused` triggers promotion now. `maybe` stays local but is built promotion-ready — tokens only, no route-specific hardcoding.
2. **Essential behavior in one sentence (you say it).** What must be identical across instances vs. what's allowed to vary per consumer. This is the contract the primitive has to hold.
3. **Map before touching (I do it).** Grep for existing cousins, read the closest match, summarize what exists, what the shared shape looks like, and what's route-specific. Wait for confirmation before writing.
4. **API shape rules when promoting.**
   * Tokens, not values. Colors via `--tone-*`, ease via `--ease-paper`, spacing via clamp or token. No hex, no magic px inside.
   * Stateless where possible. Consumer owns state (Monostamp's `active` is the reference).
   * Variants via props, not forks. `tone` / `variant` / `appearance` enums.
   * Route-specific bits stay in the consumer — content, icons, copy passed in as children or props.
5. **Promotion is one commit.** Move to `app/components/<Name>/`, update all consumer imports, add the `LIBRARY.md` entry. Not three PRs.
6. **Anomalies split by scope.** Load-bearing internals of the primitive go in its `LIBRARY.md` AI notes. Route-specific consequences of consuming it go in that route's `ANOMALIES.md`.

### Promotion rule

* A primitive moves into `app/components/` the **second** time it is needed — not the first. Flag the move before doing it; don't silent-promote.
* **Grep before editing shared.** If you're touching anything under `app/components/` or a token in `app/globals.css`, grep all routes for consumers first.
* **Route-local stays route-local until it isn't.** NavPill (biconomy-local, two biconomy consumers) is the reference.

## Shared design system

`app/components/` and `app/globals.css` together are the shared design system layer. Every route consumes from it directly. **Routes do not import from each other.** See `LIBRARY.md` for the complete catalog of shared primitives.

**Before changing anything in `app/components/nav/` or `NavMarker/`,** read `LIBRARY.md` → "Nav cluster" + "NavMarker" and `app/components/nav/README.md`. Architectural anomalies in `app/components/nav/ANOMALIES.md`.

## Route-level anomalies

Every route has an `ANOMALIES.md` file for **architectural anomalies, cross-file wiring, and don't-touch items** that aren't obvious from the code. Read it before touching the route. Log new anomalies in the route they affect; if a global change has route-specific side effects, log in each affected route.

Out of scope: tours of the codebase, general explanations, changelog entries, aspirational notes.

## Private / stashed folders

Folders prefixed with `_` are ignored by Next.js for routing. Used for in-route private directories (e.g. `app/marks/_source/`) and **stashed dev utilities** (`app/_dev-tools/` — tools that helped build the portfolio, kept as reference). When a once-live dev route graduates to "artifact," move it under `app/_dev-tools/<name>/` rather than deleting it.

Everything under `reference/` is read-only context. Never modify it.

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

## Cross-shell navigation

Routes inside `(works)/` (selected, rr, biconomy) cross between each other through `TransitionSlot` — DOM ghost-clone, slide-and-fade. That only works because they share a layout boundary, so the old page can stay mounted as a snapshot while the new one mounts.

Routes outside `(works)/` (currently `/marks`; future: `/names`) **cannot** use TransitionSlot — the layout boundary tears down on every transition. They use the **CrossShellVeil** primitive instead: a black veil fades up on the outgoing side, holds opaque through `router.push`, and fades down on the incoming side. One DOM node travels across the navigation, owned in turn by each side.

**Both halves are required.** The outgoing route uses `useCrossShellNav(href)` on the link's `onClick`; the incoming route renders `<CrossShellEntryFader />` in its layout. If only one half is wired, the veil either doesn't appear or doesn't clear.

The pattern is symmetric — selected→marks and marks→selected use the same veil, same timings (900 ms in / 700 ms out), so the journey feels like the same beat in both directions. **Don't mix idioms** — a route either uses TransitionSlot (in-shell) or CrossShellVeil (cross-shell), never both.

See `LIBRARY.md` → "CrossShellVeil" for the primitive and current consumers.

## Responsive rules (summary)

Full reference: [`docs/responsive.md`](./docs/responsive.md). Read it before starting a responsive pass.

Core principles:

* **Breakpoints:** mobile < 768px, tablet 768–1023px, desktop ≥ 1024px. Mobile media queries also OR `(max-height: 500px)`; desktop guards AND `(min-height: 501px)` — catches phones in landscape (Pro Max 932×430) and routes them through the mobile block. JS `matchMedia` calls tied to mobile composition use the same OR-clause. See `docs/responsive.md` → "Landscape-phone clause".
* **Recompose, don't replicate.** Mobile is a purposeful different composition, not desktop scaled down.
* **No hacks.** No `transform: scale()` on text, no `!important` chains, no hidden-but-present DOM tricks.
* **Structural breakpoints for layout, fluid scaling for sizing** (clamp, vw). No JS media queries.
* **Crafted-lite stance.** Two layers: content/density → lite floor (drop ornaments, reduce density, meet 375px usability minimums); composition → crafted (what remains is authored for mobile, not mechanically column-stacked). `/marks` is the composition quality bar. `/rr` is the mechanics reference (scroll unbind, React-inline-style gate) but not a composition reference — its canvas scales predate crafted-lite.
* **Newly banned under crafted-lite:** `transform: scale()` on whole authored canvases; horizontal scroll strips with inner `scale()` on desktop-width content. See `docs/responsive-playbook.md` → Banned hacks.
* Log crafted-lite decisions in each route's `ANOMALIES.md` under "Responsive anomalies".

## Performance hygiene (summary)

Full reference: [`docs/performance.md`](./docs/performance.md). Read it before adding fonts, images, or icons.

* **Fonts:** `next/font/local` only, `.woff2` in `app/fonts/`, `display: 'swap'` with an explicit `fallback` chain. Do **not** redeclare `--font-*` in `globals.css :root` — next/font sets the variables on `<html>` to hashed family names. A **bounded font-gate** holds top-level surfaces (`.landing`, `.workbench`, `.route-marks`) at `opacity: 0` until `document.fonts.ready` resolves *or* an **800 ms cap** fires (whichever first); the startooth `.page-boot` mark is visible during the hold. The uncapped 3-second font-gate is **banned**. `display: 'block'` is **banned**. External `<link>` to `fonts.googleapis.com` for the five primary fonts is **banned**.
* **Icons:** Material Symbols is subsetted to a fixed icon list (~1.1 MB, down from 5.1 MB). Adding a new icon requires re-subsetting per the doc. Don't replace the file with the full font.
* **Images:** All content imagery uses `<Img>`. Every raster in `public/images/` is `.webp`. Raw images over ~400 KB must be optimized via `npm run optimize-images` before commit.
* **Motion tokens:** `--dur-*` values are post-v0.55 tuned for snap. Don't drift back without intent — inline a duration in component CSS for one-off cases instead.

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

Keep styles, state, and logic close to the route. Promote to shared only when two routes genuinely need the same thing. When promoting, add a `LIBRARY.md` entry in the same commit.

### 4. Preserve authored values

Do not normalize hand-authored spacing, sizing, or offsets just because they are unusual. Preserve values that contribute to the reading environment.

### 5. Chapter tray tilt behavior

Do not change the established chapter tray tilt behavior unless explicitly asked.

## Workflow discipline

### Steward, not gofer

Nihar is a designer, not a developer. Treat every request as a design conversation, not a ticket.

* When he asks "could we do X?" or "should we do Y?" — he's asking whether X is the right call by best practices, not whether it's technically possible. Evaluate, recommend, name the tradeoffs. Don't just confirm feasibility.
* When he asks "do X" — if X is straightforward and right, do it. If X has a better alternative, propose it before implementing. Don't ship the literal ask if a fuller proposal serves the family better.
* **Diagnose before fixing changes to existing things.** When the ask is to change something that already exists — a primitive, a behavior, a value — and the fix isn't trivially simple, find the root cause first. Read the rule, the consumer, the cascade; figure out *why* it currently does what it does before proposing what to change. Jumping straight to a patch burns iterations and credits when the real cause was elsewhere. The "is this trivially simple?" bar: a typo, a single token tweak, a one-line rename. Anything wider — investigate first, then propose, then change.
* Surface adjacent ideas the change unlocks, sorted by how earned each one is for this portfolio (not by how cool). Recommend which to skip — don't dump options.
* Make a recommendation. Hedging into paralysis isn't partnership. He can override.
* Framing he uses: "be a steward, not a gofer" (7 Habits).

This applies to all requests — primitives, routes, copy, motion, anything.

### Analyze before you build

Before implementing any section or touching shared code:

1. Read the relevant route's `ANOMALIES.md` for decisions, anomalies, and don't-touch items
2. Read `LIBRARY.md` to see if the pattern you need already exists as a shared primitive
3. Read only the closest matching existing pattern — not broad swathes
4. Present a short mapping of the plan to the current system
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

* do not read the entire repo eagerly
* do not read full reference directories
* read only the current section's source, the closest matching pattern, and directly relevant shared files
* keep responses tight and scoped to the active chunk

## Versioning and pushing

Every push bumps the **minor** version in `package.json` by one (`0.1.0` → `0.2.0` → `0.3.0` …).

Before pushing:

0. Run `/prepush` — pre-push hygiene review. Scans the branch diff against `main` and surfaces promotion candidates, anomaly notes, doc drift, token discipline, dead references, agent suggestions, and verification reminders. Triage the report, act on what matters, then continue with the bump.
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
* shared primitives still exist where expected and `globals.css` tokens have not materially changed
* anything promoted to shared is imported from the new location and has a `LIBRARY.md` entry
* read the `ANOMALIES.md` for the route you are about to work on
* read `LIBRARY.md` if you're about to build something that might already exist

## Images

**Always use the shared `<Img>` primitive** (`app/components/Img`) for content imagery — never raw `<img>` or `next/image` directly. `Img` handles LQIP (dominant color or ThumbHash placeholder), materialize reveal, and Next.js optimization in one. See `LIBRARY.md` → "Img" for sizing modes (`default` / `fill` / `intrinsic`) and placeholder variants.

When you add or replace an image under `public/`, run `npm run lqip` to regenerate the manifest. `npm run build` runs the generator automatically via `prebuild`, so production is always fresh; dev falls back gracefully (raw `<img>`) with a console warning when an image isn't in the manifest yet.

The only raw `<img>` exceptions are tiny decorative icons where LQIP is wasted (twitter avatar, deck-strip chip, rule-card icon).

For weight discipline (max sizes, `.webp` requirement, `npm run optimize-images` workflow), see `docs/performance.md` → "Images".

## Not using

Tailwind, shadcn/Radix, state libraries, Storybook, MDX, test frameworks. TransitionSlot stays on Framer Motion (not View Transitions API) — it's load-bearing and works.
