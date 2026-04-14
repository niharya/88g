'use client'

// TransitionSlot — page transition using pre-render DOM snapshots.
//
// Strategy:
//   1. During render (before React commits new DOM), clone the current
//      content and capture scroll position while the old DOM is intact.
//   2. In useLayoutEffect (before paint), append the clone as a ghost
//      and animate it out while animating the new content in.
//
// Choreography: two clear motions with breathing room between them.
//   EXIT:  ghost content dims → ghost recedes
//   PAUSE: brief stillness
//   ENTER: new page emerges
//
// Spatial model: /selected lives ABOVE project pages.
//   selected → project: ghost exits UP, new enters from BELOW
//   project → selected: ghost exits DOWN, new enters from ABOVE

import { useRef, useEffect, useLayoutEffect, type ReactNode } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useRouter } from 'next/navigation'

const DOCK_OFFSET = 50

// ── Easing ─────────────────────────────────────────────────────────────
// One curve: confident start, long gentle deceleration.
// Matches --ease-paper in globals.css.
const EASE = 'cubic-bezier(0.5, 0, 0.2, 1)'

// ── Ghost exit ─────────────────────────────────────────────────────────
const GHOST_CONTENT_DUR = 200      // inner content dims
const GHOST_CONTENT_Y   = 8        // px, subtle
const GHOST_DUR         = 380      // ghost recedes
const GHOST_DELAY       = 100      // after content starts dimming
const GHOST_Y           = 24       // px, translate only

// ── New content entrance ───────────────────────────────────────────────
const ENTER_DELAY       = 460      // ghost clears + breathing room
const ENTER_DUR         = 520      // sheet emerges
const ENTER_Y           = 28       // px, translate only
const ENTER_CONTENT_DELAY = 520    // content settles slightly after mat
const ENTER_CONTENT_DUR = 460

// ── Non-sheet entrance (e.g. /selected) ────────────────────────────────
const ENTER_FLAT_DELAY  = 460
const ENTER_FLAT_DUR    = 520

// ── Helpers ────────────────────────────────────────────────────────────
const isProject = (seg: string | null) => seg === 'rr' || seg === 'biconomy'

function animateAll(
  els: NodeListOf<Element> | Element[],
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  els.forEach(el => (el as HTMLElement).animate(keyframes, options))
}

export default function TransitionSlot({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const router = useRouter()
  const slotRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevSegment = useRef(segment)
  const snapshotRef = useRef<HTMLElement | null>(null)
  const scrollRef = useRef(0)
  const isFirstRender = useRef(true)

  // ── Prefetch project routes for smoother transitions ─────────────────
  useEffect(() => {
    router.prefetch('/rr')
    router.prefetch('/biconomy')
    router.prefetch('/selected')
  }, [router])

  // ── Capture snapshot + scroll during render ──────────────────────────
  //    This runs BEFORE React commits the new DOM, so scrollY is the
  //    unclamped value and the clone reflects what's actually on screen.
  if (!isFirstRender.current && segment !== prevSegment.current && contentRef.current) {
    snapshotRef.current = contentRef.current.cloneNode(true) as HTMLElement
    scrollRef.current = window.scrollY
  }

  // ── Transition choreography ──────────────────────────────────────────
  //    useLayoutEffect runs after commit but before paint. The ghost is
  //    set up and scroll is restored before the user sees anything change.
  useLayoutEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }

    if (prevSegment.current === segment) return
    const oldSegment = prevSegment.current
    prevSegment.current = segment

    const slot = slotRef.current
    const content = contentRef.current
    const ghost = snapshotRef.current
    snapshotRef.current = null
    if (!slot || !content || !ghost) return

    const oldScroll = scrollRef.current
    const scrollTarget = isProject(segment) ? DOCK_OFFSET : 0

    // ── 1. Maintain document height ───────────────────────────────────
    //    New route content may be shorter (e.g. project → /selected),
    //    which clamps scroll. Setting minHeight keeps the document tall
    //    enough to hold the old scroll position until the ghost exits.
    slot.style.minHeight = `${oldScroll + window.innerHeight}px`
    window.scrollTo({ top: oldScroll, behavior: 'instant' as ScrollBehavior })

    // ── 2. Set up ghost ───────────────────────────────────────────────
    //    Absolute inside the slot — same containing block as the original
    //    content, so widths, padding, and alignment all match exactly.
    ghost.classList.add('transition-ghost')
    ghost.setAttribute('aria-hidden', 'true')
    ghost.style.position = 'absolute'
    ghost.style.top = '0'
    ghost.style.left = '0'
    ghost.style.width = '100%'
    ghost.style.zIndex = '2'
    ghost.style.pointerEvents = 'none'
    ghost.style.transformOrigin = 'top center'
    slot.appendChild(ghost)

    // ── 3. Direction ──────────────────────────────────────────────────
    const goingDeeper = !isProject(oldSegment) && isProject(segment)
    const ghostDir = goingDeeper ? -1 : 1
    const enterDir = goingDeeper ? 1 : -1

    const wb = document.querySelector('.workbench')
    wb?.classList.add('transitioning')

    // ── 4. GHOST EXIT ─────────────────────────────────────────────────
    //    Phase A: inner content dims
    const ghostContentEls = ghost.querySelectorAll(
      '.sheet > :not(.nav-sled), .selected-workbench > *'
    )
    animateAll(ghostContentEls, [
      { opacity: '1', transform: 'translateY(0)' },
      { opacity: '0', transform: `translateY(${ghostDir * GHOST_CONTENT_Y}px)` },
    ], {
      duration: GHOST_CONTENT_DUR,
      easing: EASE,
      fill: 'forwards',
    })

    //    Phase B: ghost recedes
    const ghostExit = ghost.animate([
      { transform: 'translateY(0)', opacity: '1' },
      { transform: `translateY(${ghostDir * GHOST_Y}px)`, opacity: '0' },
    ], {
      duration: GHOST_DUR,
      easing: EASE,
      delay: GHOST_DELAY,
      fill: 'forwards',
    })
    ghostExit.onfinish = () => ghost.remove()

    // ── 4b. Scroll to target during breathing room ────────────────────
    //    Ghost is nearly invisible, new content held at opacity 0 by
    //    fill:both. Safe to jump scroll without visible shift.
    //    Also release the minHeight — no longer needed.
    setTimeout(() => {
      window.scrollTo({ top: scrollTarget, behavior: 'instant' as ScrollBehavior })
      slot.style.minHeight = ''
    }, GHOST_DELAY + GHOST_DUR - 40)

    // ── 5. NEW CONTENT ENTER ──────────────────────────────────────────
    const sheets = content.querySelectorAll('.sheet')
    const firstSheet = sheets[0] as HTMLElement | undefined
    const hasSheets = !!firstSheet

    let totalDur: number

    if (hasSheets) {
      firstSheet.animate([
        { opacity: '0', transform: `translateY(${enterDir * ENTER_Y}px)` },
        { opacity: '1', transform: 'translateY(0)' },
      ], {
        duration: ENTER_DUR,
        easing: EASE,
        delay: ENTER_DELAY,
        fill: 'both',
      })

      const sheetContent = firstSheet.querySelectorAll(':scope > :not(.nav-sled)')
      animateAll(sheetContent, [
        { opacity: '0', transform: `translateY(${enterDir * 10}px)` },
        { opacity: '1', transform: 'translateY(0)' },
      ], {
        duration: ENTER_CONTENT_DUR,
        easing: EASE,
        delay: ENTER_CONTENT_DELAY,
        fill: 'both',
      })

      totalDur = ENTER_CONTENT_DELAY + ENTER_CONTENT_DUR
    } else {
      content.animate([
        { opacity: '0', transform: `translateY(${enterDir * ENTER_Y}px)` },
        { opacity: '1', transform: 'translateY(0)' },
      ], {
        duration: ENTER_FLAT_DUR,
        easing: EASE,
        delay: ENTER_FLAT_DELAY,
        fill: 'both',
      })

      totalDur = ENTER_FLAT_DELAY + ENTER_FLAT_DUR
    }

    // ── 6. Clean up ───────────────────────────────────────────────────
    setTimeout(() => {
      wb?.classList.remove('transitioning')
      if (firstSheet) firstSheet.classList.add('revealed')
    }, totalDur + 30)

  }, [segment])

  return (
    <div ref={slotRef} className="transition-slot">
      <div ref={contentRef} className="transition-pane">
        {children}
      </div>
    </div>
  )
}
