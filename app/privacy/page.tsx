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
  title: 'Privacy · Nothing Weird Here',
  description: 'Pretty standard privacy stuff.',
  alternates: { canonical: '/privacy' },
}

export default function PrivacyPage() {
  return (
    <main className="legal">
      <article className="legal__inner">
        <header className="legal__head">
          <h1 className="legal__title t-h2">Privacy</h1>
          <p className="legal__sub t-p4">Last updated June 2026</p>
        </header>

        <section className="legal__body t-p2">
          <p>
            nihar.works is a personal portfolio. It does not place advertising,
            set tracking cookies, or share visitor information with anyone. It
            does use a privacy-first, cookieless analytics service (<a href="https://umami.is/" target="_blank" rel="noopener noreferrer">Umami</a>)
            to see anonymous, aggregate patterns — how many people visit, which
            pages they read, and where they arrived from. No cookies are set,
            you are never identified, and the analytics service stores nothing
            on your device.
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
            The site keeps a little state in your browser. Short-lived session
            flags remember how you moved between pages — so transitions animate
            the right way, and the back link on this page returns you to where
            you came from — and they clear when you close the tab. A couple of
            small local flags remember interface state on one project page (the
            Rug Rumble case study) — for instance, that you&rsquo;ve already
            seen a panel — so it isn&rsquo;t replayed on a return visit. All of
            this stays on your device, is never sent anywhere, and none of it is
            a cookie.
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
