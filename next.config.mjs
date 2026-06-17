/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    // Allowed quality values for the next/image optimizer. Next 15 silently
    // clamps any `quality` prop not listed here back into the allowed set,
    // so the values <Img> reaches for (90 for lossy source, 100 for
    // lossless / near-lossless source) must be explicitly enumerated. 75
    // stays in for consumers that opt down (thumbnails, etc.).
    qualities: [75, 90, 100],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // The works hub moved from /selected to /bench (the "Work Essay" redesign).
  // Old inbound links + the prior og:canonical keep resolving via a permanent
  // redirect.
  async redirects() {
    return [
      { source: '/selected', destination: '/bench', permanent: true },
    ]
  },
  // Pretty, shareable aliases for the bench's two browse modes. Each resolves
  // to the single bench surface with the view preset — the morph stays one
  // continuous in-page interaction (the address bar shows ?view= after a
  // client-side tab switch; these aliases are the entry/share URLs).
  async rewrites() {
    return [
      { source: '/cases',    destination: '/bench?view=cases' },
      { source: '/showcase', destination: '/bench?view=showcase' },
    ]
  },
}
export default nextConfig
