// Route hold — the soft-navigation "Hold" for /all
// (docs/navigation-choreography.md §5.5).
//
// This loading boundary covers the one COLD entry into the works shell:
// landing → /all. Within-shell navigations never stall here — TransitionSlot
// prefetches /all, /rr, and /biconomy on mount — and scoping the boundary to
// this route keeps the fallback out of TransitionSlot's ghost choreography
// on works↔works switches.
//
// The div itself renders nothing visible. Its PRESENCE re-arms the root
// layout's existing .page-boot loader via `:root:has(.route-hold)` in
// globals.css (Page boot → Route hold section): loader fades in after
// --dur-loader-appear, the workbench holds hidden, and when the real page
// replaces this fallback the standard fonts-ready exit + reveal replay.
// The `--all` modifier keys the /all loader palette, since the page root
// (.bench-workbench) doesn't exist yet while this shows.
export default function AllLoading() {
  return <div className="route-hold route-hold--all" aria-hidden="true" />
}
