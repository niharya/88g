import { Fragment } from 'react'
import type { Metadata } from 'next'
import PrivacyReturn from './components/PrivacyReturn'
// nav CSS must be imported here so the top "return" NavMarker renders: nav.css
// owns the `.nav-marker` base + the `.nav-icon { font-family: var(--font-symbols) }`
// that turns the "arrow_back" ligature into a glyph, navmarker.css owns its
// modifiers. The (works) routes get these via the route-group layout; /privacy
// doesn't, so it imports them directly.
import '../components/nav/nav.css'
import '../components/NavMarker/navmarker.css'
import './privacy.css'

export const metadata: Metadata = {
  title: 'Privacy · Nothing Weird Here',
  description: 'Pretty standard privacy stuff.',
  alternates: { canonical: '/privacy' },
}

// Single source for the two dated marks (footer colophon + filed stamp).
const LAST_UPDATED = 'June 2026'

// Removal contact — also surfaced in the Article V coupon button.
const REMOVAL_EMAIL = 'commissions@niharbhagat.com'

export default function PrivacyPage() {
  return (
    <main className="privacy">
      {/* Top utility row — the "+Nihar" back-marker borrowed from /all
          (No. 001 series mark intentionally omitted). */}
      <div className="privacy__utility">
        <PrivacyReturn variant="marker" />
      </div>

      <div className="privacy__frame">
        <div className="privacy__sheet">
          {/* ── Masthead ──────────────────────────────────────────── */}
          <header className="privacy__masthead">
            <svg
              className="privacy__crest"
              width="168"
              height="118"
              viewBox="0 0 220 155"
              aria-hidden="true"
            >
              <defs>
                <path id="privacy-crest-arc" d="M30,118 A80,80 0 0 1 190,118" fill="none" />
              </defs>
              <image href="/icon-star-terra.svg" x="76" y="72" width="68" height="68" />
              <text
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '15px',
                  fontVariationSettings: "'wdth' 120, 'wght' 720, 'opsz' 18",
                  letterSpacing: '4px',
                  fill: 'currentColor',
                }}
              >
                <textPath href="#privacy-crest-arc" startOffset="50%" textAnchor="middle">
                  NIHAR&#160;&#183;&#160;WORKS
                </textPath>
              </text>
            </svg>

            <h1 className="privacy__title">Privacy</h1>
            <span className="privacy__subtitle">On the Handling of Visitor Information</span>
          </header>

          {/* Grand rule */}
          <div className="privacy__rule privacy__rule--grand">
            <span className="privacy__rule-line" />
            <span className="privacy__diamond" />
            <span className="privacy__diamond privacy__diamond--hollow" />
            <span className="privacy__diamond" />
            <span className="privacy__rule-line" />
          </div>

          <p className="privacy__lead">
            nihar.works is a personal portfolio. It does not place advertising, set tracking
            cookies, or share visitor information with anyone.
          </p>

          <Divider />

          {/* ── Article I — Analytics ─────────────────────────────── */}
          <section className="privacy__article">
            <ArticleHead numeral="I" title="Analytics" source="↗ umami.is" />
            <p className="privacy__desc">
              <span className="privacy__dropcap">I</span>t does use a privacy-first, cookieless
              analytics service (
              <a className="privacy__link" href="https://umami.is/" target="_blank" rel="noopener noreferrer">
                Umami
              </a>
              ) to see anonymous, aggregate patterns.
            </p>

            <div className="privacy__card privacy__card--600">
              <div className="privacy__card-band">Recorded by Umami</div>
              <div className="privacy__card-cols">
                <div className="privacy__ledger-col privacy__ledger-col--ruled">
                  <div className="privacy__ledger-head privacy__ledger-head--count">What it counts</div>
                  <LedgerRow label="Visitors" tag="Yes" />
                  <LedgerRow label="Pages read" tag="Yes" />
                  <LedgerRow label="Referrer" tag="Yes" />
                </div>
                <div className="privacy__ledger-col">
                  <div className="privacy__ledger-head privacy__ledger-head--never">What it never does</div>
                  <LedgerRow label="Cookies" tag="None" soft />
                  <LedgerRow label="Your identity" tag="Never" soft />
                  <LedgerRow label="Device storage" tag="None" soft />
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── Article II — The Contact Form ─────────────────────── */}
          <section className="privacy__article">
            <ArticleHead numeral="II" title="The Contact Form" source="↗ emailjs.com" />
            <p className="privacy__desc">
              <span className="privacy__dropcap">T</span>he only feature that collects data is the
              contact form on the home page. When you send a note, it goes straight to my inbox.
            </p>

            <div className="privacy__card privacy__card--540">
              <div className="privacy__card-band">What your note carries</div>
              <div className="privacy__card-cols">
                <Field label="Your name" value="as you typed it" ruledR ruledB />
                <Field label="Email" value="to reply to you" ruledB />
                <Field label="Purpose tags" value="the ones you picked" ruledR />
                <Field label="Your message" value="in full" />
              </div>
              <div className="privacy__card-band privacy__card-band--foot">
                &rarr;&#160;Straight to my inbox, via{' '}
                <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer">
                  EmailJS
                </a>
              </div>
            </div>

            <FactStrip facts={['Not stored elsewhere', 'No mailing list', 'Only to reply']} />
          </section>

          <Divider />

          {/* ── Article III — Booking a Call ──────────────────────── */}
          <section className="privacy__article">
            <ArticleHead numeral="III" title="Booking a Call" source="↗ google.com" />
            <p className="privacy__desc">
              <span className="privacy__dropcap">T</span>he &ldquo;Book a call&rdquo; link opens a
              Google Calendar appointment page on calendar.app.google. Anything you fill in there is
              handled by Google&rsquo;s own privacy policy.
            </p>

            <div className="privacy__card privacy__card--540">
              <div className="privacy__card-band">The hand-off</div>
              <div className="privacy__card-cols">
                <div className="privacy__field privacy__field--ruled-r">
                  <div className="privacy__field-label">Opens</div>
                  <div className="privacy__field-value--mono-ink">calendar.app.google</div>
                </div>
                <div className="privacy__field">
                  <div className="privacy__field-label">Governed by</div>
                  <div className="privacy__field-value--body">
                    <a
                      className="privacy__link"
                      href="https://policies.google.com/privacy"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Google&rsquo;s privacy policy
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── Article IV — What Your Browser Keeps ──────────────── */}
          <section className="privacy__article">
            <ArticleHead numeral="IV" title="What Your Browser Keeps" source="kept on-device" />
            <p className="privacy__desc">
              <span className="privacy__dropcap">T</span>he site keeps a little state in your
              browser. Short-lived session flags remember how you moved between pages — so
              transitions animate the right way and the back link returns you where you came from. A
              couple of small local flags remember interface state on one project page, so it
              isn&rsquo;t replayed on a return visit. All of it is small, and gone the moment it is
              not needed.
            </p>

            <div className="privacy__twin">
              <div className="privacy__card">
                <div className="privacy__card-band">Session flags</div>
                <StateRow label="Remember" value="Page transitions & the back link" ruled />
                <StateRow label="Cleared" value="When you close the tab" />
              </div>
              <div className="privacy__card">
                <div className="privacy__card-band">Local flags</div>
                <StateRow label="Remember" value="A panel you’ve already seen" ruled />
                <StateRow label="Scope" value="One project page (Rug Rumble)" />
              </div>
            </div>

            <FactStrip facts={['Stays on device', 'Never sent', 'Not a cookie']} />
          </section>

          <Divider />

          {/* ── Article V — The Right of Removal ──────────────────── */}
          <section className="privacy__article">
            <ArticleHead numeral="V" title="The Right of Removal" source="↗ niharbhagat.com" />

            <div className="privacy__coupon">
              <p className="privacy__coupon-text">
                If you ever want a copy of the contact-form message you sent me removed from my
                inbox, email me and I will delete it.
              </p>
              <a className="privacy__coupon-btn" href={`mailto:${REMOVAL_EMAIL}`}>
                Write to me <span aria-hidden="true">&rarr;</span>
              </a>
              <div className="privacy__seal">
                <img className="privacy__seal-mark" src="/icon-star-terra.svg" alt="" aria-hidden="true" />
              </div>
            </div>
          </section>

          {/* ── Footer ────────────────────────────────────────────── */}
          <div className="privacy__footer-rule" />
          <div className="privacy__colophon">
            <span className="privacy__colophon-mark">Nihar&middot;Works</span>
            <span className="privacy__colophon-meta">Privacy Notice &middot; {LAST_UPDATED}</span>
          </div>

          <div className="privacy__stamp" aria-hidden="true">
            Filed &middot; {LAST_UPDATED}
          </div>
        </div>
      </div>

      <PrivacyReturn variant="block" />
    </main>
  )
}

/* ── Local presentational helpers ──────────────────────────────────────── */

function Divider() {
  return (
    <div className="privacy__rule">
      <span className="privacy__rule-line" />
      <span className="privacy__diamond privacy__diamond--md" />
      <span className="privacy__rule-line" />
    </div>
  )
}

function ArticleHead({ numeral, title, source }: { numeral: string; title: string; source: string }) {
  return (
    <div className="privacy__article-head">
      <span className="privacy__eyebrow">
        <span className="privacy__diamond" />
        Article {numeral}
        <span className="privacy__diamond" />
      </span>
      <h2 className="privacy__article-title">{title}</h2>
      <span className="privacy__margin privacy__margin--left" aria-hidden="true">
        &sect; {numeral}
      </span>
      <span className="privacy__margin privacy__margin--right" aria-hidden="true">
        {source}
      </span>
    </div>
  )
}

function LedgerRow({ label, tag, soft }: { label: string; tag: string; soft?: boolean }) {
  return (
    <div className={`privacy__ledger-row${soft ? ' privacy__ledger-row--soft' : ''}`}>
      <span className="privacy__ledger-key">{label}</span>
      <span className={`privacy__ledger-tag${soft ? '' : ' privacy__ledger-tag--yes'}`}>{tag}</span>
    </div>
  )
}

function Field({
  label,
  value,
  ruledR,
  ruledB,
}: {
  label: string
  value: string
  ruledR?: boolean
  ruledB?: boolean
}) {
  const cls = [
    'privacy__field',
    ruledR ? 'privacy__field--ruled-r' : '',
    ruledB ? 'privacy__field--ruled-b' : '',
  ]
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cls}>
      <div className="privacy__field-label">{label}</div>
      <div className="privacy__field-value">{value}</div>
    </div>
  )
}

function StateRow({ label, value, ruled }: { label: string; value: string; ruled?: boolean }) {
  return (
    <div className={`privacy__state-row${ruled ? ' privacy__state-row--ruled' : ''}`}>
      <div className="privacy__state-label">{label}</div>
      <div className="privacy__state-value">{value}</div>
    </div>
  )
}

function FactStrip({ facts }: { facts: string[] }) {
  return (
    <div className="privacy__facts">
      {facts.map((fact, i) => (
        <Fragment key={fact}>
          <span className="privacy__fact">{fact}</span>
          {i < facts.length - 1 && <span className="privacy__diamond privacy__diamond--sm" />}
        </Fragment>
      ))}
    </div>
  )
}
