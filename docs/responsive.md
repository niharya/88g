# Responsive rules

Full reference for responsive work on the portfolio. CLAUDE.md carries a short
summary; read this file before starting a responsive pass.

Breakpoints: mobile < 768px, tablet 768–1023px, desktop ≥ 1024px.

---

## Principles

* **Recompose, don't replicate.** Mobile gets a purposefully different composition that preserves editorial intent. Don't scale desktop down.
* **No hacks.** If a responsive need comes up, implement it cleanly. No `transform: scale()` on text. No `!important` chains. No hidden-but-present-in-DOM tricks that misrepresent content. If the clean solution takes five more minutes, spend them.
* **Structural breakpoints for layout changes** (absolute → flow). **Fluid scaling for spacing/sizing** (clamp, vw, container queries). Don't use JS media queries — risks hydration mismatches.
* **Halve, don't delete, brand details** that carry identity. The 8px black viewport frame becomes 4px on mobile, not hidden.
* **Different copy per viewport**: render both spans in JSX and use CSS visibility classes (`.xxx--desktop` / `.xxx--mobile`). Clean, no hydration risk, no JS.
* **Decorative elements** (timeline bars, dot clusters, spatial markers) are desktop features. Remove or reduce on mobile in favor of inline color-coding, textual markers, or simple dividers.

## Global mobile patterns

* **Nav pills (project marker + chapter marker)**: centered horizontally, sticky at `top: 0`, tucked into the top black frame. Pulled up via negative `margin-top` equal to the workbench padding so the pill's top edge sits flush with the viewport top; the 4px black frame (z: 9999) overlaps the pill's first few pixels for the tucked feel. Stays in place on scroll.
* **Mat as last element**: when a `.mat` (or `.selected-mat`, etc.) is the final content block on a page, it extends full-bleed horizontally **and** fills remaining vertical viewport space via `flex: 1 0 auto` on the mat with its ancestor as a flex column. This avoids orphaning the page background below the mat. Negative `margin-bottom` equal to workbench padding lets it bleed to the bottom frame edge.
* **Black viewport frame**: 8px on desktop, 4px on mobile (in `globals.css` `.workbench::before`).

## When implementing

Start with the mobile composition as a separate design, not a derivative of desktop. If an approach feels hacky, it probably is — find a better mechanism (CSS visibility classes, clamp, container queries, breakpoint-scoped property overrides) before committing.

## Crafted-lite stance

Responsive work on this portfolio is **crafted-lite**. Two layers:

1. **Content and density → lite.** A usability floor. Drop ornaments, reduce proof-artifact density, simplify complex grids, remove what won't read at 375px. If a route fails this floor, it isn't shipped.
2. **Composition → crafted.** What remains is *authored* for mobile — not mechanically column-stacked from desktop. Section order, spacing tiers, typographic hierarchy, section-to-section rhythm, and touch affordances are chosen for the phone. `/marks` is the quality bar for what authored-for-mobile reads like.

For the shape-by-shape decision tree, sanctioned techniques, banned hacks, and per-route field notes, see [`docs/responsive-playbook.md`](./responsive-playbook.md). This file carries principles; the playbook carries decisions.

**Practical test.** If a designer were authoring this section from scratch for a 375px viewport, what composition would they choose? That is the crafted answer. Anything less is a retrofit.

### The lite floor (content and density)

Every route must clear this floor before any crafted layering.

* No horizontal overflow at 375px.
* Body copy readable at 375px without zoom; no `transform: scale()` fixes.
* Touch targets ≥ 44px for anything interactive.
* Mobile tucked pill nav present (project marker + chapter marker), per the global pattern above.
* 4px viewport frame active on mobile (the halved brand detail).
* Mat-as-last-element flex chain where the page ends on a mat.
* Responsive copy variants via the two-span CSS visibility pattern when phrasing differs.
* `:hover`-only affordances disabled or replaced on touch.

**What drops without re-authoring.**

* Decorative desktop elements (timeline bars, dot clusters, spatial markers) — remove on mobile; do not shrink.
* Hand-placed embellishments (rotated stamps, offset notes, marginalia) — allowed to drop out.
* Proof-artifact-dense set pieces (scroll-choreographed splits, dense editorial grids) — simplify or still; do not rebuild.

### The crafted layer (composition)

What survives the floor gets composed with intent.

* **Reading order is named, not inferred.** Flow isn't the default — you choose the order a phone reader's eye takes.
* **Spacing is authored per transition.** Pick a `--space-*` tier between siblings and a larger one between groups. No default `gap` stands in for a decision.
* **Typography is re-anchored, not scaled.** Desktop hero sizes do not shrink to mobile; they re-declare inside the breakpoint.
* **Wide artifacts are re-expressed.** A desktop-width screenshot becomes a mobile-authored asset, a representative still, or a native-mobile swipe strip — not a miniature.
* **Hover-dependent affordances are replaced with explicit touch targets**, not just disabled.

### Newly banned under crafted-lite

The old "lite" stance tolerated these as pragmatic shortcuts. Crafted-lite does not.

* `transform: scale()` on a whole authored canvas (preserving desktop composition at a miniaturized scale). Existing instances at `/rr` intro, `/rr` cards, `/rr` secondary-mat storycard are flagged as *shipped under lite, would be recomposed under crafted-lite*.
* Horizontal scroll strip with inner `scale(0.5)` on desktop-width content — same retrofit tell, scoped to scan-scroll. `/rr` rules-group is flagged.

Strips themselves are still sanctioned when the inner content is natively authored for mobile.

### Per-route precedent

* `/marks` is the **composition quality bar** — built responsive-ready, authored gaps, breakpoint-scoped derived formulas, per-viewport asset decisions. Copy its quality, not its values.
* `/selected` and `/` are the **retrofit-lite reference implementations** — clean passes under the old stance, broadly compliant with crafted-lite.
* `/rr` is the **mechanics reference** — scroll unbind, `matchMedia` gate, measured-pair docked pills, React-inline-style conflict discovery. It is *not* a composition reference; its canvas scales predate crafted-lite.
* `/biconomy` has not had a responsive pass yet. The first crafted-lite application is the BIPs reference alongside the playbook.

### Don't-do list

* Don't rebuild scroll-bound desktop set pieces for mobile. Collapse or still them.
* Don't scale an authored desktop canvas to fit a phone viewport. Re-author or reduce.
* Don't re-author dense editorial grids as custom mobile layouts — stack or reduce.
* Don't invent new mobile-only primitives. If a route needs one, flag it.
* Don't promote lite patterns to shared until a second route actually needs them.
* Don't use `!important` outside the React-inline-style gate (see playbook → Named patterns).

Log crafted-lite decisions and drop-outs in each route's `ANOMALIES.md` under a "Responsive anomalies" section, following `app/(works)/selected/ANOMALIES.md` as the template.
