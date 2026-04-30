'use client'

// Shared body of the error page. Used by:
//   • app/error.tsx — the real route-level error boundary (consumed by Next
//     when a route segment throws).
//   • app/error/page.tsx — preview route so the layout can be opened directly
//     without having to throw an error.
// CSS / token cascade lives at the consumer; this component is JSX only.

import NavMarker from './NavMarker'

export default function ErrorContent({ onReset }: { onReset?: () => void }) {
  return (
    <main className="not-found">
      <div className="not-found__inner">
        <p className="not-found__copy t-p2">
          Something on this page came apart. Try reloading — and if it sticks, head home.
        </p>

        <div className="not-found__home" style={{ display: 'flex', gap: 'var(--space-16)' }}>
          <NavMarker
            as="button"
            role="project"
            tone="terra"
            icon="arrow_forward"
            label="Try again"
            onClick={() => onReset?.()}
          />
          <NavMarker
            as="a"
            href="/"
            role="project"
            tone="neutral"
            icon="arrow_back"
            label="Home"
          />
        </div>
      </div>
    </main>
  )
}
