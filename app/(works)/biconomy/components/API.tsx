'use client'

// API — port of original API.js
// Source-locked: stacked card carousel with translate3d depth, AnimatePresence caption blur,
// MediumXMassageIcon spin, TwitterEmbed.
// The stack IS the conceptual instrument — APIs as navigable spaces, not lists.
// Do not flatten to a static layout or explanatory writeup.

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import TwitterEmbed from './TwitterEmbed'
import NavPill from './NavPill'
import IconExternalLink from '../../../components/icons/IconExternalLink'
import { Img } from '../../../components/Img'
import Sticker from '../../../components/Sticker'
import { TAB_BODY_VARIANTS, TAB_BODY_TRANSITION, TAB_EASE } from '../../../lib/motion'

type Slide = { src: string; caption: string }
type Flow = { id: string; name: string; slides: Slide[]; raw?: boolean }

const FLOWS: Flow[] = [
  {
    id: 'connecting-wallet',
    name: 'Connecting Wallet',
    slides: [
      {
        src: '/images/biconomy/api/flows/flow-1-1.webp',
        caption: 'A standby mark, a stepper, and a receiver — each a grammar piece before connection.',
      },
      {
        src: '/images/biconomy/api/flows/flow-1-2.webp',
        caption: 'Unplugged at rest. A B-mark waits in the top-right for a hover or a click.',
      },
      {
        src: '/images/biconomy/api/flows/flow-1-3.webp',
        caption: 'Once paired, the unit settles — QR, desktop, and session hand-offs stay in the same surface.',
      },
    ],
  },
  {
    id: 'sending-assets',
    name: 'Sending Assets',
    slides: [
      {
        src: '/images/biconomy/api/flows/flow-2-1.webp',
        caption: 'From a deployed smart wallet to a signed transaction — three steps on one continuous surface.',
      },
      {
        src: '/images/biconomy/api/flows/flow-2-2.webp',
        caption: 'Send To accepts the address; Select Asset unfolds below without changing context.',
      },
      {
        src: '/images/biconomy/api/flows/flow-2-3.webp',
        caption: 'Amount, gas, and total share the canvas. An operating-currency toggle sits a tap away.',
      },
    ],
  },
  {
    id: 'nav-signing',
    name: 'Navigation & Signing',
    raw: true,
    slides: [
      {
        src: '/images/biconomy/api/flows/flow-3-1.webp',
        caption: 'Navigation collapses into the address itself — menu opens down, the asset library tucks below.',
      },
      {
        src: '/images/biconomy/api/flows/flow-4-1.webp',
        caption: 'Signing stays legible — network, request type, forwarder details, keys, then sign or reject.',
      },
    ],
  },
]

// Tight deck — slots 0/1/2 at 0/-16/-32. Smaller stagger than the original
// 0/-64/-128 so the depth reveal reads as a paper deck, not a splay.
const SLOT_OFFSETS = [
  { x: 0,   y: 0   },
  { x: -16, y: -16 },
  { x: -32, y: -32 },
] as const

const PAPER_EASE = [0.5, 0, 0.2, 1] as const

// Direction signal lives in the trajectory, not in keyframes. On next, the
// wrapping card travels up-left from front → back while the other two move
// down-right; on prev the directions invert. A keyframe detour was tried
// first and produced a teleport-then-settle jerk because framer reads the
// first keyframe as the starting value. Smooth single-segment animation
// connects new and old positions visually.

type SliderProps = {
  className?: string
  flow: Flow
  currentIndex: number
  direction: 1 | -1 | 0
  onPrev: () => void
  onNext: () => void
}

function APISlider({ className, flow, currentIndex, direction, onPrev, onNext }: SliderProps) {
  const total = flow.slides.length
  const currentSlide = flow.slides[currentIndex]
  const captionKey = `${flow.id}-${currentIndex}`
  // Leading card = the one whose slot just changed by the largest step
  // (front→back for next, back→front for prev). Used only for stagger
  // ordering — leading goes first so the eye latches onto the gesture's
  // actor; the rest follow with a tight delay so motion feels connected.
  const leadingSlot = direction === 1 ? Math.min(2, total - 1) : 0

  return (
    <div className={`api__slider ${className ?? ''}${flow.raw ? ' api__slider--raw' : ''}`}>
      <div className="api__slider-inner">
        {/* Stack container — slider-inner padding (32px) leaves the
            depth-reveal gutter for the tight deck. Flow switch runs
            through AnimatePresence with the tab-switch tokens (mode="wait",
            TAB_BODY_VARIANTS). Slide advance within a flow runs through
            framer-motion per card: see SLOT_OFFSETS + leading-card detour. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={flow.id}
            className={`api__stack-wrap${flow.raw ? ' api__stack-wrap--raw' : ''}`}
            onClick={onNext}
            role="button"
            tabIndex={0}
            aria-label="Next slide"
            onKeyDown={e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onNext()
              }
            }}
            variants={TAB_BODY_VARIANTS}
            initial="enter"
            animate="active"
            exit="exit"
            transition={TAB_BODY_TRANSITION}
          >
            <div className="api__stack">
              {flow.slides.map((slide, slideIndex) => {
                const distance = (slideIndex - currentIndex + total) % total
                const slot = Math.min(distance, 2)
                const { x, y } = SLOT_OFFSETS[slot]
                const zIndex = 3 - slot

                const isLeading = direction !== 0 && slot === leadingSlot

                return (
                  <motion.div
                    key={`${flow.id}-${slideIndex}`}
                    className="api__card"
                    style={{ zIndex }}
                    animate={{ x, y }}
                    transition={{
                      duration: 0.4,
                      ease: PAPER_EASE,
                      delay: isLeading ? 0 : 0.04,
                    }}
                  >
                    <div className="api__card-frame">
                      <Img
                        src={slide.src}
                        alt=""
                        className="api__card-img"
                        draggable={false}
                        fill
                        placeholder="hash"
                        sizes="(max-width: 767px) 90vw, 600px"
                      />
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Caption + nav row */}
        <div className="api__caption-row">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={captionKey}
              initial={{ opacity: 0, filter: 'blur(4px)' }}
              animate={{ opacity: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, filter: 'blur(4px)', transition: { duration: 0.3, ease: 'easeOut' } }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
              className="api__caption t-caption"
            >
              {currentSlide.caption}
            </motion.p>
          </AnimatePresence>
          <NavPill onPrev={onPrev} onNext={onNext} prevLabel="Previous slide" nextLabel="Next slide" />
        </div>
      </div>
    </div>
  )
}

function MediumXMassageIcon() {
  return (
    <svg
      width="56"
      height="56"
      viewBox="0 0 56 56"
      fill="none"
      className="api__spin-icon"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <g clipPath="url(#clip0_api_mmx)">
        <path d="M41.025 9.5402C40.9151 9.43676 40.8578 9.30785 40.8531 9.15346C40.8499 9.00044 40.9007 8.86825 41.0055 8.7569L43.0938 6.53782C43.2463 6.37586 43.4312 6.28947 43.6486 6.27865C43.8675 6.2692 44.0572 6.34001 44.2177 6.49108C44.3247 6.59179 44.3952 6.71538 44.4291 6.86186C44.4631 7.00833 44.4636 7.14248 44.4308 7.26429L43.7526 10.1929L43.7635 10.2031L46.6198 9.3325C46.7407 9.2909 46.8753 9.2826 47.0236 9.3076C47.1747 9.33252 47.3044 9.39601 47.4129 9.49808C47.572 9.64779 47.6527 9.83288 47.6552 10.0534C47.6591 10.2724 47.5848 10.4629 47.4323 10.6249L45.344 12.8439C45.2405 12.9538 45.1123 13.0118 44.9594 13.0179C44.8078 13.0225 44.6778 12.9737 44.5693 12.8717C44.4609 12.7696 44.4036 12.6421 44.3976 12.4891C44.3943 12.3361 44.4444 12.2046 44.5479 12.0947L45.4869 11.0969L46.0044 10.5818L45.9871 10.5655L43.4396 11.3339C43.3366 11.368 43.2266 11.3748 43.1093 11.3545C42.9921 11.3342 42.8894 11.2825 42.8012 11.1995C42.713 11.1165 42.6552 11.0171 42.6278 10.9013C42.6004 10.7855 42.6006 10.6767 42.6284 10.5747L43.2269 8.00464L43.2095 7.98831L42.7451 8.51657L41.8081 9.51222C41.7033 9.62357 41.5737 9.68159 41.4193 9.68627C41.2664 9.69232 41.1349 9.64363 41.025 9.5402Z" fill="#3D3D3D"/>
        <path d="M47.0411 15.7908C46.9652 15.64 46.9537 15.4824 47.0066 15.3179C47.0622 15.1544 47.1662 15.0343 47.3188 14.9575L50.0198 13.599C50.1706 13.5231 50.3273 13.5121 50.49 13.5659C50.6553 13.6205 50.7759 13.7233 50.8517 13.8741L51.9292 16.0162C51.9925 16.1422 52.0017 16.2732 51.9567 16.4091C51.9135 16.5442 51.8299 16.643 51.7057 16.7055C51.5815 16.7679 51.4514 16.7767 51.3154 16.7317C51.1794 16.6867 51.0798 16.6013 51.0164 16.4753L50.1585 14.7696L48.1733 15.7681L49.062 17.535C49.1263 17.6628 49.1355 17.7937 49.0896 17.9279C49.0447 18.0639 48.9601 18.1631 48.8359 18.2256C48.7117 18.2881 48.5816 18.2968 48.4456 18.2518C48.3123 18.2078 48.2135 18.1218 48.1493 17.9941L47.0411 15.7908ZM48.5446 15.0345L49.3429 14.633L50.3668 16.6687C50.4221 16.7787 50.4308 16.8932 50.3929 17.0123C50.355 17.1314 50.2811 17.2186 50.1711 17.2739C50.0629 17.3284 49.9488 17.3358 49.8288 17.2961C49.7106 17.2555 49.6238 17.1802 49.5685 17.0702L48.5446 15.0345Z" fill="#3D3D3D"/>
        <path d="M50.0469 22.5286C50.0247 22.3592 50.0657 22.2057 50.1698 22.0678C50.2761 21.9317 50.414 21.8526 50.5833 21.8304L53.5811 21.4376C53.7484 21.4156 53.9 21.4569 54.0359 21.5612C54.1739 21.6673 54.2541 21.805 54.2763 21.9743L54.4415 23.2355C54.5527 24.0841 54.4529 24.7741 54.142 25.3056C53.8331 25.8367 53.3488 26.1455 52.6892 26.232C52.0237 26.3192 51.4723 26.1461 51.0349 25.7127C50.5976 25.2793 50.3234 24.6383 50.2122 23.7897L50.0469 22.5286ZM51.0814 22.9037L51.1747 23.6155C51.2391 24.1378 51.387 24.525 51.6183 24.7771C51.8499 25.0311 52.1567 25.1331 52.5386 25.0831C52.9127 25.034 53.1742 24.8586 53.3229 24.5567C53.4718 24.2568 53.5117 23.843 53.4426 23.3153L53.3497 22.6065L51.0814 22.9037Z" fill="#3D3D3D"/>
        <path d="M50.5434 30.3236C50.5703 30.169 50.6471 30.0463 50.7738 29.9555C50.9021 29.867 51.0455 29.8365 51.2039 29.8641L54.4055 30.4218C54.5581 30.4484 54.6796 30.526 54.7701 30.6547C54.8622 30.7856 54.8951 30.9264 54.8689 31.077C54.8423 31.2296 54.7637 31.351 54.6331 31.4411C54.5045 31.5316 54.3638 31.5635 54.2113 31.537L51.0097 30.9793C50.8512 30.9517 50.7266 30.8745 50.6358 30.7478C50.5469 30.6215 50.5161 30.4801 50.5434 30.3236Z" fill="#3D3D3D"/>
        <path d="M48.6134 37.4525C48.929 36.8466 49.327 36.4628 49.8075 36.3011C50.2871 36.1412 50.7946 36.2006 51.3301 36.4795L53.0314 37.3656C53.1688 37.4371 53.2611 37.5479 53.3084 37.6979C53.3574 37.8488 53.3462 37.993 53.2746 38.1303C53.204 38.266 53.0928 38.3569 52.941 38.4033C52.791 38.4505 52.6473 38.4384 52.51 38.3668L50.8112 37.4821C50.5347 37.3381 50.2835 37.3024 50.0576 37.3751C49.8308 37.4495 49.6417 37.632 49.4903 37.9226C49.3399 38.2115 49.2992 38.4701 49.3682 38.6987C49.4373 38.9272 49.6101 39.1135 49.8866 39.2575L51.5906 40.1449C51.728 40.2165 51.8199 40.3259 51.8663 40.4732C51.9136 40.6232 51.9023 40.7652 51.8326 40.899C51.762 41.0346 51.6521 41.1252 51.5031 41.1707C51.3557 41.2171 51.2134 41.2046 51.076 41.133L49.3694 40.2442C48.8269 39.9616 48.4869 39.5763 48.3493 39.0882C48.2117 38.6001 48.2997 38.0548 48.6134 37.4525Z" fill="#3D3D3D"/>
        <path d="M45.3655 43.0648C45.4782 42.9644 45.6116 42.9186 45.7658 42.9275C45.9185 42.9376 46.0458 42.9998 46.1475 43.1139L48.1752 45.3886C48.3232 45.5546 48.393 45.7464 48.3848 45.9639C48.375 46.1828 48.2879 46.3655 48.1233 46.5122C48.0136 46.61 47.8843 46.6694 47.7355 46.6904C47.5866 46.7114 47.4529 46.7002 47.3344 46.6568L44.4765 45.7248L44.4654 45.7347L45.0825 48.6562C45.1133 48.7804 45.1098 48.9152 45.0719 49.0607C45.0339 49.209 44.9593 49.3327 44.8481 49.4318C44.685 49.5772 44.4936 49.6414 44.2737 49.6246C44.0552 49.6092 43.8719 49.5186 43.7239 49.3525L41.6962 47.0779C41.5958 46.9652 41.5493 46.8324 41.5567 46.6795C41.5654 46.5281 41.6253 46.4029 41.7365 46.3038C41.8476 46.2047 41.9797 46.1588 42.1326 46.1662C42.2853 46.1764 42.4119 46.2378 42.5123 46.3504L43.424 47.3733L43.8919 47.9339L43.9096 47.918L43.3672 45.313C43.3423 45.2075 43.3451 45.0972 43.3756 44.9823C43.4062 44.8673 43.4666 44.7695 43.557 44.6889C43.6475 44.6083 43.7515 44.5594 43.8693 44.5422C43.987 44.5251 44.0954 44.5348 44.1946 44.5715L46.7023 45.3926L46.7201 45.3768L46.2346 44.8679L45.3248 43.8473C45.223 43.7332 45.1766 43.599 45.1855 43.4448C45.1928 43.2919 45.2528 43.1652 45.3655 43.0648Z" fill="#3D3D3D"/>
        <path d="M29.6346 50.9291C29.7175 50.9204 29.7996 50.9318 29.8807 50.9632C29.9601 50.9968 30.0271 51.0357 30.0816 51.0799L31.8998 52.4528L32.1365 52.6256L33.8469 53.9708C34.0442 54.1199 34.111 54.3095 34.0473 54.5398C33.9816 54.7703 33.8303 54.898 33.5933 54.9229C33.5202 54.9305 33.4454 54.9214 33.3688 54.8955C33.2902 54.8698 33.2116 54.8251 33.1331 54.7614L31.3744 53.4123L31.2409 53.3394L29.3851 51.8927C29.1924 51.7492 29.1245 51.5586 29.1815 51.321C29.2386 51.0854 29.3897 50.9548 29.6346 50.9291ZM33.3113 50.5467C33.5246 50.5244 33.6846 50.6124 33.7913 50.8109C33.8959 51.0096 33.8724 51.1947 33.7207 51.3664L32.1637 53.2278L32.0536 53.3202L30.5715 55.0389C30.5076 55.1155 30.4456 55.1719 30.3855 55.2082C30.3257 55.2464 30.2572 55.2695 30.1802 55.2776C29.9669 55.3 29.8058 55.211 29.697 55.0108C29.5883 54.8125 29.6144 54.6231 29.7752 54.4425L31.1957 52.7362L31.3336 52.6229L32.9111 50.7863C32.9661 50.7207 33.0264 50.6664 33.0918 50.6236C33.1552 50.5811 33.2284 50.5554 33.3113 50.5467Z" fill="#3D3D3D"/>
        <path d="M19.4212 49.6244C19.5522 49.6993 19.638 49.8113 19.6786 49.9603C19.7174 50.1084 19.6989 50.2488 19.623 50.3815L18.1102 53.0267C17.9998 53.2198 17.8401 53.3469 17.6312 53.4082C17.4206 53.4684 17.2196 53.4439 17.0283 53.3344C16.9007 53.2615 16.8033 53.1577 16.7361 53.0232C16.669 52.8887 16.6371 52.7584 16.6406 52.6323L16.6166 49.6263L16.6036 49.6189L14.0294 51.1321C13.9215 51.2008 13.7925 51.2403 13.6425 51.2505C13.4898 51.2616 13.3488 51.2301 13.2195 51.1562C13.0299 51.0477 12.9082 50.8866 12.8543 50.6728C12.7994 50.4607 12.8272 50.2581 12.9376 50.065L14.4504 47.4199C14.5254 47.2889 14.6365 47.2026 14.7838 47.161C14.9301 47.1211 15.0679 47.1382 15.1972 47.2121C15.3265 47.2861 15.4119 47.3967 15.4535 47.544C15.4924 47.692 15.4743 47.8316 15.3994 47.9626L14.7192 49.152L14.3362 49.7737L14.3569 49.7855L16.6547 48.4437C16.7468 48.3866 16.8522 48.3542 16.971 48.3466C17.0897 48.3391 17.2016 48.3653 17.3068 48.4255C17.4119 48.4856 17.4913 48.5688 17.545 48.6749C17.5986 48.7811 17.6239 48.887 17.6206 48.9927L17.6385 51.6314L17.6592 51.6433L17.9875 51.0212L18.6663 49.8343C18.7422 49.7016 18.8546 49.615 19.0037 49.5744C19.151 49.5328 19.2901 49.5495 19.4212 49.6244Z" fill="#3D3D3D"/>
        <path d="M12.3833 45.193C12.5179 45.3548 12.5552 45.5317 12.4953 45.7236C12.4342 45.914 12.2925 46.0293 12.0702 46.0696L8.51703 46.7822C8.37056 46.8111 8.24038 46.8083 8.1265 46.7739C8.01109 46.7408 7.90957 46.6715 7.82194 46.5662C7.73049 46.4563 7.67833 46.3408 7.66546 46.2198C7.65106 46.1 7.67202 45.9715 7.72832 45.8343L9.07802 42.4871C9.16159 42.2678 9.30255 42.1453 9.50089 42.1198C9.69644 42.094 9.86152 42.1621 9.99615 42.3239C10.0673 42.4094 10.1094 42.5112 10.1225 42.6295C10.1357 42.7477 10.1215 42.8564 10.0799 42.9555L9.15828 45.1638L8.91915 45.6495L8.93248 45.6655L9.45319 45.5229L11.7797 45.0171C11.8778 44.9923 11.9855 44.9944 12.1027 45.0235C12.2186 45.051 12.3121 45.1075 12.3833 45.193ZM11.6663 45.5609L10.8709 45.8158L9.14492 43.7412L9.52309 42.9848L11.6663 45.5609Z" fill="#3D3D3D"/>
        <path d="M7.16747 37.6507C7.27205 37.9297 7.33374 38.196 7.35255 38.4498C7.37136 38.7036 7.36205 38.9446 7.32462 39.1729C7.28532 39.4018 7.22279 39.5631 7.13702 39.6568C7.05056 39.7486 6.95654 39.8061 6.85497 39.8293C6.75084 39.8514 6.65032 39.835 6.5534 39.7802C6.45719 39.7272 6.39014 39.6558 6.35226 39.5661C6.31252 39.4771 6.30323 39.3872 6.32438 39.2966C6.34368 39.2066 6.3667 39.0899 6.39343 38.9462C6.41761 38.8014 6.42262 38.6394 6.40845 38.4602C6.39173 38.2799 6.34956 38.0995 6.28193 37.9191C6.19456 37.6804 6.09068 37.5052 5.97029 37.3934C5.84734 37.2804 5.71986 37.2487 5.58784 37.2982C5.45397 37.3484 5.38749 37.4709 5.3884 37.6656C5.38862 37.8585 5.41998 38.1628 5.48248 38.5784C5.56914 39.1206 5.55819 39.5467 5.44963 39.8568C5.34107 40.1668 5.12781 40.3815 4.80985 40.5007C4.43797 40.6401 4.08364 40.5916 3.74688 40.3552C3.40826 40.1195 3.13751 39.7311 2.93464 39.1901C2.83704 38.9297 2.7736 38.6842 2.74433 38.4534C2.71436 38.2207 2.7131 38.0165 2.74053 37.8408C2.76611 37.6658 2.81795 37.5382 2.89604 37.458C2.97159 37.3767 3.05689 37.3299 3.15195 37.3176C3.24631 37.3034 3.33545 37.3177 3.41935 37.3605C3.50581 37.4044 3.56949 37.4611 3.61039 37.5306C3.65129 37.6001 3.67011 37.6673 3.66685 37.7321C3.6636 37.797 3.66057 37.902 3.65777 38.0473C3.65242 38.1914 3.65868 38.3269 3.67657 38.4538C3.69446 38.5807 3.73478 38.7278 3.79752 38.8952C3.88397 39.1257 3.97739 39.2901 4.07779 39.3881C4.17749 39.4844 4.27848 39.5133 4.38075 39.475C4.48302 39.4366 4.54217 39.354 4.55822 39.2271C4.5717 39.099 4.53628 38.7868 4.45194 38.2903C4.34669 37.6702 4.36066 37.2069 4.49386 36.9003C4.62706 36.5938 4.84613 36.3833 5.15107 36.269C5.55642 36.117 5.94201 36.1697 6.30782 36.427C6.67108 36.6831 6.95763 37.0911 7.16747 37.6507Z" fill="#3D3D3D"/>
        <path d="M5.26157 30.4272C5.26975 30.7249 5.24147 30.9969 5.17672 31.243C5.11196 31.4891 5.02478 31.714 4.91515 31.9177C4.80354 32.1214 4.69196 32.2536 4.58039 32.3143C4.46877 32.3729 4.36116 32.3968 4.25755 32.3857C4.15191 32.3727 4.06218 32.3245 3.98837 32.2411C3.91462 32.1597 3.87442 32.0704 3.86778 31.9733C3.85915 31.8762 3.87958 31.7882 3.92906 31.7094C3.97656 31.6306 4.03631 31.5276 4.1083 31.4005C4.17826 31.2714 4.23568 31.1199 4.28056 30.9458C4.3234 30.7698 4.34217 30.5855 4.33688 30.393C4.33188 30.1389 4.29064 29.9393 4.21316 29.7945C4.13363 29.6477 4.0234 29.5762 3.88246 29.5801C3.73954 29.584 3.63684 29.6782 3.57436 29.8627C3.51184 30.0452 3.44255 30.3431 3.3665 30.7564C3.2721 31.2973 3.12316 31.6968 2.91968 31.9546C2.71619 32.2125 2.44472 32.3461 2.10528 32.3555C1.70826 32.3664 1.38897 32.2053 1.14739 31.8722C0.90382 31.5392 0.7741 31.0839 0.758224 30.5062C0.750587 30.2283 0.770457 29.9755 0.817834 29.7477C0.865157 29.518 0.930362 29.3245 1.01345 29.1672C1.09455 29.0101 1.18507 28.9063 1.285 28.8558C1.38289 28.8035 1.47878 28.7869 1.57268 28.8062C1.66652 28.8235 1.74616 28.866 1.81159 28.9337C1.87906 29.0034 1.92083 29.0777 1.93691 29.1568C1.95299 29.2358 1.94894 29.3054 1.92477 29.3657C1.90061 29.4259 1.86358 29.5243 1.81369 29.6608C1.76176 29.7953 1.72362 29.9255 1.69927 30.0513C1.67492 30.1771 1.66519 30.3293 1.6701 30.508C1.67687 30.7541 1.71177 30.9399 1.77482 31.0653C1.8378 31.1888 1.92389 31.249 2.03307 31.246C2.14224 31.243 2.22505 31.1841 2.2815 31.0693C2.3359 30.9526 2.40395 30.6458 2.48565 30.1489C2.58779 29.5282 2.75168 29.0946 2.97733 28.8481C3.20298 28.6015 3.47858 28.4737 3.80413 28.4648C4.23688 28.4529 4.58437 28.6281 4.84662 28.9904C5.10683 29.3507 5.24515 29.8297 5.26157 30.4272Z" fill="#3D3D3D"/>
        <path d="M5.26236 24.3622C5.1992 24.563 5.07072 24.6902 4.87693 24.7437C4.68374 24.7954 4.51006 24.7387 4.35589 24.5736L1.83306 21.972C1.72949 21.8645 1.66135 21.7535 1.62863 21.6392C1.59402 21.5242 1.59727 21.4013 1.63838 21.2706C1.68129 21.1342 1.75014 21.0279 1.84493 20.9515C1.93783 20.8746 2.05722 20.8226 2.2031 20.7956L5.74798 20.1184C5.97765 20.0699 6.15691 20.1221 6.28575 20.275C6.41329 20.4255 6.44548 20.6011 6.38231 20.8019C6.34894 20.908 6.28611 20.9985 6.1938 21.0736C6.10149 21.1487 6.00243 21.1956 5.89661 21.2143L3.541 21.6349L3.00317 21.6968L2.99692 21.7167L3.39872 22.0773L5.08349 23.7595C5.15752 23.8286 5.21403 23.9203 5.25302 24.0345C5.29262 24.1469 5.29573 24.2562 5.26236 24.3622ZM4.56495 23.9586L3.92003 23.4279L4.72983 20.8535L5.5705 20.762L4.56495 23.9586Z" fill="#3D3D3D"/>
        <path d="M9.09056 15.5391C8.62859 16.1507 8.08243 16.5246 7.45207 16.6607C6.82132 16.794 6.24527 16.6638 5.72393 16.2701C5.19624 15.8715 4.91125 15.3477 4.86894 14.6986C4.82784 14.0479 5.04423 13.4138 5.51814 12.7962C5.67411 12.593 5.82819 12.4219 5.98037 12.283C6.13375 12.1425 6.28347 12.0267 6.42954 11.9354C6.57522 11.8414 6.70729 11.7769 6.82576 11.7419C6.94423 11.707 7.06215 11.7189 7.17952 11.7777C7.29649 11.8337 7.37583 11.9197 7.41754 12.0358C7.45964 12.1547 7.46384 12.2661 7.43012 12.3701C7.39483 12.4728 7.33319 12.5544 7.24522 12.6149C7.15685 12.6726 7.06331 12.7338 6.9646 12.7986C6.8655 12.8607 6.76496 12.9378 6.66297 13.03C6.56219 13.1206 6.45794 13.2372 6.35022 13.3798C6.06419 13.7586 5.92831 14.1263 5.94261 14.483C5.95531 14.8385 6.11379 15.1311 6.41804 15.3609C6.72071 15.5895 7.04555 15.6619 7.39255 15.578C7.73956 15.4942 8.05189 15.2685 8.32955 14.9009C8.55694 14.5998 8.68917 14.3127 8.72623 14.0395C8.76329 13.7664 8.69675 13.5333 8.52662 13.3401L8.52123 13.3472L7.84444 14.2433C7.77263 14.3384 7.67831 14.3941 7.56149 14.4104C7.44467 14.4266 7.34031 14.4001 7.2484 14.3307C7.15649 14.2613 7.10239 14.1681 7.0861 14.0513C7.07101 13.9329 7.09877 13.827 7.16938 13.7335L8.24292 12.312C8.31712 12.2138 8.41462 12.1555 8.53542 12.1373C8.65622 12.119 8.76416 12.1458 8.85924 12.2176C9.40943 12.6555 9.69743 13.1704 9.72325 13.7623C9.74906 14.3542 9.53817 14.9464 9.09056 15.5391Z" fill="#3D3D3D"/>
        <path d="M13.1069 10.7694C12.9666 10.8632 12.8116 10.8939 12.6419 10.8616C12.4728 10.8266 12.3408 10.7381 12.2459 10.5961L10.5659 8.08239C10.4721 7.94205 10.4419 7.78787 10.4754 7.61985C10.5093 7.44907 10.5965 7.31679 10.7368 7.223L12.7304 5.89062C12.8476 5.81227 12.9765 5.78707 13.117 5.81499C13.2563 5.84127 13.3646 5.9122 13.4419 6.02777C13.5191 6.14334 13.5438 6.27136 13.5158 6.41184C13.4879 6.55232 13.4153 6.66173 13.2981 6.74007L11.7107 7.80101L12.9454 9.64851L14.5898 8.54951C14.7087 8.47006 14.8375 8.44485 14.9764 8.47388C15.1168 8.50181 15.2257 8.57356 15.3029 8.68914C15.3802 8.80471 15.4048 8.93273 15.3769 9.07321C15.3495 9.21093 15.2764 9.31952 15.1575 9.39896L13.1069 10.7694ZM12.1718 9.37016L11.6752 8.6272L13.5698 7.36102C13.6722 7.29261 13.7848 7.2699 13.9076 7.29289C14.0305 7.31588 14.1261 7.37856 14.1945 7.48092C14.2618 7.58164 14.2832 7.69397 14.2585 7.81792C14.2328 7.94022 14.1687 8.03557 14.0663 8.10399L12.1718 9.37016Z" fill="#3D3D3D"/>
      </g>
      <defs>
        <clipPath id="clip0_api_mmx">
          <rect width="55.98" height="55.98" fill="white" />
        </clipPath>
      </defs>
    </svg>
  )
}

export default function API() {
  const [activeFlowId, setActiveFlowId] = useState(FLOWS[0].id)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [direction, setDirection] = useState<1 | -1 | 0>(0)

  const activeFlow = FLOWS.find(f => f.id === activeFlowId) ?? FLOWS[0]
  const activeFlowIndex = FLOWS.findIndex(f => f.id === activeFlowId)
  const total = activeFlow.slides.length

  const goPrev = () => {
    setDirection(-1)
    setCurrentIndex(i => (i - 1 + total) % total)
  }
  const goNext = () => {
    setDirection(1)
    setCurrentIndex(i => (i + 1) % total)
  }

  const selectFlowAt = (rawIndex: number) => {
    const next = (rawIndex + FLOWS.length) % FLOWS.length
    if (FLOWS[next].id === activeFlowId) return
    setActiveFlowId(FLOWS[next].id)
    setCurrentIndex(0)
    setDirection(0)
  }
  const selectPrevFlow = () => selectFlowAt(activeFlowIndex - 1)
  const selectNextFlow = () => selectFlowAt(activeFlowIndex + 1)

  return (
    <section id="api" className="api">

      {/* ── Header card — full width, centered ──────────────────────────── */}
      <div className="api__header">
        <div className="api__card-outer surface">
          <div className="api__card-inner">
            <div className="api__card-text">
              <h2 className="api__h2 t-h2">
                <span className="t-p4">This began as an experiment</span>
                <br />
                My hypothesis was that if sci‑fi can inspire rockets, how about
                an interface?
              </h2>
              <p className="t-p4 api__subtitle">
                This is where
                <br />
                <span className="t-h5">Science Fiction Meets Interface Fiction</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Slider + side col (switcher + tweet stack) ──────────────────── */}
      <div className="api__two-col">
        <APISlider
          className="api__slider-col"
          flow={activeFlow}
          currentIndex={currentIndex}
          direction={direction}
          onPrev={goPrev}
          onNext={goNext}
        />
        <div className="api__side-col">
          <div className="api__side-sheet">
            {/* Paginator — active flow name + prev/next, replacing the
                3-button list. NavPill handles wrap-around already. */}
            <div className="api__flows-paginator" role="group" aria-label="API flows">
              <AnimatePresence mode="wait" initial={false}>
                <motion.h3
                  key={activeFlow.id}
                  className="api__flows-name t-h5"
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.2, ease: TAB_EASE }}
                >
                  {activeFlow.name}
                </motion.h3>
              </AnimatePresence>
              <NavPill
                onPrev={selectPrevFlow}
                onNext={selectNextFlow}
                prevLabel="Previous flow"
                nextLabel="Next flow"
              />
            </div>
            <p className="t-p4 api__side-text">
              I read a few Asimov stories, hoping for a direction. I got ideas for
              the structure of the API and the way it will interface with the rest
              of the client dApp.
            </p>
          </div>

          {/* Tweet column docked under the switcher — both green sheets
              now share the side-col rhythm. */}
          <div className="api__tweet-col">
            <p className="t-h5 api__tweet-label">
              Post walking you through the full context
              <IconExternalLink size={14} className="api__tweet-label-ext icon-ext" />
            </p>
            <TwitterEmbed
              tweetId="1555817593185107968"
              body={
                'An experiment in API design: if sci‑fi can inspire rockets, how about an interface? A thread on Science Fiction meeting Interface Fiction — walking through the full context of this exploration.'
              }
              timestamp="9:14 AM · Aug 5, 2022"
            />
            <span className="api__tweet-hint">opens in new tab</span>
          </div>
        </div>
      </div>

      {/* ── Quote card — centered alone ─────────────────────────────────── */}
      <div className="api__twitter-row">
        <div className="api__quote-card">
          <p className="t-p2 api__quote-text">
            Twitter was the primary channel for web3 discourse so I chose to
            pitch these ideas as threads rather than as a video or a deck.
          </p>
          <div className="api__spin-wrap">
            <MediumXMassageIcon />
          </div>
        </div>
      </div>

      {/* ── Trailing zhao.eth card — closing artifact, centered ─────────── */}
      <div className="api__trailing">
        <Sticker tilt={-1} className="api__trailing-sticker">
          <Img
            src="/images/biconomy/api/send_assets.webp"
            alt=""
            className="api__trailing-img"
            draggable={false}
            intrinsic
            placeholder="none"
            sizes="200px"
          />
        </Sticker>
      </div>

    </section>
  )
}
