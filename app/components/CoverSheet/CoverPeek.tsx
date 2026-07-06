'use client'

// CoverPeek — a photo tucked BEHIND the cover card, its top edge peeking above,
// slightly rotated. It emerges on the cover's reveal (rotates + peeks up), and
// toggles on click: pulls OUT and OVER the sheet — flips to the front,
// straightens, centres over the card, comes down, and lifts (scale + shadow).
// A small caption prints on its lower frame, revealed as it comes out.
// Click again — or anywhere on the scrim — returns it, tucked, behind the card.
//
// A real <button> for keyboard/a11y. Motion is house-paper: --ease-paper,
// settle, no overshoot. Alignment (two targets, both by construction — no magic
// pixels, so it holds at any viewport):
//   • Horizontal, both states: CSS `left: 50%` + a `-50%` translate centres the
//     photo on the stack, which is itself centred in the viewport — so tucked
//     reads as centred on the stat card, and out as centred on the view.
//   • Vertical, out: `y` animates to `openY`, measured so the photo's centre
//     lands on the viewport's vertical centre. `openY` uses transform-independent
//     offset geometry, so it's correct even mid-animation and across resizes.
// Subtleties: entrance delay applies only on the first reveal (via `entered`);
// the front z-index is raised on activate and dropped only after the RETURN
// completes, so the photo never snaps behind mid-return.

import { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'

const EASE = [0.5, 0, 0.2, 1] as const // --ease-paper
const CENTRE_X = '-50%' // paired with CSS `left: 50%` to centre on the stack
const HIDDEN = { opacity: 0, y: 40, x: CENTRE_X, rotate: 0, scale: 1 }
const REST = { opacity: 1, y: 0, x: CENTRE_X, rotate: -5, scale: 1 }
// Out over the sheet: straight, lifted, front. `y` (viewport-centring offset) is
// supplied per-render; the rest of the target is fixed.
const OVER = { opacity: 1, x: CENTRE_X, rotate: 0, scale: 1.03 }

const Z_BEHIND = -1
const Z_FRONT = 2

export default function CoverPeek({
  image,
  revealed,
  active,
  onToggle,
}: {
  image: { src: string; alt: string; width: number; caption?: string }
  revealed: boolean
  active: boolean
  onToggle: () => void
}) {
  const btnRef = useRef<HTMLButtonElement>(null)

  const entered = useRef(false)
  useEffect(() => {
    if (revealed) entered.current = true
  }, [revealed])

  // Front while active, and kept front through the return until the animation
  // completes; raised before paint so it never flashes behind on activate.
  const [raised, setRaised] = useState(false)
  useEffect(() => {
    if (active) setRaised(true)
  }, [active])

  // The `y` that drops the photo's centre onto the viewport's vertical centre
  // when out. Built from offsetTop/offsetHeight (both transform-independent) plus
  // the stack's live top, so it stays correct while the photo is mid-transform
  // and re-derives on resize / at the moment of opening.
  const [openY, setOpenY] = useState(0)
  const measure = useCallback(() => {
    const el = btnRef.current
    const stack = el?.offsetParent as HTMLElement | null
    if (!el || !stack) return
    const restCentreY = stack.getBoundingClientRect().top + el.offsetTop + el.offsetHeight / 2
    setOpenY(Math.round(window.innerHeight / 2 - restCentreY))
  }, [])
  useEffect(() => {
    if (revealed) measure()
  }, [revealed, measure])
  useEffect(() => {
    if (active) measure()
  }, [active, measure])
  useEffect(() => {
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [measure])

  const target = !revealed ? HIDDEN : active ? { ...OVER, y: openY } : REST
  const isEntrance = revealed && !entered.current

  return (
    <motion.button
      ref={btnRef}
      type="button"
      className={`cover-peek${raised ? ' is-over' : ''}`}
      aria-pressed={active}
      aria-label={active ? 'Put the team photo back behind the cover' : 'Pull the team photo out over the cover'}
      onClick={onToggle}
      style={{ width: image.width, zIndex: raised ? Z_FRONT : Z_BEHIND }}
      initial={HIDDEN}
      animate={target}
      // Retuck (return) settles a touch slower and a beat later than the pull-out,
      // so the card — which rises immediately — closes over the photo as it slides
      // back under, reading as a tuck rather than a flatten-in-place.
      transition={{
        duration: isEntrance ? 0.65 : active ? 0.5 : 0.58,
        ease: EASE,
        delay: isEntrance ? 0.22 : active ? 0 : 0.05,
      }}
      onAnimationComplete={() => {
        if (!active) setRaised(false)
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element — decorative peek photo, not an <Img> content surface */}
      <img src={image.src} alt={image.alt} width={image.width} className="cover-peek__img" />
      {image.caption && <span className="cover-peek__caption">{image.caption}</span>}
    </motion.button>
  )
}
