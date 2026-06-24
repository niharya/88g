# Navigation & Loading Choreography

The reference for how the site moves *between states* — first load, page switches, back, cross-shell moves, and waiting. It names the five motions, maps each to the primitive and tokens that implement it, and records what's built vs. deliberately left alone. Load it before touching the gate (`layout.tsx`/`globals.css`), the loader, `TransitionSlot`, `CrossShellVeil`, or `useReveal`.

> This began as an implementation PRD; §1–10 are the durable reference, and §11–12 are the **Decisions & status** appendix (what was implemented, what was assessed and consciously skipped, and why). Component-internal motion (tabs, hovers, scroll-linked glides) is out of scope and unchanged.

**Source of truth for values:** the `globals.css` token block. This doc names tokens; it never restates their numbers except where a value is deliberately *outside* the token scale (those are flagged).

---

## 1. Problem

The site moves between states in **three unrelated idioms** that don't read as one world:

| Moment | Today | Feel |
|---|---|---|
| First load | gate holds at `opacity:0`, then a flat opacity flip | abrupt; page arrives "raw" (wide font swaps in *after* reveal) |
| Works ↔ Works | `TransitionSlot` — ghost recedes, new mat emerges | good, but its own bespoke motion |
| Cross-shell (landing/marks/sop) | `CrossShellVeil` — black opacity veil | a different language entirely |

Plus: no feedback when a route stalls on a slow network (the page just freezes), and a ~100 ms dead frame between click and the transition starting.

**Symptoms the user reported:** loader doesn't hold on 3G; page reveals half-formed; wide font kicks in late; reveal + exit feel abrupt.

---

## 2. Goals / non-goals

**Goals**
- One coherent spatial language across every state change, built from existing primitives + tokens.
- First load and every subsequent arrival use the **same entrance gesture**, so the site feels continuous.
- Nothing arrives "raw" — fonts and above-the-fold assets are settled before a surface is shown.
- The loader is the **single** universal "waiting" signal (first load *and* slow navigation).
- Every click is acknowledged on the same frame.
- Honor `prefers-reduced-motion`; never regress keyboard/focus.

**Non-goals**
- No new section authoring or layout. No re-theming.
- Not chasing Lighthouse FCP/LCP — this is the deliberate "orchestrated intro" stance for a craft portfolio (see §8 tradeoff).
- Not rewriting `TransitionSlot`'s DOM-snapshot mechanism — only aligning its *entrance* to the shared gesture.

---

## 3. The model — "the reading desk"

The site is a sheet-stack reading environment. Five motions, each mapped to an **existing** primitive and to existing tokens:

| Motion | What it is | Primitive (exists) | Tokens / values |
|---|---|---|---|
| **Place** | a sheet glides down, settles, content sets, nav docks | Sheet `section-reveal` (3-phase) | mat `--dur-glide` · content `--dur-glide` +0.15s · nav-sled `--dur-settle` +0.25s · `--ease-paper` · ±1.5° `--place-rotate` |
| **Lift** | current sheet dims + recedes away | `TransitionSlot` ghost exit | content dim 200/340 ms + recede 420 ms@100 ms · `--ease-paper` |
| **Exchange** | Lift + Place, overlapped | `TransitionSlot` | enter mat 520 ms@460 ms, content 460 ms@520 ms · `--ease-paper` |
| **Dim** | desk darkens to cross rooms | `CrossShellVeil` | in 900 ms · out 700 ms · `--ease-paper` |
| **Hold** | the Startooth loader sits on the bare desk | `StartoothLoader` + page gate | gate until ready (8 s cap) · loader fade `--dur-slide` · entrance scale .92→1 / rotate −2°→0° `--dur-slide` |

**The unification:** every *entrance* — first load, page switch, cross-shell arrival — resolves into **Place**. The loader **Hold** covers every wait. That's the whole idea: one entrance gesture, one wait signal.

---

## 4. Motion vocabulary — token coordination

**Easing is already unified** and stays so: `--ease-paper` for all page-level motion (`TransitionSlot`'s `EASE` and `CrossShellVeil` already mirror it); `--ease-snap` stays reserved for the tab/micro tier (`TAB_EASE` in `app/lib/motion.ts`) — **page-level choreography never uses snap.** This matches CLAUDE.md → Motion rule 1.

**Duration coordination — and the one honest gap.** Component motion uses the `--dur-*` scale (`instant .1` → `glide .65`). But the *page-level* choreography already runs **longer, bespoke** values that exceed the scale:

- `TransitionSlot`: 420 / 460 / 520 ms (raw constants, on `--ease-paper`)
- `CrossShellVeil`: 700 / 900 ms

These are intentional — cinematic page transitions read slower than component motion — but they are **not tokens**, which violates "values live in `globals.css`; a new value implies a new tier — flag first" (CLAUDE.md → Motion rule 2). This PRD must resolve that. **Proposal:** introduce a documented **cinematic tier** of two tokens for page-level motion —

- `--dur-cine` (the ~520 ms "sheet emerges" beat)
- `--dur-cine-long` (the ~900 ms "room dim" beat)

— defined in `globals.css`, consumed by `TransitionSlot`, `CrossShellVeil`, and the new first-load Place. The exact numbers are a tuning decision (start from today's 520 / 900); the point is they become *named tiers*, not magic constants. `TransitionSlot`'s phase-relative offsets (the +100 / +460 / +520 ms delays) stay as local constants — they're choreography structure, not reusable durations. **Decision needed (D1).**

---

## 5. Per-movement spec

### 5.1 First load (cold)
1. **Hold.** Page surfaces gated at `opacity:0` (existing gate). The `StartoothLoader` shows, animated (trace/twinkle per route), and **holds until the page is actually ready** — `window.load` AND `document.fonts.ready`, 8 s cap. *(Already implemented.)*
2. **Reveal = Place, not a flat flip.** On ready, the loader exits (`page-boot-out`, `--dur-slide`) and the first surface runs the **Place** gesture — i.e. the route's first `Sheet` plays its `section-reveal` as the entrance, rather than the whole `.workbench` flipping `opacity 0→1`. For the **landing** (not a Sheet), define a Place-equivalent: hero mat glides in `--dur-glide`, then chips/nav dock `--dur-settle` +0.25s. *(Changes today's flat reveal.)*
3. **Sequence, don't overlap.** Loader exit *leads*, Place *follows* (small overlap OK); not a simultaneous cut. **Decision needed (D2): full handoff vs slight overlap.**

**Prerequisite:** the 643 KB Google Sans Flex variable font (`--font-ui`, the `wdth 120` look) must be applied *before* Place, or the page Places raw and snaps wide. → **§7**.

### 5.2 Works ↔ Works switch
- **Exchange** via `TransitionSlot`, kept. **Change:** retune its *entrance* (the `ENTER_*` mat-emerge) so it equals the **Place** gesture (mat glide + content settle + nav dock, same offsets/easing), so a switch arrival and a cold arrival feel identical. Lift (ghost exit) stays as-is.
- Direction-aware travel stays (deeper = subtle 8/24 px; back = pronounced 28/64 px).

### 5.3 Back
- **Exchange, reversed.** The previous sheet Places *from the direction you left* (today `TransitionSlot` already distinguishes deeper vs exit via `GHOST_*_EXIT` and larger Y — promote this to the explicit rule: back always reverses the forward spatial vector).
- Landing-return (`NiharHomeLink`) and works-exit (`ExitMarker`) currently use plain `<Link>` with ad-hoc slide-ins → bring them under the same Exchange/Place direction rule. **Decision needed (D3): unify exit links into the choreography, or leave plain.**

### 5.4 Cross-shell (works ↔ marks / sop / landing)
- **Dim → (Hold if needed) → Place.** Keep `CrossShellVeil`'s dim for the "different room" read. **Changes:**
  - If the destination isn't ready when the veil reaches full, **Hold** (mount the loader inside the veil) instead of holding a frozen black screen.
  - Destination arrival runs **Place**, not an instant cut from black.
  - **Decision needed (D4): keep the veil pure black everywhere, or use a paper-tone dim for landing/sop and reserve black for `/marks` (the void)?**

### 5.5 Stall feedback (any navigation)
- If a soft navigation can't paint within ~250 ms (prefetch miss / slow net), mount the `StartoothLoader` (**Hold**) until the route is ready, then **Place**. This is the documented "next consumer" of the loader (`loading.tsx` / Suspense fallbacks). In production most routes are static + prefetched (~5 ms), so this is a slow-network safety net, not the common path.

### 5.6 Click acknowledgment
- Every `NavMarker` acknowledges on click within `--dur-instant`/`--dur-fast` on `--ease-snap` (press/morph) — the existing `acknowledgeOnClick` machinery — so there is never a dead frame before Lift/Dim begins. Audit that all nav entry points set it.

---

## 6. Existing primitives this builds on (no rewrites)
- **Place:** `Sheet` + `.section-reveal` (`LIBRARY.md` → Sheet) + `useReveal`.
- **Lift / Exchange:** `app/(works)/TransitionSlot.tsx` (+ `useReveal` ↔ `.transitioning` contract).
- **Dim:** `app/components/CrossShellVeil/` (both halves required — hook + entry fader).
- **Hold:** `app/components/StartoothLoader/` + the gate in `app/layout.tsx` / `globals.css`.
- **Acknowledge:** `app/components/NavMarker/` (`acknowledgeOnClick`).

---

## 7. Dependencies / prerequisites
- **P1 — Icon subset is complete (13, not 11).** `keyboard_arrow_up` / `keyboard_arrow_down` (the `/all` archive toggle, `Timeline.tsx`) are missing from `MaterialSymbolsRounded-subset.woff2` and render broken. Re-subset to 13. (Blocks nothing but is a live regression — fix first.)
- **P2 — Shrink `--font-ui` (Google Sans Flex, ~643 KB).** It can't load inside the gate's window on 3G, so the page Places raw and the wide font snaps in late. Subset it (Latin + the axes actually used: `wght`, `wdth`, `GRAD`, `opsz`) and/or add `size-adjust`/metric-matched fallback so any residual swap doesn't shift layout. **Required for first-load smoothness.** See `docs/performance.md`.

---

## 8. Tradeoff (explicit)
Holding the page behind the loader until ready is the **orchestrated-intro** stance: better crafted feel, worse synthetic metrics (FCP/LCP) and a longer wait on slow networks. The animated loader is what makes that wait read as intentional. Accepted for this portfolio's audience (studio heads / CDs). The 8 s cap bounds the worst case.

---

## 9. Reduced motion & a11y
- `prefers-reduced-motion: reduce`: Place/Lift/Exchange collapse to a short cross-fade (or instant); loader entrance disabled (mark shown static, fully drawn). Dim shortens. (Pattern already present per-primitive — extend consistently.)
- Focus must land on `#content` after every navigation; the skip-link path is preserved; the gate never traps focus on hidden surfaces (gated surfaces are `pointer-events:none` + `opacity:0`, already the case).

---

## 10. Acceptance criteria
1. On a Slow-3G cold load: loader appears and **holds, animated**, until ready; page **Places** in fully formed — no wide-font snap, no element pop-in. *(Verify on `next build && next start`, not dev.)*
2. First-load entrance and a works→works switch entrance are visibly the **same** gesture.
3. Back reverses the forward spatial direction.
4. Cross-shell: no frozen black; stalls show the loader; arrival Places.
5. No dead frame between any nav click and motion start.
6. All page-level motion on `--ease-paper`; durations resolve to named tiers (`--dur-*` or the new cinematic tier), no stray magic ms.
7. Reduced-motion path verified; keyboard nav + focus intact.
8. All 13 icons render.

---

## 11. Phasing
- **Phase 1 — fixes the reported pain:** P1 (icons) · P2 (font) · first-load reveal becomes Hold → Place with a sequenced loader exit (§5.1). Smallest set that makes cold load smooth + non-raw.
- **Phase 2 — coherence:** unify the works-switch + cross-shell *entrances* to Place (§5.2, §5.4); add stall-Hold (§5.5) + click-acknowledge audit (§5.6); introduce the cinematic-tier tokens (§4).
- **Phase 3 — polish:** back-direction rule (§5.3); cross-shell dim treatment decision (D4); reduced-motion sweep (§9).

---

## 12. Decisions & status (appendix — resolved)
- **D1** — RESOLVED (CTO, on inspection): keep them as **documented local constants**, do NOT add tokens. The page-transition beats are a tuned set (≈420/460/520/700/900 ms) that don't reduce to two tokens without losing the tuning or changing the feel. Forcing them in would be lossy. They're an intentional cinematic tier beyond the component `--dur` scale — the design-system rule's intent ("no arbitrary magic values") is satisfied by their in-file comments, not by tokenisation.
- **D5** — RESOLVED (user): leave cross-shell transitions as-is (black veil everywhere). Phase 1 fixed the reported problems; the choreography is called done. Phases 2–3 were assessed and consciously **not pursued** — works-switch is already a Place-family entrance, the durations are documented-not-tokenised (D1), stall-loader is ~zero value on a static+prefetched site, and the veil tone is left black by choice.
- **D2** — First-load loader exit: full handoff (loader gone, then Place) or slight overlap?
- **D3** — Bring exit/home links (`ExitMarker`, `NiharHomeLink`) under the Exchange/Place rule, or leave their plain-`<Link>` slide-ins?
- **D4** — Cross-shell veil: pure black everywhere, or paper-tone dim for landing/sop and black reserved for `/marks`?

---

## 13. Doc-family landing
On approval: this file becomes the navigation-choreography reference (add to the root `CLAUDE.md` reference list). New tokens → `globals.css` + a note in `docs/rhythm.md`. Any new constraint discovered during build → the relevant `ANOMALIES.md` + digest line, same commit (anomaly-librarian). `TransitionSlot` / `CrossShellVeil` / `Sheet` / `StartoothLoader` `LIBRARY.md` entries updated to cross-reference this spec.
