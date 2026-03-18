import type { Metadata } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '1-Group Cuisine | Professional Culinary Platform',
  description: 'Professional culinary platform for Singapore\'s 1-Group hospitality portfolio. Discover recipes, chefs, masterclasses, and more.',
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
    <html lang="en" className={`${inter.variable} ${playfair.variable}`}>
      <body className="bg-white text-charcoal-800">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <div className="flex flex-1">
            <Sidebar />
            <main className="flex-1 sm:ml-64 p-4 sm:p-6 lg:p-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
