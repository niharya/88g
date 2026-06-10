# Rhythm — tokens, durations, and within-element spacing

One guide for "which token when": the token mental model (color / duration / easing / shadow / radius) and the within-element spacing rhythm. Merged from the former token-rhythm.md + padding-rhythm.md. The hand-authored-legitimacy lists in both parts are protective canon — they are what stops over-cleaning.

Example citations name selectors/classes — the selector is the stable anchor; search it rather than trusting any line number.

---

# Part 1 — Token rhythm

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
to move together when the "rug" feel is tuned. And it's why the lifted
shadow on the Phase-2 reveal (`globals.css`, the
`.section-reveal > :not(.nav-sled)` rule) is **not** a token — one
consumer, choreographed as a single animation.

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

| Token | When to reach |
|---|---|
| `--dur-instant` | Hover text-underline dissolve, nav-arrow frame ticks |
| `--dur-fast` | Tab switches, micro UI reactions |
| `--dur-slide` | Dims, filter fades, opacity ease-outs |
| `--dur-settle` | Section reveals, card landings, paper glides |
| `--dur-glide` | Long scene beats, cross-fade transitions |

Values live in the `--dur-*` block in `app/globals.css` — the single source
of truth; this doc deliberately does not restate them.

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

**No tokens currently.** Values cluster at `4 / 8 / 18 / 24` (px). A
radius-token proposal was sketched in an earlier audit but never landed.
Until tokens exist, keep radii consistent within a route rather than
matching across routes.

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

---

# Part 2 — Within-element padding & margin rhythm

A short usage guide for the existing `--space-*` scale. Tightly scoped to **within-element** decisions: how to space content *inside* a card, pill, list, or rail. Cross-component spacing and section rhythm are out of scope here.

This doc is **descriptive of what already works** plus a **prescriptive default** for the cases the audit flagged as drift. It does not propose new tokens. The scale lives in the `--space-*` block in `app/globals.css`.

```
--space-2:   2px      micro
--space-4:   4px  ┐
--space-8:   8px  │
--space-12: 12px  ├ secondary (4-step)
--space-16: 16px  │
--space-20: 20px  │
--space-24: 24px  ┘
--space-32: 32px  ┐
--space-40: 40px  │
--space-48: 48px  │
…             ─── ┘ primary (8-step) — most within-element work stays below this
--space-112: 112px
```

Within-element work almost always lives in the `2 → 24` range. `32+` is for between-element / structural rhythm; if you reach for `--space-32` for an inner gap, recheck what you're spacing.

---

## Tier-by-tier guidance

### `--space-2` (2px) — seam

A hairline visual seam between adjacent surfaces that should read as physically connected, not as separate elements. Used between a content panel and its tab (the rail pattern). Used between micro-stacked items in a dense list (the dev HUD's coord rows). Don't use for reading-content rhythm — it's too tight to be a gap, almost a join.

Live examples:
- `.flows__notes-rail { gap: 2px }` — content body to tab seam ([biconomy.css:571](app/(works)/biconomy/biconomy.css:571))
- `.rr-rules-rail { gap: 2px }` — same pattern, sibling consumer ([rr.css:636](app/(works)/rr/rr.css:636))

### `--space-4` (4px) — inline label

Icon-to-label pairing inside a compact element. Sub-element gap inside a header row that already has its own typographic rhythm (the elements are close because the type is doing the spacing). Y-padding for a small pill where the type should look tucked in.

Also the right call for the `.project-card__footer` role↔arrow gap that the audit flagged as missing — it lines up with the chevron icon's intrinsic ~6px viewBox padding closely enough to read identically while making the relationship explicit.

Live examples:
- `.flows__notes-tab-inner { padding: 4px 8px; gap: 4px }` — vertical tab inner ([biconomy.css:601–604](app/(works)/biconomy/biconomy.css:601))
- `.rr-rules-rail__tab-inner { padding: 4px 8px; gap: 4px }` — same pattern ([rr.css:660–663](app/(works)/rr/rr.css:660))
- `.flows__header { gap: 4px }` — header sub-elements lean on type spacing ([biconomy.css:370](app/(works)/biconomy/biconomy.css:370))

### `--space-8` (8px) — default tight inner

The default within-element gap. Use when in doubt. Reads as "deliberately close, but not joined." Padding for an inner card sitting inside an outer ring. Tab inner padding-x. Inset hairline offset on rails (matches the outer ring's perceived border thickness). Padding-top for a dashed-link affordance below a paragraph.

This is the tier that the Flows drift values flagged by the original audit (`10px` and `4px 6px`) should land on.

Live examples:
- `.rr-note-rail { padding: 8px }` — terra outer ring around the inner content card ([rr.css:730](app/(works)/rr/rr.css:730))
- `.rr-note-rail__content { padding: 8px }` — inner card of the same rail ([rr.css:776](app/(works)/rr/rr.css:776))
- `.flows__notes-rail { outline-offset: -8px }` ([biconomy.css:573](app/(works)/biconomy/biconomy.css:573))
- `.flows__note-toggle-label { padding-top: 8px }` — dashed link below note text ([biconomy.css:668](app/(works)/biconomy/biconomy.css:668))
- `.flows__nav { gap: 8px }` — counter ↔ navpill ([biconomy.css:511](app/(works)/biconomy/biconomy.css:511))

### `--space-12` (12px) — list-item breath

Vertical breathing inside a list item that has a hairline divider. Tight enough that the item still reads as part of a list, generous enough that the type doesn't crowd the divider. The natural target for the audit's M1 candidate (`.rr-rules-rail__item` currently at 11px).

The 12px tier also appears in `/selected`'s timeline grid as the dots-to-bar and content-to-bar gap — that's between-element, but the value is the same and that consistency is intentional ([selected/ANOMALIES.md:181–188](app/(works)/selected/ANOMALIES.md:181)).

Live examples:
- `.rr-rules-rail__item` should sit here at `padding: var(--space-12) 0` (currently `11px 0` — drift, see findings M1)
- Selected timeline grid uses 12px for content-to-bar gap (between-element; cited for value consistency)

### `--space-16` (16px) — primary inner padding

Padding for a content-rich panel where the user is reading or scanning structured information. List inner padding when items are typographically substantial (titles + body). Card edge inset when the card has multiple stacked text blocks. The single most-used inner-padding value in the portfolio.

Live examples:
- `.rr-rules-rail__list { padding: 16px }` — rules-list inner ([rr.css:694](app/(works)/rr/rr.css:694))
- `.flows__notes-list { margin-top: 16px }` — list breathing from the rail's top edge ([biconomy.css:632](app/(works)/biconomy/biconomy.css:632))
- `.project-card__title / __body / __divider / __footer { left: 16px }` — uniform left inset across all card children ([selected.css:357, 373, 386, 397](app/(works)/selected/selected.css:357))
- `.project-card__title { top: 16px }` — top inset of the card ([selected.css:357](app/(works)/selected/selected.css:357))

### `--space-20` (20px) — illustration / breathing room around a fixed element

Top inset for an illustration anchored to the corner of a card. Breathing room between a rail and its surrounding frame (rail-frame-inset). Less common than 16 or 24, but the right answer when 16 feels cramped against a non-text element.

Live examples:
- `.flows { --rail-frame-inset: 20px }` — rail breathing inside the frame ([biconomy.css:339](app/(works)/biconomy/biconomy.css:339))
- `.project-card__illus--hov { top: 20px }` — terra-card heart illustration ([selected.css:439](app/(works)/selected/selected.css:439))

### `--space-24` (24px) — generous list rhythm

Used for list gap and list padding when the list is the primary content of its container. The rail notes list sits here. Not for tight tab UIs — `--space-8` to `--space-16` covers those. 24 is when the user is reading top-to-bottom and each item should feel like its own paragraph.

Live examples:
- `.flows__notes-list { gap: 24px; padding: 24px }` — sidebar note list ([biconomy.css:631–634](app/(works)/biconomy/biconomy.css:631))

### `--space-32` and above — leaves the within-element scope

If you find yourself reaching for `--space-32` or larger for an inner gap, recheck whether you're really within-element. These tiers handle: between sibling components inside a section, between sections on a sheet, sheet padding (`--sheet-padding-y: 114px` is a primary-tier value, not on the `--space-*` series — it lives in its own token and uses its own clamp pattern for responsive).

Not in scope for this rhythm spec. Mentioned only so the within-element audit doesn't accidentally pull values from the structural-rhythm tier.

---

## When hand-authored values are legitimate

Don't tokenize these. They exist for a reason that the scale can't express cleanly.

### 1. Optical corrections for borders + intrinsic centering

A 1px padding that pairs with a 1px border to give an exact 2px symmetric inset. An 11px y-padding chosen so the visual center of a list item lands on the same pixel as a 12px-gap baseline because the 1px bottom-border eats one pixel of the bottom. These read as "off the scale" but exist to make the scale-aligned thing look right.

If you find one of these, **leave a CSS comment explaining the math.** Untouched, it looks like drift; with a comment, it looks deliberate.

Reference: `.flows__ba-switch { padding: 1px }` — comment at [biconomy.css:436–441](app/(works)/biconomy/biconomy.css:436) is the model. Paraphrased: *"24×16 outer, 1px border, 1px padding, 8px thumb → exactly 2px symmetric inset at both endpoints."* That's how to document an optical hand-authored value.

### 2. Math derivative scales tied to a specific mechanism

When a sub-system needs its own proportional rhythm — typically because it has to scale together as a unit — a local token system tied to the unit's primary dimension is more honest than mapping every step to `--space-*`.

Reference: `.rr-game-panel`'s `--panel-pad` system at [game/game.css:38–42](app/(works)/rr/components/game/game.css:38). Every margin inside the game board is `--panel-pad`, `* 0.67`, or `/ 3`, where `--panel-pad = 24 * --u` and `--u = --panel-w / 256`. Change `--panel-w` and the entire panel rescales proportionally. This is intentionally outside `--space-*` and should stay there.

Pattern: when you have a sub-component that needs to scale as one unit and has more than one internal spacing decision, define a local token (`--<thing>-pad`) on the sub-component's root and derive the rest from it. Don't reach into `--space-*`.

### 3. Coordinate-system tunings for absolutely-positioned content

A floating panel docked relative to a reading frame, an illustration anchored to the optical edge of a card, a story card placed inside a fixed-width mat. These are coordinates, not paddings. They're tuned by eye against the surrounding composition and don't have a "right" scale value.

References:
- `.flows__notes-wrap` derived padding from `--rail-parent-top-offset + --rail-frame-inset` ([biconomy.css:554–558](app/(works)/biconomy/biconomy.css:554)) — derived rail geometry, not a static value.
- `.project-card__illus--notes { top: 62px; left: 288px }` ([selected.css:449–450](app/(works)/selected/selected.css:449)) — hand-tuned illustration anchor.
- Rail open/close transforms (`-12px`, `-50px`, `210px`, `163px`) — documented as a load-bearing triple in [rr/ANOMALIES.md:98–113](app/(works)/rr/ANOMALIES.md:98).

These usually live in `top` / `left` / `right` / `transform`, not in `padding` / `margin`. If you see a `padding` value off-scale and it's clearly serving a coordinate-system role rather than spacing, leave it.

### 4. Animated transforms expressed as calc()

A `margin-right` that interpolates to zero as a sibling collapses to zero width. A `padding` that responds to a CSS variable driven by a JS motion value. These are functions of state, not static values, and the scale doesn't apply.

Reference: `.flows__ba-switch-wrap { margin-right: calc(-8px * (1 - var(--active-t))) }` ([biconomy.css:428](app/(works)/biconomy/biconomy.css:428)) — collapses the parent's `gap: 8px` when the switch hides during standby. The `-8px` is the parent's `gap`, not an authored offset.

### 5. Bleed margins for full-width borders inside padded containers

A negative margin that extends a child's `border-bottom` to the full width of the parent (eating the parent's padding), paired with a matching positive padding so the text re-indents. Both values use the same scale token, but the *combination* (negative + positive of the same value) is the technique. Don't try to "simplify" by removing one half.

Reference: `.rr-note-rail__title { margin: 0 -8px; padding: 0 8px 8px }` ([rr.css:783–784](app/(works)/rr/rr.css:783)). Both sides use `--space-8`; the negative on margin is what pulls the divider to the inner-card edge.

---

## Quick reference — picking a tier

| You're spacing… | Default tier | Notes |
|---|---|---|
| Content panel ↔ tab (rail) | `--space-2` | Reads as a join, not a gap |
| Icon ↔ label (inline) | `--space-4` | Tight enough to feel paired |
| Sub-elements in a header row | `--space-4` | Type spacing carries the rest |
| Inner card inside an outer ring | `--space-8` | Padding on the outer ring |
| Tab inner (vertical or horizontal pill) | `--space-4 / --space-8` | y / x respectively |
| Counter ↔ nav-pill in a header | `--space-8` | Default tight inner |
| Dashed-link below a paragraph | `--space-8` padding-top | |
| List-item vertical breathing (with divider) | `--space-12` | Don't drift to 11 |
| Inner padding of a content-rich panel/card | `--space-16` | Most common |
| Card edge inset across all stacked children | `--space-16` | Be uniform across siblings |
| Illustration anchored to a card corner | `--space-20` (top) | + hand-tuned right/left |
| Generous list (gap + padding) | `--space-24` | When items are paragraph-scale |
| Anything ≥ `--space-32` for an inner gap | recheck | You're probably between-element |

---

*Captures the within-element padding rhythm as the system canon. The audit pass that informed it shipped in `polish/padding-audit`.*
