import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import './globals.css'

const fraunces = localFont({
  src: [
    { path: './fonts/Fraunces-normal.woff2', style: 'normal' },
    { path: './fonts/Fraunces-italic.woff2', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'block',
  preload: true,
})

const googleSans = localFont({
  src: [
    { path: './fonts/GoogleSans-normal.woff2', style: 'normal' },
    { path: './fonts/GoogleSans-italic.woff2', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'block',
  preload: true,
})

const googleSansFlex = localFont({
  src: [
    { path: './fonts/GoogleSans-normal.woff2', style: 'normal' },
    { path: './fonts/GoogleSans-italic.woff2', style: 'italic' },
  ],
  variable: '--font-ui',
  display: 'block',
  preload: true,
})

const googleSansCode = localFont({
  src: [
    { path: './fonts/GoogleSansCode-normal.woff2', style: 'normal' },
    { path: './fonts/GoogleSansCode-italic.woff2', style: 'italic' },
  ],
  variable: '--font-mono',
  display: 'block',
  preload: false,
})

const materialSymbols = localFont({
  src: './fonts/MaterialSymbolsRounded-normal.woff2',
  variable: '--font-symbols',
  display: 'block',
  weight: '100 700',
  preload: false,
})

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
    <html lang="en" className={`${fraunces.variable} ${googleSans.variable} ${googleSansFlex.variable} ${googleSansCode.variable} ${materialSymbols.variable}`} suppressHydrationWarning>
      <head>
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
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}
