# Backlog

Flags to work on later. Parked during refining-phase sessions; not blocking anything shipped.

## /biconomy — crafted-lite second pass

First pass shipped across every chapter (logged in [`app/(works)/biconomy/ANOMALIES.md`](../app/(works)/biconomy/ANOMALIES.md) → "Responsive anomalies"). Four deferred items for a second pass:

1. **`--biconomy-card-inset-x` token.** Intro blue, BIPs card, and Demos surfaces share a horizontal inset expressed as literals. Deriving one route-local token would make the "one family" gutter explicit and shorten breakpoint edits. Reference `/rr`'s `--rr-card-inset-x`.
2. **Full mat-bleed (Shape 12).** Only first-mat top bleed applied (`margin-top: calc(-1 * var(--workbench-pad-y))`). Left/right mat-bleed not done — biconomy mats stay gutter-padded. Revisit alongside the nav-sled `left` override (`/rr` precedent).
3. **Situational Awareness — chip-row + prose audit.** Only the photostack size was touched. `.sa__prose` and `.multiverse__chip-row` reuse may want spacing tweaks at 375px. Review pass, not a re-author.
4. **API tweet-card label wrap verification.** `.api__tweet-label` got `white-space: normal` on mobile so it can wrap. If the tweet-card is ever reused outside API, long labels may need the same treatment.
