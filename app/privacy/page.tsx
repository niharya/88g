import type { Metadata } from 'next'
import PrivacyBackLink from './components/PrivacyBackLink'
// nav CSS must be imported here so the NavMarker renders correctly:
// `.nav-icon { font-family: var(--font-symbols) }` lives in nav.css and
// without it the icon ligature "arrow_back" prints as raw text in the
// body font (no glyph). The (works) routes get this for free via the
// route-group layout; /privacy doesn't.
import '../components/nav/nav.css'
import '../components/NavMarker/navmarker.css'
import './privacy.css'

export const metadata: Metadata = {
  title: 'Privacy',
  description: 'How nihar.works handles the small amount of data it touches.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="legal">
      <article className="legal__inner">
        <header className="legal__head">
          <h1 className="legal__title t-h2">Privacy</h1>
          <p className="legal__sub t-p4">Last updated April 2026</p>
        </header>

        <section className="legal__body t-p2">
          <p>
            nihar.works is a personal portfolio. It does not run analytics,
            does not place advertising, does not set tracking cookies, and
            does not share any visitor information with third parties.
          </p>
          <p>
            The only feature that collects data is the contact form on the
            home page. When you send a note, the form delivers your name,
            email, the purpose tags you selected, and the message you wrote
            directly to my inbox via{' '}
            <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer">EmailJS</a>.
            Your details are not stored anywhere else, are not added to any
            mailing list, and are only used to reply to you.
          </p>
          <p>
            The &ldquo;Book a call&rdquo; link opens a Google Calendar appointment page
            on calendar.app.google. Anything you fill in there is handled by
            Google&rsquo;s own privacy policy.
          </p>
          <p>
            The site uses a single short-lived browser session flag to
            remember which way you arrived at a page, so animations transition
            smoothly. It is cleared when you close the tab. No other browser
            storage, no cookies.
          </p>
          <p>
            If you ever want a copy of the contact-form message you sent me
            removed from my inbox, email me and I will delete it.
          </p>
        </section>

        <footer className="legal__foot">
          <PrivacyBackLink />
        </footer>
      </article>
    </main>
  )
}
