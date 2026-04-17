---
name: prepush
description: Pre-push hygiene review — scans the current branch diff against main and produces a compact checklist of things to triage (promotion candidates, anomalies, doc drift, token discipline, dead references, agent suggestions, verification) before bumping version and pushing. Non-automated — surfaces findings, user picks what to act on.
---

# /prepush — pre-push hygiene review

Run this before the version-bump and push ritual. It is **not** a commit hook. It produces one compact report; the user triages; then the push ritual (CLAUDE.md → "Versioning and pushing") proceeds.

## How to run

1. Gather the diff scope: `git diff --name-status main...HEAD` and `git diff main...HEAD -- <paths>`. This captures the full branch, not just the last commit.
2. Run the checks below in order. Each check is **conditional** — skip it silently if its precondition isn't met. No noise.
3. Produce one report using the output format at the bottom. Keep each line under ~100 chars.
4. After the report, ask: *"Anything you want me to act on before the push ritual?"*
5. Act on what the user picks. Then follow CLAUDE.md's "Versioning and pushing" section from step 1.

Do **not** act on checklist items without confirmation. Do **not** run any agent automatically. Do **not** stage files, bump the version, or commit from within this skill — those happen after the user greenlights.

## Checks

### 1. Dead references

**If** any file was renamed or deleted in the diff (`git diff --name-status main...HEAD | grep -E '^[RD]'`):
- Extract the old paths.
- Grep the tracked codebase for lingering mentions of the old paths (use Grep on the old filename or a distinctive substring, excluding `.git/`).
- Flag any hit as ⚠ with the file:line.

**If** a file was moved into a new location, also flag imports that still reference the old path.

### 2. Token discipline

Scan **added or modified CSS lines** in the diff for hardcoded values that should use tokens:

- Hex colors (`#[0-9a-f]{3,8}`) or `rgb(…)`/`rgba(…)` outside the ladder — should use `var(--tone-*)`, `var(--grey-*)`, `var(--orange-*)`, or the four `--shadow-*` tokens.
- `font-family:` with a quoted name (e.g. `'Fraunces'`, `'Google Sans Flex'`, `'Material Symbols Rounded'`) — should use `var(--font-display|body|ui|mono|symbols)`.
- `transition:` or `animation:` with an easing function literal (`cubic-bezier(…)`, `ease-in-out`, etc.) that isn't `var(--ease-paper)` — flag unless it's a documented deviation the file comments justify.
- Durations outside the 0.5–0.9s motion-vocabulary range without comment — flag, don't reject.

Only flag if the hardcoded value is **net-new** in the diff. Pre-existing hardcoded values are out of scope unless touched.

### 3. Component reuse / promotion

**If** the diff touched any file under `app/(works)/*/components/`:

- For each touched route-local component, check whether a similarly-named or similarly-behaving file exists in another route or in `app/components/`. Heuristics:
  - Same filename across routes (e.g. `NoteRail.tsx` in both `/rr` and `/biconomy`).
  - Same domain word (rail, card, pill, stamp, marquee) across routes.
- If a cross-route twin exists, flag as ⚠: "candidate for promotion to `app/components/<Name>/` — two routes now use this pattern." Offer to follow the promotion loop (see CLAUDE.md → "Refining a component — the loop").

**If** the diff added new files under `app/components/` (the shared layer):
- Check `LIBRARY.md` at repo root — does an entry for this primitive exist with the correct code paths?
- If missing or stale, flag as ⚠ with the entry name.

### 4. Anomaly candidates

Scan the diff for patterns that tend to become load-bearing:

- Spring bounce/stiffness/damping constants that are non-default (bounce !== 0, stiffness !== 100, etc.).
- `setTimeout` or `setInterval` with a specific delay that isn't obviously arbitrary.
- `pointer-events`, `aria-hidden`, or `inert` toggles tied to state.
- Refs guarding against reentry (e.g. `programmaticScrollRef`, flags that prevent double-fires).
- Random values seeded per-mount (`Math.random()` in JSX).
- Magic CSS values that deviate from the documented scale (spacing outside the 8/4/2 rhythm, z-index that isn't obviously layered).

For each hit: read the closest `ANOMALIES.md` file (nearest ancestor directory) and check whether the pattern is already documented. Flag as ⚠ if not.

Do **not** write to ANOMALIES.md inside this skill — just surface candidates for the user to confirm.

### 5. LIBRARY.md currency

**If** the diff touched `app/components/` or any file whose path appears in a `LIBRARY.md` entry's "Where it lives" section:

- Re-read the relevant entry. Does the description still match behavior? Did a prop, variant, or tone get added/removed? Did a file move?
- Flag ⚠ if the entry needs an update. Propose the specific lines to change.

### 6. CLAUDE.md drift

**If** the session established a new convention, changed a workflow, or validated a pattern that future sessions should follow — CLAUDE.md needs an edit.

Signals this might apply:
- A new rule came out of a user correction ("don't do X", "always do Y").
- A new file was added (skill, agent, script) that future sessions should know exists.
- A shared primitive was promoted, or the promotion list changed.
- A tech-stack decision was made (yes / no / blocked).
- A process was codified (like the refining loop or this prepush skill itself).

Flag ⚠ with a proposed one-line addition or edit location. Do not edit without confirmation.

### 7. Agent suggestions

Based on what the diff touched, offer relevant agents — one-line, as ↳ suggestions, not warnings:

- Touched tone-carrying copy, headlines, UI text, or route narrative → `portfolio-guardian`
- Touched CSS under `@media`, added/changed responsive patterns → `responsive-guardian`
- Touched layout, motion, or CSS-heavy component files → `frontend-craft`
- Touched any `app/(works)/*/components/` without reading that route's `ANOMALIES.md` → `route-auditor`
- Surfaced an anomaly candidate in check 4 → `anomaly-librarian`

Do not suggest an agent unless there's a diff-based reason.

### 8. Motion vocabulary (conditional)

**If** the diff touched Framer Motion code (`motion.*`, `useSpring`, `useTransform`, etc.) or CSS `@keyframes`/`transition`/`animation`:

- Check for bounces or overshoots without a comment or ANOMALIES.md entry documenting why.
- Check that new transitions use `var(--ease-paper)` or the `EASE` constant.
- Check that durations fall in 0.5–0.9s unless there's a reason.

Flag ⚠ for each deviation without a comment trail.

### 9. Responsive-lite check (conditional)

**If** the diff touched route CSS under a `@media (max-width: …)` block, or `clamp()`/`vw` units in a route that didn't already have them:

- Verify `ANOMALIES.md` for that route has a "Responsive anomalies" section if drop-outs were made.
- Flag ⚠ if responsive changes went in without the section being updated.

### 10. Verification

**If** the diff touched any file that would be observable in `preview_*` (components, route CSS, globals.css, layouts):

- Check whether the dev server was started this session (`preview_list`).
- If not, flag ↳ as a reminder (not a warning): "UI-observable diff; verify in preview before push?"

If preview was started but console errors are present, flag ⚠ with the error count.

## Output format

Produce one report, using ✓ / ⚠ / ↳ markers. Keep it dense — no section headers, no padding.

```
/prepush — <N> files, +<A> / −<D>

✓  <one-line result for each passing check>
⚠  <one-line finding with file:line or path> — <proposed action>
↳  <suggestion, not a warning>

Anything you want me to act on before the push ritual?
```

Examples of well-formed lines:

- `✓  No dead references after the NOTES→ANOMALIES rename.`
- `⚠  Token: new hardcoded #CCCCCC in biconomy.css:812 — use var(--grey-800)?`
- `⚠  Promotion candidate: NoteRail exists in /rr and /biconomy — promote to app/components/Rail/?`
- `⚠  LIBRARY.md Monostamp entry lists 3 tones; code now has 4 — update "AI notes"?`
- `⚠  CLAUDE.md: /prepush skill added but not mentioned in "Versioning and pushing".`
- `↳  Agent suggestion: responsive-guardian — diff touches 4 @media blocks. Run it?`
- `↳  UI-observable diff; dev server not started this session — preview before push?`

If all checks pass, say so:

```
/prepush — <N> files, +<A> / −<D>
✓  All hygiene checks pass. Proceed to version bump.
```

## After the review

Once the user confirms what to act on:

1. Do the chosen items in the order they depend on each other (e.g. promote a component before running its agent).
2. After each item, confirm done with a one-liner.
3. When the hygiene queue is empty, say so explicitly: *"Hygiene done. Ready for the version-bump and push ritual."*
4. **Stop.** Do not auto-continue to the version bump — the user still confirms that step separately per CLAUDE.md.

## What this skill does not do

- Does not run tests, typecheck, or builds. Those are the user's call and are covered in CLAUDE.md's push ritual.
- Does not bump package.json, commit, tag, or push. Those happen after this skill exits.
- Does not auto-edit ANOMALIES.md, LIBRARY.md, or CLAUDE.md — it proposes, the user confirms.
- Does not run agents automatically — it suggests.
