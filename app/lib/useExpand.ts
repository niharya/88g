'use client'

// useExpand — shared expand/collapse primitive for in-place overlays
// that live inside their parent's flow (no top-layer / no <dialog>).
//
// We deliberately do *not* use HTML <dialog>.showModal(). Both
// consumers (`/rr` Intro `.rr-enlarged` sketches strip and `/rr`
// Outcome `.rr-rules-group` rules panel) want the overlay to:
//
//   • clip to its mat (so the user can keep scrolling the page),
//   • scroll *with* the canvas as the page moves,
//   • let the route header / nav stay reachable,
//
// all of which fight the top-layer behaviour of `showModal()`
// (viewport-fixed containing block, viewport-wide ::backdrop, body
// scroll left unlocked yet visually decoupled). The overlay is
// in-document-flow; what makes it feel modal is the receding
// surroundings, not the platform's modal pseudo-classes.
//
// The hook owns four pieces of behaviour, in order of importance:
//
//   1. Escape dismiss (document keydown).
//   2. Click-outside dismiss (capture-phase document pointerdown,
//      rAF-deferred so the click that *triggered* expand doesn't
//      immediately collapse).
//   3. Inert siblings — when expanded, the hook walks the expanded
//      element's parent, marks every other child as `inert`, and
//      restores them on collapse. This gives us "everything else
//      recedes" semantics for free: outside content stays visible
//      (so the backseat dim still reads), but it can't be tabbed,
//      clicked, or activated. Pairs with the existing `:has()` mat
//      dim as the visual half of the same idea.
//   4. Focus save / restore — the trigger element's focus state is
//      captured on expand, the first focusable inside the overlay
//      is auto-focused, and on collapse focus returns to the trigger.
//      Mirrors what showModal() does without paying its costs.
//
// Motion stays with the consumer.

import { useCallback, useEffect, useRef, useState } from 'react'

export function useExpand<T extends HTMLElement = HTMLElement>() {
  const [expanded, setExpanded] = useState(false)
  // `isClosing` is true from the moment expanded flips true→false until
  // the consumer calls `markClosingDone()` (typically from
  // onAnimationComplete on their exit animation). Batched with the
  // setExpanded(false) call below, so the consumer sees expanded=false
  // AND isClosing=true in the same render — no render gap where FM
  // could snap a scroll-linked style over a half-finished spring.
  const [isClosing, setIsClosing] = useState(false)
  const ref = useRef<T>(null)

  // Internal setter — every code path that closes goes through this so
  // isClosing gets set in the same batch as expanded.
  const collapseInternal = useCallback(() => {
    setExpanded((wasOpen) => {
      if (wasOpen) setIsClosing(true)
      return false
    })
  }, [])

  const expand = useCallback(() => setExpanded(true), [])
  const collapse = useCallback(() => collapseInternal(), [collapseInternal])
  const toggle = useCallback(() => {
    setExpanded((e) => {
      if (e) setIsClosing(true)
      return !e
    })
  }, [])
  const markClosingDone = useCallback(() => setIsClosing(false), [])

  // Escape dismiss — independent effect so a future need to gate it
  // (e.g. ignore Escape when an inner control owns it) is a one-line
  // change here.
  useEffect(() => {
    if (!expanded) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') collapseInternal()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [expanded, collapseInternal])

  // Click-outside, focus management, inert siblings, scroll-snap pause
  // — all share the same lifecycle and the same `node` reference, so
  // they belong in one effect.
  useEffect(() => {
    if (!expanded) return
    const node = ref.current
    if (!node) return

    // ── Pause section-snap ──────────────────────────────────────
    // The /rr Sheet uses `useDominanceSnap`. While the user is
    // inspecting an overlay we don't want the page to snap to the
    // chapter top after their next idle moment — they're working
    // inside the chapter, not navigating between chapters. The hook
    // reads this body class as a global "no-snap" signal.
    document.body.classList.add('is-overlay-open')

    // ── Click-outside ────────────────────────────────────────────
    // Capture phase + rAF defer: capture so we see the event before
    // any inner handler can stopPropagation it; defer so the click
    // that triggered expand (which may still be propagating when
    // this effect runs) doesn't immediately re-collapse.
    const onPointerDown = (e: PointerEvent) => {
      if (!node.contains(e.target as Node)) collapseInternal()
    }
    const id = requestAnimationFrame(() => {
      document.addEventListener('pointerdown', onPointerDown, true)
    })

    // ── Inert siblings ──────────────────────────────────────────
    // Walk the parent and mark every non-self child as inert. We
    // record what we toggled so collapse restores the prior state
    // (don't trample siblings that were already inert for some
    // other reason).
    const inerted: HTMLElement[] = []
    const parent = node.parentElement
    if (parent) {
      for (const sib of Array.from(parent.children)) {
        if (sib === node) continue
        if (!(sib instanceof HTMLElement)) continue
        if (sib.inert) continue
        sib.inert = true
        inerted.push(sib)
      }
    }

    // ── Focus save + auto-focus first focusable ─────────────────
    const previouslyFocused = document.activeElement as HTMLElement | null
    const firstFocusable = node.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    // Defer one frame so React has committed the children DOM.
    const focusId = requestAnimationFrame(() => {
      firstFocusable?.focus()
    })

    return () => {
      cancelAnimationFrame(id)
      cancelAnimationFrame(focusId)
      document.removeEventListener('pointerdown', onPointerDown, true)
      for (const sib of inerted) sib.inert = false
      document.body.classList.remove('is-overlay-open')
      // Only restore focus if focus is still inside the overlay we
      // owned — otherwise the user has already moved focus elsewhere
      // and we shouldn't fight them.
      if (previouslyFocused && node.contains(document.activeElement)) {
        previouslyFocused.focus()
      }
    }
  }, [expanded])

  return { expanded, isClosing, expand, collapse, toggle, ref, markClosingDone }
}
