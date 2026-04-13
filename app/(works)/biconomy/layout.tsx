// Biconomy route layout — route-specific CSS only.
// Font gate and nav.css live in the (works) shared layout.

import type { ReactNode } from 'react'
import './biconomy.css'

export default function BiconomyLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
