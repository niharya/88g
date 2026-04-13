interface FaceDownCardProps {
  size?: 'sm' | 'md' | 'lg'
  face?: 'diamond' | 'heart' | 'spade'
}

export function FaceDownCard({ size = 'md', face = 'diamond' }: FaceDownCardProps) {
  return (
    <div className={`rr-face-down-card rr-face-down-card--${size}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/images/rr/${face}.svg`}
        alt=""
        className={`rr-face-down-card__icon rr-face-down-card__icon--${face}`}
        draggable={false}
      />
    </div>
  )
}
