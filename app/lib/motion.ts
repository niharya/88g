// Tab-switch motion tokens — shared across routes with tabbed sections.
//
// Ease: [0.45, 0, 0.15, 1] — snappier than --ease-paper on purpose.
// Mirrors --ease-snap in globals.css. Keep the two in sync: if one
// changes, change the other.
// Paper glide belongs to section reveals; tab switches need to feel
// responsive to input, not cinematic. Do not unify the two curves.
//
// Durations (0.12s title / 0.15s body) are intentionally below the 0.5–0.9s
// paper-glide range called out in CLAUDE.md. Tab switches need to complete
// inside a tap's attention window. They also *stack* because
// `AnimatePresence mode="wait"` runs exit before enter — total switch is
// ~0.24–0.30s. Do not shorten further without reconsidering the pair.
//
// Usage:
//   - Wrap both the title and the body in AnimatePresence mode="wait".
//   - Title: motion.p with initial={hasSwitched ? TAB_TITLE_ENTER : false},
//     animate=TAB_TITLE_VISIBLE, exit=TAB_TITLE_EXIT, transition=TAB_TITLE_TRANSITION.
//   - Body: motion.div with variants=TAB_BODY_VARIANTS, initial="enter",
//     animate="active", exit="exit", transition=TAB_BODY_TRANSITION.
//   - A `hasSwitched` ref flipped in the tab handler skips the first-mount wipe.
//
// Consumers: /rr Cards.tsx, /biconomy Demos.tsx.

export const TAB_EASE = [0.45, 0, 0.15, 1] as const

export const TAB_TITLE_ENTER   = { opacity: 0, y: -6, clipPath: 'inset(0 0 100% 0)' }
export const TAB_TITLE_VISIBLE = { opacity: 1, y: 0,  clipPath: 'inset(0 0 0% 0)' }
export const TAB_TITLE_EXIT    = { opacity: 0, y: -6, clipPath: 'inset(0 0 100% 0)' }
export const TAB_TITLE_TRANSITION = { duration: 0.12, ease: TAB_EASE }

export const TAB_BODY_VARIANTS = {
  enter:  { opacity: 0, scale: 0.985 },
  active: { opacity: 1, scale: 1 },
  exit:   { opacity: 0, scale: 0.985 },
}
export const TAB_BODY_TRANSITION = { duration: 0.15, ease: TAB_EASE }
