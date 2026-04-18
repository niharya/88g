# Token-discipline audit — findings

**Branch:** `polish/token-audit` · **Scope:** `/` (landing), `/biconomy`, `/rr`,
`/selected`, shared (`app/components/`, `app/globals.css`, `app/lib/`) ·
**Out of scope:** `/marks`, spacing, typography sizes. **No code changes were
made.** This document is a diff plan.

Each finding is classified:

- **DRIFT** — a token exists and wasn't used. Cheap to fix, no design decision.
- **INTENTIONAL** — hand-authored value that's load-bearing or documented in a
  route's `ANOMALIES.md`. Leave alone.
- **MISSING-TOKEN** — no token exists. Either (a) promote to a new token, or
  (b) accept the literal as a one-off and document it.

MISSING-TOKEN findings are **grouped into clusters** at the bottom so you can
decide whether one new token covers three findings or whether they want
separate tokens.

Numbers in tables are link-style: `file:line` — click to jump.

---

## Tally

| Class | Count |
|---|---|
| DRIFT — colors | 17 |
| DRIFT — durations | 42 |
| DRIFT — radii (no token exists yet, so this is really MISSING-TOKEN cluster 8) | 0 |
| DRIFT — easings | 0 |
| INTENTIONAL — colors (HUD, rules panel, game board, route palette) | ~140 (grouped) |
| INTENTIONAL — durations / scene animations | 9 |
| INTENTIONAL — cubic-beziers | 6 |
| INTENTIONAL — off-ladder shadows | 4 |
| MISSING-TOKEN — clusters | 9 |
| Undocumented deviations (needs author call) | 1 |

Totalled line-level findings worth acting on: **~70**, concentrated in 9
clusters + 18 singletons. Top-5 fix candidates at the end.

---

## By route — DRIFT

### Shared (`app/components/`, `app/globals.css`)

| File:line | Literal | Token | Note |
|---|---|---|---|
| [nav.css:50](app/components/nav/nav.css:50) | `color: #028634` | `var(--mint-720)` | Comment literally says `/* mint-720 */` — slam-dunk |

`globals.css` is internally clean — every color defined at the top of the file
is referenced from there. Motion tokens are defined and consumed. Shadow ladder
is defined and consumed. Two off-ladder shadows in `globals.css` (`--shadow-inset`,
`--shadow-dot`) are named tokens and are correct.

### Landing (`/`)

| File:line | Literal | Token | Note |
|---|---|---|---|
| [landing.css:535](app/landing.css:535) | `#B23000` | `var(--orange-800)` | Exact match |
| [landing.css:535](app/landing.css:535) | `rgba(178, 48, 0, 0.05)` | `color-mix(in srgb, var(--orange-800) 5%, transparent)` | Same color at 5% — pair with above |

See MISSING-TOKEN cluster 3 for landing's 0.4s / 0.25s / 0.35s duration
sprawl — most `ease` one-liners are off-tier.

### /biconomy

Colors in the HUD block (lines 770–900) and the API section (lines 1900–2040)
are **INTENTIONAL** — HUD is a retained dev artifact, API section is an artifact
reproduction with documented off-ladder shadows. See "INTENTIONAL" below.

Outside those zones:

| File:line | Literal | Token | Note |
|---|---|---|---|
| [biconomy.css:115](app/(works)/biconomy/biconomy.css:115) | `rgba(1, 59, 102, 0.2)` | `color-mix(in srgb, var(--blue-960) 20%, transparent)` | blue-960/20 (see cluster 6) |
| [biconomy.css:116](app/(works)/biconomy/biconomy.css:116) | `rgba(3, 100, 167, 0.2)` | `color-mix(in srgb, var(--blue-800) 20%, transparent)` | blue-800/20 (see cluster 6) |
| [biconomy.css:177](app/(works)/biconomy/biconomy.css:177) | `rgba(226, 246, 166, 0.6)` | `color-mix(in srgb, var(--olive-80) 60%, transparent)` | Comment says `/* olive-80/60 */` — slam-dunk |

Durations off-tier: [biconomy.css:117](app/(works)/biconomy/biconomy.css:117)
(`240ms`), [:219](app/(works)/biconomy/biconomy.css:219) (`0.4s` ×2),
[:1478](app/(works)/biconomy/biconomy.css:1478) (`0.4s` ×3),
[:1686](app/(works)/biconomy/biconomy.css:1686) / [:1705](app/(works)/biconomy/biconomy.css:1705)
(`0.35s` ×2). All cluster-3 candidates.

### /rr

Colors in the rules-panel reproduction block (lines 1970–2700) are
**INTENTIONAL** artifact fidelity per `app/(works)/rr/ANOMALIES.md`.

Outside that zone, DRIFT candidates (hex matches a token exactly — almost all
are case-only differences):

| File:line | Literal | Token | Note |
|---|---|---|---|
| [rr.css:1522](app/(works)/rr/rr.css:1522) | `#ffebbd` | `var(--yellow-80)` | Case mismatch only |
| [rr.css:1540](app/(works)/rr/rr.css:1540) | `#f0bb01` | `var(--yellow-320)` | Case mismatch only |
| [rr.css:1571](app/(works)/rr/rr.css:1571) | `#f0bb01` | `var(--yellow-320)` | — |
| [rr.css:1591](app/(works)/rr/rr.css:1591) | `#cd9f09` | `var(--yellow-480)` | — |
| [rr.css:1611](app/(works)/rr/rr.css:1611) | `#cd9f09` | `var(--yellow-480)` | — |
| [rr.css:1796](app/(works)/rr/rr.css:1796) | `#533301` | `var(--terra-960)` | — |
| [rr.css:1805](app/(works)/rr/rr.css:1805) | `#a16803` | `var(--terra-720)` | — |
| [rr.css:1816](app/(works)/rr/rr.css:1816) | `#fedaad` | `var(--terra-160)` | — |
| [rr.css:1823](app/(works)/rr/rr.css:1823) | `#a16803` | `var(--terra-720)` | — |
| [rr.css:1861](app/(works)/rr/rr.css:1861) | `#fedaad` | `var(--terra-160)` | — |
| [rr.css:1870](app/(works)/rr/rr.css:1870) | `#fedaad` | `var(--terra-160)` | — |

These sit in the HUD/interstitial/note-rail zone (yellow pills and terra note
cards). **Verify before converting** — if any is actually inside a rules-panel
sub-block, it's INTENTIONAL instead. Spot-check suggests they are outside.

Durations — rr has the most off-tier spread:

| File:line | Value | Nearest tier |
|---|---|---|
| [rr.css:239](app/(works)/rr/rr.css:239) | `0.55s` | `--dur-settle` (0.5s) |
| [rr.css:575](app/(works)/rr/rr.css:575) | `0.25s` | — (cluster 4) |
| [rr.css:643](app/(works)/rr/rr.css:643) | `0.55s` | `--dur-settle` |
| [rr.css:734](app/(works)/rr/rr.css:734) | `0.55s` | `--dur-settle` |
| [rr.css:975](app/(works)/rr/rr.css:975) | `0.28s` (×2) | `--dur-slide` (0.3s) |
| [rr.css:998](app/(works)/rr/rr.css:998) | `0.28s` | `--dur-slide` |
| [rr.css:1314](app/(works)/rr/rr.css:1314) | `0.32s` | `--dur-slide` |
| [rr.css:1403](app/(works)/rr/rr.css:1403) | `0.46s` + `0.22s` | `--dur-settle` / `--dur-fast` |
| [rr.css:1434](app/(works)/rr/rr.css:1434) | `0.38s` | cluster 5 (0.4s) |
| [rr.css:1500](app/(works)/rr/rr.css:1500) | `0.52s` | `--dur-settle` |
| [rr.css:1524](app/(works)/rr/rr.css:1524) | `0.52s` | `--dur-settle` |
| [rr.css:1722](app/(works)/rr/rr.css:1722) | `0.55s` | `--dur-settle` |
| [rr.css:3022](app/(works)/rr/rr.css:3022) | `0.95s` | `--dur-glide` (0.8s) — verify |
| [game.css:625](app/(works)/rr/components/game/game.css:625) | `0.42s` | cluster 5 |

Scene-entry animations ([rr.css:96](app/(works)/rr/rr.css:96) 2.6s, [:100](app/(works)/rr/rr.css:100) 1.2s, [:746](app/(works)/rr/rr.css:746) 1.4s) are
INTENTIONAL — scene-scale, longer than the tier vocab by design.

`game.css` uses raw `300ms`, `500ms`, `200ms` that happen to match
`--dur-slide` / `--dur-settle` / `--dur-fast`. **DRIFT** — just tokenize in
place; the values are already on-tier.

### /selected

Colors: none outside token system. The per-project palettes are `hsl()`
derivations from brand hex, with hex appearing only in origin comments
(verified [selected.css:17–44](app/(works)/selected/selected.css:17)).

Durations:

| File:line | Value | Nearest tier |
|---|---|---|
| [selected.css:65](app/(works)/selected/selected.css:65) | `0.6s` | cluster 5 |
| [selected.css:182](app/(works)/selected/selected.css:182) | `0.38s` | cluster 5 |
| [selected.css:333](app/(works)/selected/selected.css:333) | `0.28s` + `0.2s` | `--dur-slide` + `--dur-fast` |
| [selected.css:520](app/(works)/selected/selected.css:520) | `0.35s` ×2 | cluster 3 |
| [selected.css:702](app/(works)/selected/selected.css:702) | `0.35s` | cluster 3 |
| [selected.css:776](app/(works)/selected/selected.css:776) | `0.35s` ×2 | cluster 3 |
| [selected.css:779](app/(works)/selected/selected.css:779) | `0.35s` ×2 | cluster 3 |
| [selected.css:1143](app/(works)/selected/selected.css:1143) | `0.6s` | cluster 5 |

---

## INTENTIONAL — leave alone

Documented off-ladder values. Do not "clean up."

### Off-ladder shadows (documented)

| File:line | Value | Why | Source |
|---|---|---|---|
| [biconomy.css:1920](app/(works)/biconomy/biconomy.css:1920) | `0 -4.84px 4.84px 0 rgba(0,0,0,0.25)` | api__card-frame artifact | biconomy/ANOMALIES.md |
| [biconomy.css:2010](app/(works)/biconomy/biconomy.css:2010) | `0 1px 0 0 rgba(0,0,0,0.48)` | api__spin 1px baked rule | biconomy/ANOMALIES.md |
| [biconomy.css:1964](app/(works)/biconomy/biconomy.css:1964) | `drop-shadow(0.68px 0.68px 1.37px rgba(0,0,0,0.24))` | api micro-shadow family | biconomy/ANOMALIES.md (same zone) |
| [biconomy.css:777](app/(works)/biconomy/biconomy.css:777) | `0 8px 24px rgba(0,0,0,0.45)` | HUD panel — retained dev artifact | biconomy/ANOMALIES.md (HUD) |

### Route-scoped shadow families (documented)

| Tokens | Where | Why |
|---|---|---|
| `--rr-card-shadow-rest / -lifted / -flat / -hover` | [rr.css:52–55](app/(works)/rr/rr.css:52) | Card-on-rug physics, not global-ladder paper | rr/ANOMALIES.md |
| `--card-shadow`, `--card-shadow-active` | [game.css:50–51](app/(works)/rr/components/game/game.css:50) | Game board uses `--u` unit scaling | rr/ANOMALIES.md |

### In-game rules-panel reproduction

[rr.css:1970–2700](app/(works)/rr/rr.css:1970) — 80+ hex literals (`#10101a`,
`#333350`, `#c4c4ff`, `#ebbb4c`, `#f1d491`, `#26110e`, `#111d2e`, `#ff7564`,
etc). All INTENTIONAL — faithful reproduction of the in-game rules UI, per
rr/ANOMALIES.md. **Do not normalize to palette.**

### Biconomy HUD zone

[biconomy.css:770–900](app/(works)/biconomy/biconomy.css:770) — dark panel
and buttons (`#f5f5f5`, `#d23a02`, `#ff5f33`, `#f5d142`, various
`rgba(255,255,255,*)`). HUD is a retained dev artifact per
biconomy/ANOMALIES.md — breakage acceptable, don't polish.

### Game board chrome

[rr.css:305–318](app/(works)/rr/rr.css:305) — `.rr-enlarged__close` uses a
glassmorphic `rgba(255,255,255,*)` pattern on a dark overlay. Local to the
enlarged-card modal. INTENTIONAL.

### Scene-scale animation durations

| File:line | Value | Why |
|---|---|---|
| [rr.css:96](app/(works)/rr/rr.css:96) | `2.6s` | Stack-arrive (multi-beat opening) |
| [rr.css:100](app/(works)/rr/rr.css:100) | `1.2s` | Story-sit settle |
| [rr.css:746](app/(works)/rr/rr.css:746) | `1.4s` | Note-rail reveal |
| [rr.css:1241](app/(works)/rr/rr.css:1241) | `0.5s` | On tier (settle) — not drift |
| [landing.css:85](app/landing.css:85) | `0.9s` | `landing-pattern-reveal` — one-off |
| [landing.css:309](app/landing.css:309) | `0.7s` | `hero-glide-up` — one-off |
| [landing.css:428](app/landing.css:428) | `0.6s` | `works-tuck-out` — one-off |
| [landing.css:1173](app/landing.css:1173) | `0.6s` | — |
| [globals.css:534/545](app/globals.css:534) | `0.7s / 0.7s` (the section-reveal lift/settle shadow pair) | Part of the 3-phase reveal choreography; unique to `.section-reveal.is-revealing` → `.is-revealed` transition |

Scene-scale animations are not meant to match the tier vocab — they're
one-shot cinematic beats, each authored for its own arc.

### Cubic-beziers (non-paper, non-snap)

| File:line | Value | Why |
|---|---|---|
| [biconomy.css:740](app/(works)/biconomy/biconomy.css:740) | `cubic-bezier(0.3, 1.3, 0.5, 1)` at `0.14s` | Reciprocal-hover micro-interaction | biconomy/ANOMALIES.md |
| [game.css:611](app/(works)/rr/components/game/game.css:611) | `cubic-bezier(0.2, 1.4, 0.3, 1)` | rr-stack-nudge (game bounce) |
| [game.css:650](app/(works)/rr/components/game/game.css:650) | `cubic-bezier(0.34, 1.8, 0.5, 1)` | rr-icon-pop (game bounce) |
| [TransitionSlot.tsx:29](app/(works)/TransitionSlot.tsx:29) | `'cubic-bezier(0.5, 0, 0.2, 1)'` | JS mirror of `--ease-paper` (CSS↔JS boundary, documented in CLAUDE.md motion rules) |
| [Scorecard.tsx:82](app/(works)/rr/components/game/Scorecard.tsx:82) | `'cubic-bezier(0.5, 0, 0.2, 1)'` at `0.55s` | Same JS-mirror pattern |
| [scrollGlide.ts:4–15](app/marks/lib/scrollGlide.ts:4) | documented mirror of `--ease-paper` | marks — out of scope, listed for completeness |

The JS mirrors are the **same CSS↔JS pattern** as `TAB_EASE` mirroring
`--ease-snap` in `app/lib/motion.ts`. Consistent with the motion system.

### Nav arrow scroll-linked transition

[nav.css:225](app/components/nav/nav.css:225) — `transition: transform 0.08s linear`.
INTENTIONAL: arrow rotates on every scroll frame, needs the shortest possible
interp so it tracks scroll without lag. Not a tier candidate.

### Random micro-delays (reveal stagger)

[landing.css:1248/1259/1277](app/landing.css:1248) (`0.02s` / `0.04s` / `0.06s`),
[landing.css:779–802](app/landing.css:779) (field-stagger delays `0.05s` / `0.12s` / `0.19s` / `0.22s` / `0.29s`).
These are **stagger offsets**, not durations — authored per-element so
items arrive in succession. INTENTIONAL, not a token candidate.

---

## Undocumented deviations — author call

One value that doesn't match any existing token and isn't documented in any
`ANOMALIES.md`. Either tokenize + document, or migrate to an existing tier.

| File:line | Value | Context |
|---|---|---|
| [biconomy.css:468](app/(works)/biconomy/biconomy.css:468) | `transform 0.2s cubic-bezier(0, 1, 0.31, 1.05)` | Switch-thumb ease with slight overshoot (1.05). Either mirror the biconomy switch is INTENTIONAL overshoot (document it like reciprocal-hover) or retire to `--ease-snap` |

---

## MISSING-TOKEN clusters

Each cluster is a pattern that recurs without a token. For each, I name the
cluster, list the occurrences, and propose **one or more** token options so
you can pick.

### Cluster 1 — Pill-btn inset shadow ramp (shared primitive candidate)

Same three-step inset progression appears in **4 locations**, only the tone
ramp changes.

| File:line | Variant | Tone |
|---|---|---|
| [landing.css:376–397](app/landing.css:376) | landing `.pill-btn` | `--terra-560` / `--terra-480` |
| [rr.css:179–191](app/(works)/rr/rr.css:179) | rr pill (unknown selector — verify) | `--yellow-560` / `--yellow-480` |
| [rr.css:967–983](app/(works)/rr/rr.css:967) | rr pill variant #2 | `--yellow-560` / `--yellow-480` |
| [rr.css:1030–1037](app/(works)/rr/rr.css:1030) | rr pill variant #3 | `--terra-560` / `--terra-480` |

Pattern:

```css
box-shadow: inset 0px 0.5px 2px 0px var(--{tone}-560);  /* rest */
box-shadow: inset 0px 1px   5px 0px var(--{tone}-560);  /* hover */
box-shadow: inset 0px 2px   8px 1px var(--{tone}-480);  /* pressed */
```

**Proposal A (preferred):** promote `PillBtn` to `app/components/` with
`tone` prop (defaults to terra). The inset-shadow ramp and radii live there.
One new `LIBRARY.md` entry.

**Proposal B (cheap):** add three custom-property-driven shadow tokens that
take an explicit tone via `--pill-tone`:

```css
--shadow-pill-rest:    inset 0 0.5px 2px 0 var(--pill-tone-560);
--shadow-pill-hover:   inset 0 1px   5px 0 var(--pill-tone-560);
--shadow-pill-pressed: inset 0 2px   8px 1px var(--pill-tone-480);
```

Consumers set `--pill-tone-560` / `--pill-tone-480`. Preserves authored ramp,
keeps variants route-local.

### Cluster 2 — Note ink (rr blue-grey)

| File:line | Literal | Where |
|---|---|---|
| [rr.css:610](app/(works)/rr/rr.css:610) | `color: #3b4b5c` | `.rr-interstitial-text` |
| [rr.css:1562](app/(works)/rr/rr.css:1562) | `color: #3b4b5c` | `.rr-interface-note` |

Not on any ramp. Closest grey is `--grey-320: #525252` (Δ ~18 on L, and it's
neutral, not cool). **Proposal:** rr-local token `--rr-note-ink: #3b4b5c` in
rr.css root block. Single color, two consumers, route-specific — don't promote
to globals.

### Cluster 3 — 0.35s duration (12+ occurrences)

The most common off-tier duration in the codebase. Sits between `--dur-slide`
(0.3s) and `--dur-settle` (0.5s).

Representative hits:

- [selected.css:520](app/(works)/selected/selected.css:520),
  [:702](app/(works)/selected/selected.css:702),
  [:776](app/(works)/selected/selected.css:776),
  [:779](app/(works)/selected/selected.css:779)
- [biconomy.css:1686](app/(works)/biconomy/biconomy.css:1686),
  [:1705](app/(works)/biconomy/biconomy.css:1705)
- [landing.css:704](app/landing.css:704), [:1124](app/landing.css:1124)
- [game.css:499](app/(works)/rr/components/game/game.css:499),
  [:510](app/(works)/rr/components/game/game.css:510),
  [:632](app/(works)/rr/components/game/game.css:632),
  [:702](app/(works)/rr/components/game/game.css:702)

**Pick one:**

- **A.** Tighten to `--dur-slide` (0.3s). Fewer tiers, but shaves 50ms off
  ~12 transitions.
- **B.** Introduce `--dur-slow: 350ms` (or rename to `--dur-settle-light`).
  Preserves authored feel.

### Cluster 4 — 0.25s / 0.28s duration (8+ occurrences)

A second off-tier cluster, between `--dur-fast` (0.2s) and `--dur-slide`
(0.3s), used mostly for dim/filter transitions.

- [nav.css:115](app/components/nav/nav.css:115),
  [:262](app/components/nav/nav.css:262)
- [landing.css:572](app/globals.css:572) (actually `globals.css:572`),
  [:626](app/landing.css:626), [:821](app/landing.css:821),
  [:842](app/landing.css:842)
- [selected.css:333](app/(works)/selected/selected.css:333)
- [rr.css:575](app/(works)/rr/rr.css:575),
  [:975](app/(works)/rr/rr.css:975) (×2),
  [:998](app/(works)/rr/rr.css:998)
- [game.css:486](app/(works)/rr/components/game/game.css:486)

**Pick one:**

- **A.** Normalize to `--dur-slide` (0.3s).
- **B.** Introduce `--dur-dim: 250ms` for filter/opacity fades specifically
  (separate semantic from `--dur-fast` which covers micro UI).

### Cluster 5 — 0.4s / 0.45s / 0.55s / 0.6s duration (15+ occurrences)

The middle and upper-middle range is also off-tier.

- 0.4s: [landing.css:553](app/landing.css:553), [:559](app/landing.css:559),
  [:751](app/landing.css:751); [biconomy.css:219](app/(works)/biconomy/biconomy.css:219),
  [:1478](app/(works)/biconomy/biconomy.css:1478); [marks/marks.css](app/marks/marks.css:294) (out of scope)
- 0.45s: [landing.css:38](app/landing.css:38), [:428](app/landing.css:428)
- 0.55s: [rr.css:239](app/(works)/rr/rr.css:239),
  [:643](app/(works)/rr/rr.css:643),
  [:734](app/(works)/rr/rr.css:734),
  [:1722](app/(works)/rr/rr.css:1722);
  [Scorecard.tsx:82](app/(works)/rr/components/game/Scorecard.tsx:82)
- 0.6s: [selected.css:65](app/(works)/selected/selected.css:65),
  [:1143](app/(works)/selected/selected.css:1143);
  [landing.css:1173](app/landing.css:1173);
  [biconomy.css:89](app/(works)/biconomy/biconomy.css:89)

**Pick one or split:**

- **A.** Normalize all to `--dur-settle` (0.5s) or `--dur-glide` (0.8s),
  losing the middle band.
- **B.** Introduce `--dur-ease: 400ms` and `--dur-settle-long: 600ms` —
  two new semantic tiers. Feels like it adds a lot.
- **C.** Keep 0.55s as INTENTIONAL (it's load-bearing in rr's card physics)
  and normalize only the 0.4s/0.45s/0.6s.

### Cluster 6 — Blue/olive alpha-on-token (color-mix candidates)

Three literal rgba's that are demonstrably tokens at a specific alpha:

| File:line | Literal | Equivalent |
|---|---|---|
| [biconomy.css:115](app/(works)/biconomy/biconomy.css:115) | `rgba(1, 59, 102, 0.2)` | `--blue-960` at 20% |
| [biconomy.css:116](app/(works)/biconomy/biconomy.css:116) | `rgba(3, 100, 167, 0.2)` | `--blue-800` at 20% |
| [biconomy.css:177](app/(works)/biconomy/biconomy.css:177) | `rgba(226, 246, 166, 0.6)` | `--olive-80` at 60% (comment confirms) |
| [landing.css:535](app/landing.css:535) | `rgba(178, 48, 0, 0.05)` | `--orange-800` at 5% |

**Pick one:**

- **A.** Use `color-mix(in srgb, var(--token) NN%, transparent)` inline.
  Modern syntax, supported everywhere we target. Zero new tokens.
- **B.** Mint alpha variants per token (`--blue-960-20`, etc). Adds N tokens
  per alpha-level and will bloat `globals.css`.

Recommend **A** — color-mix is the standard modern fix.

### Cluster 7 — Shadow-reveal pair (`.section-reveal`)

| File:line | Value |
|---|---|
| [globals.css:534](app/globals.css:534) | `0 8px 20px rgba(0,0,0,0.06)` (lifted) |
| [globals.css:545](app/globals.css:545) | `0 1px 3px rgba(0,0,0,0.015)` (settled) |

These are unique to the Phase-2 reveal choreography (documented). Two choices:

- **A.** Leave inline (INTENTIONAL — single-consumer).
- **B.** Token them as `--shadow-paper-lifted` and `--shadow-paper-settled`
  so the reveal choreography has named stops.

Low impact either way. Recommend **A** unless the reveal values start
migrating into other routes.

### Cluster 8 — Border-radius ladder (no tokens exist yet)

Currently zero radius tokens. Clusters in use:

| Value | Count | Candidate token | Uses |
|---|---|---|---|
| `4px` | 8+ | `--radius-sm` | Interior chips, pill-btn `::before` inset |
| `8px` | 8+ | `--radius-md` | Cards, buttons, content tiles |
| `12px` | 1–2 | (`--radius-lg-md`?) | biconomy:1660 only |
| `14px` | 5+ | — | pill-btn `::before`; rules-panel (INTENTIONAL) |
| `18px` | 3 | `--radius-lg` | pill-btn outer (landing + rr) |
| `24px` | 3 | `--radius-xl` | biconomy surfaces |

**Pick one:**

- **A.** Introduce a 4-tier ladder: `--radius-sm` `4px`, `--radius-md` `8px`,
  `--radius-lg` `18px`, `--radius-xl` `24px`.
- **B.** Introduce just `--radius-sm` + `--radius-md` (the only repeating
  ones outside pill-btn / biconomy). Leave pill-btn `18px` inline until it's
  promoted.
- **C.** Defer entirely — document in LIBRARY that 4/8/18/24 are the
  accepted radii without adding tokens. Names can drift with visual intent.

Recommend **A** when the PillBtn promotion (cluster 1) lands, since that's
the natural carrier.

### Cluster 9 — Non-paper transition timings (`ease`, `linear`)

Many `transition: ... ease` or `... ease-in` / `... ease-out` one-liners
outside the nav-arrow frame-tracker and scene animations. Examples:

- [landing.css:553](app/landing.css:553) `transition: background-color 0.4s ease`
- [rr.css:975](app/(works)/rr/rr.css:975) `transition: background 0.28s ease, box-shadow 0.28s ease`
- [game.css:108](app/(works)/rr/components/game/game.css:108) `transition: fill 500ms ease-out, stroke 500ms ease-out`

These default to the browser's ease curves, not `--ease-paper` or
`--ease-snap`. Per the motion rules in CLAUDE.md, **one easing curve**
(paper) is the baseline with `--ease-snap` as documented second tier.
These uses of bare `ease` break the rule.

**Pick one:**

- **A.** Normalize to `--ease-paper` wherever the duration is in paper range
  (≥300ms), `--ease-snap` for shorter tier. Lines up with the motion contract.
- **B.** Accept bare `ease` for filter/opacity-only transitions as a tacit
  third tier, and document that in CLAUDE.md.

Recommend **A** — fewer exceptions.

---

## DRIFT candidates — ranked by impact-per-touch

Higher = more visual / semantic payoff per fix. Used for sequencing a cleanup
PR.

| Rank | Finding | Impact | Touches | Cost |
|---|---|---|---|---|
| 1 | PillBtn promotion → `app/components/PillBtn/` (cluster 1) | High — removes 4× duplication, sets pattern for future pills | 4 files, +1 component, +LIBRARY entry | Medium |
| 2 | [nav.css:50](app/components/nav/nav.css:50) `#028634` → `--mint-720` | Low visual, high signal (appears in every route's nav) | 1 line | Trivial |
| 3 | Cluster 6 `color-mix` migration (3 hits) | Low visual, high tidiness | 3 lines | Trivial |
| 4 | [landing.css:535](app/landing.css:535) `#B23000` / rgba pair → tokens | Medium (contact card gradient) | 1 line (2 edits) | Trivial |
| 5 | rr yellow/terra hex lowercase → token (cluster rr HUD zone, 11 hits) | Medium — verify zone first | 11 lines | Low |
| 6 | Cluster 3 (0.35s) pick-and-normalize | Medium — 12 hits, but choice gates the fix | 12 lines | Blocked by author decision |
| 7 | Cluster 9 (bare `ease`) normalize to `--ease-paper` | Medium — global feel consistency | ~15+ lines | Low, but large diff |
| 8 | Cluster 5 (0.4–0.6s) tier decision | Medium | 15+ lines | Blocked by author decision |
| 9 | Cluster 8 radius tokens + adoption | Low | 20+ lines | Medium |
| 10 | `biconomy.css:468` switch thumb — decide and document | Low | 1 line + 1 doc edit | Trivial |

---

## Out-of-scope notes

- `/marks` has drift too (e.g. [marks.css:21–81](app/marks/marks.css:21)
  defines `#f5f5f5`, `#333`, `#000`, `#1a1a1a` locally). Flagged in case a
  follow-up audit extends scope.
- `globals.css:534/545` (Cluster 7) could go either way — intentionally
  listed there because the reveal choreography is a published motion
  primitive.
