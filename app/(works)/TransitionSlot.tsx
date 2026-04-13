'use client'

// TransitionSlot — page transition using pre-render DOM snapshots.
//
// Strategy:
//   1. During render (before React commits new DOM), clone the current
//      content as a snapshot of the outgoing page.
//   2. In useEffect (after commit), append the clone as a ghost and
//      animate it out (staggered) while animating the new content in.
//
// Choreography (going deeper — selected → project):
//   EXIT:  ghost content fades → ghost mats slide away
//   ENTER: mats slide in → content settles → markers dock
//
// Choreography (going back — project → selected):
//   EXIT:  ghost content fades → ghost mats slide away
//   ENTER: content slides in from above
//
// Spatial model: /selected lives ABOVE project pages.
//   selected → project: ghost exits UP, new enters from BELOW
//   project → selected: ghost exits DOWN, new enters from ABOVE

import { useRef, useEffect, type ReactNode } from 'react'
import { useSelectedLayoutSegment } from 'next/navigation'
import { useRouter } from 'next/navigation'

const DOCK_OFFSET = 50
const EASE = 'cubic-bezier(0.22, 1, 0.36, 1)'

// ── Timing constants ───────────────────────────────────────────────────
// Ghost exit
const GHOST_CONTENT_DUR  = 200      // content inside ghost fades
const GHOST_CONTENT_Y    = 14       // px, direction applied at runtime
const GHOST_MAT_DELAY    = 100      // after content starts fading
const GHOST_MAT_DUR      = 340
const GHOST_MAT_Y        = '6vh'    // direction applied at runtime
const GHOST_MAT_SCALE    = '0.96'

// New content entrance (project pages with sheets)
const ENTER_MAT_DELAY    = 160      // wait for ghost to mostly clear
const ENTER_MAT_DUR      = 440
const ENTER_MAT_Y        = '40px'   // direction applied at runtime
const ENTER_MAT_SCALE    = '0.97'
const ENTER_CONTENT_DELAY = 300     // after mats start appearing
const ENTER_CONTENT_DUR  = 380
const ENTER_CONTENT_Y    = 10       // px
const ENTER_MARKER_DELAY = 420      // markers dock last
const ENTER_MARKER_DUR   = 320
const ENTER_MARKER_Y     = 10       // px, moves down from above

// New content entrance (non-sheet pages like /selected)
const ENTER_FLAT_DELAY   = 160
const ENTER_FLAT_DUR     = 480

// ── Helpers ────────────────────────────────────────────────────────────
const isProject = (seg: string | null) => seg === 'rr' || seg === 'biconomy'

/** Animate a set of elements with shared keyframes + options. */
function animateAll(
  els: NodeListOf<Element> | Element[],
  keyframes: Keyframe[],
  options: KeyframeAnimationOptions,
) {
  const anims: Animation[] = []
  els.forEach(el => {
    anims.push((el as HTMLElement).animate(keyframes, options))
  })
  return anims
}

export default function TransitionSlot({ children }: { children: ReactNode }) {
  const segment = useSelectedLayoutSegment()
  const router = useRouter()
  const slotRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const prevSegment = useRef(segment)
  const snapshotRef = useRef<HTMLElement | null>(null)
  const isFirstRender = useRef(true)

  // ── Prefetch project routes for smoother transitions ─────────────────
  useEffect(() => {
    router.prefetch('/rr')
    router.prefetch('/biconomy')
    router.prefetch('/selected')
  }, [router])

  // ── Capture snapshot during render (before React commits new DOM) ────
  if (!isFirstRender.current && segment !== prevSegment.current && contentRef.current) {
    snapshotRef.current = contentRef.current.cloneNode(true) as HTMLElement
  }

  useEffect(() => {
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

    // ── 1. Set up ghost element ────────────────────────────────────────
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

    // ── 2. Direction ───────────────────────────────────────────────────
    const goingDeeper = !isProject(oldSegment) && isProject(segment)
    // Ghost exits opposite to spatial direction: deeper = up, back = down
    const ghostY = goingDeeper ? `-${GHOST_MAT_Y}` : GHOST_MAT_Y
    const ghostContentDir = goingDeeper ? -1 : 1

    // ── 3. Disable scroll snap & set scroll position early ────────────
    //    Ghost overlay hides the scroll jump.
    const wb = document.querySelector('.workbench')
    wb?.classList.add('transitioning')

    if (isProject(segment)) {
      window.scrollTo({ top: DOCK_OFFSET, behavior: 'instant' as ScrollBehavior })
    } else {
      window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
    }

    // ── 4. GHOST EXIT (staggered) ─────────────────────────────────────
    //    Phase A: content inside ghost fades out
    const ghostContentEls = ghost.querySelectorAll(
      '.sheet > :not(.nav-sled), .selected-workbench > *'
    )
    animateAll(ghostContentEls, [
      { opacity: '1', transform: 'translateY(0)' },
      { opacity: '0', transform: `translateY(${ghostContentDir * GHOST_CONTENT_Y}px)` },
    ], {
      duration: GHOST_CONTENT_DUR,
      easing: EASE,
      fill: 'forwards',
    })

    //    Phase B: ghost mats/container slides away
    const ghostExit = ghost.animate([
      { transform: 'translateY(0) scale(1)', opacity: '1' },
      { transform: `translateY(${ghostY}) scale(${GHOST_MAT_SCALE})`, opacity: '0' },
    ], {
      duration: GHOST_MAT_DUR,
      easing: EASE,
      delay: GHOST_MAT_DELAY,
      fill: 'forwards',
    })
    ghostExit.onfinish = () => ghost.remove()

    // ── 5. NEW CONTENT ENTER (staggered) ──────────────────────────────
    //    Only animate the FIRST sheet (above-fold). Below-fold sheets
    //    stay hidden for useReveal to handle on scroll.
    const sheets = content.querySelectorAll('.sheet')
    const firstSheet = sheets[0] as HTMLElement | undefined
    const hasSheets = !!firstSheet
    const enterSign = goingDeeper ? 1 : -1  // opposite of ghost exit

    let totalDur: number

    if (hasSheets) {
      //  Phase A: first sheet mat slides in
      firstSheet.animate([
        { opacity: '0', transform: `translateY(${enterSign * parseInt(ENTER_MAT_Y)}px) scale(${ENTER_MAT_SCALE})` },
        { opacity: '1', transform: 'translateY(0) scale(1)' },
      ], {
        duration: ENTER_MAT_DUR,
        easing: EASE,
        delay: ENTER_MAT_DELAY,
        fill: 'both',
      })

      //  Phase B: content inside first sheet settles
      const sheetContent = firstSheet.querySelectorAll(':scope > :not(.nav-sled)')
      animateAll(sheetContent, [
        { opacity: '0', transform: `translateY(${enterSign * ENTER_CONTENT_Y}px)` },
        { opacity: '1', transform: 'translateY(0)' },
      ], {
        duration: ENTER_CONTENT_DUR,
        easing: EASE,
        delay: ENTER_CONTENT_DELAY,
        fill: 'both',
      })

      //  Phase C: first sheet's nav sled (chapter marker) docks
      const navSled = firstSheet.querySelector('.nav-sled')
      if (navSled) {
        (navSled as HTMLElement).animate([
          { opacity: '0', transform: `translateY(${-ENTER_MARKER_Y}px)` },
          { opacity: '1', transform: 'translateY(0)' },
        ], {
          duration: ENTER_MARKER_DUR,
          easing: EASE,
          delay: ENTER_MARKER_DELAY,
          fill: 'both',
        })
      }

      totalDur = ENTER_MARKER_DELAY + ENTER_MARKER_DUR
    } else {
      // No sheets (e.g. /selected) — animate whole content
      content.animate([
        { opacity: '0', transform: `translateY(${enterSign * parseInt(ENTER_MAT_Y)}px) scale(${ENTER_MAT_SCALE})` },
        { opacity: '1', transform: 'translateY(0) scale(1)' },
      ], {
        duration: ENTER_FLAT_DUR,
        easing: EASE,
        delay: ENTER_FLAT_DELAY,
        fill: 'both',
      })

      totalDur = ENTER_FLAT_DELAY + ENTER_FLAT_DUR
    }

    // ── 6. Clean up after all animations settle ───────────────────────
    setTimeout(() => {
      wb?.classList.remove('transitioning')
      // Only mark the first sheet as revealed; below-fold sheets
      // are left for useReveal to animate on scroll.
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
