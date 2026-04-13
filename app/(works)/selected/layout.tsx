// Selected route layout — route-specific CSS only.
// Font gate and nav.css live in the (works) shared layout.

import type { ReactNode } from 'react'

export default function SelectedLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
