'use client'

// BiconomyChip — three Biconomy marks, each with a distinct tilt.
// Click depresses the chip and runs a two-step dice-shake: each mark snaps
// to a random jitter pose (rotation/x/y) with `--ease-snap`, then settles
// into a different random resting pose with `--ease-paper`. Each mark rolls
// independently so it reads as three dice tumbling, not one rigid object.
// No cap — re-clicking mid-shake interrupts and restarts from the current
// pose, which is the desired dice behavior.

import { useEffect, useRef, useState } from 'react'

const BiconomyMark = ({ className }: { className?: string }) => (
  <svg
    width="20"
    height="24"
    viewBox="0 0 27 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    aria-hidden="true"
  >
    <path
      d="M21.9064 13.3434C22.4849 12.172 22.8885 10.7029 22.8885 8.87441C22.8885 6.366 21.8857 4.09544 20.0644 2.48055C18.2673 0.887084 15.8361 0.0449973 13.0334 0.0449973L3.37549 0C1.51133 0 0 1.51133 0 3.37549V32H16.8953C23.2042 32 26.8918 26.7375 26.8918 21.9907C26.8918 18.3845 24.8891 15.0847 21.9064 13.3434ZM13.0327 2.5134C17.5667 2.5134 20.4201 5.23108 20.4201 8.87441C20.4201 13.7641 16.7353 16.0004 13.007 16.0004C9.50436 16.0004 6.61956 13.1156 6.61956 8.64442V6.17602C6.61956 4.55541 5.65034 3.10051 4.15044 2.62125V2.5134H13.0327Z"
      fill="currentColor"
    />
  </svg>
)

const baseRotations = [2.3, -1.7, 3.9]

// Same value-tier (560) across hues — each shake re-rolls the color so the
// marks read as fun without breaking the value rhythm of the page. Pulled
// from globals.css; brand orange (--biconomy-orange) is the rest color.
const SHAKE_COLORS = [
  'var(--orange-560)',
  'var(--terra-560)',
  'var(--yellow-560)',
  'var(--mint-560)',
  'var(--olive-560)',
  'var(--blue-560)',
]

interface Pose {
  rotate: number
  x: number
  y: number
  color: string
}

const REST_POSE: Pose = { rotate: 0, x: 0, y: 0, color: 'var(--biconomy-orange)' }

// Loose ranges so the marks tumble freely instead of hovering inside an
// invisible box. The chip has overflow: visible, so excursions outside the
// border are intentional — they read as dice mid-roll.
const randomPose = (): Pose => ({
  rotate: (Math.random() * 30) - 15,  // ±15° around base
  x:      (Math.random() * 16) - 8,   // ±8px lateral
  y:      (Math.random() * 24) - 12,  // ±12px vertical
  color:  SHAKE_COLORS[Math.floor(Math.random() * SHAKE_COLORS.length)],
})

const JITTER_MS = 120
const SETTLE_MS = 400

export default function BiconomyChip() {
  const [poses, setPoses] = useState<Pose[]>([REST_POSE, REST_POSE, REST_POSE])
  const [phase, setPhase] = useState<'rest' | 'jitter' | 'settle'>('rest')
  const [pressed, setPressed] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
  }, [])

  const shake = () => {
    if (timerRef.current !== null) window.clearTimeout(timerRef.current)
    setPoses([randomPose(), randomPose(), randomPose()])
    setPhase('jitter')
    timerRef.current = window.setTimeout(() => {
      setPoses([randomPose(), randomPose(), randomPose()])
      setPhase('settle')
      timerRef.current = null
    }, JITTER_MS)
  }

  const transition =
    phase === 'jitter'
      ? `transform ${JITTER_MS}ms var(--ease-snap)`
      : `transform ${SETTLE_MS}ms var(--ease-paper)`

  return (
    <button
      type="button"
      className={`biconomy-chip${pressed ? ' is-pressed' : ''}`}
      onPointerDown={() => setPressed(true)}
      onPointerUp={() => setPressed(false)}
      onPointerLeave={() => setPressed(false)}
      onClick={shake}
      aria-label="Shake the marks"
    >
      {baseRotations.map((base, i) => {
        const { rotate, x, y, color } = poses[i]
        return (
          <span key={i} className="biconomy-chip__slot">
            {i > 0 && <span className="biconomy-chip__divider" aria-hidden="true" />}
            <span
              className="biconomy-chip__mark"
              style={{
                transform: `translate(${x}px, ${y}px) rotate(${base + rotate}deg)`,
                transition: `${transition}, color ${SETTLE_MS}ms var(--ease-paper)`,
                color,
              }}
            >
              <BiconomyMark />
            </span>
          </span>
        )
      })}
    </button>
  )
}
