# /all — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/(works)/all/` are touched. (Public route is **`/all`** — renamed from `/selected` during the Work Essay redesign, briefly via the intermediate slug `/bench`. **"bench" remains the internal codename** for the Essay shell, and **"selected" for the timeline/showcase content** — class names like `.bench-*`/`.selected-*`, `bench.css`/`selected.css`, and `SelectedContent` are codename, not route. A permanent `/selected → /all` redirect + the `/cases` & `/showcase` rewrites live in `next.config.mjs`. See `docs/vocabulary.md` → "Works hub: /all slug ↔ codenames".)

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale, position math, and what-breaks. Spec: [`./DESIGN.md`](./DESIGN.md). This digest is the seatbelt; the archive is the manual. Read the archive section before structurally changing anything an item below names.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Don't-touch digest — bench essay (Work Essay)

- `useBenchDock`'s `engaged` state couples `.is-pinned` + `.is-condensed` as ONE unit, read from scroll position only (never hijacked) — don't re-split it or reintroduce the old midpoint commit. ANOMALIES.md → "Scroll-dock + shell contract"
- The idle-settle assist only fires DOWN after the ticket has docked, and aborts on any contrary scroll — it never starts or reverses a descent. ANOMALIES.md → "Scroll-dock + shell contract"
- `useBenchDock` pins the ticket slot's `min-height` and centres the navbar via a constant `translateX(-50%)` — dropping either collapses the card or de-centres it. ANOMALIES.md → "Scroll-dock + shell contract"
- Card/ticket sizing rides `--bu` (`calc(N * var(--bu))`), a real layout scale, NOT `transform: scale()` — a transform would trap the fixed ticket. ANOMALIES.md → "Viewport-driven 3:4 card"
- The cqi container lives on `.bench-stage`, never on `.bench-card` — putting it on the card creates a circular resolution loop that renders too small. ANOMALIES.md → "`--bu` container-query spine"
- The condensed ticket width is a DEFINITE `min(236px, calc(460 * var(--bu)))`, not `fit-content`/`%`, with padding asymmetric on purpose (optical fix, don't even it out); the CSS transition only fires on real scroll — don't revert the condensed tabs to grid. ANOMALIES.md → "Condense"
- Condensed-state press feedback (`:active` scale/ink) is scoped to `.is-condensed` only — don't extend it to the rest (invitation) state. ANOMALIES.md → "Press states — condensed touch targets"
- The docked ticket is `position:fixed`; three containing-block guards keep transformed ancestors from trapping it — don't reintroduce a retained transform on a ticket ancestor. ANOMALIES.md → "Containing-block guards"
- The Visual↔Longform tab swap rides the SHARED `TAB_BODY_VARIANTS`/`TAB_BODY_TRANSITION` tokens (same as `/rr`, `/biconomy`) with `initial={false}` — dropping `initial={false}` reintroduces a first-mount wipe on deep-link/reload. ANOMALIES.md → "Tab swap animates"
- Deep-link entry (`/cases`, `/showcase`) reads bare query flags SERVER-side in `page.tsx` (client `useSearchParams` never sees the rewrite query) — moving the read client-side breaks tab selection. Default is Visual. ANOMALIES.md → "Deep-link entry & tab order"
- TransitionSlot's exit-dim selector includes `.bench-workbench > *` — renaming/dropping that wrapper class breaks the cross-route exit-dim fade. ANOMALIES.md → "TransitionSlot exit-dim selector"
- The `+Nihar` bench-exit is the shared `ReturnMarker` primitive; the arrow-left reset wins by SPECIFICITY not source order — dropping a class re-flips the arrow after a client-side nav. ANOMALIES.md → "Bench-exit +Nihar marker — the shared ReturnMarker primitive"
- Longform tab hosts `SelectedContent` in `.bench-cases`, which owns the timeline's responsive `--tl-w`/`--bu` spine — don't reintroduce the retired fixed-width mat or the height-mirror hack. ANOMALIES.md → "Mat as a framed sheet (sibling of the landing sheet + invitation card)"
- Showcase row-spans are STATE-driven (not imperative `setProperty`) and the rAF cleanup must null `rafRef` — a stale id bails the next measure forever under Strict Mode. ANOMALIES.md → "Layout idiom — 9-col CSS Grid with JS-measured row spans"
- Index-card copy (`type`/`title`/`whatIs`/`notice`) lives ONLY in `card-copy.ts`, not `data.ts` — editing copy in `data.ts` does nothing (the field no longer exists there). ANOMALIES.md → "Index-card copy split + dev editor"
- The Visual-tab category filter is a `radiogroup`, never tabs — converting it to a tablist nests a second competing tablist under the ticket's real tabs. ANOMALIES.md → "Filter strip"
- Showcase tile captions show dot + `piece.type` + `piece.year` only — no project name (it lives in the SpecNote). ANOMALIES.md → "Caption content"
- Reading order is by `num` (1→10), with the cardstack↔furrmark `num`s deliberately swapped — don't re-`num` without re-validating bento packing. ANOMALIES.md → "Bento reading order"
- Recede/emphasis dimming rides `filter: opacity()` inside the filter chain, never the `opacity` property — Framer's inline opacity silently overrides a CSS `opacity` rule. ANOMALIES.md → "Click + focus interaction"
- SpecNote's resting rotation is always 0° now — `--sc-note-rotate` is deliberately left unset; don't reintroduce the old per-mount random ±2° roll without the hydration-safe guard this note describes. ANOMALIES.md → "Spec note"

## Don't-touch digest — timeline + archive (the Longform tab content)

- The timeline is a FLOW layout (`.selected-tl` flex column), not absolute coordinates — never reintroduce absolute `top` coordinates for the body. ANOMALIES.md → "Desktop timeline — FLOW layout"
- The Biconomy group is a 2-row × 2-col CSS grid (bars/years/cards as direct grid items); the mint spine is sized by natural reflow — no hardcoded heights. ANOMALIES.md → "Desktop timeline — FLOW layout"
- Every timeline size is `calc(N * var(--bu))` (card title 24·--bu, body 12·--bu, compact-card title 14·--bu, all mono unified at 10·--bu) — a fixed-px size anywhere breaks the one-unit scaling. ANOMALIES.md → "Timeline type + `--bu` sizing"
- Hover dim/highlight uses `filter: opacity()`, never `opacity`, gated on `data-armed="true"` (set after a real mousemove) — the base dim now dims DEEP across the group; the cascade rules are a unit. ANOMALIES.md → "Desktop timeline — FLOW layout"
- `data-armed` lives on the inner `<a>`/`<Link>`, not the outer motion wrapper — the `:has()` cascade selectors target that element specifically. ANOMALIES.md → "Stale-hover gate — `data-armed` on ProjectCard"
- All bars grow via `scaleY` with `transform-origin: top center`, content-driven to their card's grid row(s) — don't override per-bar. ANOMALIES.md → "Desktop timeline — FLOW layout"
- Slangbusters mounts its three case-study children inside a height-animated wrapper (`.selected-tl__children-wrap`, `height: 0↔auto`) — no hardcoded heights, no `.bench-cases` height mirror. ANOMALIES.md → "Expand/collapse is a height-animated wrapper"
- Case studies repel on hover via `:has()`; the translate rides the card, not the Framer motion row (which keeps a persistent inline transform that silently overrides a CSS one). ANOMALIES.md → "Sibling-repel on child hover"
- Entrance motion is always top-to-bottom (`y: -8 → 0`); dots pop (never fade); year labels stay in `--font-mono`. ANOMALIES.md → "Desktop timeline — FLOW layout"
- The three nested children are `<ProjectCard compact>` (the bespoke `.sb-case` markup is folded in) — each is its own rail+card row, mounted only when expanded. ANOMALIES.md → "Desktop timeline — FLOW layout"
- Icon arrow hover animations are CSS-only, no Framer Motion. ANOMALIES.md → "Icons"
- The "opens in new tab" hint pill keeps a neutral grey shell with only the text color themed per project — don't theme the shell. ANOMALIES.md → "Hint pill — neutral shell across all cards"
- `--ecochain-240` is a saturated green, not the old off-white — the off-white read as invisible on the mat. ANOMALIES.md → "Desktop timeline — FLOW layout"
- The Now dot's living pulse is a separate `.selected-tl__pulse` sibling ring + keyframe, not a pseudo — it must not collide with the dot's clip-path/crescent. ANOMALIES.md → "Desktop timeline — FLOW layout"
- Mobile renders a separate composition (`MobileCases`/`CasesSheet`) behind a `matchMedia` gate (never coexists with desktop in the DOM); `CasesSheet` renders INLINE, not portaled — portaling breaks the route-scoped per-study color tokens. ANOMALIES.md → "Mobile cases (MobileCases.tsx + CasesSheet.tsx)"
- selected.css's tablet `@media` block was removed as stale — `.bench-cases` already centres the mat correctly down to ~704px. ANOMALIES.md → "Tablet cases layout"

## Don't-touch digest — mobile responsive pass

Breakpoint `(max-width:767px),(max-height:500px)`. The through-line: one relative language (`--bu`) + one shared 24px gutter.

- The intro card re-bases `--bu` on mobile and drops its aspect-ratio lock — no fixed-px sizing anywhere in the card. ANOMALIES.md → "Responsive anomalies — mobile pass"
- One 24px gutter across the whole page (`.bench-work` drops its own 8px pad; global mobile `--sheet-gutter: 24px`) — don't re-add the 8px. ANOMALIES.md → "Responsive anomalies — mobile pass"
- The docked nav ticket fades + drops shadow when a showcase tile is open, via `sc-artifact-open` toggled on `<html>` (the ticket lives outside the grid subtree). ANOMALIES.md → "Responsive anomalies — mobile pass"
- FOOTGUN: never set a `background:` shorthand on `.selected-mat` on mobile — it wipes the graph-paper grid `background-image`. ANOMALIES.md → "Responsive anomalies — mobile pass"
- MobileCases/CasesSheet run on their own cqi `--bu` spine and reuse the shared `<NavMarker>` for the foot — don't hand-roll the foot control. ANOMALIES.md → "Responsive anomalies — mobile pass"
- Showcase tile `:hover` is gated in `@media (hover:hover)`; the mobile open is scroll-to-dismiss, not a hard body lock — don't merge the split `:hover`/`.is-active` rules back together. ANOMALIES.md → "Responsive anomalies — mobile pass"
