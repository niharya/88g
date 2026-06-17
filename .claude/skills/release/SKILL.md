---
name: release
description: The push ritual — runs every hygiene check (including the doc-family census), auto-fixes the mechanical tier silently, batches all judgment calls into ONE ask, then verifies, bumps the minor version, tags, and pushes after explicit confirmation. Use when the user says "release", "push", "ship", or a body of work is done. Pass --check to run checks only (the old /prepush behavior) with no fixes, no bump, no push.
---

# /release — the pre-push ritual

One command, three autonomy tiers. The goal: the user is needed exactly twice — once to triage the judgment batch, once to confirm the push. Everything mechanical happens without asking.

**Modes.** Default = full ritual (Phases A→D). `--check` = Phase A only, report and stop (no fixes, no bump, no push).

---

## Phase A — checks (always run, in order)

**Scope:** unpushed work = `git log origin/main..HEAD --oneline` + `git status --short` + `git diff origin/main --name-status`. Run every check against that combined scope. Each check is conditional — skip silently when its precondition isn't met.

**A0 — Doc-family census.** Run `node scripts/doc-census.mjs`. A failure here is a gate: the court must be whole before anything ships (orphan routes, unpaired digests, dangling family links).

**A1 — Doc claims vs. diff.** For each changed code file, find its owning digest (`CLAUDE.md`) and archive (`ANOMALIES.md`) by walking up the tree. Grep those docs for the changed file's name and for any selector/symbol the diff touches. Flag every doc claim the change may have invalidated — this is the anti-rot check that keeps the archives true.

**A2 — Digest↔archive sync.** If the diff adds or removes `## ` sections in any ANOMALIES.md, verify the sibling CLAUDE.md digest changed in the same scope. Flag unpaired changes.

**A3 — Dead references.** If files were renamed/deleted (`git diff --name-status origin/main | grep -E '^[RD]'`), grep the tracked codebase for lingering mentions of old paths.

**A4 — Token discipline.** Scan added/modified CSS lines for: hex/rgb colors outside the ramp (should be `var(--tone-*)` / ramp steps / `--shadow-*`); quoted `font-family` names (should be `var(--font-*)`); easing literals that aren't `var(--ease-paper)`/`var(--ease-snap)` without a justifying comment; duration literals instead of `--dur-*` tokens without a comment. Net-new values only.

**A5 — Component reuse / promotion.** If the diff touched a route-local components dir (`app/(works)/*/components/`, `app/marks/components/`, `app/shape-of-product/`), check for cross-route twins (same filename or domain word: rail, card, pill, stamp, marquee) → flag promotion candidates. If new files landed under `app/components/`, verify a `LIBRARY.md` entry + index line exists.

**A6 — Anomaly candidates.** Scan the diff for patterns that become load-bearing: non-default spring constants, specific setTimeout delays, pointer-events/aria/inert toggles tied to state, reentry-guard refs, `Math.random()` in JSX, magic CSS values off the documented scales. For each hit, check the owning ANOMALIES.md — flag undocumented ones with a drafted entry.

**A7 — LIBRARY currency.** If the diff touched `app/components/` or any path named in a LIBRARY entry: re-read that entry (grep, don't full-read); flag stale descriptions, consumer lists, or index lines with proposed replacement text.

**A8 — CLAUDE.md drift.** If the session established a new convention, rule, or file future sessions should know → flag a proposed one-line contract edit.

**A9 — Motion vocabulary.** If the diff touched Framer code or CSS keyframes/transitions: flag bounces/overshoots without an ANOMALIES trail; verify `--ease-paper`/`EASE` and `--dur-*` usage.

**A10 — Responsive discipline.** If the diff touched `@media` blocks or added clamp()/vw to a route: verify the route's ANOMALIES has a matching "Responsive anomalies" note for any drop-out or authored deviation.

**A11 — Performance hygiene.** Fonts: new `.woff2` without `localFont`; external font links; `display:` other than `'swap'` or missing fallback chain (`'block'` is banned); changes to the bounded font-gate that remove/raise its cap or skip `.page-boot`; symbols font size jump. Images: new raster >400 KB without `.webp` sibling; anything >1 MB; references to deleted rasters; **manifest freshness** — if anything under `public/images/` or `public/marks/` changed, `app/components/Img/manifest.generated.ts` must be newer (else queue lqip in the AUTO tier). Icons: new ligature names not in the subsetted list (docs/performance.md). Motion tokens: any `--dur-*` value change in globals.css.

**A12 — Scriptorium drift.** If the diff touched copy-bearing files under a catalogued route: changed user-visible string literals must appear verbatim in the matching `docs/scriptorium/<route>.md`. Skip classNames, CSS values, imports, pure copy-moves.

**A13 — Verification status.** If the diff is UI-observable: was the dev server run this session (`preview_list`)? Any console errors? Flag as ↳ reminder.

---

## Phase B — triage tiers

Sort every finding into exactly one tier:

**AUTO — fix silently, report after.** Mechanical, zero-judgment:
- Run `npm run lqip` when the manifest is stale.
- Fix dead internal doc pointers caused by renames *in this diff*.
- Update LIBRARY index lines to match an entry already edited in this diff.
- Sync scriptorium for pure copy *moves* (wording unchanged).

**ASK — batch into ONE message.** Judgment calls, presented together with proposed actions, using the ✓/⚠/↳ format below. The user answers once:
- Promotion candidates (with the refinement-loop steps ready).
- Drafted anomaly entries + their digest lines (A6) — drafted, never auto-written.
- Doc claims invalidated by the diff (A1) — with proposed corrected text.
- Scriptorium updates where wording actually changed.
- CLAUDE.md contract edits (A8).
- Anything the checks flagged that has more than one defensible answer.

**NEVER automatic:** writing protective content (ANOMALIES/digest entries) without confirmation; pushing; force-anything.

### Report format

```
/release — <N> files, +<A> / −<D>, census ✓|✗

✓  <passing check, one line each>
⚠  <finding> — <proposed action>
↳  <suggestion, not a warning>

[AUTO] <what was fixed silently>

Anything to veto or add before I ship? (bump → verify → tag → confirmed push)
```

In `--check` mode, stop here — apply nothing, fix nothing.

---

## Phase C — apply

Apply the confirmed ASK items in dependency order (e.g. promote before documenting the promotion). One-line confirmation per item.

## Phase D — ship

1. **Verify:** `npx tsc --noEmit`; if the diff is UI-observable, a preview smoke check of the touched routes. Never ship unverified work — a failed verify stops the ritual with the output shown.
2. **Bump:** `package.json` minor +1, patch reset to 0.
3. **Commit:** the bump (bundled with remaining work or as a dedicated `release: vX.Y.0` commit). Tag `vX.Y.0`.
4. **Confirm:** state the version, the commit list, and ask for the explicit go-ahead. **Never push unannounced** — this confirmation is the point of the ritual, and the permission prompt on `git push` is its mechanical backstop.
5. **Push:** `git push && git push --tags`.

## What this skill never does

- Push without the Phase D confirmation.
- Write ANOMALIES/digest content that wasn't shown in the ASK batch.
- Run agents automatically (it may *suggest* route-auditor / responsive-guardian / portfolio-guardian based on the diff).
- Skip the census.
