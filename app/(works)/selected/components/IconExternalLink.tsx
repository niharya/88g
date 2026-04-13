'use client'

// Animated external-link icon (Lucide SquareArrowOutUpRight paths).
// Arrow slides out on hover — triggered via CSS on the parent <a>.
// The arrow group gets a CSS translate on `a.ap-entry:hover`, no JS needed.

export default function IconExternalLink({
  size = 14,
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
      {/* Box — stays still */}
      <path d="M21 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" />

      {/* Arrow — animated via CSS on parent hover */}
      <g className="icon-ext-arrow">
        <path d="M21 3H15" />
        <path d="M21 3V9" />
        <path d="M21 3 9 15" />
      </g>
    </svg>
  )
}
