# Within-element padding & margin audit — findings

Scope: padding and margin **inside** a component (title↔body, icon↔label, card edge↔content, list-item rhythm). Not gaps between components or between sections.

Audit surfaces (one per shipped route):

1. `/biconomy` → **Flows** ([Flows.tsx](app/(works)/biconomy/components/Flows.tsx) + biconomy.css `── Flows section ──` block, lines 295–672)
2. `/rr` → **Mechanics primary mat** ([Mechanics.tsx](app/(works)/rr/components/Mechanics.tsx) + rr.css Rules Rail / Note Rail / primary-mat blocks, lines 624–803, 1683–1731)
3. `/selected` → **ProjectCard** ([ProjectCard.tsx](app/(works)/selected/components/ProjectCard.tsx) + selected.css `.project-card` block, lines 323–460)

Reference scale: `--space-2 / -4 / -8 / -12 / -16 / -20 / -24 / -32 / -40 / -48 / -56 / -64 / -72 / -80 / -88 / -96 / -104 / -112` ([globals.css:117–134](app/globals.css:117)). 8 / 4 / 2 rhythm.

`/marks` excluded (active build). Cross-component spacing excluded (between-element). No new tokens proposed.

---

## Section 1 — `/biconomy` Flows

### 1.1 Inventory (within-element)

| Selector | Property | Value | Token? | Role | File:line |
|---|---|---|---|---|---|
| `.flows` | `gap` | `10px` | ✗ | gap between main column and notes rail wrap | [biconomy.css:307](app/(works)/biconomy/biconomy.css:307) |
| `.flows` | `--flows-main-gap` | `10px` | ✗ | header → frame | [biconomy.css:337](app/(works)/biconomy/biconomy.css:337) |
| `.flows__header` | `gap` | `4px` | ✓ `--space-4` | header sub-elements | [biconomy.css:370](app/(works)/biconomy/biconomy.css:370) |
| `.flows__header-left` | `gap` | `8px` | ✓ `--space-8` | title ↔ B/A pill | [biconomy.css:384](app/(works)/biconomy/biconomy.css:384) |
| `.flows__ba-label` | `gap` | `4px` | ✓ `--space-4` | label sub-elements | [biconomy.css:396](app/(works)/biconomy/biconomy.css:396) |
| `.flows__ba-pill` | `padding` | `4px 6px` | partial (4 ✓, 6 ✗) | pill inner | [biconomy.css:412](app/(works)/biconomy/biconomy.css:412) |
| `.flows__ba-pill` | `gap` | `8px` | ✓ `--space-8` | switch ↔ label-text | [biconomy.css:411](app/(works)/biconomy/biconomy.css:411) |
| `.flows__ba-switch` | `padding` | `1px` | ✗ | thumb optical inset | [biconomy.css:447](app/(works)/biconomy/biconomy.css:447) |
| `.flows__ba-switch-wrap` | `margin-right` | `calc(-8px * (1 - var(--active-t)))` | ✗ | collapse-to-zero gap eater | [biconomy.css:428](app/(works)/biconomy/biconomy.css:428) |
| `.flows__nav` | `gap` | `8px` | ✓ `--space-8` | counter ↔ navpill | [biconomy.css:511](app/(works)/biconomy/biconomy.css:511) |
| `.flows__slide--hidden` | `padding` | `8px` | ✓ `--space-8` | hidden-slide inner inset | [biconomy.css:542](app/(works)/biconomy/biconomy.css:542) |
| `.flows__notes-wrap` | `padding` | derived (rail-parent-top + rail-frame-inset / 0 / rail-frame-inset / 0) | ✗ | rail breathing room math | [biconomy.css:554–558](app/(works)/biconomy/biconomy.css:554) |
| `.flows__notes-rail` | `gap` | `2px` | ✓ `--space-2` | content ↔ tab seam | [biconomy.css:571](app/(works)/biconomy/biconomy.css:571) |
| `.flows__notes-rail` | `outline-offset` | `-8px` | ✓ `--space-8` | inset hairline | [biconomy.css:573](app/(works)/biconomy/biconomy.css:573) |
| `.flows__notes-tab` | `padding` | `0` | n/a | reset (tab-inner pads) | [biconomy.css:597](app/(works)/biconomy/biconomy.css:597) |
| `.flows__notes-tab-inner` | `padding` | `4px 8px` | ✓ `--space-4`, `--space-8` | tab inner | [biconomy.css:601](app/(works)/biconomy/biconomy.css:601) |
| `.flows__notes-tab-inner` | `gap` | `4px` | ✓ `--space-4` | icon ↔ label | [biconomy.css:604](app/(works)/biconomy/biconomy.css:604) |
| `.flows__notes-list` | `gap` | `24px` | ✓ `--space-24` | between notes | [biconomy.css:631](app/(works)/biconomy/biconomy.css:631) |
| `.flows__notes-list` | `margin-top` | `16px` | ✓ `--space-16` | top breathing | [biconomy.css:632](app/(works)/biconomy/biconomy.css:632) |
| `.flows__notes-list` | `padding` | `24px` | ✓ `--space-24` | list inner | [biconomy.css:634](app/(works)/biconomy/biconomy.css:634) |
| `.flows__note-toggle-btn` | `padding` | `0` | n/a | button reset | [biconomy.css:659](app/(works)/biconomy/biconomy.css:659) |
| `.flows__note-toggle-label` | `padding-top` | `8px` | ✓ `--space-8` | dashed-link breathing | [biconomy.css:668](app/(works)/biconomy/biconomy.css:668) |

HUD panel (lines 762–899) is dev-only — see ANOMALIES citation in §1.4. Listed but not audited for rhythm:

| Selector | Property | Value | Token? |
|---|---|---|---|
| `.hud-panel` | `padding` | `12px 14px 10px` | ✗ |
| `.hud-panel__header` | `padding-bottom` / `margin-bottom` | `8px` / `8px` | ✓ |
| `.hud-panel__header` | `gap` | `6px` | ✗ |
| `.hud-panel__collapse` | `padding` | `2px 6px` | partial |
| `.hud-panel__tag` | `padding` | `1px 5px` | ✗ |
| `.hud-panel__list` | `margin` | `0 0 10px` | ✗ |
| `.hud-panel__list` | `gap` | `2px` | ✓ |
| `.hud-panel__item` | `gap` | `8px` | ✓ |
| `.hud-panel__capture` | `padding` | `6px 10px` | ✗ |
| `.hud-panel__hint` | `margin` | `6px 0 0` | ✗ |

### 1.2 Clusters of inconsistency

**A — `10px` between header and frame, and between main column and rail wrap.** Two separate authored 10px values for sibling-spacing decisions inside the Flows root. 10 is not on the scale; the closest tokens are `--space-8` (8px) and `--space-12` (12px). The CSS comments label both as `gap-2.5` (Tailwind nomenclature) — they were ported from the vanilla reference. Both are functionally between-element, but they live inside the Flows root composition so they count as within-element for this audit.

- `.flows { gap: 10px }` — [biconomy.css:307](app/(works)/biconomy/biconomy.css:307)
- `.flows { --flows-main-gap: 10px }` consumed at [biconomy.css:352](app/(works)/biconomy/biconomy.css:352)

**B — `.flows__ba-pill` y/x asymmetry.** `padding: 4px 6px` — y is on scale (`--space-4`), x is not. Reads as a subtle visual irregularity in a small pill. The CSS comment cites `p-1 px-1.5` (Tailwind 0.5-step), confirming the 6px is a Tailwind-port artifact, not an optical decision.

- [biconomy.css:412](app/(works)/biconomy/biconomy.css:412)

### 1.3 Hand-authored values that are intentional (do not change)

- **`.flows__ba-switch` `padding: 1px`** — load-bearing. The CSS comment at [biconomy.css:436–441](app/(works)/biconomy/biconomy.css:436) explains: track 24×16 with 1px border + 1px padding gives exactly 2px symmetric inset for the thumb at both endpoints. Tokenizing this would break the toggle's resting-state symmetry.
- **`.flows__ba-switch-wrap` animated `margin-right`** — a calc tied to `--active-t`; eats the parent's `gap: 8px` when the switch collapses to zero width during standby. Animated math, not a static value.
- **`.flows__notes-wrap` `padding`** — derived from `--rail-parent-top-offset` and `--rail-frame-inset` (20px); these tokens establish the rail-inside-frame geometry that's documented in the CSS comment block at [biconomy.css:313–335](app/(works)/biconomy/biconomy.css:313). 20px is on the `--space-*` scale already (`--space-20`), so the underlying value is fine; the calc shape itself is intentional.
- **HUD panel block (lines 762–899)** — dev-only artifact. ANOMALIES.md cites this: *"It is retained in the codebase as a working artifact — do not remove it, but also do not treat it as an active feature."* ([biconomy/ANOMALIES.md:67–96](app/(works)/biconomy/ANOMALIES.md:67)). Out of scope for the rhythm audit.

### 1.4 Hand-authored values that look like drift (candidates)

| # | Selector | Current | Proposed | Reason |
|---|---|---|---|---|
| F1 | `.flows { gap: 10px }` | `10px` | `var(--space-8)` or `var(--space-12)` | Scale-aligned. 8 if you want the rail to feel tucked tight; 12 if you want a touch more breathing. The current 10 is a Tailwind-port leftover. |
| F2 | `.flows { --flows-main-gap: 10px }` | `10px` | `var(--space-8)` | Header sits directly above the frame with a 2px-bordered frame; 8px reads as a tight, deliberate seam. |
| F3 | `.flows__ba-pill { padding: 4px 6px }` | `4px 6px` | `var(--space-4) var(--space-8)` or `var(--space-4) var(--space-4)` | Pill x-padding should match scale. 8 if the pill should breathe; 4 if it should feel snug like the y-padding. Slight visual change either way — needs a screenshot review. |

---

## Section 2 — `/rr` Mechanics primary mat

### 2.1 Inventory (within-element)

`.rr-mat--primary` and `.rr-mech-family` themselves carry **no** padding/margin — they are positioned containers (`absolute` + width). Internal spacing lives on the rails and game board.

| Selector | Property | Value | Token? | Role | File:line |
|---|---|---|---|---|---|
| `.rr-rules-rail` | `gap` | `2px` | ✓ `--space-2` | content ↔ tab seam | [rr.css:636](app/(works)/rr/rr.css:636) |
| `.rr-rules-rail` | `outline-offset` | `-8px` | ✓ `--space-8` | inset hairline | [rr.css:638](app/(works)/rr/rr.css:638) |
| `.rr-rules-rail__tab` | `padding` | `0` | n/a | reset | [rr.css:656](app/(works)/rr/rr.css:656) |
| `.rr-rules-rail__tab-inner` | `padding` | `4px 8px` | ✓ `--space-4`, `--space-8` | tab inner | [rr.css:660](app/(works)/rr/rr.css:660) |
| `.rr-rules-rail__tab-inner` | `gap` | `4px` | ✓ `--space-4` | icon ↔ label | [rr.css:663](app/(works)/rr/rr.css:663) |
| `.rr-rules-rail__list` | `padding` | `16px` | ✓ `--space-16` | list inner | [rr.css:694](app/(works)/rr/rr.css:694) |
| `.rr-rules-rail__list` | `margin` | `0` | n/a | reset | [rr.css:695](app/(works)/rr/rr.css:695) |
| `.rr-rules-rail__list` | `gap` | `0` | n/a | items butt against each other; rule-divided | [rr.css:696](app/(works)/rr/rr.css:696) |
| `.rr-rules-rail__item` | `padding` | `11px 0` | ✗ | rule-list item vertical breathing | [rr.css:706](app/(works)/rr/rr.css:706) |
| `.rr-note-rail` | `padding` | `8px` | ✓ `--space-8` | terra outer ring | [rr.css:730](app/(works)/rr/rr.css:730) |
| `.rr-note-rail__tab` | `padding` | `14px 0 0` | ✗ | tab top inset (icon glyph) | [rr.css:763](app/(works)/rr/rr.css:763) |
| `.rr-note-rail__content` | `padding` | `8px` | ✓ `--space-8` | inner card | [rr.css:776](app/(works)/rr/rr.css:776) |
| `.rr-note-rail__title` | `margin` | `0 -8px` | ✓ (negated `--space-8`) | full-width divider bleed | [rr.css:783](app/(works)/rr/rr.css:783) |
| `.rr-note-rail__title` | `padding` | `0 8px 8px` | ✓ `--space-8` | text inset + bottom breathing | [rr.css:784](app/(works)/rr/rr.css:784) |
| `.rr-note-rail__text` | `padding-top` | `8px` | ✓ `--space-8` | text spacing from divider | [rr.css:796](app/(works)/rr/rr.css:796) |

GameBoard (`.rr-game-panel`) carries its own `--panel-pad` math system inside [game/game.css](app/(works)/rr/components/game/game.css) — see §2.3 for why that's intentionally off-scale.

### 2.2 Clusters of inconsistency

**A — Rail tab inner padding is consistent across rails.** Both `.flows__notes-tab-inner` and `.rr-rules-rail__tab-inner` use `padding: 4px 8px` and `gap: 4px`. Strong positive signal — the rail-tab pattern reads coherently across routes. (And both rails now share the [Rail.tsx](app/(works)/rr/components/Rail.tsx) shell per [LIBRARY.md](LIBRARY.md).)

**B — `.rr-rules-rail__item` `11px 0` vs the natural `12px`.** 11 is one pixel off `--space-12`. Possibly a typo, possibly an optical adjustment for the 1px border-bottom (so the items' visual centers feel like 12px breathing). No explanatory comment in CSS or ANOMALIES. This is the strongest single-element drift signal in the section.

- [rr.css:706](app/(works)/rr/rr.css:706)

**C — `.rr-note-rail__tab` `padding: 14px 0 0`.** 14 is between `--space-12` and `--space-16`. The icon inside (`.rr-note-rail__tab-icon`, font-size 20, [rr.css:766–770](app/(works)/rr/rr.css:766)) anchors at the top of the tab; 14px likely sets the icon's optical top alignment with the rail's outer ring. Likely intentional but undocumented. Could be tokenized to `--space-12` or `--space-16` after eyeballing the icon position.

### 2.3 Hand-authored values that are intentional (do not change)

- **`.rr-note-rail__title { margin: 0 -8px; padding: 0 8px 8px }`** — the negative margin extends the title's `border-bottom` divider to the full inner-card width (eats the parent's 8px padding), then re-indents the text. The padding mirror is what makes the divider span correctly. Tokens are already on scale — it's the *negative* that's the technique. Don't normalize away.
- **GameBoard `--panel-pad` system** ([game/game.css:38–42](app/(works)/rr/components/game/game.css:38)): `--panel-pad: calc(24 * --u)` where `--u: --panel-w / 256`. All margins are derivatives (`* 0.67`, `* 0.33`, exact `1x`). Deliberate proportional scale system tied to the game-panel width, intentionally separate from `--space-*`. The CSS comment at [game/game.css:1–7](app/(works)/rr/components/game/game.css:1) explains: *"All values flow through the --u scale on .rr-game-panel — change --panel-w"*. Off-scale by design. Out of scope for the rhythm audit.
- **Rail open/close transform values** (`-12px`, `-50px`, `210px`, `163px`) — documented as a load-bearing triple in [rr/ANOMALIES.md:98–113](app/(works)/rr/ANOMALIES.md:98). These are coordinate-system tunings, not padding. Listed for completeness; not in the inventory above.

### 2.4 Hand-authored values that look like drift (candidates)

| # | Selector | Current | Proposed | Reason |
|---|---|---|---|---|
| M1 | `.rr-rules-rail__item { padding: 11px 0 }` | `11px 0` | `var(--space-12) 0` | Single-pixel drift from scale. If the 11px exists for optical balance against the 1px border-bottom, document it; otherwise tokenize. **Verify by screenshot first** — at 12px the rule-list rhythm may breathe slightly more than intended. |
| M2 | `.rr-note-rail__tab { padding: 14px 0 0 }` | `14px 0 0` | `var(--space-12) 0 0` or `var(--space-16) 0 0`, **only after eyeballing icon position** | The icon glyph baseline is what 14 was tuned to. May be a legitimate optical correction; flag for review with a side-by-side screenshot before changing. |

---

## Section 3 — `/selected` ProjectCard

### 3.1 Inventory (within-element)

The card is fixed-size (`408px × 176px`) with all children absolutely positioned. The "padding" of the card is therefore expressed as `top` and `left` coordinates on each child, not as `padding` on the parent. Audited as such.

| Selector | Property | Value | Token? | Role | File:line |
|---|---|---|---|---|---|
| `.project-card` | (none) | — | — | container — fixed dims | [selected.css:323–334](app/(works)/selected/selected.css:323) |
| `.project-card__title` | `top` / `left` | `16px` / `16px` | ✓ `--space-16` × 2 | top-left padding equivalent | [selected.css:357–358](app/(works)/selected/selected.css:357) |
| `.project-card__body` | `top` | `88px` | ✗ (= `--space-88`, but as coord) | layout coord; gap from title-bottom is implicit | [selected.css:372](app/(works)/selected/selected.css:372) |
| `.project-card__body` | `left` | `16px` | ✓ `--space-16` | left padding equivalent | [selected.css:373](app/(works)/selected/selected.css:373) |
| `.project-card__divider` | `top` | `136px` | ✗ | layout coord | [selected.css:385](app/(works)/selected/selected.css:385) |
| `.project-card__divider` | `left` | `16px` | ✓ `--space-16` | left padding equivalent | [selected.css:386](app/(works)/selected/selected.css:386) |
| `.project-card__divider` | `width` | `376px` (= 408 − 16 − 16) | derived | implicit 16px right padding | [selected.css:387](app/(works)/selected/selected.css:387) |
| `.project-card__footer` | `top` | `144px` | ✗ | layout coord; 7px below divider | [selected.css:396](app/(works)/selected/selected.css:396) |
| `.project-card__footer` | `left` | `16px` | ✓ `--space-16` | left padding equivalent | [selected.css:397](app/(works)/selected/selected.css:397) |
| `.project-card__footer` | `gap` | (none) | ✗ | role text ↔ chevron icon | [selected.css:394–400](app/(works)/selected/selected.css:394) |
| `.project-card__illus--hov` | `top` / `right` | `20px` / `58px` | ✓ `--space-20` / ✗ | illus optical anchor | [selected.css:439–440](app/(works)/selected/selected.css:439) |
| `.project-card__illus--notes` | `top` / `left` | `62px` / `288px` | ✗ / ✗ | illus optical anchor | [selected.css:449–450](app/(works)/selected/selected.css:449) |

Implicit vertical rhythm derived from absolute coordinates (with 24px Fraunces title at line-height 1.2 → ~29px tall, single line):

```
top  16  ── title top inset (= --space-16)
top  88  ── body top  (gap from title-bottom ~ 43px)
top 136  ── divider top  (gap from body-bottom ~ 18–22px depending on body length)
top 137  ── divider bottom (1px tall)
top 144  ── footer top   (gap from divider ~ 7px)
top 176  ── card bottom  (footer takes remaining 32px)
```

### 3.2 Clusters of inconsistency

**A — Footer has no `gap` between role text and chevron arrow.**

```css
.project-card__footer {
  position: absolute;
  top: 144px;
  left: 16px;
  display: flex;
  align-items: center;
}
```

The visual gap currently relies on the chevron's intrinsic viewBox padding — `IconChevronRight` uses a 24×24 viewBox with the chevron path drawn at x: 9–15, so when rendered at `size={20}` the icon has ~6.25px of left whitespace baked in. Functional, but undocumented and brittle: if the icon is ever swapped or the viewBox changes, the gap silently disappears.

- Footer: [selected.css:394–400](app/(works)/selected/selected.css:394)
- Icon: [IconChevronRight.tsx:14–30](app/components/icons/IconChevronRight.tsx:14)

**B — Vertical positions are absolute coordinates, not scale tokens.**

The `top: 16 / 88 / 136 / 144` sequence does not speak in `--space-*`. The 88 is coincidentally `--space-88`'s value, but the CSS uses raw numbers, so the relationship is invisible to a reader. Restructuring to flow layout (flex column with `gap`) would make the rhythm visible but is a redesign, not a polish — flagged here for awareness, **not as a fix candidate**.

### 3.3 Hand-authored values that are intentional (do not change)

- **`.project-card__illus--hov` `top: 20px; right: 58px`** — optical illustration anchor against the card's title group. The 58px right offset is hand-tuned to clear the chevron's hover-translate and the title's right edge. No ANOMALIES citation, but the value reads as deliberate (asymmetric, not on scale).
- **`.project-card__illus--notes` `top: 62px; left: 288px`** — same pattern, hand-tuned optical anchor for the blue-card notes illustration. Don't normalize.
- **The fixed-card / absolute-positioning model itself.** The card is sized to fit the timeline composition; restructuring to flow layout would cascade through the whole `/selected` archive timeline. ANOMALIES.md treats the timeline positions as a load-bearing grid.

### 3.4 Hand-authored values that look like drift (candidates)

| # | Selector | Current | Proposed | Reason |
|---|---|---|---|---|
| P1 | `.project-card__footer` (missing `gap`) | (none — relies on icon viewBox padding) | `gap: var(--space-4)` | Make the role↔arrow spacing explicit. `--space-4` matches the chevron's intrinsic ~6px viewBox padding closely enough to look identical at first read but document the intent. Alternatively `gap: var(--space-2)` if a tighter feel is wanted; both are scale-aligned. |

No other in-scope drift candidates. The vertical-coordinate rhythm (B above) is a redesign, not polish.

---

## Cross-section consistency signals

Positive — the rail tab pattern is consistent across `/biconomy` Flows and `/rr` Mechanics:

| Selector | `padding` | `gap` | `outline-offset` | Rail content↔tab `gap` |
|---|---|---|---|---|
| `.flows__notes-tab-inner` | `4px 8px` | `4px` | n/a | `2px` (parent rail) |
| `.rr-rules-rail__tab-inner` | `4px 8px` | `4px` | n/a | `2px` (parent rail) |
| `.flows__notes-rail` | n/a | n/a | `-8px` | n/a |
| `.rr-rules-rail` | n/a | n/a | `-8px` | n/a |

This confirms the Rail-shell promotion in [LIBRARY.md](LIBRARY.md) hasn't drifted — both consumers honor the same internal rhythm. No fix needed.

---

## Summary — top 5 candidates for the first fix pass

Ranked by impact-per-touch (most-visible / least-risky first). All require screenshot review before applying.

1. **F2** — `.flows { --flows-main-gap: 10px }` → `var(--space-8)` ([biconomy.css:337](app/(works)/biconomy/biconomy.css:337)). Tightens the header-to-frame seam to a scale-aligned value. Lowest visual risk; highest signal that "10s" are being purged.
2. **F1** — `.flows { gap: 10px }` → `var(--space-8)` ([biconomy.css:307](app/(works)/biconomy/biconomy.css:307)). Companion to F2 — the same Tailwind-port leftover, in the parent. Resolve as a pair.
3. **F3** — `.flows__ba-pill { padding: 4px 6px }` → `var(--space-4) var(--space-8)` ([biconomy.css:412](app/(works)/biconomy/biconomy.css:412)). Decide between snug (`4 4`) and breathing (`4 8`) by eye. The 6px is the only px-axis-only sub-step value in the section.
4. **M1** — `.rr-rules-rail__item { padding: 11px 0 }` → `var(--space-12) 0` ([rr.css:706](app/(works)/rr/rr.css:706)). Single-pixel drift inside a list — if 11 was for optical correction against the 1px border, document it; otherwise tokenize.
5. **P1** — `.project-card__footer` add `gap: var(--space-4)` ([selected.css:394](app/(works)/selected/selected.css:394)). Make the icon-implicit gap explicit and scale-aligned. Lowest risk, but should be eyeballed against the current rendering since the chevron's intrinsic viewBox padding is what's there now.

Total inconsistencies found: **5 fix candidates** (3 Flows, 1 Mechanics, 1 ProjectCard) + **1 documented optical-review candidate** (M2, `.rr-note-rail__tab` 14px tab top inset).

Per-section breakdown:

- `/biconomy` Flows — 22 in-scope properties audited; 19 ✓ scale, 3 drift candidates (F1–F3), 4 intentional (switch optical, animated margin-right, derived rail geometry, HUD dev-only).
- `/rr` Mechanics primary mat — 14 in-scope properties audited; 12 ✓ scale, 2 drift candidates (M1–M2), 2 intentional (negative-margin divider bleed, GameBoard `--panel-pad` math system out of scope).
- `/selected` ProjectCard — 12 in-scope properties audited; 6 ✓ scale (the four `left: 16` plus `top: 16` + `top: 20`), 1 drift candidate (P1 missing footer gap), 5 intentional/coord (vertical layout coords + illus optical anchors + fixed-card model).

---

## Proposed diffs (for reference; do not apply yet)

### F1 + F2 — Flows root and main-gap

```css
/* biconomy.css:301–344 */
.flows {
  …
  gap: 10px; /* gap-2.5 */
  margin-top: 10px; /* gap-2.5 from Intro */          // ← out of scope (between-section)
  …
  --flows-main-gap: 10px;
  …
}
```

→

```css
.flows {
  …
  gap: var(--space-8);
  margin-top: 10px; /* gap-2.5 from Intro */          // unchanged (between-section)
  …
  --flows-main-gap: var(--space-8);
  …
}
```

### F3 — `.flows__ba-pill` x-padding

```css
/* biconomy.css:404–415 */
.flows__ba-pill {
  …
  gap: 8px; /* gap-2 */
  padding: 4px 6px; /* p-1 px-1.5 */
  …
}
```

→ (recommended; verify by screenshot)

```css
.flows__ba-pill {
  …
  gap: var(--space-8);
  padding: var(--space-4) var(--space-8);
  …
}
```

### M1 — `.rr-rules-rail__item` y-padding

```css
/* rr.css:699–708 */
.rr-rules-rail__item {
  …
  padding: 11px 0;
  border-bottom: 1px solid var(--yellow-240);
}
```

→

```css
.rr-rules-rail__item {
  …
  padding: var(--space-12) 0;
  border-bottom: 1px solid var(--yellow-240);
}
```

### P1 — `.project-card__footer` add explicit gap

```css
/* selected.css:394–400 */
.project-card__footer {
  position: absolute;
  top: 144px;
  left: 16px;
  display: flex;
  align-items: center;
}
```

→

```css
.project-card__footer {
  position: absolute;
  top: 144px;
  left: 16px;
  display: flex;
  align-items: center;
  gap: var(--space-4);
}
```

---

*Generated on branch `polish/padding-audit`. Awaiting review before any component file is modified.*
