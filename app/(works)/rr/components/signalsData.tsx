// Rug Rumble Signals — content for the SignalsBento drawer. Role tile is
// orange, Outcome yellow with three count-up stats. The two-card icon strokes
// with currentColor (role ink) and fills its top card with the tile bg.

import type { SignalsData } from '../../../components/SignalsBento'

const Cards = (
  <svg
    width="26"
    height="29"
    viewBox="0 0 40 44"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.6}
    strokeLinejoin="round"
    strokeLinecap="round"
    aria-hidden="true"
  >
    <rect x="6" y="10" width="20" height="27" rx="3" transform="rotate(-11 16 23)" />
    <rect x="15" y="8" width="20" height="27" rx="3" transform="rotate(9 25 21)" style={{ fill: 'var(--tile-bg)' }} />
  </svg>
)

export const rrSignals: SignalsData = {
  label: 'Rug Rumble — Signals',
  role: {
    tone: 'orange',
    icon: Cards,
    lead: 'Game Designer',
    rest: 'on an on-chain PvP card game',
    meta: "Q4 '25",
  },
  outcome: {
    tone: 'yellow',
    body: 'Designed, built, and shipped a full PvP card game, fast.',
    stats: [
      { value: 3, unit: 'mo', label: 'To launch' },
      { value: 14, suffix: 'K', label: 'Testnet players' },
      { value: 50, suffix: 'K', label: 'Games played' },
    ],
    halo: 'tr',
    minHeight: 300,
  },
  product: {
    headline: 'An on-chain PvP card game of bluffs and rug-pulls.',
    image: {
      src: '/images/rr/signals-peace-treaty.svg',
      alt: 'Rug Rumble — Peace Treaty card',
      width: 190,
    },
    rows: [
      { label: 'Players', value: 'Strategy · Crypto-native' },
      { label: 'Format', value: '1v1 PvP · On-chain' },
    ],
  },
  involvement: ['Game Design', 'Product Design', 'UI Design', 'Playtesting'],
  deliverables: ['PvP Card Game', 'Game Mechanics', 'Card Layout Design', 'Game Interface'],
  coverImage: {
    src: '/images/rr/_photos/cover-people.webp',
    alt: 'The Rug Rumble team in a working session',
    width: 740,
    caption: 'Building Rug Rumble, 2025',
  },
}
