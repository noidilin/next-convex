import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  reactCompiler: true,
  images: {
    remotePatterns: [
      { hostname: 'images.unsplash.com', protocol: 'https', port: '' },
      {
        hostname: 'scrupulous-wildcat-425.convex.cloud',
        protocol: 'https',
        port: '',
      },
      {
        hostname: 'adept-raccoon-714.convex.cloud',
        protocol: 'https',
        port: '',
      },
    ],
  },
}

export default nextConfig
