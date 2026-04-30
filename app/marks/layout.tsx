// Marks route layout — pure canvas, outside the (works) workbench shell.
//
// /marks is a completely custom page: no 8px viewport frame, no workbench
// padding, no TransitionSlot, no ProjectMarker. The only nav chrome we keep
// is the EXIT marker so users can get back to /selected.
//
// nav.css is loaded here because it used to come from the (works) shared
// layout and we need it for the EXIT marker + .nav-icon ligature styles.

import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import '../components/nav/nav.css'
import '../components/NavMarker/navmarker.css'
import { CrossShellEntryFader } from '../components/CrossShellVeil'
import MarksExitMarker from './components/MarksExitMarker'
import './marks.css'

// Per-route theme color override. /marks sits on a deep gradient instead of
// the warm workbench, so the mobile chrome should match the dark canvas
// rather than the off-white root default. Other routes inherit the root
// `#f2f3ef` from app/layout.tsx.
export const viewport: Viewport = {
  themeColor: '#1a1a1a',
}

export default function MarksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CrossShellEntryFader />
      <MarksExitMarker />
      {children}
    </>
  )
}
