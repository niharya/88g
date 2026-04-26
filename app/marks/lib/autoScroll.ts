// autoScroll — credits-reel transport on /marks.
//
// The /marks route reads as the tail of a film: the reader enters, holds on
// the title for a beat, then the reel begins advancing on its own at a slow,
// cinematic pace. Auto-scroll owns two segments, mediated by a `mode` arg:
//
//   • 'intro'  — Hero → Furrmark (first mark). Stops permanently when
//                Furrmark's section top reaches the viewport. From there,
//                the mark machinery (showcase timer + advanceToNextMark +
//                dominance snap) owns everything through Kilti.
//   • 'outro'  — Kilti's last-slide wrap → fade-to-black → teleport → intro
//                re-arms. Cuts the ~28s dead-space cruise through
//                BlankSection / HeroClone down to a ~1.6s filmic cut. The
//                old scroll-cruise path through Blank + HeroClone is gone;
//                those sections remain as manual-scroll fallbacks only
//                (HeroClone.onDocked still teleports if a reader coasts in
//                under their own power).
//
// Why two modes, not one continuous reel: auto-scroll inside mark sections
// fought the showcase timer, advanceToNextMark, and dominance snap (each
// wants exclusive scrollY ownership). Intro owns only the Hero→Furrmark
// zone; outro is a veil timeline with no scroll ownership at all.
//
// Design choices tied to the surrounding machinery:
//
//   • Train-start spring on (re)start. Velocity springs from 0 to
//     RATE_VH_PER_S via CRUISE_SPRING (shared with /rr Outcome ticker) —
//     a perceptible kick with ~10–15% overshoot, never elastic. This is the
//     "subtle jump first" the spec calls for. Straight linear ramps read as
//     mechanical; the train kick reads as a reel resuming.
//
//   • Yields during `scrollGlide`. Programmatic glides (paginator click,
//     essay preview jump) need exclusive ownership of window.scrollY for
//     their easing to land. While auto-scroll is still ticking (before the
//     first-mark stop) `isGlideActive()` is the hand-off.
//
//   • Subscribe mechanism. MarkSection's showcase timer should not
//     auto-advance slides while the reel is still approaching the first
//     mark — subscribeAutoScroll lets it gate its `active` flag.
//
//   • Reduced-motion opts out. Readers who prefer reduced motion keep the
//     route fully navigable by manual scroll; auto-scroll never ticks.

import { animate, motionValue, type AnimationPlaybackControls } from 'framer-motion'
import { CRUISE_SPRING } from '@/app/lib/motion'
import { isGlideActive } from '../../lib/scrollGlide'

// Tuning constants. 3.5 vh/s was chosen after 5 vh/s read as a touch fast —
// at a 900px viewport this is ~31 px/s, roughly one line of essay per
// second, which matches the editorial credits-roll cadence the spec asks for.
const HOLD_MS            = 1500  // Hero hold before the intro reel starts
const RATE_VH_PER_S      = 3.5   // cruise speed (intro, cursor idle)
const RATE_VH_PER_S_SLOW = 1.2   // cruise speed while cursor is moving
const CURSOR_IDLE_MS     = 450   // ms of no mousemove before resuming full speed
const COOLDOWN_MS        = 500   // pause after user input before auto-resumes
const DT_CLAMP_S         = 0.1   // clamp per-frame dt (tab-switch recovery)
const FIRST_MARK_ID      = 'furrmark'  // intro stops here — mark machinery takes over
// Keep VEIL_FADE_IN_MS in sync with the CSS token `--marks-veil-in` in
// marks.css. JS drives the teleport timing; CSS drives the visible fade.
// They must match or the teleport lands before/after the veil is fully
// opaque. Current value: 900 ms.
const VEIL_FADE_IN_MS    = 900
// Veil fade-out is owned by CSS on the <OutroVeil> element (marks.css,
// `--marks-veil-out` = 700 ms). The reader's hero-arrival moment overlaps
// with the 1500 ms intro hold, so the visible "from black → hero → reel"
// beat is ~1.6s total wall-clock.

export type AutoScrollMode = 'intro' | 'outro'
export type OutroVeilState = 'hidden' | 'opaque'

let rafId:         number | null = null
let running                      = false
let mode:          AutoScrollMode = 'intro'
let holdUntil                    = 0
let pausedUntil                  = 0
let lastTime                     = 0
let wasYielding                  = true
let velAnim: AnimationPlaybackControls | null = null
let outroTimeout:  ReturnType<typeof setTimeout> | null = null
let veilState:     OutroVeilState = 'hidden'
// Cursor-idle gate — while the reader moves the cursor, the reel throttles
// from RATE_VH_PER_S → RATE_VH_PER_S_SLOW so reading isn't dragged under the
// cursor. Spring owns the transition both directions so switches stay smooth.
let cursorMoving              = false
let cursorIdleTimer: ReturnType<typeof setTimeout> | null = null
// Subpixel accumulator. At low velocities (~1.2 vh/s on a 900px viewport =
// 0.18 px/frame at 60fps) the per-frame delta is below the browser's
// scrollBy precision on some engines, so the reel would appear to stop
// entirely while ticking. Accumulating the fractional pixels here and
// flushing whole pixels guarantees progress at any rate.
let scrollAccum               = 0

// Velocity MotionValue — driven by `animate(velocity, ..., CRUISE_SPRING)`.
// Reading `velocity.get()` each frame gives the overshoot-and-settle curve
// that makes the resume read as a train starting, not a motor ramping.
const velocity = motionValue(0)

// Subscribers for running-state changes. MarkSection uses this to gate its
// showcase timer so slides don't tick until auto-scroll has handed off.
const listeners = new Set<(running: boolean) => void>()

function notify(next: boolean) {
  listeners.forEach((cb) => cb(next))
}

export function subscribeAutoScroll(cb: (running: boolean) => void): () => void {
  listeners.add(cb)
  cb(running)
  return () => { listeners.delete(cb) }
}

// Subscribers for the outro veil. OutroVeil.tsx consumes this to toggle a
// `data-opaque` attribute; the actual opacity fade is owned by CSS so the
// timeline stays in one place (marks.css: `.marks-outro-veil`).
const veilListeners = new Set<(state: OutroVeilState) => void>()

function notifyVeil(next: OutroVeilState) {
  veilState = next
  veilListeners.forEach((cb) => cb(next))
}

export function subscribeOutroVeil(cb: (state: OutroVeilState) => void): () => void {
  veilListeners.add(cb)
  cb(veilState)
  return () => { veilListeners.delete(cb) }
}

export function isAutoScrollActive(): boolean {
  return running
}

function targetRate(): number {
  return cursorMoving ? RATE_VH_PER_S_SLOW : RATE_VH_PER_S
}

function springUp() {
  velAnim?.stop()
  velAnim = animate(velocity, targetRate(), CRUISE_SPRING)
}

// Cursor moved — drop to slow rate and arm an idle timer. If another
// mousemove arrives, the timer resets; speed only returns once the cursor
// has truly been still for CURSOR_IDLE_MS. Both transitions ride
// CRUISE_SPRING so switches read as a smooth settle, not a step change.
export function onCursorMove() {
  if (cursorIdleTimer !== null) clearTimeout(cursorIdleTimer)
  if (!cursorMoving) {
    cursorMoving = true
    if (running && !wasYielding) springUp()
  }
  cursorIdleTimer = setTimeout(() => {
    cursorIdleTimer = null
    cursorMoving = false
    if (running && !wasYielding) springUp()
  }, CURSOR_IDLE_MS)
}

function springDown() {
  velAnim?.stop()
  velocity.set(0)
}

function shouldYield(now: number): boolean {
  if (now < holdUntil)                          return true
  if (now < pausedUntil)                        return true
  if (isGlideActive())                          return true
  if (document.visibilityState === 'hidden')    return true
  return false
}

// Document-space top of the intro stop target (Furrmark). Null if the
// section isn't in the DOM yet. Called each frame while intro is ticking.
// Outro does not consume this — outro is a veil timeline, not a cruise.
function introStopTop(): number | null {
  const el = document.querySelector<HTMLElement>(
    `.marks-section[data-mark-id="${FIRST_MARK_ID}"]`,
  )
  if (!el) return null
  return el.getBoundingClientRect().top + window.scrollY
}

function tick(now: number) {
  if (!running) return

  const yielding = shouldYield(now)

  if (yielding) {
    if (!wasYielding) springDown()
    wasYielding = true
    lastTime    = now
    rafId = requestAnimationFrame(tick)
    return
  }

  if (wasYielding) {
    springUp()
    wasYielding = false
  }

  const dt   = Math.min(DT_CLAMP_S, (now - lastTime) / 1000)
  lastTime   = now

  const vh   = window.innerHeight || 1
  const v    = velocity.get()
  const dy   = (v * vh / 100) * dt

  if (dy > 0) {
    scrollAccum += dy
    const whole = Math.floor(scrollAccum)
    if (whole >= 1) {
      window.scrollBy(0, whole)
      scrollAccum -= whole
    }
  }

  const target = introStopTop()
  if (target !== null && window.scrollY >= target - 2) {
    // Intro landed on the first mark — stop permanently. Mark machinery
    // (showcase timer + advanceToNextMark + dominance snap) takes over.
    stopAutoScroll()
    return
  }

  rafId = requestAnimationFrame(tick)
}

export function startAutoScroll(next: AutoScrollMode = 'intro') {
  if (running) return
  if (typeof window === 'undefined') return

  // Reduced-motion opt-out — never tick.
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

  if (next === 'outro') {
    // Outro runs a veil-only timeline, no scroll ticking. The reel "cuts"
    // to black, teleports silently, then the intro re-arms behind the
    // fading veil. `running`/`notify(true)` stay true across the whole
    // transition so MarkSection's showcase-timer gate doesn't flicker
    // open during the teleport.
    mode    = next
    running = true
    notify(true)
    notifyVeil('opaque')

    outroTimeout = setTimeout(() => {
      outroTimeout = null
      if (!running) return               // stopAutoScroll was called during the fade
      window.scrollTo(0, 0)
      // Hand off to intro WITHOUT releasing `running` — skip the public
      // `startAutoScroll('intro')` because its early-return would bail on
      // the still-true flag. Mirror its body inline.
      mode        = 'intro'
      const now   = performance.now()
      holdUntil   = now + HOLD_MS
      pausedUntil = 0
      lastTime    = now
      wasYielding = true
      velocity.set(0)
      rafId = requestAnimationFrame(tick)
      // Release the veil — CSS owns the fade-out, overlapping with the
      // intro hero-hold so the reveal + reel-start read as one beat.
      notifyVeil('hidden')
    }, VEIL_FADE_IN_MS)
    return
  }

  mode        = next
  running     = true
  const now   = performance.now()
  holdUntil   = now + HOLD_MS     // intro holds on the Hero title first
  pausedUntil = 0
  lastTime    = now
  wasYielding = true           // first tick springs velocity up via springUp()
  velocity.set(0)
  rafId = requestAnimationFrame(tick)
  notify(true)
}

export function stopAutoScroll() {
  if (!running) return
  running = false
  if (rafId !== null) cancelAnimationFrame(rafId)
  rafId = null
  velAnim?.stop()
  velAnim = null
  velocity.set(0)
  // Cancel any pending outro veil timeout and drop the veil so a hard stop
  // (e.g. route unmount) doesn't leave the screen covered in black.
  if (outroTimeout !== null) {
    clearTimeout(outroTimeout)
    outroTimeout = null
  }
  if (veilState !== 'hidden') notifyVeil('hidden')
  if (cursorIdleTimer !== null) {
    clearTimeout(cursorIdleTimer)
    cursorIdleTimer = null
  }
  cursorMoving = false
  scrollAccum  = 0
  notify(false)
}

export function pauseAutoScroll(durationMs = COOLDOWN_MS) {
  if (typeof window === 'undefined') return
  pausedUntil = Math.max(pausedUntil, performance.now() + durationMs)
}
