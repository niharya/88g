'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

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

export default function RulesRail() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className={`rr-rules-rail${isOpen ? ' is-open' : ''}`}
      animate={{ x: isOpen ? 175 : 0, rotate: isOpen ? 0 : 1 }}
      transition={{ type: 'spring', stiffness: 420, damping: 32, mass: 0.7 }}
    >

      {/* Vertical tab button */}
      <button
        className="rr-rules-rail__tab"
        onClick={() => setIsOpen(o => !o)}
        type="button"
        aria-label={isOpen ? 'Close rules' : 'Open rules'}
      >
        <span className="rr-rules-rail__tab-inner">
          <ArrowBackIcon className={`rr-rules-rail__arrow${isOpen ? '' : ' is-flipped'}`} />
          Rules
        </span>
      </button>

      {/* Rules list — clicking anywhere on the open sheet closes it */}
      <div
        className="rr-rules-rail__content"
        onClick={() => { if (isOpen) setIsOpen(false) }}
      >
        <ul className="rr-rules-rail__list">
          <li className="rr-rules-rail__item">5 rounds</li>
          <li className="rr-rules-rail__item">6 cards each</li>
          <li className="rr-rules-rail__item">Higher number wins</li>
          <li className="rr-rules-rail__item">5 beats any two-digit card</li>
          <li className="rr-rules-rail__item">Played cards go to discard</li>
          <li className="rr-rules-rail__item">Unused cards shuffle back into the deck</li>
        </ul>
      </div>

    </motion.div>
  )
}
