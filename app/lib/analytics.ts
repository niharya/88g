// Custom-event tracking for Umami.
// ─────────────────────────────────
// Umami auto-tracks page views and visit duration; this is the single
// sanctioned path for discrete interaction events ("where they clicked"). It
// no-ops safely whenever the tracker is absent — the loader (app/Analytics.tsx)
// is opt-out-gated and pinned to the production host via `data-domains`, so on
// localhost, Netlify deploy-previews, and for opted-out visitors `window.umami`
// is undefined or inert. Callers never need to guard.
//
// Aggregate + anonymous only: payloads stay low-cardinality (slugs, enums) and
// carry nothing that identifies a person. The vocabulary is centralised here so
// the whole event set stays legible in one place. See docs/analytics-prd.md.

type UmamiTrack = (
  event: string,
  data?: Record<string, string | number | boolean>,
) => void

function track(
  event: string,
  data?: Record<string, string | number | boolean>,
): void {
  if (typeof window === 'undefined') return
  const umami = (window as unknown as { umami?: { track?: UmamiTrack } }).umami
  try {
    umami?.track?.(event, data)
  } catch {
    /* analytics is never load-bearing */
  }
}

export const analytics = {
  /** Hub browse-mode morph — an in-page change, so no page view can capture it. */
  browseMode: (mode: 'showcase' | 'cases') => track('browse-mode', { mode }),

  /** An in-page showcase tile opened. (Full case studies are routes → page views.) */
  workOpened: (piece: string) => track('work-opened', { piece }),

  /** Contact note sent successfully, broken down by the purpose tag(s) chosen. */
  contactSubmitted: (purpose: string) =>
    track('contact-submitted', purpose ? { purpose } : undefined),

  /** "Book a call" CTA activated. */
  bookCallClicked: () => track('book-call-clicked'),

  /** Reader reached the final section of a case study (read-to-the-end). */
  caseCompleted: (project: string) => track('case-completed', { project }),

  /** A hidden easter egg was discovered (e.g. the landing's void rupture). */
  easterEggFound: (egg: string) => track('easter-egg', { egg }),
}
