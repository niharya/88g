'use client'

// Departure lift — the click-frame head of the works Exchange.
//
// TransitionSlot can only start moving once the route COMMITS: it snapshots the
// old DOM during React's render of the new one. Everything before that — RSC
// payload, client chunk, rendering /all's tree against a main thread the case
// study is already saturating — is dead time. Locally that window is ~220ms; on
// a real device it is long enough that the EXIT marker reads as broken. The held
// press fill (NavMarker `acknowledgeOnClick='press'`) is the only thing on
// screen during it, and on a small top-right marker that is not enough.
//
// So the fix is the same one landing → /all got (docs/navigation-choreography
// §5.5–5.6, /all ANOMALIES → "Route hold"): put the feedback on the DEPARTING
// side, at click time. The mechanism differs because the destination does —
// landing → /all crosses into a fresh shell and can re-arm the loader Hold;
// works → works stays inside TransitionSlot, whose idiom is the Exchange. So
// instead of a loader we start the Exchange's own first beat (Phase A, "content
// dims") on the click frame, and hand it to TransitionSlot at commit.
//
// The lift lives on `.transition-slot` — NOT `.transition-pane`, which
// TransitionSlot clones (the clone would carry the class and snap straight to
// the end state), and NOT `.workbench`, which would take the nav shell down
// with the page. The slot is the ghost's parent and the pane's, so both the
// outgoing content and the incoming content sit inside it, while ShellNav's
// markers stay lit above.
//
// Opacity only. A transform here would make the slot a containing block and
// trap every `position: fixed` descendant a route owns (the /all docked ticket
// morph, chapter flyouts) mid-navigation.
//
// Three releases, mirroring markToBench's contract: (1) commit — TransitionSlot
// calls landDepartureLift and continues the ghost from where the dim got to;
// (2) an 8s failsafe matching --dur-gate-cap, so a navigation that never lands
// doesn't strand a dimmed page; (3) pageshow/popstate for the bfcache trip back.
//
// STALL ESCALATION. The lift is the right idiom while the Exchange is coming —
// but when the pre-commit dead time stretches (slow network fetching the RSC
// payload, a saturated main thread), a 25% dim is all the visitor sees and the
// EXIT reads as broken. So if the route has not committed within STALL_MS, the
// lift escalates to the loader Hold: the same body-appended `.route-hold`
// marker markToBench mounts (app/page.tsx), same id, so it inherits ALL the
// existing release wiring — useBenchDock removes it on /all arrival, and the
// clear() below covers commit/failsafe/bfcache. While mounted, the globals.css
// route-hold block hides `.workbench` and re-arms the `.page-boot` patience
// mark; on release the standard reveal replays, so a held EXIT lands with the
// Place gesture. A commit inside STALL_MS never mounts it — the Exchange plays
// untouched, which is why this is an escalation, not a replacement (the header
// above still holds: the Exchange is the works idiom; the Hold is for stalls).
// EXIT is armDepartureLift's only caller and always targets /all, hence the
// fixed `route-hold--all` palette; a second caller with a different
// destination must parameterize it.

import type { MouseEvent } from 'react'

const CLASS = 'is-departing'
const FAILSAFE_MS = 8000 // matches --dur-gate-cap and the route-hold failsafe
const STALL_MS = 700 // no commit by here → the wait already reads as broken
const HOLD_ID = 'route-hold-departure' // shared with markToBench — same wiring

let failsafe: number | undefined
let stall: number | undefined

const mountHold = () => {
  if (document.getElementById(HOLD_ID)) return
  const hold = document.createElement('div')
  hold.id = HOLD_ID
  hold.className = 'route-hold route-hold--all'
  hold.setAttribute('aria-hidden', 'true')
  document.body.appendChild(hold)
}

const findSlot = () => document.querySelector<HTMLElement>('.transition-slot')

const clear = (el?: HTMLElement | null) => {
  ;(el ?? findSlot())?.classList.remove(CLASS)
  if (failsafe !== undefined) {
    window.clearTimeout(failsafe)
    failsafe = undefined
  }
  if (stall !== undefined) {
    window.clearTimeout(stall)
    stall = undefined
  }
  document.getElementById(HOLD_ID)?.remove()
  window.removeEventListener('pageshow', onRestore)
  window.removeEventListener('popstate', onRestore)
}

// Stable identity for add/removeEventListener, and it swallows the event object
// so it can never be mistaken for the element argument.
const onRestore = () => clear()

/**
 * Start the lift. Safe to call on any works→works navigating click; a
 * modifier/middle click opens elsewhere, so this page isn't leaving and the
 * lift is skipped.
 */
export function armDepartureLift(e?: MouseEvent) {
  if (e && (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)) return
  const slot = findSlot()
  if (!slot || slot.classList.contains(CLASS)) return

  slot.classList.add(CLASS)
  failsafe = window.setTimeout(onRestore, FAILSAFE_MS)
  stall = window.setTimeout(mountHold, STALL_MS)
  window.addEventListener('pageshow', onRestore)
  window.addEventListener('popstate', onRestore)
}

/**
 * End the lift and report the opacity it had actually reached, so the caller can
 * resume from there instead of popping the page back to full brightness.
 * Returns 1 when no lift was armed — the pre-existing behaviour, unchanged.
 */
export function landDepartureLift(slot: HTMLElement | null): number {
  const lifted = !!slot && slot.classList.contains(CLASS)
  const reached = lifted ? parseFloat(getComputedStyle(slot).opacity) || 1 : 1
  clear(slot)
  return reached
}
