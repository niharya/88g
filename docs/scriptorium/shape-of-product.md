# Scriptorium — shape-of-product

Verbatim copy reference. Edit the source files, not this doc — run `/prepush` to surface drift.

**Sources:** `app/shape-of-product/page.tsx`, `app/shape-of-product/components/*.tsx`

---

## Heading (sr-only) {#sr-heading}

> "Shape of Product"
> — [`page.tsx:22`](../../app/shape-of-product/page.tsx#L22)

## Chunk 1 — lede {#chunk-1}

> "You are building tools for people who build tools."
> — [`page.tsx:29`](../../app/shape-of-product/page.tsx#L29)

## Chunk 2 — body {#chunk-2}

> "Most of my work has been in systems where design sits close to infrastructure."
> — [`page.tsx:36-37`](../../app/shape-of-product/page.tsx#L36)

> "Works like *developer dashboards* and *prototypes + stories* that make deep infra understandable."
> — [`page.tsx:39-67`](../../app/shape-of-product/page.tsx#L39)

Inline chip labels:

> "developer dashboards"
> — [`page.tsx:50`](../../app/shape-of-product/page.tsx#L50)

> "Open the UX Audit chapter from Biconomy in a new tab" (aria-label)
> — [`page.tsx:51`](../../app/shape-of-product/page.tsx#L51)

> "prototypes + stories"
> — [`page.tsx:62`](../../app/shape-of-product/page.tsx#L62)

> "Open the Demos chapter from Biconomy in a new tab" (aria-label)
> — [`page.tsx:63`](../../app/shape-of-product/page.tsx#L63)

## Chunk 3 — actors {#chunk-3}

> "I tend to work well in cultures (aka systems) where multiple actors — *engineers, users, protocols* — are influencing each other heavily and the shape of product is open."
> — [`page.tsx:74-78`](../../app/shape-of-product/page.tsx#L74)

## Actor stickers {#actor-stickers}

> "engineers"
> — [`ActorStickers.tsx:30`](../../app/shape-of-product/components/ActorStickers.tsx#L30)

> "users"
> — [`ActorStickers.tsx:35`](../../app/shape-of-product/components/ActorStickers.tsx#L35)

> "protocols"
> — [`ActorStickers.tsx:40`](../../app/shape-of-product/components/ActorStickers.tsx#L40)

## RoleApproachStack — group label {#stack-group}

> "Roles and approach" (tablist aria-label)
> — [`RoleApproachStack.tsx:57`](../../app/shape-of-product/components/RoleApproachStack.tsx#L57)

## Roles card {#roles-card}

> "Roles" (tab label)
> — [`RoleApproachStack.tsx:77`](../../app/shape-of-product/components/RoleApproachStack.tsx#L77)

> "My role in those environments has been to:"
> — [`RoleApproachStack.tsx:93`](../../app/shape-of-product/components/RoleApproachStack.tsx#L93)

### Roles list item 1 {#roles-item-1}

> "Make the system legible"
> — [`RoleApproachStack.tsx:98`](../../app/shape-of-product/components/RoleApproachStack.tsx#L98)

> "So decisions can be made without guesswork"
> — [`RoleApproachStack.tsx:99`](../../app/shape-of-product/components/RoleApproachStack.tsx#L99)

### Roles list item 2 {#roles-item-2}

> "Prototype flows early"
> — [`RoleApproachStack.tsx:104`](../../app/shape-of-product/components/RoleApproachStack.tsx#L104)

> "So behavior is tested before it's abstracted"
> — [`RoleApproachStack.tsx:105`](../../app/shape-of-product/components/RoleApproachStack.tsx#L105)

### Roles list item 3 {#roles-item-3}

> "Work closely with engineers"
> — [`RoleApproachStack.tsx:110`](../../app/shape-of-product/components/RoleApproachStack.tsx#L110)

> "Not as handoff, but as shared problem-solving"
> — [`RoleApproachStack.tsx:111`](../../app/shape-of-product/components/RoleApproachStack.tsx#L111)

### Roles list item 4 {#roles-item-4}

> "Reduce complexity without flattening it"
> — [`RoleApproachStack.tsx:116`](../../app/shape-of-product/components/RoleApproachStack.tsx#L116)

> "Especially in technical contexts"
> — [`RoleApproachStack.tsx:117`](../../app/shape-of-product/components/RoleApproachStack.tsx#L117)

## Approach card {#approach-card}

> "Approach" (tab label)
> — [`RoleApproachStack.tsx:143`](../../app/shape-of-product/components/RoleApproachStack.tsx#L143)

> "Approach" (sr-only heading)
> — [`RoleApproachStack.tsx:152`](../../app/shape-of-product/components/RoleApproachStack.tsx#L152)

> "Start with ambiguity."
> — [`RoleApproachStack.tsx:153`](../../app/shape-of-product/components/RoleApproachStack.tsx#L153)

> "Stay with it long enough to understand the forces."
> — [`RoleApproachStack.tsx:154`](../../app/shape-of-product/components/RoleApproachStack.tsx#L154)

> "Then shape it into something that can actually be built and used."
> — [`RoleApproachStack.tsx:155`](../../app/shape-of-product/components/RoleApproachStack.tsx#L155)

## Sign-off card {#sign-off}

> "About the author" (aside aria-label)
> — [`SignOffCard.tsx:32`](../../app/shape-of-product/components/SignOffCard.tsx#L32)

> "Settle the card" (aria-label, tilted state)
> — [`SignOffCard.tsx:45`](../../app/shape-of-product/components/SignOffCard.tsx#L45)

> "I’m Nihar. I’ve designed brands, cultures, and products."
> — [`SignOffCard.tsx:48-50`](../../app/shape-of-product/components/SignOffCard.tsx#L48)

> "What I was really doing was designing systems"
> — [`SignOffCard.tsx:52`](../../app/shape-of-product/components/SignOffCard.tsx#L52)

Greeting (templated, shared with landing — see `landing.md` → `#hero-greeting`):

> "Good morning" / "Good afternoon" / "Good evening"
> — [`SignOffCard.tsx:47`](../../app/shape-of-product/components/SignOffCard.tsx#L47), via `app/lib/greeting.ts`

## SopNavRow {#sop-nav-row}

> "Shape of Product"
> — [`SopNavRow.tsx:26`](../../app/shape-of-product/components/SopNavRow.tsx#L26)

> "2026" (sublabel)
> — [`SopNavRow.tsx:27`](../../app/shape-of-product/components/SopNavRow.tsx#L27)

> "Shape of Product — you are here" (aria-label)
> — [`SopNavRow.tsx:28`](../../app/shape-of-product/components/SopNavRow.tsx#L28)

## Notes

- The "Nihar" home link in SopNavRow is shared `NiharHomeLink` — copy logged in `shared.md` → `#nihar-home`.
- The cards-stack uses `--dur-slide` motion; only the active card's content is announced to AT.
