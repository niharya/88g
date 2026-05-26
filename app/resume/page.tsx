import type { Metadata } from 'next'
import './resume.css'

// /resume is a thin HTML wrapper around the actual PDF file in `public/`.
// Two reasons it's a real route instead of a pure rewrite:
//   1. The PDF file has no HTML <head> and therefore no way to carry OG / Twitter
//      card metadata. Hosting the PDF inside an iframe on an HTML page lets
//      `/resume` carry full social-share metadata while the user still sees
//      the PDF chrome they expect.
//   2. The browser tab title comes from the page's <title>, not the URL. Direct
//      PDF rendering would fall back to the filename ("nihar-bhagat-resume-2025"),
//      which read as lowercase / dated. A real route gives us "Resume —
//      Nihar Bhagat" via the layout.tsx title template.
//
// The iframe takes the full viewport with zero chrome (no header, footer,
// padding) so the page reads as "the PDF" from the user's perspective. The
// `#navpanes=0&view=FitH` fragments hide Chrome's PDF sidebar and fit the
// page to viewport width — the same affordances the previous direct-PDF
// link carried, moved here.
//
// The dated PDF filename stays in `public/` so re-versioning the resume is a
// drop-in replacement: rename the file, update the iframe `src` here. No
// rewrite chain to keep in sync.

const PDF_HREF = '/nihar-bhagat-resume-2025.pdf#navpanes=0&view=FitH'

export const metadata: Metadata = {
  title: 'Resume',
  description: 'Resume of Nihar Bhagat — product, system, and brand designer. Selected work, roles, and what I look for in the next chapter.',
  alternates: { canonical: '/resume' },
  openGraph: {
    type: 'profile',
    url: 'https://nihar.works/resume',
    siteName: 'Nihar Bhagat',
    title: 'Resume — Nihar Bhagat',
    description: 'Resume of Nihar Bhagat — product, system, and brand designer.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nihar Bhagat — Resume',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Resume — Nihar Bhagat',
    description: 'Resume of Nihar Bhagat — product, system, and brand designer.',
    images: ['/og-image.png'],
  },
}

export default function ResumePage() {
  return (
    <main className="resume-page">
      <iframe
        className="resume-page__viewer"
        src={PDF_HREF}
        title="Nihar Bhagat — Resume"
        // The iframe owns the entire visible surface; the PDF viewer chrome
        // (download / print / page nav) renders inside it via the browser's
        // built-in PDF UI. No additional sandbox restrictions — the file is
        // first-party and needs to behave like a normal PDF document.
      />
      {/* Fallback for environments that block iframes or render no PDF
          plug-in (very old browsers, restricted enterprise builds). Hidden
          behind the iframe when the viewer mounts; revealed by the layout
          if the iframe fails to paint. */}
      <noscript>
        <p>
          Your browser blocked the embedded viewer.{' '}
          <a href="/nihar-bhagat-resume-2025.pdf">Open the resume PDF directly</a>.
        </p>
      </noscript>
    </main>
  )
}
