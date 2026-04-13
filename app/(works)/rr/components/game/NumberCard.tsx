'use client'

interface NumberCardProps {
  value: number
  variant: 'opponent' | 'player'
  size?: 'sm' | 'lg'
  onClick?: () => void
  disabled?: boolean
  selected?: boolean
}

export function NumberCard({
  value,
  variant,
  size = 'lg',
  onClick,
  disabled = false,
  selected = false,
}: NumberCardProps) {
  const isOpponent = variant === 'opponent'

  const classes = [
    'rr-num-card',
    `rr-num-card--${size}`,
    selected
      ? `rr-num-card--${variant}-selected`
      : `rr-num-card--${variant}`,
    !disabled && !isOpponent ? 'rr-num-card--hoverable' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button type="button" onClick={onClick} disabled={disabled} className={classes}>
      {isOpponent ? (
        <span className="rr-num-card__num">
          <span className="rr-num-card__stroke" aria-hidden="true">
            {value}
          </span>
          <span className="rr-num-card__face">{value}</span>
        </span>
      ) : (
        <span className="rr-num-card__face rr-num-card__face--player">{value}</span>
      )}
    </button>
  )
}
