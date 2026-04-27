'use client'

import { useState, useEffect } from 'react'
import Rail from './Rail'

const RULES_SEEN_KEY = 'rr-rules-seen'

const CLOSED_REST_TRANSFORM = 'rotate(1deg)'
// When the note rail opens, the game board nudges -50 (not -12). The rules
// rail is tucked under the board's right-edge so it must follow that same
// larger nudge, otherwise it'd float away from the board edge.
const CLOSED_NUDGED_TRANSFORM = 'translateX(-50px) rotate(1deg)'
const OPEN_TRANSFORM = 'translateX(163px) rotate(0deg)'
// Mobile: board doesn't nudge, family is natural-scale 520px-wide. Desktop
// 163px slide runs right off the mat edge — instead pull the panel LEFT so
// it lands on top of the game board.
const OPEN_TRANSFORM_MOBILE = 'translateX(-50px) rotate(0deg)'

function ArrowBackIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden="true">
      <mask id="rr-rules-arrow-mask" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 20 1.74846e-06)" fill="white" />
      </mask>
      <g mask="url(#rr-rules-arrow-mask)">
        <path d="M7.52271 11.0208L15.38 11.0208C15.6631 11.0208 15.9039 10.9219 16.1025 10.724C16.3011 10.5262 16.4004 10.2863 16.4004 10.0044C16.4004 9.72243 16.3011 9.48111 16.1025 9.28042C15.9039 9.07959 15.6631 8.97917 15.38 8.97917L7.52271 8.97917L10.7346 5.76729C10.9393 5.56257 11.0436 5.32021 11.0475 5.04021C11.0515 4.76035 10.9497 4.51326 10.7419 4.29896C10.5341 4.09785 10.2903 3.99924 10.0104 4.00313C9.73056 4.00702 9.48806 4.1116 9.28292 4.31688L4.32917 9.27708C4.23056 9.37583 4.15403 9.48861 4.09959 9.61542C4.04528 9.74236 4.01813 9.87167 4.01813 10.0033C4.01813 10.135 4.04528 10.2642 4.09959 10.391C4.15403 10.518 4.22771 10.628 4.32063 10.721L9.29084 15.691C9.50639 15.9067 9.74674 16.0111 10.0119 16.0042C10.2769 15.9972 10.5133 15.8892 10.721 15.6802C10.9288 15.4659 11.0327 15.2196 11.0327 14.9413C11.0327 14.6629 10.9288 14.4222 10.721 14.2192L7.52271 11.0208Z" fill="currentColor" />
      </g>
    </svg>
  )
}

/**
 * Cue for first-visit auto-open. Mechanics owns an IntersectionObserver on
 * the gameboard and flips this true once the board crosses the viewport
 * mid-line. RulesRail then animates open. Replaces the older 1-second
 * mount-time timer (which fired regardless of whether the user had even
 * scrolled to the section). The rail still tucks back only on explicit
 * dismissal — Start Game button, or a click on the rail itself.
 */
interface RulesRailProps {
  /** External signal to dismiss the first-visit overlay (e.g. "Start game" click). */
  dismiss?: boolean
  /** Is the sibling rail (note) currently open? If so, tuck-nudge -12px to
   *  follow the game board, which shifts -12px via :has(.is-open) in rr.css. */
  otherOpen?: boolean
  /** Emit open-state changes so the parent can coordinate with the other rail. */
  onOpenChange?: (isOpen: boolean) => void
  /** Cue from Mechanics: gameboard has scrolled into view. First-visit rail
   *  opens on this signal (desktop only); subsequent visits ignore it. */
  gameboardInView?: boolean
}

export default function RulesRail({ dismiss = false, otherOpen = false, onOpenChange, gameboardInView = false }: RulesRailProps) {
  // First visit: rail tucks until the gameboard scrolls into view, then opens.
  // Stays open until explicit dismissal (click rail / Start game).
  const [firstVisit, setFirstVisit] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return
    const mq = window.matchMedia('(max-width: 767px)')
    const apply = () => setIsMobile(mq.matches)
    apply()
    mq.addEventListener('change', apply)
    return () => mq.removeEventListener('change', apply)
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.localStorage.getItem(RULES_SEEN_KEY) !== '1') {
      setFirstVisit(true)
    }
  }, [])

  // Open the rail the moment the gameboard enters view (first visit, desktop).
  // On mobile the rail is a manual flip-out — auto-open competes with initial
  // scroll, so we leave it tucked.
  useEffect(() => {
    if (!firstVisit) return
    if (!gameboardInView) return
    if (typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches) return
    setIsOpen(true)
  }, [firstVisit, gameboardInView])

  // External dismiss (e.g. "Start game" button)
  useEffect(() => {
    if (dismiss && firstVisit) dismissRules()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dismiss])

  function dismissRules() {
    setFirstVisit(false)
    setIsOpen(false)
    try { window.localStorage.setItem(RULES_SEEN_KEY, '1') } catch {}
  }

  function handleToggle() {
    if (firstVisit) {
      // On desktop the first-visit overlay auto-opens, so the first click is
      // dismissal. On mobile there's no auto-open, so the first click should
      // open the rail (and mark as seen) — otherwise the user has to click twice.
      const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
      if (isMobile) {
        setFirstVisit(false)
        setIsOpen(true)
        try { window.localStorage.setItem(RULES_SEEN_KEY, '1') } catch {}
        return
      }
      dismissRules()
      return
    }
    setIsOpen(o => !o)
  }

  const transform = isOpen
    ? (isMobile ? OPEN_TRANSFORM_MOBILE : OPEN_TRANSFORM)
    : otherOpen && !isMobile
      ? CLOSED_NUDGED_TRANSFORM
      : CLOSED_REST_TRANSFORM

  return (
    <Rail
      className="rr-rules-rail"
      isOpen={isOpen}
      transform={transform}
      onToggle={handleToggle}
      onOpenChange={onOpenChange}
      ariaLabel={isOpen ? 'Close rules' : 'Open rules'}
    >
      {/* Vertical tab — visual only, click is on the whole rail */}
      <div className="rr-rules-rail__tab">
        <span className="rr-rules-rail__tab-inner t-btn1">
          <ArrowBackIcon className={`rr-rules-rail__arrow${isOpen ? '' : ' is-flipped'}`} />
          Rules
        </span>
      </div>

      {/* Rules list */}
      <div className="rr-rules-rail__content">
        <ul className="rr-rules-rail__list">
          <li className="rr-rules-rail__item">5 rounds, 6 cards each</li>
          <li className="rr-rules-rail__item">Higher number wins the round</li>
          <li className="rr-rules-rail__item">5 beats any two-digit card</li>
          <li className="rr-rules-rail__item">Played cards are discarded</li>
          <li className="rr-rules-rail__item">Unused cards shuffle back into the deck</li>
        </ul>
      </div>
    </Rail>
  )
}
