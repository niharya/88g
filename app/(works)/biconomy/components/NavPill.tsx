'use client'

// NavPill — single-pill prev/next control with center divider.
// Shared by Flows + API. Material Symbols Rounded chevrons at weight 500.
// Height-matched to the Flows before/after switch so both read as one row.

interface NavPillProps {
  onPrev: () => void
  onNext: () => void
  prevLabel?: string
  nextLabel?: string
  className?: string
}

function ChevronLeft() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="m439.65-480 152.18 152.17Q604.5-315.15 604.5-296t-12.67 31.83Q579.15-251.5 560-251.5t-31.83-12.67L344.41-447.93q-6.71-6.72-9.81-14.92-3.1-8.19-3.1-17.15 0-8.96 3.1-17.15 3.1-8.2 9.81-14.92l183.76-183.76Q540.85-708.5 560-708.5t31.83 12.67Q604.5-683.15 604.5-664t-12.67 31.83L439.65-480Z" />
    </svg>
  )
}

function ChevronRight() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 -960 960 960"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M496.35-480 344.17-632.17Q331.5-644.85 331.5-664t12.67-31.83Q356.85-708.5 376-708.5t31.83 12.67l183.76 183.76q6.71 6.72 9.81 14.92 3.1 8.19 3.1 17.15 0 8.96-3.1 17.15-3.1 8.2-9.81 14.92L407.83-264.17Q395.15-251.5 376-251.5t-31.83-12.67Q331.5-276.85 331.5-296t12.67-31.83L496.35-480Z" />
    </svg>
  )
}

export default function NavPill({
  onPrev,
  onNext,
  prevLabel = 'Previous',
  nextLabel = 'Next',
  className,
}: NavPillProps) {
  return (
    <div className={`navpill${className ? ` ${className}` : ''}`}>
      <button
        type="button"
        className="navpill__btn"
        onClick={onPrev}
        aria-label={prevLabel}
      >
        <ChevronLeft />
      </button>
      <span className="navpill__divider" aria-hidden="true" />
      <button
        type="button"
        className="navpill__btn"
        onClick={onNext}
        aria-label={nextLabel}
      >
        <ChevronRight />
      </button>
    </div>
  )
}
