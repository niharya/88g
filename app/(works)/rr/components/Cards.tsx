'use client'

// Cards — Section 3 of /rr (Cards & UI)
//
// Architecture:
//   rr-canvas--cards-evo (data-tab drives subtitle visibility)
//   ├── rr-cards-header  — title (scramble) + subtitle (clip wipe) + tabs
//   └── rr-cards-body    — AnimatePresence crossfade between:
//       ├── CardFan        when tab === 'cards'
//       └── InterfacePanel when tab === 'interface'
//
// Title: ScrambleText morphs between tab names.
// Subtitle: clip-path wipe born from title, returns to it. Skips on first mount.
// Body: AnimatePresence crossfade with subtle scale + opacity.

import { Fragment, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion'
import { ScrambleText } from './game/ScrambleText'
import CardFan from './cards/CardFan'
import InterfacePanel from './cards/InterfacePanel'
import RugShader from './RugShader'

type Tab = 'cards' | 'interface'

const TITLES: Record<Tab, string> = {
  cards: 'Evolution of the Card Layouts',
  interface: 'The Arena',
}

const SUBTITLE_ENTER = { opacity: 0, y: -6, clipPath: 'inset(0 0 100% 0)' }
const SUBTITLE_VISIBLE = { opacity: 1, y: 0, clipPath: 'inset(0 0 0% 0)' }
const SUBTITLE_EXIT = { opacity: 0, y: -6, clipPath: 'inset(0 0 100% 0)' }

const subtitleTransition = {
  duration: 0.12,
  ease: [0.45, 0, 0.15, 1] as const,
}

// Tab body: subtle crossfade with slight scale
const bodyVariants = {
  enter:   { opacity: 0, scale: 0.985 },
  active:  { opacity: 1, scale: 1 },
  exit:    { opacity: 0, scale: 0.985 },
}

const bodyTransition = {
  duration: 0.15,
  ease: [0.45, 0, 0.15, 1] as const,
}

export default function Cards() {
  const [tab, setTab] = useState<Tab>('cards')
  const hasSwitched = useRef(false)
  const canvasRef = useRef<HTMLDivElement>(null)
  const sectionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (canvasRef.current) {
      sectionRef.current = canvasRef.current.closest('.mat') as HTMLElement
    }
  }, [])

  // Scroll-linked entrance
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'start start'],
  })

  const scrollSpring = { stiffness: 400, damping: 30, mass: 0.3 }

  // Header: drops in from above
  const headerYRaw       = useTransform(scrollYProgress, [0.4, 0.85], [-40, 0])
  const headerOpacityRaw = useTransform(scrollYProgress, [0.4, 0.8], [0, 1])
  const headerY       = useSpring(headerYRaw, scrollSpring)
  const headerOpacity = useSpring(headerOpacityRaw, scrollSpring)

  // Body: rises from below, cards scale up from afar
  const bodyYRaw       = useTransform(scrollYProgress, [0.45, 0.9], [60, 0])
  const bodyOpacityRaw = useTransform(scrollYProgress, [0.45, 0.85], [0, 1])
  const bodyScaleRaw   = useTransform(scrollYProgress, [0.4, 0.85], [0.88, 1])
  const bodyY       = useSpring(bodyYRaw, scrollSpring)
  const bodyOpacity = useSpring(bodyOpacityRaw, scrollSpring)
  const bodyScale   = useSpring(bodyScaleRaw, scrollSpring)

  const handleTab = (t: Tab) => {
    hasSwitched.current = true
    setTab(t)
  }

  return (
    <Fragment>
    {/* Shader — fills the mat, sits below grid + noise + canvas content */}
    <RugShader />

    <div ref={canvasRef} className="rr-canvas rr-canvas--cards-evo" data-tab={tab}>

      {/* Header */}
      <motion.div className="rr-cards-header" style={{ y: headerY, opacity: headerOpacity }}>
        <h2 key={tab} className="rr-cards-title">
          <ScrambleText text={TITLES[tab]} profile="minimal" duration={400} />
        </h2>

        <div className="rr-cards-subtitle-slot">
          <AnimatePresence mode="wait">
            {tab === 'cards' && (
              <motion.p
                key="subtitle"
                className="rr-cards-subtitle"
                initial={hasSwitched.current ? SUBTITLE_ENTER : false}
                animate={SUBTITLE_VISIBLE}
                exit={SUBTITLE_EXIT}
                transition={subtitleTransition}
              >
                Over a Period of 3 Months
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        <div className="rr-cards-tabs">
          <button
            className={`rr-cards-tab${tab === 'cards' ? ' rr-cards-tab--active' : ''}`}
            type="button"
            onClick={() => handleTab('cards')}
          >
            Cards
          </button>
          <button
            className="rr-cards-tab-sep"
            type="button"
            onClick={() => handleTab(tab === 'cards' ? 'interface' : 'cards')}
            aria-label="Toggle tab"
          >
            <svg viewBox="0 0 24 24" fill="none">
              <path d="M12 21.29c-.214 0-.422-.05-.624-.148a1.27 1.27 0 0 1-.495-.468L6.385 13.39a2.6 2.6 0 0 1-.303-.684 2.7 2.7 0 0 1-.096-.708c0-.24.032-.476.096-.709.064-.232.165-.46.303-.684L10.88 3.33c.128-.214.293-.37.495-.469A1.3 1.3 0 0 1 12 2.71c.214 0 .422.05.624.148.201.099.366.255.495.469l4.496 7.28c.138.224.239.452.303.684.064.233.096.469.096.709s-.032.476-.096.708a2.6 2.6 0 0 1-.303.684l-4.496 7.28a1.27 1.27 0 0 1-.495.47c-.202.098-.41.148-.624.148Z" fill="currentColor"/>
            </svg>
          </button>
          <button
            className={`rr-cards-tab${tab === 'interface' ? ' rr-cards-tab--active' : ''}`}
            type="button"
            onClick={() => handleTab('interface')}
          >
            Interface
          </button>
        </div>
      </motion.div>

      {/* Tab body — crossfade between panels, scroll-linked entrance */}
      <motion.div style={{ y: bodyY, opacity: bodyOpacity, scale: bodyScale }}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={tab}
            className="rr-cards-body"
            variants={bodyVariants}
            initial="enter"
            animate="active"
            exit="exit"
            transition={bodyTransition}
          >
            {tab === 'cards' ? <CardFan /> : <InterfacePanel />}
          </motion.div>
        </AnimatePresence>
      </motion.div>

    </div>
    </Fragment>
  )
}
