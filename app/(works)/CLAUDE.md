# (works) shell — protective digest

Part of the 88g doc family (root `CLAUDE.md` → "The document family"). Auto-loads whenever files under `app/(works)/` are touched — this node covers the shell itself (layout, ShellNav, TransitionSlot); each route inside has its own digest (`rr/CLAUDE.md`, `biconomy/CLAUDE.md`, `bench/CLAUDE.md`).

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
