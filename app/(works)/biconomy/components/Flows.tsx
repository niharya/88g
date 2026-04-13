'use client'

import { AnimatePresence, motion, useScroll, useTransform } from 'framer-motion'
import { useRef, useState } from 'react'
import { flows } from './flowSlides'
import BeforeAfter from './BeforeAfter'

// ── ChevronBack SVG (from source Icons) ──────────────────────────────────────
function ChevronBackIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <path d="M8.23438 9.99906L13.9208 15.6857C14.1625 15.9273 14.2853 16.2261 14.2892 16.5824C14.2931 16.9386 14.1703 17.2415 13.9208 17.4909C13.6793 17.7325 13.3804 17.8532 13.0242 17.8532C12.6679 17.8532 12.369 17.7325 12.1275 17.4909L6.075 11.4384C5.86722 11.2307 5.71681 11.0051 5.62375 10.7618C5.53083 10.5184 5.48438 10.2642 5.48438 9.99906C5.48438 9.73392 5.53083 9.47969 5.62375 9.23636C5.71681 8.99302 5.86722 8.76747 6.075 8.55969L12.1275 2.51906C12.369 2.2774 12.666 2.15267 13.0183 2.1449C13.3707 2.13698 13.6715 2.25774 13.9208 2.50719C14.1625 2.74872 14.2833 3.04962 14.2833 3.4099C14.2833 3.77003 14.1625 4.07087 13.9208 4.3124L8.23438 9.99906Z" fill="currentColor" />
    </svg>
  )
}

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

  // ── Nav controls fade on scroll ─────────────────────────────────────────────
  const navControlsRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({
    target: navControlsRef,
    offset: ['end end', 'start start'],
  })
  const navControlsOpacity = useTransform(
    scrollYProgress,
    [0.15, 0.3, 0.95, 1],
    [0, 1, 1, 0]
  )

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
  const visibleNotes =
    (showAfter ? currentFlow?.after?.notes : currentFlow?.before?.notes) ?? []

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
    <section className="flows">

      {/* ── Main column ──────────────────────────────────────────────────── */}
      <div className={`flows__main${showNotes ? ' is-notes-open' : ''}`}>

        {/* Header */}
        <div className="flows__header t-h5">
          <div className="flows__header-left">
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
                key={currentSlide}
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
          </div>

          {/* Nav counter + buttons — fade in on scroll */}
          <motion.div
            ref={navControlsRef}
            className="flows__nav"
            style={{ opacity: navControlsOpacity }}
          >
            <p className="flows__nav-counter">
              Flow {currentSlide} of {TOTAL_SLIDES}
            </p>
            <div className="flows__nav-buttons">
              {[
                { onClick: goPrev, label: 'Previous', rotate: false },
                { onClick: goNext, label: 'Next', rotate: true },
              ].map(({ onClick, label, rotate }) => (
                <button
                  key={label}
                  type="button"
                  onClick={onClick}
                  className="flows__nav-btn"
                  aria-label={label}
                >
                  <ChevronBackIcon className={rotate ? 'flows__chevron flows__chevron--next' : 'flows__chevron'} />
                </button>
              ))}
            </div>
          </motion.div>
        </div>

        {/* Image frame */}
        <div className="flows__frame">
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
                      beforeNotes={before.notes}
                      afterNotes={after.notes}
                      showAfter={slideShowAfter}
                      animationKey={`${currentSlide}-${slideShowAfter}`}
                      showPointers={showNotes}
                      internalNoteToggledIndex={internalNoteToggledIndex}
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
                  <li key={index} className="flows__note-item">
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

    </section>
  )
}
