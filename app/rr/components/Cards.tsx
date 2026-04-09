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

import { Fragment, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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


  const handleTab = (t: Tab) => {
    hasSwitched.current = true
    setTab(t)
  }

  return (
    <Fragment>
    {/* Shader — fills the mat, sits below grid + noise + canvas content */}
    <RugShader />

    <div className="rr-canvas rr-canvas--cards-evo" data-tab={tab}>

      {/* Header */}
      <div className="rr-cards-header">
        <h2 className="rr-cards-title">
          <ScrambleText text={TITLES[tab]} duration={400} tick={30} pool="abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ" />
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
                over a period of 3 months
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
      </div>

      {/* Tab body — crossfade between panels */}
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

    </div>
    </Fragment>
  )
}
