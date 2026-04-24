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

## Group B card rotation — pinned to 0deg

`about-practice` (and any future Group B card) opens at 0deg. The earlier random-rotation system (`--practice-rot`, `rerollStackRotations()`, `@property --practice-rot` registration) was removed in favour of an axis-aligned rest. If a future Group B card needs random tilt, restore the `@property <angle>` typing AND batch the reroll with `setExpanded` in the same React commit (untyped custom properties snap mid-transition; a `useEffect([expanded])` reroll lags one render and ghost-flickers).

## Group B collapsed-state contract

Every Group B card in `.landing--default` must:

- set `top` to its final expanded position (not off-screen)
- set `opacity: 0`
- set `pointer-events: none`
- include a `translateY(calc(-1 * var(--stack-settle)))` offset in its transform

This pattern is what gives Group B its "settle from above" read. A card that drops any of these four properties will enter the stack with the wrong physics.

**Historical note.** Spectrum and contact previously violated this contract — they started at `--hero-top` with `scale(0.9)` and slid ~1000–1350px down to their final positions while fading in. The long descent read as ghost cards trailing behind the settled hero. They were brought into full compliance so all three Group B cards now settle from ~24px above in place. Do not regress this by re-anchoring spectrum/contact to `--hero-top` or reintroducing `scale()` on them.

**Static artistic rotation is separate from Group B 0deg rest.** Spectrum carries a fixed `rotate(-1deg)` at all breakpoints — this is an authored artistic tilt, not a rerolled rotation. The "Group B pinned to 0deg" rule above refers specifically to the removal of the random `--practice-rot` reroll system; static per-card rotations baked into the transform chain are fine and should be preserved.

## Expanded-state transition timing

Group B cards transition `top`, `opacity`, and `transform` on expand. All three use `var(--dur-slide)` with `var(--ease-paper)`, delayed by `--stack-stagger-start` (+ cascade offset per card). Do not stagger these three properties against each other within a single card — they must move as one.

## Form-open height bump

`.landing--expanded:has(.contact-card--form-open)` adds +600px to both `.landing--expanded` and `.landing__content` heights. Without this, the open contact card overflows past the fixed `--expanded-h` (overflow is `visible`, so the form renders, but the document ends flush against the form's last pixel — no breathing gap below). The bump is wired via `:has()` so React doesn't have to thread a `--form-open` modifier up to `.landing`. If you change `--contact-top`, the contact card collapsed height, or the form's `max-height` reveal target, remeasure the +600 value at all breakpoints (target ~96px gap below the fully-open form).

## `--expanded-h` follows practice card height

`--expanded-h` (page height in expanded state) was measured with the practice card at ~471px tall (padding 72 + para 84 + divider 49 + para block 266). If practice card content changes materially, remeasure and update `--expanded-h`, `--spectrum-top`, and `--contact-top` together — they are a linked set, not independent values.

---

## Responsive anomalies

### Mobile about-short — divider hidden, padding dropped

On mobile (`max-width: 767px`), `.about-card--short` deviates from the desktop card recipe:

- the bottom `.about-card__divider` is `display: none`
- `padding-bottom` is `0`
- `padding-top` is `var(--space-16)`
- `--short-top` is `var(--space-24)` (vs desktop `var(--space-16)`)

**Why.** Above-hero space on mobile is tight (`--hero-top: 160px`) and the about-short card is tall enough that the default desktop recipe pushes its last paragraph line + divider behind the hero. The hero's top edge already serves as the visual seam below the short card, so the decorative divider isn't load-bearing here. Don't restore it on mobile without re-measuring above-hero space.

### Landing scrollbar hidden

`html:has(.landing)` hides the scrollbar via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` + `-ms-overflow-style: none`. Native scroll is preserved; only the visual indicator goes away. macOS/iOS/Android already overlay-hide, so the rule is mainly for Windows/Linux. The expand-on-click affordance carries the "more content" signal that the scrollbar would otherwise telegraph — if that affordance changes, reconsider.

## Don't-touch list

- `--stack-stagger-start` value (0.22s is tuned against Group A's tuck-out duration)
- The four-property collapsed-state contract for Group B cards
- The cascade offset sequence (+0.02s, +0.04s, …) on spectrum/contact transitions
- Group B 0deg rest pose (do not reintroduce random rotation without restoring the typed `@property` + batched reroll safety nets)
