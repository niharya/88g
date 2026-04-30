'use client'

// Footer — minimum credit + links, anchored at the page end on the
// black footer-stage below the workbench.
//
// Layout (default variant):
//
//     ────────────────────────────────────────────────────────────
//     Designed and dev. by Nihar, 2026   Privacy │ LinkedIn │ X │ GitHub
//
// Single row beneath the divider. Credit docks to the left, links dock
// to the right. Within the links group, each link's padded box is the
// hit area — clicking or hovering anywhere in the cell triggers the
// link, matching the bottom-row pattern on typographyforlawyers.com.
// The vertical hairlines (border-right on each <li>) attach directly
// to the horizontal divider above and extend through the link box's
// full height.

import { useRef } from 'react'
import { usePathname } from 'next/navigation'

const LINKS: { label: string; href: string; external?: boolean }[] = [
  { label: 'Privacy', href: '/privacy' },
  { label: 'LinkedIn', href: 'https://linkedin.com/in/niharbhagat', external: true },
  { label: 'X', href: 'https://x.com/neonihar', external: true },
  { label: 'GitHub', href: 'https://github.com/niharya', external: true },
]

const CREDIT = 'Designed and built with Claude by Nihar, 2026'

// Hover-fill palettes for default-variant link cells, scoped per route.
// Each route's two hues at the 800 luminance step — deeper / more
// saturated than the 720 set, so the fill registers cleanly against
// the black footer-stage. `onMouseEnter` rolls a fresh random pick
// per cell entry from the active route's pair, NEVER returning the
// same color twice in a row across the row (a shared ref tracks the
// last pick — see `pickHoverColor` below). With 2-hue palettes this
// makes the pair strictly alternate.
const ROUTE_PALETTES: Record<string, string[]> = {
  '/selected':  ['var(--blue-800)',  'var(--terra-800)'],
  '/rr':        ['var(--yellow-800)','var(--terra-800)'],
  '/biconomy':  ['var(--blue-800)',  'var(--olive-800)'],
}
const FALLBACK_PALETTE = ['var(--blue-800)', 'var(--terra-800)']

// Click-state palette — same hue, 960 step. The cell darkens as it
// presses into the black surface. Combined with the 1-px translate
// this gives the same paper-tag press feel NavMarker has.
const ACTIVE_FOR_HOVER: Record<string, string> = {
  'var(--blue-800)':   'var(--blue-960)',
  'var(--olive-800)':  'var(--olive-960)',
  'var(--yellow-800)': 'var(--yellow-960)',
  'var(--mint-800)':   'var(--mint-960)',
  'var(--orange-800)': 'var(--orange-960)',
  'var(--terra-800)':  'var(--terra-960)',
}

function pickHoverColor(palette: string[], last: string | null): string {
  // Exclude the previous pick so successive hovers never repeat. With
  // 2-color palettes this collapses to a strict alternation. Falls
  // back to a random pick if filtering would empty the list (defensive).
  const available = palette.filter((c) => c !== last)
  const pool = available.length > 0 ? available : palette
  return pool[Math.floor(Math.random() * pool.length)]
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
  const palette = ROUTE_PALETTES[pathname ?? ''] ?? FALLBACK_PALETTE
  // Shared across all link cells — guarantees no two consecutive hovers
  // (even across different links) end up on the same hue.
  const lastColorRef = useRef<string | null>(null)

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
          <p className="footer__credit t-h5">{CREDIT}</p>
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
                  onMouseEnter={(e) => {
                    // Roll a fresh color from the route's palette,
                    // excluding the previous pick so we never repeat
                    // the same hue twice in a row. Set both --hover-color
                    // (read by :hover) and --active-color (read by
                    // :active for the press-down state). The two are a
                    // matched 800/960 pair: hover saturates, click
                    // presses into the matching darker step.
                    const next = pickHoverColor(palette, lastColorRef.current)
                    lastColorRef.current = next
                    const target = e.currentTarget
                    target.style.setProperty('--hover-color', next)
                    target.style.setProperty(
                      '--active-color',
                      ACTIVE_FOR_HOVER[next] ?? next,
                    )
                  }}
                  onTouchStart={(e) => {
                    // Touch never fires onMouseEnter, so without this
                    // the :active fallback would be the gray rgba — the
                    // cell would light up dim instead of in the route's
                    // hue. Roll a fresh color and stamp both vars so the
                    // tap registers in palette like a desktop click.
                    const next = pickHoverColor(palette, lastColorRef.current)
                    lastColorRef.current = next
                    const target = e.currentTarget
                    target.style.setProperty('--hover-color', next)
                    target.style.setProperty(
                      '--active-color',
                      ACTIVE_FOR_HOVER[next] ?? next,
                    )
                  }}
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
        <p className="footer__credit t-h5">{CREDIT}</p>
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
