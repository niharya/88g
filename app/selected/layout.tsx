// Selected route layout — font-ready gate
// Waits for all fonts (including Material Symbols) before revealing the page.
// Falls back after 3s so a network failure never leaves a blank screen.

import type { ReactNode } from 'react'
import Script from 'next/script'
import '../components/nav/nav.css'

export default function SelectedLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Script id="selected-font-gate" strategy="afterInteractive">{`
        var done = function() { document.documentElement.classList.add('fonts-ready'); };
        var t = setTimeout(done, 3000);
        document.fonts.ready.then(function() { clearTimeout(t); done(); });
      `}</Script>
      {children}
    </>
  )
}
