# / (landing) — Anomalies

Route-level architectural anomalies, cross-file wiring, and don't-touch items for the landing route. Code lives at `app/page.tsx` + `app/landing.css` (no dedicated route folder; `app/_landing/` is a stash/docs dir — the `_` prefix keeps Next.js from routing it).

Read this before touching the expand choreography or anything in the secondary stack.

---

## Two-group card system

The landing has two logical groups of cards, and their entrance/exit motion must stay in separate idioms:

- **Group A — hero-tucked.** `about-short`, `about-long`. These live *inside* the hero's mental frame in the default state and tuck out on expand (hero-glide keyframes). They share the hero's random micro-rotation vocabulary.
- **Group B — secondary stack.** `about-practice`, `spectrum`, `contact`. These live *below* the hero in the expanded state only. In the default state they are opacity 0 with a small upward `translateY(-var(--stack-settle))` offset and `pointer-events: none`. On expand, they settle from above into place.

**Do not mix idioms.** Do not apply Group A's hero-tuck keyframes to Group B cards, and do not apply Group B's opacity-fade-settle to Group A. `about-practice` is part of Group B, not an extension of `about-long`, even though the copy continues.

### Choreography tokens

Defined on `.landing` in `landing.css`:

- `--stack-stagger-start: 0.22s` — delay before Group B begins its entrance, so Group A is ~73% through its tuck-out before Group B starts. Lower values cause visual competition.
- `--stack-settle: var(--space-24)` — Y-offset Group B cards start from (above their resting top). Creates the "settling from above" read.
- `--stack-gap: 40px` — design intent for vertical rhythm between Group B cards' unrotated boundaries. Used when positioning new stack cards.

**Cascade offsets.** Spectrum and contact delay by `calc(var(--stack-stagger-start) + 0.02s)` and `+ 0.04s` respectively. This is the Group B cascade. If you add a fourth Group B card, it continues the cascade (+0.06s). Do not restart at 0.

## `@property --practice-rot` — load-bearing

Registered at the top of `landing.css`:

```css
@property --practice-rot {
  syntax: '<angle>';
  inherits: true;
  initial-value: 0deg;
}
```

**Why it exists:** `--practice-rot` participates in a `transform: … rotate(var(--practice-rot))`. Untyped CSS custom properties **snap instantly at t=0** during transitions — they do not interpolate. Without `@property`, on expand the rotation angle changes from old to new in a single frame while `translateY` and `opacity` smoothly animate, producing a visible ghost-flicker (rotation ahead of position).

Typing the property as `<angle>` lets the browser interpolate it across the transition duration in lockstep with the rest of the transform.

This mirrors the same pattern used in `/marks/marks.css` and `/rr/game.css` for angle-valued custom properties. **Do not remove the registration.** If a second stack card gets its own rotation var in the future, register it the same way.

## Rotation reroll must commit with `setExpanded`

In `page.tsx`, `handlePillClick` calls `rerollStackRotations()` **synchronously before** `setExpanded(true)`. Both state updates must batch into the same React commit.

If the rotation is rerolled in a `useEffect([expanded])` instead, it fires one render *after* the transform change, so the transition has already started with the old angle and the new angle arrives mid-flight — this produces the same ghost-flicker that `@property` fixes, and compounds with it.

Keep both safety nets: the `@property` registration *and* the batched commit.

## Rotation pool

`about-practice` picks from `[-2, -1, +1, +2]` degrees, excluding the previous value (so consecutive expands always visibly reroll). 0deg is deliberately absent — the card must always look placed, never axis-aligned.

## Group B collapsed-state contract

Every Group B card in `.landing--default` must:

- set `top` to its final expanded position (not off-screen)
- set `opacity: 0`
- set `pointer-events: none`
- include a `translateY(calc(-1 * var(--stack-settle)))` offset in its transform
- keep any `rotate(var(--*-rot, 0deg))` in the same transform chain

This pattern is what gives Group B its "settle from above" read. A card that drops any of these four properties will enter the stack with the wrong physics.

## Expanded-state transition timing

Group B cards transition `top`, `opacity`, and `transform` on expand. All three use `var(--dur-slide)` with `var(--ease-paper)`, delayed by `--stack-stagger-start` (+ cascade offset per card). Do not stagger these three properties against each other within a single card — they must move as one.

## `--expanded-h` follows practice card height

`--expanded-h` (page height in expanded state) was measured with the practice card at ~471px tall (padding 72 + para 84 + divider 49 + para block 266). If practice card content changes materially, remeasure and update `--expanded-h`, `--spectrum-top`, and `--contact-top` together — they are a linked set, not independent values.

---

## Don't-touch list

- `@property --practice-rot` registration
- `--stack-stagger-start` value (0.22s is tuned against Group A's tuck-out duration)
- Rotation reroll being synchronous with `setExpanded` in `handlePillClick`
- The four-property collapsed-state contract for Group B cards
- The cascade offset sequence (+0.02s, +0.04s, …) on spectrum/contact transitions
