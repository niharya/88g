// Preview route — opens the 404 layout directly at /preview/404 without
// having to trigger a real not-found. Same component as app/not-found.tsx.
// Lives under /preview/ because Next.js shadows the literal /404 path and
// forces a 404 status code on it.

import type { Metadata } from 'next'
import NotFoundContent from '../../components/NotFoundContent'
import '../../(works)/rr/rr.css'
import '../../(works)/rr/components/game/game.css'
import '../../not-found.css'

export const metadata: Metadata = {
  title: '404 — preview',
  robots: { index: false, follow: false },
}

export default function NotFoundPreview() {
  return <NotFoundContent />
}
