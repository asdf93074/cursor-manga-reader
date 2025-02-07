import { type NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'uploads.mangadex.org',
        pathname: '/covers/**',
      },
      {
        protocol: 'https',
        hostname: '**.mangadex.network',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**.mangadex.org',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
