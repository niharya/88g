# Backlog

Flags to work on later. Parked during refining-phase sessions; not blocking anything shipped.

## Image loading pass (site-wide)

Raster assets in `public/images/` are ~47 MB (20 MB `/biconomy`, 27 MB `/rr`), all PNG/JPG — no WebP/AVIF. Mixed consumption: `next/image` in three files, raw `<img>` in RR game components, direct `url()` in CSS for textures.

**Planned approach (option A from the proposal):** convert remaining `<img>` usages to `next/image`, enable `images.formats: ['image/avif','image/webp']` in `next.config`. Stamp CSS `url()` backgrounds stay as-is. Expected ~60–80% byte reduction on modern browsers, no layout shift.

**Defer to later:** responsive art-direction via `<picture>` for 2–4 hero posters (e.g. `multiverse_poster.png` @ 2.7 MB) — bundle into the `/biconomy` crafted-lite pass, not a blanket conversion.

**Watch:** RR deck cards + hand-deck-fan are Framer-Motion transformed — convert with `fill` layout over sized parents. Check `app/(works)/rr/ANOMALIES.md` before touching.

## /biconomy — crafted-lite second pass

First pass shipped across every chapter (logged in [`app/(works)/biconomy/ANOMALIES.md`](../app/(works)/biconomy/ANOMALIES.md) → "Responsive anomalies"). Four deferred items for a second pass:

1. **`--biconomy-card-inset-x` token.** Intro blue, BIPs card, and Demos surfaces share a horizontal inset expressed as literals. Deriving one route-local token would make the "one family" gutter explicit and shorten breakpoint edits. Reference `/rr`'s `--rr-card-inset-x`.
2. **Full mat-bleed (Shape 12).** Only first-mat top bleed applied (`margin-top: calc(-1 * var(--workbench-pad-y))`). Left/right mat-bleed not done — biconomy mats stay gutter-padded. Revisit alongside the nav-sled `left` override (`/rr` precedent).
3. **Situational Awareness — chip-row + prose audit.** Only the photostack size was touched. `.sa__prose` and `.multiverse__chip-row` reuse may want spacing tweaks at 375px. Review pass, not a re-author.
4. **API tweet-card label wrap verification.** `.api__tweet-label` got `white-space: normal` on mobile so it can wrap. If the tweet-card is ever reused outside API, long labels may need the same treatment.
