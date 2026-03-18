import type { Metadata } from 'next';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import './globals.css';

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
    <html lang="en">
      <body className="bg-white text-gray-900 antialiased">
        <div className="min-h-screen flex flex-col">
          <Navbar />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
        </div>
      </body>
    </html>
  );
}
