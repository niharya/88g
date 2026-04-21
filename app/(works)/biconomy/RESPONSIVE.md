# /biconomy — crafted-lite pass: complete

First crafted-lite mobile pass (≤767px) has shipped across every
chapter. Anomalies, don't-touch items, and composition decisions are
logged in `ANOMALIES.md` under "Responsive anomalies (mobile ≤767px)".

| Chapter | Status |
|---|---|
| Intro (UX Audit) | ✓ shipped |
| Flows (UX Audit) | ✓ shipped |
| BIPs | ✓ shipped — reference for Shape 10 accordion |
| Multiverse | ✓ shipped |
| Demos | ✓ shipped |
| API | ✓ shipped |
| Situational Awareness | ✓ shipped (photostack only) |

## Known gaps for a second pass

Not regressions; deferred work.

1. **`--biconomy-card-inset-x` token.** Intro blue, BIPs card, and
   Demos surfaces currently carry a shared horizontal inset expressed as
   literals. Deriving a single route-local token and applying it to all
   consumers would make the "one family" gutter explicit and the
   breakpoint edits shorter. Reference `/rr`'s `--rr-card-inset-x`.
2. **Full mat-bleed (Shape 12).** Only the first-mat top bleed has been
   applied (`margin-top: calc(-1 * var(--workbench-pad-y))`). Left/right
   mat-bleed has not — biconomy mats stay gutter-padded. Revisit
   alongside the nav-sled `left` override (`/rr` precedent).
3. **Situational Awareness — chip-row + prose audit.** Only the photostack
   size was touched this pass. The `.sa__prose` block below the stack
   and the `.multiverse__chip-row` reuse may still want spacing tweaks
   at 375px. Needs a review pass, not a re-author.
4. **API tweet-card label wrap verification.** `.api__tweet-label` got
   `white-space: normal` on mobile so it can wrap. Long labels in other
   routes (none today) could need the same treatment if the tweet-card
   is ever reused — currently it's API-only.

## Not deleted yet

This file stays until those four items clear. Archive or delete once the
second pass lands.
