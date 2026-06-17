'use client'

// ProjectCard — project entry card linking to a route.
// Variants: 'terra' (Rug Rumble) and 'blue' (Biconomy).
//
// Stale-hover gate: arriving on /selected with the cursor parked over a
// card otherwise lets :hover fire on mount, which would trigger the
// timeline-level cascade (dimming neighbors, lighting the bar) before
// the user has interacted. Every hover effect on the card and the
// :has(:hover) cascade in selected.css are gated on `data-armed="true"`,
// flipped on by the first real cursor movement. Animation-driven
// hit-tests don't fire mousemove (only pointerenter/leave), so the
// entrance spring leaves the gate closed. Any cursor nudge — even
// inside the card — opens it.

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import Link from 'next/link'
import IconChevronRight from '../../../components/icons/IconChevronRight'
import Sticker from '../../../components/Sticker'

interface ProjectCardProps {
  variant: 'terra' | 'blue'
  title: string
  body: string
  role: string
  href: string
}

export default function ProjectCard({ variant, title, body, role, href }: ProjectCardProps) {
  const [armed, setArmed] = useState(false)
  const lastPosRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const prev = lastPosRef.current
      if (!prev) {
        // First mousemove just records position — handles the synthetic
        // mousemove some browsers fire after a layout/transform without
        // any actual cursor motion.
        lastPosRef.current = { x: e.clientX, y: e.clientY }
        return
      }
      if (prev.x !== e.clientX || prev.y !== e.clientY) {
        setArmed(true)
        document.removeEventListener('mousemove', onMove)
      }
    }
    document.addEventListener('mousemove', onMove)
    return () => document.removeEventListener('mousemove', onMove)
  }, [])

  // On each card-hover entry, re-roll a random ±2° offset and set it as
  // --sticker-jitter on the card. CSS-var inheritance carries it down to
  // the inner <Sticker>, where it composes with the resting `tilt`. The
  // sticker also gets its lift treatment via the parent-hover CSS rule
  // in selected.css. Cleared on leave so the sticker eases back to its
  // authored rest pose.
  const onCardEnter = useCallback((e: ReactPointerEvent<HTMLAnchorElement>) => {
    const j = (Math.random() * 4 - 2).toFixed(2)
    e.currentTarget.style.setProperty('--sticker-jitter', `${j}deg`)
  }, [])
  const onCardLeave = useCallback((e: ReactPointerEvent<HTMLAnchorElement>) => {
    e.currentTarget.style.setProperty('--sticker-jitter', '0deg')
  }, [])

  return (
    <Link
      href={href}
      className={`project-card project-card--${variant}`}
      data-armed={armed || undefined}
      onPointerEnter={onCardEnter}
      onPointerLeave={onCardLeave}
    >
      {/* Illustration */}
      {variant === 'terra' && (
        <Sticker
          tilt={-6}
          className="project-card__illus project-card__illus--hov"
          aria-hidden
          clickRotate={false}
        >
          {/* Die-cut diamond. The white stroke is the sticker's offset rim
              — paint-order keeps it outside the orange fill, matching the
              physical stickers in the rest of the family. */}
          <svg width="33" height="37" viewBox="-3 -3 35 40" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M13.6464 1.26833e-05C14.3548-0.00191177 14.6984 0.21482 14.9981 0.88508C17.5457 6.581 21.8922 11.4428 26.7794 15.2513C28.6599 16.7161 28.3602 17.2699 26.6878 18.6067C22.6455 21.8376 18.7682 25.8285 16.2738 30.4001C15.7725 31.3177 15.0668 33.1459 14.3575 33.7261C14.2925 33.7369 14.2256 33.7464 14.1596 33.7546C13.5832 33.8254 13.3028 33.4115 13.0975 32.9453C10.7872 27.6901 6.99881 23.3985 2.76043 19.6029C2.02455 18.9441 0.107425 17.9394 0.00387143 16.9517C-0.110679 15.8627 2.34988 14.6728 2.99961 13.9281C6.25927 11.0425 9.15786 7.75474 11.4672 4.06244C12.2141 2.86827 12.785 0.974336 13.6464 1.26833e-05Z"
              fill="var(--orange-560)"
              stroke="#FFFFFF"
              strokeWidth="5"
              strokeLinejoin="round"
              paintOrder="stroke fill"
            />
          </svg>
        </Sticker>
      )}
      {variant === 'blue' && (
        <Sticker
          tilt={-3}
          className="project-card__illus project-card__illus--paperroll"
          aria-hidden
          clickRotate={false}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/paper-roll.webp" alt="" />
        </Sticker>
      )}

      <h3 className="project-card__title">{title}</h3>
      <p className="project-card__body">{body}</p>
      <div className="project-card__divider" />
      <div className="project-card__footer">
        <span className="project-card__role t-h5">{role}</span>
        <IconChevronRight size={20} className="project-card__arrow" />
      </div>
    </Link>
  )
}
