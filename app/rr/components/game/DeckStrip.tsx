import { FlipCard } from './FlipCard'

interface DeckStripProps {
  allCards: number[]
  playedCards: number[]
  flipped?: boolean
  face?: 'diamond' | 'heart' | 'spade'
}

export function DeckStrip({ allCards, playedCards, flipped = false, face = 'diamond' }: DeckStripProps) {
  const played = new Set(playedCards)
  const iconSrc = `/images/rr/${face}.svg`
  const iconClass = `rr-deck-strip__chip-icon rr-deck-strip__chip-icon--${face}`
  return (
    <div className="rr-deck-strip">
      <div className="rr-deck-strip__header">
        <div className="rr-deck-strip__hr" />
        <span className="rr-deck-strip__label">Deck</span>
        <div className="rr-deck-strip__hr" />
      </div>
      <div className="rr-deck-strip__chips">
        {allCards.map((card, i) =>
          played.has(card) ? (
            <div key={i} className="rr-deck-strip__chip rr-deck-strip__chip--played">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconSrc} alt="" className={iconClass} draggable={false} />
            </div>
          ) : (
            <FlipCard
              key={i}
              flipped={flipped}
              front={<div className="rr-deck-strip__chip">{card}</div>}
              back={
                <div className="rr-deck-strip__chip rr-deck-strip__chip--played">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={iconSrc}
                    alt=""
                    className={iconClass}
                    draggable={false}
                  />
                </div>
              }
            />
          )
        )}
      </div>
    </div>
  )
}
