'use client'

// Route-level error boundary (Next.js convention). Renders when a route
// segment throws during render or in a server component. Kept minimal —
// same editorial register as the rest of the portfolio.

import { useEffect } from 'react'
import ErrorContent from './components/ErrorContent'
import './not-found.css'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surface to the browser console so the issue is visible in dev tools.
    // Production telemetry can hook in here later if needed.
    console.error('[route error]', error)
  }, [error])

  return <ErrorContent onReset={reset} />
}
