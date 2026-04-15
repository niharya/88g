'use client'

// Animated chevron-right icon (Lucide ChevronRight path).
// Arrow nudges right on hover — triggered via CSS on the parent link.
// The polyline gets a CSS translate on `.project-card:hover`, no JS needed.

export default function IconChevronRight({
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
      <path className="icon-chevron-shaft" d="m9 18 6-6-6-6" />
    </svg>
  )
}
