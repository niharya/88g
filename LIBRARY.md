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
- **These are JS tokens, not CSS.** Framer Motion consumes the objects directly. Do not mirror them into `globals.css` as custom properties, and do not try to unify `TAB_EASE` with `--ease-paper` — the two tiers exist on purpose.

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
