import type { Metadata } from 'next'
import Script from 'next/script'
import './globals.css'

// Site metadata
// ─────────────
// metadataBase resolves relative URLs for OG/Twitter tags. Keep aligned with
// the live domain. Child routes set their own `title` (template fills in the
// suffix) and can override `description` / `openGraph` where they differ.
// Favicon + OG assets live in /public (favicon.ico, favicon.svg,
// apple-touch-icon.png, og-image.png).
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
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
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
        {/* Material Symbols Rounded — nav icons */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block"
        />
      </head>
      <body>{children}</body>
    </html>
  )
}
