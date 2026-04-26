// ExpandToggle — the portfolio's expand/collapse icon.
//
// Hand-drawn-feel hooks pointing into opposite quadrants. Originally authored
// for the landing pill-btn; promoted to a shared primitive in v0.59 so /rr
// and /biconomy can stop using Material Symbols `expand_content` /
// `collapse_content` (which read as a different family — square brackets
// instead of rounded hooks).
//
// Stateless. Consumer owns `expanded`. Stroke colour is inherited via
// `currentColor` so each consumer can tone-tint via parent `color`.

type Props = {
  expanded: boolean
  className?: string
}

export function ExpandToggle({ expanded, className }: Props) {
  return expanded ? (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.1 12.89H4.62c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72 0-.28.1-.52.3-.72.2-.2.44-.3.72-.3h3.5c.28 0 .52.1.72.3.2.2.3.44.3.72v3.5c0 .28-.1.52-.3.72-.2.2-.44.3-.72.3-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72v-2.48zM12.9 7.1h2.48c.28 0 .52.1.72.3.2.2.3.44.3.72 0 .28-.1.52-.3.72-.2.2-.44.3-.72.3h-3.5c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72v-3.5c0-.28.1-.52.3-.72.2-.2.44-.3.72-.3.28 0 .52.1.72.3.2.2.3.44.3.72V7.1z"
        fill="currentColor"
      />
    </svg>
  ) : (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6.77 13.23H9.25c.28 0 .52.1.72.3.2.2.3.44.3.72 0 .28-.1.52-.3.72-.2.2-.44.3-.72.3H5.75c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72V10.75c0-.28.1-.52.3-.72.2-.2.44-.3.72-.3.28 0 .52.1.72.3.2.2.3.44.3.72v2.48zM13.23 6.77H10.75c-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72 0-.28.1-.52.3-.72.2-.2.44-.3.72-.3h3.5c.28 0 .52.1.72.3.2.2.3.44.3.72v3.5c0 .28-.1.52-.3.72-.2.2-.44.3-.72.3-.28 0-.52-.1-.72-.3-.2-.2-.3-.44-.3-.72V6.77z"
        fill="currentColor"
      />
    </svg>
  )
}
