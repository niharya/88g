# Shared design system — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/components/` are touched.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale and rejected approaches for shared primitives. This digest is the seatbelt; the archive is the manual. **Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

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
- `useReveal` must check `revealed.current` before re-observing, and runs TWO gates before observing: `.fonts-ready` on `<html>` (the page gate, hard-load only, timeout-bounded at 8.5s so the JS-fail/CSS-failsafe path can't strand sections at opacity 0) THEN `.transitioning` removal on `.workbench` (the TransitionSlot contract). Don't drop the timeout guard or reorder the gates.
- `useDominanceSnap` constants (`IDLE_MS`, `DOMINANCE_RATIO`, `SNAPPED_TOL_PX`) are consumed by /marks sections AND Sheet (every works route) AND `useExpand` — changing them is a multi-route change.
- `Monostamp` carries NO transitions, ever (consumer-owned state; see LIBRARY.md).
- `PaperFilter` renders exactly once per document.
- `Img` is the only sanctioned content-image path; new images require `npm run lqip`.
- Material Symbols icons render ONLY through the two typed paths — `<MaterialIcon name>` or NavMarker's `icon` prop — both keyed to the registry `app/lib/icons.ts` (`ICON_NAMES`/`IconName`). Never hand-write a `.material-symbols-rounded`/symbol-font span. Adding an icon = add to `ICON_NAMES` + `npm run icons` (rebuilds the subset); the pre-push hook runs `npm run icons:check` and blocks a stale subset. Full flow: `docs/performance.md` → "Material Symbols icons".
- StartoothLoader (the `.page-boot` patience mark) is a **server** component, NOT a `<Sticker>` consumer — don't promote it into `<Sticker>`: it must paint in the server `<body>` pre-hydration through the font gate, and a passive loader must not borrow `.sticker`'s cursor/hover/press. It borrows only the `--sticker-shadow-lift` token.
- StartoothLoader's per-route colour AND movement are CSS-driven via `:root:has(.route-*)` in globals.css (Page boot section), not props — the single shared layout can't know the route at render. Movement is a 4-var preset bundle (`--loader-anim`/`-dur`/`-ease`/`-stagger`); per-route *movement* selection via `:has()` is net-new. Props exist only for direct consumers (Suspense fallbacks).
- The `.page-boot` loader fills the screen with a per-route **field** (`--loader-screen-bg`, a `-160` step; `#000` for `/marks`; landing opts out via `display:none`). On exit the field fades (`page-boot-out`, opacity only) while the mark lifts off (`page-boot-mark-out`) — the lift transform lives on the **mark, not the field**, or the whole saturated screen zooms out. See ANOMALIES → "The loader field is a per-route colour; the exit transform lives on the mark".
- StartoothLoader's `pathLength={1}` + `stroke-dasharray: 1` on `.startooth-loader__lit` normalises every path to 1 so trace and twinkle share one markup — don't remove before retuning either keyframe.
- /marks boots dark-ink-on-light-hull (line-art on a die-cut hull over a `#000` field), a deliberate divergence from the old white-on-black mark — don't "restore" white-on-black or "fix" the literal `#000` to a grey token.
