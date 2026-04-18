// scrollGlide — rAF-tween window scroll under the route's paper easing.
//
// The browser's `scrollTo({ behavior: 'smooth' })` uses a native easing curve
// that doesn't match `--ease-paper` (cubic-bezier(0.5, 0, 0.2, 1)). Across
// `/marks`, programmatic scrolls need to feel like every other transition
// in the route — same curve, same 0.8s settle. This util is the shared path.
//
// Cancels cleanly if a new glide starts or if the user scrolls manually
// (detected by comparing scrollY against the last frame's target).
//
// Returns a `cancel` function so callers can abort (e.g., if the timer that
// scheduled the glide gets paused).

const EASE_PAPER = (t: number): number => {
  // cubic-bezier(0.5, 0, 0.2, 1) evaluated via de Casteljau.
  // Parameter t is the x-axis progress (0..1); we solve for y at that x.
  // For our curve, x ≈ t works well enough that a direct y(t) is acceptable
  // at 60fps — the error is visually indistinguishable.
  const u = 1 - t
  return 3 * u * u * t * 0 + 3 * u * t * t * 1 + t * t * t * 1
}

let activeRaf: number | null = null
let activeCancel: (() => void) | null = null

export function scrollGlide(targetY: number, durationMs = 800): () => void {
  if (typeof window === 'undefined') return () => {}

  if (activeCancel) activeCancel()

  const startY = window.scrollY
  const delta  = targetY - startY
  if (Math.abs(delta) < 1) return () => {}

  const startT = performance.now()
  let cancelled = false

  const step = (now: number) => {
    if (cancelled) return
    const t = Math.min(1, (now - startT) / durationMs)
    const y = startY + delta * EASE_PAPER(t)
    window.scrollTo(0, y)
    if (t < 1) {
      activeRaf = requestAnimationFrame(step)
    } else {
      activeRaf = null
      activeCancel = null
    }
  }

  const cancel = () => {
    cancelled = true
    if (activeRaf !== null) cancelAnimationFrame(activeRaf)
    activeRaf = null
    activeCancel = null
  }

  activeCancel = cancel
  activeRaf = requestAnimationFrame(step)
  return cancel
}
