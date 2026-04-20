# Backlog

Flags to work on later. Parked during refining-phase sessions; not blocking anything shipped.

## Image loading pass (site-wide)

Raster assets in `public/images/` are ~47 MB (20 MB `/biconomy`, 27 MB `/rr`), all PNG/JPG — no WebP/AVIF. Mixed consumption: `next/image` in three files, raw `<img>` in RR game components, direct `url()` in CSS for textures.

**Planned approach (option A from the proposal):** convert remaining `<img>` usages to `next/image`, enable `images.formats: ['image/avif','image/webp']` in `next.config`. Stamp CSS `url()` backgrounds stay as-is. Expected ~60–80% byte reduction on modern browsers, no layout shift.

**Defer to later:** responsive art-direction via `<picture>` for 2–4 hero posters (e.g. `multiverse_poster.png` @ 2.7 MB) — bundle into the `/biconomy` crafted-lite pass, not a blanket conversion.

**Watch:** RR deck cards + hand-deck-fan are Framer-Motion transformed — convert with `fill` layout over sized parents. Check `app/(works)/rr/ANOMALIES.md` before touching.
