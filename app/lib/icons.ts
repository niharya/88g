// Icon registry — the single source of truth for every Material Symbols icon
// the site renders through the symbol font (`--font-symbols`).
//
// Why this exists: icons reach the font through several class paths
// (`.material-symbols-rounded`, `.nav-icon`, route-local classes) and their
// names are supplied as literals, dynamic ternaries, and span text — so a grep
// can't reliably find them all, and a hand-maintained subset list drifts
// silently (it shipped broken three times: keyboard_arrow_*, then play_circle/
// pause_circle). This list ends that:
//
//   1. Usage is type-checked against it. `<MaterialIcon name>` and NavMarker's
//      `icon` prop both take `IconName`, so using an icon not in this list is a
//      COMPILE ERROR — you can't render a glyph the font won't have.
//   2. The font subset is built FROM this list (`npm run icons`), and a check
//      (`npm run icons:check`, run by /release + the pre-push hook) fails if the
//      shipped subset and this list diverge. So the subset can't go stale.
//
// To add an icon: add its Material Symbols ligature name here, use it via
// <MaterialIcon> / NavMarker, then run `npm run icons` to rebuild the subset.
//
// One documented exception: `close` is consumed only by a CSS `content: 'close'`
// ligature (the /rr NoteRail mobile swap), which can't be typed — it lives in
// the list (so the subset includes it) but its single usage isn't compiler-
// enforced. See docs/performance.md → "Material Symbols icons".

export const ICON_NAMES = [
  'add',
  'arrow_back',
  'arrow_downward',
  'arrow_drop_down',
  'arrow_forward',
  'article',
  'category',
  'close',
  'emergency_home',
  'info',
  'keyboard_arrow_down',
  'keyboard_arrow_up',
  'pause_circle',
  'play_circle',
  'title',
] as const

export type IconName = (typeof ICON_NAMES)[number]
