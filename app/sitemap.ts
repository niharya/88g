import type { MetadataRoute } from 'next'
import lastmod from './lib/lastmod.json'

// Each URL's lastModified is the date its CONTENT last changed, read from
// app/lib/lastmod.json. That file is written by `npm run lastmod`
// (scripts/generate-lastmod.mjs) during /release and committed, because the
// Netlify build may run on a shallow clone where `git log` can't see history.
// A route missing from the file ships with no lastmod rather than a made-up
// one: a date that is always "now" teaches crawlers to ignore the field.
// changefreq / priority are deliberately absent — Google ignores both.

const BASE = 'https://nihar.works'
const ROUTES = ['/', '/all', '/biconomy', '/rr', '/marks', '/shape-of-product', '/resume', '/privacy']

const dates: Record<string, string> = lastmod

export default function sitemap(): MetadataRoute.Sitemap {
  return ROUTES.map((route) => ({
    url: route === '/' ? `${BASE}/` : `${BASE}${route}`,
    ...(dates[route] ? { lastModified: dates[route] } : {}),
  }))
}
