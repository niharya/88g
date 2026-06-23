// StartoothField — framework-agnostic Startooth canvas engine.
//
// Ported from reference/design_handoff_startooth/Startooth Landing.dc.html.
// DC shim (DCLogic base, React.createRef, forceUpdate, renderVals) stripped.
// All canvas geometry, rendering, and interaction logic is original and
// intentionally preserved verbatim — the tuned timing/easing/falloff
// constants are the expensive-to-recreate part of the design.
//
// Structural colors read from CSS vars at mount (--surface-bg for the void
// core). Effect colors are Startooth-specific, not in the design system —
// all static data lives in startooth-constants.ts.
//
// Vocabulary: voids = star | diamond; keys = shortkey | tallkey;
// key parts = faces (left+right panels) + top (protruding cap).
// Build origin parametrized: build(originX?, originY?) defaults to center.

import {
  TILE_PATHS, TILE_PERIOD, DISPLAY_SCALE,
  STAR_PTS, DIAMOND_PTS,
  FACES_SHORTKEY, FACES_TALLKEY, TOP_SHORTKEY, TOP_TALLKEY,
  STRUCTURAL_BASE, BUILD_PEN, PALETTE_VARIANTS, EFFECT_COLORS,
  BUILD_HOLD_MS, BUILD_DUR_S, BUILD_TILT_DEG,
  HOVER_DIM, LAMP_FALL_PX, WAVE_SPEED_PX, WAVE_EDGE_PX,
  RIPPLE_SPEED, RIPPLE_SIGMA, RIPPLE_LIFE_S, RIPPLE_MAG, AUTO_FADE_MS,
  RUPTURE_N, CHARGE_DECAY_MS, DECAY_FALL_MS, TREMOR_THRESHOLD,
  IDLE_BREATH_MS,
} from './startooth-constants'

type RegionKind = 'star' | 'diamond' | 'face' | 'top'
type UnitType   = 'star' | 'diamond' | 'shortkey' | 'tallkey'

// Using number[][] instead of [number,number][] throughout — TS doesn't infer
// tuple types from array literals, so tuples require verbose `as const` or
// explicit casting. The math works identically with plain arrays.
interface Reg {
  kind: RegionKind
  cx: number; cy: number; dist: number
  bb: number[]
  pts: number[][]
  path: Path2D
  unit: number; ti: number; tj: number
  keyGroup?: 0 | 1   // 0 = shortkey, 1 = tallkey; set on face/top regions only
}
interface Unit {
  type: UnitType
  regs: number[]
  pts?: number[][]
  perim?: number
  trace?: Path2D
  cx: number; cy: number
}
interface FrostEdge { full: Path2D; nd: number; dist: number }
interface Ripple    { ox: number; oy: number; t0: number; _R?: number; _env?: number }
interface VoidWave  { pr: Reg; t0: number }
interface CrossRip  { ox: number; oy: number; t0: number; kind: 'key' | 'void' }
interface TopFlash  { picks: Array<{ path: Path2D; life: number }>; t0: number; mag?: number; swell?: boolean }
interface LockData  { t0: number; lockedAt: number; phase: number }

// Unit-type helpers — avoids repeating the pair at every check site
const isKey  = (u: Unit): boolean => u.type === 'shortkey' || u.type === 'tallkey'
const isVoid = (u: Unit): boolean => u.type === 'star'     || u.type === 'diamond'

export interface StartoothFieldOptions {
  onBuildComplete?: () => void
  skipBuild?: boolean
}

export class StartoothField {
  // Injected DOM handles
  private host:   HTMLElement
  private canvas: HTMLCanvasElement
  private wrap:   HTMLElement
  private opts:   StartoothFieldOptions
  private ctx!:   CanvasRenderingContext2D

  // --- Geometry, palette, and tuning (data lives in startooth-constants.ts) ---
  // Immutable geometry — readonly aliases to imported constants
  private readonly TILE        = TILE_PATHS
  private readonly STAR        = STAR_PTS
  private readonly DIAMOND     = DIAMOND_PTS
  private readonly PERX        = TILE_PERIOD.x
  private readonly PERY        = TILE_PERIOD.y
  private readonly SS          = DISPLAY_SCALE
  // Effect palette — never mutated, used directly
  private readonly EFFECT      = EFFECT_COLORS
  // Build timing
  private readonly HOLD        = BUILD_HOLD_MS
  private readonly DUR         = BUILD_DUR_S
  private readonly TILT        = BUILD_TILT_DEG
  // Interaction
  private readonly DIM         = HOVER_DIM
  private readonly PUSH_FALL   = LAMP_FALL_PX
  private readonly WAVE_SPEED  = WAVE_SPEED_PX
  private readonly WAVE_EDGE   = WAVE_EDGE_PX
  private readonly RIP_SPEED   = RIPPLE_SPEED
  private readonly RIP_SIG     = RIPPLE_SIGMA
  private readonly RIP_LIFE    = RIPPLE_LIFE_S
  private readonly RIP_MAG     = RIPPLE_MAG
  private readonly AUTO_FADE   = AUTO_FADE_MS
  // Rupture + idle
  private readonly N           = RUPTURE_N
  private readonly CHARGE_DECAY = CHARGE_DECAY_MS
  private readonly DECAY_FALL  = DECAY_FALL_MS
  private readonly TREMOR_AT   = TREMOR_THRESHOLD
  private readonly IDLE_BREATH = IDLE_BREATH_MS
  // Mutable structural palette — core injected at mount from --surface-bg
  private COL = { core: '#4b2c19', ...STRUCTURAL_BASE }
  private PEN = BUILD_PEN
  // Palette variants for void-rupture regrow (advances one step per rupture)
  private paletteVariants = [...PALETTE_VARIANTS]
  private paletteIdx = 0

  // Canvas dimensions (set in resize)
  private W = 0; private H = 0; private dpr = 1

  // Lattice data (built in build())
  private regs:     Reg[]       = []
  private units:    Unit[]      = []
  private cores:    Reg[]       = []
  private topRegs:  Reg[]       = []
  private frost:    FrostEdge[] = []
  private linePath!: Path2D
  private md = 1
  private maxD = 1
  private settled: HTMLCanvasElement | null = null

  // Build origin (parametrized for future 9-click break/rebuild)
  private buildOriginX: number | undefined
  private buildOriginY: number | undefined

  // Animation state
  private buildStart = 0
  private done       = false
  private running    = false
  private raf        = 0
  private reduced    = false
  private prefersReduced = false
  private hiddenAt   = 0
  private _rz        = 0

  // Focus / interaction state
  private hoverUnit:    Unit | null = null
  private focusUnit:    Unit | null = null
  private prevDu:       Unit | null = null
  private focusAmt      = 0
  private traceAmt      = 0
  private fadeOutStart: number | null = null
  private fadeFrom      = 0   // focusAmt captured at hover-release, so the fade eases from where it actually was (no snap-to-1)
  private fadeUnit:     Unit | null = null   // the key being released — kept lit through the fade so it dims gracefully instead of snapping dark
  private outlineHeld   = false
  private outlineAmt    = 0
  private pressFocus    = false
  private pressedVoid:  Unit | null = null
  private ripples:      Ripple[]   = []
  private lockedKeys:   Map<Unit, LockData> = new Map()
  private crossRipples: CrossRip[] = []
  private topFlashes:   TopFlash[] = []
  private voidWaves:    VoidWave[] = []

  // Void-rupture state
  private chargeVoid:   Unit | null = null   // the void currently being charged
  private chargeBase    = 0                  // charge value at the last click (decays from here)
  private chargeAt      = 0                  // timestamp of the last click on chargeVoid
  private rupturing     = false
  private ruptureStart  = 0
  private ruptureDur    = 0
  private ruptureOrigin: number[] = [0, 0]
  private flickerSchedule: Array<{ until: number; level: number }> = []

  // Idle ambient breathing — random key-tops gently brighten and recede once
  // the field has sat untouched for IDLE_BREATH. Driven by a self-scheduling
  // timer (not a continuous rAF) so an idle tab stays cheap.
  private idleTimer    = 0
  private lastActivity = 0

  // Event handler references (for removeEventListener)
  private onResize!:     () => void
  private onMove!:       (e: PointerEvent) => void
  private onDown!:       (e: PointerEvent) => void
  private onLeave!:      () => void
  private onUp!:         () => void
  private onVis!:        () => void
  private onCtxLost!:    (e: Event) => void
  private onCtxRestored!:() => void
  private ro: ResizeObserver | null = null

  constructor(host: HTMLElement, canvas: HTMLCanvasElement, wrap: HTMLElement, opts: StartoothFieldOptions = {}) {
    this.host   = host
    this.canvas = canvas
    this.wrap   = wrap
    this.opts   = opts
  }

  mount() {
    const c = this.canvas
    const ctx = c.getContext('2d')
    if (!ctx) return
    this.ctx = ctx

    // Two distinct reasons to collapse the build to one frame, kept separate:
    //   prefersReduced — accessibility, permanent (a rebuild must honour it too).
    //   skipBuild       — client-side return; only the INITIAL build skips, a
    //                     rebuildFrom() re-grow should still animate.
    this.prefersReduced = !!(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
    this.reduced = this.prefersReduced || !!this.opts.skipBuild

    // Read structural color from CSS var (keeps canvas in sync with surface-bg token)
    const style = getComputedStyle(this.host)
    const surfaceBg = style.getPropertyValue('--surface-bg').trim()
    if (surfaceBg) {
      this.COL.core = surfaceBg
      this.PEN      = surfaceBg
    }

    this.lockedKeys  = new Map()
    this.crossRipples = []
    this.topFlashes   = []
    this.voidWaves    = []

    // Bind event handlers
    this.onResize = () => {
      if (this._rz) return
      this._rz = requestAnimationFrame(() => { this._rz = 0; this.resize() })
    }
    this.onMove   = (e: PointerEvent) => this.pointer(e, false)
    this.onDown   = (e: PointerEvent) => this.pointer(e, true)
    this.onLeave  = () => { this.hoverUnit = null; this.kick() }
    this.onUp     = () => {
      let k = false
      if (this.outlineHeld)  { this.outlineHeld  = false; k = true }
      if (this.pressFocus)   { this.pressFocus   = false; this.hoverUnit = null; k = true }
      if (k) this.kick()
    }
    this.onVis = () => {
      if (document.hidden) {
        this.hiddenAt = performance.now()
      } else if (this.hiddenAt) {
        const gap = performance.now() - this.hiddenAt
        this.hiddenAt = 0
        if (!this.done) this.buildStart += gap
        this.kick()
      }
    }
    this.onCtxLost = (e: Event) => {
      e.preventDefault(); this.running = false; cancelAnimationFrame(this.raf)
    }
    this.onCtxRestored = () => {
      const cc = this.canvas
      if (!cc) return
      this.ctx = cc.getContext('2d')!
      this.resize(); this.kick()
    }

    window.addEventListener('resize',        this.onResize)
    window.addEventListener('pointerup',     this.onUp)
    window.addEventListener('pointercancel', this.onUp)
    document.addEventListener('visibilitychange', this.onVis)
    c.addEventListener('pointermove',   this.onMove)
    c.addEventListener('pointerdown',   this.onDown)
    c.addEventListener('pointerleave',  this.onLeave)
    c.addEventListener('contextlost',   this.onCtxLost)
    c.addEventListener('contextrestored', this.onCtxRestored)

    if (window.ResizeObserver) {
      this.ro = new ResizeObserver(this.onResize)
      this.ro.observe(this.host)
    }

    this.resetFocus()
    this.start()
    this.resize()
    this.kick()
    this.scheduleIdle(this.IDLE_BREATH)
  }

  destroy() {
    this.running = false
    cancelAnimationFrame(this.raf)
    cancelAnimationFrame(this._rz)
    if (this.idleTimer) { clearTimeout(this.idleTimer); this.idleTimer = 0 }
    window.removeEventListener('resize',        this.onResize)
    window.removeEventListener('pointerup',     this.onUp)
    window.removeEventListener('pointercancel', this.onUp)
    document.removeEventListener('visibilitychange', this.onVis)
    if (this.ro) { this.ro.disconnect(); this.ro = null }
    const c = this.canvas
    if (c) {
      c.removeEventListener('pointermove',    this.onMove)
      c.removeEventListener('pointerdown',    this.onDown)
      c.removeEventListener('pointerleave',   this.onLeave)
      c.removeEventListener('contextlost',    this.onCtxLost)
      c.removeEventListener('contextrestored',this.onCtxRestored)
    }
  }

  // Rebuild the whole field from an arbitrary origin (default: centre). The
  // seam for the deferred 9-click void rupture — replays the centre-out build
  // animation originating at (x, y). Honours prefers-reduced-motion; drops the
  // initial-load black HOLD so the rebuild begins immediately.
  rebuildFrom(x: number = this.W / 2, y: number = this.H / 2) {
    this.reduced = this.prefersReduced
    this.start()
    if (!this.reduced) this.buildStart -= this.HOLD
    this.build(x, y)
    this.kick()
  }

  // Nudge the warm palette one step on each regrow — "same field, slightly
  // different light." core stays (it's the --surface-bg token).
  private advancePalette() {
    this.paletteIdx = (this.paletteIdx + 1) % this.paletteVariants.length
    const v = this.paletteVariants[this.paletteIdx]
    this.COL.face = v.face; this.COL.top = v.top
  }

  // Live charge for the currently-charged void, decayed from the last click.
  // Computed from timestamps (not accumulated per frame) so it's frame-rate
  // independent: full through CHARGE_DECAY, then bleeds DECAY_FALL ms per unit.
  private chargeLive(): number {
    if (!this.chargeVoid) return 0
    const over = performance.now() - this.chargeAt - this.CHARGE_DECAY
    const c = over <= 0 ? this.chargeBase : this.chargeBase - over / this.DECAY_FALL
    return c > 0 ? c : 0
  }

  // The 9th click: rupture the field from (x, y). Suppresses interaction
  // (done=false), clears all transient state, and hands the loop into the
  // pulled-plug flicker; the loop calls rebuildFrom when the flicker finishes.
  private triggerRupture(x: number, y: number) {
    this.chargeVoid = null; this.chargeBase = 0
    this.rupturing = true
    this.ruptureStart = performance.now()
    this.ruptureOrigin = [x, y]
    this.buildFlickerSchedule()
    this.done = false
    this.resetFocus()
    this.lockedKeys.clear()
    this.crossRipples = []; this.topFlashes = []; this.voidWaves = []
    this.kick()
  }

  // Precompute the power-cut flicker: a hard bright flash, a sharp blackout
  // (the plug pulled), then a run of uneven on/off stutters, then a steady beat
  // on the broken outline. Reduced motion collapses to a single short cut.
  private buildFlickerSchedule() {
    if (this.prefersReduced) {
      this.flickerSchedule = [{ until: 130, level: 0.85 }]
      this.ruptureDur = 130
      return
    }
    const seg: Array<{ until: number; level: number }> = []
    let t = 0
    seg.push({ until: (t += 45), level: 1.7 })   // hard overexposed flash — the snap
    seg.push({ until: (t += 70), level: 0 })     // sharp blackout — power gone
    const stutters = 5 + Math.floor(Math.random() * 3)              // 5–7 stutters
    for (let i = 0; i < stutters; i++) {
      seg.push({ until: (t += 16 + Math.random() * 44), level: 0.35 + Math.random() * 0.6 }) // brief on, uneven
      seg.push({ until: (t += 24 + Math.random() * 80), level: 0 })                          // blackout
    }
    seg.push({ until: (t += 160), level: 0.8 })  // settle on the broken outline
    this.flickerSchedule = seg
    this.ruptureDur = t
  }

  // Draw the broken field: black + the bare wireframe, modulated by the flicker
  // schedule. During the break it tears (random horizontal shift) and loses
  // bands (black dropout strips) like a dying signal. Returns true when spent.
  private drawRupture(): boolean {
    const ctx = this.ctx, dpr = this.dpr
    const el = performance.now() - this.ruptureStart

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'

    let level = 0.8
    for (const s of this.flickerSchedule) { if (el <= s.until) { level = s.level; break } }

    if (level > 0 && this.linePath) {
      const glitch = !this.prefersReduced
      // Horizontal tear — a random sync-loss shift on some frames.
      const tear = glitch && Math.random() < 0.4 ? (Math.random() - 0.5) * 9 : 0
      ctx.save()
      if (tear) ctx.translate(tear, 0)
      ctx.lineWidth = Math.max(1.4, 5.5 * this.SS)
      // Overexposed (level>1) tints toward the hot ripple colour; otherwise the core pen.
      ctx.strokeStyle = level > 1
        ? this.lerpC(this.COL.core, this.EFFECT.ripple, Math.min(1, (level - 1) / 0.7))
        : this.COL.core
      ctx.globalAlpha = Math.min(1, level)
      ctx.stroke(this.linePath)
      ctx.globalAlpha = 1
      ctx.restore()

      // Signal dropout — punch black bands across the broken display. Heavier
      // through the stutters, easing off once it settles toward the outline.
      if (glitch) {
        const settling = el > this.ruptureDur - 170
        if (Math.random() < (settling ? 0.18 : 0.6)) {
          ctx.fillStyle = '#000'
          const bands = 1 + Math.floor(Math.random() * 3)
          for (let i = 0; i < bands; i++) {
            const by = Math.random() * this.H, bh = 3 + Math.random() * 30
            ctx.fillRect(-20, by, this.W + 40, bh)
          }
        }
      }
    }
    return el >= this.ruptureDur
  }

  // ---- Idle ambient breathing ----
  // A self-scheduling timer (not a continuous rAF). When the field has sat
  // untouched for IDLE_BREATH it scatters a gentle swell across a few random
  // key-tops, kicks the loop for the duration of that swell, then schedules the
  // next breath — so the page only animates in brief, cheap bursts when idle.
  private idleTick = () => {
    this.idleTimer = 0
    if (this.prefersReduced) return  // no ambient motion under reduced motion
    const idleFor = performance.now() - this.lastActivity
    if (this.done && !this.rupturing && !document.hidden && idleFor >= this.IDLE_BREATH) {
      this.ambientTopBreath()
      this.kick()
      this.scheduleIdle(2600 + Math.random() * 3400)   // next breath in 2.6–6 s
    } else {
      const wait = idleFor < this.IDLE_BREATH ? this.IDLE_BREATH - idleFor : 1500
      this.scheduleIdle(Math.max(600, wait))
    }
  }

  private scheduleIdle(delay: number) {
    if (this.idleTimer) clearTimeout(this.idleTimer)
    this.idleTimer = window.setTimeout(this.idleTick, delay)
  }

  // Scatter a very mild gold swell across a few random tops — the same
  // topScatter the lock-click uses, but lower magnitude and a slow up-and-down
  // envelope (swell) instead of an instant flash.
  private ambientTopBreath() {
    if (!this.topRegs.length) return
    const n = 2 + Math.floor(Math.random() * 3)   // 2–4 tops
    const picks: Array<{ path: Path2D; life: number }> = []
    for (let i = 0; i < n; i++) {
      const r = this.topRegs[Math.floor(Math.random() * this.topRegs.length)]
      picks.push({ path: r.path, life: 1.6 + Math.random() * 1.4 })   // slow, 1.6–3 s
    }
    this.topFlashes.push({ picks, t0: performance.now(), mag: 0.15, swell: true })
    if (this.topFlashes.length > 6) this.topFlashes.shift()
  }

  private resetFocus() {
    this.hoverUnit = null; this.focusUnit = null; this.prevDu = null; this.fadeUnit = null
    this.focusAmt = 0; this.traceAmt = 0; this.fadeOutStart = null
    this.ripples = []; this.outlineHeld = false; this.outlineAmt = 0
    this.pressFocus = false; this.pressedVoid = null
  }

  private start() {
    this.buildStart = performance.now()
    this.done = false; this.settled = null
    this.resetFocus()
    this.lockedKeys.clear()
    this.crossRipples = []; this.topFlashes = []; this.voidWaves = []
    this.chargeVoid = null; this.chargeBase = 0
  }

  private kick() {
    if (!this.running) {
      this.running = true
      cancelAnimationFrame(this.raf)
      this.raf = requestAnimationFrame(() => this.loop())
    }
  }

  private resize() {
    const host = this.host
    let W = host ? host.clientWidth  : window.innerWidth
    let H = host ? host.clientHeight : window.innerHeight
    if (W < 2 || H < 2) { W = window.innerWidth; H = window.innerHeight }
    if (W < 2 || H < 2) return

    const r = this.TILT * Math.PI / 180, co = Math.cos(r), si = Math.sin(r)
    const needW = Math.ceil((W * co + H * si) * 1.06)
    const needH = Math.ceil((W * si + H * co) * 1.06)
    let dpr = Math.min(window.devicePixelRatio || 1, 1.25)
    const MAXDIM = 4096
    const big = Math.max(needW, needH) * dpr
    if (big > MAXDIM) dpr = Math.max(0.8, dpr * MAXDIM / big)

    this.W = needW; this.H = needH; this.dpr = dpr

    this.wrap.style.width  = needW + 'px'
    this.wrap.style.height = needH + 'px'
    const c = this.canvas
    c.style.width  = needW + 'px'
    c.style.height = needH + 'px'
    c.width  = Math.round(needW * dpr)
    c.height = Math.round(needH * dpr)
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0)

    this.build(this.buildOriginX, this.buildOriginY)

    if (this.done) {
      this.bakeSettled()
      this.hoverUnit = null; this.focusUnit = null; this.prevDu = null
      this.focusAmt = 0; this.traceAmt = 0; this.ripples = []
      // A resize rebuilt the lattice — Unit pointers in chargeVoid and
      // lockedKeys now point at stale objects from the old this.units[].
      // Clear both. (iOS Safari address-bar toggle triggers this path.)
      this.chargeVoid = null; this.chargeBase = 0
      this.lockedKeys.clear()
      this.kick()
    }
  }

  // smootherstep
  private smoother(x: number): number {
    x = x < 0 ? 0 : x > 1 ? 1 : x
    return x * x * x * (x * (x * 6 - 15) + 10)
  }

  private lerpC(a: string, b: string, t: number): string {
    const h = (s: string) => [parseInt(s.slice(1,3),16), parseInt(s.slice(3,5),16), parseInt(s.slice(5,7),16)] as [number,number,number]
    const pa = h(a), pb = h(b)
    return 'rgb(' + pa.map((v,i) => Math.round(v + (pb[i] - v) * t)).join(',') + ')'
  }

  private closed(pts: number[][]): Path2D {
    const p = new Path2D()
    p.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1])
    p.closePath()
    return p
  }

  private open(pts: number[][]): Path2D {
    const p = new Path2D()
    p.moveTo(pts[0][0], pts[0][1])
    for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1])
    return p
  }

  // Build the lattice. originX/Y default to canvas center.
  // The origin parameter is the seam for the future break/rebuild feature.
  private build(originX?: number, originY?: number) {
    this.buildOriginX = originX
    this.buildOriginY = originY

    const ss = this.SS, W = this.W, H = this.H
    const cx = originX ?? W / 2
    const cy = originY ?? H / 2
    const map = (x: number, y: number, i: number, j: number): number[] =>
      [cx + ((x - 162) + i * this.PERX) * ss, cy + ((y - 282) + j * this.PERY) * ss]

    const iN = Math.ceil((W / 2) / (this.PERX * ss)) + 2
    const jN = Math.ceil((H / 2) / (this.PERY * ss)) + 2

    const onscreen = (pts: number[][]): number[] | null => {
      let a=1e9, b=1e9, c=-1e9, d=-1e9
      for (const p of pts) { a=Math.min(a,p[0]); c=Math.max(c,p[0]); b=Math.min(b,p[1]); d=Math.max(d,p[1]) }
      return (c<-40||a>W+40||d<-40||b>H+40) ? null : [a,b,c,d]
    }

    const regs: Reg[] = [], segs: { pts: number[][] }[] = []
    let md = 1
    const addR = (poly: number[][], kind: RegionKind, i: number, j: number, keyGroup?: 0 | 1) => {
      const pts = poly.map(p => map(p[0], p[1], i, j))
      const bb  = onscreen(pts)
      if (!bb) return
      const rcx = (bb[0]+bb[2])/2, rcy = (bb[1]+bb[3])/2
      const dist = Math.hypot(rcx - cx, rcy - cy)
      md = Math.max(md, dist)
      regs.push({ kind, cx:rcx, cy:rcy, dist, bb, pts, path: this.closed(pts), unit: -1, ti:i, tj:j, keyGroup })
    }

    for (let i = -iN; i <= iN; i++) {
      for (let j = -jN; j <= jN; j++) {
        addR(this.STAR,    'star',    i, j)
        addR(this.DIAMOND, 'diamond', i, j)
        for (const f of FACES_SHORTKEY) addR(f, 'face', i, j, 0)
        for (const f of FACES_TALLKEY)  addR(f, 'face', i, j, 1)
        addR(TOP_SHORTKEY, 'top', i, j, 0)
        addR(TOP_TALLKEY,  'top', i, j, 1)
        for (const pl of this.TILE) {
          const pts = pl.map(p => map(p[0], p[1], i, j))
          if (onscreen(pts)) segs.push({ pts })
        }
      }
    }

    this.regs = regs; this.md = md
    this.cores   = regs.filter(r => r.kind === 'star' || r.kind === 'diamond')
    this.topRegs = regs.filter(r => r.kind === 'top')
    this.groupUnits()

    // FROST growth: each edge creeps outward from its centre-ward node
    let maxD = 1; const fr: FrostEdge[] = []
    for (const s of segs) {
      for (let i = 0; i < s.pts.length - 1; i++) {
        let a = s.pts[i], b = s.pts[i + 1]
        const da = Math.hypot(a[0]-cx, a[1]-cy), db = Math.hypot(b[0]-cx, b[1]-cy)
        if (db < da) { const t = a; a = b; b = t }
        const nd = Math.min(da, db); maxD = Math.max(maxD, nd)
        fr.push({ full: this.open([a, b]), nd, dist: (da + db) / 2 })
      }
    }
    this.frost = fr; this.maxD = maxD

    const lpth = new Path2D()
    for (const s of segs) {
      const p = s.pts
      lpth.moveTo(p[0][0], p[0][1])
      for (let i = 1; i < p.length; i++) lpth.lineTo(p[i][0], p[i][1])
    }
    this.linePath = lpth
  }

  private groupUnits() {
    const regs = this.regs, n = regs.length
    const parent = new Array<number>(n)
    for (let i = 0; i < n; i++) parent[i] = i
    const find = (x: number): number => {
      while (parent[x] !== x) { parent[x] = parent[parent[x]]; x = parent[x] }
      return x
    }
    const uni = (a: number, b: number) => { const ra = find(a), rb = find(b); if (ra !== rb) parent[ra] = rb }
    const vk  = (p: number[]) => Math.round(p[0]*2) + '_' + Math.round(p[1]*2)

    const edges: Record<string, number[]> = {}
    for (let r = 0; r < n; r++) {
      const reg = regs[r]
      if (reg.kind !== 'face' && reg.kind !== 'top') continue
      const P = reg.pts
      for (let i = 0; i < P.length; i++) {
        const a = vk(P[i]), b = vk(P[(i+1) % P.length])
        const ek = a < b ? a+'|'+b : b+'|'+a
        ;(edges[ek] || (edges[ek] = [])).push(r)
      }
    }
    for (const ek in edges) { const l = edges[ek]; for (let i = 1; i < l.length; i++) uni(l[0], l[i]) }

    const units: Unit[] = [], rootMap: Record<number, number> = {}
    for (let r = 0; r < n; r++) {
      const reg = regs[r]
      if (reg.kind === 'star' || reg.kind === 'diamond') {
        reg.unit = units.length
        units.push({ type: reg.kind, regs: [r], pts: reg.pts, cx: reg.cx, cy: reg.cy })
        continue
      }
      const root = find(r); let ui = rootMap[root]
      if (ui === undefined) {
        ui = units.length; rootMap[root] = ui
        // keyGroup 0 = shortkey (upper), 1 = tallkey (lower)
        const kt: UnitType = regs[r].keyGroup === 1 ? 'tallkey' : 'shortkey'
        units.push({ type: kt, regs: [], cx: 0, cy: 0 })
      }
      units[ui].regs.push(r); reg.unit = ui
    }

    // Precompute void trace paths/lengths
    for (const u of units) {
      if (isVoid(u)) {
        const P = u.pts!; let len = 0
        for (let i = 0; i < P.length; i++) {
          const a = P[i], b = P[(i+1) % P.length]
          len += Math.hypot(b[0]-a[0], b[1]-a[1])
        }
        u.perim = len; u.trace = this.open(P.concat([P[0]]))
      }
    }

    // Cache key centres for lamp radiation hover effect
    for (const u of units) {
      if (isKey(u)) {
        let x = 0, y = 0
        for (const ri of u.regs) { x += regs[ri].cx; y += regs[ri].cy }
        u.cx = x / u.regs.length; u.cy = y / u.regs.length
      } else {
        u.cx = regs[u.regs[0]].cx; u.cy = regs[u.regs[0]].cy
      }
    }
    this.units = units
  }

  private bakeSettled() {
    const W = this.W, H = this.H
    const c = document.createElement('canvas')
    c.width = Math.round(W); c.height = Math.round(H)
    const x = c.getContext('2d')!
    x.lineJoin = 'round'; x.lineCap = 'round'
    x.fillStyle = '#000'; x.fillRect(0, 0, W, H)
    const col = this.COL
    for (const r of this.regs) if (r.kind !== 'top') { x.fillStyle = r.kind === 'face' ? col.face : col.core; x.fill(r.path) }
    for (const r of this.regs) if (r.kind === 'top')  { x.fillStyle = col.top; x.fill(r.path) }
    x.lineWidth = Math.max(1.4, 5.5 * this.SS); x.strokeStyle = col.core; x.stroke(this.linePath)
    this.settled = c
  }

  // Screen (client) coords → canvas-local CSS px, undoing the wrapper's -15° tilt
  private toLocal(clientX: number, clientY: number): number[] {
    const a = this.TILT * Math.PI / 180, co = Math.cos(a), si = Math.sin(a)
    const rect = this.canvas.getBoundingClientRect()
    const dx = clientX - (rect.left + rect.width  / 2)
    const dy = clientY - (rect.top  + rect.height / 2)
    return [this.W / 2 + dx * co - dy * si, this.H / 2 + dx * si + dy * co]
  }

  private inPoly(px: number, py: number, pts: number[][]): boolean {
    let inside = false
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0], yi = pts[i][1], xj = pts[j][0], yj = pts[j][1]
      if (((yi > py) !== (yj > py)) && (px < (xj-xi) * (py-yi) / (yj-yi) + xi)) inside = !inside
    }
    return inside
  }

  private hit(px: number, py: number): Unit | null {
    for (let r = 0; r < this.regs.length; r++) {
      const g = this.regs[r], bb = g.bb
      if (px < bb[0] || px > bb[2] || py < bb[1] || py > bb[3]) continue
      if (g.unit >= 0 && this.inPoly(px, py, g.pts)) return this.units[g.unit]
    }
    return null
  }

  private pointer(e: PointerEvent, isDown: boolean) {
    if (!this.done) return
    this.lastActivity = performance.now()   // resets the idle-breathing clock
    const [lx, ly] = this.toLocal(e.clientX, e.clientY)
    const u = this.hit(lx, ly)

    if (isDown) {
      if (!this.reduced && navigator.vibrate) navigator.vibrate(16)
      if (u && !isKey(u)) {
        // Press a void → push it in; release → push out
        this.outlineHeld = true; this.pressedVoid = u
        if (!this.reduced) {
          const pr2 = this.regs[u.regs[0]]
          this.voidWaves.push({ pr: pr2, t0: performance.now() })
          if (this.voidWaves.length > 6) this.voidWaves.shift()
          this.crossRipples.push({ ox: pr2.cx, oy: pr2.cy, t0: performance.now(), kind: 'void' })
          if (this.crossRipples.length > 4) this.crossRipples.shift()
        }
        // Charge accumulation — keep poking ONE void (within the decay window)
        // to rupture it on the Nth click. See DESIGN.md → "Void Rupture".
        const live = this.chargeLive()
        if (u === this.chargeVoid && live > 0) {
          this.chargeBase = Math.min(this.N, live + 1)
        } else {
          this.chargeVoid = u; this.chargeBase = 1
        }
        this.chargeAt = performance.now()
        if (this.chargeBase >= this.N) this.triggerRupture(u.cx, u.cy)
      } else {
        if (!this.reduced && !u) {
          // Empty space click — radial ripple
          this.ripples.push({ ox: lx, oy: ly, t0: performance.now() })
          if (this.ripples.length > 4) this.ripples.shift()
        }
        if (u && isKey(u)) {
          // Toggle lock
          if (this.lockedKeys.has(u)) {
            this.lockedKeys.delete(u)
          } else {
            this.lockedKeys.set(u, { t0: performance.now(), lockedAt: performance.now(), phase: Math.random() * Math.PI * 2 })
          }
          if (!this.reduced && this.topRegs.length) {
            const phi = 1.6180339887, ox_ = u.cx, oy_ = u.cy
            const sorted = [...this.topRegs].sort((a, b) =>
              Math.hypot(a.cx-ox_, a.cy-oy_) - Math.hypot(b.cx-ox_, b.cy-oy_))
            const n = 3 + Math.floor(Math.random() * 4)
            const jump = Math.max(1, Math.round(sorted.length / (n * phi)))
            let idx = Math.floor(Math.random() * sorted.length)
            const picks: Array<{ path: Path2D; life: number }> = []
            for (let i = 0; i < n; i++) {
              picks.push({ path: sorted[idx % sorted.length].path, life: 0.4 + Math.random() * 0.55 })
              idx += jump
            }
            this.topFlashes.push({ picks, t0: performance.now() })
            if (this.topFlashes.length > 3) this.topFlashes.shift()
          }
          if (!this.reduced) {
            this.crossRipples.push({ ox: u.cx, oy: u.cy, t0: performance.now(), kind: 'key' })
            if (this.crossRipples.length > 4) this.crossRipples.shift()
          }
        }
        if (u && e.pointerType === 'touch') {
          // Touch has no hover — press-and-hold to defer the field
          this.hoverUnit = u; this.pressFocus = true
        }
      }
    } else {
      this.hoverUnit = (u && isKey(u)) ? u : null
    }
    this.kick()
  }

  private desired(): Unit | null { return this.hoverUnit }

  private loop() {
    if (!this.running) return
    let cont: boolean
    if (this.rupturing) {
      // Pulled-plug break. When the flicker is spent, advance the palette and
      // regrow from the rupture origin (rebuildFrom sets done=false → the build
      // branch picks up next frame).
      if (this.drawRupture()) {
        this.rupturing = false
        this.advancePalette()
        this.rebuildFrom(this.ruptureOrigin[0], this.ruptureOrigin[1])
      }
      cont = true
    } else if (!this.done) {
      const fin = this.drawBuild()
      if (fin) {
        this.done = true
        this.bakeSettled()
        this.lastActivity = performance.now()   // idle clock starts when the field settles
        this.opts.onBuildComplete?.()
        cont = this.stepFocus()
      } else {
        cont = true
      }
    } else {
      cont = this.stepFocus()
    }
    if (cont) this.raf = requestAnimationFrame(() => this.loop())
    else this.running = false
  }

  private stepFocus(): boolean {
    // Retire a fully-bled charge so the next click on this void starts fresh.
    if (this.chargeVoid && this.chargeLive() <= 0) this.chargeVoid = null

    const du = this.desired()
    if (du !== this.prevDu) {
      // On release capture (a) the live focusAmt so the fade eases from where it
      // actually was — not a hardcoded 1 (the ramp takes ~0.66s to reach 1, so a
      // short hover would otherwise snap to full first); and (b) the unit being
      // left, so drawInteractive keeps it lit through the fade instead of letting
      // the lamp snap dark the instant focusUnit clears.
      if (!du) { this.fadeOutStart = performance.now(); this.fadeFrom = this.focusAmt; this.fadeUnit = this.prevDu }
      this.traceAmt = 0; this.prevDu = du
    }
    if (du) {
      this.focusAmt += (1 - this.focusAmt) * (this.reduced ? 1 : 0.13)
      if (1 - this.focusAmt < 0.004) this.focusAmt = 1
      this.fadeOutStart = null
    } else if (this.fadeOutStart != null) {
      // Release: linger at the held level briefly, then ease out (smootherstep,
      // so the fade begins with zero velocity — no jerk at the hand-off from the
      // ramp-up). LINGER keeps the dim from collapsing the instant you leave.
      const LINGER = this.reduced ? 0 : 150, FADE = this.reduced ? 1 : 600
      const el = performance.now() - this.fadeOutStart
      if (el < LINGER) {
        this.focusAmt = this.fadeFrom
      } else {
        const t = Math.min(1, (el - LINGER) / FADE)
        this.focusAmt = this.fadeFrom * (1 - this.smoother(t))
        if (t >= 1) { this.focusAmt = 0; this.fadeOutStart = null; this.fadeUnit = null }
      }
    } else {
      this.focusAmt = 0
    }
    const focusTgt = du ? 1 : 0
    if (du) {
      this.traceAmt += (1 - this.traceAmt) * (this.reduced ? 1 : 0.2)
      if (1 - this.traceAmt < 0.006) this.traceAmt = 1
    }
    this.focusUnit = du
    const ot = this.outlineHeld ? 1 : 0
    const ko = this.reduced ? 1 : (ot > this.outlineAmt ? 0.2 : 0.13)
    this.outlineAmt += (ot - this.outlineAmt) * ko
    if (Math.abs(ot - this.outlineAmt) < 0.004) this.outlineAmt = ot

    this.drawInteractive()

    return (
      this.focusAmt !== focusTgt ||
      (!!du && this.traceAmt < 1) ||
      this.ripples.length > 0 ||
      this.outlineAmt !== ot ||
      this.lockedKeys.size > 0 ||
      this.fadeOutStart != null ||
      this.crossRipples.length > 0 ||
      this.topFlashes.length > 0 ||
      this.voidWaves.length > 0 ||
      this.chargeVoid !== null   // keep animating while a void holds charge
    )
  }

  private drawInteractive() {
    const ctx = this.ctx, dpr = this.dpr, W = this.W, H = this.H
    const dev = this.canvas

    // Near-critical void charge → a sub-pixel shudder of the whole field, the
    // "about to go" tension (skipped under reduced motion).
    const chargeFrac = this.chargeVoid ? this.chargeLive() / this.N : 0
    let jx = 0, jy = 0
    if (!this.prefersReduced && chargeFrac > this.TREMOR_AT) {
      const amp = (chargeFrac - this.TREMOR_AT) / (1 - this.TREMOR_AT) * 1.6 * dpr
      jx = (Math.random() - 0.5) * 2 * amp
      jy = (Math.random() - 0.5) * 2 * amp
    }

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    if (this.settled) {
      ctx.drawImage(this.settled, 0, 0, this.settled.width, this.settled.height, jx, jy, dev.width, dev.height)
    } else {
      ctx.fillStyle = '#000'; ctx.fillRect(0, 0, dev.width, dev.height)
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'

    // Ambient breathing — slow warm pulse (~9s period)
    const ts = performance.now() / 1000
    const breath = (Math.sin(ts * 0.698) + 1) * 0.5
    ctx.globalAlpha = 0.016 * breath; ctx.fillStyle = this.EFFECT.breath; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1

    // Void charge glow — the poked void heats up toward its rupture
    if (this.chargeVoid && chargeFrac > 0.01) {
      const pulse = 0.72 + 0.28 * Math.sin(performance.now() / 110)
      const a = Math.min(1, chargeFrac) * pulse
      const hot = this.lerpC(this.COL.core, this.EFFECT.ripple, Math.min(1, chargeFrac * 1.1))
      ctx.globalCompositeOperation = 'lighter'
      for (const ri of this.chargeVoid.regs) {
        ctx.globalAlpha = a * 0.55; ctx.fillStyle = hot; ctx.fill(this.regs[ri].path)
      }
      ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
    }

    // During hover-release the focusUnit has already cleared to null; fall back
    // to fadeUnit so the released key + its lamp keep rendering (dimming with fa)
    // instead of snapping dark on the first fade frame.
    const u = this.focusUnit ?? this.fadeUnit, fa = this.focusAmt
    if (fa > 0.001) {
      ctx.globalAlpha = this.DIM * fa; ctx.fillStyle = this.EFFECT.dim; ctx.fillRect(0, 0, W, H); ctx.globalAlpha = 1
    }

    if (fa > 0.001 && u && isKey(u)) {
      const col = this.COL
      for (const ri of u.regs) { const r = this.regs[ri]; if (r.kind !== 'top') { ctx.fillStyle = col.face; ctx.fill(r.path) } }
      for (const ri of u.regs) { const r = this.regs[ri]; if (r.kind === 'top')  { ctx.fillStyle = col.top;  ctx.fill(r.path) } }
      ctx.lineWidth = Math.max(1.2, 5 * this.SS); ctx.strokeStyle = col.core
      for (const ri of u.regs) ctx.stroke(this.regs[ri].path)

      // Lamp radiation — neighboring keys in the same row/column emerge from dim
      const hcx = u.cx, hcy = u.cy, LAMP_FALL = 400, ROW_T = 80, COL_T = 60
      for (const un of this.units) {
        if (!isKey(un) || un === u) continue
        const sR = Math.abs(un.cy - hcy) < ROW_T, sC = Math.abs(un.cx - hcx) < COL_T
        if (!sR && !sC) continue
        const axDist = sR ? Math.abs(un.cx - hcx) : Math.abs(un.cy - hcy)
        const lF = Math.exp(-axDist / LAMP_FALL) * fa
        if (lF < 0.04) continue
        for (const ri of un.regs) { const r = this.regs[ri]; if (r.kind !== 'top') { ctx.globalAlpha = lF; ctx.fillStyle = col.face; ctx.fill(r.path) } }
        for (const ri of un.regs) { const r = this.regs[ri]; if (r.kind === 'top')  { ctx.globalAlpha = lF; ctx.fillStyle = col.top;  ctx.fill(r.path) } }
        ctx.lineWidth = Math.max(1.2, 5 * this.SS); ctx.strokeStyle = col.core
        for (const ri of un.regs) ctx.stroke(this.regs[ri].path)
        ctx.globalAlpha = 1
      }

      // Lock flash overlay for the hovered key
      if (this.lockedKeys.has(u)) {
        const ld = this.lockedKeys.get(u)!
        const lf = Math.pow(Math.max(0, 1 - (performance.now() - ld.lockedAt) / 700), 1.5) * 0.88
        if (lf > 0.02) { ctx.globalAlpha = lf; ctx.fillStyle = this.EFFECT.lockFlash; for (const ri of u.regs) ctx.fill(this.regs[ri].path); ctx.globalAlpha = 1 }
      }
    }

    // Held void press — push-in effect
    const oa = this.smoother(this.outlineAmt)
    if (oa > 0.001 && this.pressedVoid) {
      const pr = this.regs[this.pressedVoid.regs[0]]
      ctx.save()
      ctx.globalAlpha = 0.55 * oa; ctx.fillStyle = '#0a0401'; ctx.fill(pr.path); ctx.globalAlpha = 1
      ctx.clip(pr.path)
      ctx.shadowColor = 'rgba(0,0,0,0.9)'; ctx.shadowBlur = 16 * oa
      ctx.lineWidth = 9; ctx.strokeStyle = 'rgba(0,0,0,0.7)'; ctx.stroke(pr.path)
      ctx.restore()
    }
    this.drawVoidWaves()

    // Locked keys — persistent glow, slow pulse, auto-fade
    if (this.lockedKeys.size > 0) {
      const col = this.COL, nowT = performance.now(), FADE = this.AUTO_FADE
      const toDelete: Unit[] = []
      for (const [lu, ldata] of this.lockedKeys) {
        if (lu === u && fa > 0.01) continue
        const age = (nowT - ldata.t0) / FADE
        let la = 1 - this.smoother(age)
        if (la < 0.01) { toDelete.push(lu); continue }
        la = Math.max(0, Math.min(1, la + 0.07 * Math.sin(nowT / 1000 * 1.9 + ldata.phase)))
        const lockAge = (nowT - ldata.lockedAt) / 700
        const lockFlash = lockAge < 1 ? Math.pow(1 - lockAge, 1.5) * 0.88 : 0
        if (lockFlash > 0.02) {
          ctx.globalAlpha = lockFlash; ctx.fillStyle = this.EFFECT.lockFlash
          for (const ri of lu.regs) ctx.fill(this.regs[ri].path)
          ctx.globalAlpha = 1
        }
        if (fa > 0.001 && u) { const d = Math.hypot(lu.cx - u.cx, lu.cy - u.cy); la = Math.min(1, la + Math.exp(-d/400) * fa * 0.35) }
        for (const ri of lu.regs) { const r = this.regs[ri]; if (r.kind !== 'top') { ctx.globalAlpha = la; ctx.fillStyle = col.face; ctx.fill(r.path) } }
        for (const ri of lu.regs) { const r = this.regs[ri]; if (r.kind === 'top')  { ctx.globalAlpha = la; ctx.fillStyle = col.top;  ctx.fill(r.path) } }
        ctx.lineWidth = Math.max(1.2, 5 * this.SS); ctx.strokeStyle = col.core
        for (const ri of lu.regs) ctx.stroke(this.regs[ri].path)
        ctx.globalAlpha = 1
      }
      for (const lu of toDelete) this.lockedKeys.delete(lu)
    }

    this.drawCrossRipples()
    this.drawTopFlashes()
    this.drawRipples()
  }

  private drawTopFlashes() {
    if (!this.topFlashes.length) return
    const ctx = this.ctx, now = performance.now(), alive: TopFlash[] = []
    for (const tf of this.topFlashes) {
      const el = (now - tf.t0) / 1000; let any = false
      const mag = tf.mag ?? 0.42
      for (const p of tf.picks) {
        const t = el / p.life; if (t >= 1) continue; any = true
        // Click scatter: instant attack, decays (pow). Idle breath: symmetric
        // swell up-and-recede (sin) so it reads as a gentle pulse, not a flash.
        const env = tf.swell ? Math.sin(t * Math.PI) : Math.pow(1 - t, 1.5)
        ctx.globalAlpha = env * mag
        ctx.fillStyle = this.EFFECT.topScatter; ctx.fill(p.path)
      }
      ctx.globalAlpha = 1
      if (any) alive.push(tf)
    }
    this.topFlashes = alive
  }

  private drawVoidWaves() {
    if (!this.voidWaves.length) return
    const ctx = this.ctx, now = performance.now(), LIFE = 2000
    const alive: VoidWave[] = [], FALL = this.PUSH_FALL, WE = this.WAVE_EDGE
    ctx.globalCompositeOperation = 'lighter'
    for (const w of this.voidWaves) {
      const elapsed = now - w.t0, life = elapsed / LIFE
      if (life >= 1) continue; alive.push(w)
      const wOa = 1 - life, wR = elapsed * this.WAVE_SPEED
      for (const r of this.cores) {
        const sameRow = r.tj === w.pr.tj && r.kind === w.pr.kind
        const sameCol = r.ti === w.pr.ti
        if (!sameRow && !sameCol) continue
        let dist = Infinity, baseF = 0
        if (sameRow) { const dx = Math.abs(r.cx - w.pr.cx); const a = Math.exp(-dx/FALL) * this.smoother((wR-dx)/WE); if (a > baseF) { baseF = a; dist = dx } }
        if (sameCol) { const dy = Math.abs(r.cy - w.pr.cy); const a = Math.exp(-dy/FALL) * this.smoother((wR-dy)/WE); if (a > baseF) { baseF = a; dist = dy } }
        baseF *= wOa; if (baseF < 0.02) continue
        const settle = this.smoother((wR - dist) / WE) * wOa * Math.exp(-dist / FALL)
        if (settle < 0.02) continue
        ctx.globalAlpha = 0.45 * settle; ctx.fillStyle = this.EFFECT.wave; ctx.fill(r.path)
      }
    }
    ctx.globalAlpha = 1; ctx.globalCompositeOperation = 'source-over'
    this.voidWaves = alive
  }

  private drawCrossRipples() {
    if (!this.crossRipples.length) return
    const ctx = this.ctx, now = performance.now(), alive: CrossRip[] = []
    const XSPEED = 1.1, XLIFE = 1000, XSIG = 80, COL_B = 70
    ctx.globalCompositeOperation = 'lighter'
    for (const rp of this.crossRipples) {
      const el = now - rp.t0; if (el >= XLIFE) continue; alive.push(rp)
      const wR = el * XSPEED, env = Math.pow(1 - el / XLIFE, 1.4)
      const ROW_B = rp.kind === 'key' ? 62 : 120
      for (const r of this.regs) {
        const inRow = Math.abs(r.cy - rp.oy) < ROW_B, inCol = Math.abs(r.cx - rp.ox) < COL_B
        if (!inRow && !inCol) continue
        const d = inRow ? Math.abs(r.cx - rp.ox) : Math.abs(r.cy - rp.oy)
        const wave = Math.exp(-Math.pow(wR - d, 2) / (XSIG * XSIG)) * env
        if (wave < 0.03) continue
        const regIsVoid = r.kind === 'star' || r.kind === 'diamond'
        const regIsKey  = r.kind === 'face' || r.kind === 'top'
        if (rp.kind === 'void' && !regIsVoid) continue
        if (rp.kind === 'key'  && !regIsKey)  continue
        ctx.globalAlpha = wave * 0.28; ctx.fillStyle = this.EFFECT.crossRipple; ctx.fill(r.path)
      }
      ctx.globalAlpha = 1
    }
    ctx.globalCompositeOperation = 'source-over'
    this.crossRipples = alive
  }

  private drawRipples() {
    if (!this.ripples.length) return
    const ctx = this.ctx, now = performance.now(), col = this.COL
    const alive = this.ripples.filter(rp => (now - rp.t0) / 1000 < this.RIP_LIFE)
    this.ripples = alive
    if (!alive.length) return

    for (const rp of alive) {
      const el = (now - rp.t0) / 1000, life = el / this.RIP_LIFE
      rp._R = el * this.RIP_SPEED
      rp._env = (1 - life) * (1 - life) * Math.min(1, el / 0.07)
    }

    const colorFor = (k: RegionKind) => k === 'face' ? col.face : k === 'top' ? col.top : col.core
    const SIG = this.RIP_SIG, INV = 1 / (2 * SIG * SIG), CUT = SIG * 3
    for (const r of this.regs) {
      let add = 0
      for (const rp of alive) {
        const dx = r.cx - rp.ox!, dy = r.cy - rp.oy!
        const d = Math.sqrt(dx*dx + dy*dy), o = d - rp._R!
        if (o > CUT || o < -CUT) continue
        add += Math.exp(-o * o * INV) * rp._env!
      }
      if (add < 0.02) continue
      ctx.globalAlpha = Math.min(1, add) * this.RIP_MAG
      ctx.fillStyle = this.lerpC(colorFor(r.kind), this.EFFECT.ripple, 0.72)
      ctx.fill(r.path)
    }
    ctx.globalAlpha = 1
  }

  private drawBuild(): boolean {
    if (!this.ctx || !this.regs.length) return false
    const ctx = this.ctx, dpr = this.dpr, md = this.md
    const T = (this.reduced ? 0.001 : this.DUR) * 1000
    const prog = (performance.now() - this.buildStart - (this.reduced ? 0 : this.HOLD)) / T
    const { core, face, top } = this.COL

    ctx.setTransform(1, 0, 0, 1, 0, 0)
    ctx.fillStyle = '#000'
    ctx.fillRect(0, 0, this.canvas.width, this.canvas.height)
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.lineJoin = 'round'; ctx.lineCap = 'round'

    if (prog > 0) {
      const fStart = 0.27, fSpread = 0.46, coreDur = 0.10, keyDur = 0.12, keyLag = 0.03
      const colorFor = (k: RegionKind) => k === 'face' ? face : k === 'top' ? top : core
      const fillReg = (r: Reg) => {
        const dN = r.dist / md, isCore = (r.kind === 'star' || r.kind === 'diamond')
        const t0 = fStart + fSpread * dN + (isCore ? 0 : keyLag), dur = isCore ? coreDur : keyDur
        let fp = (prog - t0) / dur
        fp = fp < 0 ? 0 : fp > 1 ? 1 : fp
        if (fp <= 0) return
        ctx.fillStyle = colorFor(r.kind)
        if (fp < 1) {
          const sm = this.smoother(fp), e = 0.92 + 0.08 * sm
          ctx.globalAlpha = sm; ctx.save()
          ctx.translate(r.cx, r.cy); ctx.scale(e, e); ctx.translate(-r.cx, -r.cy)
          ctx.fill(r.path); ctx.restore(); ctx.globalAlpha = 1
        } else {
          ctx.fill(r.path)
        }
      }

      for (let n = 0; n < this.regs.length; n++) if (this.regs[n].kind !== 'top') fillReg(this.regs[n])
      for (let n = 0; n < this.regs.length; n++) if (this.regs[n].kind === 'top')  fillReg(this.regs[n])

      ctx.lineWidth = Math.max(1.4, 5.5 * this.SS); ctx.shadowBlur = 0
      const lineDone = (fStart - 0.19) + fSpread + keyDur
      if (prog >= lineDone) {
        ctx.strokeStyle = core; ctx.stroke(this.linePath)
      } else {
        for (let n = 0; n < this.frost.length; n++) {
          const o = this.frost[n], dN = o.dist / md
          let a = (prog - ((fStart - 0.19) + fSpread * dN)) / keyDur
          if (a <= 0) continue; a = a > 1 ? 1 : a
          const lf = this.smoother((prog - (fStart + fSpread * dN)) / keyDur)
          ctx.globalAlpha = this.smoother(a)
          ctx.strokeStyle = this.lerpC(this.PEN, core, lf)
          ctx.stroke(o.full)
        }
        ctx.globalAlpha = 1
      }
    }

    // Fire build-complete once the on-screen fills are done. The lattice is
    // oversized for the -15° tilt, so the farthest regions (which finish last,
    // ~0.88) sit off-screen; every VISIBLE region is filled by ~0.79. Firing at
    // 0.85 starts the card place sooner with no visible pop, since bakeSettled
    // redraws the full pattern regardless of prog.
    return prog > 0.85
  }
}
