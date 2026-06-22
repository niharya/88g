'use client'

// Showcase — single CSS Grid surface with JS-measured row spans.
//
// Grid shape:
//   • 6 equal columns under the hood. A "normal" tile spans 2 (one
//     visual third); a "wide" tile spans 3 (one visual half = 1.5
//     normal tiles).
//   • `grid-auto-rows: var(--sc-row)` (8 px). Each tile's row span is
//     measured from its content height: ceil((h + gap) / (row + gap)).
//   • `grid-auto-flow: dense` packs short tiles into gaps that wide
//     tiles would otherwise leave behind.
//
// Why this idiom: CSS multi-column can't do fractional spans (every
// tile is atomic to one column). To get the 1.5×-wide paymaster +
// ecochain we asked for, the grid has to be CSS Grid with explicit
// row spans — which means re-measuring on resize, on the active-state
// lift, and on image-load reveals. The cost is some orphan whitespace
// next to wide tiles when neighbours can't pack in tightly.
//
// DOM order is `PIECES` (by `num`, 1 → 10). `grid-auto-flow: dense`
// can reshuffle the visual order to fill gaps.

import { useCallback, useEffect, useLayoutEffect, useRef, useState, type CSSProperties } from 'react'
import { PIECES, type Piece, type ShowcaseDot } from './data'
import ShowcasePiece from './ShowcasePiece'
import ShowcaseBottomSheet from './ShowcaseBottomSheet'
import { MOBILE_BP, isMobileViewport } from './responsive'
import './showcase.css'

// Four-color palette used for the per-load random dot shuffle. Pinned
// to the brand's four primaries (blue, terra, orange, mint); olive,
// yellow, and grey were dropped — the four-tone family reads more
// in-system, and the per-piece colour cascade (caption dot → switch →
// spec note) stays anchored to a tight palette per load.
const DOT_PALETTE: ShowcaseDot[] = ['blue', 'terra', 'orange', 'mint']

// Fisher-Yates shuffle — O(n) uniformly random permutation. Same idiom
// used by Footer's startooth row and the PosterStack deck.
function shuffle<T>(arr: T[]): T[] {
  const out = [...arr]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

// Row height + gap, mirrored from showcase.css so the JS measurement
// matches the layout exactly. If you change them in CSS, change them
// here too.
const ROW_HEIGHT_PX = 8
const GAP_PX = 44
const MOBILE_GAP_PX = 24

function measureSpans(grid: HTMLElement): Record<string, number> {
  const gap = isMobileViewport() ? MOBILE_GAP_PX : GAP_PX
  const slots = grid.querySelectorAll<HTMLElement>('.sc-slot')
  const next: Record<string, number> = {}
  slots.forEach((slot) => {
    // Measure the slot's first child (the .sc-piece) — the slot itself
    // is constrained by whatever row span we last wrote, so measuring it
    // directly is a chicken-and-egg trap. The child is natural height
    // (never stretched), so re-measurement is stable.
    const id = slot.dataset.pieceId
    const child = slot.firstElementChild as HTMLElement | null
    if (!id || !child) return
    const h = child.getBoundingClientRect().height
    if (!h) return
    next[id] = Math.ceil((h + gap) / (ROW_HEIGHT_PX + gap))
  })
  return next
}

export default function Showcase() {
  const gridRef = useRef<HTMLDivElement | null>(null)
  const [activeId, setActiveId] = useState<string | null>(null)
  // Measured row spans, keyed by piece id. Kept in state (not set imperatively
  // on the slot) so that React re-renders — which re-apply slotStyle to each
  // .sc-slot — can't wipe the span back to the CSS fallback.
  const [spans, setSpans] = useState<Record<string, number>>({})
  // Reactive isMobile — the bottom sheet should mount/unmount when the
  // viewport crosses the breakpoint (e.g. devtools rotation, orientation
  // change, real resize). matchMedia.addEventListener handles all three.
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(MOBILE_BP)
    setIsMobile(mq.matches)
    const onChange = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])
  const [toggles, setToggles] = useState<Record<string, string>>(() => {
    const t: Record<string, string> = {}
    for (const p of PIECES) {
      if (p.toggle) t[p.id] = p.toggle.defaultKey
    }
    return t
  })

  // Per-page-load dot shuffle. SSR / first client paint uses the authored
  // `piece.dot`; on mount we roll a fresh distribution and the dots,
  // serial numbers, links, hint pills, switch tints — every consumer of
  // `--sc-dotc` — swap to the new colour in one re-render.
  //
  // Distribution: pad DOT_PALETTE to PIECES.length so every palette
  // colour appears at least ⌊10/6⌋ = 1 time. Repeats are unavoidable at
  // 10 pieces × 6 colours; padding then shuffling guarantees full
  // palette coverage rather than letting pure random skip a colour.
  const [dotMap, setDotMap] = useState<Record<string, ShowcaseDot> | null>(null)
  useEffect(() => {
    const padded: ShowcaseDot[] = []
    while (padded.length < PIECES.length) padded.push(...DOT_PALETTE)
    const rolled = shuffle(padded).slice(0, PIECES.length)
    setDotMap(Object.fromEntries(PIECES.map((p, i) => [p.id, rolled[i]])))
  }, [])

  // Effective pieces — authored data + per-load dot override. Recomputed
  // when the dot map is set (once, after mount). Computed inline rather
  // than memoized: PIECES is a constant, the spread is cheap, and Showcase
  // already re-renders on activeId/toggle changes.
  const piecesWithDots: Piece[] = dotMap
    ? PIECES.map((p) => ({ ...p, dot: dotMap[p.id] ?? p.dot }))
    : PIECES

  // ── Row-span measurement pass ─────────────────────────────────────────
  // rAF-debounced so bursts of ResizeObserver + window resize trigger
  // one pass per frame, not eleven.
  const rafRef = useRef<number | null>(null)
  const schedule = useCallback(() => {
    if (rafRef.current != null) return
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null
      const grid = gridRef.current
      if (!grid) return
      const next = measureSpans(grid)
      setSpans((prev) => {
        // No-op if unchanged — prevents the ResizeObserver → setState →
        // re-layout → ResizeObserver loop from re-rendering forever.
        const keys = Object.keys(next)
        if (keys.length === Object.keys(prev).length && keys.every((k) => prev[k] === next[k])) {
          return prev
        }
        return { ...prev, ...next }
      })
    })
  }, [])

  useLayoutEffect(() => {
    schedule()
    const grid = gridRef.current
    if (!grid) return
    const ro = new ResizeObserver(schedule)
    // Observe the grid itself so a container-width change (e.g. parent
    // layout shifts because the header or hint row above resized)
    // triggers a re-measure — per-slot observers only fire when slot
    // content height changes, not when column width changes.
    ro.observe(grid)
    grid.querySelectorAll('.sc-slot').forEach((s) => ro.observe(s))
    window.addEventListener('resize', schedule)
    // Re-measure when images materialize (LQIP → real bytes can change
    // perceived height for unframed/cropped media).
    const imgs = grid.querySelectorAll('img')
    imgs.forEach((img) => {
      if (!img.complete) img.addEventListener('load', schedule)
    })
    return () => {
      ro.disconnect()
      window.removeEventListener('resize', schedule)
      imgs.forEach((img) => img.removeEventListener('load', schedule))
      // Reset the ref after cancelling — otherwise a stale non-null id makes
      // the next schedule() (e.g. React Strict Mode's re-mount, or a later
      // observer fire) bail forever and the measurement never runs.
      if (rafRef.current != null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
  }, [schedule])

  // Re-measure when the active tile changes — the .is-active translateY
  // lift + scale changes its rendered height slightly.
  useLayoutEffect(() => {
    schedule()
  }, [activeId, schedule])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // Focus trap — when a tile is open, Tab cycles inside its caption dot +
  // switch + note link instead of escaping to the next tile.
  useEffect(() => {
    if (!activeId) return
    const grid = gridRef.current
    if (!grid) return
    const active = grid.querySelector(`.sc-piece.is-active`) as HTMLElement | null
    if (!active) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return
      const focusables = Array.from(
        active.querySelectorAll<HTMLElement>(
          'button, a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((el) => !el.hasAttribute('disabled') && el.offsetParent !== null)
      if (focusables.length === 0) return
      const first = focusables[0]
      const last = focusables[focusables.length - 1]
      const current = document.activeElement as HTMLElement | null
      if (e.shiftKey && current === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && current === last) {
        e.preventDefault()
        first.focus()
      } else if (current && !active.contains(current)) {
        e.preventDefault()
        first.focus()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeId])

  const setToggle = (id: string, k: string) =>
    setToggles((t) => ({ ...t, [id]: k }))

  // Per-piece column spans → CSS custom properties on the slot.
  //   `--sc-cols-d` = desktop span on the 9-col grid (raw 1..9 value).
  //   `--sc-cols-t` = tablet span on the 3-col grid. The formula
  //                   `max(1, ceil(cols / 3))` preserves proportions —
  //                   a desktop "third" (cols 3) becomes a tablet
  //                   "third" (1 of 3), a "two-thirds" (6) stays a
  //                   "two-thirds" (2 of 3), and "full" (9) stays full.
  //                   Off-canonical desktop values (4, 5, 7, 8) still
  //                   land in the right bucket — 4/5 → 2/3 tablet,
  //                   7/8 → 3/3 (full row).
  // Mobile drops all of this — every slot spans the single column,
  // handled by the CSS media query directly.
  const slotStyle = (p: Piece): CSSProperties => {
    const cols = p.cols ?? 3
    // Measured row span (state-owned). Until the first measurement lands the
    // CSS fallback applies — see `.sc-slot` in showcase.css.
    return {
      ['--sc-cols-d' as string]: cols,
      ['--sc-cols-t' as string]: Math.max(1, Math.ceil(cols / 3)),
      ...(spans[p.id] ? { ['--sc-rowspan' as string]: spans[p.id] } : {}),
    }
  }

  return (
    <section
      className={`sc-grid${activeId ? ' is-dimming' : ''}`}
      ref={gridRef}
    >
      {piecesWithDots.map((p) => (
        <div
          className={`sc-slot${(p.cols ?? 3) >= 6 ? ' sc-slot--wide' : ''}`}
          data-piece-id={p.id}
          style={slotStyle(p)}
          key={p.id}
        >
          <ShowcasePiece
            piece={p}
            active={activeId === p.id}
            /* When ANY tile is open, non-active video tiles pause —      */
            /* the focused artefact is the read; ambient motion behind   */
            /* the dim should quiet down. ShowcasePiece OR's this with   */
            /* its own paused state before passing to PieceMedia.        */
            anyActive={activeId !== null}
            /* On mobile the active tile only scrolls into view — its    */
            /* index card is rendered by ShowcaseBottomSheet below. On   */
            /* desktop the tile renders its own SpecNote inline beside  */
            /* the frame. ShowcasePiece reads this to decide which.     */
            isMobile={isMobile}
            onSelect={setActiveId}
            toggleVal={toggles[p.id]}
            onToggle={setToggle}
          />
        </div>
      ))}

      {activeId && (
        <div
          className="sc-backdrop"
          onClick={() => setActiveId(null)}
          aria-hidden="true"
        />
      )}

      {/* Mobile bottom sheet — singleton. Mounted only when something is */}
      {/* active AND the viewport is mobile. Handles its own portal,      */}
      {/* scroll-lock, and SpecNote render (variant="sheet").             */}
      {activeId && isMobile && (
        <ShowcaseBottomSheet
          piece={piecesWithDots.find((p) => p.id === activeId)!}
          onClose={() => setActiveId(null)}
        />
      )}
    </section>
  )
}
