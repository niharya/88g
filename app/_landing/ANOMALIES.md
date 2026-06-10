# / (landing) — Anomalies

Route-level architectural anomalies, cross-file wiring, and don't-touch items for the landing route. Code lives at `app/page.tsx` + `app/landing.css` (no dedicated route folder; `app/_landing/` is a stash/docs dir — the `_` prefix keeps Next.js from routing it).

Read this before touching the expand choreography or anything in the secondary stack.

---

## Two-group card system

The landing has two logical groups of cards, and their entrance/exit motion must stay in separate idioms:

- **Group A — hero-tucked.** `about-short`, `about-long`. These live *inside* the hero's mental frame in the default state and tuck out on expand via `top`/`transform` **transitions** (the `hero-glide-*` keyframes are mount-entrance only — not expand choreography). No random rotation exists anywhere in Group A; that system was removed.
- **Group B — secondary stack.** `spectrum`, `about-practice`, `contact` (in DOM order; see "Group B order" below). These live *below* the hero in the expanded state only. In the default state they are opacity 0 with a small upward `translateY(-var(--stack-settle))` offset and `pointer-events: none`. On expand, they settle from above into place.

**Do not mix idioms.** Do not apply Group A's hero-tuck transitions to Group B cards, and do not apply Group B's opacity-fade-settle to Group A. `about-practice` is part of Group B, not an extension of `about-long`, even though the copy continues.

### Choreography tokens

Defined on `.landing` in `landing.css`:

- `--stack-stagger-start: 0.22s` — delay before Group B begins its entrance, so Group A is ~73% through its tuck-out before Group B starts. Lower values cause visual competition.
- `--stack-settle: var(--space-24)` — Y-offset Group B cards start from (above their resting top). Creates the "settling from above" read.
- `--stack-gap: 40px` — design intent for vertical rhythm between Group B cards' unrotated boundaries. Used when positioning new stack cards.

**Cascade offsets.** After the spectrum/practice swap, the order is spectrum (#1, no offset), about-practice (#2, `+0.02s`), contact (#3, `+0.04s`). If you add a fourth Group B card, it continues the cascade (+0.06s). Do not restart at 0.

### Group B order

Spectrum sits above about-practice in the expanded stack (post-swap). `--spectrum-top` is the first Group B slot below `about-long`; `--practice-top` is computed from `--spectrum-top + spectrum-block`. `--contact-top` and `--expanded-h` are unchanged by the swap because spectrum-block + practice-block totals the same in either order — they're a linked set anchored at long-top and contact-top. If you change either card's height, remeasure both intermediate tops in tandem.

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

**Documented mobile deviation (spectrum only).** The mobile block puts spectrum's `transform` on `--dur-settle` with a +0.12s extra delay while `top`/`opacity` stay on the base beat. Shipped and authored — don't "fix" it to match the desktop rule, and don't copy the stagger to other cards.

## Form-open height bump

`.landing--expanded:has(.contact-card--form-open)` adds +600px to both `.landing--expanded` and `.landing__content` heights. Without this, the open contact card overflows past the fixed `--expanded-h` (overflow is `visible`, so the form renders, but the document ends flush against the form's last pixel — no breathing gap below). The bump is wired via `:has()` so React doesn't have to thread a `--form-open` modifier up to `.landing`. If you change `--contact-top`, the contact card collapsed height, or the form's `max-height` reveal target, remeasure the +600 value at all breakpoints (target ~96px gap below the fully-open form).

## `--expanded-h` follows practice card height

`--expanded-h` (page height in expanded state) was measured with the practice card at ~471px tall (padding 72 + para 84 + divider 49 + para block 266). If practice card content changes materially, remeasure and update `--expanded-h`, `--spectrum-top`, and `--contact-top` together — they are a linked set, not independent values.

---

## Responsive anomalies

### `about-short` is natural-height; dock is manual per viewport

`.about-card--short` has **no** `min-height`. The card shrinks to its natural content height (centered paragraph + tight padding + a divider above the bottom edge on desktop), and the hero docks against that natural bottom via a manually-tuned `--hero-top` per viewport:

- desktop: `--hero-top: 178px`, `--short-top: var(--space-56)` (56), natural card height ~122 → 56 + 122 = 178 ✓
- mobile: `--hero-top: 116px`, `--short-top: var(--space-24)` (24), natural card height ~92 (no divider) → 24 + 92 = 116 ✓

**Why this changed.** The original architecture locked `min-height: calc(var(--hero-top) - var(--short-top))` so the card always filled the dock space at every breakpoint. That worked when the short-copy was the long-form three-clause paragraph it used to be, but the current copy ("I never fit neatly…") is shorter, and the locked min-height left 30–55px of empty space inside the card. Switching to natural-height + token-tuned dock removed that whitespace without breaking the dock.

**If the copy ever grows back.** Either bump `--hero-top` (desktop and mobile) by the new card-height delta, or restore the calc + min-height approach. Don't ship a hardcoded `px` min-height without a tuned `--hero-top` — they'll desync.

`--long-top` and `--projects-top` are part of the cascade — they were shifted by the same delta when `--hero-top` moved, so:

- desktop: long-top 385 sits **33px above** hero-bottom 418 (the long card peeks 33px behind the hero from the bottom edge). projects-top 414 sits 4px above hero-bottom.
- mobile: long-top 347 sits **9px above** hero-bottom 356 (a tighter overlap — there's less space behind the hero on mobile, and only the nav-pill row has to clear). projects-top 352 sits 4px above hero-bottom.

If `--hero-top` changes again, move both `--long-top` and `--projects-top` by the same delta per viewport — they're a linked set, not independent values. Don't unify the desktop and mobile overlap figures; the 9px vs 33px split is intentional.

### About-long horizontal padding is pinned to the discipline copy

`.about-card--long` has `padding-left/right: var(--space-24)` (instead of the standard about-card 32). The reason is that "Studio-building and creative direction" + a trailing `<Monostamp>` chip would not fit on one line at `t-p3` with 32 horizontal padding (text width 320 too narrow). The tighter 24 padding gives text-width 336, which fits.

The mobile `.about-card` rule already uses `var(--space-24)` padding all around, so the two viewports happen to agree — but the *intent* differs. If desktop copy ever changes and you need to widen the inner area further, scope the change with a viewport guard so mobile doesn't follow.

### About-long copy is centered

`.about-card--long .about-card__text` is `text-align: center` — a lead paragraph (`.about-card__lead`, added v0.89) above three discipline rows (row 3 wraps to two lines) reads as a centered list of authored typographic units, with each chip sitting inline after its anchor word. This was a deliberate move *away* from right-edge chip docking; an earlier ledger composition right-aligned the chips, which read as "paying too much attention to the numbers." Don't propose tabular right-alignment again without re-checking that design intent.

### "Growth experiments" is a single typographic unit on row 3

`app/page.tsx` wraps the words "growth experiments" in a `<span style={{ whiteSpace: 'nowrap' }}>` inside row 3 of about-long. This is load-bearing for the wrap shape: with the wrap, line 1 breaks after "and" and line 2 reads "growth experiments [3y]" — keeping the two words together feels like one verbal cluster. Without the wrap, "growth" lands at the end of line 1 and "experiments" sits alone on line 2 next to the chip. Don't remove this `nowrap` span when editing the copy; if you replace "growth experiments" with a different phrase, decide whether the new phrase wants the same treatment.

### Collapsed about-long tuck differs per viewport (v0.90)

The desktop collapsed state lifts about-long **above** the hero top (`top: calc(var(--hero-top) - 20px)`) and scales it to `0.82`, so the card's center aligns with the hero's center and the scaled height fits inside the hero's bounds — the card grew with the v0.89 lead paragraph and the old recipe let it peek out from behind the hero. Mobile keeps the original recipe (`top: var(--hero-top)`, `scale(0.9)`). Both offsets are hand-tuned against the current copy (the inline comment in `landing.css` carries the math); if the card's content changes, re-measure. Don't unify the two viewports' collapsed recipes.

### Mobile about-short — divider hidden, padding dropped

On mobile (`max-width: 767px`), `.about-card--short` deviates from the desktop card recipe:

- the bottom `.about-card__divider` is `display: none`
- `padding-bottom` is `0`
- `padding-top` is `var(--space-16)`
- `--short-top` is `var(--space-24)` (vs desktop `var(--space-56)`)

**Why.** Above-hero space on mobile is tight (`--hero-top: 116px`) and the about-short card needs every pixel for the centered copy. The hero's top edge already serves as the visual seam below the short card, so the decorative divider isn't load-bearing here. Don't restore it on mobile without re-measuring above-hero space and bumping `--hero-top` to absorb the extra height.

### Landing scrollbar hidden

`html:has(.landing)` hides the scrollbar via `scrollbar-width: none` + `::-webkit-scrollbar { display: none }` + `-ms-overflow-style: none`. Native scroll is preserved; only the visual indicator goes away. macOS/iOS/Android already overlay-hide, so the rule is mainly for Windows/Linux. The expand-on-click affordance carries the "more content" signal that the scrollbar would otherwise telegraph — if that affordance changes, reconsider.

## Don't-touch list

- `--stack-stagger-start` value (0.22s is tuned against Group A's tuck-out duration)
- The four-property collapsed-state contract for Group B cards
- The cascade offset sequence (+0.02s on about-practice, +0.04s on contact) following spectrum's base delay
- Group B 0deg rest pose (do not reintroduce random rotation without restoring the typed `@property` + batched reroll safety nets)
