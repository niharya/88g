// Single source of truth for the showcase's mobile breakpoint.
//
// JS surfaces (Showcase grid measurement, ShowcasePiece activate logic,
// scroll-lock effect) all read MOBILE_BP through this file. The CSS side
// — @media rules in showcase.css — must stay in sync by hand; if you
// change MOBILE_BP here, grep `(max-width: 767px), (max-height: 500px)`
// in showcase.css and update those blocks too.
//
// The clause is OR'd: width ≤ 767 catches phone portrait; height ≤ 500
// catches phones in landscape (Pro Max 932×430). Matches the
// docs/responsive.md → "Landscape-phone clause" rule the rest of the
// portfolio follows.

export const MOBILE_BP = '(max-width: 767px), (max-height: 500px)'

export function isMobileViewport(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia(MOBILE_BP).matches
}
