'use client'

import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
import { useRef } from 'react'
import type { FlowNote } from './flowSlides'

type NoteWithPointer = FlowNote & { pointerIndex?: number }

function NotesOverlay({
  notes,
  visible,
  animationKey,
  showPointers,
}: {
  notes: NoteWithPointer[]
  visible: boolean
  animationKey: string
  showPointers: boolean
}) {
  if (!notes?.length || !visible) return null
  return (
    <div className="ba__notes-overlay" aria-hidden={false}>
      <AnimatePresence>
        {showPointers &&
          notes.map((note, i) => {
            const displayIndex = note.pointerIndex ?? i
            return (
              <motion.div
                key={`${animationKey}-${displayIndex}-${i}`}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0, transition: { duration: 0.25 } }}
                transition={{
                  delay: 0.15 + i * 0.075,
                  duration: 0.3,
                  type: 'spring',
                  bounce: 0.1,
                }}
                className="ba__note-pointer"
                style={{
                  left: `${note.x * 100}%`,
                  top: `${note.y * 100}%`,
                }}
                title={note.text}
              >
                <span className="ba__note-number t-h5">{displayIndex + 1}</span>
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
}) {
  const hasShownAfterRef = useRef(false)

  const isFirstAfter = showAfter && !hasShownAfterRef.current
  // First reveal uses a slow spring; subsequent toggles use a quick tween.
  // (`easeOut` is an ease curve, not a `type` — framer-motion v12 enforces this.)
  const transition = isFirstAfter
    ? { type: 'spring' as const, bounce: 0, duration: 1.35 }
    : { type: 'tween' as const, ease: 'easeOut' as const, duration: 0.25 }

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
      <div className="ba__before">
        <Image
          src={beforeImage}
          alt="Before"
          width={0}
          height={0}
          sizes="100vw"
          className="ba__img"
          draggable={false}
          unoptimized
          loading="lazy"
        />
        <NotesOverlay
          notes={beforeNotes}
          visible={!showAfter}
          animationKey={animationKey}
          showPointers={showPointers}
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
        onAnimationComplete={() => {
          if (showAfter && !hasShownAfterRef.current) {
            hasShownAfterRef.current = true
          }
        }}
        className="ba__after"
      >
        <div className="ba__after-inner">
          <div className="ba__after-main">
            <Image
              src={afterImage}
              alt="After"
              width={0}
              height={0}
              sizes="100vw"
              className="ba__img"
              draggable={false}
              unoptimized
              loading="lazy"
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
              <Image
                src={afterNotes[internalNoteImageIndex].image!}
                alt="After (next step)"
                width={0}
                height={0}
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
          />
        </div>
      </motion.div>
    </div>
  )
}
