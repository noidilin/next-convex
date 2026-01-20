import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com', protocol: 'https', port: '' },
    ],
  },
}

export default nextConfig
