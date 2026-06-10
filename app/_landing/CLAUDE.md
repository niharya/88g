# / (landing) — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family").

**Scope warning:** this digest protects `app/page.tsx` + `app/landing.css`, which live at the `app/` root — directory auto-loading will NOT fire from here when those files are edited. `app/CLAUDE.md` (the branch node) carries the hard pointer; treat that pointer as binding.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale and what-breaks. This digest is the seatbelt; the archive is the manual.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Don't-touch digest

- Two motion idioms must never mix: Group A (about-short, about-long) hero-tucks via top/scale transitions; Group B (spectrum, about-practice, contact) settles from above via opacity + translateY — and about-practice is Group B, not an extension of about-long, even though the copy continues.
- `--stack-stagger-start` is tuned against Group A's tuck-out duration; lowering it makes the two groups visually compete.
- Group B cascade delays are sequential (spectrum +0s, about-practice +0.02s, contact +0.04s) — any new Group B card continues the cascade, never restarts at 0.
- Every Group B card in `.landing--default` must hold all four properties: top at its final expanded position, opacity 0, pointer-events none, and the `translateY(calc(-1 * var(--stack-settle)))` offset — dropping any one breaks the settle-from-above physics.
- Never re-anchor spectrum or contact's collapsed state to `--hero-top` or reintroduce `scale()` on them — that recreates the ghost-cards-descending bug.
- Group B cards rest at 0deg; reintroducing random rotation requires BOTH restoring `@property <angle>` typing AND batching the reroll with `setExpanded` in the same React commit.
- Spectrum's fixed `rotate(-1deg)` is an authored artistic tilt preserved at all breakpoints — it is not part of the removed random-rotation system; don't strip it when enforcing the 0deg rule.
- On expand, each Group B card's top, opacity, and transform transition together with the same duration and delay on desktop — never stagger the three within one card. (Documented mobile deviation: spectrum's transform rides `--dur-settle` +0.12s — shipped and authored; don't "fix" it or copy it to other cards.)
- The form-open height bump (`:has(.contact-card--form-open)`, +600px) must be remeasured at all breakpoints whenever `--contact-top`, the contact card's collapsed height, or the form's reveal target changes.
- `--expanded-h`, `--spectrum-top`, `--practice-top`, and `--contact-top` are a linked set anchored to measured card heights — remeasure dependent tops together, per viewport, never one in isolation.
- `.about-card--short` has no min-height by design; the hero docks against its natural bottom via hand-tuned `--hero-top` per viewport — if the copy grows, bump `--hero-top` by the height delta; never ship a hardcoded min-height without a retuned `--hero-top`.
- `--long-top` and `--projects-top` move with `--hero-top` by the same delta per viewport, and the hero-overlap split (33px desktop vs 9px mobile) is intentional — do not unify the two figures.
- about-long's horizontal padding is `--space-24` (not the standard 32) so the longest discipline row + chip fits on one line — widen only behind a viewport guard.
- about-long's copy is centered by design intent; right-edge/tabular chip alignment was tried and rejected ("paying too much attention to the numbers") — do not re-propose it.
- The `whiteSpace: nowrap` span around "growth experiments" in app/page.tsx row 3 is load-bearing for the wrap shape — keep it when editing copy.
- Mobile about-short intentionally drops the bottom divider and bottom padding (above-hero space is tight) — don't restore without re-measuring and bumping `--hero-top`.
- The landing scrollbar is hidden (`html:has(.landing)`) because the expand-on-click affordance carries the "more content" signal — reconsider only if that affordance changes.
- Desktop collapsed about-long is hand-tuned to stay fully behind the hero (`top: calc(var(--hero-top) - 20px)`, scale 0.82) while mobile keeps `top: var(--hero-top)` at scale 0.9 — re-measure both offsets if the card's copy grows; don't unify the two recipes.
