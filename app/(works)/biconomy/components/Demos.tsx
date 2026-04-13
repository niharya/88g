'use client'

// Demos — port of original Demos.js
// Source-locked: preserves DOM structure, motion values, video logic.
// Jotai: none in original. next/image → <img>.
// Assets: /images/biconomy/demos/ (was /images/demos/figma/ + /images/demos/)

import { AnimatePresence, motion, useInView } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'

// ── Icons ─────────────────────────────────────────────────────────────────────

function PlayIcon({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <mask id="mask0_play" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40">
        <rect width="40" height="40" fill="white" />
      </mask>
      <g mask="url(#mask0_play)">
        <path d="M12.6738 29.4107V10.4224C12.6738 9.86462 12.8576 9.41656 13.2251 9.07823C13.5926 8.73962 14.0187 8.57031 14.5034 8.57031C14.6626 8.57031 14.8276 8.59045 14.9984 8.63073C15.169 8.67101 15.3373 8.73892 15.5034 8.83448L30.4476 18.3807C30.7234 18.5657 30.9341 18.7907 31.0797 19.0557C31.2255 19.3207 31.2984 19.6077 31.2984 19.9166C31.2984 20.2255 31.2255 20.5124 31.0797 20.7774C30.9341 21.0424 30.7234 21.2674 30.4476 21.4524L15.5034 30.9986C15.3373 31.0942 15.1688 31.1595 14.998 31.1945C14.8269 31.2295 14.6617 31.247 14.5026 31.247C14.017 31.247 13.5909 31.0816 13.2242 30.7507C12.8573 30.4199 12.6738 29.9732 12.6738 29.4107Z" fill="currentColor" />
      </g>
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg width="24" height="24" viewBox="0 -960 960 960" fill="none" className={className} aria-hidden="true">
      <path d="M640-200q-33 0-56.5-23.5T560-280v-400q0-33 23.5-56.5T640-760q33 0 56.5 23.5T720-680v400q0 33-23.5 56.5T640-200Zm-320 0q-33 0-56.5-23.5T240-280v-400q0-33 23.5-56.5T320-760q33 0 56.5 23.5T400-680v400q0 33-23.5 56.5T320-200Z" fill="currentColor" />
    </svg>
  )
}

function RestartIcon({ className }: { className?: string }) {
  return (
    <svg width="40" height="40" viewBox="0 0 40 40" fill="none" className={className} aria-hidden="true">
      <mask id="mask0_restart" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="40" height="40">
        <rect width="40" height="40" fill="white" />
      </mask>
      <g mask="url(#mask0_restart)">
        <path d="M14.5393 34.9036C12.838 34.1727 11.3538 33.1718 10.0867 31.901C8.81979 30.6304 7.82196 29.1444 7.09317 27.4428C6.36439 25.7412 6 23.9157 6 21.9661C6 21.5018 6.15746 21.1118 6.47238 20.7959C6.7873 20.4801 7.17624 20.3221 7.6392 20.3221C8.10216 20.3221 8.4911 20.4801 8.80603 20.7959C9.12095 21.1118 9.27841 21.5018 9.27841 21.9661C9.27841 24.9569 10.3221 27.4933 12.4095 29.5751C14.4972 31.6569 17.0273 32.6978 20 32.6978C22.9727 32.6978 25.5028 31.6534 27.5905 29.5646C29.6779 27.4756 30.7216 24.9404 30.7216 21.9591C30.7216 18.9683 29.6974 16.4319 27.6489 14.3501C25.6004 12.2683 23.0851 11.2274 20.103 11.2274H19.4759L20.9559 12.7113C21.2319 12.9881 21.3689 13.3099 21.3669 13.6768C21.3652 14.0433 21.2282 14.365 20.9559 14.6418C20.6799 14.9186 20.3535 15.0557 19.9766 15.0529C19.5997 15.0499 19.2732 14.91 18.9972 14.6333L15.0675 10.6921C14.7308 10.3638 14.5624 9.97519 14.5624 9.5263C14.5624 9.07765 14.7308 8.68919 15.0675 8.36091L19.0221 4.38055C19.2815 4.12962 19.6037 4.00279 19.9888 4.00005C20.3739 3.99707 20.6963 4.128 20.9559 4.39286C21.2116 4.65325 21.3368 4.9768 21.3316 5.36352C21.3264 5.75024 21.1941 6.06907 20.9347 6.32L19.3342 7.9252H19.9788C21.9273 7.9252 23.7523 8.29066 25.4536 9.02157C27.1549 9.75249 28.6403 10.7532 29.9096 12.0238C31.179 13.2946 32.178 14.7796 32.9068 16.4787C33.6356 18.178 34 20.0024 34 21.952C34 23.9015 33.6356 25.7294 32.9068 27.4357C32.178 29.142 31.1802 30.6304 29.9133 31.901C28.6462 33.1718 27.162 34.1727 25.4607 34.9036C23.7593 35.6345 21.9391 36 20 36C18.0609 36 16.2407 35.6345 14.5393 34.9036Z" fill="currentColor" />
      </g>
    </svg>
  )
}

// ── Data ──────────────────────────────────────────────────────────────────────

type DemoType = 'video' | 'image'

interface MediaItem {
  src: string
  thumbnail?: string
  caption: string
  linkLabel?: string
  linkUrl?: string
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
        thumbnail: '/images/biconomy/demos/before.png',
        caption: 'A standard game flow with four separate signing steps before the user could proceed.',
      },
      {
        src: '/images/biconomy/demos/after.mp4',
        thumbnail: '/images/biconomy/demos/after.png',
        caption: 'The same flow collapsed into a single signing step.',
      },
    ],
  },
  web: {
    title: 'A live environment with real wallets and real transactions, with clear technical info at hand',
    type: 'image',
    media: [
      {
        src: '/images/biconomy/demos/web.png',
        caption: 'The entry point to the demo: choosing a signer (wallet, social login, passkey) made real and usable rather than abstractions.',
      },
    ],
  },
  game: {
    title: 'A fully on-chain game that uses our entire offering and one that feels fast and playful without exposing blockchain mechanics',
    type: 'image',
    media: [
      {
        src: '/images/biconomy/demos/game.png',
        caption: 'Shows the arena view of the game where the cards are drawn and the player has to make the next move.',
      },
    ],
  },
}

// ── PlayButton (matches original's PlayButton component) ──────────────────────

interface PlayButtonProps {
  index: number
  isPlaying: boolean
  videoRefs: React.MutableRefObject<Record<number, HTMLVideoElement | null>>
  pauseOtherVideos: (exceptIndex: number) => void
  className?: string
}

function PlayButton({ index, isPlaying, videoRefs, pauseOtherVideos, className }: PlayButtonProps) {
  return (
    <button
      type="button"
      className={`demos__play-btn${className ? ' ' + className : ''}`}
      onClick={() => {
        const v = videoRefs.current[index]
        if (!v) return
        if (v.paused) {
          pauseOtherVideos(index)
          v.play()
        } else {
          v.pause()
        }
      }}
      aria-label={isPlaying ? 'Pause' : 'Play'}
    >
      {isPlaying
        ? <PauseIcon className="demos__icon-sm" />
        : <PlayIcon className="demos__icon-sm" />
      }
    </button>
  )
}

// ── Demos ─────────────────────────────────────────────────────────────────────

export default function Demos() {
  const [currentDemo, setCurrentDemo] = useState('figma')
  const [playing, setPlaying] = useState<Record<number, boolean>>({})
  const [hasStarted, setHasStarted] = useState<Record<number, boolean>>({})
  const videoRefs = useRef<Record<number, HTMLVideoElement | null>>({})
  const containerRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(containerRef, { amount: 0.1 })
  const currentDemoData = DEMOS[currentDemo]
  const currentMedia = currentDemoData?.media ?? []
  const mediaType = currentDemoData?.type ?? 'image'

  const pauseOtherVideos = (exceptIndex: number) => {
    for (let j = 0; j < currentMedia.length; j++) {
      if (j !== exceptIndex && videoRefs.current[j]) {
        videoRefs.current[j]!.pause()
      }
    }
  }

  // Pause all videos when switching tabs
  useEffect(() => {
    Object.values(videoRefs.current).forEach(v => { if (v) v.pause() })
    setPlaying({})
    setHasStarted({})
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
              onChange={() => setCurrentDemo('figma')}
              className="demos__tab-radio"
            />
            <label
              htmlFor="demo-figma"
              className={`demos__tab-label demos__tab-label--figma t-h5${currentDemo === 'figma' ? ' demos__tab-label--active' : ''}`}
            >
              Figma Prototypes
            </label>

            <input
              type="radio" name="prototypes" id="demo-web" value="web"
              checked={currentDemo === 'web'}
              onChange={() => setCurrentDemo('web')}
              className="demos__tab-radio"
            />
            <label
              htmlFor="demo-web"
              className={`demos__tab-label demos__tab-label--web t-h5${currentDemo === 'web' ? ' demos__tab-label--active' : ''}`}
            >
              Web-based Apps
            </label>

            <input
              type="radio" name="prototypes" id="demo-game" value="game"
              checked={currentDemo === 'game'}
              onChange={() => setCurrentDemo('game')}
              className="demos__tab-radio"
            />
            <label
              htmlFor="demo-game"
              className={`demos__tab-label demos__tab-label--game t-h5${currentDemo === 'game' ? ' demos__tab-label--active' : ''}`}
            >
              On-chain Game
            </label>

            <span className="demos__tab-disabled t-h5">
              Evolution of the demos
            </span>

          </div>
        </div>

        {/* Media area */}
        <div ref={containerRef} className="demos__media-container">

          <p className="demos__title t-h5">{currentDemoData?.title}</p>

          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={currentDemo}
              className={currentDemo === 'figma' ? 'demos__media-row--figma' : 'demos__media-row--single'}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              {currentMedia.map((item, i) => (
                <div
                  key={`${currentDemo}-${i}`}
                  className={currentDemo === 'figma' ? 'demos__video-item' : 'demos__image-item'}
                >
                  {/* Media frame */}
                  <div className={currentDemo === 'figma' ? 'demos__video-frame' : 'demos__image-frame'}>
                    {mediaType === 'video' ? (
                      <div
                        className={`demos__video-player${playing[i] ? ' is-playing' : ''}`}
                      >
                        <video
                          ref={el => { videoRefs.current[i] = el }}
                          src={item.src}
                          poster={item.thumbnail}
                          className="demos__video-el"
                          tabIndex={-1}
                          muted
                          playsInline
                          loop={false}
                          onPlay={() => {
                            setPlaying(p => ({ ...p, [i]: true }))
                            setHasStarted(s => ({ ...s, [i]: true }))
                          }}
                          onPause={() => setPlaying(p => ({ ...p, [i]: false }))}
                          onEnded={() => {
                            setPlaying(p => ({ ...p, [i]: false }))
                            const next = videoRefs.current[i + 1]
                            if (next) {
                              pauseOtherVideos(i + 1)
                              next.play()
                            }
                          }}
                        />
                        <div className="demos__video-controls-overlay">
                          <button
                            type="button"
                            className="demos__video-main-btn"
                            onClick={e => {
                              e.stopPropagation()
                              const v = videoRefs.current[i]
                              if (!v) return
                              pauseOtherVideos(i)
                              v.currentTime = 0
                              v.play()
                            }}
                            aria-label={hasStarted[i] ? 'Restart' : 'Play'}
                          >
                            {hasStarted[i]
                              ? <RestartIcon className="demos__icon-lg" />
                              : <PlayIcon className="demos__icon-lg" />
                            }
                          </button>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.src}
                        alt={`${currentDemo} demo ${i + 1}`}
                        className="demos__image-el"
                        draggable={false}
                      />
                    )}
                  </div>

                  {/* Caption row */}
                  <div className="demos__caption-row">
                    <div className={`demos__caption-inner${mediaType === 'video' ? ' demos__caption-inner--video' : ''}`}>

                      {/* Left play button (video item 1 = index 1) */}
                      {mediaType === 'video' && i === 1 ? (
                        <div className="demos__play-aside demos__play-aside--left">
                          <PlayButton
                            index={i} isPlaying={!!playing[i]}
                            videoRefs={videoRefs} pauseOtherVideos={pauseOtherVideos}
                            className="demos__play-btn--left"
                          />
                          <div className="demos__play-divider" aria-hidden="true" />
                        </div>
                      ) : null}

                      <p className="demos__caption t-p4">{item.caption}</p>

                      {/* Right play button (video item 0 = index 0) */}
                      {mediaType === 'video' && i === 0 ? (
                        <div className="demos__play-aside demos__play-aside--right">
                          <div className="demos__play-divider" aria-hidden="true" />
                          <PlayButton
                            index={i} isPlaying={!!playing[i]}
                            videoRefs={videoRefs} pauseOtherVideos={pauseOtherVideos}
                            className="demos__play-btn--right"
                          />
                        </div>
                      ) : null}

                    </div>

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
          <img
            src="/images/biconomy/demos/web3_abstractor.png"
            alt="Web3 Abstractor"
            width={112}
            height={62}
            className="demos__web3-img"
            draggable={false}
          />
          <div className="demos__web3-tooltip t-p4">
            <p>How we aspired<br />to be known as</p>
          </div>
        </div>
      </div>

    </section>
  )
}
