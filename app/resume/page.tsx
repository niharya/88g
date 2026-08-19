import type { Metadata } from 'next'
import ResumeViewer from './ResumeViewer'
import ResumeSheet from './ResumeSheet'
import './resume.css'

// /resume is a real HTML route wrapped around the actual PDF file in `public/`.
// Two reasons it's a route instead of a pure rewrite:
//   1. The PDF file has no HTML <head> and therefore no way to carry OG /
//      Twitter card metadata. Owning an HTML page lets `/resume` carry full
//      social-share metadata while the visitor still sees the PDF.
//   2. The browser tab title comes from the page's <title>, not the URL. Direct
//      PDF rendering would fall back to the filename ("nihar-bhagat-resume-2025"),
//      which read as lowercase / dated. A real route gives us "Resume —
//      Nihar" via the layout.tsx title template.
//
// The route has two possible faces, and <ResumeViewer> picks between them:
// the browser's own PDF viewer where one exists, and the authored sheet
// (ResumeSheet.tsx) everywhere else — phones, browsers set to download PDFs,
// JS off. See ResumeViewer.tsx for how that decision is made and why it is not
// made in JavaScript.
//
// It used to be the frame alone, with a <noscript> block nominally covering the
// gap. That was wrong twice over: <noscript> keys off scripting, not off
// whether the frame painted, so it never fired for the case it named — and a
// frame the browser refuses or declines to render leaves nothing but empty
// space. The sheet replaces it; there is no path to a blank page now.
//
// The dated PDF filename stays in `public/` so re-versioning the resume is a
// drop-in replacement: rename the file, update PDF_FILE here. No rewrite chain
// to keep in sync.

const PDF_FILE = '/nihar-bhagat-resume-2025.pdf'
// `#navpanes=0&view=FitH` hides the PDF sidebar and fits the page to the frame
// width. Fragments are viewer hints only — harmless where unsupported.
const PDF_EMBED = `${PDF_FILE}#navpanes=0&view=FitH`

export const metadata: Metadata = {
  title: 'Resume · Interfaces To Infrastructure',
  description: 'Most of my career happened because I kept going one layer deeper.',
  alternates: { canonical: '/resume' },
  openGraph: {
    type: 'profile',
    url: 'https://nihar.works/resume',
    siteName: 'Nihar',
    title: 'Went pretty far behind the curtain.',
    description: 'Started with interfaces. Ended up deep in systems work.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nihar — Resume',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Went pretty far behind the curtain.',
    description: 'Started with interfaces. Ended up deep in systems work.',
    images: ['/og-image.png'],
  },
}

export default function ResumePage() {
  return (
    <main className="resume-page">
      <ResumeViewer src={PDF_EMBED} pdfHref={PDF_FILE}>
        <ResumeSheet pdfHref={PDF_FILE} />
      </ResumeViewer>
    </main>
  )
}
