'use client'

// Preview route — opens the error layout directly at /preview/error without
// having to throw an error. The "Try again" button reloads the page so the
// interaction still feels real.

import ErrorContent from '../../components/ErrorContent'
import '../../not-found.css'

export default function ErrorPreview() {
  return <ErrorContent onReset={() => window.location.reload()} />
}
