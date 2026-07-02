# /components — anomalies (shared layer)

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). The
compressed digest lives in [`./CLAUDE.md`](./CLAUDE.md) (auto-loads whenever any
file under `app/components/` is touched); this archive carries the why.

This file is **not** a tour of the codebase, and it is **not** a catalog —
reusable API contracts and consumer lists live in `LIBRARY.md` (grep the
component name). This archive holds the protective memory for shared primitives:
decisions, cross-file wiring, and rejected approaches you would not figure out by
reading the code in isolation. The nav cluster keeps its own deeper archive at
[`nav/ANOMALIES.md`](./nav/ANOMALIES.md).

## Index

- **Sheet's `useScroll` entrance offset is tuned, not arbitrary** — the `0.85` entrance threshold governs when a sheet begins its settle.
- **Sheet keeps two shadow systems: CSS entrance shadow and scroll-linked boxShadow** — CSS covers pre-attach, inline lerp covers scroll-linked resting state.
- **Sheet's `surfaceRef` resolves via `querySelector`, and per-card rotation is a mount-time `useRef`** — both are deliberately outside React state.
- **`useDominanceSnap` constants are shared across /marks, Sheet, and `useExpand`** — `IDLE_MS`/`DOMINANCE_RATIO`/`SNAPPED_TOL_PX` are a multi-route change.
- **`Monostamp` carries no transitions — consumer owns state** — stateless primitive, timing is the consumer's job.
- **`PaperFilter` renders exactly once per document** — duplicate mounts collide on filter id.
- **`Img` is the only sanctioned content-image path** — new images require `npm run lqip`.
- **StartoothLoader is a server component, NOT a `<Sticker>` consumer** — must paint pre-hydration and stay passive.
- **Per-route colour AND movement are CSS-driven via `:root:has(.route-*)`, not props** — the shared layout can't know the route at render time.
- **The loader field is a per-route colour; the exit transform lives on the mark, not the field** — the field only ever animates opacity.
- **`/marks` colour is a deliberate divergence from the old white-on-black mark** — dark ink on a light hull over a `#000` field.
- **`pathLength={1}` + `stroke-dasharray: 1` is load-bearing for shared markup** — lets trace and twinkle share one markup.
- **`useReveal` waits for the page gate before observing (hard load)** — prevents the cold-load flat-flip.
- **Material Symbols icons go through a typed registry — never a hand-list** — the only path that makes an unlisted icon impossible.

Entry format — every entry states **what** the constraint is (present tense),
**where** it lives (file + selector/symbol anchor, never line numbers), **why**
it exists (including approaches rejected), and **what breaks** if violated.
Anchors are selectors/symbols/comment-headers. Values the code owns (tokens) are
named, not restated — `globals.css` is the source of truth.

---

## Sheet's `useScroll` entrance offset is tuned, not arbitrary

**What:** `Sheet` (`app/components/Sheet.tsx`) drives its mat entrance animation
with `useScroll({ offset: ['start 0.85', 'start 0.4'] })`. The `0.85` entrance
threshold is a tuned value.

**Where:** `Sheet.tsx`, the `useScroll` call feeding the
`useMotionValueEvent` handler that lerps the entrance shadow (see also
"Sheet keeps two shadow systems" below).

**Why:** the offset controls exactly when, relative to viewport position, a
sheet begins its entrance settle. `0.85` was tuned by feel against every
route's card-entrance.

**What breaks if violated:** changing the offset shifts the entrance timing
for every sheet on every works route simultaneously — a change here is a
multi-route change, not a local one.

**Don't change without reading first:** the `useScroll`/`useMotionValueEvent`
block in `Sheet.tsx` before touching entrance timing, and check every route's
card-entrance feel afterward.

## Sheet keeps two shadow systems: CSS entrance shadow and scroll-linked boxShadow

**What:** `Sheet.tsx` layers two separate shadow mechanisms on the same
surface: the CSS `.section-reveal` shadow (in `globals.css`) covers the
entrance before the scroll handler attaches, and an inline scroll-linked
`boxShadow` (written via `useMotionValueEvent`) takes over once scroll
tracking is live.

**Where:** `Sheet.tsx` — the `useMotionValueEvent` handler setting
`el.style.boxShadow`; the endpoint values (`shadowY`, `shadowBlur`,
`shadowAlpha`) are hand-tuned to match the `--shadow-flat` token
(`0 1px 2px / 0.10`). `globals.css` `.section-reveal` carries the CSS-only
entrance shadow.

**Why:** the CSS shadow exists because there's a window before the scroll
handler attaches (and thus before any inline style is written) where the
entrance still has to read correctly. The inline scroll-linked shadow exists
because the resting-state value is lerped per frame as the sheet scrolls into
place — that can't be expressed in static CSS.

**What breaks if violated:** dropping either system leaves a gap — no shadow
before the scroll handler attaches, or a shadow that can't animate with
scroll. If `--shadow-flat` is retuned, the matching lerp constants in
`Sheet.tsx` (`shadowY`/`shadowBlur`/`shadowAlpha` endpoints) must be updated
to match or the two systems will hand off with a visible mismatch.

**Don't change without reading first:** both the `.section-reveal` shadow
rule in `globals.css` and the `useMotionValueEvent` handler in `Sheet.tsx`
together — they're one system split across two files.

## Sheet's `surfaceRef` resolves via `querySelector`, and per-card rotation is a mount-time `useRef`

**What:** `Sheet.tsx`'s `surfaceRef` resolves the `.surface` element via
`section.querySelector<HTMLElement>('.surface')` inside an effect, not a
direct React ref. Separately, each card's random rotation is generated once
into a `useRef` on mount, with a `0deg` no-JS fallback.

**Where:** `Sheet.tsx` — the `surfaceRef.current = section.querySelector(...)`
assignment, and the rotation `useRef` initializer.

**Why:** the `.surface` element belongs to the route's children, not to
`Sheet` itself, so a React ref can't reach it directly — `querySelector` in an
effect is the only path in. The rotation value is generated once and held in
a ref (not state) because it must not change across re-renders once
committed, and the `0deg` fallback covers the no-JS case.

**What breaks if violated:** converting either to component state/refs that
re-run reintroduces re-renders that would either lose the `querySelector`
lookup timing (the child DOM node may not exist yet) or re-randomize card
rotation on every re-render instead of once per mount.

**Don't change without reading first:** the effect that sets `surfaceRef.current`
and the rotation `useRef` initializer in `Sheet.tsx` before refactoring either
into state.

## `useDominanceSnap` constants are shared across /marks, Sheet, and `useExpand`

**What:** `useDominanceSnap` (`app/components/hooks/useDominanceSnap.ts`)
defines three tuned constants — `IDLE_MS` (150), `DOMINANCE_RATIO` (0.72),
`SNAPPED_TOL_PX` (2) — consumed by /marks sections, `Sheet` (every works
route), and `useExpand`.

**Where:** `app/components/hooks/useDominanceSnap.ts`, the three top-level
`const` declarations.

**Why:** the constants govern when a dominant section is considered "settled"
enough to glide-snap and how close counts as "docked" — tuned once and shared
so the snap feel is consistent everywhere it's used, rather than re-tuned
per-consumer.

**What breaks if violated:** changing any of the three constants changes
snap behavior for /marks, every works-route Sheet, and `useExpand`
simultaneously — this is a multi-route change, not a local one.

**Don't change without reading first:** all three consumers
(`useDominanceSnap.ts` callers) before retuning, since the constants aren't
scoped per-consumer.

## `Monostamp` carries no transitions — consumer owns state

**What:** `Monostamp` (`app/components/Monostamp.tsx`) never applies CSS
transitions to its own state changes. Interaction state (active/rest,
appearance) is driven entirely by the consumer.

**Where:** `Monostamp.tsx` — the component is stateless by design (see file
header comment); see `LIBRARY.md` → "Monostamp" for the full API contract and
consumer list.

**Why:** keeping `Monostamp` stateless and transition-free lets each consumer
own its own timing and interaction model (the active/rest flip) without
fighting a transition baked into the primitive itself.

**What breaks if violated:** adding a transition inside `Monostamp` would
impose one timing model on every consumer, including dark-appearance
consumers whose active/rest flip depends on an instant (non-transitioning)
state change.

**Don't change without reading first:** `LIBRARY.md` → "Monostamp" and every
listed consumer before adding any transition to the component itself.

## `PaperFilter` renders exactly once per document

**What:** `PaperFilter` (`app/components/PaperFilter.tsx`) is an SVG
displacement filter for paper surface texture, and must be mounted exactly
once per document.

**Where:** `PaperFilter.tsx`.

**Why:** it defines a shared SVG filter primitive (referenced by `id` from
CSS elsewhere); duplicate mounts create duplicate/conflicting filter IDs in
the DOM.

**What breaks if violated:** a second mount produces a second filter element
with a colliding id, which can cause the paper-texture filter to resolve
inconsistently (or not at all) depending on which instance the browser picks.

**Don't change without reading first:** grep all routes for existing
`<PaperFilter />` mounts before adding a new one.

## `Img` is the only sanctioned content-image path

**What:** `Img` (`app/components/Img/Img.tsx`) is the only sanctioned path for
rendering content imagery. New images require running `npm run lqip` to
register them in the generated manifest.

**Where:** `app/components/Img/Img.tsx` (manifest lookup + fallback warning),
`app/components/Img/manifest.generated.ts` (the generated manifest consumed
at render time).

**Why:** `Img` resolves images against a generated manifest (LQIP + sizing
data) built by `npm run lqip`; an image outside the manifest falls back to a
raw `<img>` with a console warning, losing the LQIP/perf benefits.

**What breaks if violated:** adding or replacing a content image without
running `npm run lqip` leaves it outside the manifest — `Img` logs `[Img]
"<src>" is not in the image manifest. Falling back to raw <img>. Run \`npm
run lqip\` to regenerate.` and the image loses lazy-loading/blur-up behavior.

**Don't change without reading first:** `docs/performance.md` for the full
`Img`/`lqip` flow before adding a second content-image path.

## StartoothLoader is a server component, NOT a `<Sticker>` consumer

**What:** `StartoothLoader` (`app/components/StartoothLoader/StartoothLoader.tsx`)
is the sticker family's passive, SSR-safe member. It shares the family's
*material* — the `--sticker-shadow-lift` token (applied on
`.startooth-loader__hull` in `startooth-loader.css`) and the die-cut silhouette —
but is deliberately **not** built on the `<Sticker>` component and must not be
"promoted" into it under the promotion rule.

**Where:** the primary mount is the patience mark in `app/layout.tsx` —
`<div className="page-boot">` rendering `<StartoothLoader size={150} />` inside
the server `<body>`. The header comment in `StartoothLoader.tsx` records the
boundary.

**Why — two independent reasons, both load-bearing:**
1. `<Sticker>` is `'use client'`. The patience mark renders in the server `<body>`
   specifically so it paints in the **initial HTML, before hydration**, surviving
   the cold-cache font-gate hold. A client subtree cannot paint pre-hydration, so
   the loader is its own server component.
2. A loader is passive. The `.sticker` class ships `cursor: pointer` + hover-lift
   + `:active` press — interaction affordances that would *lie* on an element
   that sits behind `pointer-events: none` and is gone in under 1.5s. Borrowing
   the interaction shell would make a control imply interaction it doesn't have.

**What breaks if violated:** folding StartoothLoader into `<Sticker>` either kills
the pre-hydration paint (cold-cache visitors stare at blank paper through the
font gate) or ships a fake-interactive cursor/press on a passive mark. Borrow the
`--sticker-shadow-lift` token, never the `.sticker` class.

**Don't change without reading first:** `app/layout.tsx`'s server placement of
`.page-boot`, and the `'use client'`-vs-server split between `Sticker` and
`StartoothLoader`.

## Per-route colour AND movement are CSS-driven via `:root:has(.route-*)`, not props

**What:** a **single shared layout** (`app/layout.tsx`) renders **one**
StartoothLoader for **every** route, so the component cannot know the route at
render time. Both the palette (`--loader-lit` / `--loader-sticker`) and the
movement preset are therefore selected in CSS by the route's body class, not
passed as props on the boot mount.

**Where:** `app/globals.css`, the `/* ── Page boot — patience mark ─ */` section.
Colour: the `:root:has(.route-biconomy)` / `:has(.route-rr)` /
`:has(.selected-workbench)` / `:has(.landing)` / `:has(.route-marks)` blocks set
the two `--loader-*` colour vars. Movement: the
`:root:has(.landing) .page-boot .startooth-loader, :root:has(.route-marks) …`
rule sets the **4-var movement preset** (`--loader-anim` / `--loader-dur` /
`--loader-ease` / `--loader-stagger`) to twinkle; trace is the component default
(`startooth-loader.css`) for every other route. This pair replaced the old
`--startooth-stroke` / `--startooth-fill` vars.

**Why:** per-route colour via `:has()` was already precedent. Per-route
**movement** selection is **net-new** — the boot mount overrides the component's
trace default by setting the preset vars in CSS rather than via the `movement`
prop, because the shared layout can't choose at render time. The props
(`lit` / `sticker` / `movement`) still exist, but only for **direct consumers**
(Suspense fallbacks, previews); they set the identical CSS vars inline, the same
prop→var pattern `<Sticker>` uses for `tilt`.

**What breaks if violated:** adding a `route` prop or branching on route in the
component reintroduces a render-time route dependency the shared-layout
architecture explicitly avoids. Forgetting that movement is a 4-var *bundle*
(not a single var) half-applies a preset and desyncs cadence from palette.

**Don't change without reading first:** the `:has()` colour/movement blocks in
globals.css and the prop→inline-var path in `StartoothLoader.tsx`.

## The loader field is a per-route colour; the exit transform lives on the mark, not the field

**What:** the `.page-boot` loader fills the screen with a saturated per-route
**field** (`--loader-screen-bg`, a soft `-160` ramp step per route; `#000` for
`/marks`; the landing opts out via `.page-boot { display: none }`). On release
(`html.fonts-ready`) the field fades via `page-boot-out` (**opacity only**) while
the **mark** lifts off via `page-boot-mark-out`
(`scale(var(--loader-exit-scale)) translateY(var(--loader-exit-lift))`).

**Where:** `app/globals.css`, the "Page boot" section — the `:root:has(.route-*)`
blocks set `--loader-screen-bg` alongside the two colour vars; `.page-boot`
carries `background: var(--loader-screen-bg, …)`; `page-boot-out` (field) and
`page-boot-mark-out` (mark) are separate keyframes on separate selectors.

**Why:** the exit transform is deliberately on the **mark**
(`.startooth-loader`), not the **field** (`.page-boot`). Putting the
`scale`/`translateY` on `.page-boot` would scale and lift the *entire saturated
screen* on exit — reads as the whole field zooming out rather than a sticker
peeling off it. The field only ever animates opacity.

**What breaks if violated:** moving the exit transform onto `.page-boot` (or
merging the two keyframes) zooms the full-screen colour on every load. Dropping
`--loader-screen-bg` falls back to `--workbench-bg` (paper) — the branded screen
is lost. Setting it on `/marks` to anything but `#000` breaks the documented void.

**Don't change without reading first:** the `page-boot-out` / `page-boot-mark-out`
split and the `--loader-screen-bg` blocks in globals.css "Page boot".

## `/marks` colour is a deliberate divergence from the old white-on-black mark

**What:** `/marks` boots with dark ink on a light paper hull —
`--loader-lit: var(--grey-160)` on `--loader-sticker: var(--grey-960)`, over a
`background: #000` field.

**Where:** `app/globals.css`, the `:root:has(.route-marks)` block in the Page boot
section (carries its own explanatory comment).

**Why:** the old solid patience mark was white-on-black. The loader is **line-art
on a die-cut hull**, so the literal carry-over (white lines on a near-white hull)
would render the line-art invisible. Dark ink on a light paper hull reads as a
little sticker pressed onto the black void — the void is intentional, not a
leftover. (`#000` isn't a token: the grey ramp tops out at `--grey-960`/#F5F5F5
and bottoms at #141414, so the literal `#000` stays.)

**What breaks if violated:** "restoring" white-on-black, or "fixing" the literal
`#000` to the nearest grey token, makes the /marks loader unreadable or breaks
the sticker-on-void reading.

**Don't change without reading first:** the `:root:has(.route-marks)` comment in
globals.css.

## `pathLength={1}` + `stroke-dasharray: 1` is load-bearing for shared markup

**What:** every lit path in `StartoothLoader.tsx` carries `pathLength={1}`, and
`.startooth-loader__lit` in `startooth-loader.css` sets `stroke-dasharray: 1`.

**Where:** the `.startooth-loader__lit` paths (`StartoothLoader.tsx`,
`__lit-group`) and the matching rule in `startooth-loader.css`.

**Why:** `pathLength={1}` normalises every path's geometric length to 1, so a
`stroke-dasharray: 1` covers the whole path regardless of its real length. That
lets **trace** (animates `stroke-dashoffset` to draw the line on) and **twinkle**
(leaves the line solid, animates opacity) share the **same markup** — only the
movement preset differs.

**What breaks if violated:** dropping `pathLength={1}` makes the dash maths
geometry-dependent, so trace draws unevenly across the four facets and twinkle's
shared markup no longer round-trips. The two movements would need divergent
markup.

**Don't change without reading first:** the `pathLength`/`stroke-dasharray`
pairing before retuning either movement keyframe.

## `useReveal` waits for the page gate before observing (hard load)

**What:** on a hard load `useReveal` (`app/components/useReveal.ts`) does not start
its IntersectionObserver until the page gate has released — `.fonts-ready` on
`<html>`, set by the gate script in `app/layout.tsx`. Only then does it run the
existing `.transitioning`-removal wait and observe. If `.fonts-ready` is already
present (client navigation, or a fast load that landed it before this effect), it
skips straight through, so client-nav behaviour is unchanged.

**Where:** `useReveal.ts` — "Gate 1" (the `html.classList.contains('fonts-ready')`
branch + `gateMo` MutationObserver) runs before "Gate 2" (the `.workbench`
`.transitioning` wait). Consumed only by `Sheet` (`Sheet.tsx`), so this governs
every works-route chapter entrance.

**Why:** the gate holds every surface at `opacity: 0` behind the `.page-boot`
loader until ready. IntersectionObserver fires regardless of opacity, so without
this wait the first sheet's `.section-reveal` plays **behind the invisible gate**
and the page flat-flips to already-placed content when the gate lifts. Waiting
for `.fonts-ready` makes the section settle in **as** the page appears (the
"Place" entrance — see `docs/navigation-choreography.md`).

**The timeout guard is load-bearing.** `GATE_FAILSAFE_MS` (8.5s, just past the
gate's own 8s CSS failsafe) forces observation even if `.fonts-ready` never lands.
The gate has a CSS-only failsafe that reveals the page at 8s **without** setting
the class (the JS-fail path); since `.section-reveal` is `opacity: 0` until
`.revealed`, dropping the timeout would strand every section invisible on that
path.

**What breaks if violated:** removing Gate 1 returns the flat-flip on cold load;
removing the timeout strands sections at `opacity: 0` whenever the JS gate path
fails; reordering the two gates (transition before page-gate) lets a section
reveal during a client transition it was meant to wait out.

**Don't change without reading first:** the gate script in `app/layout.tsx`
(what sets `.fonts-ready` and when) and the `.section-reveal` opacity:0 base state
in `globals.css`.

## Material Symbols icons go through a typed registry — never a hand-list

**What:** every icon the site renders is constrained to one registry,
`app/lib/icons.ts` (`ICON_NAMES` / `IconName`). Icons render ONLY via the two
typed paths — `<MaterialIcon name>` (`app/components/MaterialIcon.tsx`) or
NavMarker's `icon` prop — so an icon outside the registry is a compile error.
The font subset is built FROM the registry (`scripts/icon_subset.py`,
`npm run icons`) and `scripts/check-icons.mjs` (pure Node, run by the pre-push
hook) fails the push if the shipped subset and the registry diverge.

**Where:** registry in `app/lib/icons.ts`; render paths in `MaterialIcon.tsx`
and `NavMarker.tsx` (`icon?: IconName | Exclude<React.ReactNode, string>`); build
+ manifest in `scripts/` and `app/fonts/icon-manifest.json`; the full
contract/flow lives in `docs/performance.md` → "Material Symbols icons".

**Why — the root cause this exists to kill:** icons reach the symbol font through
THREE different CSS class paths (`.material-symbols-rounded`, `.nav-icon`, and
route-local classes that set `font-family: var(--font-symbols)` — e.g. the
biconomy play icon), and their names arrive as string literals, dynamic
ternaries, multiline span text, and CSS `content` ligatures. No single grep
covers all of that, so a hand-maintained subset list drifts silently — it
shipped broken three times in one session (`keyboard_arrow_*`, then
`play_circle`/`pause_circle`) before the registry. A scan-and-census approach was
rejected because a scan only catches the patterns it knows; the type system is
the only thing that makes an unlisted icon impossible.

**One exception:** `close` is consumed solely by a CSS `content: 'close'`
ligature (the /rr NoteRail mobile swap), which can't be typed. It lives in
`ICON_NAMES` so the subset includes it, but its single use is not
compiler-enforced — the lone documented gap.

**What breaks if violated:** hand-writing a `.material-symbols-rounded` (or
route-local symbol-font) span, or passing a NavMarker `icon` string outside the
registry, bypasses the type check and silently drops a glyph from the subset →
the icon renders as raw ligature text (e.g. "PLAY_CIRCLE"). Forgetting
`npm run icons` after editing `ICON_NAMES` is caught by the pre-push check.

**Don't change without reading first:** `docs/performance.md` → "Material Symbols
icons", and the three symbol-font sink classes in CSS before assuming a grep
found every usage.
