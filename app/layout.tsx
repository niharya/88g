import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
import localFont from 'next/font/local'
import './globals.css'
import './components/CrossShellVeil/cross-shell-veil.css'
import { StartoothLoader } from './components/StartoothLoader'

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

// Google Sans Flex — variable font with opsz/wdth/wght/GRAD/ROND axes.
// Required by .t-h5 (wght 640, wdth 120, GRAD 64, ROND 0, opsz 18) and
// .t-btn1 (wght 720, …) — those font-variation-settings only resolve
// against this file. Source: Google Fonts, Latin subset. Axis RANGES are
// partial-instanced down to what the CSS actually uses (opsz 18–24, wdth
// 50–140, wght 300–900, GRAD 0–80, ROND 0–100) — 643 KB → 261 KB with no
// visual change, so it loads inside the page-gate window even on Slow 3G
// (the old 643 KB couldn't, and the page arrived with the wide font snapping
// in late). Re-instance from the git-original if you need an axis value
// outside these ranges — see docs/performance.md → "Material Symbols icons"
// neighbour, "UI font".
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

// Material Symbols — subset to ONLY the 13 ligatures actually used
// (add, arrow_forward/back/downward, arrow_drop_down, keyboard_arrow_up/down,
// title, category, info, article, emergency_home, close), built via pyftsubset
// with layout-closure disabled so the ligature set doesn't drag in the full
// 3,200-icon library.
// Result: 4 KB (was 1.18 MB). Because it's tiny AND `preload: true`, it loads
// well inside the font gate's window — so icons are ready at reveal and never
// flash as raw ligature text. The FILL + wght axes survive the subset (FILL
// drives the .nav-marker--project.is-info-open fill; wght the icon weight).
// To re-subset after adding an icon, see docs/performance.md → "Material
// Symbols icons" (resolve by glyph name, closure OFF — it's ligature-only).
const materialSymbols = localFont({
  src: './fonts/MaterialSymbolsRounded-subset.woff2',
  variable: '--font-symbols',
  display: 'swap',
  weight: '100 700',
  preload: true,
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
// Theme color matches --workbench-bg in globals.css — the warm off-white
// page surface. Mobile browser chrome (iOS Safari, Android Chrome) tints
// the URL bar with this so the device shell visually merges into the page.
//
// viewportFit: 'cover' lets content fill the whole screen behind the iOS
// status bar / home-indicator safe areas (default 'auto' insets the viewport,
// leaving the page background showing in those bands as black on the landing).
// The landing's full-bleed canvas needs this to reach the true edges; interior
// pages are light + scrollable so cover reads seamlessly. Any element hugging a
// screen edge should guard with env(safe-area-inset-*) — /marks already does
// (top/right/bottom); the landing's only edge element is the decorative bottom
// caption (CaptionTag), which is harmless if it tucks slightly low.
export const viewport: Viewport = {
  themeColor: '#f2f3ef',
  viewportFit: 'cover',
}

export const metadata: Metadata = {
  metadataBase: new URL('https://nihar.works'),
  title: {
    default: 'Nihar, Advanced Designer, Basic Conversationalist',
    template: '%s · Nihar',
  },
  description: 'Started with graphic design and somehow ended up deep in developer tooling and infrastructure systems.',
  applicationName: 'Nihar',
  authors: [{ name: 'Nihar', url: 'https://nihar.works' }],
  creator: 'Nihar',
  keywords: ['Nihar', 'product design', 'system design', 'brand design', 'portfolio', 'design'],
  alternates: {
    canonical: '/',
  },
  // SVG icon is the primary — the favicon-swap script below rerolls
  // its href to one of six startooth combinations on each hard reload.
  // The PNG / .ico entries are fallbacks for legacy browsers and OSes
  // that don't follow the SVG (older Safari, Windows pinned tiles).
  icons: {
    icon: [
      { url: '/icon-star-blue.svg', type: 'image/svg+xml' },
      { url: '/icon-32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icon-16.png', sizes: '16x16', type: 'image/png' },
    ],
    shortcut: ['/favicon.ico'],
    apple: [{ url: '/apple-icon', sizes: '180x180' }],
    other: [
      { rel: 'icon', url: '/android-chrome-192.png', sizes: '192x192', type: 'image/png' },
      { rel: 'icon', url: '/android-chrome-512.png', sizes: '512x512', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    url: 'https://nihar.works',
    siteName: 'Nihar',
    title: 'This wasn’t the original plan.',
    description: 'UI and interaction design. Studio-building and creative direction. Developer tooling, tech infrastructure, growth experiments.',
    locale: 'en_US',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Nihar — Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Nihar, Screens, Teams, Infrastructure',
    description: 'Got into design because of curiosity and stayed because I like making complicated things feel clear.',
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
        {/* Page gate — holds every page surface behind the .page-boot loader
            until the page is actually ready, then reveals. Lands `.fonts-ready`
            on <html> when BOTH `window.load` (above-the-fold images +
            subresources) AND `document.fonts.ready` (fonts, incl. the icon
            subset) have settled — or an 8000 ms cap, the failsafe ceiling so a
            stalled asset can't trap the page forever. globals.css consumes the
            class to fade the surfaces in and the loader out.

            Why hold-until-ready and not the old 1000 ms font-only cap: on a
            throttled cold load the short cap revealed a half-loaded page and
            you watched elements pop in. The animated loader makes a longer hold
            read as "loading," which is the whole point of having one — so we
            gate the full payload, not just fonts. The 8 s ceiling is the only
            hard limit (was 1.5 s). The matching CSS failsafe lives in globals
            (`page-gate-failsafe` at 8000 ms) so the gate still releases if this
            script never runs. (`fonts-ready` is a legacy class name — it now
            means "page ready.") Note: render-blocking CSS already blocks first
            paint until the bundle loads, so the loader can't paint *earlier*
            than that without async-loading the CSS — this gate governs how long
            it HOLDS, which is the part that was broken.

            Vanilla <script dangerouslySetInnerHTML>, NOT <Script
            beforeInteractive>: in App Router the latter is queued through
            self.__next_s and runs late; a vanilla inline script registers its
            load/fonts listeners during HTML parse, which is what we need. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){var d=false;var done=function(){if(d)return;d=true;document.documentElement.classList.add('fonts-ready');};var cap=setTimeout(done,8000);var loaded=document.readyState==='complete';var fonts=!(document.fonts&&document.fonts.ready);var go=function(){if(loaded&&fonts){clearTimeout(cap);done();}};if(!loaded){window.addEventListener('load',function(){loaded=true;go();});}if(document.fonts&&document.fonts.ready){document.fonts.ready.then(function(){fonts=true;go();});}go();})();`,
          }}
        />
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
        {/* Skip-to-content — visually hidden until focused. Lets keyboard
            users jump past the favicon swap script and land on #content
            (the wrapper around route children). Styled in globals.css. */}
        <a className="skip-link" href="#content">Skip to content</a>
        {/* Patience mark — the Startooth loader shown while the page gate
            holds. Fades in ~120 ms after mount (so fast loads barely flash it)
            and fades out when `.fonts-ready` lands on <html>. A server
            component so it paints in the initial HTML, before hydration.
            Structure + per-route colour + movement come from globals.css
            (--loader-* + the movement preset), so no props are passed here. */}
        <div className="page-boot" aria-hidden="true">
          <StartoothLoader size={150} />
        </div>
        <div id="content">{children}</div>
      </body>
    </html>
  )
}
