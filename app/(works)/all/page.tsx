import type { Metadata } from 'next'
import './selected.css'
import './bench.css'
import SlideInOnNav from '../../components/SlideInOnNav'
import { pinyon } from './fonts'
import BenchEssay from './components/Essay/BenchEssay'

export const metadata: Metadata = {
  title: 'Selected Work',
  description:
    'Branding, onboarding flows, naming, systems work, infrastructure experiments.',
  alternates: { canonical: '/all' },
  openGraph: {
    title: 'Different systems. Same instincts.',
    description:
      'Trying to organize complexity so people can move through it and get somewhere.',
    url: '/all',
    images: ['/og-image.png'],
  },
}

// The active tab is addressed by bare query flags — `/all?showcase` / `/all?cases`
// (the `/showcase` & `/cases` rewrites resolve to these). Read here (server)
// rather than via client useSearchParams so the rewrites work: the rewrite's
// destination query reaches the server, but the browser URL (and
// useSearchParams) doesn't carry it. Precedence: showcase (the default tab)
// wins if both flags are somehow present; neither flag → the resting invite.
export default async function BenchPage({
  searchParams,
}: {
  searchParams: Promise<{ showcase?: string; cases?: string }>
}) {
  const sp = await searchParams
  const initialView = 'showcase' in sp ? 'vis' : 'cases' in sp ? 'lf' : null

  return (
    <div className={`bench-workbench ${pinyon.variable}`}>
      <h1 className="sr-only">Works</h1>
      <SlideInOnNav
        flag="to-bench"
        selector=".bench-workbench"
        className="bench-workbench--slide-in"
      />

      {/* The invitation essay. The ticket morphs into a pinned navbar; the work
          panel (Timeline / Showcase) mounts beneath in browse mode. BenchEssay
          owns its own centred stage + the full-width work panel. */}
      <BenchEssay initialView={initialView} />
    </div>
  )
}
