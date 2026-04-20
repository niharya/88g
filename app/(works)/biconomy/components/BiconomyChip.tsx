'use client'

// BiconomyChip — three Biconomy marks, each with a distinct tilt.
// Marks sit on the chip midline (aligned with dividers); tilt is the only
// hand-placed character at rest. Hover rolls a fresh ±2° offset per mark
// and lets it settle via paper-physical easing.

import { useState } from 'react'

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
      fill="#F2561D"
    />
  </svg>
)

const baseRotations = [2.3, -1.7, 3.9]

export default function BiconomyChip() {
  const [hoverOffsets, setHoverOffsets] = useState<(number | null)[]>([null, null, null])

  const roll = (i: number) => {
    setHoverOffsets(prev => {
      const next = [...prev]
      next[i] = (Math.random() * 4) - 2
      return next
    })
  }
  const reset = (i: number) => {
    setHoverOffsets(prev => {
      const next = [...prev]
      next[i] = null
      return next
    })
  }

  return (
    <div className="biconomy-chip">
      {baseRotations.map((base, i) => {
        const offset = hoverOffsets[i] ?? 0
        return (
          <span key={i} className="biconomy-chip__slot">
            {i > 0 && <div className="biconomy-chip__divider" aria-hidden="true" />}
            <div
              className="biconomy-chip__mark"
              style={{ transform: `rotate(${base + offset}deg)` }}
              onMouseEnter={() => roll(i)}
              onMouseLeave={() => reset(i)}
            >
              <BiconomyMark />
            </div>
          </span>
        )
      })}
    </div>
  )
}
