import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/' }],
    sitemap: 'https://nihar.works/sitemap.xml',
    host: 'https://nihar.works',
  }
}
