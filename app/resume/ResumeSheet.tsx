// The authored sheet — /resume's base layer.
//
// This is the page for anyone whose browser won't display a PDF inline:
// phones (Chrome on Android has no inline PDF viewer, nor do most in-app
// browsers — LinkedIn's especially, which is the likeliest place this link
// gets tapped), desktop browsers set to download PDFs, and anyone with JS off.
//
// It is composed for that job rather than apologising for it: no "your browser
// couldn't…" line, because for most of the people who see it nothing went
// wrong — this is simply the mobile composition of the resume page. The framed
// sheet is the same material as /privacy, in a colourway of its own.

export default function ResumeSheet({ pdfHref }: { pdfHref: string }) {
  return (
    <div className="resume-sheet">
      <div className="resume-sheet__frame">
        <article className="resume-sheet__card">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="resume-sheet__mark"
            src="/icon-star-terra.svg"
            alt=""
            width={44}
            height={44}
            aria-hidden="true"
          />

          <h1 className="resume-sheet__title">Resume</h1>
          <p className="resume-sheet__standfirst">Nihar Bhagat</p>

          <div className="resume-sheet__rule" aria-hidden="true">
            <span className="resume-sheet__rule-line" />
            <span className="resume-sheet__diamond" />
            <span className="resume-sheet__rule-line" />
          </div>

          <p className="resume-sheet__lead">
            Most of my career happened because I kept going one layer deeper.
          </p>

          <a
            className="resume-sheet__action"
            href={pdfHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="resume-sheet__action-label">Open the PDF</span>
          </a>

          <p className="resume-sheet__meta t-p4">1.8 MB · opens in a new tab</p>
        </article>
      </div>
    </div>
  )
}
