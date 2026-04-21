import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

// Site metadata
// ─────────────
// metadataBase resolves relative URLs for OG/Twitter tags. Keep aligned with
// the live domain. Child routes set their own `title` (template fills in the
// suffix) and can override `description` / `openGraph` where they differ.
// Favicon: startooth parts (star = top 8-pointer, tooth = bottom rhombus)
// in three token colors (blue/olive/terra @720). Six static SVGs in /public.
// Inline script below coin-flips to one combination per hard reload.
// Apple icon is the file-convention app/apple-icon.tsx (sticky — iOS home
// screen doesn't re-roll). OG image lives in /public/og-image.png.
export const metadata: Metadata = {
  metadataBase: new URL('https://nihar.works'),
  title: {
    default: 'Nihar Bhagat',
    template: '%s — Nihar Bhagat',
  },
  description: 'Interventioner of systems, interfaces',
  applicationName: 'Nihar Bhagat',
  authors: [{ name: 'Nihar Bhagat', url: 'https://nihar.works' }],
  creator: 'Nihar Bhagat',
  keywords: ['Nihar Bhagat', 'product design', 'system design', 'brand design', 'portfolio', 'design'],
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [{ url: '/icon-star-blue.svg', type: 'image/svg+xml' }],
  },
  openGraph: {
    type: 'website',
    url: 'https://nihar.works',
    siteName: 'Nihar Bhagat',
    title: 'Nihar Bhagat',
    description: 'Interventioner of systems, interfaces',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nihar Bhagat — Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nihar Bhagat',
    description: 'Interventioner of systems, interfaces',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Font gate — add .fonts-ready to <html> once web fonts load so
            gated surfaces (.workbench, .landing) don't flash fallback glyphs.
            3s timeout keeps pages usable if fonts stall. */}
        <Script id="font-gate" strategy="afterInteractive">{`
          var done = function() { document.documentElement.classList.add('fonts-ready'); };
          var t = setTimeout(done, 3000);
          if (document.fonts && document.fonts.ready) {
            document.fonts.ready.then(function() { clearTimeout(t); done(); });
          }
        `}</Script>
        {/* Favicon swap — uniform pick across six startooth variants on each
            hard reload: star or tooth, in blue/olive/terra @720. SSR ships
            star-blue as default; script may swap to any of the six. */}
        <Script id="favicon-swap" strategy="afterInteractive">{`
          var shapes = ['star', 'tooth'];
          var tones = ['blue', 'olive', 'terra'];
          var shape = shapes[Math.floor(Math.random() * shapes.length)];
          var tone = tones[Math.floor(Math.random() * tones.length)];
          var link = document.querySelector('link[rel="icon"][type="image/svg+xml"]');
          if (link) link.href = '/icon-' + shape + '-' + tone + '.svg';
        `}</Script>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Fraunces — display serif */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght,SOFT,WONK@0,9..144,100..900,0..100,0..1;1,9..144,100..900,0..100,0..1&display=swap"
        />
        {/* Google Sans + Google Sans Flex — body and UI */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wdth,wght,GRAD,ROND@6..144,25..151,1..1000,0..100,0..100&family=Google+Sans:ital,opsz,wght,GRAD@0,17..18,400..700,-50..200;1,17..18,400..700,-50..200&display=swap"
        />
        {/* Google Sans Code — site-wide monospace (Monostamp, year labels, archive meta) */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Google+Sans+Code:ital,wght,MONO@0,300..800,1;1,300..800,1&display=swap"
        />
        {/* Material Symbols Rounded — nav icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body>
        {/* Patience mark — centered startooth shown during font-gate hold.
            Fades in ~200ms after mount; fades out when .fonts-ready lands
            on <html>. Inlined so each route can recolor via CSS vars
            (--startooth-stroke / --startooth-fill). See globals.css →
            "Page boot". */}
        <div className="page-boot" aria-hidden="true">
          <svg
            className="page-boot__mark"
            width="83"
            height="143"
            viewBox="0 0 83 143"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="startooth__diamond"
              d="M31.5 31.5L41.5 1.5L51.5 31.5L81.5 41.5L51.5 51.5L41.5 101.5L31.5 51.5L1.5 41.5L31.5 31.5Z"
              strokeWidth="3"
              strokeLinejoin="round"
            />
            <path
              className="startooth__base"
              d="M1.5 121.5L41.5 101.5L81.5 121.5L41.5 141.5L1.5 121.5Z"
              strokeWidth="3"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        {children}
      </body>
    </html>
  )
}
