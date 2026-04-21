'use client'

import {
  AnimatePresence,
  motion,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from 'framer-motion'
import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { flows, type FlowNote } from './flowSlides'
import BeforeAfter from './BeforeAfter'
import NavPill from './NavPill'

// ── ArrowBack SVG (for notes tab) ─────────────────────────────────────────────
function ArrowBackIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <mask id="arrow-back-mask" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 20 1.74846e-06)" fill="white" />
      </mask>
      <g mask="url(#arrow-back-mask)">
        <path d="M7.52271 11.0208L15.38 11.0208C15.6631 11.0208 15.9039 10.9219 16.1025 10.724C16.3011 10.5262 16.4004 10.2863 16.4004 10.0044C16.4004 9.72243 16.3011 9.48111 16.1025 9.28042C15.9039 9.07959 15.6631 8.97917 15.38 8.97917L7.52271 8.97917L10.7346 5.76729C10.9393 5.56257 11.0436 5.32021 11.0475 5.04021C11.0515 4.76035 10.9497 4.51326 10.7419 4.29896C10.5341 4.09785 10.2903 3.99924 10.0104 4.00313C9.73056 4.00702 9.48806 4.1116 9.28292 4.31688L4.32917 9.27708C4.23056 9.37583 4.15403 9.48861 4.09959 9.61542C4.04528 9.74236 4.01813 9.87167 4.01813 10.0033C4.01813 10.135 4.04528 10.2642 4.09959 10.391C4.15403 10.518 4.22771 10.628 4.32063 10.721L9.29084 15.691C9.50639 15.9067 9.74674 16.0111 10.0119 16.0042C10.2769 15.9972 10.5133 15.8892 10.721 15.6802C10.9288 15.4659 11.0327 15.2196 11.0327 14.9413C11.0327 14.6629 10.9288 14.4222 10.721 14.2192L7.52271 11.0208Z" fill="currentColor" />
      </g>
    </svg>
  )
}

export default function Flows() {
  const TOTAL_SLIDES = flows.length

  const [slideToggleStates, setSlideToggleStates] = useState<boolean[]>(
    Array(TOTAL_SLIDES).fill(false)
  )
  const [currentSlide, setCurrentSlide] = useState(1)
  const [noteInternalToggle, setNoteInternalToggle] = useState<Record<string, boolean>>({})
  const [showNotes, setShowNotes] = useState(false)
  const [hoveredNoteIndex, setHoveredNoteIndex] = useState<number | null>(null)
  // Fresh tilt on each hover-enter edge — snaps to either -2° or +2°.
  // Binary (vs continuous) gives each lift a more deliberate, printed feel.
  const [liftRotate, setLiftRotate] = useState(0)
  const onChipHoverChange = (idx: number | null) => {
    if (idx != null && hoveredNoteIndex !== idx) {
      setLiftRotate(Math.random() < 0.5 ? -2 : 2)
    }
    setHoveredNoteIndex(idx)
  }

  // ── HUD (dev-only position editor) ──────────────────────────────────────────
  // Activated via ?hud=1. Chips become draggable; a floating panel shows the
  // live coordinates and a Capture button writes the current slide+state
  // snapshot to window.__hudLastCapture for retrieval via preview_eval.
  const [hudMode, setHudMode] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined') return
    setHudMode(new URLSearchParams(window.location.search).get('hud') === '1')
  }, [])

  // Keyed by `${slideIdx}-${state}-${noteIdx}` → { x, y }
  const [hudOverrides, setHudOverrides] = useState<
    Record<string, { x: number; y: number }>
  >({})

  const showAfter = slideToggleStates[currentSlide - 1]

  // ── Carousel nav ────────────────────────────────────────────────────────────
  const directionRef = useRef(1)
  const goPrev = () => {
    directionRef.current = -1
    setCurrentSlide(i => (i === 1 ? TOTAL_SLIDES : i - 1))
  }
  const goNext = () => {
    directionRef.current = 1
    setCurrentSlide(i => (i === TOTAL_SLIDES ? 1 : i + 1))
  }

  // ── Mobile: snap on notes-open ──────────────────────────────────────────────
  // When the accordion opens on mobile, scroll so the title + BA switch sit
  // near the top with breathing space above. Desktop unaffected — the rail
  // emerges beside main, no scroll needed.
  // Ref is on the title row specifically; wait one rAF so layout settles
  // after the class toggle before measuring.
  const headerLeftRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!showNotes) return
    if (typeof window === 'undefined') return
    if (!window.matchMedia('(max-width: 767px)').matches) return
    const id = requestAnimationFrame(() => {
      const el = headerLeftRef.current
      if (!el) return
      // Offset keeps the title row clear of the top pill strip
      // (project/chapter pills + marker-top + small breathing space).
      const top = el.getBoundingClientRect().top + window.scrollY - 72
      window.scrollTo({ top, behavior: 'smooth' })
    })
    return () => cancelAnimationFrame(id)
  }, [showNotes])

  // ── Standby → active state ──────────────────────────────────────────────────
  // The audit-flow top bar has two states:
  //   • standby  — title + (desaturated) "Before Audit" text centered.
  //                Switch thumb + nav (counter + arrows) hidden.
  //   • default  — title/switch left, nav right. Switch shows.
  // Driven by scroll position of the frame entering viewport.
  //
  // The raw scroll-linked value (activeTRaw) is clamped, then passed through a
  // useSpring so the transition settles with a mild bounce once it crosses
  // threshold — both on the way in and the way out — giving the elements a
  // perceptible "land" rather than a linear drag.
  const frameRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress: enterProgress } = useScroll({
    target: frameRef,
    offset: ['start end', 'start 0.6'],
  })
  const activeTRaw = useTransform(enterProgress, [0.35, 0.9], [0, 1], { clamp: true })
  // Mild overshoot on settle. Bounce gives a small, restrained land without
  // feeling springy; duration keeps it contained so it doesn't trail the
  // scroll too far.
  const activeT = useSpring(activeTRaw, {
    duration: 0.6,
    bounce: 0.35,
    restDelta: 0.001,
  })
  // Right-side slide: nav translates from ~center (at t=0) to its right anchor
  // (at t=1). Uses the same spring value so it lands in lockstep with the
  // other interpolating properties.
  const navTranslateX = useTransform(activeT, [0, 1], [-120, 0])
  // Left group gets a small rightward offset at standby so it reads as
  // optically centered against the mat (the title's visual weight sits on
  // the left of the group, so purely-geometric centering looks slightly off).
  const leftTranslateX = useTransform(activeT, [0, 1], [32, 0])
  // Discrete active flag for pointer-events / aria — flips at the midpoint.
  const [isActive, setIsActive] = useState(false)
  useMotionValueEvent(activeT, 'change', v => setIsActive(v > 0.5))

  // ── Toggle before/after ─────────────────────────────────────────────────────
  const handleToggleChange = (checked: boolean) => {
    setSlideToggleStates(prev => {
      const next = [...prev]
      next[currentSlide - 1] = checked
      return next
    })
  }

  // ── Visible notes for current slide ────────────────────────────────────────
  const currentFlow = flows[currentSlide - 1]

  // Apply HUD overrides to a notes array. Pure function — does not mutate.
  const applyHudOverrides = (
    notes: FlowNote[] | undefined,
    slideIdx: number,
    state: 'before' | 'after',
  ): FlowNote[] => {
    if (!notes) return []
    return notes.map((n, i) => {
      const key = `${slideIdx}-${state}-${i}`
      const o = hudOverrides[key]
      return o ? { ...n, x: o.x, y: o.y } : n
    })
  }

  const effectiveBeforeNotes = applyHudOverrides(
    currentFlow?.before?.notes,
    currentSlide - 1,
    'before',
  )
  const effectiveAfterNotes = applyHudOverrides(
    currentFlow?.after?.notes,
    currentSlide - 1,
    'after',
  )

  const visibleNotes = (showAfter ? effectiveAfterNotes : effectiveBeforeNotes) ?? []

  // HUD: drag-end handler — stores new position in overrides.
  const handleHudDragEnd = (
    state: 'before' | 'after',
    index: number,
    x: number,
    y: number,
  ) => {
    const key = `${currentSlide - 1}-${state}-${index}`
    setHudOverrides(prev => ({ ...prev, [key]: { x, y } }))
  }

  // HUD: expose a capture function that snapshots current slide+state's notes.
  // Persists to localStorage (survives reloads) + window.__hudAllCaptures
  // keyed by `${slideIdx}-${state}` so I can read any past capture, not just
  // the latest. window.__hudLastCapture still holds the most recent.
  const HUD_STORAGE_KEY = '__hudAllCaptures'
  const captureHud = () => {
    const slideIdx = currentSlide - 1
    const state: 'before' | 'after' = showAfter ? 'after' : 'before'
    const notes = state === 'after' ? effectiveAfterNotes : effectiveBeforeNotes
    const round = (v: number) => Math.round(v * 1000) / 1000
    const payload = {
      slideIdx,
      slideId: currentFlow?.id,
      state,
      notes: notes.map(n => ({
        text: n.text,
        x: round(n.x),
        y: round(n.y),
        ...(n.image ? { image: n.image } : {}),
        ...(n.toggleLabel ? { toggleLabel: n.toggleLabel } : {}),
      })),
    }
    if (typeof window !== 'undefined') {
      const w = window as unknown as {
        __hudLastCapture: unknown
        __hudAllCaptures: Record<string, unknown>
      }
      w.__hudLastCapture = payload
      w.__hudAllCaptures = w.__hudAllCaptures || {}
      w.__hudAllCaptures[`${slideIdx}-${state}`] = payload
      try {
        localStorage.setItem(HUD_STORAGE_KEY, JSON.stringify(w.__hudAllCaptures))
      } catch {}
      navigator?.clipboard?.writeText(JSON.stringify(payload, null, 2)).catch(() => {})
      // POST to the dev-only API route so the capture lands on disk
      // (.claude/hud-captures.json). Fire-and-forget; UI updates
      // independently via the captureHud return value.
      fetch('/api/dev-tools/hud-capture', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {})
    }
    return payload
  }

  // On mount, rehydrate captures and overrides from localStorage so a reload
  // doesn't wipe the user's work-in-progress.
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const raw = localStorage.getItem(HUD_STORAGE_KEY)
      if (!raw) return
      const all = JSON.parse(raw) as Record<
        string,
        { slideIdx: number; state: 'before' | 'after'; notes: Array<{ x: number; y: number }> }
      >
      ;(window as unknown as { __hudAllCaptures: typeof all }).__hudAllCaptures = all
      // Rebuild hudOverrides from captures so chips start where the user
      // left them (not at the original flowSlides.ts values).
      const rebuilt: Record<string, { x: number; y: number }> = {}
      for (const cap of Object.values(all)) {
        cap.notes.forEach((n, i) => {
          rebuilt[`${cap.slideIdx}-${cap.state}-${i}`] = { x: n.x, y: n.y }
        })
      }
      setHudOverrides(rebuilt)
    } catch {}
  }, [])

  const internalNoteToggledIndex =
    showAfter &&
    visibleNotes.some(
      (n, i) => n?.toggleLabel && noteInternalToggle[`${currentSlide - 1}-${i}`]
    )
      ? visibleNotes.findIndex(
          (n, i) => n?.toggleLabel && noteInternalToggle[`${currentSlide - 1}-${i}`]
        )
      : null

  // ── Slide window ────────────────────────────────────────────────────────────
  const getVisibleSlides = () => {
    const prevSlide = currentSlide === 1 ? TOTAL_SLIDES : currentSlide - 1
    const nextSlide = currentSlide === TOTAL_SLIDES ? 1 : currentSlide + 1
    return [prevSlide, currentSlide, nextSlide]
  }
  const visibleSlides = getVisibleSlides()

  const slideX = 12

  return (
    <motion.section
      className={`flows${isActive ? ' is-active' : ''}`}
      style={{ '--active-t': activeT } as CSSProperties & { '--active-t': MotionValue<number> }}
    >

      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div className={`flows__main${showNotes ? ' is-notes-open' : ''}`}>

        {/* Header */}
        <div className="flows__header t-h5">
          <div className="flows__header-spacer" aria-hidden="true" />
          <motion.div ref={headerLeftRef} className="flows__header-left" style={{ x: leftTranslateX }}>
            {/* Title + toggle blur-swap on flow change. Snap curve + short
                durations so the label lands well before the image finishes
                materializing — the image trails the label rather than the
                label trailing the image. */}
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={currentSlide}
                className="flows__title-group"
                initial={{ opacity: 0, filter: 'blur(4px)' }}
                animate={{ opacity: 1, filter: 'blur(0px)' }}
                exit={{
                  opacity: 0,
                  filter: 'blur(4px)',
                  transition: { duration: 0.3, ease: [0.5, 0, 0.2, 1] },
                }}
                transition={{ duration: 0.5, ease: [0.45, 0, 0.15, 1] }}
              >
                <p className="flows__title">{currentFlow?.title ?? ''}</p>

                {/* Before / After toggle */}
                <label htmlFor="flows-show-after" className="flows__ba-label">
              <motion.span
                layout
                transition={{
                  type: 'spring',
                  duration: showAfter ? 0.25 : 0.1,
                  bounce: 0.1,
                }}
                className="flows__ba-pill"
              >
                <motion.span layout="position" className="flows__ba-switch-wrap">
                  {/* Custom toggle switch replacing Radix UI Switch */}
                  <button
                    id="flows-show-after"
                    role="switch"
                    type="button"
                    aria-checked={showAfter}
                    aria-label="Toggle before/after audit states"
                    className="flows__ba-switch"
                    onClick={() => handleToggleChange(!showAfter)}
                  >
                    <span className="flows__ba-switch-thumb" />
                  </button>
                </motion.span>
                <motion.span
                  layout="position"
                  className={`flows__ba-label-text${showAfter ? ' is-after' : ''}`}
                >
                  {showAfter ? 'After Audit' : 'Before Audit'}
                </motion.span>
              </motion.span>
            </label>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Nav counter + buttons — hidden in standby, slides in from */}
          {/* center as the frame enters viewport.                       */}
          <motion.div className="flows__nav" style={{ x: navTranslateX }}>
            <p className="flows__nav-counter">
              Flow {currentSlide} of {TOTAL_SLIDES}
            </p>
            <NavPill onPrev={goPrev} onNext={goNext} />
          </motion.div>
        </div>

        {/* Image frame */}
        <div className="flows__frame" ref={frameRef}>
          <AnimatePresence mode="popLayout" initial={false}>
            {visibleSlides.map((slideNum, index) => {
              const flow = flows[slideNum - 1]
              if (!flow) return null
              const { before, after } = flow
              const isCurrent = slideNum === currentSlide
              const slideShowAfter = slideToggleStates[slideNum - 1]

              if (isCurrent) {
                return (
                  <motion.div
                    key={currentSlide}
                    className="flows__slide"
                    initial={{ x: directionRef.current > 0 ? slideX : -slideX }}
                    animate={{ x: 0 }}
                    exit={{ x: directionRef.current > 0 ? -slideX : slideX }}
                    transition={{ type: 'spring', duration: 0.3, bounce: 0 }}
                  >
                    <BeforeAfter
                      beforeImage={before.image}
                      afterImage={after.image}
                      beforeNotes={effectiveBeforeNotes}
                      afterNotes={effectiveAfterNotes}
                      showAfter={slideShowAfter}
                      animationKey={`${currentSlide}-${slideShowAfter}`}
                      showPointers={hudMode || showNotes}
                      internalNoteToggledIndex={internalNoteToggledIndex}
                      hoveredNoteIndex={hoveredNoteIndex}
                      onNoteHoverChange={onChipHoverChange}
                      liftRotate={liftRotate}
                      hudMode={hudMode}
                      onHudDragEnd={handleHudDragEnd}
                    />
                  </motion.div>
                )
              }

              return (
                <div
                  key={`slide-${index}`}
                  className="flows__slide flows__slide--hidden"
                  aria-hidden="true"
                >
                  <BeforeAfter
                    beforeImage={before.image}
                    afterImage={after.image}
                    beforeNotes={[]}
                    afterNotes={[]}
                    showAfter={slideShowAfter}
                  />
                </div>
              )
            })}
          </AnimatePresence>
        </div>
      </div>

      {/* ── Notes rail ──────────────────────────────────────────────────── */}
      <div className="flows__notes-wrap">
        <div className={`flows__notes-rail${showNotes ? ' is-open' : ''}`}>

          {/* Vertical tab button */}
          <button
            className="flows__notes-tab"
            onClick={() => setShowNotes(o => !o)}
            type="button"
            aria-label={showNotes ? 'Close notes' : 'Open notes'}
          >
            <span className="flows__notes-tab-inner t-h5">
              <ArrowBackIcon className={`flows__notes-arrow${showNotes ? '' : ' is-flipped'}`} />
              Notes
            </span>
          </button>

          {/* Note list */}
          <div className="flows__notes-content">
            <ul className="flows__notes-list t-p4">
              {visibleNotes.map((note, index) => {
                const toggleKey = `${currentSlide - 1}-${index}`
                const isInternalToggled = !!noteInternalToggle[toggleKey]
                const hasToggle = !!note?.toggleLabel
                const toggleLabel = hasToggle
                  ? isInternalToggled
                    ? note.toggleLabel!.after
                    : note.toggleLabel!.initial
                  : null

                return (
                  <li
                    key={index}
                    className={`flows__note-item${hoveredNoteIndex === index ? ' is-hovered' : ''}`}
                    onMouseEnter={() => onChipHoverChange(index)}
                    onMouseLeave={() => onChipHoverChange(null)}
                  >
                    <p className="t-p3">
                      <span className="t-h5">#{index + 1}</span>
                      <br />
                      {note.text}
                      {toggleLabel != null && (
                        <AnimatePresence
                          mode="popLayout"
                          key={noteInternalToggle[toggleKey] ? 'toggled' : 'initial'}
                        >
                          <button
                            type="button"
                            onClick={() =>
                              setNoteInternalToggle(prev => ({
                                ...prev,
                                [toggleKey]: !prev[toggleKey],
                              }))
                            }
                            className="flows__note-toggle-btn"
                          >
                            <motion.span
                              className="flows__note-toggle-label"
                              initial={{ opacity: 0, scale: 0.975 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.975, transition: { duration: 0.35 } }}
                              transition={{ duration: 0.35 }}
                              whileTap={{ scale: 0.975 }}
                            >
                              {toggleLabel}
                            </motion.span>
                          </button>
                        </AnimatePresence>
                      )}
                    </p>
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>

      {hudMode && (
        <HudPanel
          slideIdx={currentSlide - 1}
          slideId={currentFlow?.id ?? 0}
          slideTitle={currentFlow?.title ?? ''}
          state={showAfter ? 'after' : 'before'}
          notes={visibleNotes}
          onCapture={captureHud}
        />
      )}

    </motion.section>
  )
}

// ── HudPanel — dev-only position editor readout ─────────────────────────────
// Mounted only when ?hud=1. Draggable via its header bar. Collapsible.
// Shows the current slide+state notes' live coordinates. Capture button
// writes to window.__hudLastCapture and the clipboard.
function HudPanel({
  slideIdx,
  slideId,
  slideTitle,
  state,
  notes,
  onCapture,
}: {
  slideIdx: number
  slideId: number
  slideTitle: string
  state: 'before' | 'after'
  notes: FlowNote[]
  onCapture: () => unknown
}) {
  const [copied, setCopied] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  // Panel offset from its initial anchor (bottom-left). Persists across
  // re-renders via a ref-driven state updated on every drag move.
  const [offset, setOffset] = useState({ x: 0, y: 0 })
  const fmt = (v: number) => v.toFixed(3)

  const handleHeaderPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Ignore clicks on the collapse button
    if ((e.target as HTMLElement).closest('.hud-panel__collapse')) return
    e.preventDefault()
    const el = e.currentTarget
    el.setPointerCapture(e.pointerId)
    const startX = e.clientX
    const startY = e.clientY
    const baseX = offset.x
    const baseY = offset.y
    const move = (me: PointerEvent) => {
      setOffset({ x: baseX + (me.clientX - startX), y: baseY + (me.clientY - startY) })
    }
    const up = () => {
      el.removeEventListener('pointermove', move)
      el.removeEventListener('pointerup', up)
      el.removeEventListener('pointercancel', up)
    }
    el.addEventListener('pointermove', move)
    el.addEventListener('pointerup', up)
    el.addEventListener('pointercancel', up)
  }

  return (
    <div
      className={`hud-panel${collapsed ? ' is-collapsed' : ''}`}
      style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}
      role="region"
      aria-label="HUD position editor"
    >
      <div
        className="hud-panel__header"
        onPointerDown={handleHeaderPointerDown}
      >
        <span className="hud-panel__tag">HUD</span>
        <span className="hud-panel__title">
          #{slideId} {slideTitle} · <em>{state}</em>
        </span>
        <button
          type="button"
          className="hud-panel__collapse"
          onClick={() => setCollapsed(c => !c)}
          aria-label={collapsed ? 'Expand HUD' : 'Collapse HUD'}
        >
          {collapsed ? '▲' : '▼'}
        </button>
      </div>
      {!collapsed && (
        <>
          <ol className="hud-panel__list">
            {notes.map((n, i) => (
              <li key={i} className="hud-panel__item">
                <span className="hud-panel__num">{i + 1}</span>
                <span className="hud-panel__xy">
                  x {fmt(n.x)} · y {fmt(n.y)}
                </span>
              </li>
            ))}
          </ol>
          <button
            type="button"
            className="hud-panel__capture"
            onClick={() => {
              onCapture()
              setCopied(true)
              setTimeout(() => setCopied(false), 1200)
            }}
          >
            {copied ? 'Captured ✓' : `Capture ${state}`}
          </button>
          <p className="hud-panel__hint">
            slide {slideIdx} · {state} · saves to .claude/hud-captures.json
          </p>
        </>
      )}
    </div>
  )
}
