# /biconomy — architecture notes

This file is **not** a tour of the codebase. It is a list of decisions, anomalies,
and cross-file wiring that you would not figure out by reading the code in
isolation. Read it before changing anything in `app/(works)/biconomy/`. Update it when an
architectural decision changes — not on every edit.

For project-level rules see `CLAUDE.md`.

---

## Known anomalies

### Mat clipping (v0.10.0)

`overflow: clip` was added to the `.mat` base class in `globals.css` during `/rr` work. This is the correct containment rule — all content should live within its mat. Two biconomy sections have pre-existing content that now clips at the mat edge:

- **ux-audit** — intro surface card extends past the right mat boundary
- **demos** — header card and text extend past the right mat boundary

These are not regressions — the content was always overflowing, just never visually caught because nothing was containing it. They need layout adjustment during biconomy fine-tuning.

### Section reveal shadow vs. scroll-linked shadow

The `.section-reveal` CSS animation (globals.css) includes a shadow phase on
`.surface` elements during entrance. After the reveal completes and the user
scrolls, `Sheet.tsx` applies an inline `boxShadow` via `useMotionValueEvent`
that overrides the CSS-animated shadow.

Both must remain. The CSS shadow provides the entrance look; the scroll-linked
shadow takes over for the reading state. See `app/components/nav/NOTES.md` for
full details.

**What breaks if the CSS shadow is removed:** surface cards appear flat/shadowless
during the reveal entrance on all biconomy sections.

**What breaks if the inline shadow is removed:** surface shadow does not respond
to scroll position; cards feel static during reading.

### Shadow token migration (v0.17.0)

Four biconomy card outers (`.bips__card-outer`, `.multiverse__card-outer`,
`.demos__card-outer`, `.api__card-outer`) previously carried a hardcoded
`0 1px 2px rgba(0,0,0,0.15)` shadow repeated in-place. These were unified onto
`var(--shadow-flat)` (0.10 alpha) as part of the four-tier elevation ladder
(flat / resting / raised / overlay) in `globals.css`.

Two biconomy shadows remain **off-ladder by design** and are annotated in the
CSS:

- `.api__card-frame` — upward-cast backlight (`0 -4.84px 4.84px rgba(0,0,0,0.25)`).
  Not elevation; simulates a panel backlit from below. Do not migrate to the ladder.
- The 1px hairline inside the api card — structural edge, not a shadow.

If you find yourself authoring a new shadow on a biconomy surface, use the
ladder first. Only introduce a new hardcoded value if it expresses a mechanic
the ladder cannot (motion-state, glow, inset press) and document why inline.
