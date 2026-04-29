'use client'

// CrossShellEntryFader — incoming half of the cross-shell crossfade.
//
// Mounted by the destination's layout (e.g. /marks). On first mount,
// finds the veil that useCrossShellNav appended to document.body, takes
// ownership of it, and fades it out. If no veil exists (direct URL
// entry, refresh, or a non-cross-shell navigation), this is a no-op.
//
// The fade-out duration here MUST match the CSS transition on
// .cross-shell-veil's default state (700 ms) so the cleanup setTimeout
// removes the node exactly when the opacity transition ends.
//
// See CLAUDE.md → "Cross-shell navigation".

import { useEffect } from 'react'

const VEIL_ID = 'cross-shell-veil'
const FADE_OUT_MS = 700  // matches --marks-veil-out and the CSS default

export default function CrossShellEntryFader() {
  useEffect(() => {
    const veil = document.getElementById(VEIL_ID)
    if (!veil) return

    // The default state (no data-phase) has opacity:0 and a 700ms
    // transition. Removing the phase triggers the fade-out.
    delete veil.dataset.phase

    const cleanup = window.setTimeout(() => veil.remove(), FADE_OUT_MS + 50)
    return () => window.clearTimeout(cleanup)
  }, [])

  return null
}
