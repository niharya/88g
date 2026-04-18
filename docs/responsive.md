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

## Responsive-lite stance (refining phase)

All remaining responsive work on this portfolio is "lite" — a usability floor, not a composition pass. The goal is: the route does not break on mobile or tablet, touch users can read and navigate it, and nothing implies an interaction that fails. That is the gate. Do not auto-escalate past it.

**What "lite" means.**

* Usability and non-breakage at mobile/tablet widths, nothing more.
* Accommodations are made *per-route*, scoped inside media queries, with zero desktop side effects.
* Desktop remains the canonical composition. Mobile is a reading fallback.
* A route is "done" under lite when a phone user can read it end-to-end without horizontal scroll, overflowing text, or tap targets that miss.

**What "lite" is not.**

* Not a second authored composition.
* Not visual parity with the desktop reading experience.
* Not a reason to redesign sections whose meaning depends on spatial layout.
* Not a license to rebuild scroll-bound or absolute-positioned desktop set pieces for small screens.

**Minimum floor every route must meet under lite.**

* No horizontal overflow at 375px.
* Body copy readable at 375px without zoom; no `transform: scale()` fixes.
* Touch targets ≥ 44px for anything interactive.
* Mobile tucked pill nav present (project marker + chapter marker), per the global pattern above.
* 4px viewport frame active on mobile (the halved brand detail).
* Mat-as-last-element flex chain where the page ends on a mat.
* Responsive copy variants via the two-span CSS visibility pattern when phrasing differs.
* `:hover`-only affordances disabled or replaced on touch.

**Explicitly de-scoped under lite.**

* Decorative desktop elements (timeline bars, dot clusters, spatial markers) may be removed on mobile rather than recomposed.
* Hand-placed desktop embellishments (rotated stamps, offset notes, marginalia) are allowed to drop out on mobile.
* Proof-artifact-dense sections (multi-pane game boards, scroll-choreographed splits, dense editorial grids) do **not** get a bespoke mobile composition. They render in a simplified single-column form or collapse to a representative still.
* Per-section mobile art direction. If the desktop section doesn't fit, simplify — don't re-author.

**Per-route precedent.**

* `/`, `/selected`, and `/rr` are the reference implementations for a retrofit-lite pass. Follow their patterns when adding lite to `/biconomy`.
* `/marks` is the reference for a *built-responsive-ready* route: `clamp()` for type and spacing, `flex-direction: column` flips for row compositions, tucked pill + 4px frame from day one, no separate mobile pass. Future routes built from scratch should prefer this model.
* Distinction: retrofit-lite accepts pragmatic drop-outs; built-responsive-ready avoids them by designing the primitives to bend.

**Don't-do list (tempting, out of scope).**

* Don't rebuild `/rr`'s Mechanics scroll-bound mat-split for mobile. Collapse or still it.
* Don't redesign `/biconomy`'s Flows standby/active composition for mobile. Linearize it.
* Don't re-author dense editorial grids as custom mobile layouts — stack them.
* Don't invent new mobile-only primitives. If a route needs one, flag it and confirm before building.
* Don't promote lite patterns to shared until a second route actually needs them.

Log lite decisions and drop-outs in each route's `ANOMALIES.md` under a "Responsive anomalies" section, following `app/(works)/selected/ANOMALIES.md` as the template.
