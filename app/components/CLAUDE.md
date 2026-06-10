# Shared design system — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/components/` are touched.

**This is the shared layer.** Every route consumes from here; nothing here belongs to one route.

## Hard rules

- **Grep before editing.** Before changing any file here (or any token in `app/globals.css`), grep ALL routes for consumers. A change here lands everywhere at once.
- **Catalog first.** Every primitive here has a `LIBRARY.md` entry — grep `LIBRARY.md` for the component name and read that entry (not the whole file) before editing; it carries the API contract, consumers, and AI notes.
- **Promotion rule.** A primitive moves here on its **second** use, never the first; flag the move first; the `LIBRARY.md` entry lands in the same commit. Routes never import from each other.
- **Tokens, not values.** Colors via `--tone-*`/ramp steps, easing via `--ease-paper`/`--ease-snap`, durations via `--dur-*` — values live in `globals.css` only.
- **Nav cluster:** `nav/` and `NavMarker/` have their own digest at [`nav/CLAUDE.md`](./nav/CLAUDE.md) + archive [`nav/ANOMALIES.md`](./nav/ANOMALIES.md) — read before touching.

## Don't-touch digest (shared primitives living at this level)

- Sheet's `useScroll` offset `['start 0.85', 'start 0.4']` — the 0.85 entrance threshold is tuned; don't change it without checking every route's card-entrance feel.
- Both shadow systems must stay: the CSS `.section-reveal` shadow covers the entrance before the scroll handler attaches; the inline scroll-linked boxShadow wins afterward. If `--shadow-flat` is retuned, the matching constants in Sheet.tsx must follow.
- Sheet's `surfaceRef` resolves via `querySelector('.surface')` in an effect (the element belongs to route children — a React ref can't reach it), and per-card random rotation lives in a `useRef` set once on mount with a 0deg no-JS fallback — don't "fix" either into state/refs.
- `useReveal` must check `revealed.current` before re-observing, and gates itself behind `.transitioning` removal — the TransitionSlot↔useReveal contract.
- `useDominanceSnap` constants (`IDLE_MS`, `DOMINANCE_RATIO`, `SNAPPED_TOL_PX`) are consumed by /marks sections AND Sheet (every works route) AND `useExpand` — changing them is a multi-route change.
- `Monostamp` carries NO transitions, ever (consumer-owned state; see LIBRARY.md).
- `PaperFilter` renders exactly once per document.
- `Img` is the only sanctioned content-image path; new images require `npm run lqip`.
