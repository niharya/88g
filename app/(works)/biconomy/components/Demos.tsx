'use client'

// Demos — port of original Demos.js
// Source-locked: preserves DOM structure, motion values, video logic.
// Jotai: none in original. next/image → <img>.
// Assets: /images/biconomy/demos/ (was /images/demos/figma/ + /images/demos/)

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import { Img } from '../../../components/Img'
import Sticker from '../../../components/Sticker'
import {
  TAB_TITLE_ENTER,
  TAB_TITLE_VISIBLE,
  TAB_TITLE_EXIT,
  TAB_TITLE_TRANSITION,
  TAB_BODY_VARIANTS,
  TAB_BODY_TRANSITION,
} from '../../../lib/motion'

// ── Data ──────────────────────────────────────────────────────────────────────

type DemoType = 'video' | 'image'

interface MediaItem {
  src: string
  thumbnail?: string
  caption: string
  linkLabel?: string
  linkUrl?: string
  /** Optional Figma embed URL — when present, desktop renders an iframe
      and `src` is used as the mobile fallback image. */
  embedUrl?: string
}

interface Demo {
  title: string
  type: DemoType
  media: MediaItem[]
}

const DEMOS: Record<string, Demo> = {
  figma: {
    title: "Used when we needed to show how the SDK would fit into a prospect's existing dApp",
    type: 'video',
    media: [
      {
        src: '/images/biconomy/demos/before.mp4',
        thumbnail: '/images/biconomy/demos/before.webp',
        caption: 'A standard game flow with four separate signing steps before the user could proceed',
      },
      {
        src: '/images/biconomy/demos/after.mp4',
        thumbnail: '/images/biconomy/demos/after.webp',
        caption: 'The same flow collapsed into a single signing step',
      },
    ],
  },
  web: {
    title: 'A live environment with real wallets and real transactions, with clear technical info at hand',
    type: 'image',
    media: [
      {
        src: '/images/biconomy/demos/web.webp',
        caption: 'A live demo — click through the flow to choose a signer (wallet, social login, passkey).',
        embedUrl: 'https://embed.figma.com/proto/g0UcX73oUXSVMCfTzYtY8Y/2024-Workshop?node-id=899-5998&viewport=-21851%2C584%2C0.68&scaling=min-zoom&content-scaling=fixed&starting-point-node-id=899%3A5998&show-proto-sidebar=1&page-id=499%3A34064&embed-host=share',
      },
    ],
  },
  game: {
    title: 'A fully on-chain game that uses our entire offering and one that feels fast and playful without exposing blockchain mechanics',
    type: 'image',
    media: [
      {
        src: '/images/biconomy/demos/game.webp',
        caption: 'Shows the arena view of the game where the cards are drawn and the player has to make the next move.',
      },
    ],
  },
}

// ── Demos ─────────────────────────────────────────────────────────────────────

export default function Demos() {
  const [currentDemo, setCurrentDemo] = useState('figma')
  const hasSwitched = useRef(false)
  const [playing, setPlaying] = useState<Record<number, boolean>>({})
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { amount: 0.1 })
  const currentDemoData = DEMOS[currentDemo]
  const currentMedia = currentDemoData?.media ?? []
  const mediaType = currentDemoData?.type ?? 'image'
  // Mobile gate for the Figma proto embed — keeps the iframe off phones
  // (cramped to interact with, ~1–2 MB to fetch). null on first paint so
  // we render the cheap image until the breakpoint resolves.
  const [isMobile, setIsMobile] = useState<boolean | null>(null)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px), (max-height: 500px)')
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  const togglePlay = (index: number) => {
    const v = videoRefs.current[index]
    if (!v) return
    if (v.paused) {
      v.play()
    } else {
      v.pause()
    }
  }

  // Pause all videos when switching tabs
  useEffect(() => {
    Object.values(videoRefs.current).forEach(v => { if (v) v.pause() })
    setPlaying({})
  }, [currentDemo])

  // Sync playing state from video elements after auto-play
  useEffect(() => {
    if (mediaType !== 'video') return
    const next: Record<number, boolean> = {}
    let changed = false
    for (let i = 0; i < currentMedia.length; i++) {
      const v = videoRefs.current[i]
      if (v && !v.paused) {
        next[i] = true
        changed = true
      }
    }
    if (changed) setPlaying(p => ({ ...p, ...next }))
  }, [currentDemo, mediaType, currentMedia.length])

  // Pause when out of view
  useEffect(() => {
    if (mediaType !== 'video' || isInView) return
    for (let i = 0; i < currentMedia.length; i++) {
      const v = videoRefs.current[i]
      if (v) v.pause()
    }
    setPlaying({})
  }, [isInView, mediaType, currentMedia.length])

  return (
    <section id="demos" className="demos">

      {/* ── Header card ─────────────────────────────────────────────────── */}
      <div className="demos__header">
        <div className="demos__header-card surface">
          <div className="demos__header-inner">
            <div className="demos__header-text">
              <p className="t-p4">Between dashboard releases,</p>
              <h2 className="demos__header-h2 t-h2">
                I worked with growth and marketing to create usable prototypes
              </h2>
            </div>
            <p className="t-p4 demos__header-sub">
              They were small functional stories showing what our SDK could do
            </p>
          </div>
        </div>
      </div>

      {/* ── Tab switcher + media ─────────────────────────────────────────── */}
      <div className="demos__tabs-section">

        {/* Tab bar */}
        <div className="demos__tab-bar">
          <div className="demos__tab-group">

            <input
              type="radio" name="prototypes" id="demo-figma" value="figma"
              checked={currentDemo === 'figma'}
              onChange={() => { hasSwitched.current = true; setCurrentDemo('figma') }}
              className="demos__tab-radio"
            />
            <label
              htmlFor="demo-figma"
              className={`demos__tab-label demos__tab-label--figma t-h5${currentDemo === 'figma' ? ' demos__tab-label--active' : ''}`}
            >
              <span className="demos__tab-label-line">Figma</span>{' '}
              <span className="demos__tab-label-line">Prototypes</span>
            </label>

            <input
              type="radio" name="prototypes" id="demo-web" value="web"
              checked={currentDemo === 'web'}
              onChange={() => { hasSwitched.current = true; setCurrentDemo('web') }}
              className="demos__tab-radio"
            />
            <label
              htmlFor="demo-web"
              className={`demos__tab-label demos__tab-label--web t-h5${currentDemo === 'web' ? ' demos__tab-label--active' : ''}`}
            >
              <span className="demos__tab-label-line">Web-Based</span>{' '}
              <span className="demos__tab-label-line">Apps</span>
            </label>

            <input
              type="radio" name="prototypes" id="demo-game" value="game"
              checked={currentDemo === 'game'}
              onChange={() => { hasSwitched.current = true; setCurrentDemo('game') }}
              className="demos__tab-radio"
            />
            <label
              htmlFor="demo-game"
              className={`demos__tab-label demos__tab-label--game t-h5${currentDemo === 'game' ? ' demos__tab-label--active' : ''}`}
            >
              <span className="demos__tab-label-line">On-Chain</span>{' '}
              <span className="demos__tab-label-line">Game</span>
            </label>

            <span className="demos__tab-disabled t-h5">
              Evolution of the Demos
            </span>

          </div>
        </div>

        {/* Media area */}
        <div ref={containerRef} className="demos__media-container">

          <div className="demos__title-header">
            <div className="demos__tabs-divider" aria-hidden="true" />
            <AnimatePresence mode="wait">
              <motion.p
                key={currentDemo + '-title'}
                className="demos__title t-h5"
                initial={hasSwitched.current ? TAB_TITLE_ENTER : false}
                animate={TAB_TITLE_VISIBLE}
                exit={TAB_TITLE_EXIT}
                transition={TAB_TITLE_TRANSITION}
              >
                {currentDemoData?.title}
              </motion.p>
            </AnimatePresence>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={currentDemo}
              className={currentDemo === 'figma' ? 'demos__media-row--figma' : 'demos__media-row--single'}
              variants={TAB_BODY_VARIANTS}
              initial="enter"
              animate="active"
              exit="exit"
              transition={TAB_BODY_TRANSITION}
            >
              {currentMedia.map((item, i) => (
                item.embedUrl && isMobile === false ? (
                  <div key={`${currentDemo}-${i}`} className="demos__embed-item">
                    <div className="demos__embed-frame">
                      <iframe
                        src={item.embedUrl}
                        className="demos__embed-iframe"
                        allowFullScreen
                        loading="lazy"
                        title={`${currentDemo} prototype`}
                      />
                    </div>
                    <div className="demos__caption-row">
                      <p className="demos__caption t-caption">{item.caption}</p>
                    </div>
                  </div>
                ) : mediaType === 'video' ? (
                  <button
                    key={`${currentDemo}-${i}`}
                    type="button"
                    onClick={() => togglePlay(i)}
                    aria-label={playing[i] ? 'Pause video' : 'Play video'}
                    className={`demos__video-item${playing[i] ? ' is-playing' : ''}`}
                  >
                    <div className="demos__video-frame">
                      <div className="demos__video-player">
                        <video
                          ref={el => { videoRefs.current[i] = el }}
                          src={item.src}
                          poster={item.thumbnail}
                          className="demos__video-el"
                          tabIndex={-1}
                          muted
                          playsInline
                          loop={false}
                          onPlay={() => setPlaying(p => ({ ...p, [i]: true }))}
                          onPause={() => setPlaying(p => ({ ...p, [i]: false }))}
                          onEnded={() => {
                            setPlaying(p => ({ ...p, [i]: false }))
                          }}
                        />
                      </div>
                    </div>
                    <p className="demos__caption t-caption">{item.caption}</p>
                    <span className="demos__play-icon" aria-hidden="true">
                      {playing[i] ? 'pause_circle' : 'play_circle'}
                    </span>
                  </button>
                ) : (
                  <div key={`${currentDemo}-${i}`} className="demos__image-item">
                    <div className="demos__image-frame">
                      <Img
                        src={item.src}
                        alt={`${currentDemo} demo ${i + 1}`}
                        className="demos__image-el"
                        draggable={false}
                        intrinsic
                        placeholder="hash"
                        sizes="(max-width: 767px) 100vw, 80vh"
                      />
                    </div>
                    <div className="demos__caption-row">
                      <p className="demos__caption t-caption">{item.caption}</p>
                      {item.linkUrl && item.linkLabel && (
                        <a
                          href={item.linkUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="demos__link t-h5"
                        >
                          {item.linkLabel}
                        </a>
                      )}
                    </div>
                  </div>
                )
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* ── Quote card ──────────────────────────────────────────────────── */}
      <div className="demos__quote-row">
        <div className="demos__quote-card">
          <div className="demos__quote-text t-p2">
            <p>
              These demos went through a natural process of abstraction
              themselves, from the most tangible to the most invisible. <br />
              <br /> Each demo made the invisible infrastructure into something
              people could see, use, and judge for themselves.
            </p>
          </div>
        </div>
      </div>

      {/* ── Web3 Abstractor ──────────────────────────────────────────────── */}
      <div className="demos__web3-row">
        <div className="demos__web3-wrap">
          <Sticker tilt={-2} className="demos__web3-sticker">
            <Img
              src="/images/biconomy/demos/web3_abstractor.webp"
              alt="Web3 Abstractor"
              width={112}
              height={62}
              draggable={false}
              intrinsic
            />
          </Sticker>
          <div className="demos__web3-tooltip t-p4">
            <p>How we aspired<br />to be known as</p>
          </div>
        </div>
      </div>

    </section>
  )
}
