import type { MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  const base = 'https://nihar.works'
  const lastModified = new Date()
  return [
    { url: `${base}/`, lastModified, changeFrequency: 'monthly', priority: 1.0 },
    { url: `${base}/selected`, lastModified, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${base}/biconomy`, lastModified, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${base}/rr`, lastModified, changeFrequency: 'yearly', priority: 0.8 },
    { url: `${base}/marks`, lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${base}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.3 },
  ]
}
