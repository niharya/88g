'use client'

// Decides whether /resume shows the browser's PDF viewer or the authored sheet.
//
// Two mechanisms, deliberately layered — the first is the guarantee, the second
// is the safety net:
//
//   1. THE PHONE GATE (JS, deterministic). Chrome on Android has no inline PDF
//      viewer at all, and neither do most in-app browsers. Phones are given the
//      sheet by composition rather than an embed that paints nothing. Mirrors
//      the gate /biconomy's Demos uses for its Figma embed: the `null` first
//      paint must never drop the embed, so the check is `=== true`, not
//      `isMobile ?? …`. SSR renders the embed; only a confirmed phone removes it.
//
//   2. <object> FALLBACK (native, no JS). Everything inside <object> renders
//      only if the browser cannot display the resource. The browser makes that
//      call itself, which is the whole point — we tried deciding it in JS first
//      and it cannot be done reliably. A browser that downloads PDFs rather
//      than displaying them still reports the frame's document as
//      `application/pdf` while rendering an entirely empty body, so there is
//      nothing trustworthy to detect. <object> sidesteps the question.
//
// Together: no configuration reaches a blank page. With JS off, mechanism 2
// still covers it — which is why the embed, not the sheet, is what SSR emits.

import { useEffect, useState } from 'react'

// The site-standard mobile gate, landscape-phone clause included
// (docs/responsive.md). Keep in lock-step with the breakpoint in resume.css.
const MOBILE_MQ = '(max-width: 767px), (max-height: 500px)'

export default function ResumeViewer({
  src,
  pdfHref,
  children,
}: {
  src: string
  pdfHref: string
  children: React.ReactNode
}) {
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const mq = window.matchMedia(MOBILE_MQ)
    const sync = () => setIsMobile(mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])

  // Confirmed phone — the sheet is the page, with no embed above it.
  if (isMobile === true) return <>{children}</>

  return (
    <object className="resume-page__viewer" type="application/pdf" data={src} aria-label="Nihar — Resume">
      {/* Rendered by the browser only when it cannot display the PDF. */}
      {children}
      {/* Kept out of the layout but present for assistive tech and crawlers,
          which read <object> fallback content regardless of what paints. */}
      <a className="resume-page__plain-link" href={pdfHref}>
        Open the resume PDF
      </a>
    </object>
  )
}
