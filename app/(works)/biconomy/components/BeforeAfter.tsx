'use client'

import { Img } from '../../../components/Img'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useRef } from 'react'
import Monostamp from '../../../components/Monostamp'
import type { FlowNote } from './flowSlides'

type NoteWithPointer = FlowNote & { pointerIndex?: number }

/**
 * The audit frame is capped at 1000px by `.flows__notes-wrap` (max-width:
 * 1000px) and goes full-bleed inside the mat below the mobile breakpoint.
 * Currently INERT — every flow image is `unoptimized`, so next/image emits no
 * srcset for `sizes` to select from. Kept correct and exported so the value is
 * right if the optimizer is ever re-enabled for these assets, and so Flows'
 * hidden preloads request the identical URL the visible layer will.
 */
export const FLOW_IMG_SIZES = '(max-width: 767px) 100vw, 1000px'

/**
 * Every flow image bypasses the next/image optimizer.
 *
 * These are near-lossless WebP scans of a dark dashboard UI. `/_next/image`
 * re-encodes as **lossy** WebP, and lossy WebP subsamples chroma (YUV 4:2:0)
 * at every quality setting including 100 — which is precisely what destroys
 * white text on the orange "Connect Wallet" fill. Measured on the v0.130.0
 * deploy: identical 1988×1131 dimensions, a *larger* file (127.6 KB vs
 * 114.3 KB), and still visible haloing on glyph edges — max channel delta
 * 61/255. Bigger file, worse picture.
 *
 * The cost is real and accepted: mobile fetches the full asset (~114 KB)
 * instead of a ~30 KB resize. These screenshots are the chapter's evidence;
 * crispness is the product. See ANOMALIES.md → "Audit-frame image loading".
 */
export const FLOW_IMG_UNOPTIMIZED = true

function NotesOverlay({
  notes,
  visible,
  animationKey,
  showPointers,
  hoveredIndex,
  onHoverChange,
  liftRotate = 0,
  hudMode = false,
  onHudDragEnd,
  containerRef,
}: {
  notes: NoteWithPointer[]
  visible: boolean
  animationKey: string
  showPointers: boolean
  hoveredIndex?: number | null
  onHoverChange?: (index: number | null) => void
  liftRotate?: number
  hudMode?: boolean
  onHudDragEnd?: (index: number, x: number, y: number) => void
  containerRef?: React.RefObject<HTMLDivElement | null>
}) {
  // HUD drag — native pointer events. Framer's `drag` prop re-applies its
  // own transform which fought the state-driven left/top update; this path
  // just tracks the cursor delta and writes absolute percentages.
  const handleHudPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>, displayIndex: number, baseX: number, baseY: number) => {
      if (!hudMode || !containerRef?.current) return
      e.preventDefault()
      e.stopPropagation()
      const el = e.currentTarget
      el.setPointerCapture(e.pointerId)
      const rect = containerRef.current.getBoundingClientRect()
      const startX = e.clientX
      const startY = e.clientY
      const clamp = (v: number) => Math.max(0, Math.min(1, v))
      const move = (me: PointerEvent) => {
        const nx = clamp(baseX + (me.clientX - startX) / rect.width)
        const ny = clamp(baseY + (me.clientY - startY) / rect.height)
        onHudDragEnd?.(displayIndex, nx, ny)
      }
      const up = () => {
        el.removeEventListener('pointermove', move)
        el.removeEventListener('pointerup', up)
        el.removeEventListener('pointercancel', up)
      }
      el.addEventListener('pointermove', move)
      el.addEventListener('pointerup', up)
      el.addEventListener('pointercancel', up)
    },
    [hudMode, containerRef, onHudDragEnd],
  )

  if (!notes?.length || !visible) return null
  return (
    <div className="ba__notes-overlay" aria-hidden={false}>
      <AnimatePresence>
        {showPointers &&
          notes.map((note, i) => {
            const displayIndex = note.pointerIndex ?? i
            const isHovered = hoveredIndex === displayIndex
            return (
              <motion.div
                key={`${animationKey}-${displayIndex}-${i}`}
                initial={hudMode ? false : { opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, transition: { duration: 0.25 } }}
                transition={
                  hudMode
                    ? { duration: 0 }
                    : {
                        delay: 0.15 + i * 0.075,
                        duration: 0.3,
                        type: 'spring',
                        bounce: 0.1,
                      }
                }
                className={`ba__note-pointer${isHovered ? ' is-hovered' : ''}${hudMode ? ' ba__note-pointer--hud' : ''}`}
                style={{
                  left: `${note.x * 100}%`,
                  top: `${note.y * 100}%`,
                  ['--lift-rotate' as string]: `${liftRotate.toFixed(2)}deg`,
                }}
                onPointerDown={
                  hudMode
                    ? e => handleHudPointerDown(e, displayIndex, note.x, note.y)
                    : undefined
                }
                onMouseEnter={() => onHoverChange?.(displayIndex)}
                onMouseLeave={() => onHoverChange?.(null)}
                title={note.text}
              >
                <Monostamp
                  tone="olive"
                  variant="tall"
                  appearance="dark"
                  active={isHovered}
                >
                  {displayIndex + 1}
                </Monostamp>
              </motion.div>
            )
          })}
      </AnimatePresence>
    </div>
  )
}

export default function BeforeAfter({
  beforeImage,
  afterImage,
  beforeNotes = [],
  afterNotes = [],
  className = '',
  showAfter = false,
  animationKey = '0-false',
  showPointers = false,
  internalNoteToggledIndex = null,
  hoveredNoteIndex = null,
  onNoteHoverChange,
  liftRotate = 0,
  hudMode = false,
  onHudDragEnd,
  onAfterReady,
}: {
  beforeImage: string
  afterImage: string
  beforeNotes?: FlowNote[]
  afterNotes?: FlowNote[]
  className?: string
  showAfter?: boolean
  animationKey?: string
  showPointers?: boolean
  internalNoteToggledIndex?: number | null
  hoveredNoteIndex?: number | null
  onNoteHoverChange?: (index: number | null) => void
  liftRotate?: number
  hudMode?: boolean
  onHudDragEnd?: (state: 'before' | 'after', index: number, x: number, y: number) => void
  /** Fires with the after-image src once it is painted-ready. */
  onAfterReady?: (src: string) => void
}) {
  const beforeContainerRef = useRef<HTMLDivElement>(null)
  const afterContainerRef = useRef<HTMLDivElement>(null)

  // Near-instant layer swap on toggle. The parent's opacity fades over
  // --dur-instant (0.1s) — fast enough to read as immediate, slow enough
  // to register as a crossfade between two layers. The thumbhash
  // placeholder inside is visible the moment the layer becomes opaque,
  // and the sharp image reveals over it via the .flows opacity-fade
  // rule in biconomy.css when bytes arrive.
  const transition = { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.1 }

  const showingInternalNote =
    showAfter &&
    internalNoteToggledIndex != null &&
    afterNotes[internalNoteToggledIndex]?.image

  const internalNoteImageIndex =
    afterNotes?.findIndex(n => n?.image && n?.toggleLabel) ?? -1
  const hasInternalNoteImage = internalNoteImageIndex >= 0

  const afterOverlayNotes: NoteWithPointer[] = showingInternalNote
    ? [{ ...afterNotes[internalNoteToggledIndex!], pointerIndex: internalNoteToggledIndex! }]
    : (afterNotes || [])
        .map((n, i) => ({ ...n, pointerIndex: i }))
        .filter(n => !n.toggleLabel)

  return (
    <div className={`ba${className ? ` ${className}` : ''}`}>
      {/* Before image — the one thing on screen, so it is the one thing
          fetched at high priority. It used to be the ONLY lazy image in the
          frame, losing the network race to two `visibility: hidden` preloads
          and the opacity-0 after layer; see ANOMALIES.md → "Audit-frame image
          loading". Never demote this below its neighbours again. */}
      <div className="ba__before" ref={beforeContainerRef}>
        <Img
          src={beforeImage}
          alt="Before"
          intrinsic
          sizes={FLOW_IMG_SIZES}
          unoptimized={FLOW_IMG_UNOPTIMIZED}
          className="ba__img"
          draggable={false}
          loading="eager"
          fetchPriority="high"
          placeholder="hash"
        />
        <NotesOverlay
          notes={beforeNotes}
          visible={!showAfter}
          animationKey={animationKey}
          showPointers={showPointers}
          hoveredIndex={hoveredNoteIndex}
          onHoverChange={onNoteHoverChange}
          liftRotate={liftRotate}
          hudMode={hudMode}
          onHudDragEnd={(idx, x, y) => onHudDragEnd?.('before', idx, x, y)}
          containerRef={beforeContainerRef}
        />
      </div>

      {/* After image — fades in over before */}
      <motion.div
        initial={false}
        animate={{
          opacity: showAfter ? 1 : 0,
          pointerEvents: showAfter ? 'auto' : 'none',
        }}
        transition={transition}
        className="ba__after"
      >
        <div className="ba__after-inner" ref={afterContainerRef}>
          <div className="ba__after-main">
            {/* loading="eager": the after-image should be in hand before the
                user reaches for the toggle, so the reveal is a clean fade
                rather than a fade racing the fetch. Priority stays `auto` —
                it must not outrank the before layer, which is what the
                reader is actually looking at.
                `onReady` reports up so the toggle can show a pending state
                instead of crossfading to a ThumbHash smear that, on these
                dark dashboard scans, is indistinguishable from the before
                image (see ANOMALIES.md → "Audit-frame image loading"). */}
            <Img
              src={afterImage}
              alt="After"
              intrinsic
              sizes={FLOW_IMG_SIZES}
              unoptimized={FLOW_IMG_UNOPTIMIZED}
              className="ba__img"
              draggable={false}
              loading="eager"
              placeholder="hash"
              onReady={() => onAfterReady?.(afterImage)}
            />
          </div>
          {/* Internal note image — fades in when note toggle is active */}
          {hasInternalNoteImage && (
            <motion.div
              className="ba__internal-note-img"
              initial={false}
              animate={{ opacity: showingInternalNote ? 1 : 0 }}
              transition={{ ease: 'easeOut', duration: 0.25 }}
            >
              <Img
                src={afterNotes[internalNoteImageIndex].image!}
                alt="After (next step)"
                intrinsic
                sizes={FLOW_IMG_SIZES}
                unoptimized={FLOW_IMG_UNOPTIMIZED}
                className="ba__img"
                draggable={false}
                loading="lazy"
                fetchPriority="low"
                placeholder="hash"
              />
            </motion.div>
          )}
          <NotesOverlay
            notes={afterOverlayNotes}
            visible={showAfter}
            animationKey={animationKey}
            showPointers={showPointers}
            hoveredIndex={hoveredNoteIndex}
            onHoverChange={onNoteHoverChange}
            liftRotate={liftRotate}
            hudMode={hudMode}
            onHudDragEnd={(idx, x, y) => onHudDragEnd?.('after', idx, x, y)}
            containerRef={afterContainerRef}
          />
        </div>
      </motion.div>
    </div>
  )
}
