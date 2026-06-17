# /bench — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/(works)/bench/` are touched. (Route renamed from `/selected` in the Work Essay redesign; a permanent redirect + the `/cases` & `/showcase` rewrites live in `next.config.mjs`.)

**Archive:** [`./ANOMALIES.md`](./ANOMALIES.md) — full rationale, position math, and what-breaks. Spec: [`./DESIGN.md`](./DESIGN.md). This digest is the seatbelt; the archive is the manual. Read the archive section before structurally changing anything an item below names.

**Maintenance:** every new ANOMALIES entry gets a one-line item here in the same commit; every retired entry removes its item. The `/release` census checks this pairing.

## Don't-touch digest — bench essay (Work Essay)

- The ticket is ONE element that morphs rest→pinned-navbar and back; geometry (position/top/left/width/height) is written imperatively on the node in `useBenchMorph`, the inner reshape is the declarative `condensed`/`active` props on `Ticket`. Don't split the morph across two elements.
- **`useBenchMorph.openTab` must cancel `.transition-pane`'s retained WAAPI animation before measuring** — TransitionSlot's entrance leaves `transform:translateY(0)` (fill:both) on the pane, a containing block that pins the fixed navbar to the pane instead of the viewport. Paired with `.transition-pane:has(.bench-workbench){will-change:auto}` in bench.css (same trap, will-change cause).
- The slide-in entrance uses `animation-fill-mode: backwards` (NOT `both`) so `.bench-card` retains no transform — a retained transform would also break the fixed-navbar morph.
- Deep-link entry (`/cases`, `/showcase`, `/bench?view=…`, case-study EXIT) reads `view` SERVER-side in `page.tsx` (the rewrites deliver it as the destination query; client `useSearchParams` never sees it) and jumps via `openTab(..., {instant, skipUrlSync})`. On in-shell client nav the jump WAITS for `.workbench.transitioning` to clear; the once-guard is a synchronous ref (survives Strict Mode double-invoke).
- TransitionSlot's exit-dim selector includes `.bench-workbench > *` — keep the wrapper class or the ghost won't dim on exit.
- Longform tab hosts `SelectedContent` in `.bench-cases` (sized relative wrapper) because the timeline mat is `position:absolute right:0 width:688`; its archive-open growth (729→1201) is mirrored on `.bench-cases:has(.selected-mat--archive-open)`.
- ORPHANED by the redesign (no longer rendered, safe to delete after review): `AboutCard`, `FirstView`, `Showcase/ShowcaseSection`, `Showcase/Prelude`, `Showcase/HeaderBlock` (+ their CSS). They only reference each other. Left in place pending Nihar's review of the new bench.

## Don't-touch digest — timeline + archive (the Longform tab content)

- Hover dim/highlight uses `filter: opacity()`, never the `opacity` property — Framer Motion writes inline opacity after entrance animations and silently overrides CSS opacity rules.
- The card-hover cascade is gated on `data-armed="true"`, set by ProjectCard.tsx only after the first real cursor mousemove; all five `:has()` cascade selectors plus the mobile undo rule are a unit — never drop the gate from any one of them.
- `data-armed` must live on the inner `<Link>`, not the outer motion.div — the `:has()` selectors target that element; timer-based and outer-element gates were tried and failed.
- All bars grow via `scaleY` with `transform-origin: top center` on the base bar class — do not override per-bar.
- Year labels use `transform: translate(-100%, -50%)`, so their CSS `top` is the visual center — every position calculation must account for this.
- The `D` delay objects in Timeline.tsx and ArchivePanel.tsx are absolute values, not relative offsets — changing any bar's timing requires recalculating every delay after it.
- The archive toggle button lives in Timeline.tsx (not ArchivePanel.tsx) because it rides the main delay train — moving it breaks entrance sequencing.
- Entrance motion is always top-to-bottom (`y: -8 → 0`); never use a positive initial y — bottom-to-top contradicts the train metaphor.
- Dots pop (scale 0 → 1 with the high-bounce SPRING_POP), clusters stagger per dot — they never fade.
- Year labels stay in `--font-mono` (Google Sans Code), never the variable display font — even digit widths.
- The archive toggle has no autoscroll — scroll-on-open was removed as disorienting; don't reintroduce it.
- The 12px gap grid (dots-to-bar, content-to-bar) and 4px label clearances are authored constants — changing one means recalculating all adjacent absolute positions.
- Entry rhythm contract: entry tops follow 36 + n·88; meta center = entry top + 46; bar edges sit year_center ∓ 10 from their year label.
- Icon arrow hover animations are CSS-only translate on the inner SVG group (icons are shared at `app/components/icons/`) — no Framer Motion involvement.
- The "opens in new tab" hint pill keeps a neutral grey shell with only the text color themed per project — don't theme the shell.
- `.selected-archive-panel` is a sibling of `.selected-tl` inside `.selected-mat`, not a child — on mobile each repeats its own horizontal padding; a mat-inset change must land in both places.
- Mobile mat height comes from a three-link flex chain — any sibling added after `.selected-mat` inside `.selected-layout` steals the grow and strands the mat short of the viewport frame.
- The mobile sticky nav row uses `margin-top: calc(-1 * var(--workbench-pad-y))` — keep it tied to the token; hardcoding the value reintroduces a stale-value bug.
- The year source of truth is the `ARCHIVE_ENTRIES` array in ArchivePanel.tsx; the hand-placed desktop year labels must agree with it.
- The archive toggle label is two sibling spans (desktop + mobile copy) toggled by CSS — never update one string without the other.
- Hover-only affordances (hint pill, highlights, push-apart) are deliberately disabled in the mobile block — don't "re-enable" them for touch.
- When the hint pill eventually migrates to `<Monostamp>`, only the visual shell migrates — its hidden-by-default slide-in hover behavior stays in selected.css.
