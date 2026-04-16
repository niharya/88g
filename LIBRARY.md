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

<!-- New entries above this line, most recent first. Keep entries tight — link to the source, don't copy it. -->
