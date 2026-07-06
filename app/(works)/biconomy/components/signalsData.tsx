// Biconomy Signals — content for the SignalsBento drawer. Structure lives in
// app/components/SignalsBento; this is just the route's data. Role tile is
// blue, Outcome orange (no stats). The cube icon strokes with currentColor so
// it inherits the role tile's ink.

import type { SignalsData } from '../../../components/SignalsBento'

const Cube = (
  <svg
    width="28"
    height="31"
    viewBox="0 0 44 48"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinejoin="round"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <path d="M22 3 40 13.5 40 34.5 22 45 4 34.5 4 13.5 Z" />
    <path d="M22 24 22 3 M22 24 40 13.5 M22 24 4 13.5" />
  </svg>
)

export const biconomySignals: SignalsData = {
  label: 'Biconomy — Signals',
  role: {
    tone: 'blue',
    icon: Cube,
    lead: 'Product Designer',
    rest: 'at a blockchain payments infrastructure company',
    meta: '2021 – 2023',
  },
  outcome: {
    tone: 'orange',
    body: 'Over two years I worked across product, demos, and internal proposals to keep coherence inside a fast-moving infrastructure system.',
    halo: 'br',
    minHeight: 248,
  },
  product: {
    headline: 'Smart contracts & gas-tank balances, managed.',
    image: {
      src: '/images/biconomy/signals-paymaster-card.svg',
      alt: 'Biconomy Paymaster card',
      width: 248,
    },
    rows: [
      { label: 'Used by', value: 'Devs · Growth · Founders' },
      { label: 'Frequency', value: '1–3× / month' },
    ],
  },
  involvement: ['Product Design', 'UX Design', 'Interaction Design', 'Design Systems'],
  deliverables: ['UX Audit', 'Developer Dashboard', 'Interactive Demos', 'Concept UIs', 'Process Frameworks'],
  coverImage: {
    src: '/images/biconomy/_photos/cover-people.webp',
    alt: 'The Biconomy team at a team dinner',
    width: 740,
    caption: 'Offsite in Baku, 2024',
  },
}
