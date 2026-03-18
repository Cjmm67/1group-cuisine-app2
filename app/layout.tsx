import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { SchemaMarkup, organizationSchema } from '@/components/seo/SchemaMarkup';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: '1-CUISINESG | Professional Culinary Platform by 1-Group Singapore',
    template: '%s | 1-CUISINESG',
  },
  description:
    'Professional culinary platform for 1-Group Singapore — recipes, chef profiles, and masterclasses from Singapore\'s leading hospitality group. Featuring venues: 1-Altitude, Kaarla, Oumi, MONTI, Sol & Luna, UNA, Fire Restaurant, FLNT, and Camille.',
  keywords: [
    '1-Group Singapore',
    'Singapore restaurant group',
    'fine dining Singapore',
    'rooftop bar Singapore',
    '1-Altitude',
    'Kaarla restaurant',
    'Oumi omakase',
    'MONTI Italian Singapore',
    'Sol & Luna',
    'UNA Spanish Singapore',
    'Fire Restaurant Singapore',
    'FLNT Nikkei',
    'Camille French bistro',
    'Singapore chef',
    'culinary platform Singapore',
    'Japanese omakase Singapore CBD',
    'modern Australian Singapore',
    'wedding venue Singapore',
    'corporate dinner venue Singapore',
    'Raffles Place restaurant',
    'CapitaSpring dining',
  ],
  authors: [{ name: '1-Group Singapore', url: 'https://www.1-group.sg' }],
  creator: '1-Group Singapore',
  publisher: '1-Group Singapore',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_SG',
    url: 'https://1-groupculinary.com',
    siteName: '1-CUISINESG',
    title: '1-CUISINESG | Professional Culinary Platform by 1-Group Singapore',
    description:
      'Recipes, chef profiles, and culinary content from Singapore\'s leading hospitality group — 1-Group. Featuring 1-Altitude, Kaarla, Oumi, MONTI, and 20+ venues.',
  },
  twitter: {
    card: 'summary_large_image',
    title: '1-CUISINESG | Professional Culinary Platform by 1-Group Singapore',
    description:
      'Recipes and chef profiles from Singapore\'s leading hospitality group. 1-Altitude, Kaarla, Oumi, MONTI, and more.',
  },
  alternates: {
    canonical: 'https://1-groupculinary.com',
  },
  category: 'Food & Drink',
  other: {
    'geo.region': 'SG',
    'geo.placename': 'Singapore',
    'geo.position': '1.2839;103.8515',
    ICBM: '1.2839, 103.8515',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <head>
        <SchemaMarkup data={organizationSchema} />
      </head>
      <body className="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
