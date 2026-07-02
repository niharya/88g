# nav cluster — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/components/nav/` are touched.

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale and rejected approaches. Behavior spec: [`./README.md`](./README.md). This digest is the seatbelt; the archive is the manual.

**Blast radius:** this cluster is consumed by `/biconomy`, `/rr`, `/marks`, and `/all`. Route CSS targeting `.project-marker` / `.nav-sled` / `.nav-marker` can violate these constraints from outside this folder — when editing route CSS that touches those selectors, read this digest too.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Don't-touch digest

- Keep the `?? sheet` fallback in useDockedMarker's arrow-target query, scoped to `containerRef.current.querySelector` (never document) — removing the fallback silently breaks every route that doesn't set `[data-arrow-target]`. ANOMALIES.md → "`[data-arrow-target]` — opt-in for arrow rotation"
- Read `--marker-top` live via `readMarkerTopFrom(nav)` on every scroll frame — never from `document.documentElement`, never cached — or is-docked flickers on routes that scope the token override to an ancestor. ANOMALIES.md → "`MARKER_TOP` is read live from the nav element, not documentElement"
- `openTray` must measure dock position fresh with getBoundingClientRect and bail if not at MARKER_TOP — the `.is-docked` class is intentionally not trusted (stale during layout transitions). ANOMALIES.md → "Tray open requires the marker to be docked"
- Do not change the sheet-tilt-on-tray-open behavior (random `--tilt` on every `.sheet > :not(.nav-sled)`) — CLAUDE.md-level protected visual identity. ANOMALIES.md → "Sheet tilt on tray open"
- Outside-click dismiss uses a single `pointerdown` listener — adding touchstart double-fires on touch devices. ANOMALIES.md → "Outside-click uses `pointerdown`, not `click`"
- Keep all four `.closest('.sheet-stack')` calls in useDockedMarker — sheet-stack is a page-level singleton. ANOMALIES.md → "`containerRef` replaces `.closest('.sheet')`"
- The `.project-marker` class lives on MarkerSlot's wrapper div (not ProjectMarker) and is targeted by 4 CSS sites — don't rename or relocate it. ANOMALIES.md → "MarkerSlot measurement replaces ProjectMarker useEffect"
- MarkerSlot must keep all four `--project-marker-right` publish triggers — ResizeObserver, IntersectionObserver, matchMedia (767-with-landscape-OR + 1023), MutationObserver on `.workbench` — each catches a failure mode the others miss. ANOMALIES.md → "MarkerSlot measurement replaces ProjectMarker useEffect"
- Nav-sled formula: the 2px term is the sheet border width; don't alter without re-deriving; the `--project-marker-right` fallback value covers first paint. ANOMALIES.md → "Nav-sled formula"
- When a responsive block changes a value exposed as a CSS custom property, override the token at `:root` inside the media query — never only the consumer — or every `calc()` reading the token silently breaks (this exact bug shipped once). ANOMALIES.md → "Responsive breakpoints — override the token, not the consumer"
- The docked-fill rule in navmarker.css must keep BOTH `:has(.chapter-nav.is-docked)` and `:has(.chapter-nav--open)` clauses, the descendant (not child) combinator through MarkerSlot's wrapper, the `:not(.nav-marker--flyout)` exclusion, and never override content ink colors. ANOMALIES.md → "Docked fill covers both markers of the pair"
- Project and exit markers are deliberately NOT dimmed when the tray is open — do not reintroduce a dim rule on them. ANOMALIES.md → "Every marker routes through `NavMarker`"
- Route layouts must import both `nav.css` and `navmarker.css` — nav.css owns positioning + the `.nav-marker` base; navmarker.css owns tone/state/docked-fill modifiers. ANOMALIES.md → "Every marker routes through `NavMarker`"
- Keep the two-span title markup (`.nav-marker__title-full` + optional `.nav-marker__title-short`) at all four ChapterMarker render sites, and keep the `:has()` visibility swap inside the mobile media block — collapsing either silently kills per-chapter mobile labels. ANOMALIES.md → "`Chapter.shortTitle` — two-span swap for mobile"
- ChapterMarker flyout items intentionally emit raw `.nav-marker` classes via motion.button (Framer drives their layout animation) — migrate or document if their styling ever diverges. ANOMALIES.md → "Every marker routes through `NavMarker`"
- Static-mode border halving relies on two unconditional companion rules in nav.css (`.selected-nav-row …` and `.chapter-nav--static …`) because `.is-docked` never fires in static mode — keep them, and keep consumer style overrides out of the NavMarker primitive. ANOMALIES.md → "Static mode on ChapterMarker"
- The `.section-reveal` class on Sheet and the `.transitioning` class on `.workbench` are the TransitionSlot↔useReveal contract — class names must match across files. ANOMALIES.md → "Sheet.tsx section reveal (useReveal)"
- Never author per-route marker positioning math or mobile marker compositions — consume the token defaults; the three rejected approaches (measured-pair centering, per-route badge with external font link, in-flow chapter marker per mat) were all tried on /rr and deleted. ANOMALIES.md → "Never author per-route marker positioning math"
- The mobile second-row wrap of the chapter marker next to the project marker is intentional — don't center-dock the pair or pull the chapter marker into flow inside each mat. ANOMALIES.md → "Mobile second-row wrap of chapter and project markers"
