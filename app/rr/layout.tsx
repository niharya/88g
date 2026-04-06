// Rug Rumble route layout — font-ready gate + RR-specific fonts
// Waits for all fonts (including Material Symbols + RR web fonts) before
// revealing the page. Falls back after 3s so a network failure never blocks.

import type { ReactNode } from 'react'
import Script from 'next/script'
import '../components/nav/nav.css'
import './rr.css'

export default function RRLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <head>
        {/* Playpen Sans — playful body text */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Playpen+Sans:wght@400..800&display=swap"
        />
        {/* Londrina Solid — display / heading */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Londrina+Solid&display=swap"
        />
        {/* Gluten — accent weight */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Gluten:wght@400;600&display=swap"
        />
      </head>
      <Script id="rr-font-gate" strategy="afterInteractive">{`
        var done = function() { document.documentElement.classList.add('fonts-ready'); };
        var t = setTimeout(done, 3000);
        document.fonts.ready.then(function() { clearTimeout(t); done(); });
      `}</Script>
      {children}
    </>
  )
}
