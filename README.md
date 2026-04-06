# niharya / portfolio

Nihar Bhagat's portfolio. → [nihar.works](https://nihar.works)

Each project page is a composed reading environment — not a template filled with content, but a structure built around the work. The goal is to make the work feel like it was designed to be read, not displayed.

---

## ◎ Current focus

`/biconomy` is the proving ground for the house system. It is the first full project page, and the one where all structural and interaction patterns are being established. Three more pages are staged for migration once Biconomy is locked.

---

## ◈ Stack

- **Next.js App Router** — infrastructure, not the product
- **React** — component authoring; no state management library
- **Framer Motion** — spring-driven flyout animations in the nav system
- **CSS** — route-local stylesheets; a minimal shared primitive layer (`globals.css`)
- **Vanilla JS** — any route-specific behavior that doesn't need React
- No Tailwind. No component libraries. No build complexity beyond what Next requires.

---

## ◇ Working principles

**Next.js is infrastructure.** The stack identity is the design, not the framework.

**Authored, not templated.** Each route is composed by hand. Shared primitives exist for genuine reuse — not to impose structure.

**Preserve relational composition.** The real risk in porting from the reference source is losing docking relationships — notes that feel tucked to evidence, markers that feel flush rather than placed nearby. This is the primary quality signal.

**8 → 4 → 2.** Spatial increments follow 8px as the base unit, with 4px and 2px for tight relationships. Avoid arbitrary values unless they are doing real compositional work.

**Don't abstract early.** Keep logic local. A route-specific module is always preferred over a shared abstraction that hasn't earned its place.

---

## ⊞ Repo structure

```
app/
  biconomy/               — Active project route
    nav/                  — Navigation system (ChapterMarker, ProjectMarker, ExitMarker)
    components/           — Route-specific components (Sheet, Intro, Flows, etc.)
    biconomy.css          — Route styles
    page.tsx              — Route entry
    layout.tsx            — Route layout (imports nav.css, font gate script)
  globals.css             — Shared design tokens and typography primitives
  layout.tsx              — Root layout (font links, global imports)

reference/
  88g-source/             — Original Biconomy source (Next.js / React / Tailwind)
  portfolio-vanilla/      — Intermediate vanilla translation reference

public/                   — Static assets

CLAUDE.md                 — Working contract for Claude Code sessions
```

---

## ↗ Reference sources

`reference/88g-source`
↳ The original Biconomy implementation from `akshar-dave/88g`. Use this to understand the intended experience and recover behaviors that haven't been ported yet. Do not port the framework identity — port the reading experience.

`reference/portfolio-vanilla`
↳ An intermediate vanilla translation. Use as a structural reference when recovering layout or interaction patterns.

---

## § Vocabulary

Terms used consistently across code, CSS, and conversation:

| Term | Meaning |
|---|---|
| **Workbench** | The outermost layout container for a project page. Sets the horizontal bounds. |
| **Sheet Stack** | The vertical sequence of sheets on a project page. Gap triples when a tray is open. |
| **Sheet** | A single paper-like chapter unit. Contains a nav sled and its section content. |
| **Mat** | The textured surface on a sheet. Grid pattern, subtle. |
| **Project Marker** | Fixed left pill. Shows project name. Measures its right edge for nav alignment. |
| **Chapter Marker** | Sticky pill per sheet. Shows chapter title and year. Opens the chapter tray on dock. |
| **Exit Marker** | Fixed right pill. Links back to the project index. |
| **Nav Sled** | Absolute-positioned wrapper inside each sheet that constrains the sticky chapter marker's release point. |
| **Tray** | The flyout menu that opens from a docked Chapter Marker. Lists all chapters for navigation. |
| **Proof Artifact** | Real evidence embedded in a section — screenshot, embed, demo, sketch. Not a placeholder. |
| **Note Rail** | Side-aligned annotation column. Notes should feel docked to their evidence, not parked beside it. |
| **Memo Card** | A small card-format component for compact structured information. |
| **Deck / Card Stack** | A stacked set of cards that can be revealed or browsed. |
| **Surface** | A distinct material layer within a sheet — elevated, inset, or textured differently from the mat. |

---

## ▷ Development

```bash
npm install
npm run dev     # starts at localhost:3000
```

Active routes: `/biconomy`

---

## ↻ Workflow

Work route by route. Don't touch shared layers unless the route work makes it unavoidable — and flag it explicitly when you do.

Use the references before making visual judgements. The primary quality signal is whether elements feel docked and tucked, not whether they are technically correct. Read `CLAUDE.md` before starting any session — it carries the working contract, the active diagnosis, and the session-start rules.

---

## ◉ Commit conventions

Messages are imperative, scoped, and short. One sentence. No period.

**Verbs:** `add` · `update` · `fix` · `remove` · `move` · `rename` · `refactor` · `extract`

```
add ExitMarker with Google Sans Flex exit label
rename ChapterPill → ChapterMarker across nav module
extract nav styles into nav/nav.css
fix scroll alignment after tray close using data-navigating
remove dead flyout keyframes from biconomy.css
```

Scope to what changed. Don't describe the intent — describe the action.

<br />

...and now...

ॐ
