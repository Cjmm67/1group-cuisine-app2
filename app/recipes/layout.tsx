import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Recipes — 1-Group Singapore Chefs | Fine Dining Recipes from 1-Altitude, Kaarla, Oumi, MONTI',
  description:
    'Authentic recipes from 1-Group Singapore\'s award-winning chefs — featuring dishes from Kaarla (modern Australian), Oumi (Japanese omakase), MONTI (Italian), UNA (Spanish), Fire Restaurant (Argentine), and FLNT (Nikkei). Professional techniques from Singapore\'s leading hospitality group.',
  keywords: [
    'Singapore restaurant recipes',
    '1-Group chef recipes',
    'Kaarla recipes',
    'Oumi recipes',
    'MONTI recipes',
    'fine dining recipes Singapore',
    'professional chef recipes',
    'modern Australian recipes',
    'Japanese omakase recipes',
    'Italian restaurant recipes Singapore',
  ],
  openGraph: {
    title: 'Recipes from 1-Group Singapore Chefs',
    description:
      'Authentic recipes from Singapore\'s leading hospitality group — 1-Group. Featuring dishes from Kaarla, Oumi, MONTI, UNA, Fire Restaurant, and FLNT.',
    url: 'https://1-groupculinary.com/recipes',
    type: 'website',
  },
  alternates: {
    canonical: 'https://1-groupculinary.com/recipes',
  },
};

export default function RecipesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
