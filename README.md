# niharya / portfolio

[![Netlify Status](https://api.netlify.com/api/v1/badges/76387b47-eed1-4d9d-b051-20a4b284cce4/deploy-status)](https://app.netlify.com/projects/nihar-works/deploys)

Nihar Bhagat's portfolio. → [nihar.works](https://nihar.works)

Each project page is a composed reading environment — not a template filled with content, but a structure built around the work. The goal is to make the work feel like it was designed to be read, not displayed.

---

## ◎ Status

| Route | Description | Status |
|-------|-------------|--------|
| `/` | Landing page — spectrum color selector, contact form | Shipped |
| `/selected` | Works index — timeline, archive panel, project cards | Shipped |
| `/biconomy` | Biconomy case study — 6 chapters, UX audit through staying anchored | Shipped |
| `/rr` | Rug Rumble case study — card game design and development | Shipped |
| `/marks` | Marks & Symbols — cinematic credits-reel showcase | In build |
| `/names` | Names Coined — naming work showcase | Planned (paper-stage) |

---

## ◈ Stack

- **Next.js 15** (App Router) — infrastructure, not the product
- **React 19** — component authoring; no state management library
- **Framer Motion 12** — spring physics, scroll-linked transforms, presence transitions
- **TypeScript**
- **CSS** — route-local stylesheets + shared token layer (`globals.css`). No Tailwind, no CSS modules, no styled-components.

---

## ◇ Design principles

**Authored, not templated.** Each route is composed by hand. Shared primitives exist for genuine reuse — not to impose structure.

**Elements should feel docked, tucked, or suspended with intention — not placed nearby.** Notes docked to evidence. Cards stacked, not listed. Reveals feel latent and released, not spawned.

**Paper-physical motion.** Everything glides, settles, and lands. One easing curve (`--ease-paper`), long durations (0.5–0.9s), no bounce, no overshoot. Native scroll — no hijacking.

**Four-tier elevation ladder.** `--shadow-flat` · `--shadow-resting` · `--shadow-raised` · `--shadow-overlay` in `globals.css`. Semantic structure (Atlassian), restrained alpha (Radix-style). Off-ladder shadows (insets, motion-state, backlight, pin-mark) are kept separate and annotated where they live.

**Proof artifacts must remain proof artifacts.** Sketches, screenshots, game boards — preserve the feeling of evidence.

**Controls must not lie.** If something looks interactive, it works, or it stops implying interaction.

---

## ⊞ Repo structure

```
app/
  page.tsx                    Landing page
  layout.tsx                  Root layout (fonts, font-gate script)
  globals.css                 Shared design tokens, typography, motion system
  landing.css                 Landing page styles
  _landing/                   Landing page components

  (works)/                    Work route group (persistent shell)
    layout.tsx                Workbench shell (PaperFilter, ShellNav, TransitionSlot)
    ShellNav.tsx              Persistent ProjectMarker + ExitMarker
    TransitionSlot.tsx        Page transitions (DOM ghost-clone + WAAPI)

    selected/                 Works index
    biconomy/                 Biconomy case study
    rr/                       Rug Rumble case study

  marks/                      Marks & Symbols (route lives outside (works) — opts out of workbench shell)

  components/                 Shared design system
    Sheet.tsx                 Paper chapter container + scroll-linked card placement
    PaperFilter.tsx           Paper texture overlay (SVG displacement)
    useReveal.ts              Scroll-triggered entrance animation
    Img/                      Shared image primitive (LQIP + materialize reveal)
    Monostamp.tsx             Monospace stamp (pill + tall variants, four tones)
    SlideInOnNav.tsx          Entrance wrapper tied to page navigation
    NavMarker/                Single nav-marker primitive behind every marker
    CaptionTag/               Caption chip primitive
    icons/                    Hand-rolled animatable SVG icons
    nav/                      Navigation cluster
      ChapterMarker.tsx       Sticky chapter marker (dynamic + static modes)
      ProjectMarker.tsx       Fixed project name marker
      ExitMarker.tsx          Fixed exit marker
      MarkerSlot.tsx          Positioning wrapper + CSS var measurement
      useDockedMarker.ts      Scroll-coupled nav behaviors
      nav.css                 Navigation styles

  _dev-tools/                 Stashed dev utilities (ignored by Next.js routing)

CLAUDE.md                     Working contract for Claude Code sessions
LIBRARY.md                    Catalog of shared primitives
```

---

## § Vocabulary

| Term | Meaning |
|---|---|
| **Workbench** | Outermost layout container for work pages. Sets horizontal bounds. |
| **Sheet Stack** | Vertical sequence of sheets. Gap triples when a tray is open. |
| **Sheet** | A paper-like chapter unit. Contains a nav sled and section content. |
| **Mat** | Textured surface on a sheet. Grid pattern + paper noise. |
| **Project Marker** | Fixed left marker. Shows project name. Cross-fades on route change. |
| **Chapter Marker** | Sticky marker per sheet. Opens the chapter tray on dock. Arrow rotates toward sheet center. |
| **Exit Marker** | Fixed right marker. Links back to the works index. |
| **Nav Sled** | Absolute wrapper inside each sheet. Constrains the sticky marker's release point. |
| **Tray** | Flyout menu from a docked Chapter Marker. Lists all chapters. |
| **Surface** | Elevated material layer within a sheet. Blue card with paper displacement filter. |
| **Proof Artifact** | Real evidence — screenshot, embed, demo, sketch. Not a placeholder. |
| **Note Rail** | Side-aligned annotation column. Notes docked to their evidence. |
| **Section Reveal** | Three-phase entrance: mat glides in → content placed with rotation + shadow → marker docks. |
| **TransitionSlot** | Ghost-clone page transition. Captures DOM snapshot before route swap, animates exit/entrance. |

---

## ▷ Development

```bash
npm install
npm run dev
```

Active routes: `/`, `/selected`, `/biconomy`, `/rr`, `/marks`

---

## ↻ Workflow

Work route by route. Read `CLAUDE.md` before starting any session — it carries the working contract, constraints, and session-start checklist. Each route has a `ANOMALIES.md` with architectural decisions and don't-touch items.

See [`COLOPHON.md`](./COLOPHON.md) for credits — the visual grammar this site borrows from, the libraries it rides on, and the small tools behind specific pieces.

---

## ◉ Commit conventions

Messages are imperative, scoped, and short. One sentence. No period.

**Verbs:** `add` · `update` · `fix` · `remove` · `move` · `rename` · `refactor` · `extract`

```
add ExitMarker with Google Sans Flex exit label
paper-settle motion system: graceful transitions, scroll-linked card placement
landing page: spectrum card, contact form, btn1 hover
fix scroll alignment after tray close using data-navigating
```

---

## ◐ Versioning

Every push bumps the **minor** version in `package.json` by one (`0.1.0` → `0.2.0` …). Tag the tip with `git tag vX.Y.0`.

<br />

...and now...

ॐ
