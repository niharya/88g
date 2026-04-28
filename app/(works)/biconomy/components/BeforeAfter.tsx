'use client'

import { Img } from '../../../components/Img'
import { motion, AnimatePresence } from 'framer-motion'
import { useCallback, useRef } from 'react'
import Monostamp from '../../../components/Monostamp'
import type { FlowNote } from './flowSlides'

type NoteWithPointer = FlowNote & { pointerIndex?: number }

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
      {/* Before image */}
      <div className="ba__before" ref={beforeContainerRef}>
        <Img
          src={beforeImage}
          alt="Before"
          intrinsic
          sizes="100vw"
          className="ba__img"
          draggable={false}
          unoptimized
          loading="lazy"
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
            {/* loading="eager": the after-image must be fully loaded
                (and materialized) before the user clicks toggle, so the
                opacity reveal between before and after is a clean fade
                rather than a fade racing the materialize keyframe.
                placeholder="hash": ThumbHash blurry preview shows during
                any load gap (e.g. fast toggle on cold cache) so the
                area is never empty — fades to sharp via the .ba__after
                250ms opacity keyframe in biconomy.css. */}
            <Img
              src={afterImage}
              alt="After"
              intrinsic
              sizes="100vw"
              className="ba__img"
              draggable={false}
              unoptimized
              loading="eager"
              placeholder="hash"
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
                sizes="100vw"
                className="ba__img"
                draggable={false}
                unoptimized
                loading="lazy"
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
