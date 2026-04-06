'use client'

// BIPs — port of original BIPs.js
// Source-locked: preserves DOM structure, grid overlap layout, iframe + notes rail.
// iframeActive: reveal overlay; cardOpen: notes rail slide.

import { useState } from 'react'

// ArrowBackIcon (same SVG as in Flows, inlined here for module independence)
function ArrowBackIcon({ className }: { className?: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={className} aria-hidden="true">
      <mask id="bips-arrow-back-mask" style={{ maskType: 'alpha' }} maskUnits="userSpaceOnUse" x="0" y="0" width="20" height="20">
        <rect width="20" height="20" transform="matrix(-1 -8.74228e-08 -8.74228e-08 1 20 1.74846e-06)" fill="white" />
      </mask>
      <g mask="url(#bips-arrow-back-mask)">
        <path d="M10.4167 16.6666L4.16675 9.99992L10.4167 3.33325" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.58325 10L15.8333 10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </g>
    </svg>
  )
}

export default function BIPs() {
  const [iframeActive, setIframeActive] = useState(false)
  const [cardOpen, setCardOpen] = useState(false)

  return (
    <section id="bips" className="bips">

      {/* ── Header card — col 2–3, row 1, z-10 ───────────────────────────── */}
      <div className="bips__card-col">
        <div className="bips__card-outer surface">
          <div className="bips__card-inner">
            <div className="bips__card-text">
              <h2 className="bips__h2 t-h2">
                Everyone on the team had real good ideas about our culture, process, and products so I started keeping a list.
              </h2>
              <p className="t-p4 bips__subtitle">
                This would go on to become<br />
                <span className="t-h5">Biconomy Improvement Proposals</span>
              </p>
            </div>
            <hr className="bips__divider" />
            <div className="bips__aside">
              <p className="t-p4 bips__aside-text">
                Six months later, during an internal tech-debt cleanup, I proposed a way to build these ideas out.
                <br /><br />
                So then, that simple checklist evolved into a small workflow on Notion.
              </p>
            </div>
            <div className="bips__card-footer">
              <p className="t-p4 bips__footer-text">
                <span className="bips__footer-row1">
                  <span className="t-h5">Each idea moved</span>
                  <span className="bips__footer-rule" aria-hidden="true" />
                </span>
                <span className="bips__footer-row2">
                  <span>from an insight</span>
                  <span>to a proposal with legs</span>
                  <span>to a mock project.</span>
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats overlay — col 1–4, row 1, self-end ─────────────────────── */}
      <div className="bips__stats-row">
        <p className="bips__stats t-highlight1">
          <span className="bips__stats-left">Seven ideas surfaced</span>
          <span className="bips__stats-right">Three shipped</span>
        </p>
      </div>

      {/* ── Notion + notes rail — col 1–4, row 2 ────────────────────────── */}
      <div className="bips__notion-section">
        <h3 className="bips__notion-label t-h5">Copy of the Notion</h3>

        <div className="bips__notion-wrap">

          {/* Iframe + reveal overlay */}
          <div className={`bips__iframe-col${cardOpen ? ' is-open' : ''}`}>
            <button
              type="button"
              onClick={() => setIframeActive(a => !a)}
              className={`bips__reveal-btn${iframeActive ? ' is-active' : ''}`}
              aria-label="View Notion embed"
            >
              Reveal
            </button>
            <iframe
              src="https://niharbhagat.notion.site/ebd//1ea45eee125c80699ec1ed584440207d"
              title="Biconomy Improvement Proposals — Notion workspace"
              width="100%"
              height="600"
              className="bips__iframe"
              allowFullScreen
            />
          </div>

          {/* Notes rail — same olive pattern as Flows */}
          <div className={`bips__notes-rail${cardOpen ? ' is-open' : ''}`}>
            <button
              className="bips__notes-tab"
              onClick={() => setCardOpen(o => !o)}
              type="button"
              aria-label={cardOpen ? 'Close design notes' : 'Open design notes'}
            >
              <span className="bips__notes-tab-inner t-h5">
                <ArrowBackIcon className={`bips__notes-arrow${cardOpen ? '' : ' is-flipped'}`} />
                Design of the workflow
              </span>
            </button>

            <div className="bips__notes-content">
              <p className="t-p3">
                The workflow was built around BIP #24001, a fully documented reference proposal
              </p>
              <ul className="bips__notes-list t-p4">
                <li>
                  <p className="t-p4">
                    <span className="t-h5">1. Know your idea</span><br />
                    Contributors were first given a framework to clarify their idea by helping them with essential details required to strengthen it.
                  </p>
                </li>
                <li>
                  <p className="t-p4">
                    <span className="t-h5">2. Present</span><br />
                    The doc structure then shifted into a presentation order, so every proposal could be read and evaluated in a consistent way.
                  </p>
                </li>
                <li>
                  <p className="t-p4">
                    <span className="t-h5">3. Evaluate</span><br />
                    The final section captured stakeholder impressions, concerns, and suggested next steps.
                  </p>
                </li>
              </ul>
              <hr className="bips__notes-divider" />
              <p className="t-p4">
                Taken together, the workflow gave people a clear starting point, a shared structure, and a single place for feedback.
                <br /><br />
                By following it, they could move an idea from insight to a real project.
              </p>
            </div>
          </div>

        </div>

        <p className="bips__footnote t-p4">
          I had great support from the then PM (Nikola ♡) who introduced it to his devs. Then growth and marketing teams gave it a shot.
        </p>
      </div>

    </section>
  )
}
