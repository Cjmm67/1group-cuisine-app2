/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'osteriafrancescana.it',
      },
      {
        protocol: 'https',
        hostname: 'thebestchefawards.com',
      },
      {
        protocol: 'https',
        hostname: 'gaggan.com',
      },
      {
        protocol: 'https',
        hostname: 'corebyclaresmyth.com',
      },
      {
        protocol: 'https',
        hostname: 'odetterestaurant.com',
      },
      {
        protocol: 'https',
        hostname: 'thomaskeller.com',
      },
      {
        protocol: 'https',
        hostname: 'www.theworlds50best.com',
      },
    ],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

module.exports = nextConfig;
