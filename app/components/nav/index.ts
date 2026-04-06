// nav/index.ts — public API of the shared sheet-stack navigation module
//
// Import from here, not from individual files.
//
// Styles: import './nav.css' in your route layout to activate the nav system.
// Data:   each route defines its own Chapter[] in its nav/chapters.ts.
// Sync:   MARKER_TOP in ChapterMarker.tsx must match --marker-top in nav.css (24px).

export { default as ChapterMarker } from './ChapterMarker'
export { default as ProjectMarker } from './ProjectMarker'
export { default as ExitMarker }    from './ExitMarker'
export type { Chapter }             from './types'
