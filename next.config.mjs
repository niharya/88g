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
  // The works hub moved from /selected to /all (the "Work Essay" redesign;
  // "bench" remains the internal codename). Old inbound links + the prior
  // og:canonical keep resolving via a permanent redirect.
  async redirects() {
    return [
      { source: '/selected', destination: '/all', permanent: true },
    ]
  },
  // Pretty, shareable aliases for the hub's two browse modes. Each rewrites to
  // the single /all surface; the active tab is resolved CLIENT-side from the
  // browser URL (the rewrite hides its destination query from the client, but
  // the pathname stays visible — see /all's "Deep-link entry & tab order"
  // anomaly). No server searchParams read: that would make /all dynamic. The
  // address bar keeps the pretty alias (rewrites don't change the URL).
  async rewrites() {
    return [
      { source: '/cases',    destination: '/all?cases' },
      { source: '/showcase', destination: '/all?showcase' },
    ]
  },
}
export default nextConfig
