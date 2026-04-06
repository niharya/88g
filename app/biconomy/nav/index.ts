// nav/index.ts — public API of the sheet-stack navigation module
//
// Import from here, not from individual files:
//   import { Sheet, ProjectMarker, ExitMarker } from '@/app/biconomy/nav'
//   import type { Chapter } from '@/app/biconomy/nav'
//
// Behavior lives in:
//   ChapterMarker.tsx  — sticky marker, tray, docking, scroll-driven arrow, tilt
//   ProjectMarker.tsx  — fixed left marker, measures --project-marker-right
//   ExitMarker.tsx     — fixed right marker, links to /selection
//
// Styles live in:
//   nav.css            — import in your route layout to activate the nav system
//
// Data contract:
//   chapters.ts        — page-specific Chapter[] array (id, title, year)
//   MARKER_TOP         — must match --marker-top in nav.css (currently 24px)

export { default as ChapterMarker } from './ChapterMarker'
export { default as ProjectMarker } from './ProjectMarker'
export { default as ExitMarker }    from './ExitMarker'
export type { Chapter }             from './chapters'
