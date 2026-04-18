# LIBRARY.md

Staging catalog for components and modules built inside this portfolio that may later be extracted into a standalone library.

This is a **pointer list + AI context** — not a source of truth. The code itself lives at the paths each entry references. When something gets extracted to the external library later, the entry is updated rather than copied here.

Living document. Entries are added as new reusable pieces are built; a sweep will catalog existing qualifying code later.

File-path links resolve from repo root on GitHub. This file isn't rendered by the site.

---

## Entry format

Each entry has four things:

1. **Name** — short and descriptive
2. **What it does** — one or two sentences in plain language, human-readable
3. **Where it lives** — file paths to the code (and CSS, if separate)
4. **AI notes** — non-obvious dependencies, load-bearing values, don't-touch warnings, and what's route-specific vs library-ready. Written for a future AI session or contributor who has never seen this repo.

Add new entries **above the divider at the bottom**, most recent first.

---

## Sheet

The paper chapter container used by every works route. Renders a `section.sheet.mat.section-reveal`, wires up a nav-sled with `ChapterMarker`, triggers the entrance reveal via `useReveal`, and runs a scroll-linked "card placement" glide on the first `.surface` element inside.

**Where it lives**
- [app/components/Sheet.tsx](app/components/Sheet.tsx) — the component.
- [app/globals.css](app/globals.css) — `.sheet`, `.mat`, `.section-reveal` three-phase choreography, `.nav-sled` slot. Search for "── Sheet ──" and "── Section reveal ──".

**AI notes**
- **Section ID comes from `chapter.id`.** The sheet's own `id` attribute is used as a scroll target by `ChapterMarker` and by hash navigation. Don't rename without checking ChapterMarker consumers.
- **Random micro-rotation is set on mount, not re-rolled.** A `rotationRef` holds `±1.5°` for the scroll-linked card glide, and each non-nav-sled child gets its own `--place-rotate` CSS custom property (also `±1.5°`) via `querySelectorAll(':scope > :not(.nav-sled)')`. These are stable per mount — navigating away and back re-rolls them, which is intended (each visit settles differently).
- **Scroll-linked card placement is inline-styled, not CSS-classed.** The first `.surface` in the sheet receives per-frame `transform` and `boxShadow` writes from `useMotionValueEvent` on `scrollYProgress`. Endpoint shadow matches `--shadow-flat` exactly so the card reads flat at rest. Do not try to move this to CSS — values are lerped.
- **Three-phase reveal is choreography, not independent transitions.** Phase 1 (mat glide 0.8s), Phase 2 (content settle 0.7s + `--place-rotate`), Phase 3 (nav-sled dock 0.5s) are tuned as a set. Changing one phase's duration without the others breaks the cascade. The odd-valued durations (0.7, 0.9) are deliberate and sit outside the `--dur-*` tier vocabulary.
- **`useReveal` needs a ref on the element that should receive `.revealed`.** Sheet passes its own `sectionRef`. If children need their own one-shot reveals, they import `useReveal` separately.
- What's route-specific: the children. Everything else (the chapter-marker wiring, the reveal, the scroll-linked glide) is identical across routes.
- What's library-ready: the whole component.

---

## useReveal

One-shot scroll-triggered entrance hook. Adds `.revealed` to a target element the first time it enters the viewport, then disconnects.

**Where it lives**
- [app/components/useReveal.ts](app/components/useReveal.ts) — the hook.
- [app/globals.css](app/globals.css) — the `.section-reveal` → `.revealed` state transitions. Search for "── Section reveal ──".

**AI notes**
- **Coordinates with TransitionSlot.** If `.workbench` has `.transitioning` (page-level transition in flight), the hook uses a `MutationObserver` to wait for it to clear before setting up the IntersectionObserver. Without this, section reveals fight the page transition and stutter. Hard loads skip this branch (no `.transitioning` class ever gets set).
- **`once` is implicit.** The hook disconnects the observer after the first intersect and holds a `revealed` ref guard so strict-mode double-mounts don't re-arm it.
- **`rootMargin: '-60px'`** means the reveal fires slightly before the element reaches the viewport edge, so content is already visible when the transition starts. Don't change without eyes on the page.
- **Consumed by Sheet, but usable standalone.** Any element that uses the `.section-reveal` base class and wants one-shot entrance can use this hook directly.
- What's library-ready: the whole hook. The CSS side is a companion that lives in globals.css — extract together.

---

## Nav cluster (shared docked nav)

The docked-nav system used by every works route: chapter marker, project marker, exit marker, slot primitive, and the hook that drives docking state. Works as a single unit — components are designed to be imported together from the barrel.

**Where it lives**
- [app/components/nav/](app/components/nav/) — `ChapterMarker.tsx`, `ProjectMarker.tsx`, `ExitMarker.tsx`, `MarkerSlot.tsx`, `useDockedMarker.ts`, `types.ts`, `nav.css`, `index.ts`.
- [app/components/nav/ANOMALIES.md](app/components/nav/ANOMALIES.md) — **load-bearing internals live here.** Docking math, viewport-frame coordination, and the reason each marker is structured the way it is.
- [app/globals.css](app/globals.css) — `--marker-top`, `--project-marker-right`, `--z-chapter-marker`, `--z-project-marker` tokens.

**AI notes**
- **Import from the barrel (`./nav`), not from individual files.** `index.ts` is the public API. Reaching past it couples consumers to the internal file layout.
- **`MARKER_TOP` in `useDockedMarker.ts` must match `--marker-top` in `nav.css` (24px).** Noted in `index.ts`. Changing one without the other breaks the docking position. Do not forget.
- **Route layouts must import `./nav/nav.css`** to activate the system. Importing the components alone renders them unstyled.
- **Each route defines its own `Chapter[]`** in its `nav/chapters.ts`. The nav cluster itself is content-free.
- **Mobile pattern is in `CLAUDE.md`, not in nav.css alone.** The tucked-under-top-frame behavior is documented in CLAUDE.md's "Global mobile patterns" section and implemented through `.workbench::before` (frame) + `--marker-top` (0 on mobile). Nav.css only handles the marker side.
- **Route-level consequences of consuming this system** live in each route's `ANOMALIES.md` (e.g. `/rr` documents the sled-in-mat absolute positioning for mobile). Nav's own `ANOMALIES.md` is for internals.
- What's route-specific: `Chapter[]` data, and each route's `nav/chapters.ts` file.
- What's library-ready: the whole cluster. Extracting means pulling the CSS file, the four components, the hook, the types, AND the matching globals.css tokens together.

---

## SlideInOnNav

Signals directional entrance between landing (`/`) and `/selected` — the two routes that don't share a TransitionSlot because landing lives outside the `(works)` route group. Outgoing page sets a `sessionStorage` flag; incoming page mounts this component, which reads the flag and adds an entrance class.

**Where it lives**
- [app/components/SlideInOnNav.tsx](app/components/SlideInOnNav.tsx) — the component (returns `null`; pure effect).

**AI notes**
- **Uses `useLayoutEffect`, not `useEffect`** — the class must be on the element before the browser paints the first frame, or the default animation plays briefly before the swap.
- **No cleanup function.** Returning one would strip the class during React StrictMode's double-invoke, leaving the class off on the real mount. A module-level `consumed` guard handles the StrictMode edge case instead.
- **Flag is consumed once per session.** Hard loads or navigations from elsewhere see no flag, no class.

---

## PaperFilter

Off-screen SVG `<defs>` that exposes a `#paper-displace` displacement filter (fractal noise + displacement map). CSS references it via `filter: url(#paper-displace)` to add subtle paper-surface warping.

**Where it lives**
- [app/components/PaperFilter.tsx](app/components/PaperFilter.tsx) — the component (render once near the root; the `<defs>` becomes globally addressable by id).

**AI notes**
- **Render once per document.** Two copies would create two `#paper-displace` defs and the CSS reference would resolve to whichever renders first — harmless but wasteful. Route layouts typically render it near the top of the tree.
- The filter is aria-hidden and absolutely positioned at 0×0 — it contributes no layout, only the `<defs>`.

---

## Icons (hand-rolled SVGs)

Three inline SVG icon components with animatable internal paths. Used for hover choreography where an icon font would freeze the internals.

**Where it lives**
- [app/components/icons/IconArrowRight.tsx](app/components/icons/IconArrowRight.tsx)
- [app/components/icons/IconChevronRight.tsx](app/components/icons/IconChevronRight.tsx)
- [app/components/icons/IconExternalLink.tsx](app/components/icons/IconExternalLink.tsx)

**AI notes**
- **Why hand-rolled, not an icon font:** consumers animate internal paths on hover (e.g. the chevron shaft translates, the external-link arrow lifts). Icon fonts render as a single glyph and cannot be animated piecewise.
- **Stroke uses `currentColor`** so consumers style via `color`, not a prop.
- New icons should follow the same pattern: named path elements (e.g. `.icon-chevron-shaft`) that consumer CSS can target.

---

## Small utils

Pure functions shared across routes. No UI, no state.

**Where they live**
- [app/lib/greeting.ts](app/lib/greeting.ts) — time-of-day greeting string ("Good morning", etc.). Consumed on landing.
- [app/lib/titleCase.ts](app/lib/titleCase.ts) — APA title case. Used anywhere UI copy is authored in sentence case but rendered as a title. `.t-h5` assumes inputs are already APA-cased via this function.

---

## Tab-switch motion tokens

The default feel for any tabbed section where a title/subtitle morphs and a body panel crossfades between tab states. Captures the six constants (title enter/visible/exit + transition, body variants + transition) that /rr Cards and /biconomy Demos both use.

**Where it lives**
- [app/lib/motion.ts](app/lib/motion.ts) — the six exports (`TAB_TITLE_ENTER`, `TAB_TITLE_VISIBLE`, `TAB_TITLE_EXIT`, `TAB_TITLE_TRANSITION`, `TAB_BODY_VARIANTS`, `TAB_BODY_TRANSITION`) and the shared `TAB_EASE` tuple.
- Consumers: [app/(works)/rr/components/Cards.tsx](app/(works)/rr/components/Cards.tsx), [app/(works)/biconomy/components/Demos.tsx](app/(works)/biconomy/components/Demos.tsx).

**AI notes**
- **Ease is `[0.45, 0, 0.15, 1]`, not `--ease-paper`.** This is deliberate — paper glide is for section reveals; tab switches need to feel responsive to input, not cinematic. Do not unify the two curves.
- **Both title and body wrap in `AnimatePresence mode="wait"`.** Old content fully exits before new content enters. Do not use `popLayout` here — it produces cross-fades that make the wipe feel uncertain.
- **Title wipe is clip-path from the top** (`inset(0 0 100% 0)` → `inset(0 0 0% 0)`) plus a small -6px y nudge. Duration 0.12s.
- **Body is scale 0.985 → 1 + opacity.** Duration 0.15s. The scale is small on purpose; larger values read as zoom, not settle.
- **Skip first-mount animation via a `hasSwitched` ref.** Flip it to `true` inside the tab handler; pass `initial={hasSwitched.current ? TAB_TITLE_ENTER : false}` on the title. Without this, the page-load reveal replays the wipe, which reads as a glitch.
- **Body uses `initial={false}` on the `<AnimatePresence>` wrapper** instead of a ref — the motion.div's `initial="enter"` still applies on subsequent tab switches because the key changes.
- Route-specific bits stay in the consumer: tab state, the title text source (ScrambleText in rr, plain text in biconomy), and any scroll-linked entrance applied on the outer header/body wrappers.
- **CSS mirror exists: `--ease-snap`** in `globals.css` carries the same `cubic-bezier(0.45, 0, 0.15, 1)` curve for use in CSS transitions (micro UI reactions that aren't paper settles). Keep the two in sync: if one changes, change the other. Do NOT try to unify `TAB_EASE` / `--ease-snap` with `--ease-paper` — the two tiers exist on purpose.
- The full motion object constants stay in JS because Framer Motion consumes the variants/transitions directly. Only the raw easing curve crosses the CSS/JS boundary.

---

## Train Marquee

A continuously scrolling horizontal marquee. Decelerates to a stop on hover, spring-starts on hover-out, and lets the user manually scroll to the true end of the track without exposing empty space past the last copy.

**Where it lives**
- [app/(works)/rr/components/Outcome.tsx](app/(works)/rr/components/Outcome.tsx) — motion state, event handlers, JSX (search for `Ticker motion state`)
- [app/(works)/rr/rr.css](app/(works)/rr/rr.css) — `.rr-outcome-ticker` and `.rr-outcome-ticker__track` rules (near "Bottom-edge ticker")

**AI notes**
- Three identical segments are required in the DOM. The wrap is seamless only because copy 2 lands exactly where copy 1 started; the third copy is what gives manual scroll room to reach a true "end" without content running out.
- Motion is JS-driven — a Framer Motion `motionValue` (`trackX`) advanced inside `useAnimationFrame`. Cruise velocity is `-segmentWidth / 18` px/s. The first segment's width is measured on mount via `ResizeObserver` and stored in a ref.
- Four modes tracked in refs (not React state, to avoid re-renders inside the animation loop): `running`, `stopped`, `transitioning`, `scrolling`.
- The manual-scroll transfer is the critical fix. On first user scroll event, the current `trackX` is moved into `scrollLeft` (`container.scrollLeft += -trackX`), `trackX` is zeroed, and mode flips to `scrolling`. On 650ms idle, `scrollLeft` is folded back into `trackX` via `-(scrollLeft mod segW)`, `scrollLeft` is reset to 0, and the cruise spring-start fires. Without this, the CSS translate and container scrollLeft compound and expose dead space past the last copy at max scroll.
- Spring-start: `stiffness 110, damping 14, mass 1` — roughly 12% overshoot before settling. This is an intentional deviation from the repo's default `bounce: 0` motion rule in CLAUDE.md. Do not normalize.
- Hover brake: tween, `duration 0.9s, ease [0.5, 0, 0.2, 1]` (paper ease).
- `overscroll-behavior-x: contain` on the container is load-bearing — it gives the native rubber-band at scroll extremes on Mac/iOS without chaining to the page.
- `programmaticScrollRef` guards programmatic `scrollLeft` writes from being re-interpreted as fresh user scrolls; reset in the next `requestAnimationFrame`.
- What's route-specific (parameterize on extraction): text content, the masked icon, colors, fonts, the 18s cruise duration, and the per-segment visual styling.
- What's library-ready: the state machine, the translate↔scrollLeft transfer math, the spring/brake timing constants, the `overscroll-behavior-x: contain` choice.

---

## Monostamp

A small monospace stamp — hairline-bordered pill or vertical stamp housing one or two monospace characters. Two variants (`default` horizontal pill, `tall` fixed-height vertical), two appearances (`light` for paper surfaces, `dark` for screenshots and dark artefacts), four tones (`neutral`, `mint`, `olive`, `yellow`), and an `active` prop that brightens the border + ink into the tone's "selected" palette.

**Where it lives**
- [app/components/Monostamp.tsx](app/components/Monostamp.tsx) — component, types (`MonostampTone`, `MonostampVariant`, `MonostampAppearance`, `MonostampProps`), known-consumer list in header comment.
- [app/globals.css](app/globals.css) — `.monostamp` base rule, `.monostamp--tall` override, per-tone light rules, per-tone dark-appearance rules, per-tone dark `is-active` overrides. Search for "── Monostamp ──".

**AI notes**
- Stateless. The consumer drives `active` — the component does not listen for hover or focus itself. This is deliberate so reciprocal-hover patterns (where a stamp brightens because something *else* was hovered) work by just passing `active={isHovered}`.
- **No color/border/background transitions on `.monostamp`.** An earlier version transitioned these; consumer re-renders (scroll springs, motion values, hover toggles) restart the transition every paint, stack running CSS Animation objects, and the `is-active` palette never actually applies. The palette swap is intentionally instant. Do not reintroduce a transition here — it will silently break active/rest on every dark consumer. Documented in the component header comment and in globals.css above the Monostamp block.
- Tones correspond 1:1 to the `--tone-{560,720,800,960}` token family in globals.css. To add a new tone, add all four tokens AND the matching light + dark + dark.is-active CSS rules — the naming is load-bearing (the classes are composed via template string `monostamp--${tone}`).
- The light-appearance is the base rule (paper-cream `--grey-960` fill, `--grey-880` hairline); the `monostamp--light` class exists on the element but has no explicit rules — it's reserved for future light-appearance tone-specific shell changes. The `.monostamp--dark.monostamp--<tone>` selector uses double class specificity to guarantee override of the base.
- Live consumer: /biconomy Flows note pointers (`tone="olive" variant="tall" appearance="dark"`). Queued consumer: /selected archive "opens in new tab" hint.
- Consumes `--font-mono` (Google Sans Code), loaded site-wide from `app/layout.tsx`.
- What's route-specific (none today, by design): nothing — Monostamp is already parameterized for reuse.
- What's library-ready: the full API surface. Extractable as-is once the globals.css token family is ported alongside, or rewritten with caller-supplied color tokens.

---

<!-- New entries above this line, most recent first. Keep entries tight — link to the source, don't copy it. -->
