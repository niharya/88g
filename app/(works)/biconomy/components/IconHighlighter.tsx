'use client'

// Animated highlighter icon (Lucide Highlighter paths).
// Tip nudges down-left on open state — like touching paper to highlight.
// Triggered via CSS class on the parent toggle.

export default function IconHighlighter({
  size = 16,
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
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {/* Tip / nib — animates on open */}
      <path className="icon-hl-tip" d="m9 11-6 6v3h9l3-3" />
      {/* Barrel / body */}
      <path className="icon-hl-barrel" d="m22 12-4.6 4.6a2 2 0 0 1-2.8 0l-5.2-5.2a2 2 0 0 1 0-2.8L14 4" />
    </svg>
  )
}
