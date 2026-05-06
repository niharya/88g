# /shape-of-product — design intent

This file captures the **concept, philosophy, and behavior spec** of the
`/shape-of-product` route. The "why" document — not a tour of the code,
not a changelog, not a list of anomalies. For anomalies and don't-touch
items see [`ANOMALIES.md`](./ANOMALIES.md). For project-level rules see
[`CLAUDE.md`](../../CLAUDE.md).

---

## Concept

`/shape-of-product` is an **editorial musings page** Nihar uses when
applying to companies whose work he cares about (Figma, Basecamp, and
similar craft-conscious places). It is **not** a case study and not a
section of the portfolio's primary work; it sits alongside the
`(works)/` routes as a separate editorial artifact — the way an essay
sits alongside a body of work without competing with it.

The reader's job is to read. There's no scroll-driven choreography, no
auto-advance, no chapter navigation. The page is a single editorial
column: prose, two cards, a sign-off.

## Why it lives outside `(works)/`

The route is at `app/shape-of-product/`, not `app/(works)/shape-of-product/`.
The `(works)` shell is built for sheet-stack case-study reading —
workbench frame, chapter markers, dominance-snap, TransitionSlot. None
of those serve a musings page. The route mirrors `/marks`'s shell shape:
pure canvas, no workbench, no `<Sheet>`.

`CrossShellVeil` is mounted defensively (the `CrossShellEntryFader` half)
in case a future entry link from another route uses `useCrossShellNav`
to set up a veil — the fader is a no-op until a veil is actually in
flight.

---

## Page anatomy

The route is one editorial column, top to bottom:

```
SopNavRow                 (Nihar back-link + "Shape of Product" static marker)
                          fixed top-center, follows the reader as they scroll

Lede                      Chunk 1: opening line
                          Divider
                          Chunk 2: the "what I work on" two-line statement

[big breath]

Tend                      Chunk 3: the "where I tend to work well" sentence
                          with three actor stickers (engineers / users /
                          protocols) inline

Roles ↔ Approach stack    Two notes-rail-style cards z-stacked. Roles is
                          olive (bips-notes idiom from /biconomy), Approach
                          is yellow/terra (rules-rail idiom from /rr).
                          Vertical tab on each card's right edge with a
                          flippable arrow icon. Click the inactive tab → the
                          two swap.

[big breath]

SignOffCard               A blue-toned card mirroring landing's hero card.
                          Closing identity artifact: time-of-day greeting +
                          "I'm Nihar..." headline + sub. Lands tilted 2°,
                          click to settle to 0° — small one-way whimsy.
```

---

## Editorial register

- **Voice:** first-person, calm, specific. Not pitched. The page reads
  as something Nihar wrote, not as a cover-letter-shaped surface.
- **Density:** generous. The whole point of the layout is to give the
  prose room to be read without competing UI.
- **Motion:** quiet. The only motion the reader sees is the chip
  hover-icon reveal, the actor sticker click-jitter, the stack swap,
  and the sign-off card's one-way settle. No scroll choreography, no
  reveal-on-intersection, no auto-anything.

---

## Reuse + originality

The page is built almost entirely from existing primitives:

- **`<NavMarker>`** for the nav pair and the inline chapter chips.
- **`<NiharHomeLink>`** (promoted from `/selected`) for the back link.
- **`<LabelSticker>`** for the actor stickers (first live consumer of
  the primitive).
- **`<IconExternalLink>`** for the chapter-chip icons.
- **`<getGreeting>`** util for the sign-off card's time-of-day greeting.
- **The bips-notes-rail visual idiom** for the Roles card.
- **The rr-rules-rail visual idiom** for the Approach card.
- **The landing hero-card visual** (recolored to biconomy blue-note
  palette) for the sign-off card.

Net-new authoring is mostly editorial (the prose) and route-local CSS
(spacing rhythm, the stack toggle behavior, the sign-off card's
click-to-settle interaction).

---

## What this page is not

- Not a portfolio piece. The case studies in `(works)/` are the work;
  this is commentary about the work.
- Not a static landing page. It has interactive affordances (chapter
  links, stack toggle, settle-on-click), but they're quiet, not
  load-bearing for comprehension.
- Not a contact page. There's no form, no CTA cluster, no email field.
  If the reader wants to reach out, the application context (the email
  Nihar sent that linked here) is the channel.
- Not part of the case-study reading flow. The chapter chips are
  inline links, not breadcrumbs — they take the reader OUT into a
  specific chapter of `/biconomy`, not into a sequenced reading path.
