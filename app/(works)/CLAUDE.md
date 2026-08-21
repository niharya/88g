# (works) shell — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/(works)/` are touched — this node covers the shell itself (layout, ShellNav, TransitionSlot); each route inside has its own digest (`rr/CLAUDE.md`, `biconomy/CLAUDE.md`, `all/CLAUDE.md`).

## Hard rules

- Routes inside this shell cross between each other via **TransitionSlot** only; routes outside (`/marks`, `/shape-of-product`) use **CrossShellVeil**. Never mix the two idioms on one route, and never add outside-route wiring (e.g. marks) to ShellNav or TransitionSlot — that's a re-architecture.
- TransitionSlot stays on Framer Motion (not the View Transitions API) — load-bearing and final.

## Don't-touch digest (TransitionSlot internals)

- Capture `window.scrollY` during render — an effect reads a browser-clamped value.
- Keep the ghost `position: absolute` (fixed shifts horizontally).
- Keep `slot.style.minHeight` set before the route swap (prevents scroll clamping).
- Use `useLayoutEffect`, not `useEffect` (avoids a one-frame flash).
- Keep `scrollbar-gutter: stable` on html in globals.css (prevents ~15px transition jitter).
- The `EASE` constant mirrors `--ease-paper` — keep them in sync.
- TransitionSlot reveals only the first sheet; below-fold sheets belong to `useReveal` — the `.transitioning` class on `.workbench` is the contract between them.
- The departure lift (`departureLift.ts`) and TransitionSlot are one mechanism, not two: the EXIT click arms `.is-departing` on `.transition-slot` and TransitionSlot's `landDepartureLift(slot)` ends it and feeds the reached opacity into the ghost's recede keyframe. Drop either half and the click goes dead again or the page pops back to full brightness at commit.
- `landDepartureLift` must stay ABOVE the `if (!slot || !content || !ghost) return` bail and BEFORE the ghost is appended — otherwise a bailed transition strands a dimmed page until the 8s failsafe, or the ghost inherits `.is-departing` and dims twice.
- The ghost recede keyframe uses `fill: 'both'`, not `'forwards'` — `'forwards'` leaves the ghost at full opacity through `GHOST_DELAY` and flashes the lifted page back on.
- The lift is opacity-only and lives on `.transition-slot`, never on `.transition-pane` (TransitionSlot clones it — the clone would snap to the end state) and never as a transform (it would make the slot a containing block and trap every `position: fixed` descendant mid-navigation).
