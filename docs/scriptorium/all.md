# Scriptorium — all (Works)

Verbatim copy reference for the works hub at **`/all`** (the "Work Essay"; internal codenames "bench"/"selected"). Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/(works)/all/page.tsx`, `app/(works)/all/components/Essay/*.tsx` (invitation + ticket), `app/(works)/all/components/*.tsx` (Longform: Timeline + Slangbusters case studies; `MobileCases`/`CasesSheet` on phones), `app/(works)/all/components/Showcase/*` (Visual tab).

The route is a single morphing surface: an **invitation card** (manifesto poem) footed by a **ticket** that docks into a navbar on scroll, switching between the **Longform** tab (the career Timeline, with Slangbusters' case studies behind an inline dropdown) and the **Visual** tab (Showcase grid).

---

## sr-only heading {#sr-heading}

> "Works"
> — [`page.tsx:36`](../../app/(works)/all/page.tsx#L36)

## Exit marker — "+Nihar" {#exit-marker}

Top-left marker above the invitation card; links home.

> "Nihar"
> — [`Essay/BenchExitMarker.tsx:29`](../../app/(works)/all/components/Essay/BenchExitMarker.tsx#L29)

> "Back to landing page" (aria-label)
> — [`Essay/BenchExitMarker.tsx:31`](../../app/(works)/all/components/Essay/BenchExitMarker.tsx#L31)

## Invitation card — manifesto {#card-manifesto}

The two-stanza poem in gradient-clipped Fraunces. Authored `<br>` line breaks shown as line breaks below; they are suppressed on mobile (the poem wraps naturally).

First stanza:
> "Over the past 10 years, I
> have made posters, brands,
> a culture, interfaces, even
> names and games."
> — [`Essay/InvitationCard.tsx:53-58`](../../app/(works)/all/components/Essay/InvitationCard.tsx#L53)

Second stanza:
> "Behind the scenes, all I have truly done is
> protected the process:
> the brief and its refinement,
> the people and their environment,
> agendas and budgets,
> timelines and communication,
> and any other force that can inhibit or
> support the plant growth."
> — [`Essay/InvitationCard.tsx:60-68`](../../app/(works)/all/components/Essay/InvitationCard.tsx#L60)

## Invitation card — closing {#card-closing}

> "One project at a time" (eyebrow)
> — [`Essay/InvitationCard.tsx:79`](../../app/(works)/all/components/Essay/InvitationCard.tsx#L79)

> "that practice has
> become my craft."
> — [`Essay/InvitationCard.tsx:80-83`](../../app/(works)/all/components/Essay/InvitationCard.tsx#L80)

## Ticket — browse control {#ticket}

The letterpress ticket footing the card; docks into a navbar on scroll. Tab order is **Longform (case studies) on the left, Visual (showcase) on the right**, and **Longform is the default tab** (bare `/all` with no `?showcase`/`?cases` flag).

> "browse in two ways" (eyebrow)
> — [`Essay/Ticket.tsx`](../../app/(works)/all/components/Essay/Ticket.tsx)

> "Longform" (tab title) / "case studies" (sub)  *(left tab)*
> — [`Essay/Ticket.tsx`](../../app/(works)/all/components/Essay/Ticket.tsx)

> "Visual" (tab title) / "showcase" (sub)  *(right tab)*
> — [`Essay/Ticket.tsx`](../../app/(works)/all/components/Essay/Ticket.tsx)

> "Back to the invitation" (close aria-label)
> — [`Essay/Ticket.tsx:72`](../../app/(works)/all/components/Essay/Ticket.tsx#L72)

## Timeline — Now / Greeting {#timeline-now}

> "Now"
> — [`Timeline.tsx:84`](../../app/(works)/all/components/Timeline.tsx#L84)

> "Good morning" / "Good afternoon" / "Good evening" (from `getGreeting`)
> — [`Timeline.tsx:93`](../../app/(works)/all/components/Timeline.tsx#L93)

## Timeline — year labels {#timeline-years}

> "2025"
> — [`Timeline.tsx:131`](../../app/(works)/all/components/Timeline.tsx#L131)

> "Q4•25"
> — [`Timeline.tsx:140`](../../app/(works)/all/components/Timeline.tsx#L140)

> "23"
> — [`Timeline.tsx:149`](../../app/(works)/all/components/Timeline.tsx#L149)

## Project card — Rug Rumble (terra) {#card-rr}

> "A 5-minute game, with a simple mechanic"
> — [`Timeline.tsx:162`](../../app/(works)/all/components/Timeline.tsx#L162)

> "+ card layouts, a game arena, and the process of building a game across 3 continents with playtesting."
> — [`Timeline.tsx:163`](../../app/(works)/all/components/Timeline.tsx#L163)

> "Game Designer • Rug Rumble"
> — [`Timeline.tsx:164`](../../app/(works)/all/components/Timeline.tsx#L164)

## Project card — Biconomy (blue) {#card-biconomy}

> "Designs to make the invisible infra: visible and usable"
> — [`Timeline.tsx:178`](../../app/(works)/all/components/Timeline.tsx#L178)

> "+ a UX Audit, demos, a concept UI, and cultural interventions in a web3 ecosystem."
> — [`Timeline.tsx:179`](../../app/(works)/all/components/Timeline.tsx#L179)

> "Product Designer • Biconomy"
> — [`Timeline.tsx:180`](../../app/(works)/all/components/Timeline.tsx#L180)

## Nameplate — Names Coined (W.I.P.) {#nameplate-names}

> "Names Coined"
> — [`Timeline.tsx:207`](../../app/(works)/all/components/Timeline.tsx#L207)

> "W.I.P." (wip-hint chip)
> — [`Timeline.tsx:208`](../../app/(works)/all/components/Timeline.tsx#L208)

> "Names Coined — work in progress" (aria-label)
> — [`Timeline.tsx:209`](../../app/(works)/all/components/Timeline.tsx#L209)

## Nameplate — Marks and Symbols Made {#nameplate-marks}

> "Marks and Symbols Made"
> — [`Timeline.tsx:235`](../../app/(works)/all/components/Timeline.tsx#L235)

## Slangbusters dropdown header {#slangbusters-dropdown}

> "Slangbusters case studies (3)"
> — [`Timeline.tsx`](../../app/(works)/all/components/Timeline.tsx) (`.selected-tl__dropdown-label`)

## Project card — Slangbusters (mint, external) {#card-slangbusters}

> "Building the conditions that let a creative studio do its best work" (title)
> "+ studio rituals, hiring, and the operating system behind the work." (body)
> "Creative Director • Slangbusters" (role)
> — [`Timeline.tsx`](../../app/(works)/all/components/Timeline.tsx) (mint `<ProjectCard>`). Links to `https://niharbhagat.com/work/slangbusters/` (new tab). Placeholder copy — confirm before ship.

## Slangbusters case studies (the dropdown children) {#slangbusters-cases}

Source of truth: the `CHILDREN` array in [`Timeline.tsx`](../../app/(works)/all/components/Timeline.tsx) (desktop) and `STUDIES` in [`CasesSheet.tsx`](../../app/(works)/all/components/CasesSheet.tsx) (mobile sheet). Year labels "20 / 19 / 18".

### Aleyr (2020) {#case-aleyr}

> "Finding the thin line between pet ownership and pet parenting"
> "Creative Director • Aleyr" (desktop) / "Creative Director · Aleyr" (mobile sheet)
> Links to `https://niharbhagat.com/work/aleyr/`

### Ecochain (2019) {#case-ecochain}

> "Using the logic of a real desk to shape a digital trading workspace"
> "Creative Director • Ecochain" / "Creative Director · Ecochain"
> Links to `https://slangbusters.com/work/ecochain/`

### Codezeros (2018) {#case-codezeros}

> "Defining a blockchain company before the category had a clear shape"
> "Creative Director • Codezeros" / "Creative Director · Codezeros"
> Links to `https://niharbhagat.com/work/codezeros/`

## Slangbusters year labels {#slangbusters-years}

> "20" (top of the mint span) / "18" (bottom)
> — [`Timeline.tsx`](../../app/(works)/all/components/Timeline.tsx) (`.selected-tl__year--slang-top` / `--slang-bot`)

## "opens in new tab" hint {#new-tab-hint}

> "opens in new tab"
> — mint card + each `.sb-case` ([`Timeline.tsx`](../../app/(works)/all/components/Timeline.tsx))

## Mobile — cards-first composition {#mobile-cases}

Source: [`MobileCases.tsx`](../../app/(works)/all/components/MobileCases.tsx). Shown only at ≤767px / ≤500h (the `MOBILE_BP` gate).

> "NOW · 2026" (living-now cue)
> "2023 — 2025" · "Designs to make the invisible infra: visible and usable" · "A UX audit, demos, a concept UI, and cultural interventions in a web3 ecosystem." · "Product Designer · Biconomy" (Biconomy hero)
> "A project during Biconomy" (nested label)
> "Q4 · 2025" · "A 5-minute game, with a simple mechanic" · "Game Designer · Rug Rumble" (Rug Rumble)
> "2018 — 2020" · "Building the conditions that let a creative studio do its best work" · "Studio rituals, hiring, and the operating system behind the work." · "Creative Director · Slangbusters" (Slangbusters, external)
> "3 projects during Slangbusters" (sheet trigger)
> "Marks and Symbols Made" / "Names Coined" / "W.I.P" (foot nameplates)

## Mobile — case-study sheet {#mobile-sheet}

Source: [`CasesSheet.tsx`](../../app/(works)/all/components/CasesSheet.tsx).

> "Slangbusters" (header) · "2018 — 2020" (span)
> The three studies (titles + "Creative Director · {company}" + years 20/19/18), as above.

_(The Work Essay redesign dropped the Visual tab's own copy chrome — the `ShowcaseSection` scroll cue ("SHOWCASE"), the `HeaderBlock` ("Visuals" / "A selection of interfaces, posters, and marks…" / "{n} pieces"), the `Prelude`/`FirstView`/`AboutCard` intro, and later the `HintRow` ("click to focus · esc to dismiss" + its timed swap to the filter). The invitation card is the intro now; the Showcase grid renders directly under the `FilterStrip`. Those components were deleted.)_

## Showcase — FilterStrip (category filter) {#showcase-filter}

> "All" / "Interface" / "Brand"
> — [`FilterStrip.tsx`](../../app/(works)/all/components/Showcase/FilterStrip.tsx). Three mono-caption options heading the grid; the active one reads as a pressed keycap. The control is labelled "Filter pieces by category" (sr-only via `aria-label`).

## Showcase — pieces (10) {#showcase-pieces}

Source of truth for the four copy strings (`type`, `title`, `What is it`, `Notice`): [`Showcase/card-copy.ts`](../../app/(works)/all/components/Showcase/card-copy.ts) → `CARD_COPY` (overlaid onto `PIECES` by id; structural fields — `project`, `year`, `href`, etc. — stay in [`data.ts`](../../app/(works)/all/components/Showcase/data.ts)). Copy is editable via the dev lab (`app/_dev-tools/card-copy-lab/`). Each piece shows the spec-note copy (`What is it` / `Notice`, plus a `…from {project} ↗` foot link) when its tile is opened. Pieces below are listed in `num` order (DOM/reading order, 1 → 10).

### 01 · Cardstack (Evolution of a playing card) {#showcase-cardstack}

> "Evolution of a playing card" / "Game Card UX" / "Rug Rumble" / "2024"

> "A set showing how a PvP game card layout evolved"  *(What is it)*
> "The visual chunking is kept such that the card can be skimmed easily"  *(Notice)*
> "…from Rug Rumble ↗"  *(foot link → `/rr`)*

### 02 · Interface-RR (Vitals gauge for a PvP game) {#showcase-interface}

> "Vitals gauge for a PvP game" / "Game Interface" / "Rug Rumble" / "2024"

> Toggle labels (on-tile control): "Clean" / "UI Map"

> "Snapshot of card being played and its effects on the player"  *(What is it)*
> "The health bar separators make it easy to visually get an idea of the health without reading the numbers"  *(Notice)*
> "…from Rug Rumble ↗"  *(foot link → `/rr`)*

### 03 · Site-Nav (Site nav for the portfolio) {#showcase-subway}

> "Site nav for the portfolio" *(short label: "Site Nav")* / "Wayfinding Navigation" / "This site" / "2026"

> "A navigation marker that works as a menu toggle + page title"  *(What is it)*
> "Inspired from the MagSafe snap, this one snaps to its neighbour"  *(Notice)*
> "…from This site"  *(foot — plain credit text; no link, this site IS the project)*

### 04 · Paymaster (Payments infra dashboard) {#showcase-paymaster}

> "Payments infra dashboard" / "Developer Dashboard" / "Biconomy" / "2024"

> Toggle labels (on-tile control): "Before Audit" / "After Audit"

> "A DevX comparison before and after applying a UX Audit"  *(What is it)*
> "The content in both the versions is same. Try it out using the switch."  *(Notice)*
> "…from Biconomy ↗"  *(foot link → `/biconomy`)*

### 05 · Multiverse (Multiverse theory) {#showcase-multiverse}

> "Multiverse theory" / "Design Intervention" / "Biconomy" / "2023"

> "A poster talking about the silos within the workplace"  *(What is it)*
> "The copy and metaphor are done to just hint at the issue instead of shouting about it"  *(Notice)*
> "…from Biconomy ↗"  *(foot link → `/biconomy`)*

### 06 · Startooth (Pattern) {#showcase-startooth}

> "Startooth" / "Tessellation Pattern" / "My sketchbook" / "2026"

> "My take on the classic Houndstooth"  *(What is it)*
> "The trapezoids are sliced by diamonds and stars to form edible barfis"  *(Notice)*
> "…from My sketchbook"  *(foot — plain credit text; no link, sketchbook isn't routable)*

### 07 · Furrmark {#showcase-furrmark}

> "Furrmark" / "Brand Identity" / "Aleyr" / "2021"

> "A brandmark for a pet care company"  *(What is it)*
> "Distillation of the face your pet makes when you put your hand on their head into a mark"  *(Notice)*
> "…from Aleyr ↗"  *(foot link → `https://niharbhagat.com/work/aleyr/`)*

### 08 · Posters (Mic Testing series) {#showcase-posters}

> "Standup comedy posters" / "Posters" / "Mic Testing" / "2017"

> "Posters for social-media marketing of open mics"  *(What is it)*
> "Studies in the Swiss Grid that is running through them"  *(Notice)*
> "…from Mic Testing ↗"  *(foot link → `https://www.behance.net/gallery/47138397/Open-Mic-Series-Poster-Collection`)*

Poster alt text — [`Showcase/media/PosterStack.tsx`](../../app/(works)/all/components/Showcase/media/PosterStack.tsx). Four posters, shuffled per page load:
> "Comedy poster — Falah Faisal" / "Comedy poster — Cutting Comedy" / "Comedy poster — Cutting 2" / "Comedy poster — The Gong Show"

### 09 · Job Chip (Connektion components) {#showcase-dual}

> "Job chip" *(short label: "Components")* / "Job Platform UI" / "Connektion" / "2021"

> "Status indicators for tracking job stages"  *(What is it)*
> "Each stage is made to be understood at a glance via the position and length of the progress bar"  *(Notice)*
> "…from Connektion ↗"  *(foot link → `https://niharbhagat.com/work/connektion/`)*

### 10 · Ecochain UI {#showcase-ecochain}

> "Ecochain" / "B2B SaaS" / "Ecochain" / "2019"

> Toggle labels (on-tile control): "Interface" / "Status icons"

> "Interface for a textile trading platform"  *(What is it)*
> "Traders can easily segregate the buying and selling functions by the way information is organized"  *(Notice)*
> "…from Ecochain ↗"  *(foot link → `https://slangbusters.com/work/ecochain/`)*

## Showcase — RR card captions (cardstack tile, inside `Showcase/media/CardstackFan.tsx`) {#showcase-cardstack-captions}

Five card iterations. Caption renders below the selected card.

> "The very first hand-drawn concept" *(v1)*
> "Added energy and name" *(v2)*
> "Added conditional effects" *(v3)*
> "First printed version" *(v4)*
> "Final digital design" *(v5)*

## Showcase — controls aria-labels {#showcase-controls-aria}

> "Play" / "Pause"  — [`PauseButton.tsx`](../../app/components/PauseButton/PauseButton.tsx). aria-label flips with state.
> "Open details" / "Close details"  — [`ShowcasePiece.tsx`](../../app/(works)/all/components/Showcase/ShowcasePiece.tsx). Caption-dot toggle.
> `Flow {n} of 3` — [`ShowcasePiece.tsx`](../../app/(works)/all/components/Showcase/ShowcasePiece.tsx) paymaster page chip, templated.

## Notes

- Entry meta string is templated: `"{role} • {company} • {year}"` rendered via separate spans; the bullet `•` comes from the `&bull;` HTML entity.
- Year labels around the timeline bars use `Q4&bull;25` literal markup; preserved here as "Q4•25".
- Archive entries link to external `niharbhagat.com` / `slangbusters.com` URLs.
- Showcase `What is it` / `Notice` lines are a curatorial pair — a one-line description of the artefact + a one-line "what to pay attention to." Tone is plain, sentence case, **no trailing fullstop**. Keep each line short enough to fit on two lines at the card's 360 px width.
- Per-piece `year` (e.g. "2024", "2021") shows in the spec note's foot-end, replacing the earlier zero-padded catalogue serial ("No. 01" — "No. 10"). The `num` field is retained on each entry in `data.ts` as a stable narrative serial for cross-referencing, but no longer renders.
- Index-card foot: `"…from {project}"` — rendered as a link (with `IconExternalLink`) when `href` is defined, plain text when `href` is omitted (currently: Site-Nav, Startooth — both reference unlinkable sources).
