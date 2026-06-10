# scriptorium — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `docs/scriptorium/` are touched. This node has no `ANOMALIES.md` — it is a pure contract pointer for the copy catalog.

**What this is:** the verbatim-copy catalog — one Markdown file per route, the downstream record of what the site says.

## Hard rules

- **Downstream-only.** This catalog mirrors the site; it does not drive it. Never edit copy here to change what renders — change the source component, then update the entry to match. Editing here changes nothing on the site and silently desyncs the record.
- **Verbatim.** Don't paraphrase, normalize, or "tidy" entries — they exist to be an exact mirror. A fragment in a component must appear word-for-word in its scriptorium file.
- **Head-tag copy lives in `meta.md` only** — titles, OG/Twitter cards, JSON-LD. Don't scatter it into per-route files.
- Editing a file here will prompt (settings `ask` rule) — that prompt is the reminder that you're touching the downstream record, not the site.
