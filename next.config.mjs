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
}
export default nextConfig
