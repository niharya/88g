// Marks route layout — pure canvas, outside the (works) workbench shell.
//
// /marks is a completely custom page: no 8px viewport frame, no workbench
// padding, no TransitionSlot, no ProjectMarker. The only nav chrome we keep
// is the EXIT marker so users can get back to /selected.
//
// Font gating (`.fonts-ready`) is applied in the root layout, so the same
// opacity reveal still participates here. nav.css is loaded here because
// it used to come from the (works) shared layout and we need it for the
// EXIT marker + .nav-icon ligature styles.

import type { ReactNode } from 'react'
import '../components/nav/nav.css'
import '../components/NavMarker/navmarker.css'
import ExitMarker from '../components/nav/ExitMarker'
import './marks.css'

export default function MarksLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <ExitMarker />
      {children}
    </>
  )
}
