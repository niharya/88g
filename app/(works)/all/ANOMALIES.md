# /all — Route Notes

## Overview (Work Essay redesign) — current

`/all` (renamed from `/selected`; "bench"/"selected" are internal codenames) is the "Work Essay" invitation. Full spec:
[`./DESIGN.md`](./DESIGN.md). Composition:

- **Desk** (`.bench-workbench`) — recolours the workbench to the pale desk; whisper of mat-noise.
- **Stage** (`.bench-stage`, 920 centred) — the `+Nihar` marker + the **invitation card**.
- **Invitation card** (`.bench-card`) — engraved blue broadside: gradient-clipped Fraunces manifesto, filled `--mint-720` startooth crown (sized larger than the divider diamond) + divider, Pinyon script closing. Foots the **ticket**. (The old Pinyon "Product/Designer" watermark was removed — the Pinyon font stays for the closing line.)
- **Ticket** — "BROWSE IN TWO WAYS", two tabs (Visual / Longform). Foots the card; pins out into a condensed navbar on scroll.
- **Work panel** (always present below the card) — **Visual** (default) → the Showcase bento (`.sc-section`, headed by the category **FilterStrip**; HeaderBlock AND HintRow both dropped); **Longform** → `SelectedContent` (Timeline + Archive, hosted in `.bench-cases`).

### Scroll-dock + shell contract (load-bearing)

- **`useBenchDock`** (mirrors the nav cluster's `useDockedMarker`): `active` (vis|lf, default vis) + **ONE coupled state, `engaged`** — the "native-scroll + one down-only assist" model. `engaged` applies `.is-pinned` (position) AND `.is-condensed` (the visual condense) **together as a single unit** — `Ticket.tsx` derives both classes from the one boolean, so pin and condense fire at the same instant. `engaged` flips by READING the scroll position only (`slot.getBoundingClientRect().top <= DOCK_TOP+1`, `DOCK_TOP=16` mirroring `.is-pinned .bench-ticket { top: var(--space-16) }`) → `position:fixed; top:16`, centred via `left:50%` + a constant `transform:translateX(-50%)`. It NEVER hijacks scroll to flip; native scroll stays fully in charge. There is NO scale — an earlier `scale(0.96→1)` "rise" read as an odd enlarge mid-condense and was removed; `transform` stays a constant `translateX(-50%)` so only `width`/`padding`/`box-shadow` animate. The hook also pins the slot's `min-height` (rest footprint, `useLayoutEffect`) so the card doesn't collapse when the ticket pins out, and runs the clearPane effect (see "Containing-block guards").
  - **One assist, DOWN only, "finish a committed descent."** Native scroll is the model — the ticket docks/condenses purely by reading position. The single programmatic move is an idle-settle in the scroll `update` effect: on scroll-idle (`IDLE_MS` = 150ms after the last scroll event, by which momentum has stopped) it fires **only if** (1) no glide is already active (`!isGlideActive()`), (2) `engaged` is already true (the ticket has ALREADY docked), (3) the last scroll direction was **down**, (4) reduced motion is off, and (5) we're not already at/past the target (`scrollY < workY() − EPSILON`). It then `glideTo(workY())` to carry the card the rest of the way off-screen. `workY()` = the **work panel's top** (`.bench-work` rect top + scrollY) — i.e. the card has scrolled FULLY away; there is **no SEAT cushion and no midpoint**.
  - **What it deliberately does NOT do.** It does **not** fire from the top of the zone — a small peek-scroll that hasn't docked the ticket (`!engaged`) is left entirely to native scroll. It **never fires upward** — scrolling back toward the invitation is pure native scroll, no assist. So the assist only ever *completes* a descent the reader already committed to (the ticket docked), never *starts* or *reverses* one.
  - **Any in-flight glide ABORTS the instant the reader scrolls against it.** `glideRef` holds `{target, cancel}`. In `update`, if the frame-over-frame scroll delta moves OPPOSITE to the glide's target direction (`sign(moved) !== sign(target − lastY)`), it `cancel()`s and clears the ref — the glide's own writes always move toward the target, so a contrary move can only be the reader. This is why the assist never *fights* the reader: native scroll always wins on contact.
  - **`glideTo` durations.** Down into the work = `--dur-glide`; the reverse / ✕ close = `--dur-settle` (snappier). Reduced motion swaps the glide for an instant `window.scrollTo` (no animated half-state).
  - **Superseded approach — the two-anchor midpoint commit (kept so the reasoning isn't lost).** The hook previously had two rest anchors (Anchor 0 = invitation; Anchor 1 = `workY` defined as the dock line + a `SEAT` cushion) and committed a one-shot `scrollGlide` whenever the reader crossed the **midpoint** of the no-man's-land between them, in either direction. **That whole machinery is removed.** Why it was replaced: the midpoint commit was a *programmatic-scroll commit fired mid-gesture* — it fought native momentum, so the settle read as springy/unreliable and could fire against the reader. The current model only ever assists **on idle, down, after the ticket has already docked**, and aborts on any contrary scroll — so it never fights native scroll. (Before that, the split was even finer: separately-toggled `pinned`/`condensed` states with condense hysteresis; that too is gone.) **`engaged` stays ONE unit (pin + condense together) — do NOT re-split it, and do NOT reintroduce the midpoint commit or the SEAT cushion.**
  - **The condense only animates on REAL scroll.** The width/padding/title-size interpolation is a CSS transition that only fires when wheel/trackpad scroll crosses the dock line over several frames. An instant programmatic `scrollTo` (reduced-motion, or a headless harness) bypasses the transition (the state flips in one frame) — so preview/instrumentation that measures mid-flight width after a jump reads unreliable values; the SETTLED end-state values are the correct ones.
  - **Entry paths.** Raw scroll docks the ticket natively, then the idle-settle finishes the descent (down only). A **tab click** (`openTab`) glides to `workY()` only when still resting at the invitation (`!engaged`), else just swaps content (keeps scroll position). **✕** (`close`) is `glideTo(0, '--dur-settle')` back to the card.
- **`--bu` container-query spine (the whole broadside) — pure CSS, no JS.** Every dimension on the card + ticket is authored as `calc(N * var(--bu))`, a real **layout** scale (line-breaks and authored proportions hold, text crisp). `--bu` ("one baseline pixel") = `calc(100cqi / 820)` — 1px at the 820px scale-1 baseline expressed as a fraction of the query container's width. **The query container is `.bench-stage`, NOT `.bench-card`** (`container-type: inline-size` on the stage): the stage has no border/padding, so its content box == the card width (`--bench-card-w`); putting the container on `.bench-card` is circular — `cqi` → the card's content box → minus the card's own `--bu`-based padding → a feedback loop that resolves too small (observed: ~0.53× instead of 0.75×). At the 615 cap, `--bu` = 0.75px, so `24 * var(--bu)` = 18px etc. — reproducing the old `--card-scale: 0.75` render exactly, and scaling proportionally below. This SUPERSEDES the old JS `--card-scale` knob (a `BenchEssay` resize handler), now **removed**. It is NOT `transform: scale()` — a transform would make the card the containing block for the fixed docked ticket and break the navbar (see "Containing-block guards"); `container-type: inline-size` does NOT trap the fixed ticket (verified — it still pins to the viewport, and `--bu` resolves to the stage width even on the fixed ticket). Tune via the `--bench-card-w` clamp on `.bench-stage`.
- **Condense — definite width that interpolates, flex content-hug centred, in-flow close.** The condense animates as one snappy settle on **`--dur-slide`/`--ease-snap`** (was `--dur-settle`): the `.bench-ticket` transitions `width`/`padding`/`box-shadow`, and the frame `padding`/`border-width`, tab title `font-size`, eyebrow `opacity`+`translateY`, close `opacity`, the divider, and the bead all ride the same `--dur-slide` beat so they read as a single gesture.
  - **REST width is now DEFINITE, `calc(460 * var(--bu))` + `max-width:100%`** (NOT `width:100%`). **This SUPERSEDES the old "`max-width:460` is load-bearing / the dock explodes the ticket" item.** That bug came from `width:100%`: once the ticket pinned (`position:fixed`) the percentage re-resolved against the **viewport** (~1433px) and the width transition animated FROM there, so the ticket visibly exploded toward full width before snapping in. A *definite* px width can't explode — and because it's px→px from the first frame, the width transition starts immediately at the pin (no re-resolution hold) so width + height collapse in **lockstep**. The definite width IS the guard now; `max-width:100%` only keeps it from overflowing a narrower container (mobile).
  - **The condensed width is `min(236px, calc(460 * var(--bu)))` — a definite ~236px**, not `fit-content` and not a percentage; width can only interpolate between two definite lengths, so the transition runs a clean rest→236. `fit-content` was tried and rejected (intrinsic sizes don't animate; the box snapped). The `min()` is an **inversion guard**: if the rest width (`460 × --bu`) ever dropped below 236 (card width < ~510) the condense would otherwise GROW the box; the cap keeps it a shrink. **Retuned down from 290** (the owner found 290 too loose — ~45px dead voids and a ✕ that floated off to the right).
  - **Why 236 is FIXED and not scaled by `--bu`:** the tab sub-labels are a fixed **10px** that does NOT scale with the card, so a scaled-down condensed box clipped them. At a definite 236 the content (~190px incl. gaps + the in-flow ✕) **fills the box with tight, balanced ~23px left/right margins** — the whole row (both tabs · divider · ✕) centres as ONE unit on even inter-item gaps (`gap`/edge-pad `20 * var(--bu)`, down from 24). **This REVERSES the prior "comfortable wide-edge margins, don't re-tune to even gaps" intent** — that read as too much space on the left and a loose, satellite ✕; the tight even-gap row is now the target.
  - **The rest tabs are a grid (`1fr auto 1fr`), centring the divider diamond; CONDENSED tabs switch to centred flex** (`justify-content:center`, gap + edge padding on the within-element scale, each item `flex:0 0 auto`). The grid→flex swap is a **known one-frame tab rearrange** — a JS FLIP to smooth it was tried and REVERTED (pure CSS can't smooth it without regressing the centred diamond or the tight condensed fit), so the swap stays; the surrounding detail (divider, bead) is smoothed instead. **Don't revert the condensed tabs to grid.**
  - **Detail smoothing.** The divider diamond **bead fades** (`opacity`) instead of `display:none`; the `.bench-perf__line` transitions its **`width` (4→1)** alongside `height`; the `.bench-perf` container width is **definite** (transitions, not `auto`) so its footprint interpolates rather than snapping.
  - **The close is IN-FLOW when condensed (`position:static`, a real flex item), absolute + `opacity:0` at rest.** This is deliberate — it has to occupy a flex cell in the condensed row (it's the row's quiet end-mark, NOT a floated corner ✕). Condensed it's `width:auto` (hugs its glyph so it doesn't widen into a cell), `height var(--space-32)` (tap target without dictating row height), icon `18px` (down from 20, proportional to the shrunk titles). At rest it's `position:absolute` (right edge) with `opacity:0`/`pointer-events:none` so it reserves no rest-state space.
  - The **eyebrow** still fades `opacity`-only out of flow (`position:absolute`, rest space reserved by the frame top padding) + a small `translateY` — NOT a `max-height`/`margin` collapse.
  - Reduced motion zeroes the ticket condense transitions (`.bench-ticket`/frame/eyebrow/tab/title/perf-line/close) so the morph snaps to its end-state.
  - Don't revert the condensed tabs to grid, don't make either width `fit-content`/`%`, don't pull the close back out of flow when condensed, and don't bring back an eyebrow max-height collapse.
- **Press (onclick) states on the condensed touch targets.** The three condensed tap targets get a tactile settle, scoped to `.is-condensed` only (micro tier, `--dur-instant`/`--ease-snap`, no bounce, no pill): `.is-condensed .bench-tab:active` → `scale(0.95)` + ink deepen + accent underline; `.is-condensed .bench-ticket__close:active` → `scale(0.88)` + colour deepen. Don't extend these to the rest (invitation) state — the press cue belongs to the navbar affordance, not the broadside.
- **Containing-block guards** (the docked ticket is `position:fixed`; a transformed/will-change ancestor would pin it to that ancestor instead of the viewport, so it scrolls away): (1) `.transition-pane:has(.bench-workbench){will-change:auto}` in bench.css (the shared pane carries `will-change:transform`); (2) `useBenchDock` cancels the pane's retained WAAPI entrance transform (TransitionSlot's `fill:both` leaves `translateY(0)`) once `.workbench.transitioning` clears; (3) the slide-in entrance uses `backwards` fill so `.bench-card` retains no transform. Don't reintroduce any retained transform on a ticket ancestor.
- **`?view` ⇄ state**: `page.tsx` reads `view` server-side (the `/cases`,`/showcase` rewrites deliver it as the destination query; client `useSearchParams` doesn't carry it) → `initialView` selects the active tab. It does NOT auto-scroll into the work (the bench rests at the card) — auto-scroll-into-content is a deferred follow-up.
- **Return seam**: all EXITs (shell `ExitMarker`, `MarksExitMarker`) point at `/all?cases` so a case-study exit returns with the Longform tab active.

### Viewport-driven 3:4 card — current

**What it is.** The invitation card (`.bench-card`, ticket included) is a **locked 3:4 portrait page sized off viewport height** — the deliberate sibling of the landing's framed sheet (which is also a 3:4 window). Before this it was content-driven: a hardcoded width (`820px × --card-scale`, the constant `0.75` → 615px) with a height that fell out of the copy (~800px, an accidental ~1.30 ratio).

**Pure CSS — no JS (the cqi spine).** SUPERSEDES the old JS `--card-scale` resize handler (now removed from `BenchEssay`). Two halves:
- **Width** is a height-driven CSS length on `.bench-stage`: `--bench-card-w = min(clamp(508px, (100svh − 104px)/1.3333, 615px), 100vw − 2*var(--sheet-gutter))`, `max-width`'d onto the stage; `.bench-card { width:100%; aspect-ratio:3/4 }` gives the height. (A LENGTH, so pure CSS — the old blocker was needing a *unitless* scalar, which CSS can't derive from a viewport length.)
- **Content** scales via container-query units: `.bench-stage` is the query container (`container-type: inline-size`) and `--bu = calc(100cqi / 820)`; every card/ticket size is `calc(N * var(--bu))`. The container is the STAGE not the CARD (the stage has no border/padding, so cqi resolves against the clean card width; on the card it's circular — see the `--bu` spine item above).

Because both the box (∝ width) and the content (∝ `--bu` ∝ width) scale linearly, the box stays ~2.5% taller than the content at every size — it can't clip. `.bench-card__main` is `flex:1; justify-content:center`, splitting that slack above the crown / below the ticket. Dock-safe: `useBenchDock` pins the ticket slot's `min-height`, and `container-type: inline-size` does NOT trap the fixed ticket (verified — pins to viewport; `--bu` resolves to the stage width even on the fixed ticket).

**The numbers.** Floor `508px` keeps type legible on short viewports, below which the page runs past the fold and you scroll. **The cap is RELATIVE — `min(80vw, 820px)`, NOT a fixed 615px** (see "iPad / portrait nesting" below). `CHROME 104` = the vertical space the page leaves (exit marker + workbench padding + breathing). Verified desktop: 1440×900 → 597×796 (unchanged); 900px → 597; 680px → 508 (floor), no clip; the old 615 render is reproduced whenever the card resolves to 615 wide. Tune via the `clamp()`/`min()` in `--bench-card-w` on `.bench-stage`.

**iPad / portrait nesting — why the cap is `min(80vw, 720px)`, not a fixed px.** The card is 3:4 and an iPad *portrait* screen is also 3:4, so the card nests as a concentric smaller page with even margins — the platonic "page on a same-shaped desk." A FIXED `615px` cap broke this on bigger iPads: the card stayed 615 while the screen grew, so it filled less and less (Mini 768w → 80%; Pro 12.9 1024w → 60%, 205px side margins). The relative cap `min(80vw, 820px)` keeps a consistent ~10% side margin (≈80% fill); the `820px` ceiling = the scale-1 baseline (`--bu` = 1px there → the card renders at its true authored size). Verified portrait: Mini 768 → 614 (80%, unchanged), Air 820 → 656 (80%), Pro 11 834 → 667 (80%), Pro 12.9 1024 → 819 (80%, at the ceiling, full scale-1 — poem 24px). **It self-targets to portrait:** in landscape/desktop the height term (`(100svh−104)/1.3333`) is always smaller than `80vw`, so the proportional cap never binds there — only the `820px` ceiling can, and only once a window exceeds ~1197px svh (then the card grows 615→820 / full scale-1; at the user's 1440×900 reference it's height-governed at 597, untouched). Ceiling chosen at 820 = one ⅛-stop up from the prior 720 (the card-width ladder is ~⅛ steps off 820: 508/⅝ floor · 615/¾ · 720/⅞ · 820/1.0). **Known tradeoff:** tall desktop monitors (svh ≥ ~1197) now render the card at full scale-1 (type ~33% larger than the 615 desktop size) — accepted; a CSS aspect-ratio `@media` could pin desktop lower if that ever reads as too zoomed. **Mobile is unaddressed here** — desktop-tuned; a mobile pass must re-derive the floor/`CHROME`/gutter for the narrow viewport (matches the landing sheet's deferred-mobile stance).

### Bench-exit "+Nihar" marker — now the shared ReturnMarker primitive
The `+Nihar` marker (`.bench-exit`, `BenchExitMarker`, icon `arrow_back`) is a back-to-landing link and must point LEFT. The flat-exit-link treatment that delivers this was **promoted to the shared `ReturnMarker` primitive** (`app/components/ReturnMarker/`, styling under `.return-marker` in navmarker.css; LIBRARY.md → "ReturnMarker") once /privacy became its second consumer. `BenchExitMarker` now renders `<ReturnMarker href="/" label="Nihar" onClick={toLanding}/>`; `.bench-exit` keeps only flow positioning + the grey tone vars (`--return-marker-ink: --grey-720`, `--return-marker-ink-hover: --grey-560`) and owns the to-landing `nav-direction` side-effect via the wrapper's onClick.

- **The arrow-LEFT reset still wins by SPECIFICITY, not source order — the mechanism just moved into the shared class.** navmarker.css resets it via `.return-marker.nav-marker--exit .nav-icon { transform: none }` (three classes), out-specifying the base `.nav-marker--exit .nav-icon` (two classes) that rotates 180° for the shell/marks exits. The original bug: a two-class reset won only by source order, and a client-side nav into /all (landing → works → /all) re-inserts CSS chunks in a different order, so the base rotation resurfaced and the arrow flipped RIGHT. **Don't drop a class from the shared selector** or the flip returns.
- Same block, minor: the `.nav-marker__exit-label` dotted-at-rest → solid-on-hover underline (the site's link idiom) also lives in the shared `.return-marker` rules, overriding nav.css's shell-exit transparent-rest → dotted-hover treatment, again by three-class specificity. Don't "unify" it back to the shell treatment.

### Tab swap animates (Visual ↔ Longform) — current

`WorkPanel.tsx` wraps the active tab's content in `AnimatePresence mode="wait"` keyed on `active`
(`'vis'|'lf'`), riding the **shared** tab-switch idiom from `app/lib/motion.ts`
(`TAB_BODY_VARIANTS` + `TAB_BODY_TRANSITION`) — the SAME tokens `/rr` (Cards.tsx) and `/biconomy`
(Demos.tsx) use, NOT a new motion tier. `mode="wait"` runs the outgoing tab's exit before the
incoming enter (one beat on the snap curve), so a switch reads as the site's other tabbed sections do.

- **`initial={false}` on AnimatePresence is load-bearing** — it skips the first-mount wipe, so a
  deep-link / reload lands at rest with no entrance animation (the choreography belongs to the
  *switch*, not the page arrival). Don't drop it.
- **Why the body scale is SAFE here** (the tokens animate `scale: 0.985→1` on the wrapper): the
  scale only paints during the switch and settles to `transform: none` (Framer emits `none` at the
  default transform), so the wrapper never becomes a *lasting* containing block. And `WorkPanel` is
  a **SIBLING** of the docked ticket (both rendered separately in `BenchEssay`), not an ancestor —
  so even a transient transform can't trap the ticket's `position: fixed`. The showcase grid's
  row-span measurement uses `offsetHeight` (transform-immune — see the Showcase row-span item) so
  the enter-scale can't re-pack the grid mid-switch either. These three facts are why the swap could
  be animated without re-breaking the fixed navbar or the masonry — don't move the scale onto an
  *ancestor* of the ticket, and don't switch the row-span measure to `getBoundingClientRect().height`.
- `key={active}` drives the presence swap; the `filter` (category) state stays in `WorkPanel`, so
  the choice survives the switch (already covered under "Filter state lives in `WorkPanel`" — don't
  duplicate).

> The pre-redesign "single vertical flow" overview (AboutCard → Prelude → HintRow → Showcase)
> is **superseded** by the above; the Cases tab mounts `SelectedContent` directly in
> `.bench-cases` via `Essay/WorkPanel.tsx`. The "Showcase grid" sections below still describe
> the live Visual tab. The lower "Archive timeline model / spacing / hover" sections are
> **historical** — they document the retired archive panel; the **Slangbusters promotion
> section immediately below is the current truth** for the Cases timeline.

---

## Slangbusters promotion — the Cases (Longform) tab — current

### Mat as a framed sheet (sibling of the landing sheet + invitation card)
The `.selected-mat` reads as the third framed sheet, alongside the landing's framed sheet and the `/all` invitation card. It carries the siblings' **two-layer lift shadow** (same geometry/opacity, green-tinted `rgba(10,48,24,…)`) over its **thin `2px mint-100` frame** (now `calc(2 * var(--bu))` so the frame scales with the sheet). Constraints:
- **Thin pale frame — the LIFT carries the sheet read, not a heavy rule.** Two alternatives were tried and **rejected**: a deep `mint-720` frame matching the marks (too loud against the timeline's calm ground) and a ~5px thickening via an `inset 0 0 0 3px mint-100` box-shadow band. Keep the thin `mint-100` frame; don't re-deepen the colour and don't re-thicken it.
- **RESPONSIVE on `--bu`, content-driven height (the flow rebuild — supersedes the old "NOT aspect-locked / fixed-coordinate diagram" framing).** The mat is no longer a fixed-coordinate diagram. `.bench-cases` owns the spine: width `--tl-w = min(clamp(540px, calc(100svh / 1.31), min(80vw, 820px)), calc(100vw − 2*--sheet-gutter))` (lands ~688 at 1440×900, grows on bigger/taller screens like iPads, never touches the edge via `--sheet-gutter`); `container-type: inline-size`; `--bu = calc(100cqi / 688)` (one baseline pixel at the 688 design baseline — so at 688 wide `--bu`=1px and every `calc(N*--bu)` renders at the authored px). The mat is `width:100%`, `min-height: calc(917 * var(--bu))` (the collapsed 3:4 floor), and its EXPANDED height is **content-driven** — opening the dropdown mounts the children, the flex/grid reflows, and the mat grows DOWN (a CSS `min-height` settle + Framer's mount). No `transform: scale()` (banned, and would trap nothing here but break the read). The mat scales as ONE unit with the sheet; verified at 1440×900 (688, title 24px, mono 10px), iPad Pro 12.9 portrait 1024 (819 wide ≈80% fill, title ~28.6px), and short 1440×680 (540 floor).

The archive panel ("Works from the previous portfolio") is **retired**. `ArchivePanel.tsx` is
deleted; **Connektion is dropped entirely** (not relocated). Slangbusters is promoted out of the
archive into the main timeline as a **second tall parent** (mint), directly below Biconomy —
mirroring the blue (Biconomy) parent with the yellow (Rug Rumble) child. Its three case studies
(Aleyr / Ecochain / Codezeros) nest under it, collapsed behind an inline dropdown.

### Desktop (Timeline.tsx + selected.css) — FLOW layout

The timeline is a **CSS-grid FLOW layout**, not absolute coordinates. `.selected-tl` is a flex
column: a cap, dot clusters, two project GROUPS, and the nameplates. Every size is
`calc(N * var(--bu))`. Heights are content-driven; **do NOT reintroduce absolute `top` coordinates**
for the body.

- **Bars are content-driven — EXACTLY as tall as their project, edges touching the card (verified
  0px delta at 688 and iPad 819).** The Biconomy group (`.selected-tl__group--blue`) is a **2-ROW ×
  2-COL grid**: bars + years + cards are DIRECT grid items (no `.selected-tl__rail` /
  `.selected-tl__cards` wrapper cells). Cards in col 2 (Rug Rumble row 1, Biconomy row 2). Bars in
  col 1 are grid items `justify-self:end; align-self:stretch`: **yellow `grid-row:1`** (spans exactly
  the Rug Rumble card), **blue `grid-row:1/3`** (RR-top → Biconomy-bottom). `scaleY` entrance,
  `transform-origin: top center`. **This SUPERSEDES** the earlier "bars are `position:absolute;
  right:0` with `top/bottom` inset, yellow a fixed `46·--bu`" approach — a fixed-height yellow bar
  couldn't track the card. The **mint spine** is ONE absolute bar over `.selected-tl__mint-spinebox`
  (`left: var(--rail-w) − 4·--bu`, `top/bottom: 8·--bu`) — it starts at the Slangbusters CARD top
  (the dropdown header is a sibling ABOVE the spinebox, no longer inside the spine's span) and grows
  to span the children by NATURAL REFLOW when they mount; no hardcoded `224→504`.
- **Years align to their card's ROLE ROW** (the footer line), approximately. Biconomy years are
  col-1 grid items: 2025 `align-self:start` (Rug Rumble card TOP); Q4•25 `align-self:end` +
  `margin-bottom` lift (RR role row); 23 same on the Biconomy row. Mint-rail years are absolute in
  the rail: slang-top at the card top, slang-bot at the role row; child years centre on their row.
  They tuck LEFT of the 4·--bu spine via a right gutter / `margin-right`.
- **Inline dropdown** `.selected-tl__dropdown` — a plain text button (`--font-ui` 720, capitalize,
  dotted underline) + an `expand_more` `MaterialIcon` rotating 180° via `[aria-expanded="true"]`.
  Now a HEADER above `.selected-tl__mint-spinebox` (offset to the cards column via `margin-left:
  var(--rail-w) + var(--rail-gap)`) so the spine starts at the card, not the header. Toggles
  `expanded` (owned by SelectedContent).
- **Cards are content-driven (no fixed height).** `ProjectCard` lost its `176px` height + absolute
  internal layout — it's now a flex column (title → body → divider → footer, `16·--bu` padding) that
  sizes to its copy. Width constant (`--card-w = 408·--bu`). Stickers stay absolute over the body.
  Mint = external (`target=_blank`, `IconExternalLink`, startooth `<Sticker tilt={-8}>`, "opens in
  new tab" hint sibling). Type: title `24·--bu` Fraunces, body `12·--bu`, role via `t-h5`.
- **`.sb-case` folded into `ProjectCard compact`.** The three children are `<ProjectCard compact
  variant={id}>` — a `300·--bu`-wide, transparent, borderless card (title `14·--bu` body font + role
  + external arrow + hint). The bespoke `.sb-case*` markup+CSS is gone. Each child is its own rail+card
  ROW (`.selected-tl__row--child`), so its short colored bar (`56·--bu`, centred on the row) + year
  align to the compact card naturally. They mount only when `expanded` (Framer `AnimatePresence`,
  `CHILD_D` stagger); `CHILDREN` (Timeline.tsx) carries the years. Resting bar `-100` tint, hover `-240`.
- **`--archive-open` cascade RETIRED.** The `+280px` lower-timeline shift, the mint-bar `224→504`
  height rule, and the `.bench-cases:has(.selected-mat--archive-open)` height mirror in bench.css are
  ALL removed. `expanded` still adds `.selected-mat--archive-open` (historical name) but it's an inert
  marker now — the growth is a **height-animated wrapper**.
- **Expand/collapse is a height-animated wrapper (`.selected-tl__children-wrap`).** The children sit in
  a `motion.div` animating `height: 0↔auto` (`HEIGHT_SETTLE` tween on `--ease-paper`, NO overshoot — a
  bounced height visibly jumps past and snaps back) so the Slangbusters card below, the mint spine, and
  the mat all glide as ONE flow change (CSS can't transition `height:auto`; before this the structural
  reflow snapped while only the children faded). The gap-to-parent-card is a **margin on the LAST child,
  NOT padding** — an explicit `height:0` clips a child margin to true zero (no end-jump on unmount), but
  `box-sizing` padding floors at the padding value and would snap; at `height:auto` the flex box still
  includes the margin, so the last child's hover hint sits in it and `overflow:hidden` never clips it.
  The spinebox `gap` is therefore `0` (the wrap carries inter-row + pre-card spacing INSIDE its animated
  height). `PAPER_EASE` in Timeline.tsx mirrors `--ease-paper` (cousin of TransitionSlot's `EASE`).
- **Ecochain fix:** `--ecochain-240` was an off-white that read as invisible on the mat; saturated
  green (`hsl(95 72% 42%)`). Carried over.
- **§2a:** nameplates swapped (Marks above Names); the Now dot has a living pulse
  (`.selected-tl__pulse` sibling ring + `now-pulse` keyframe — survives the dot's `clip-path`/crescent;
  own reduced-motion guard). The cap is `.selected-tl__cap` (dot in the rail, "Now" tucked left,
  greeting right).
- **Hover cascades** mirror terra/blue, re-pointed to the group structure. The base dim now dims DEEP
  (`.selected-tl:has(…) > *` PLUS `… .selected-tl__rail > *` / `… .selected-tl__cards > *`) because a
  group bundles multiple projects; the re-light selectors (naming a card/bar/year class) TIE on
  specificity and win by SOURCE ORDER. An intermediate per-group dim was tried and removed (it
  out-specified the re-light). Child hover dims only the OTHER children + saturates the hovered bar.
  All `filter: opacity()`, gated on `data-armed`.
- **Sibling-repel on child hover + the Framer inline-transform trap.** Hovering one case study eases the
  OTHER two AWAY (one above drifts ↑, ones below ↓) via `:has()` on `.selected-tl`. The translate rides
  the **card** (`.project-card--compact`, a non-motion `<a>`), NOT the row — Framer keeps a PERSISTENT
  inline `transform` on the motion row (`.selected-tl__row--child`, e.g. `translateY(-8px→0)`), so a CSS
  transform there is silently overridden (the same inline-style trap this file documents for `opacity`).
  The rail spine stays fixed; the parent mint card never moves. `6·--bu` throw. GOTCHA: the dim cascade
  above sets `transition: filter, background` on every `.project-card` (no transform), so the repel needs
  a higher-specificity rule (`.selected-tl .project-card--compact { transition: transform … }`) or the
  6px SNAPS; the child rows + bars (`.selected-tl__row--child`, `.selected-tl__bar-sb`) also got the
  filter-transition or their dim snapped while the listed years faded — keep the reaction gliding as one.

### Mobile (MobileCases.tsx + CasesSheet.tsx)
- A **separate composition** behind a `matchMedia(MOBILE_BP)` gate in SelectedContent (mirrors the
  showcase's isMobile pattern; `MOBILE_BP` from `Showcase/responsive.ts`) — the desktop Timeline and
  MobileCases **never coexist in the DOM**, so no duplicated content. SSR/first-render = desktop
  (no hydration mismatch); the effect swaps after mount.
- Cards-first per the mobile handoff §10: a trimmed living-NOW cue (pulse dot + `NOW · 2026` +
  fading hairline — **no** "Selected work" title, since the bench card is the page intro), a Biconomy
  **hero** card, a `subdirectory_arrow_right` "A project during Biconomy" label → indented Rug Rumble,
  the Slangbusters card (`open_in_new`), a "3 projects during Slangbusters" trigger → the sheet, and
  foot nameplates Marks → Names.
- **`CasesSheet` is rendered INLINE, not portaled to `<body>`.** The showcase's sheet portals
  (its tiles carry transforms that would trap `position:fixed`), but the cases tree has no
  transformed ancestor — `position:fixed` anchors to the viewport regardless (same guarantee the
  docked ticket relies on). Inline keeps the sheet inside `.workbench:has(.bench-workbench)` so the
  route-scoped study tokens (`--aleyr/ecochain/codezeros-*`) cascade in. **Portaling it broke the
  per-study swatch/meta colors** (they fell back to default-link-blue, tokens undefined at `<body>`).
- Body scroll-lock + Esc-to-close while open; scrim tap closes. Slide-up on `--dur-settle`.

### Tablet
- selected.css's tablet `@media` block was **removed** — it was stale from the bench rename
  (repositioned the gone `.selected-layout` two-column and squished `.selected-mat` to ~292px). On
  bench, `.bench-cases` centres the full 688 mat at tablet, so the desktop layout is already correct
  down to ~704px viewport.

---

## Showcase grid

Route-local under [app/(works)/all/components/Showcase/](app/(works)/all/components/Showcase). `Showcase.tsx` owns `activeId` + per-piece `toggles`. Tiles render via `ShowcasePiece.tsx`; media-per-kind via `PieceMedia.tsx` (a thin switch that delegates to per-renderer files under `media/`); the focused note via `SpecNote.tsx`. Data lives in `data.ts`. In the bench it's the **Visual** tab content (rendered by `Essay/WorkPanel.tsx` → `ShowcaseSection`, which heads the grid with the category `FilterStrip`; both `HeaderBlock` and `HintRow` were dropped).

### Index-card copy split + dev editor — IMPORTANT
The four reader-facing strings — `type` (caption category, `.sc-cap__type`), `title`, `whatIs` (subtitle), `notice` — were lifted OUT of `data.ts` into a sibling `components/Showcase/card-copy.ts` (`CARD_COPY: Record<pieceId, {type, title, whatIs, notice}>`). **`card-copy.ts` is the SINGLE SOURCE OF TRUTH for those four fields — edit copy there, NOT in `data.ts`** (which no longer carries them). NB `type` is the caption label, not an index-card field — it's bundled here because it's reader-facing copy, not structure. `data.ts` now holds `PIECES_STRUCT: Omit<Piece, 'type'|'title'|'whatIs'|'notice'>[]` (structure only) and exports `PIECES = PIECES_STRUCT.map(p => ({ ...p, ...CARD_COPY[p.id] }))` — the overlay reconstitutes the full `Piece[]` the route consumes.

- **Dev-only copy editor**, archived at `app/_dev-tools/card-copy-lab/` (non-routable per Next's `_` prefix; move out to `app/card-copy-lab/` + restore `../(works)/…` import depth to re-activate). Server `page.tsx` also guards with `notFound()` in production; `CardCopyEditor.tsx` is the client. It's a form (left) beside the ACTUAL caption + `SpecNote` rendered live with the edits merged in (right) — so it **imports `SpecNote` + `showcase.css` from this route**, a sanctioned dev-tool exception to "routes don't import from each other" (the lab is production-guarded, never shipped). Lab-local CSS neutralises `.sc-note`'s in-tile `position:absolute`/toss so it sits static in the sample column. It seeds from live `PIECES` and POSTs edits to `app/api/dev-tools/index-card-copy/route.ts`, which **regenerates `card-copy.ts` wholesale** (values JSON-encoded so punctuation escapes safely; 403 in production). **The serializer assumes `card-copy.ts` stays a plain object literal keyed by piece id** — don't hand-reshape it in a way that breaks that contract, or the round-trip writer corrupts the file.
- **Graduated:** the lab now lives under `app/_dev-tools/card-copy-lab/` (its sanctioned unrouted home per root CLAUDE; keeps the doc-census green, which only tolerates dev routes under `_dev-tools/` or in `CHROME_ROUTES`). The write API stays at `app/api/dev-tools/index-card-copy/` (under `CHROME_ROUTES` → census-exempt).

### Filter strip
The Visual tab's grid is headed by a category filter — **All · Interface · Brand** (`FilterStrip.tsx`, CSS `.sc-filter` in showcase.css). Net-new constraints:

- **It is a `radiogroup`, NOT tabs — deliberately.** `role="radiogroup"`, each option `role="radio"` + `aria-checked`, roving tabindex (only the checked option is tab-stop) + arrow-key nav. It filters ONE grid **in place** — there are no per-option panels — so a `tablist` would be wrong semantically AND would nest a second competing tablist under the ticket's real Visual/Longform tabs (which are `aria-current` buttons). **Do NOT convert the filter to tabs/tablist.**
- **The recede/emphasis animation is PURE CSS — no JS choreography.** React only flips `data-matched` (per `.sc-slot`) and the `.is-filtering` class (on `.sc-grid`); CSS owns the motion (see "Filter recede / emphasis" in showcase.css). Resting states are route-local vars on `.sc-section`: matched-while-filtering → `transform: scale(var(--sc-matched-scale))` (emphasis); receded → `scale(var(--sc-recede-scale))` + `filter: var(--backseat-dim) opacity(var(--sc-recede-opacity))` (the SAME idiom as the open-tile `.sc-grid.is-dimming` recede — desaturate plus a mild opacity loss; the opacity is folded INTO the filter chain via `opacity()`, NOT the opacity property, so Framer's inline opacity can't override it); baseline (`'all'`, not filtering) → no transform.
- **The scale lives on the `.sc-slot`, NOT the `.sc-piece`** — so it never fights the piece's per-tile rotate + hover/active transform (which live on `.sc-piece`). This split is load-bearing; don't move the recede scale onto the piece.
- **Direction-dependent feel via per-TARGET-state transitions.** Base `.sc-slot` transitions transform+filter on `--dur-slide`/`--ease-paper` (smooth grows + settles). The receded rule OVERRIDES the transform transition to `--dur-settle`/`var(--sc-ease-recede)` — so ONLY the step-back to the receded scale carries a mild overshoot (a small bounce at the END). `--sc-ease-recede` (a route-local cubic-bezier on `.sc-section`) is a **SANCTIONED, documented overshoot deviation** from the no-bounce motion rule — now the only one in this area. Because it's CSS transitions, a rapid counter-pick re-targets from the current value — the old JS "jump to 100%" failure mode is structurally impossible.
- **Row-span measurement uses `offsetHeight`, NOT `getBoundingClientRect().height`** (`measureSpans` in Showcase.tsx) — `offsetHeight` is transform-immune, so the slot recede scale never shrinks the measured height and re-packs the receded tiles. (See also the row-span item below.)
- **Receded tiles stay CLICKABLE.** A click on a receded tile triggers a small horizontal **"no" shake** (`ShowcasePiece.select` → an isolated WAAPI animation, amplitude `--space-2`, keeping the slot's resting `--sc-recede-scale` under the `translateX` so size/tilt hold through the shake) — it does NOT open. Reduced motion skips the shake. Receded tiles' media **force-pauses** (the `receded` prop → `PieceMedia` `paused`, same path as the open-tile pause).
- **The open tile auto-closes if it gets filtered out** (`Showcase.tsx` effect: if `activeId` is no longer matched, `setActiveId(null)`).
- **Filter state lives in `WorkPanel`** (not `ShowcaseSection`, which unmounts on each tab switch) so the choice survives Visual↔Longform switches. Categories are the **`PIECE_CATEGORY`** map in `data.ts` (piece id → `'interface'|'brand'`; cardstack = interface, a game-card LAYOUT reading as UI) — a single authoritative classification, not parsed from the free-text `type`.

### Layout idiom — 9-col CSS Grid with JS-measured row spans
- `.sc-grid` is a single CSS Grid: `grid-template-columns: repeat(9, minmax(0, 1fr))`, `grid-auto-rows: 8 px` (`--sc-row`), `grid-auto-flow: dense`, `gap: --sc-gap` (mirror constants `GAP_PX` / `MOBILE_GAP_PX` in Showcase.tsx).
- Each slot's `--sc-rowspan` is written by `Showcase.tsx` after measuring the slot's first child via **`offsetHeight`** (layout height, transform-immune — NOT `getBoundingClientRect().height`, which includes the filter recede's scale and would shrink the measured height and re-pack receded tiles): `span = ceil((h + gap) / (row + gap))`. The slot itself is constrained by the last-written span, so the measurement reads `slot.firstElementChild` — measuring the slot directly is a chicken-and-egg trap.
- The measurement pass is rAF-debounced. Re-triggers: ResizeObserver on each slot AND on the grid container itself, window resize, `activeId` change (the `.is-active` translateY + scale changes rendered height), and `<img>` load events (LQIP → real bytes can change perceived height for unframed/cropped media).
- Constants `ROW_HEIGHT_PX`, `GAP_PX`, `MOBILE_GAP_PX` in `Showcase.tsx` mirror the CSS `--sc-row` / `--sc-gap` values; if you change one side, change the other.
- **Per-piece column span** is `cols: 1..9` on the `Piece` type (`data.ts`). Default is 3 (one-third). Two canonical values:
  - **3** → one-third (default; most pieces)
  - **6** → two-thirds (hero — currently `paymaster` and `ecochain`)
  - 9 is full-width (rare). Off-canonical values (4, 5, 7, 8) work but leave more orphan whitespace.
- **Showcase.tsx writes two CSS custom properties** per slot via `slotStyle`:
  - `--sc-cols-d` = raw `cols` value (desktop, 9-col grid).
  - `--sc-cols-t` = `max(1, ceil(cols / 3))` (tablet, 3-col grid). The formula preserves proportions — a desktop "third" stays a tablet "third", a "two-thirds hero" stays a "two-thirds hero".
  - `.sc-slot { grid-column: span var(--sc-cols-d, 3) }` on desktop; the tablet @media block swaps to `--sc-cols-t`; mobile drops everything to `span 1`. No modifier classes — span is data-driven via inline style.
- **Responsive collapse**:
  - Tablet (768–1023, min-height 501): grid drops to **3 columns**. Each slot uses its `--sc-cols-t` value, preserving the thirds rhythm proportionally (`3 → 1`, `6 → 2`, `9 → 3`).
  - Mobile (≤767 or ≤500h): grid drops to 1 column. Every slot spans 1 regardless of `cols`. `--sc-gap` reduces to 24 px (mirror constant `MOBILE_GAP_PX = 24`).
- `grid-auto-flow: dense` packs short tiles into gaps that wider tiles would otherwise leave. Visual order can deviate from DOM order; reading-order DOM in `PIECES` is by `num` (1 → 10).
- **Trade-off with 9-col**: no clean two-up (`4 + 5 = 9` is asymmetric; `4.5` isn't an integer). If you ever want two equal pieces side-by-side filling a row, this grid can't do it. The trade is editorial-thirds composition in exchange for losing halves.

### Click + focus interaction
- Click any tile (or its caption dot) → tile gets `.is-active`, lifts via `translateY(-12px) scale(1.025)`, siblings recede via the shared **`--backseat-dim`** filter PLUS a mild opacity loss (`--sc-recede-opacity`, 0.7) — `.sc-grid.is-dimming .sc-piece:not(.is-active)` → `filter: var(--backseat-dim) opacity(var(--sc-recede-opacity))`. Same backseat recede as the biconomy/rr menu-open dim, a stepped-back desaturate; the opacity rides in the filter chain via `opacity()` (NOT the opacity property, so Framer's inline opacity can't override it). On desktop / tablet, `SpecNote` renders inline beside the frame on the side decided at activation by `ShowcasePiece` (column-position measurement → `left` or `right`). On mobile, `SpecNote` is rendered once by `ShowcaseBottomSheet` as a singleton portal at `document.body` (see §"Index card placement rule" below).
- **Active tile click triggers the tile's primary affordance**: switch tiles (Paymaster, Ecochain, Interface) flip the switch; video tiles (Furrmark, Ecochain) play/pause; everything else is no-op. Close happens via the dot's `×` glyph, Esc, or the backdrop.
- **Stacking.** Dimmed siblings carry ONLY `filter` + `pointer-events: none` (no `z-index`, no `position`) — they stay BELOW the backdrop so click-to-dismiss is intact. The backdrop is `z-50` (`.sc-backdrop`); the active piece is `z-60` (orders within its own slot only); and the active SLOT is lifted to `z-70` via `.sc-slot:has(.sc-piece.is-active) { position: relative; z-index: 70 }` so the open artefact (tile + inline SpecNote index card) sits above every receded sibling slot's filter-induced stacking context AND above the backdrop. The piece's `z-60` alone wasn't enough — it only ordered inside its own slot, so the index card could paint behind receded siblings; don't drop the slot lift.
- **Focus trap**: while a tile is open, Tab cycles inside its caption dot + switch + note link instead of escaping to the next tile. Esc still closes.
- **No magnifying cursors** — default `pointer` on the body, `default` on the active tile. The cardstack tile's media has its own click handler (expand fan) that `stopPropagation`s so it doesn't open the spec note; the caption row click bubbles up and opens the note as normal.

### Spec note (`.sc-note`)
- **Desktop animation.** Two horizontal toss keyframes only (`sc-note-toss-left` / `sc-note-toss-right`) — the desktop placement is always one of those two sides. Each variant translates by `--sc-toss-d` (28 px default) and settles at **0° — the resting rotation is now always flat** (`SpecNote.tsx` leaves `--sc-note-rotate` unset so the keyframes' `rotate(var(--sc-note-rotate, 0deg))` resolves to 0; the per-mount random ±2° roll was removed). Duration `--dur-slide` (0.3 s, snappier than the previous 0.5 s settle), easing `--ease-snap`. Square corners, 1 px dot-tinted border (see colour cascade), lifted shadow that matches the active tile's lift.
- **Layout structure.** Title alone in `.sc-note__head` (close button anchored top-right, sheet-only); lead paragraph `.sc-note__whatis` directly under the title (no mono tag label — the old `.sc-note__line` / `.sc-note__tag` two-column grid was retired); rule; `.sc-note__notice` row with the notice copy left (an `<h5>` carrying H5 typography: Google Sans Flex ExtraBold wght 640, 12 px, capitalize) + decorative `.sc-note__notice-eye` glyph right (24×24, grey, not dot-tinted — quiet "look at this" beat, not a brand accent); rule; `.sc-note__foot` with the `…from {project} ↗` link on the LEFT and a `.sc-note__foot-end` stack on the RIGHT. The stack holds the `01` serial (`.sc-note__no`, in flow) **and** the "opens in new tab" hint pill (`.sc-note__hint`, absolutely positioned over the serial) — see "Foot hover swap" below. Sheet variant uses the **same JSX** — only the dock/border/animation skin differ.
- **Spacing (Figma 1:1).** Card padding `24 px / 16 px` (`py / px`); card width `min(322 px, 92 vw)` = 290 px Figma content column + 16 px × 2 horizontal padding. Vertical rhythm: title → whatIs **12 px**, whatIs → rule₁ **48 px**, rule₁ → notice **24 px**, notice → rule₂ **24 px**, rule₂ → foot **24 px**. Notice row text → eye gap **44 px**. Rule = 1 px `--grey-880`, margin 0 (rhythm carried by siblings).
- **Per-piece colour cascade — two-tier (560 + 720).** Two parallel tone maps in `data.ts`:
  - `DOT_VAR` (560 step) — consumed by the tile's caption dot, Switch tint, and DotPager tint via `ShowcasePiece.tsx`. The closed tile reads soft.
  - `DOT_VAR_DEEP` (720 step) — consumed by SpecNote only, set as `--sc-dotc` inline on `.sc-note`. **Four** accents read this var: the foot serial (`.sc-note__no`), the foot link (label + chevron + hint pill), and the card's own `border` (`border: 1px solid var(--sc-dotc, …)`). The mobile sheet's viewport-edge `border-top` also reads `--sc-dotc` so the dock seam matches.
  - Palette is **4 tones only**: `blue` / `terra` / `orange` / `mint`. Olive, yellow, and grey were dropped (v0.93) — the four-tone family reads more in-system. `DOT_PALETTE` in `Showcase.tsx` and both `DOT_VAR` maps are pinned to these four; the `ShowcaseDot` type union enforces it.
- **Foot link** (`.sc-note__link`): `…from {project} ↗` with `IconExternalLink` (size 14) carrying the archive's `className="icon-ext"` so the arrow group slides diagonally on hover (`translate: 2px -2px`, `--dur-slide / --ease-paper`) — same recipe as `.ap-entry .icon-ext .icon-ext-arrow`. `target="_blank" rel="noopener noreferrer"`. **Persistent 2 px dotted underline** on `.sc-note__link-label` at rest; on hover/focus-visible the dotted color fades to transparent while a `::after` 1 px solid bar fades in — same crossfade pattern as `.t-btn1` in `globals.css` (text-decoration-style isn't smoothly interpolable, so the pseudo carries the solid state). On `:active` the whole link translates down 1 px. Pieces without `href` (currently only **subway** and **startooth** — subway's project IS this site, startooth's project is the author's sketchbook) render `.sc-note__credit` as plain text instead of a link, and the hint pill is omitted.
- **Foot hover swap.** `.sc-note__foot-end` is a `position: relative` inline-flex stack containing the serial (in flow) and the hint pill (`position: absolute; right: 0; top: 50%`). At rest the serial reads at full opacity; the pill is `opacity: 0; translate: 4px -50%` (slid 4 px to the right). On link hover or focus, both swap: serial fades to 0, pill fades to 1 and lands at `translate: 0 -50%`. The toggle uses `.sc-note__foot:has(.sc-note__link:hover) .sc-note__no { opacity: 0 }` (and the matching `:focus-visible` and `.sc-note__hint` rules) — `:has()` reaches up from the link so the entire swap lives at one stable selector, no JS state, no prop drilling. The pill is omitted in JSX when `piece.href` is undefined, so there's nothing to swap to on credit-only pieces.

### Index card (spec note) placement rule — IMPORTANT
The `.sc-note` no longer reads `piece.noteSide` for its side at runtime. Two distinct rendering paths split by viewport, **owned by different components**:

1. **Mobile** (`max-width: 767px` OR `max-height: 500px`, single source `responsive.ts` → `MOBILE_BP`):
   - The note is rendered by **`ShowcaseBottomSheet`**, a *singleton* mounted once by `Showcase.tsx` when `activeId && isMobile`. Each tile does NOT render its own SpecNote on mobile.
   - The sheet portals through `createPortal` into `document.body`, so `position: fixed` resolves against the viewport — not against any transformed ancestor in the tile tree (the random tile rotation creates a containing block that would otherwise trap a fixed-position child).
   - SpecNote renders with `variant="sheet"` → `.sc-note--sheet` CSS skin: `inset: auto 0 0 0`, `width: 100vw`, no border-radius, edge-to-edge, slides up via `sc-sheet-rise`.
   - The sheet owns its own **body scroll-lock** for its lifetime (sets `document.body.style.overflow = 'hidden'`, restores previous value on unmount). ShowcasePiece does NOT lock scroll.
   - On activation, ShowcasePiece (still per-tile) scrolls itself so its top sits 24 px below the viewport top — that's the only mobile-activation work it does. One `requestAnimationFrame` deferral lets layout settle before measuring.
   - Showcase tracks `isMobile` as reactive state via `matchMedia.addEventListener('change')`, so rotation / orientation / devtools resize mounts and unmounts the sheet correctly.

2. **Desktop / tablet** — note rendered inline by **`ShowcasePiece`**. Side measured at activation:
   - Center in the **left third** of `.sc-grid` → `activeSide = 'right'` (note opens to the right of the tile).
   - Center in the **middle or right third** → `activeSide = 'left'` (note opens to the left).
   - The note renders **INSIDE** the `.sc-frame` wrapper around `.sc-media`. Anchored at `top: 4 px`, `left/right: calc(100% + 12 px)`, `transform-origin` set to the open-toward corner. Anchoring to `.sc-frame` (not `.sc-piece`) keeps the note pinned to the media frame's geometry — never offset by the `.sc-cap` row below.
   - Toss keyframes `sc-note-toss-left` / `sc-note-toss-right` bring the card in from the open direction with a per-mount random ±2° settle.

3. **Column placement is dynamic** because `.sc-grid` is a 9-column CSS Grid with `grid-auto-flow: dense` — a tile's visual column depends on its `cols` integer + the dense packer fitting it next to neighbours, not on its DOM index. The measurement uses `getBoundingClientRect()` against the closest `.sc-grid` ancestor, run inside a `useLayoutEffect` keyed on `active`.

If you change which container owns which path, update both `ShowcaseBottomSheet.tsx` and `ShowcasePiece.tsx` together; don't split the responsibility across files.

### Per-piece controls slot (`ExtraControlsContext`)
ShowcasePiece's `.sc-controls` bar composes pause + switch + a per-piece **extras slot** (`.sc-controls__extras`). Per-piece renderers that need their own inline control (currently: `PaymasterAuditController` → page chip) consume `ExtraControlsContext` and `createPortal` their control into the slot. The tile shell does NOT know which pieces have extras. State for those extras (e.g. paymaster's `flowIndex`) lives in the per-piece controller, never on the generic shell. The slot collapses (`:empty { display: none }`) when no consumer is portaling, so the inline-flex row stays tight on tiles that have no extras.

### Random per-mount values — three independent rolls
Three patterns roll fresh values on every page load. Each is documented here so future sessions don't mistake them for bugs:

1. **`--sc-tile-rotate` — per-tile rotation, −1° to +1°.** Set in `ShowcasePiece.tsx` via a `useEffect` that writes the CSS custom property on the `.sc-piece` element on mount. Hover and active states override the rotation back to `0deg` so the tile straightens under cursor; the resting state shows the random angle. SSR-safe because the effect runs only client-side (the SSR paint is `rotate(0deg)` from the var default).
2. **Per-page-load dot shuffle.** `Showcase.tsx` `dotMap` state, populated once via `useEffect` from the **4-tone palette** (`['blue', 'terra', 'orange', 'mint']` — see §Spec note → "Per-piece colour cascade — two-tier (560 + 720)" for the canonical list; olive / yellow / grey were dropped v0.93). The shuffle pads the palette to `PIECES.length` (10 entries) so every colour appears at least once, then Fisher-Yates shuffles. The mapped piece flows through `piecesWithDots`, and `DOT_VAR[piece.dot]` cascades to every consumer of `--sc-dotc` (caption dot, switch tint, page chip, index card serial number + link + hint pill). First client paint uses authored dots; the effect's `setDotMap` swaps to the rolled distribution on the next render — a sub-100 ms colour flash on cold load. **Do not move this to `useMemo(initial state)` — that would run on the server and break hydration.**
3. **PosterStack deck shuffle.** `media/PosterStack.tsx` keeps `POSTERS` (3 entries, authored order) as the SSR baseline + first-paint state, then Fisher-Yates shuffles into local state in `useEffect`. First paint shows the authored order's index-0 poster on top; the post-effect render shows the rolled deck's index-0 poster on top. The deck is otherwise stable for the session — `advance()` cycles the rolled order on click.

All three patterns deliberately accept a SSR → client value swap; none of them depend on the SSR value visually because the swap completes within one frame of hydration.

**The SpecNote resting rotation is no longer random** — `--sc-note-rotate` is left unset and the note settles flat (0°). The old per-mount `useMemo(Math.random())` roll was removed, so there are now three random rolls, not four. (If a future change reintroduces a random SpecNote rotation, it must use `useEffect`, not render-time `Math.random()`, unless `SpecNote` stays conditionally mounted on `active` — which is `false` on every tile during SSR — to stay hydration-safe.)

### Pause-when-any-tile-active rule
`Showcase` passes `anyActive={activeId !== null}` to every `ShowcasePiece`. Each tile ORs this with its local pause state and the inverted self-active flag — `paused || (anyActive && !active)` — before passing to `PieceMedia`. Result: opening any tile pauses every OTHER video tile across the grid. Ambient motion quiets under the dim so the focused artefact owns the room.

### Centered showcase canvas (`.sc-section` at `max-width: 1224px`)
The Visual tab's `.sc-section` (rendered by `ShowcaseSection` as `.sc-section bench-showcase`, headed by the FilterStrip) is capped at `max-width: 1224px` and centred with `margin-inline: auto`, so the grid sits on the same centred rails the bench card uses on wide viewports rather than anchoring to the workbench's left padding. Below ~1352 px the cap resolves to 100% and the tablet/mobile media queries take over.

> **Removed (bench redesign):** the first-view scroll cue (`.sc-cue` + `FirstView.tsx` + the `--sc-cue-*` measured vars + `data-cue-v/h-anchor` + `SHOWCASE_DOCK_ID`), the `.selected-firstview` / `.selected-layout` two-column stage (incl. its `min-height: 777px` canvas floor and the AboutCard/nav-row chrome), **`HeaderBlock`, and `HintRow`** (the hint + reverse-countdown hairline + the hint→filter timed swap; the FilterStrip now heads the grid directly). The bench ticket/tab navbar replaced the first-view hand-off; those mechanisms no longer exist. The Cases tab mounts `SelectedContent` directly in `.bench-cases`.

### Per-tile kind class hook (`.sc-piece--{piece.kind}`)
- `ShowcasePiece.tsx` emits a `sc-piece--${piece.kind}` class on every tile. This is the targeting hook for **per-kind visual overrides** in `showcase.css` — corner radius, border on/off, video object-position. Used by:
  - `.sc-piece--cardstack .sc-media { border-radius: 0; }`
  - `.sc-piece--interface .sc-media { border-radius: 6px; }`
  - `.sc-piece--paymaster .sc-media { border-radius: 10px; }`
  - `.sc-piece--ecochain .sc-media { border-radius: 8px; }`
  - `.sc-piece--ecochain .sc-video { object-position: 22% 50%; }`  (per-tile crop offset on the looping ecochain video)
  - `.sc-piece--startooth .sc-media { border-radius: 10px; background: #311700; }`  _(v0.93: bg recolored from `--mat-bg` cream to the deep brown Startooth ground; the vector cards SVG sits on top, no bg layer needed in the SVG)_
  - `.sc-piece--multiverse .sc-media { border-radius: 18px; }`
  - `.sc-piece--dual .sc-media { border: none; }`  (overrides the `.sc-media--plain` default hairline — now redundant because the `.sc-media--plain:not(:has(.sc-dual))` exclusion handles the same case; kept as belt-and-suspenders)
- Why a kind class instead of `:has()` on a descendant: it survives empty / null media states and reads cleanly when scanning the CSS. Don't migrate to `:has()` without a real reason — the per-kind list above is the source-of-truth lookup table.

### Cardstack alpha-clip + drop-shadow (load-bearing)
- The five RR card webps carry their own rounded corners baked into the alpha channel. `.sc-cardfan__card` is intentionally transparent (no background, no border, no border-radius, no overflow:hidden, no box-shadow on the wrapper). If you put a background or border-radius back on the wrapper, the stacked cards bleed through each other at the alpha edges as ghost halos — the exact bug we fixed by porting `/rr`'s pattern.
- All shadow weight lives on the inner `<img>` via `filter: drop-shadow(...)` so the shadow traces the alpha shape, not a square wrapper box. Two-tier recipes:
  - Rest: `drop-shadow(-2px 4px 8px rgba(0,0,0,0.38))`
  - Selected: `drop-shadow(-3px 18px 22px rgba(0,0,0,0.52))`
  - Pushed-back (others while one is selected): drop-shadow + `brightness(0.78) saturate(0.6)`
  - Hovered while pushed-back: drop-shadow + `brightness(0.92) saturate(0.85)`
- Mirrors `/rr/components/cards/CardFan.tsx` + `.rr-card-item__img` in `rr.css`. Don't migrate this to `box-shadow` without re-thinking the alpha — they're not interchangeable.

### Cardstack split-click model
- The cardstack tile media (`.sc-cardfan`) owns its own click — toggle between *stacked* (default fan) and *expanded* (cards splay wider, upright). `stopPropagation` on that handler keeps it from bubbling up to the tile's "open spec note" click.
- The caption row click does NOT have `stopPropagation`, so clicking on the caption bubbles up to the tile and opens the spec note.
- Esc collapses the expanded cardfan (separate effect from the spec-note Esc handler).

### Cardstack scale-up + aspect (v0.93+)
- `.sc-cardfan__card` width is **34%** of tile (bumped from the original 30% per user direction "scale up the cardstack"). Cards grow upward from the bottom anchor (`bottom: 6%` + `transform-origin: 50% 100%`) — the tile's vertical headroom absorbs the increase.
- The cardstack piece's `aspect` is **1.4** (down from 1.6) to give the scaled-up cards enough room for click-spread (`scale: 1.18` + `lift -8%`) without poking past the `.sc-media`'s `overflow: hidden` top edge. Math: at 30%×258 the click-spread top was at -4 px (clipping); at 34%×295 it sits ~30 px clear.
- Going wider than 34% needs another aspect bump in the same direction — `width` and `aspect` are coupled here. Don't tune one without the other.

### Posters aspect (v0.93+)
- The posters piece's `aspect` is **0.70** (down from 0.80). The fan transforms — particularly slot-4's `translate(-65%, -62%) rotate(-9deg)` — pushed the back-of-stack poster's top corners past the tile's `overflow: hidden` top edge at the prior aspect. Bumping aspect makes the tile ~74 px taller so the fan corners clear.
- Bonus: row-4 height delta with `ecochain` narrows from 132 → 58 px — the posters + ecochain row reads more balanced post-bump.
- `PosterStack.tsx` now ships **four** posters (`falah-faisal`, `cutting-1`, `cutting-2`, `gong`) — the fourth (`gong`) carries the IG-story aspect 0.5625 instead of the print 0.707, fed into the slot via the `aspect` field on each `Poster` entry and consumed by `.sc-poster { aspect-ratio: var(--poster-aspect, 1222 / 1722) }`. Slot-4 transform was authored ahead of v0.93 to support the fourth card.

### Dual tile (Connektion specimens) — cols 3 stacked
- Piece is **cols 3 + aspect 1.1** (not the off-canonical cols 4 it briefly was). `.sc-dual` is a single flex column — chip on top, gauge below, both centered horizontally with `gap: var(--space-32)`. No pane wrappers, no pane borders — each artefact self-frames (chip on its light card, gauge inside its dark frame), so a container would read as a tray around something that doesn't need one.
- The override `.sc-piece--dual .sc-media { border: none }` keeps its meaning — frameless tile, the artefacts sit directly on the bench. The `.sc-media--plain` default hairline rule's `:not(:has(.sc-dual))` exclusion still applies.

### Connektion specimens — JobChipStack + LifecycleGauge (`media/`)
- **Imported wholesale** from `/Users/nihar.bico/88g/reference/connektion-resources/` — two AI-built artefacts representing the Connektion product. The only project-side edits to each file: a `'use client'` directive (both use hooks) and a swap of `motion/react` → `framer-motion` on the chip (same API; project ships `framer-motion`).
- **Motion timings restored to the reference's original choreography** after a brief unification pass under GLIDE/PRESS/FADE was reverted. The chip's `MOVE` (spring `{stiffness: 420, damping: 26}`, critically-damped, no bounce), `BAR` (0.40 s tween easeInOut), and `FADE` (0.20 s easeOut) drive slot positions, bar/typography, and swatch opacities respectively. The push reaction is **0.38 s easeOut** with `y: [0, -4, 0]` + `scale: [1, 1.014, 1]` (outward lurch — the stack pushes the chip forward from behind; bar updates trail on the longer BAR beat as the chip's response).
- **Offer paint-fill `PAINT_IN` timing tightened** from the reference's 0.72 s → **0.40 s** (same curve, `cubic-bezier(0.22, 0.8, 0.36, 1)`). Reason: at 0.72 s the dark-green clip-path expansion lagged behind the BAR 0.40 s text-color shift to white, leaving white text on the still-light chip surface for ~320 ms (the "see-through" the user reported). At 0.40 s the paint covers on the same beat the text reaches white. `PAINT_OUT` stays at the reference's 0.25 s.
- **Auto-cycle dwell is 2500 ms on both** — JobChipStack `setInterval(advance, 2500)` and LifecycleGauge `dwellMs = 2500`. Both mount simultaneously inside `DualPlaceholder`, so their cycles stay in lock-step (the gauge had a `+ 400` ms rewind delay in the reference; removed for sync). Changing one without the other will desynchronize them.
- **Stack opacity for slot 1 bumped 0.80 → 1.00** (the swatch directly behind the front chip). At 0.80 the bright Offer green (`#4ade80`) read as a translucent wash against the workbench-bg; full opacity makes it solid. Slots 2 + 3 keep their 0.52 / 0.28 fades for the back-of-stack depth implication.
- **Stage taxonomy is 6 stages** — Saved · Applied · Reviewed · Interview · Offer · Accepted — matched verbatim to the LifecycleGauge's stage list so both specimens model the same product lifecycle. The reference shipped 4 stages (Shortlist / Applied / In Review / Offer). Bar widths re-spaced at 40 → 240 in 40 px steps.
- **Accepted's `hideDot: true`** flag fades the moving dot to opacity 0 and uses the dot tone (`#15803d`) as the full bar color — reads as "filled to completion." Label tone bumped to `#d1fae5` (light) for swatch contrast on the deep-green ground.
- **Gauge press recipe is user-click only**, not auto-advance. The `is-pressed` class triggers a `0.24 s` scale-down (`lcg-press` keyframes) AND a needle filter transition: rest filter `drop-shadow(0 2px 4px rgba(0,0,0,0.45)) saturate(1) brightness(1)` → pressed `... saturate(0.15) brightness(0.7)` over `0.12 s var(--ease-snap)`. On release the filter returns over the longer `var(--glide)` paper curve so the orange comes back warmly. Don't add the press tick to the auto-loop — the reserved on-click cue is deliberate.
- **Typography aligned across both** to Connektion's size-contrast pair: title 16 px / weight 600 / -0.2 px tracking, subtitle 12 px / weight 400. Both use `'Inter'` (the Connektion product font, kept as-is — does NOT route through the portfolio's `--font-ui` Google Sans Flex). Caps labels (`.sc-startooth-svg__cards` SHORTLIST / OFFER etc) stay at 10 px / 700 / 0.1em as a deliberate third tier.

### Caption content
- The `.sc-cap` row shows the dot + **`piece.type` + `piece.year` only** — the project name was dropped from the caption (`ShowcasePiece.tsx` renders `.sc-cap__type` / `.sc-cap__year`, no title). The project name still lives in the SpecNote (`…from {project} ↗`).

### Caption descenders (v0.93+)
- `.sc-cap` uses `line-height: 1.2` (not `1`) at `font-size: 11px`. With `line-height: 1` the line box exactly equals the font-size, so descenders (y, g, p, q, j) sat at or past the line box's bottom edge and got clipped by the row's `overflow: hidden` — most visibly on the mono caption row where descenders are common. 1.2 grows the line box to 13.2 px, giving descenders ~1 px of breathing room inside the line box. The `min-height: 20px` row lock is preserved (13.2 px line box still fits comfortably under 20 px) so dot growth behavior on hover/active is unchanged.

### Bento reading order
- Visual reading order is by each piece's `num` (1 → 10), not the `PIECES` array literal order: **cardstack(1) → interface(2) → subway(3) → paymaster(4) → multiverse(5) → startooth(6) → furrmark(7) → posters(8) → dual(9) → ecochain(10)**. The **RR card (cardstack) ↔ Aleyr (furrmark) `num`s were swapped** — cardstack now leads (row 1) and furrmark sits in row 3. This packs the bento into:
  - Row 1: cardstack · interface · subway (3 × cols 3 = 9)
  - Row 2: paymaster · multiverse (cols 6 + cols 3 = 9)
  - Row 3: startooth · furrmark · posters (3 × cols 3 = 9)
  - Row 4: dual · ecochain (cols 3 + cols 6 = 9)
- Don't re-`num` the array without re-validating bento packing — `grid-auto-flow: dense` will pack around changes but the row narrative was authored deliberately.

### Grid header — REMOVED (HeaderBlock, then HintRow)
- The grid no longer has a header/hint block above it. `HeaderBlock` was dropped earlier; **`HintRow` is now also deleted** — the "click to focus · esc to dismiss" hint, its reverse-countdown hairline, and the timed hint→filter swap are all gone. The **FilterStrip** heads the grid from the start, with no timer, no countdown, and no swap (`WorkPanel` lost the hint-timer / `showFilter` / `HINT_HOLD_MS` / `BAR_OVERRUN` plumbing, and the `--sc-ease-pop` var went with it). See "Filter strip" above for the current head of the grid. The `.sc-filter` strip carries the `--space-64` breath before the tiles.

### Frameless-tile border exclusion list
- The `.sc-media--plain:not(:has(.sc-cardfan)):not(:has(.sc-poster-stack)):not(:has(.sc-dual)):not(:has(.sc-rr-scene))` rule maintains a per-tile-kind opt-out list for the default 1 px hairline border.
- `.sc-rr-scene` is the exclusion for the /all interface tile — it stays `frame: false` because the live Rug Rumble scene's artefacts (You panel + Peace Treaty card) self-frame on the workbench. The `:has()` selector reads the scene's own root class instead of a marker class on the wrapper — same effect, one fewer class to keep in sync. See "Rug Rumble interface scene" below for the live-scene component.

### Startooth — vector composition (v0.93+)
- The startooth tile renders **vector SVG** (not the prior raster PNG). The cards artwork is a single SVG at `public/images/startooth/sc-startooth-cards.svg` (~340 KB, the Figma export). The dark ground (`#311700`) is provided by a per-kind CSS override on `.sc-piece--startooth .sc-media { background: #311700 }` rather than embedded in the SVG — keeps the bg tunable from one CSS line.
- JSX is a `<div className="sc-startooth-svg">` + raw `<img>` of the SVG (NOT the `<Img>` primitive — manifest doesn't index SVGs, raw `<img>` is the cleanest for vector). Two tunable CSS vars on the wrapper: `--st-cards-w` (default 80%) for cards width as % of tile, and `--st-cards-y` (default 0) for vertical translate.
- The prior `sc-startooth.webp` raster and its `_source/images/startooth/sc-startooth.png` master are still on disk, **unreferenced**. Safe to clean up in a future pass.

### Video tiles (Furrmark, Ecochain)
- Both use `media/VideoSlot.tsx` — autoplay + loop + muted + playsInline. A `paused` prop controlled by the parent tile drives `video.play()` / `video.pause()` via ref.
- Source video aspects are **baked into data.ts** (Furrmark: 998/668, Ecochain: 16/9). No runtime measurement, so first paint never letterboxes.
- Ecochain has a `toggle` config that swaps between two source URLs (`interface-introduction.mov` ↔ `audit-status-icons.mov`). The active-tile click flips it. _(Files were `.mp4` until v0.93; replaced with `.mov` originals at user request — kept as-is, no transcode, served `Content-Type: video/quicktime`.)_

### Design-language polish
- **Switch** matches biconomy `.flows__ba-switch` exactly: 24×16 rectangular track at 4 px radius, 8×12 thumb at 2 px radius, 1 px border in the piece's category colour, light tinted background (color-mix 14%) → solid colour on active. Tinted per piece via `--sc-dotc`.
- **Rounded edges are conditional**: only `.sc-media--framed` (UI screenshots) gets 8 px radius + 1 px border + flat shadow. Plain (frameless) tiles — cardstack, posters, multiverse, startooth, dual — stay sharp because posters and printed/tiled surfaces have hard corners.
- **Plain active tiles have no shadow**: the cards/posters read fully transparent on focus (no implied tile rectangle behind them).
- **Multiverse poster** is `border-radius: 8px` and width-capped (80% of its tile) via `.sc-multiverse` — sits inset rather than dominating its column.
- **Video / GIF badge** is a paper pill (mat-bg + 1 px grey-880 + mono caps), not a dark UI chip.

### Helper file split (Fast Refresh)
- Per-renderer helpers live in their own files under `media/`: `VideoSlot.tsx`, `CardstackFan.tsx`, `PosterStack.tsx`, `Misc.tsx` (Placeholder + DualPlaceholder), `RrInterface/` (live Rug Rumble scene — see next section). `PieceMedia.tsx` is a thin switch that delegates.
- This was a fix for a recurring React Fast Refresh trap: helper function declarations defined *after* the default-exported component in the same module produced `ReferenceError: X is not defined` at runtime even though tsc passed. Splitting kills the pattern. If you add a new renderer, **make it its own file under `media/`**.

### Rug Rumble interface scene (`media/RrInterface/`)
The `interface` piece renders a live, autoplaying Rug Rumble battle scene — a foreign artefact with its own design language. **Don't normalize it to portfolio tokens.** Treat it the way you'd treat embedded third-party artwork: keep its hex values, fonts, easings, and radii sealed inside its folder.

- **Folder layout:** `Scene.tsx` (orchestrator + autoplay loop), `StatsPanel.tsx`, `CardPanel.tsx`, `PeaceTreatyCard.tsx`, `paths.ts` (verbatim SVG path data from the Figma export), `masks.ts` (verbatim data-URI mask SVGs), `fonts.ts` (next/font/google declarations), `rr-interface.css` (the scene wrapper + canvas only — everything else is inline style because every value is bespoke Figma).
- **Source provenance:** ported from `/reference/rr-interface-3x/rr-health-gauge/` (Figma Make export). The reference bundle ships shadcn/Radix/MUI/Tailwind/canvas-confetti and 60+ unused files — none of that came across. Only what the scene actually renders.
- **Tailwind → inline style.** The source was Tailwind v4 with bracketed values (`gap-[7.898px]`, `bg-[#13182c]`). Converted directly to inline `style={{ ... }}` because every value is one-off bespoke Figma export. No hover/focus states exist in this scene, so loss of CSS pseudo-classes doesn't matter. Don't refactor these to classes — there's nothing to gain.
- **Doubled px values.** The source authored the scene at 1× and wrapped it in `transform: scale(2)` at the App level. Both the wrapper and the scale are dropped during port; every px value in the JSX is the doubled value (e.g. `padding: 12.416` not `6.208`). The canvas renders at intrinsic **548 × 560 px**.
- **transform: scale() on the canvas — documented exception.** The crafted-lite ban on `transform: scale()` for whole authored canvases (`docs/responsive.md`) does not apply here. This is a *foreign* embedded artefact at fixed intrinsic dimensions; the scale is the embedding mechanism, not a responsive shortcut. The canvas is held at 548 × 560 and scaled to the tile width via `scale(calc(100cqw / 548px))` in `rr-interface.css`. Tile `aspect` in `data.ts` (`548 / 560`) matches so the artefact fills without letterbox or crop. The container query needs the wrapper's `container-type: inline-size` — don't remove it.
- **Three mirrored values that must change together.** Five places encode the canvas width/height. If you change one, change them all:
  1. `rr-interface.css` `.sc-rr-scene__canvas { width: 548px; height: 560px }`
  2. `rr-interface.css` `transform: scale(calc(100cqw / 548px))` — the divisor is the canvas width literal
  3. `data.ts` interface piece `aspect: 548 / 560`
  4. `CardPanel.tsx` `playing`/`default` `y: -480` — chosen so the card fully clears the canvas top with margin (`(560 + 360) / 2 = 460`, plus a 20 px safety margin)
  5. The 360 in (4) is the card's own intrinsic height — `PeaceTreatyCard.tsx` border + content sums to 355.43 px. Treat 360 as the locked card height.
- **`contain: layout paint` is load-bearing.** The wrapper's `contain: layout paint` is what prevents the scaled canvas from painting outside the tile bounds — the scale visually exceeds the wrapper's layout box during card-exit, and without containment the artwork would bleed into siblings on the workbench. Don't drop it.
- **Class name `.sc-rr-scene` is a cross-file contract.** Three files agree on the name:
  - `rr-interface.css:4` (the wrapper's own class)
  - `Scene.tsx` (the JSX className)
  - `showcase.css` `:not(:has(.sc-rr-scene))` (frameless-tile border exclusion list)
  Renaming the wrapper breaks the hairline suppression silently — the tile gains a 1 px border with no other symptom.
- **`motion/react` → `framer-motion`.** Source used the renamed `motion` package; we already have `framer-motion`. Same API surface. If `motion/react` reappears in a re-port, swap it.
- **Fonts: `next/font/google`, not local.** Gluten (weight 600) and Playpen Sans (weights 400/600/700). Both are integral to the design language and absent from our stack. CLAUDE.md prefers `next/font/local` for the portfolio's five primary fonts; this is a scoped exception for a foreign component. `next/font/google` downloads the woff2 at build time and serves it from the local Next.js asset path — no runtime fetch to `fonts.googleapis.com`, so the external-link ban isn't violated. Variable mode keeps the public surface to two CSS custom properties (`--font-rr-gluten`, `--font-rr-playpen`) applied only to `.sc-rr-scene`. **Don't promote these fonts to globals.css** — they belong to one tile.
- **Pause contract.** `Scene.tsx` consumes the `paused` prop from `PieceMedia.tsx`. The Showcase grid's "anyActive pauses every other video tile" rule applies here too — when any other tile is focused, the loop tears down at the next checkpoint via `aliveRef`. When `paused` flips back to `false`, the `useEffect`'s dependency triggers a fresh loop start.
- **`aliveRef` re-arm is load-bearing.** The autoplay effect sets `aliveRef.current = true` at the *top of the effect body*, before calling `run()`. The cleanup sets it `false`. If a future "simplification" removes the re-arm assuming it's redundant, the second un-pause never starts — the previous cleanup left the ref `false` and `run()`'s `while (aliveRef.current)` never enters. Keep the explicit re-arm.
- **`tickHealth()` is fire-and-forget — don't add `await`.** Inside the playing phase, `tickHealth()` ticks the health number down by 1 every 160 ms × 4 = 640 ms, concurrent with the rest of the loop's card-animation phases (120 ms hold → 520 ms exit → 200 ms gone → 1500 ms cooldown). Adding `await` would serialize the 640 ms of ticks against the card phases and desynchronize the choreography. The dangling promise observes the shared `aliveRef` and bails cleanly when `paused` flips.
- **`prefers-reduced-motion` is reactive *and* extends to the idle bob.** Scene watches the media query via `addEventListener('change')` so it reacts to OS-level toggle mid-session. When `reducedMotion === true`, the autoplay loop never starts AND `CardPanel` receives the flag, which suppresses the `idle` phase's `y: [0, -10, 0]` keyframes (substitutes static `y: 0`). The flag is reactive, so flipping the OS setting during a session re-arms the loop or pauses to the static pose without a remount.
- **Ghost border colour.** The `gone`/`cooldown` placeholder ring is `2px solid #CCCCCC` (grey-800 hex inlined, not the portfolio CSS var) with opacity pulse `0.6 → 1 → 0.6`. This is the only foreign-component colour that intentionally borrows the portfolio's neutral scale — readability of the "card slot" on the workbench mat required it. Kept inline so the scene stays sealed.
- **Toggle removed.** The static-image era had a `clean / UI Map` toggle that overlaid a `UiMapPlaceholder`. With the live scene as the proof, the toggle and the placeholder were dropped. If a future UI-map state returns, it has to be designed against the moving scene, not the still frame.

---

This document covers the **archive panel timeline** — the expandable section under "Works from the previous portfolio."

---

## Archive timeline model

The archive timeline is a vertical strip of colored bars, year labels, and entry cards. It represents a chronological work history reading **top (recent) to bottom (older)**.

### Core concepts

**Bars** represent time spans. Each project has a colored bar whose height is proportional to the project's duration.

**Nesting** encodes relationships. A short bar sitting inside a longer bar means that project was done as part of the longer engagement. Example: the olive bar (Ecochain) sits inside the mint bar (Slangbusters) — Ecochain was a client project done during the Slangbusters tenure.

**Year labels** are anchored to bar edges or entry meta lines. They mark when a project started or ended. A year belongs to whichever project it contextualizes — `20` sits on the mint bar but marks when Ecochain started within Slangbusters.

**Entries** are the text cards (title + role/company) positioned alongside their bars.

### Current projects (top to bottom)

| Color     | Project      | Role              | Year | Bar type   |
|-----------|--------------|-------------------|------|------------|
| yellow    | Connektion   | Product Designer  | 2021 | Standalone |
| aleyr     | Aleyr        | Creative Director | 2020 | Nested inside mint |
| olive     | Ecochain     | Creative Director | 2019 | Nested inside mint |
| codezeros | Codezeros    | Creative Director | 2018 | Nested inside mint |
| mint      | Slangbusters | Creative Director | 2018–20 | Long, contains aleyr/olive/codezeros |

All five archive projects use page-local tokens in `selected.css` under `.selected-workbench`, derived from actual brand hex values with a primary/secondary color system:
- Primary hue → light fill (`-100`, or `-80` for mint), `-800` (text; also the standalone Connektion bar's border), `-960` (borders on the mint bar and the nested bars). The `-800`/`-960` border mix is shipped and deliberate — read `selected.css` for the per-bar choice.
- Secondary hue → `-240` (hover bar fill)

Token origins: Connektion teal #01F2F5, Aleyr purple #723CC5 / pink #FF5581, Ecochain green #4CB400 / off-white, Codezeros orange-red #FF4B3F / golden #F9A12E.

---

## Spacing system

All values are multiples of **4px** or **8px**.

### Grid tokens

| Token | Value | Usage |
|-------|-------|-------|
| Number-to-bar-edge | 4px | Year label to its corresponding bar edge |
| Bar gap | 16px minimum | Space between non-touching bars (the shipped yellow→mint gap is 23px — authored; preserve) |
| Entry spacing | 88px | Vertical distance between entry tops |
| Title height | 36px | Fixed height of `.ap-entry__title` (2-line max) |
| Dot cluster gap | 8px | Between dots in the dot clusters |
| Nested bar height | 20px | Small marker for nested projects |

### Position math

All positions are **relative to the archive panel** (`.selected-archive-panel`).

**Entry positions** follow the 88px rhythm:
```
entry[0].top = 36
entry[n].top = 36 + (n * 88)
```

**Meta line center** (where year labels align):
```
meta_center = entry.top + title_height(36) + half_meta_height(10) = entry.top + 46
```

**Year label CSS `top`** = meta_center (labels use `transform: translate(-100%, -50%)` so `top` is their visual center).

**Bar positioning from year labels** (4px padding rule):
- Year at TOP of bar: `bar.top = year_center - 6(half_label) - 4(padding)` = `year_center - 10`
- Year at BOTTOM of bar: `bar.bottom = year_center + 6 + 4` = `year_center + 10`

**Bar gap**: bottom of bar N to top of bar N+1 = 16px minimum (shipped yellow→mint is 23px — preserve shipped values).

### Current positions

```
Dots:            top: 2    (12px gap to yellow bar at 36)

Yellow bar:      top: 36,  h: 55,  bottom: 91
  Connektion:    top: 36
  21:            top: 81   (at Connektion meta)

  ── gap ──

Mint bar:        top: 114, h: 329, bottom: 443
  20 (mint):     top: 124  (at mint bar top, belongs to Slangbusters)

  Aleyr:         top: 124
  Aleyr bar:     top: 159, h: 20,  bottom: 179  (nested)
  20 (aleyr):    top: 169  (at Aleyr meta)

  Ecochain:      top: 212
  Ecochain bar:  top: 247, h: 20,  bottom: 267  (nested)
  19:            top: 257  (at Ecochain meta)

  Codezeros:     top: 300
  Codezeros bar: top: 335, h: 20,  bottom: 355  (nested)
  18 (codezeros):top: 345  (at Codezeros meta)

  Slangbusters:  top: 388
  18 (mint):     top: 433  (at mint bar bottom, belongs to Slangbusters)

Entry width:     300px (left: 17px → 12px gap from bar)
Panel width:     340px
Panel height:    468px
```

---

## Main timeline positions

All positions relative to `.selected-tl` (which is the full mat area).

```
Now dot:         left: 143, top: 64, 16×16
Now label:       left: 139 (4px gap to dot left), top: 72, anchor: right-center
Greeting:        left: 163 (4px gap from dot right), top: 72

Top dots:        left: 148, top: 92   (12px gap below dot bottom 80)
Blue bar:        left: 148, top: 126, h: 374, bottom: 500
Yellow bar:      left: 148, top: 256, h: 46
2025:            left: 144, top: 136  (bar-top marker)
Q4•25:           left: 144, top: 280  (Terra role center)
23:              left: 144, top: 478  (Blue role center)
Bot dots:        left: 148, top: 512  (12px gap below bar bottom 500)

Card Terra:      left: 164, top: 126  (aligns with blue bar top)
Card Blue:       left: 164, top: 324

Nameplates:      left: 133
  Names Coined:  top: 545
  Marks/Symbols: top: 595
Single dots:     left: 148
  mid1:          top: 585
  mid2:          top: 635
Archive toggle:  left: 133, top: 645
Archive panel:   left: 148, top: 685
```

---

## Now dot — time-of-day shapes

The Now dot's painted shape mirrors the greeting stage from `app/lib/greeting.ts` (`getGreetingStage()`). The 16×16 box and `left: 143, top: 64` position are **constant** across all three stages so the timeline alignment never moves — what changes is what's painted inside the box.

- **Morning** (`selected-tl__dot--morning`) — `clip-path: inset(0 0 50% 0)` clips the bottom half of the disk, leaving a top-half dome (sun above horizon). The dome's flat bottom lands at `y = 72`, aligning to the "Now" label's vertical center as a horizon line.
- **Afternoon** (`selected-tl__dot--afternoon`) — no modifier rule by design; the base `.selected-tl__dot` IS the afternoon shape (full 16×16 yellow disk). Don't add an empty `.selected-tl__dot--afternoon {}` rule "for symmetry" — the modifier class is inert by intent.
- **Evening** (`selected-tl__dot--evening`) — a `::before` pseudo-element offset `-2px / -2px` at the top-right, sized `14×14` with `border-radius: 50%`, painted in `var(--mat-bg)`, carves a bite out of the disk and leaves a crescent opening to the bottom-left.

**Load-bearing details:**
- The crescent carve color is `var(--mat-bg)`, **not transparent**. If the dot is ever placed over a surface that isn't `--mat-bg`, the crescent will paint the wrong color and the bite will be visible as a rectangle of the wrong shade. The dot lives inside `.selected-tl` which sits over the workbench mat, so this currently holds.
- The crescent geometry — `-2px / -2px` offset and `14×14` carve diameter — is tuned for the crescent's visual thinness. Don't tweak without checking the silhouette.
- Stage selection inlines `getGreetingStage()` in JSX render (matching the existing pattern of `getGreeting()` next to it). Both share the same minor SSR/CSR hour mismatch risk if server timezone differs from client — accepted as inherited behavior, not a new concern.
- Mobile inheritance: the mobile reposition of `.selected-tl__dot` (`selected.css` mobile block) doesn't restate the modifier rules; the morning `clip-path` and evening `::before` carry through because both are geometry-relative to the dot's box, not to absolute coordinates.

---

## Typography

### Year labels (both timelines)

`var(--font-mono)` — Google Sans Code via next/font (the system mono stack is only its fallback chain) — at 11px / 600 / -0.3px letter-spacing, for even digit widths.

### Meta / role text (archive entries + project cards)

Uses the shared `.t-h5` utility (`globals.css`), applied via JSX — the Google Sans Flex variable-axis values live in that one shared rule, not inline in this route.

### Now label

Same `--font-mono` token as year labels. Anchored right (`transform: translate(-100%, -50%)`).

---

## Spacing grid

### Consistent gaps

| Gap | Value | Where |
|-----|-------|-------|
| Dots-to-bar | 12px | Top dots → blue bar, blue bar → bot dots, archive dots → yellow bar |
| Content-to-bar | 12px | Entry left edge to bar (entry `left: 17px`, bar at `left: 1px` + `width: 4px` = 5px → 17-5 = 12px gap) |
| Label-to-dot | 4px | "Now" label right edge to dot left; greeting left to dot right |
| Year-to-bar edge | ~4.5px | Year text edge to nearest bar edge (year_center ± 10px from bar edge) |
| Entry flex gap | 2px | Between title and meta within each archive entry |
| Dot cluster gap | 8px | Between dots within a cluster |

### 4px horizontal gap rule

Labels maintain 4px clearance to adjacent elements:
- "Now" at `left: 139px` → 4px to dot at 143px
- Greeting at `left: 163px` → 4px from dot right edge (143 + 16 = 159)

---

## Icons

Two custom Lucide-geometry SVG icons with CSS-only hover animations. Both are hand-rolled (not imported from `lucide-react`), using the same pattern: a named inner class (`<path>` or `<g>`) gets `translate` on parent hover, `0.3s ease-in-out`.

Both icons were promoted to the shared layer — they live at `app/components/icons/` (`IconExternalLink.tsx`, `IconChevronRight.tsx`; see `LIBRARY.md`). The hover rules stay route-local in `selected.css`:

**IconExternalLink** — archive entries. Arrow group slides diagonally:
```css
a.ap-entry:hover .icon-ext .icon-ext-arrow { translate: 2px -2px; }
```

**IconChevronRight** — project cards. Chevron path nudges right, gated on the stale-hover guard:
```css
.project-card[data-armed="true"]:hover .project-card__arrow .icon-chevron-shaft { translate: 3px 0; }
```

Arrow color inherits from variant: `--terra-720` (Terra) / `--blue-800` (Blue), set on `.project-card__arrow`.

Material Symbols remains for non-animated icons (nav markers, archive toggle).

---

## Pending migration — `.ap-entry__hint` → `<Monostamp>`

The "Opens in new tab" hint pill on archive entries (the `.ap-entry__hint` block in `selected.css`) is the
original instance of the shell pattern that has been promoted to
`app/components/Monostamp.tsx` — monospace text, paper-cream fill, hairline
border, tone-colored ink. The second consumer (note-pointer stamps in
`/biconomy`) already uses `<Monostamp>`.

This hint is still inline CSS for now. Migration is safe but non-trivial:
the hint has **route-specific hover behavior** (hidden by default, slides
in on `a.ap-entry:hover` with opacity + translate transitions) that must
stay in `selected.css`. Only the **visual shell** — bg, border, typography,
padding, radius — should move to the `<Monostamp>` component, keeping the
positioning/transition overrides local.

Tones needed: `connektion`, `aleyr`, `olive` (ecochain), `codezeros`, `mint`.
`mint` / `olive` are already in `MonostampTone`. `connektion`, `aleyr`,
`codezeros`, `ecochain` are **not** — their color tokens currently live only
in [selected.css:18+](selected.css:18) (route-scoped), not in `globals.css`.
Migration sequence:
1. Decide: promote those tokens to `globals.css` (makes tones available
   anywhere), or keep them in `selected.css` and scope a route-local
   `MonostampTone` extension.
2. Add the matching ramps (560 / 720 / 800 / 960) — some are missing today.
3. Extend `MonostampTone` + the dark/light/is-active CSS blocks with the
   new tones.
4. Swap `.ap-entry__hint` shell styles to use `<Monostamp>`.

**What will break if this isn't done:** nothing immediate. It's technical
debt — drift risk if the Monostamp base styling changes later.

---

## Component ownership

The `/all` page has three components:

| Component | Owns | Props |
|-----------|------|-------|
| **SelectedContent** | State (`archiveOpen`), scroll behavior | — |
| **Timeline** | Entire vertical sequence: Now dot → dots → bars → cards → year labels → nameplates → single dots → archive toggle | `isArchiveOpen`, `onArchiveToggle` |
| **ArchivePanel** | Expandable archive content only (AnimatePresence) | `isOpen` |

The **archive toggle button** lives in Timeline, not ArchivePanel. It's visually part of the main timeline sequence and must participate in the unified delay train. ArchivePanel only contains the content that appears/disappears.

---

## Animation: train metaphor

All elements animate in a **top-to-bottom sequence**, as if an imaginary cursor is drawing the timeline downward. Bars grow via `scaleY` from `transform-origin: top center`.

The train runs across **two scopes**:

1. **Timeline** — unified delay map from Now dot (0.30s) through archive toggle (1.28s)
2. **ArchivePanel** — internal delay map starting at 0.06s (relative to panel mount)

### Sequencing rules

1. Bars are **sequential** — the next bar starts only after the previous bar's spring is visually complete.
2. Years and entries appear **as the train reaches their vertical position** within the current bar's growth.
3. Nested bars (olive, aleyr, codezeros) appear mid-parent (mint) when the train reaches their `top`.

### Animation patterns

| Element type | Initial | Animate | Spring | Direction |
|-------------|---------|---------|--------|-----------|
| Dots | `opacity: 0, scale: 0` | `opacity: 1, scale: 1` | SPRING_POP (0.3s/0.35) | Pop in place |
| Bars | `scaleY: 0` | `scaleY: 1` | SPRING or SPRING_LONG | Grow top-to-bottom |
| Cards/Entries | `opacity: 0, y: -8` | `opacity: 1, y: 0` | SPRING_PLACE (0.45s/0.25) or SPRING_ENTRY (0.3s/0.12) | Fall from above (top-to-bottom) |
| Nameplates | `opacity: 0, y: -8` | `opacity: 1, y: 0` | SPRING_PLACE (0.45s/0.25) | Fall from above |
| Year labels | `opacity: 0` | `opacity: 1` | duration 0.14–0.25s | Fade |

**Important**: all cards, entries, nameplates, and the archive toggle animate `y: -8 → 0` (top-to-bottom), matching the train direction. Never use `y: positive → 0` (bottom-to-top).

### Delay calculation

For elements during a bar's growth, delay is proportional to their position within the bar's range:

```
element_delay = bar_start_delay + ((element.top - bar.top) / bar.height) * bar_spring_duration
```

### Timeline delay table (Timeline.tsx)

```
D.dot       = 0.30   Now dot + label + greeting
D.dotsTop0  = 0.38   Top dot cluster (staggered)
D.dotsTop1  = 0.42
D.dotsTop2  = 0.46
D.barBlue   = 0.50   Blue bar (spring 0.5s, done ~1.00)
D.year2025  = 0.51   136 — just inside bar top
D.cardTerra = 0.51   126 — at bar top
D.barYellow = 0.68   256 — 35% into blue
D.yearQ425  = 0.70   280 — 41% into blue (Terra role center)
D.cardBlue  = 0.76   324 — 53% into blue
D.year23    = 0.98   478 — 94% into blue
D.dotsBot0  = 1.02   Bottom dot cluster (staggered)
D.dotsBot1  = 1.06
D.dotsBot2  = 1.10
D.names     = 1.14   Names Coined nameplate
D.dotMid1   = 1.18   Single dot
D.marks     = 1.20   Marks And Symbols nameplate
D.dotMid2   = 1.24   Single dot
D.archive   = 1.28   Archive toggle (last element)
```

### Archive delay table (ArchivePanel.tsx)

```
D.dots          = 0.06   (staggered +0.04 per dot)
D.barYellow     = 0.12   (spring 0.4s, done ~0.52)
D.connektion    = 0.28
D.year21        = 0.42
D.barMint       = 0.54   (spring 0.65s, done ~1.19)
D.year20top     = 0.56   (mint-colored, at bar top)
D.aleyr         = 0.58
D.barAleyr      = 0.65   (spring 0.3s)
D.year20        = 0.66   (aleyr-colored)
D.ecochain      = 0.74
D.barEcochain   = 0.82   (spring 0.3s)
D.year19        = 0.83
D.codezeros     = 0.92
D.barCodezeros  = 1.00   (spring 0.3s)
D.year18        = 1.01   (codezeros-colored)
D.slangbusters  = 1.09
D.year18bot     = 1.17   (mint-colored, at bar bottom)
```

### Spring types

| Name | Duration | Bounce | Used for |
|------|----------|--------|----------|
| SPRING | 0.4–0.5s | 0.15 | Standard bars (Timeline: 0.5s, Archive: 0.4s) |
| SPRING_POP | 0.3s | 0.35 | Dots (high bounce, snappy) |
| SPRING_PLACE | 0.45s | 0.25 | Cards, nameplates, archive toggle |
| SPRING_PILL | 0.4s | 0.15 | (reserved) |
| SPRING_LONG | 0.65s | 0.12 | Tall bars (mint in archive) |
| SPRING_ENTRY | 0.3s | 0.12 | Archive entries, short bars |

---

## Hover system

When an entry is hovered, its **bar, year labels, and text highlight** while everything else dims.

### Mechanism

CSS `:has()` on `.selected-archive-panel` — no JS state needed. `filter: opacity()` is used instead of `opacity` to avoid conflicting with Framer Motion's inline styles.

Transition: `0.35s ease-in-out` on both filter and background, applied to all interactive elements on their base state (so hover-out is equally gentle).

### Highlight behavior

- Dimmed state: `filter: opacity(0.35)`
- Highlighted bar: `filter: opacity(1)` + background stepped up one token (e.g., `--yellow-100` to `--yellow-240`)
- Highlighted years/entries: `filter: opacity(1)`

### Hover groupings

**Main timeline** (CSS `:has()` on `.selected-tl`):

| Card hovered | Highlights | Note |
|--------------|------------|------|
| Terra (Rug Rumble) | yellow bar, Q4•25, card | 2025 dims — it's a bar-top marker, not Terra-specific |
| Blue (Biconomy) | blue bar, 2025, 23, card | Q4•25 dims |

**Archive** (CSS `:has()` on `.selected-archive-panel`):

| Entry hovered | Highlights | Note |
|---------------|------------|------|
| Connektion (yellow) | yellow bar, year 21 | |
| Aleyr | aleyr bar, year 20 | |
| Ecochain (olive) | olive bar, year 19 | |
| Codezeros | codezeros bar, year 18 | |
| Slangbusters (mint) | mint bar, years 20 (top) & 18 (bottom) | Mint-colored year labels at bar edges |

---

## Recipe: adding a new project

### 1. Decide placement

- Where in the chronological order does it go?
- Is it standalone or nested inside another bar?
- Pick a color token. Use globals if it exists, otherwise define page-local tokens in `selected.css` under `.selected-workbench`.

### 2. Calculate positions

```
new_entry.top = previous_entry.top + 88
meta_center = new_entry.top + 46
```

For the bar:
- If year at top: `bar.top = year_center - 10`
- If year at bottom: `bar.bottom = year_center + 10`
- Maintain at least a 16px gap from adjacent non-nested bars (match the shipped neighbours)
- Nested bars: 20px height, positioned within parent bar's range

### 3. Update CSS (`selected.css`)

Add under each section:
- `.ap-entry--{color} { top: __px; }` — entry position
- `.ap-entry--{color} .ap-entry__meta { color: var(--{color}-800); }` — meta color
- `.selected-ap-year--{id} { top: __px; color: var(--{color}-800); }` — year label(s)
- `.selected-ap-bar--{id} { top: __px; height: __px; background: var(--{color}-100); border: 1px solid var(--{color}-960); }` — bar (match the shipped bars: nested/mint use `-960`; only the standalone Connektion bar uses `-800`)

Add hover group:
```css
.selected-archive-panel:has(.ap-entry--{color}:hover) .ap-entry--{color},
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-bar--{id},
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-year--{id} {
  filter: opacity(1);
}
.selected-archive-panel:has(.ap-entry--{color}:hover) .selected-ap-bar--{id} {
  background: var(--{color}-240);
}
```

### 4. Update component (`ArchivePanel.tsx`)

- Add to `ARCHIVE_ENTRIES` array
- Add bar, year(s), and entry JSX in the correct top-to-bottom position
- Calculate delay using the train formula and add to `D` object
- Recalculate delays for any elements pushed down

### 5. Adjust panel height

Update `.selected-archive-panel` height if content extends beyond current value (468px). Also update `.selected-mat--archive-open` min-height and `.selected-layout:has(...)` min-height.

---

## Don't-touch items

- **Hover uses `filter: opacity()` not `opacity`** — Framer Motion sets inline `opacity` after entrance animations, which would override CSS class rules. `filter` is a separate property and works.
- **Bar `transform-origin: top center`** is set on the base `.selected-ap-bar` class. All bars grow top-to-bottom. Don't override per-bar unless explicitly asked.
- **Year label `transform: translate(-100%, -50%)`** — `top` value = visual center. Account for this in all position math.
- **The `D` delay object uses absolute values, not relative** — changing one bar's timing requires updating everything below it.
- **Archive toggle lives in Timeline, not ArchivePanel** — it participates in the main delay train. Moving it to ArchivePanel would break the sequencing.
- **Animation direction is always top-to-bottom** — entries/cards/nameplates use `y: -8 → 0`. Never use positive `y` initial values (bottom-to-top) as this contradicts the train metaphor.
- **Dots use pop animation, not fade** — `scale: 0 → 1` with SPRING_POP. Dot clusters are staggered (+0.04s per dot).
- **Year labels use system monospace**, not the variable display font. This ensures even digit widths without needing tabular-nums or variable font tricks.
- **No autoscroll on archive toggle** — `handleToggle` simply flips state. Scroll behavior was removed because it was disorienting.
- **12px gap grid** — dots-to-bar and content-to-bar gaps are consistently 12px. Do not change without recalculating all adjacent positions.
- **4px label clearance** — "Now" label and greeting maintain 4px gaps to the dot. Year labels maintain ~4.5px from bar edges.
- **Icon arrow animation is CSS-only** — `translate` on `.icon-ext-arrow` group, triggered by parent `a.ap-entry:hover`. No Framer Motion involvement.

### Hint pill

The "opens in new tab" pill uses a neutral shell (grey bg/border) with only the text color themed per project. This avoids visual noise while still tying the pill to its entry.

```
background: var(--grey-960);  /* #F5F5F5 */
border-color: var(--grey-880);  /* #E0E0E0 */
color: var(--{project}-800);  /* themed text */
```

---

## Responsive anomalies (mobile ≤767px)

The first responsive pass on `/all` introduced several structural constraints
that are not obvious from reading the code. Mobile changes live in the
`@media (max-width: 767px), (max-height: 500px)` blocks of `selected.css`;
tablet overrides in the `(min-width: 768px) and (max-width: 1023px)` block
(search the queries — line numbers drift).

### `.selected-archive-panel` is a **sibling** of `.selected-tl`, not a child

Both live inside `.selected-mat`. On desktop this doesn't matter because
everything is positioned absolutely. On mobile it does: the archive panel
cannot inherit horizontal padding from `.selected-tl`, so it repeats its own
`padding: 16px 32px 32px` to land in the same content column. If you change
the mat's horizontal inset, you must change **both** places.

**What breaks if you assume nesting:** archive entries drift out of the column
established by project cards and nameplates.

### Mat fills remaining viewport height via a three-link flex chain

```
.selected-workbench  { min-height: calc(100vh - 2*var(--workbench-pad-y));
                       display: flex; flex-direction: column; }
.selected-layout     { flex: 1; display: flex; flex-direction: column; }
.selected-mat        { flex: 1 0 auto; }
```

The mat grows to fill whatever vertical space the about card + nav-row leaves
behind, so the grid surface always reaches the black viewport frame at the
bottom. The chain is load-bearing: **any sibling added after `.selected-mat`
inside `.selected-layout` will steal the grow and orphan the mat short of
the frame.** If you need to add content below the mat, move it inside the
mat or re-engineer the chain.

### Sticky nav row uses negative margin-top to sit flush against the viewport top

```css
.selected-nav-row {
  position: sticky;
  top: 0;
  margin-top: calc(-1 * var(--workbench-pad-y));
  z-index: 40;
}
```

Without the negative margin, the sticky row would stick **below** the
workbench's top padding (the first position it could occupy in normal flow).
The negative margin pulls its initial position up by exactly the pad-y so
that `top: 0` sits the marker flush at the viewport edge (the black frame is desktop-only and hidden on mobile).

**Don't touch without reading:** the negative margin value is tied to
`--workbench-pad-y`, not a magic number. If `--workbench-pad-y` is retuned
for mobile (currently 32px), this continues to work. Hardcoding `-32px`
here would re-introduce a stale-value bug.

### Archive year lives in the DOM on desktop, hidden by CSS

`ArchivePanel.tsx` renders every entry's meta as
`{role} • {company}<span className="ap-entry__year"> • {year}</span>`.
Globally `.ap-entry__year { display: none }`, and the mobile block flips
it to `display: inline`.

Implications:
- **Semantic payload:** screen readers, search engines, and link scrapers see
  the full string `"Product Designer • Connektion • 2021"` on desktop even
  though the visible text is shorter. This is arguably a feature (the
  chronological context is carried to assistive tech via the hidden year),
  but it is a deliberate desktop/mobile **semantic mismatch** — flag it if
  a future a11y pass treats `display: none` content as "not for AT".
- **Copy discipline:** the year source of truth is the `ARCHIVE_ENTRIES`
  array in `ArchivePanel.tsx`. The desktop year-label components
  (`.selected-ap-year--*`) are separate, hand-placed elements. If the
  visible desktop year and the inline meta year ever disagree, the
  archive entries array is wrong.

### Responsive copy pattern — two sibling spans with CSS display toggling

`Timeline.tsx` renders both copies (search `archive-toggle-label`):

```tsx
<span className="... archive-toggle-label--desktop">Works from the previous portfolio</span>
<span className="... archive-toggle-label--mobile">Previous portfolio</span>
```

CSS toggles `display: inline` vs `display: none` at the 767px breakpoint.

**Don't update one without the other.** There is no shared source of truth —
the two strings will drift silently unless a linter or convention catches it.
If this pattern proliferates, consider promoting a `<ResponsiveCopy desktop mobile />`
primitive into shared components rather than copying the two-span pattern
into more routes.

### Hover-only affordances disabled on mobile

`.ap-entry__hint` (the "opens in new tab" pill) and the push-apart translation
on entry hover are both turned off in the mobile block because touch devices
don't have persistent hover. The hover highlights (`:has(:hover)` rules) are
explicitly reverted via `filter: none`. Don't assume
these work on touch; they're desktop-only embellishments.

## Stale-hover gate — `data-armed` on ProjectCard

[ProjectCard.tsx](components/ProjectCard.tsx) sets `data-armed="true"` on its `<Link>` only after the first real cursor `mousemove` (with a position-change check that ignores synthetic moves emitted by layout/transform settles). Both the card-level `:hover` rules **and** the `.selected-tl:has(.project-card[data-armed="true"]:hover)` timeline cascade in [selected.css](selected.css) — five selectors total: dim-all, terra highlight, terra bar, blue highlight, blue bar — are gated on this attribute.

**Why:** without the gate, arriving on `/all` with the cursor parked over a card on first paint triggers the `:has(:hover)` cascade on mount, dimming the timeline and highlighting one card before the user has moved the mouse. The `data-armed` mousemove latch defers all hover-driven state to a real cursor input, which is the actual signal of intent.

**Don't drop the gate from any of the five cascade rules.** They're a unit. Removing it from one breaks the others' parity (e.g. dim fires but highlight doesn't, or vice versa). The mobile override under `:has(...:hover)` to undo the desktop dim on touch also uses the same `[data-armed="true"]` gate so synthesized touch hover doesn't bypass it.

**Why on the Link, not the outer motion.div:** the cascade selectors are `.selected-tl:has(.project-card[data-armed="true"]:hover)`. Putting `data-armed` on the inner Link is what makes the `:has()` query match. Earlier attempts (timer-based gates, gate on the outer motion.div) all failed because the `:has()` query was operating on the inner element. The `:has()` cascade was the actual hover trigger — root-cause fix lives where the selector looks.

*Last updated: 15 April 2026.*
