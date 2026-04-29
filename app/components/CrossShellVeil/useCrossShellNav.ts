'use client'

// useCrossShellNav — outgoing half of the cross-shell crossfade.
//
// Cross-shell = navigation between routes that don't share a layout
// boundary, so TransitionSlot's snapshot-clone trick can't run. Instead
// of trying to fake the slide-between-sheets feel, we fade through black:
// the outgoing page fades to opaque, navigation happens behind the veil,
// the destination's CrossShellEntryFader takes ownership of the same
// veil and fades it back out. One element, two halves, one beat.
//
// The veil is appended directly to document.body so it survives the
// layout swap that Next does on router.push. The destination finds it
// by id and animates it out.
//
// See CLAUDE.md → "Cross-shell navigation" for when to use this.

import { useRouter } from 'next/navigation'
import { useCallback } from 'react'

const VEIL_ID = 'cross-shell-veil'
const FADE_IN_MS = 900   // matches --marks-veil-in

export function useCrossShellNav(href: string) {
  const router = useRouter()

  return useCallback(
    (e: React.MouseEvent) => {
      // Allow modifier-clicks (open in new tab) to bypass the veil and
      // go through the normal anchor behavior.
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return
      e.preventDefault()

      // If a veil already exists (rapid double-click), don't stack.
      if (document.getElementById(VEIL_ID)) return

      const veil = document.createElement('div')
      veil.id = VEIL_ID
      veil.className = 'cross-shell-veil'
      veil.setAttribute('aria-hidden', 'true')
      document.body.appendChild(veil)

      // Force layout so the next phase change actually transitions
      // (browsers batch attribute changes that happen in the same frame).
      void veil.offsetHeight
      veil.dataset.phase = 'in'

      window.setTimeout(() => {
        // Hold opaque during nav — fade-out is owned by the destination.
        veil.dataset.phase = 'hold'
        router.push(href)
      }, FADE_IN_MS)
    },
    [href, router],
  )
}
