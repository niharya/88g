import type { ReactNode } from 'react'

interface FlipCardProps {
  flipped: boolean
  front: ReactNode
  back: ReactNode
}

/**
 * 3D flip wrapper. Front face dictates size; back is absolutely positioned
 * over it and rotated 180° so it shows when the inner is flipped.
 */
export function FlipCard({ flipped, front, back }: FlipCardProps) {
  return (
    <div className="rr-flip-card" data-flipped={flipped}>
      <div className="rr-flip-card__inner">
        <div className="rr-flip-card__face rr-flip-card__face--front">{front}</div>
        <div className="rr-flip-card__face rr-flip-card__face--back">{back}</div>
      </div>
    </div>
  )
}
