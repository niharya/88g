---
name: prepush
description: Deprecated alias — the pre-push hygiene review now lives in /release. Invoking /prepush runs /release in --check mode (checks + report only, no fixes, no bump, no push).
---

# /prepush — deprecated alias

This skill's checks moved into **`/release`** (`.claude/skills/release/SKILL.md`), which merged the hygiene review with the version-bump-and-push ritual into one command with three autonomy tiers (auto-fix / one batched ask / confirmed push).

When invoked as `/prepush`: run the `/release` skill in **`--check` mode** — Phase A checks and the report, nothing applied, no bump, no push.
