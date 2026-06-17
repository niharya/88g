# /<route> — anomalies

This file is **not** a tour of the codebase. It is the protective archive for this
route: decisions, anomalies, and cross-file wiring you would not figure out by
reading the code in isolation. The compressed digest lives in `./CLAUDE.md`
(auto-loaded); this archive carries the why. Update it when an architectural
decision changes — not on every edit, and always together with its digest line.

Entry format — every entry states:

- **what** the constraint is (present tense — git history holds the archaeology)
- **where** it lives (file + selector/symbol anchor; never line numbers)
- **why** it exists (including approaches tried and rejected)
- **what breaks** if violated

Out of scope: codebase tours, general explanations, changelog entries,
restating values the code owns (name the token/constant and its home instead).

---

## <First anomaly title>

…
