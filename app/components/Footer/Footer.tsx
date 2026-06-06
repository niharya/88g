'use client'

// Footer — minimum credit + links, anchored at the page end on the
// black footer-stage below the workbench.
//
// Layout (default variant):
//
//     ────────────────────────────────────────────────────────────
//     Made in 2026   Privacy │ LinkedIn │ X │ GitHub
//
// Single row beneath the divider. Credit docks to the left, links dock
// to the right. Within the links group, each link's padded box is the
// hit area — clicking or hovering anywhere in the cell triggers the
// link, matching the bottom-row pattern on typographyforlawyers.com.
// The vertical hairlines (border-right on each <li>) attach directly
// to the horizontal divider above and extend through the link box's
// full height.

import { useEffect, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: 'Privacy', href: '/privacy' },
  // `/resume` is a real Next.js route (app/resume/page.tsx) that carries
  // proper title / OG / Twitter metadata and embeds the PDF in a full-
  // viewport iframe. The iframe handles the `#navpanes=0&view=FitH`
  // fragments internally — keep this href clean so the URL bar stays at
  // `nihar.works/resume`.
  { label: 'Resume', href: '/resume', external: true },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/niharbhagat', external: true },
  { label: 'X', href: 'https://x.com/neonihar', external: true },
  { label: 'GitHub', href: 'https://github.com/niharya', external: true },
]

const CREDIT = 'Made in 2026'

// Startooth row — three small icons from the favicon-swap palette
// (star / tooth × blue / olive / terra @720, same six SVGs as
// app/layout.tsx's icon set).
//
// Rules per roll:
//   • Three slots.
//   • Each slot picks one of the two SHAPES (star, tooth), random but
//     never the same shape as the slot immediately before it (so the
//     row alternates: star-tooth-star or tooth-star-tooth).
//   • The three TONES are a permutation of [blue, olive, terra] —
//     each colour used exactly once, no repeats across the row.
const STARTOOTH_SHAPES = ['star', 'tooth'] as const
const STARTOOTH_TONES = ['blue', 'olive', 'terra'] as const
const STARTOOTH_COUNT = 3
type StartoothShape = typeof STARTOOTH_SHAPES[number]
type StartoothTone = typeof STARTOOTH_TONES[number]
type StartoothPick = { shape: StartoothShape; tone: StartoothTone }

function shuffleTones(): StartoothTone[] {
  const out = [...STARTOOTH_TONES]
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[out[i], out[j]] = [out[j], out[i]]
  }
  return out
}

function rollShapes(): StartoothShape[] {
  // First slot random; each subsequent slot flips to the other shape.
  const first = STARTOOTH_SHAPES[Math.floor(Math.random() * STARTOOTH_SHAPES.length)]
  return Array.from({ length: STARTOOTH_COUNT }, (_, i) =>
    i % 2 === 0 ? first : (first === 'star' ? 'tooth' : 'star'),
  )
}

function rollStartooths(): StartoothPick[] {
  const tones = shuffleTones()
  const shapes = rollShapes()
  return shapes.map((shape, i) => ({ shape, tone: tones[i] }))
}

// SSR-stable default so server + client first paint match. useEffect
// rolls fresh per mount.
const STARTOOTH_DEFAULT: StartoothPick[] = [
  { shape: 'star', tone: 'blue' },
  { shape: 'tooth', tone: 'olive' },
  { shape: 'star', tone: 'terra' },
]

function StartoothRow() {
  const [picks, setPicks] = useState<StartoothPick[]>(STARTOOTH_DEFAULT)
  useEffect(() => {
    setPicks(rollStartooths())
  }, [])
  // Hover delight — re-roll on each hover-enter so the row never reads
  // exactly the same twice in a single session. Cheap, no animation.
  const reroll = () => setPicks(rollStartooths())
  return (
    <a
      className="footer__startooths"
      href="/"
      aria-label="Back to the home page"
      onMouseEnter={reroll}
    >
      {picks.map((p, i) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={i}
          className={`footer__startooth footer__startooth--slot-${i + 1}`}
          src={`/icon-${p.shape}-${p.tone}.svg`}
          alt=""
          width={14}
          height={14}
          aria-hidden="true"
          draggable={false}
        />
      ))}
    </a>
  )
}

type FooterVariant = 'default' | 'caption'

export default function Footer({
  variant = 'default',
  visible,
}: {
  variant?: FooterVariant
  // Caption variant only — controlled by parent. When undefined, defaults
  // to `true` so direct mounts (e.g. for testing) show immediately. The
  // landing passes `expanded && pastForm` so the slab appears only after
  // the user has scrolled past the contact form.
  visible?: boolean
}) {
  const ref = useRef<HTMLElement>(null)
  const pathname = usePathname()

  // Write the source path to sessionStorage when the Privacy link is
  // clicked, so PrivacyBackLink can read it and render a back marker
  // labelled / toned to match. Quietly no-ops if storage is unavailable.
  const handleLinkClick = (href: string) => {
    if (href !== '/privacy') return
    try {
      sessionStorage.setItem('privacy-from', pathname ?? '/')
    } catch {
      /* non-fatal */
    }
  }

  const isRevealed =
    variant === 'caption' ? (visible ?? true) : true

  const className = [
    'footer',
    `footer--${variant}`,
    isRevealed ? 'is-revealed' : '',
  ].filter(Boolean).join(' ')

  if (variant === 'default') {
    return (
      <footer ref={ref} className={className}>
        <div className="footer__divider" aria-hidden="true" />
        <div className="footer__row">
          <p className="footer__credit t-h5">
            <StartoothRow />
            <span>{CREDIT}</span>
          </p>
          {/* Mid-divider — hidden on desktop, shown on mobile between the
              centered credit and the centered link cluster. Mirrors the
              top hairline so the two rows read as a stacked library card. */}
          <div className="footer__divider footer__divider--mid" aria-hidden="true" />
          <ul className="footer__links">
            {LINKS.map((link) => (
              <li key={link.label} className="footer__link-item">
                <a
                  className="footer__link"
                  href={link.href}
                  onClick={() => handleLinkClick(link.href)}
                  {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                >
                  {/* Inner span carries t-btn1 so the dotted-to-solid
                      underline (positioned via ::after at bottom: -2px
                      of t-btn1's containing block) lands directly under
                      the text, not at the bottom of the padded cell. */}
                  <span className="footer__link-label t-btn1">{link.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </footer>
    )
  }

  return (
    <footer ref={ref} className={className}>
      <div className="footer__row">
        <p className="footer__credit t-h5">
          <StartoothRow />
          <span>{CREDIT}</span>
        </p>
        <ul className="footer__links">
          {LINKS.map((link) => (
            <li key={link.label} className="footer__link-item">
              <a
                className="footer__link"
                href={link.href}
                onClick={() => handleLinkClick(link.href)}
                {...(link.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                <span className="footer__link-label t-btn1">{link.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  )
}
