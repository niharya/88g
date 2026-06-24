# CLAUDE.md — niharya/88g

The working contract for Claude Code sessions on this repo — the trunk of the document family. Read at session start; do not drift from it without explicit instruction. If a section here starts explaining *how* something works, it belongs in an `ANOMALIES.md`; if it catalogs *reusable* pieces, it belongs in `LIBRARY.md`. Resist bloat.

## Project

Nihar Bhagat's portfolio — long-form editorial project routes built as sheet-stack reading environments, for studio heads, creative directors, and product leaders. Live: `https://nihar.works` · Stack: **Next.js 15 (App Router), React 19, Framer Motion 12, TypeScript, plain CSS**.

Design is organized attention. Each page is an authored reading environment. Tone: precise, calm, human — no hype, no abstraction.

**Stage: finishing (90–100%).** Designs are final. Work is polish only — no new sections, no re-authoring, no speculative refactors. Default to the smallest correct change; if a task implies net-new structure or design, flag it before touching code. One sanctioned exception: the `/shape-of-product` musings layer (and future musings beside it).

Protect: evidence, docking relationships, material coherence. Common failure modes: over-cleaning, generic polish, broken relationships.

## The document family

The docs are a tree. Every node knows its parent; the trunk discovers its branches by **looking** (glob `**/ANOMALIES.md`, `**/CLAUDE.md` under `app/`), never from a memorized list.

* **Trunk** — this file. Identity + contract. Always loaded.
* **Branch digests** — nested `CLAUDE.md` files in every protected area (`app/`, `app/(works)/` + each route, `app/marks/`, `app/shape-of-product/`, `app/_landing/`, `app/components/`, `app/components/nav/`). Claude Code auto-loads a digest the moment any file in its folder is touched, so protection is structural, not memory-dependent. Each carries a standard header (family line, archive pointer, maintenance rule) plus one-line don't-touch items.
* **Archives** — per-area `ANOMALIES.md`: the full protective memory (rationale, what-breaks, rejected approaches). Digests are the seatbelt; archives are the manual. Read the relevant archive section before structural changes.
* **Catalog** — `LIBRARY.md`: shared primitives. **Grep for the entry name and read only that entry** — never read the whole file. Index at the top.
* **Specs** — per-route `DESIGN.md` (marks, shape-of-product): intent and philosophy. Older routes capture intent in their case-study copy.
* **Reference (load on demand per task)** — `docs/responsive.md` (+ `responsive-playbook.md`) before any responsive pass · `docs/performance.md` before fonts/images/icons/motion-token work · `docs/rhythm.md` for token/spacing polish (the hand-authored-legitimacy lists live there) · `docs/navigation-choreography.md` for how the first-paint loader/gate and page-transition motion are organised · `docs/vocabulary.md` when translating design language to code identifiers · `docs/scriptorium/` for verbatim copy (downstream-only; head-tag copy lives in `meta.md` only) · `docs/reader-critique-prompt.md` (human-run) · `docs/analytics-prd.md` for the analytics system (cookieless measurement layer + the gated per-visitor adaptive track) · `COLOPHON.md` for origins.

**Genesis — how the family grows.** A new route joins the court at birth: scaffold its `CLAUDE.md` + `ANOMALIES.md` from `docs/templates/`, fill the family header, add a scriptorium file when it carries copy, and a `DESIGN.md` if it's long-form. No route ships undocumented.

**Maintenance — how it stays alive.**
* New anomaly → archive entry **and** digest line, same commit (the anomaly-librarian agent's job).
* A code change that invalidates a doc claim fixes the doc in the same change.
* Anchors are selectors/symbols/comment-headers — never line numbers. Docs never restate values the code owns; name the token and where it lives (`globals.css` is the source of truth for all token values).
* `node scripts/doc-census.mjs` (or `npm run census`) is the roll-call: digests paired with archives, no orphan routes, family headers present, links resolving. Run by `/release`, and **enforced by a git `pre-push` hook** (`.githooks/pre-push`, wired via `core.hooksPath` on `npm install`) so a manual push can't ship a broken family — bypass only with `git push --no-verify`.

## Hard rules

* **Elements feel docked, tucked, or suspended with intention — never placed nearby.** Notes dock to evidence; cards stack, not list; reveals feel latent and released; sheets relate through the mat.
* **Proof artifacts stay proof artifacts.** Sketches, boards, mockups must keep reading as evidence — never placeholder emptiness.
* **Controls must not lie.** If it looks interactive it works, or it stops implying interaction.
* **Preserve authored values.** Never normalize hand-authored spacing, sizing, offsets, rotations, or gaps because they look unusual. Do not invent layout structure; flag anything without precedent before building.
* **Do not change the chapter tray tilt behavior** unless explicitly asked.
* **Routes never import from each other** — everything shared comes from `app/components/` + `globals.css`. Grep all routes for consumers before touching anything shared.
* **Promotion rule:** a primitive moves to `app/components/` on its **second** use, never the first; flag before moving; the `LIBRARY.md` entry lands in the same commit. (Component refinement loop: tag intent `one-off`/`maybe`/`reused`; state the invariant in one sentence; map existing cousins before writing; tokens not values; stateless where possible — Monostamp's consumer-owned `active` is the reference; variants via props, not forks.) **User can override the 2-consumer rule for the design-system layer** — when he explicitly asks to promote a single-consumer primitive because it belongs to a family that should sit together (e.g. the showcase control trio Switch + PauseButton + DotPager), honor it; still grep, still add the `LIBRARY.md` entry, still update consumers in the same commit.
* **`reference/` is read-only context. Never modify it** (also enforced by settings deny). `_`-prefixed folders are unrouted private/stashed space; graduated dev routes move under `app/_dev-tools/`.
* **Not using:** Tailwind, shadcn/Radix, state libraries, Storybook, MDX, test frameworks. TransitionSlot stays on Framer Motion (not View Transitions API).

## Motion

Paper-physical language: things glide, settle, and land — never snap, bounce, or overshoot.

1. One easing curve, `--ease-paper` (mirrored as `EASE` in TransitionSlot). Tab/micro tier: `--ease-snap` at `--dur-instant`/`--dur-fast` (mirrored as `TAB_EASE` in `app/lib/motion.ts`) — the only sanctioned faster tier; never unify the two.
2. Durations and easings come from the `--dur-*` / `--ease-*` tokens; values live in `globals.css` only. A new value implies a new tier — flag first.
3. No bounce, no overshoot; springs dampened-settle only (documented deviations live in route ANOMALIES). Native scroll — no smooth-scroll libraries, no hijacking. Scroll-mapped transforms (`useScroll`+`useTransform`+`useSpring`) where they materially help; plain CSS when CSS is enough.
4. Section-reveal choreography (mat glides → content places → nav-sled docks) is specced in `LIBRARY.md` → "Sheet".
5. Cross-shell: `(works)/` routes transition via TransitionSlot; outside routes via CrossShellVeil, which needs **both halves** (outgoing hook + incoming fader). Never mix the two idioms on one route.

## Responsive (banned + pointer)

Recompose for mobile; never replicate desktop smaller. Banned: `transform: scale()` on text or whole authored canvases; swipe strips of scaled desktop content; JS media queries for layout (the sanctioned `matchMedia` gate uses the landscape-phone OR-clause); `!important` outside the React-inline-style gate. Breakpoints, the landscape clause, and the crafted-lite stance live in `docs/responsive.md` — **read it before any responsive pass**; log decisions in the route's ANOMALIES under "Responsive anomalies".

## Performance (banned + pointer)

Banned: uncapped font gates; font `display: 'block'`; external Google Fonts links for primary fonts; redeclaring `--font-*` in `globals.css`; the full Material Symbols font; hand-written symbol-font spans; raw multi-MB images. Material Symbols icons render only via `<MaterialIcon>` / NavMarker, keyed to the registry `app/lib/icons.ts`; add one with `npm run icons` (the pre-push hook runs `npm run icons:check` and blocks a stale subset). All content imagery via `<Img>` as `.webp`; run `npm run lqip` after adding/replacing images (a hook reminds you). Full reference: `docs/performance.md`.

## Workflow

* **Steward, not gofer.** Nihar is a designer; treat every request as a design conversation. "Could we do X?" asks whether X is *right*, not whether it's possible — evaluate, recommend, name tradeoffs. Propose the better alternative before implementing a literal ask. **Diagnose before fixing** anything non-trivial: find the root cause (read the rule, the consumer, the cascade) before proposing the change. Surface earned adjacent ideas; recommend which to skip. Make a recommendation — hedging isn't partnership.
* **Analyze before you build.** The digest auto-loads when you touch a protected area; read the archive (`ANOMALIES.md`) before structural changes, grep `LIBRARY.md` before building anything that might exist, read only the closest matching pattern, present a short plan-to-system mapping, and wait for confirmation. Do not skip this.
* **Work rhythm.** One chunk at a time; review before moving on; never auto-continue unless told.
* **Token discipline.** Don't read the repo eagerly; read the current section's source, the closest pattern, and directly relevant shared files. Keep responses tight.

## Versioning and pushing

Every push bumps the minor version (`0.X.0`) and tags `vX.Y.0`. Run **`/release`** — it runs the checks (including the doc census), auto-fixes the mechanical tier, batches judgment calls into one ask, verifies (typecheck + smoke), bumps, tags, and **always confirms with you before pushing**. Never push unannounced or unverified.

## Agents

Agents in `.claude/agents/` self-describe their triggers — select the relevant one(s) before implementing (route-auditor before route edits, anomaly-librarian after discovering constraints, responsive-guardian for responsive passes, frontend-craft for layout/motion, portfolio-guardian for copy/tone). Keep agent usage quiet in responses.
