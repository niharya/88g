import { Pinyon_Script } from 'next/font/google'

// Pinyon Script — the decorative invitation script, used ONLY on the bench
// essay (the "Product / Designer" watermark + the script closing line).
//
// Scoped exception to the portfolio's next/font/local rule, mirroring the
// Rr-interface scene's route-local Google fonts (see that folder's fonts.ts):
// next/font/google downloads the woff2 at build time and serves it from the
// local Next asset path — no runtime fetch to fonts.googleapis.com, so the
// external-link ban isn't violated. The `--font-pinyon` variable is applied
// only on the `.bench-workbench` subtree; do NOT promote it to globals.css —
// it is ornament, never reading text.
export const pinyon = Pinyon_Script({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-pinyon',
  display: 'swap',
  fallback: ['cursive'],
})
