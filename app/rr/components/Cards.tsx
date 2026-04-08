'use client'

// Cards — Section 3 of /rr (Cards & UI)
//
// Architecture:
//   rr-canvas--cards-evo (data-tab drives subtitle visibility)
//   ├── rr-cards-header — title (swaps per tab) + subtitle + tab buttons
//   ├── CardFan         — when tab === 'cards'   (own inspect interaction)
//   └── InterfacePanel  — when tab === 'interface' (own reveal interaction)
//
// Each tab's interactive sub-tree lives in its own module under ./cards/
// so this file stays focused on tab routing.

import { useState } from 'react'
import CardFan from './cards/CardFan'
import InterfacePanel from './cards/InterfacePanel'

type Tab = 'cards' | 'interface'

const TITLES: Record<Tab, string> = {
  cards: 'Evolution of the Card Layouts',
  interface: 'The Arena',
}

export default function Cards() {
  const [tab, setTab] = useState<Tab>('cards')

  return (
    <div className="rr-canvas rr-canvas--cards-evo" data-tab={tab}>

      {/* Header */}
      <div className="rr-cards-header">
        <h2 className="rr-cards-title">{TITLES[tab]}</h2>
        <p className="rr-cards-subtitle">over a period of 3 months</p>
        <div className="rr-cards-tabs">
          <button
            className={`rr-cards-tab${tab === 'cards' ? ' rr-cards-tab--active' : ''}`}
            type="button"
            onClick={() => setTab('cards')}
          >
            Cards
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/images/rr/rr-hov.svg" className="rr-cards-tab-sep" alt="" aria-hidden="true" />
          <button
            className={`rr-cards-tab${tab === 'interface' ? ' rr-cards-tab--active' : ''}`}
            type="button"
            onClick={() => setTab('interface')}
          >
            Interface
          </button>
        </div>
      </div>

      {tab === 'cards' && <CardFan />}
      {tab === 'interface' && <InterfacePanel />}

    </div>
  )
}
