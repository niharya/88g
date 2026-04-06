# CLAUDE.md — niharya/portfolio

This file is the persistent working contract for Claude Code sessions on this repo.
Read it at the start of every session. Do not drift from it without explicit instruction.

---

## Project

This is Nihar Bhagat's portfolio site.

- Live site: `https://nihar.works`
- Repo: `niharya/portfolio`
- Original Biconomy reference: `https://88g.vercel.app/biconomy`
- Original Biconomy source: `akshar-dave/88g`

The broader repo contains multiple portfolio routes. There is also a `/rr` route which
may serve as a structural reference for route-specific vanilla modules — but it is
**background context only** unless explicitly needed.

---

## Active working context

**Current focus: `/biconomy` only.**

All implementation, review, and refinement work is scoped to:

- `biconomy/index.html`
- `biconomy/biconomy-page.js`
- `biconomy/biconomy-flows.js`
- `biconomy/biconomy-demos.js`
- `biconomy/biconomy-interactions.js`
- `layouts/biconomy.css`

Shared layers touched by `/biconomy`:

- `tokens.css` — shared design tokens
- `components/components.css` — shared component styles

Do not drift into other routes or shared layers unless the work on `/biconomy` makes
it strictly unavoidable (route integration, a shared primitive already in use, or an
unavoidable shared styling dependency). If you need to touch a shared layer, flag it
explicitly before doing so.

> Confirm actual file and folder names by inspecting the repo at session start.
> The structure above reflects the known state as of April 2026 but may have evolved.

---

## Stack and implementation philosophy

This repo is **vanilla-first**.

That means:

- Hand-authored HTML, CSS, and JS wherever possible
- Local assets
- Route-specific JS modules
- No React, Tailwind, or framework additions
- No build complexity unless something is truly impossible without it

The original Biconomy page (`akshar-dave/88g`) was built in Next.js / React / Tailwind.
The goal here is **not** to preserve that stack identity.
The goal is to preserve the **experience, structure, and poetry** while translating it
into the portfolio's simpler house language. Preserve the original page's relationships
and reading experience, not its framework-shaped implementation details.

### Shared primitives

There is a lightweight shared CSS layer (`tokens.css`, `components/components.css`).
Use it where it applies. Do not extend it for route-specific needs.

There is no assumed shared JS utility layer. If one exists, inspect and confirm before
using it. Do not invent new global abstractions for local Biconomy needs.

---

## Current state of `/biconomy`

This is **not** a rebuild from scratch.

`/biconomy` is already a substantial vanilla translation of the original — roughly
70–80% complete structurally. The remaining work is refinement and recovery, not
re-architecture.

**Do not:**
- Rebuild what is already working
- Port blindly from the React source
- Do generic cleanup or normalization passes

**Do:**
- Continue the existing translation
- Recover relational composition where it has been lost
- Refine proof artifacts, docking relationships, and interaction credibility
- Preserve authored values that are doing real compositional work

---

## Page archetype

Treat `/biconomy` as an **editorial sheet-stack project**:

- Long authored route
- Stacked paper / sheet feeling
- Chapter markers and structured reading progression
- Local section interactions
- Tactile surfaces
- Designed reading environment

This is different from `/rr`, which is a more orchestrated stage experience.
Do not force `/rr`'s interaction model onto Biconomy.

---

## Core design diagnosis

This is the most important sentence for all Biconomy work:

> **The original makes elements feel docked, tucked, or suspended with intention.
> The replica tends to make them feel placed nearby.**

This is the real problem. The active work is **relational composition recovery** —
not generic polish, not visual freshening.

Concretely, this means:

- Notes should feel docked to evidence, not parked beside it
- Proof artifacts should read as real evidence, not placeholders
- Reveal states should feel latent and released, not detached and spawned
- Small punctuation marks should feel curated, not appended
- Sheets should feel physically related, not just flatly rendered

Keep this diagnosis in mind when evaluating any change. If a fix doesn't address the
docking / tucking / suspension relationship, it is probably the wrong fix.

---

## Implementation constraints

### 1. Proof artifacts must remain proof artifacts

If the original relies on real evidence — Notion embeds, Twitter/X posts, demos,
screenshots, sketches — the replica must preserve that feeling of proof.

If an external embed is unreliable:
- Use a faithful local screenshot as a fallback
- Or build a local artifact / modal fallback

Do **not** leave placeholder emptiness where the original had proof.

### 2. Controls must not lie

If something looks interactive — tabs, arrows, toggles, reveal states, player icons,
note markers — it must either:
- Work correctly, or
- Be restyled so it no longer implies interactivity

Dead affordances are worse than missing affordances.

### 3. Route-specific ownership

Keep styles, state, and logic close to `/biconomy`.

Avoid:
- Route-specific assumptions leaking into global layers
- App-wide abstractions built for local interactions
- Framework-shaped architecture

Prefer:
- Route folder modules
- Route-scoped CSS and layout
- Named vanilla modules with clear ownership
- Light page orchestrators only when coordination is genuinely needed

### 4. Preserve authored values when they are doing real work

Do not aggressively normalize the page because of explicit pixel values or
hand-authored spacing decisions. This page is composed by eye in many places.
Preserve that where it contributes to the reading environment.

### 5. Vanilla-first means minimal machinery, not messiness

- CSS handles presentation
- JS handles only necessary state and interaction
- Modules have clear ownership
- Simple route-specific orchestration only

### 6. Chapter tray — tilt behavior (do not revert)

When the chapter tray opens, every large element within each sheet (`.sheet > :not(.nav-sled)`)
gets an individual random tilt. Rules:

- Values are from the set `{-2, -1, +1, +2}deg` only — no in-between, no zero
- Each element within a sheet tilts independently (not the whole sheet as one)
- Tilts re-randomise on every open (fresh values each time)
- `--tilt` is set as an inline CSS custom property on each element via JS; CSS consumes it
- The tray also darkens the background (`brightness(0.68)`) without blur
- The tray closes automatically when a *different* chapter pill docks (user has scrolled into another chapter)
- Do not close on "own pill undocks" — the user may scroll up within the open chapter to see the topmost tray items

---

## Visual source of truth

Screenshot-based comparison is part of the standard workflow.

**If screenshots are available at session start:**
Use them as the primary visual source of truth alongside code. Compare the current
replica against the original before making visual judgements.

**If screenshots are not available:**
Capture fresh reference screenshots of both the original (`88g.vercel.app/biconomy`)
and the current replica before beginning any visual work. Do not work from code
structure alone when the problem is relational or compositional.

Do not assume screenshots are always in hand. Establish visual references first.

---

## Session-start rule

Before implementing any chunk, inspect the current `/biconomy` files and confirm
whether the assumptions in this file still hold. If repo structure, shared primitives,
or route ownership have changed, update `CLAUDE.md` first before proceeding with
implementation.

---

## Workflow discipline

- Work in **chunks**, not giant all-at-once passes
- Group changes by section or area — do not mix concerns across a single pass
- After each chunk: review diffs before moving on
- Commit after each working chunk with a clear, scoped message
- If context gets long or ambiguous, explicitly reorient: **"where are we?"**
- Use screenshots as visual source of truth for all relational / compositional work
- Compare against the original page and original source repo where relevant
- Do not proceed past a section if the docking/composition diagnosis still applies

---

## Assumptions flagged

The following are based on the known state as of April 2026. Confirm at session start:

- Actual file names and folder structure in `/biconomy`
- Whether a shared JS utility layer exists (assumed: none)
- Whether any new shared primitives have been added to `tokens.css` or
  `components/components.css` since last session
- Whether screenshot references are already in the working folder or need to be
  captured fresh

---

*Last updated: April 2026. Update this file when the active working context changes.*
