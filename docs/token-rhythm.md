# Token rhythm — the "which token when" guide

The **mental model** for tokens: how to pick a token, when hand-authored is
legitimate, and how to introduce a new token without growing the system out
from under itself. Informed by the `polish/token-audit` pass (now merged).

Read this before editing tokens.

---

## What tokens are for

A token is load-bearing only if **two things are true at once**:

1. The value appears (or will appear) in more than one place.
2. Changing the value in all those places at once is an intended operation.

If both are true, it's a token. If only (1) is true, it's a **coincidence**;
don't token it. If only (2) is true, it's a **one-off** with a single reader;
leave it inline.

This is why `--rr-card-shadow-rest` is a token — four consumers, all meant
to move together when the "rug" feel is tuned. And it's why
`box-shadow: 0 8px 20px rgba(0,0,0,0.06)` in
[globals.css:534](app/globals.css:534) is **not** a token — one consumer, the
Phase-2 reveal, which is choreographed as a single animation.

---

## The ramp mental model

### Color

Every color in the portfolio belongs to one of three places:

1. **Palette ramp** — `--blue-*`, `--olive-*`, `--yellow-*`, `--mint-*`,
   `--orange-*`, `--terra-*`, `--grey-*`, each with steps `80 / 100 / 160 /
   240 / 320 / 400 / 480 / 560 / 720 / 800 / 960`. Reach for these first.
2. **Route-scoped token** — `--rr-border`, `--rr-memo-bg`, per-project hsl
   tokens in `/selected`. Lives in that route's CSS `:root` block or
   equivalent. Reach for these when the value carries **route identity**.
3. **Local literal** — in a `color:` or `background:` line, no token. Only
   legitimate when (a) the color is unique to one element, (b) it's part of
   an artifact reproduction (HUD, rules panel, game board), or (c) it's
   derived through a function (`color-mix`, `hsl()`, `rgba()` on a token).

When you see a hex outside `globals.css`, the first question is always:
**does this match a ramp step?** Grep the ramp. If yes, it's DRIFT. If no,
it's route-scoped or a one-off.

**Alphas:** use `color-mix(in srgb, var(--token) NN%, transparent)` rather
than rewriting `rgba()`. Doesn't need a new token, doesn't lose provenance.

### Duration

Five tiers, nothing else at the baseline:

| Token | Value | When to reach |
|---|---|---|
| `--dur-instant` | 100ms | Hover text-underline dissolve, nav-arrow frame ticks |
| `--dur-fast` | 200ms | Tab switches, micro UI reactions |
| `--dur-slide` | 300ms | Dims, filter fades, opacity ease-outs |
| `--dur-settle` | 500ms | Section reveals, card landings, paper glides |
| `--dur-glide` | 800ms | Long scene beats, cross-fade transitions |

**Anything between two tiers is a decision, not a value.** If you catch
yourself typing `0.35s` or `240ms`, stop and pick a tier. The tier vocabulary
exists to keep the page from feeling like three different products at once.

**When a new tier is legitimate:**

- The value recurs in more than one place.
- There's a semantic name that explains the tier (not just a millisecond
  count). `--dur-dim: 250ms` makes sense — it names a category of
  transition. `--dur-350: 350ms` doesn't; it's a number.
- You can defend it in one sentence against the question "why isn't this
  --dur-slide?"

If any of those three fails, it's not a tier. It's drift.

**Scene-scale animations** (`0.9s` landing pattern reveal, `2.6s` rr stack
arrival) sit outside the tier vocab. They're one-shot cinematic beats, each
authored for its own arc. Don't tokenize them.

### Easing

**One curve at the baseline:** `--ease-paper: cubic-bezier(0.5, 0, 0.2, 1)`.
Everything that "settles like paper" uses it.

**One documented second tier:** `--ease-snap: cubic-bezier(0.45, 0, 0.15, 1)`.
Snappier, used for tab switches and micro UI reactions. Mirrored in JS as
`TAB_EASE` in `app/lib/motion.ts` — keep them in sync.

**Everything else is a deviation that needs `ANOMALIES.md` citation.**
Examples of legitimate deviations currently in the tree:

- Biconomy reciprocal-hover (`cubic-bezier(0.3, 1.3, 0.5, 1)` at 0.14s) —
  micro-overshoot is intentional, documented.
- rr game bounces (`cubic-bezier(0.2, 1.4, 0.3, 1)` and
  `(0.34, 1.8, 0.5, 1)`) — game-local feedback that paper UI deliberately
  doesn't have.

If you write a new cubic-bezier, it lives in route CSS and gets an entry in
that route's `ANOMALIES.md`. No shared bounce tokens — the portfolio's
physical language is *paper*, not *toy*.

**Bare `ease` / `ease-in` / `ease-out` in CSS is drift.** The browser default
curves don't match the paper system. Prefer `--ease-paper` when the
transition is in paper range (≥300ms), `--ease-snap` for faster.

### Shadow

Four-tier elevation ladder:

| Token | Use |
|---|---|
| `--shadow-flat` | At-rest paper, minimal lift |
| `--shadow-resting` | Settled card, visible but grounded |
| `--shadow-raised` | Active/hovered card, airborne |
| `--shadow-overlay` | Tray, tooltip, dialog |

Two off-ladder named tokens:

| Token | Use |
|---|---|
| `--shadow-inset` | Pressed / recessed surfaces |
| `--shadow-dot` | Tiny dot annotations |

Route-scoped shadow families (`--rr-card-shadow-*`, `--card-shadow`) exist
because their physics model is different from paper — cards on a rug, game
tokens on a board. These are local by design.

**Hand-authored shadows** are legitimate when the element belongs to an
artifact reproduction (biconomy api section, rr rules panel, HUD) — there,
the shadow is part of the artifact, not part of the elevation system. They
are not drift. They live inline, documented in that route's `ANOMALIES.md`
under "off-ladder shadows."

### Radius

**No tokens currently.** Values cluster at `4 / 8 / 18 / 24` (px). See
cluster 8 in the findings doc for the proposal. Until tokens exist, keep
radii consistent within a route rather than matching across routes.

### Spacing

Already tokenized (`--space-2` through `--space-112`). Out of scope for this
audit.

---

## When hand-authored is legit

These are not drift. Don't normalize them.

1. **Artifact reproductions** — HUD panels, rules panels, game boards.
   Colors and shadows are part of the artifact. Document the zone in the
   route's `ANOMALIES.md`.
2. **Scene-scale animation durations** — `0.9s+` cinematic beats. Each is
   an authored arc; not a tier.
3. **Stagger offsets** — `0.02s`, `0.05s`, `0.12s` micro-delays that space
   siblings apart in a reveal. Not durations, not tiers.
4. **Micro-interactions with documented physical metaphor** — reciprocal-hover,
   game-bounce. Cite the `ANOMALIES.md` entry.
5. **Retained dev artifacts** — biconomy HUD is explicitly a retained
   dev-tool surface. Breakage is acceptable. Don't polish.
6. **Scroll-linked transforms** — `0.08s linear` nav-arrow rotation is not
   a tier because the target is scroll position, not time.
7. **Alphas via `color-mix` on tokens** — modern syntax. Preserves
   provenance. Not a literal.
8. **Local one-offs that describe a unique element** — one consumer, one
   reader, one authored value. A token would add indirection without
   payoff.

If something matches one of these eight patterns, it's INTENTIONAL. If it
doesn't, it's either DRIFT (tokenize) or MISSING-TOKEN (author call).

---

## Introducing a new token

Before adding a token to `globals.css`:

1. **Count the consumers.** If it's one, don't. If it's two in the same
   route, it's a route-scoped token (not global). If it's two across
   routes, promote.
2. **Name the semantic, not the value.** `--dur-dim` is better than
   `--dur-250`. If you can't name the semantic, you're not ready to
   tokenize.
3. **Grep for near-matches.** If `240ms` appears and `--dur-fast` is
   `200ms`, the question is "is this a drift toward 200ms, or is it a new
   tier?" — never "how do I preserve 240ms." The audit doc flags exactly
   these calls.
4. **Land the token and the migration in one commit.** Don't introduce a
   token and leave the old values in place. Half-migrated tokens are worse
   than none.
5. **Document in `CLAUDE.md` if it's a motion tier.** Motion rules live
   there. All other tokens are self-documenting via grep.
6. **Mirror in JS if there's a JS consumer.** The `TAB_EASE` / `--ease-snap`
   pattern is the reference. Mirror + comment at both sites.

---

## Introducing a route-scoped token

Cheaper than a global token. Use this when:

- The value carries route identity (rug palette, project-specific hues).
- There are two or more consumers in the same route.
- The value doesn't belong in other routes.

Place it in the route's CSS `:root` block (or a `:root`-adjacent equivalent
like `body[data-route="rr"]`). Example: [rr.css:30–31](app/(works)/rr/rr.css:30)
`--rr-border`, `--rr-memo-bg`.

**Promote to global only when a second route needs it.** The LIBRARY
promotion rule applies: second use, not first.

---

## Common anti-patterns

Things that look token-adjacent but are actually drift:

1. **Case-only hex mismatches.** `#028634` vs. `var(--mint-720)` where
   `--mint-720: #028634`. This is the easiest drift to fix and contributes
   nothing to intent — just a forgotten migration.
2. **`rgba()` of a token color.** `rgba(1, 59, 102, 0.2)` where
   `--blue-960: #013B66`. Use `color-mix(in srgb, var(--blue-960) 20%,
   transparent)` instead.
3. **Authoring a duration because "0.3 feels too fast and 0.5 feels too
   slow."** That's your signal to re-examine the animation, not your
   signal to author `0.4s`. Almost every "in-between" duration in this
   codebase is a polished-by-ear value that should collapse to one of the
   tiers.
4. **Bare `ease` to "soften" a transition.** The paper system *is* the
   soft curve. Use `--ease-paper` (or `--ease-snap` if faster). Bare `ease`
   reads as "nothing authored the motion here."
5. **New shadow because "the existing ladder doesn't quite fit."** If the
   shadow is attached to the paper metaphor, the ladder fits — you might be
   reading the wrong tier. If it's attached to a different physical
   metaphor (rug, game board, HUD), it's route-scoped — add a local token,
   don't extend the global ladder.
6. **Bumping a ramp step to match an artwork.** The ramps aren't opinions,
   they're constants. If a hex doesn't match a ramp step, either the
   reference is not part of the portfolio's system (artifact zone) or it
   should be nudged to the nearest step.

---

## The two questions

When you find yourself reaching for a raw literal, ask:

1. **Does the token system already have this?** If yes, use it. (Grep first.)
2. **If not, is it one of the legit hand-authored patterns above?** If yes,
   leave it and document. If no, **flag as MISSING-TOKEN** in the
   appropriate route's ANOMALIES.md or in a follow-up audit, and
   **don't author the literal in new code** until there's a decision.

The system isn't complete — that's fine. But drift happens when someone
adds a literal "just for now" and no one flags it. The flag is what keeps
the ramp from quietly eroding.
