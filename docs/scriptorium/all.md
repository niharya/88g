# Scriptorium — all (Works)

Verbatim copy reference for the works hub at **`/all`** (the "Work Essay"; internal codenames "bench"/"selected"). Edit the source files, not this doc — run `/release` to surface drift.

**Sources:** `app/(works)/all/page.tsx`, `app/(works)/all/components/Essay/*.tsx` (invitation + ticket), `app/(works)/all/components/*.tsx` (Longform: Timeline + Archive), `app/(works)/all/components/Showcase/*` (Visual tab).

The route is a single morphing surface: an **invitation card** (manifesto poem) footed by a **ticket** that docks into a navbar on scroll, switching between the **Longform** tab (Timeline + Archive) and the **Visual** tab (Showcase grid).

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

## Invitation card — watermark {#card-watermark}

Edge-split Pinyon Script ghost behind the card (decorative; `aria-hidden`).

> "Product" / "Designer"
> — [`Essay/InvitationCard.tsx:40-41`](../../app/(works)/all/components/Essay/InvitationCard.tsx#L40)

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

The letterpress ticket footing the card; docks into a navbar on scroll. Showcase (Visual) is the default tab.

> "browse in two ways" (eyebrow)
> — [`Essay/Ticket.tsx:28`](../../app/(works)/all/components/Essay/Ticket.tsx#L28)

> "Visual" (tab title) / "showcase" (sub)
> — [`Essay/Ticket.tsx:43-44`](../../app/(works)/all/components/Essay/Ticket.tsx#L43)

> "Longform" (tab title) / "case studies" (sub)
> — [`Essay/Ticket.tsx:63-64`](../../app/(works)/all/components/Essay/Ticket.tsx#L63)

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

## Archive toggle {#archive-toggle}

> "Works from the previous portfolio" (desktop)
> — [`Timeline.tsx:261`](../../app/(works)/all/components/Timeline.tsx#L261)

> "Previous portfolio" (mobile)
> — [`Timeline.tsx:262`](../../app/(works)/all/components/Timeline.tsx#L262)

> "2018–22" (sublabel)
> — [`Timeline.tsx:265`](../../app/(works)/all/components/Timeline.tsx#L265)

## ArchivePanel — entries (data) {#archive-entries}

### Connektion (2021) {#archive-connektion}

> "Finding the real product hidden inside the client brief"
> — [`ArchivePanel.tsx:41`](../../app/(works)/all/components/ArchivePanel.tsx#L41)

> "Product Designer"
> — [`ArchivePanel.tsx:42`](../../app/(works)/all/components/ArchivePanel.tsx#L42)

> "Connektion"
> — [`ArchivePanel.tsx:43`](../../app/(works)/all/components/ArchivePanel.tsx#L43)

> "2021"
> — [`ArchivePanel.tsx:44`](../../app/(works)/all/components/ArchivePanel.tsx#L44)

### Aleyr (2020) {#archive-aleyr}

> "Finding the thin line between pet ownership and pet parenting"
> — [`ArchivePanel.tsx:48`](../../app/(works)/all/components/ArchivePanel.tsx#L48)

> "Creative Director"
> — [`ArchivePanel.tsx:49`](../../app/(works)/all/components/ArchivePanel.tsx#L49)

> "Aleyr"
> — [`ArchivePanel.tsx:50`](../../app/(works)/all/components/ArchivePanel.tsx#L50)

> "2020"
> — [`ArchivePanel.tsx:51`](../../app/(works)/all/components/ArchivePanel.tsx#L51)

### Ecochain (2019) {#archive-ecochain}

> "Using the logic of a real desk to shape a digital trading workspace"
> — [`ArchivePanel.tsx:56`](../../app/(works)/all/components/ArchivePanel.tsx#L56)

> "Creative Director"
> — [`ArchivePanel.tsx:57`](../../app/(works)/all/components/ArchivePanel.tsx#L57)

> "Ecochain"
> — [`ArchivePanel.tsx:58`](../../app/(works)/all/components/ArchivePanel.tsx#L58)

> "2019"
> — [`ArchivePanel.tsx:59`](../../app/(works)/all/components/ArchivePanel.tsx#L59)

### Codezeros (2018) {#archive-codezeros}

> "Defining a blockchain company before the category had a clear shape"
> — [`ArchivePanel.tsx:64`](../../app/(works)/all/components/ArchivePanel.tsx#L64)

> "Creative Director"
> — [`ArchivePanel.tsx:65`](../../app/(works)/all/components/ArchivePanel.tsx#L65)

> "Codezeros"
> — [`ArchivePanel.tsx:66`](../../app/(works)/all/components/ArchivePanel.tsx#L66)

> "2018"
> — [`ArchivePanel.tsx:67`](../../app/(works)/all/components/ArchivePanel.tsx#L67)

### Slangbusters (2018) {#archive-slangbusters}

> "Building the conditions that let a creative studio do its best work"
> — [`ArchivePanel.tsx:72`](../../app/(works)/all/components/ArchivePanel.tsx#L72)

> "Creative Director"
> — [`ArchivePanel.tsx:73`](../../app/(works)/all/components/ArchivePanel.tsx#L73)

> "Slangbusters"
> — [`ArchivePanel.tsx:74`](../../app/(works)/all/components/ArchivePanel.tsx#L74)

> "2018"
> — [`ArchivePanel.tsx:75`](../../app/(works)/all/components/ArchivePanel.tsx#L75)

## ArchivePanel — year labels {#archive-years}

> "21" / "20" / "20" / "19" / "18" / "18"
> — [`ArchivePanel.tsx:136, 152, 184, 216, 248, 274`](../../app/(works)/all/components/ArchivePanel.tsx#L136)

## ArchivePanel — entry hint {#archive-hint}

> "opens in new tab"
> — [`ArchivePanel.tsx:128, 170, 202, 234, 266`](../../app/(works)/all/components/ArchivePanel.tsx#L128)

_(The Work Essay redesign dropped the Visual tab's own copy chrome — the `ShowcaseSection` scroll cue ("SHOWCASE"), the `HeaderBlock` ("Visuals" / "A selection of interfaces, posters, and marks…" / "{n} pieces"), and the `Prelude`/`FirstView`/`AboutCard` intro. The invitation card is the intro now; the Showcase grid renders directly under the `HintRow`. Those components were deleted.)_

## Showcase — HintRow {#showcase-hint}

> "click" / "to focus a piece" / "·" / "esc" / "to dismiss"
> — [`HintRow.tsx`](../../app/(works)/all/components/Showcase/HintRow.tsx). The two glyphs `click` and `esc` render as keycap chips; the rest is mono caption.

## Showcase — pieces (10) {#showcase-pieces}

Source of truth: [`Showcase/data.ts`](../../app/(works)/all/components/Showcase/data.ts) → `PIECES`. Each piece carries: title, type, project, year, plus the spec-note copy (`What is it` / `Notice`, plus a `…from {project} ↗` foot link) shown when the tile is opened. Pieces below are listed in `num` order (DOM/reading order, 1 → 10).

### 01 · Cardstack (Evolution of RR Card) {#showcase-cardstack}

> "Evolution of RR Card" / "Layout Design" / "Rug Rumble" / "2024"

> "A series showing how a custom playing-card layout evolved"  *(What is it)*
> "Notice how information is chunked out for easy scanning"  *(Notice)*
> "…from Rug Rumble ↗"  *(foot link → `/rr`)*

### 02 · Interface-RR (Rug Rumble vitals gauge) {#showcase-interface}

> "Interface-RR" / "Game Interface" / "Rug Rumble" / "2024"

> Toggle labels (on-tile control): "Clean" / "UI Map"

> "A vitals gauge for a PvP game"  *(What is it)*
> "Notice how the health bar separators make it easy to read health at a glance"  *(Notice)*
> "…from Rug Rumble ↗"  *(foot link → `/rr`)*

### 03 · Site-Nav (portfolio nav marker) {#showcase-subway}

> "Site-Nav" *(short label: "Site Nav")* / "Wayfinding UI" / "This site" / "2026"

> "A navigation marker that works as a menu toggle + page title"  *(What is it)*
> "Notice how the project and chapter markers snap satisfyingly"  *(Notice)*
> "…from This site"  *(foot — plain credit text; no link, this site IS the project)*

### 04 · Paymaster (UX Audit) {#showcase-paymaster}

> "Paymaster" / "Developer Dashboard" / "Biconomy" / "2024"

> Toggle labels (on-tile control): "Before Audit" / "After Audit"

> "A DevX comparison before and after applying a UX Audit"  *(What is it)*
> "Notice how the content stays the same and only the layout changes across the before and after"  *(Notice)*
> "…from Biconomy ↗"  *(foot link → `/biconomy`)*

### 05 · Multiverse (poster) {#showcase-multiverse}

> "Multiverse" / "Design Intervention" / "Biconomy" / "2023"

> "A poster revealing silos within the workplace"  *(What is it)*
> "Notice how the copy and metaphor just hint at the issue instead of shouting about it"  *(Notice)*
> "…from Biconomy ↗"  *(foot link → `/biconomy`)*

### 06 · Startooth (Pattern) {#showcase-startooth}

> "Startooth Pattern" / "Pattern" / "My sketchbook" / "2026"

> "My take on the classic Houndstooth"  *(What is it)*
> "Notice how the trapezoids are sliced by diamonds and stars to form edible barfis"  *(Notice)*
> "…from My sketchbook"  *(foot — plain credit text; no link, sketchbook isn't routable)*

### 07 · Furrmark {#showcase-furrmark}

> "Furrmark" / "Identity" / "Aleyr" / "2021"

> "A brandmark for a pet care brand"  *(What is it)*
> "Notice how it skips the usual cat-and-dog caricatures to express your love for your pet"  *(Notice)*
> "…from Aleyr ↗"  *(foot link → `https://niharbhagat.com/work/aleyr/`)*

### 08 · Posters (Mic Testing series) {#showcase-posters}

> "Posters" / "Posters" / "Mic Testing" / "2017"

> "Posters for social-media marketing of open mics"  *(What is it)*
> "Notice the Swiss Grid running through them"  *(Notice)*
> "…from Mic Testing ↗"  *(foot link → `https://www.behance.net/gallery/47138397/Open-Mic-Series-Poster-Collection`)*

Poster alt text — [`Showcase/media/PosterStack.tsx`](../../app/(works)/all/components/Showcase/media/PosterStack.tsx). Four posters, shuffled per page load:
> "Comedy poster — Falah Faisal" / "Comedy poster — Cutting Comedy" / "Comedy poster — Cutting 2" / "Comedy poster — The Gong Show"

### 09 · Job Chip (Connektion components) {#showcase-dual}

> "Job Chip" *(short label: "Components")* / "Interface" / "Connektion" / "2021"

> "Status indicators for tracking job stages"  *(What is it)*
> "Notice how each stage reads at a glance through the length of the progress bar"  *(Notice)*
> "…from Connektion ↗"  *(foot link → `https://niharbhagat.com/work/connektion/`)*

### 10 · Ecochain UI {#showcase-ecochain}

> "Ecochain UI" / "Interface" / "Ecochain" / "2019"

> Toggle labels (on-tile control): "Interface" / "Status icons"

> "Interface for a textile trading platform"  *(What is it)*
> "Notice how buying and selling functions are grouped left and right"  *(Notice)*
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
