# /all — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads for any file under `app/(works)/all/`. (Public route **`/all`**; **"bench"**/**"selected"** are internal CODENAMES. The `/selected` redirect + `/cases`/`/showcase` rewrites live in `next.config.mjs` — `docs/vocabulary.md` → "Works hub: /all slug ↔ codenames".)

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — rationale, position math, what-breaks. Spec: [`./DESIGN.md`](./DESIGN.md). Read the archive section before structurally changing anything named below.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. `/release`'s census checks the pairing.

## Don't-touch digest — bench essay (Work Essay)

- `useBenchDock`'s `engaged` couples `.is-pinned` + `.is-condensed` as ONE unit read from scroll position; the idle-settle assist fires only DOWN after docking, aborting on contrary scroll — don't re-split it or let the assist start a descent. ANOMALIES.md → "Scroll-dock + shell contract"
- `useBenchDock` pins the ticket slot's `min-height` and centres the navbar via a constant `translateX(-50%)` — dropping either collapses the card or de-centres it. ANOMALIES.md → "Scroll-dock + shell contract"
- Card/ticket sizing rides `--bu` (`calc(N * var(--bu))`), a real layout scale, NOT `transform: scale()` — a transform would trap the fixed ticket. ANOMALIES.md → "Viewport-driven 3:4 card"
- The cqi container lives on `.bench-stage`, never on `.bench-card` — putting it on the card creates a circular resolution loop that renders too small. ANOMALIES.md → "`--bu` container-query spine"
- Inside `.is-condensed` size against `--cu`, never `--bu` — `--bu` tracks viewport HEIGHT and overflows the fixed box on tall viewports. Don't revert condensed tabs to grid. ANOMALIES.md → "Condense"
- The cold-load settle arms on a gate-still-held test (no `.fonts-ready` at mount, never a `.transitioning` survey). ANOMALIES.md → "Entrance — the gate-release settle"
- Condensed-state press feedback (`:active` scale/ink) is scoped to `.is-condensed` only — don't extend it to the rest (invitation) state. ANOMALIES.md → "Press states — condensed touch targets"
- The docked ticket is `position:fixed`; three containing-block guards stop transformed ancestors trapping it — never retain a transform on a ticket ancestor. ANOMALIES.md → "Containing-block guards"
- The Visual↔Longform tab swap rides the SHARED `TAB_BODY_VARIANTS`/`TAB_BODY_TRANSITION` tokens with `initial={false}` — dropping it reintroduces a first-mount wipe. ANOMALIES.md → "Tab swap animates"
- Deep-link entry resolves CLIENT-side from `window.location` (default Visual); only the `/cases`/`/showcase` PATHNAME aliases glide in — a server `searchParams` read flips `/all` to `ƒ`; query flags break the EXIT seam. ANOMALIES.md → "Deep-link entry & tab order"
- TransitionSlot's exit-dim selector includes `.bench-workbench > *` — renaming/dropping that wrapper class breaks the cross-route exit-dim fade. ANOMALIES.md → "TransitionSlot exit-dim selector"
- The soft-nav Hold is a DEPARTURE marker (landing `markToBench` mounts, `useBenchDock` removes) — no `loading.tsx` here or at the (works) group level. ANOMALIES.md → "Route hold — a DEPARTURE marker, not a loading boundary"
- The `+Nihar` bench-exit is the shared `ReturnMarker`; its arrow-left reset wins by SPECIFICITY, not source order — drop a class and the arrow re-flips after a soft nav. ANOMALIES.md → "Bench-exit +Nihar marker — the shared ReturnMarker primitive"
- `.bench-cases` hosts `SelectedContent` and owns the timeline's `--tl-w`/`--bu` spine — don't revive the retired fixed-width mat or height-mirror hack. ANOMALIES.md → "Mat as a framed sheet (sibling of the landing sheet + invitation card)"
- Showcase row-spans are STATE-driven (not imperative `setProperty`); the rAF cleanup must null `rafRef` or the next measure bails forever. ANOMALIES.md → "Layout idiom — 9-col CSS Grid with JS-measured row spans"
- Index-card copy (`type`/`title`/`whatIs`/`notice`) lives ONLY in `card-copy.ts`, not `data.ts` — editing copy in `data.ts` does nothing. ANOMALIES.md → "Index-card copy split + dev editor"
- The Visual-tab category filter is a `radiogroup`, never tabs — converting it to a tablist nests a second competing tablist under the ticket's real tabs. ANOMALIES.md → "Filter strip"
- Showcase tile captions show dot + `piece.type` + `piece.year` only — no project name (it lives in the SpecNote). ANOMALIES.md → "Caption content"
- Reading order is by `num` (1→10), with the cardstack↔furrmark `num`s deliberately swapped — don't re-`num` without re-validating bento packing. ANOMALIES.md → "Bento reading order"
- Recede/emphasis dimming rides `filter: opacity()`, never the `opacity` property — Framer's inline opacity overrides the CSS rule. ANOMALIES.md → "Click + focus interaction"
- SpecNote rests at 0° — `--sc-note-rotate` deliberately unset; don't reintroduce the per-mount ±2° roll without the hydration-safe guard. ANOMALIES.md → "Spec note"

## Don't-touch digest — timeline + archive (the Longform tab content)

- The timeline is a FLOW layout (`.selected-tl` flex column) — never reintroduce absolute `top` coordinates for the body. ANOMALIES.md → "Desktop timeline — FLOW layout"
- The Biconomy group is a 2-row × 2-col grid (bars/years/cards as direct items); yellow is a SHORT role-row segment nested in the blue span, not a card-spanning bar. ANOMALIES.md → "Desktop timeline — FLOW layout"
- The mint group's order is card → toggle → children, and the group itself is the spine's containing block (no spinebox wrapper) — reordering inverts the rail's years. ANOMALIES.md → "Mint spine — the Slangbusters span"
- The mint spine's lower terminus is keyed by `.selected-mat--archive-open` and moves via the bar's OWN `bottom` transition — drop the class or fold that rule into the shared `filter, background` shorthand and the bar's end strands or snaps. ANOMALIES.md → "Mint spine — the Slangbusters span"
- `.selected-tl__dropdown` stays `display: flex` — as a block it takes its height from the line box, not the button, and the collapsed mint spine (which measures `--sb-toggle-h`) overruns the card at every width but 688. ANOMALIES.md → "Mint spine — the Slangbusters span"
- Every year is CENTRE-anchored off `--year-top-drop`/`--year-role-lift` and animates OPACITY only — animate `y` and the CSS translate dies silently. ANOMALIES.md → "Year anchoring — one centre-anchored primitive"
- Every timeline size is `calc(N * var(--bu))`, `.project-card__arrow` included — a fixed-px card footer freezes its height and slides the years off the role row. ANOMALIES.md → "Timeline type + `--bu` sizing"
- Hover dim/highlight uses `filter: opacity()`, never `opacity`, gated on `data-armed="true"` — the dim and re-light cascade rules are one unit. ANOMALIES.md → "Desktop timeline — FLOW layout"
- `data-armed` lives on the inner `<a>`/`<Link>`, not the outer motion wrapper — the `:has()` cascade selectors target that element specifically. ANOMALIES.md → "Stale-hover gate — `data-armed` on ProjectCard"
- All bars grow via `scaleY` with `transform-origin: top center`, content-driven to their card's grid row(s) — don't override per-bar. ANOMALIES.md → "Desktop timeline — FLOW layout"
- `.selected-tl__children-wrap` animates `height: 0↔auto` with its spacing on child MARGINS (group `gap` 0) — padding, a group gap, or a hardcoded height snaps the close. ANOMALIES.md → "Expand/collapse is a height-animated wrapper"
- Case studies repel on hover via `:has()`; the translate rides the card, not the Framer motion row (which keeps a persistent inline transform that silently overrides a CSS one). ANOMALIES.md → "Sibling-repel on child hover"
- Entrance motion is always top-to-bottom (`y: -8 → 0`); dots pop, never fade; years stay `--font-mono`; the `D` delay map is hand-tuned — re-map, never retune. ANOMALIES.md → "Desktop timeline — FLOW layout"
- The three nested children are `<ProjectCard compact>` (bespoke `.sb-case` markup folded in), each its own rail+card row. ANOMALIES.md → "Desktop timeline — FLOW layout"
- Icon arrow hover animations are CSS-only. ANOMALIES.md → "Icons"
- The "opens in new tab" hint pill keeps a neutral grey shell, only its text colour themed per project — don't theme the shell. ANOMALIES.md → "Hint pill — neutral shell across all cards"
- `--ecochain-240` is a saturated green (the off-white read invisible on the mat); the Now dot's pulse is a separate `.selected-tl__pulse` ring, not a pseudo — it must not collide with the dot's clip-path. ANOMALIES.md → "Desktop timeline — FLOW layout"
- Mobile is a separate composition (`MobileCases`/`CasesSheet`) behind a `matchMedia` gate; `CasesSheet` renders INLINE — portaling breaks its route-scoped colour tokens. ANOMALIES.md → "Mobile cases (MobileCases.tsx + CasesSheet.tsx)"
- selected.css's tablet `@media` block was removed as stale — `.bench-cases` centres the mat down to ~704px. ANOMALIES.md → "Tablet cases layout"

## Don't-touch digest — mobile responsive pass

Breakpoint `(max-width:767px),(max-height:500px)`; one `--bu` language + one 24px gutter.

- The intro card re-bases `--bu` and drops its aspect-ratio lock (no fixed-px sizing in it); one 24px gutter runs across the page (`.bench-work` drops its 8px pad; global `--sheet-gutter: 24px`) — don't re-add the 8px. ANOMALIES.md → "Responsive anomalies — mobile pass"
- The docked nav ticket fades + drops shadow when a showcase tile is open, via `sc-artifact-open` on `<html>` (it lives outside the grid subtree). ANOMALIES.md → "Responsive anomalies — mobile pass"
- FOOTGUN: never set a `background:` shorthand on `.selected-mat` on mobile — it wipes the graph-paper `background-image`. MobileCases/CasesSheet run their own cqi `--bu` spine and reuse `<NavMarker>` for the foot — don't hand-roll it. ANOMALIES.md → "Responsive anomalies — mobile pass"
- Showcase tile `:hover` is gated in `@media (hover:hover)`; the mobile open is scroll-to-dismiss — don't merge the split `:hover`/`.is-active` rules. ANOMALIES.md → "Responsive anomalies — mobile pass"
