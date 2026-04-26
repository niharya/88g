import type { Metadata } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import './globals.css'

// Font loading strategy
// ─────────────────────
// `display: 'swap'` everywhere — show fallback immediately, swap to the real
// face when it arrives. Never `'block'` (3s of invisible text on slow mobile)
// and never a JS font-gate (held the whole surface at opacity 0; banned in
// docs/performance.md).
//
// `fallback` arrays preserve the system fallback chain that previously lived
// in globals.css `:root`. globals.css must NOT redeclare these variables —
// next/font sets them on <html> with a hashed family name; redeclaring with
// a literal name (e.g. `'Fraunces'`) detaches CSS from the @font-face rules
// next/font generates, and the woff2 files silently never apply.
const fraunces = localFont({
  src: [
    { path: './fonts/Fraunces-normal.woff2', style: 'normal' },
    { path: './fonts/Fraunces-italic.woff2', style: 'italic' },
  ],
  variable: '--font-display',
  display: 'swap',
  fallback: ['serif'],
  preload: true,
})

const googleSans = localFont({
  src: [
    { path: './fonts/GoogleSans-normal.woff2', style: 'normal' },
    { path: './fonts/GoogleSans-italic.woff2', style: 'italic' },
  ],
  variable: '--font-body',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
})

// Google Sans Flex — variable font with wdth/wght/GRAD/ROND/opsz axes.
// Required by .t-h5 (wght 640, wdth 120, GRAD 64, ROND 0, opsz 18) and
// .t-btn1 (wght 720, …) — those font-variation-settings only resolve
// against this file. Source: Google Fonts, slnt axis pinned to 0,
// Latin subset, ~628 KB.
const googleSansFlex = localFont({
  src: './fonts/GoogleSansFlex-variable.woff2',
  variable: '--font-ui',
  display: 'swap',
  fallback: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
  preload: true,
})

const googleSansCode = localFont({
  src: [
    { path: './fonts/GoogleSansCode-normal.woff2', style: 'normal' },
    { path: './fonts/GoogleSansCode-italic.woff2', style: 'italic' },
  ],
  variable: '--font-mono',
  display: 'swap',
  fallback: ['ui-monospace', 'SF Mono', 'Cascadia Mono', 'Segoe UI Mono', 'Menlo', 'Monaco', 'Consolas', 'monospace'],
  preload: false,
})

// Material Symbols: 1.18 MB even subsetted. `swap` so icons briefly show as
// ligature text on slow mobile rather than blank space — visually noisier
// for ~1s but never invisible. Long-term plan: migrate to inline SVG icons
// to remove the icon-font failure mode entirely.
const materialSymbols = localFont({
  src: './fonts/MaterialSymbolsRounded-normal.woff2',
  variable: '--font-symbols',
  display: 'swap',
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
        {/* Bounded font gate — restored in v0.59 after v0.58's pure `swap`
            strategy was deemed too generous to FOUT. Holds top-level page
            surfaces (.landing, .workbench, .route-marks) at opacity 0
            until either `document.fonts.ready` resolves OR an 800 ms cap
            fires — whichever first. The .page-boot startooth below is
            sibling to those surfaces so it remains visible during the
            hold. The cap is the filter that lets us skip waiting on the
            1.18 MB Material Symbols on slow connections — typography
            fonts almost always finish within 800 ms; MS keeps loading
            after release and ligature glyphs swap in when ready.
            Banned predecessor: the 3-second uncapped gate. Do not raise
            the cap past ~1000 ms — past 1 s users start to wonder. */}
        <Script id="font-gate" strategy="beforeInteractive">{`
          (function () {
            var done = false;
            var release = function () {
              if (done) return;
              done = true;
              document.documentElement.classList.add('fonts-ready');
            };
            var cap = setTimeout(release, 800);
            if (document.fonts && document.fonts.ready) {
              document.fonts.ready.then(function () {
                clearTimeout(cap);
                release();
              });
            } else {
              clearTimeout(cap);
              release();
            }
          })();
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
      </head>
      <body>
        {/* Patience mark — centered startooth shown during the font-gate
            hold. Fades in ~200 ms after mount (so fast loads never flash
            it) and fades out when `.fonts-ready` lands on <html>. Kept
            inline so each route can recolor via CSS vars
            (--startooth-stroke / --startooth-fill — see globals.css →
            "Page boot"). */}
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
