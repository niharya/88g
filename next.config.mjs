/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    optimizePackageImports: ['framer-motion'],
  },
  // Pretty-URL alias for the resume PDF. `/resume` rewrites to the actual
  // file in `public/` so the footer link reads as `nihar.works/resume` while
  // the asset on disk keeps its dated, versionable filename. Internal
  // rewrite (not redirect) so the URL bar stays at `/resume`.
  async rewrites() {
    return [
      { source: '/resume', destination: '/nihar-bhagat-resume-2025.pdf' },
    ]
  },
}
export default nextConfig
