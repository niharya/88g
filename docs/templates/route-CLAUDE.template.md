# /<route> — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/<route>/` are touched.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale, what-breaks, and rejected approaches. This digest is the seatbelt; the archive is the manual. Read the archive section before structurally changing anything an item below names.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Don't-touch digest

<!-- One line per protective constraint, fixed grammar:
       - <guard: file/selector/symbol + the rule> — <what breaks if violated>. ANOMALIES.md → "<Heading>"
     The archive holds the why, the rejected approaches, the full mechanism — this line is a
     tripwire, not a summary. Every line MUST end with an ANOMALIES.md → "<Heading>" pointer that
     matches a real "## <Heading>" in the sibling archive (doc-census checks this). Order roughly
     by destructiveness-if-missed. Whole file stays under ~1500 words — if a bullet needs more than
     one sentence to state the guard, the extra detail belongs in the archive, not here. -->

- … ANOMALIES.md → "…"
