import type { Metadata } from 'next'
import NavMarker from '../components/NavMarker'
import '../privacy/privacy.css'

// /now page — personal status page in the spirit of nownownow.com. A short,
// honest list of what's in active focus. Updated occasionally; date stamped.
//
// The copy below is a starting draft based on the project's stated stage
// (portfolio in finishing mode, system-design lens). Edit freely — none of
// this is mechanically derived. The "Last updated" line is hand-set, not
// auto-generated, so a stale date is a signal to revisit the list.

export const metadata: Metadata = {
  title: 'Now',
  description: 'What I’m focused on right now — a small list, kept current.',
  alternates: { canonical: '/now' },
}

export default function NowPage() {
  return (
    <main className="legal">
      <article className="legal__inner">
        <header className="legal__head">
          <h1 className="legal__title t-h2">Now</h1>
          <p className="legal__sub t-p4">Last updated April 2026</p>
        </header>

        <section className="legal__body t-p2">
          <p>
            A short, honest list of what has my attention. Inspired by{' '}
            <a href="https://nownownow.com/about" target="_blank" rel="noopener noreferrer">Derek Sivers&rsquo; /now movement</a>.
          </p>

          <ul className="legal__list">
            <li className="legal__list-item">
              <span className="legal__list-marker t-p4">— Practice</span>
              Bringing this portfolio across the finish line so the work can
              speak for itself, then turning toward the next set of design
              interventions.
            </li>
            <li className="legal__list-item">
              <span className="legal__list-marker t-p4">— Curiosity</span>
              Game design as a system-design discipline — what the rules,
              feedback loops, and pacing of a good board game teach about
              software interfaces.
            </li>
            <li className="legal__list-item">
              <span className="legal__list-marker t-p4">— Open to</span>
              Collaborations where the brief is a system that needs rethinking,
              not a screen that needs decorating. Send a note from the home
              page if that sounds like your problem.
            </li>
          </ul>
        </section>

        <footer className="legal__foot">
          <NavMarker
            as="a"
            href="/"
            role="project"
            tone="terra"
            icon="arrow_back"
            label="Home"
          />
        </footer>
      </article>
    </main>
  )
}
