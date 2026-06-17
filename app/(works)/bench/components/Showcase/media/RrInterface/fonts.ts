import { Gluten, Playpen_Sans } from 'next/font/google'

/* Two foreign families for the Rug Rumble scene — its design language is
   its own, not the portfolio's. Both load via next/font/google: woff2 is
   downloaded at build time and served from the local Next.js asset path,
   so no runtime request to fonts.googleapis.com. Variable mode keeps the
   CSS surface to two custom properties on the scene wrapper. */

export const gluten = Gluten({
  subsets: ['latin'],
  weight: ['600'],
  display: 'swap',
  variable: '--font-rr-gluten',
})

export const playpen = Playpen_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-rr-playpen',
})
