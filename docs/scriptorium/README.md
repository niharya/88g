# Scriptorium

A verbatim copy reference for every user-visible word in the portfolio. Named after the medieval room where scribes copied manuscripts — the same role this folder plays for the site.

This is **a reference, not a source of truth.** The code is the source. The Scriptorium exists so you can ctrl-F a phrase, find where it lives, and edit it at the source.

## Why this exists

The portfolio's copy is spread across `.tsx` files, data modules (`marks.ts`, `flowSlides.ts`, `chapters.ts`), and shared components. Hunting down a specific line meant guessing which file to grep. The Scriptorium collapses that into one searchable folder.

## What's in here

One file per route, flat:

- [`landing.md`](./landing.md) — `app/page.tsx`
- [`marks.md`](./marks.md) — `app/marks/`
- [`shape-of-product.md`](./shape-of-product.md) — `app/shape-of-product/`
- [`biconomy.md`](./biconomy.md) — `app/(works)/biconomy/`
- [`rr.md`](./rr.md) — `app/(works)/rr/`
- [`selected.md`](./selected.md) — `app/(works)/selected/`
- [`resume.md`](./resume.md) — `app/resume/`
- [`privacy.md`](./privacy.md) — `app/privacy/`
- [`not-found.md`](./not-found.md) — `app/not-found.tsx`
- [`shared.md`](./shared.md) — Footer, nav, anything from `app/components/` that carries copy
- [`meta.md`](./meta.md) — All site metadata: titles, descriptions, Open Graph, Twitter cards, canonical URLs, OG images, JSON-LD structured data, robots, sitemap. Lives in its own file because SEO/social is a different mental model from reading copy. **Per-route mds intentionally do not carry a `## Metadata` section** — all head-tag copy (title, description, OG, Twitter, JSON-LD, alt text on OG images) lives in `meta.md` only. Per-route mds catalog reading-copy (body text, chapter labels, captions, sr-only headings, iframe titles, aria-labels) — anything that renders inside the page, not in `<head>`. Don't reflexively add a Metadata block back; if you're editing head-tag copy, edit `meta.md`.

## How to read an entry

Every copy fragment has three things:

1. **Verbatim text** in a blockquote — exactly as it appears in source, including curly quotes, em-dashes, casing.
2. **A file:line link** for jumping to source (`page.tsx:42` → `../../app/.../page.tsx#L42`).
3. **A stable anchor** on the section heading (`{#hero-headline}`) that survives line-number drift.

Anchors are the long-lived references. Line numbers will go stale the moment you edit — that's a known cost. The `/release` check (see below) catches drift and prompts a refresh.

## Anchor convention

- Kebab-case
- Section-prefixed: `hero-`, `intro-`, `flows-`, `outro-`, `footer-`
- Descriptive suffix: `-eyebrow`, `-headline`, `-body`, `-caption`, `-cta`, `-callout`
- Enumerated for lists/slides: `flow-slide-1`, `flow-slide-2`
- Unique within file

When linking to a fragment from elsewhere (anomalies, design docs, plans), prefer the anchor over the file:line.

## Rules

1. **Don't paraphrase, normalize, or "clean up" copy** in these files. The point is that they match the source verbatim. If the source uses `'` rather than `’`, the entry uses `'`.
2. **Don't edit copy here to change the site.** Edit the source file. The Scriptorium is downstream.
3. **Update after copy changes.** When a copy edit lands, refresh the affected route's MD. `/release` (Phase A scriptorium-drift check) will flag drift candidates.
4. **No subfolders.** Keep this folder flat. New routes get a new file, not a new directory.
5. **Templated copy** (e.g. `{mark.name}, {mark.year}`) is shown as a template — placeholders preserved, not interpolated.
6. **Randomized or generated copy** (arrays the site picks from per-load) is enumerated; the randomization is noted in the file's "Notes" section.

## Adding a new route

1. Create `docs/scriptorium/<route>.md` following the format of any existing entry.
2. Top of file: `# Scriptorium — <route>`, the source-files list, the standard "Edit the source…" note.
3. Group by visible section, top to bottom. Use the route's own chapter/section names where they exist (`nav/chapters.ts` is usually the goldmine).
4. Add the new file to the index above.

## Caveats

- **Line numbers drift.** Anchors don't. If you're referencing a fragment from a long-lived doc, use the anchor.
- **Alt text counts as copy.** It's catalogued.
- **`aria-label` is catalogued only when it adds information beyond visible text.** Aria that mirrors a visible label is noted in passing, not duplicated.
- **The Scriptorium does not track CSS-injected text** (`content: '...'` in stylesheets). If you add such copy, log it manually.

## Related

- [`LIBRARY.md`](../../LIBRARY.md) — catalog of shared *primitives* (this is the equivalent for *words*)
- [`docs/vocabulary.md`](../vocabulary.md) — design-language ↔ code-identifier mapping
- `.claude/skills/release/SKILL.md` — the push ritual; its Phase A scriptorium-drift check flags copy drift (`/prepush` is a deprecated alias)
