'use client'

// Animated arrow-right icon (Lucide ArrowRight paths).
// Arrow nudges right on hover — triggered via CSS on the parent.
// The shaft+head group gets a CSS translate on parent hover, no JS needed.

export default function IconArrowRight({
  size = 20,
  className,
}: {
  size?: number
  className?: string
}) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <g className="icon-arrow-right-shaft">
        <path d="M5 12h14" />
        <path d="m12 5 7 7-7 7" />
      </g>
    </svg>
  )
}
