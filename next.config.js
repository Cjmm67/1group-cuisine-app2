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
        hostname: 'img.youtube.com',
      },
      {
        protocol: 'https',
        hostname: 'images.getbento.com',
      },
      {
        protocol: 'https',
        hostname: 'www.joseavillez.pt',
      },
      {
        protocol: 'https',
        hostname: 'www.nikoromito.com',
      },
      {
        hostname: 'reportergourmet.com',
      },
      {
        protocol: 'https',
        hostname: 'www.restauranteelkano.com',
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
        hostname: 'www.ducasse-paris.com',
      },
      {
        protocol: 'https',
        hostname: 'www.theworlds50best.com',
      },
      {
        protocol: 'https',
        hostname: 'images.squarespace-cdn.com',
      },
      {
        protocol: 'https',
        hostname: 'www.oumi.sg',
      },
      {
        protocol: 'https',
        hostname: 'firerestaurant.sg',
      },
      {
        protocol: 'https',
        hostname: 'www.monti.sg',
      },
      {
        protocol: 'https',
        hostname: 'www.robbreport.com.sg',
      },
      {
        protocol: 'https',
        hostname: 'www.luxurysocietyasia.com',
      },
      {
        protocol: 'https',
        hostname: 'ieatishootipost.sg',
      },
      {
        protocol: 'https',
        hostname: 'citynomads.com',
      },
      {
        protocol: 'https',
        hostname: 'robbreport.com.sg',
      },
      {
        protocol: 'https',
        hostname: '1-atico.sg',
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
