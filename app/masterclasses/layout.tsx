import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '1-Cheflix — Chef Video Library | World\'s 50 Best Chefs | 1-Group Singapore',
  description:
    '1-Cheflix video library featuring 20 chefs from The World\'s 50 Best Restaurants — Massimo Bottura, René Redzepi, Gaggan Anand, Clare Smyth, Heston Blumenthal, Dominique Crenn, and more. Curated by 1-Group Singapore for culinary professionals and enthusiasts.',
  keywords: [
    '1-Cheflix',
    'chef videos',
    'World 50 Best chefs',
    'Massimo Bottura video',
    'René Redzepi video',
    'Gaggan Anand video',
    'Clare Smyth video',
    'Heston Blumenthal video',
    'culinary masterclass',
    'chef masterclass Singapore',
    '1-Group Singapore',
  ],
  openGraph: {
    title: '1-Cheflix — Chef Video Library by 1-Group Singapore',
    description:
      'Video content from 20 chefs recognised by The World\'s 50 Best Restaurants. Curated by 1-Group Singapore.',
    url: 'https://1-groupculinary.com/masterclasses',
    type: 'website',
  },
  alternates: {
    canonical: 'https://1-groupculinary.com/masterclasses',
  },
};

export default function MasterclassesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
