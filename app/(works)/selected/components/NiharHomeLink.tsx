'use client'

// NiharHomeLink — the "Nihar" pill on /selected.
//
// Replaces the usual ProjectMarker here because /selected's Nihar pill is the
// return link to the landing page, not a project label. Renders the same
// .nav-marker--project pill shell so docking + border halving still apply,
// but as an anchor, with t-btn1 on the name (to match other text links on the
// route), and sets a session flag so the landing page knows to slide in from
// the left on arrival.

import Link from 'next/link'

export default function NiharHomeLink() {
  const onClick = () => {
    try {
      sessionStorage.setItem('nav-direction', 'to-landing')
    } catch {
      /* Safari private mode etc. — non-fatal */
    }
  }

  return (
    <Link
      href="/"
      className="nav-marker nav-marker--project"
      onClick={onClick}
      aria-label="Back to landing page"
    >
      <span className="nav-marker__content">
        <span className="nav-icon" aria-hidden="true">arrow_back</span>
        <span className="nav-marker__name t-btn1">Nihar</span>
      </span>
    </Link>
  )
}
