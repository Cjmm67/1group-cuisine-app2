import type { Metadata } from 'next';
import { DM_Sans } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const dmSans = DM_Sans({
  subsets: ['latin'],
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: '1-Group Cuisine | Professional Culinary Platform',
  description: 'Professional culinary platform for Singapore\'s 1-Group hospitality portfolio.',
  keywords: ['culinary', 'recipes', 'chefs', 'Singapore', 'professional cooking'],
  authors: [{ name: '1-Group Cuisine' }],
  viewport: 'width=device-width, initial-scale=1',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={dmSans.className}>
      <body className="bg-white text-gray-900 antialiased min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
