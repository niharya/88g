// /shape-of-product — musings page outside the (works) shell.
// Pure canvas like /marks: no workbench frame, no TransitionSlot, no
// chapter-marker / nav-sled. Navigation is the SopNavRow pair (Nihar
// project-marker → /, "Shape of Product" static chapter-marker → "you
// are here"). CrossShellEntryFader is mounted in case a future entry
// link from another route uses `useCrossShellNav` to set up a veil; if
// no veil is in flight at mount time, the fader is a harmless no-op.

import type { ReactNode } from 'react'
import type { Viewport } from 'next'
import '../components/nav/nav.css'
import '../components/NavMarker/navmarker.css'
import { CrossShellEntryFader } from '../components/CrossShellVeil'
import SopNavRow from './components/SopNavRow'
import './shape-of-product.css'

// Mobile chrome theme color matches the route's mat ground (`--mat-bg`),
// not the global default `#f2f3ef`. Same pattern /marks uses — the
// browser URL bar shouldn't paint a different shade than the page.
export const viewport: Viewport = {
  themeColor: '#f9f9f7',
}

export default function ShapeOfProductLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <CrossShellEntryFader />
      <SopNavRow />
      {children}
    </>
  )
}
