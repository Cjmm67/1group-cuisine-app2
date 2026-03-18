import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chefs — 1-Group Singapore Culinary Team & International Guest Chefs',
  description:
    'Meet the chefs behind 1-Group Singapore\'s 24 venues — including Felix Chong (MONTI, Culinary Associate Director), Lamley Chua (Oumi & FLNT, Executive Chef), Tom Kung (UNA, Executive Chef), Soledad Nardelli (Fire Restaurant), and Diego Grimbery (UNA). Plus international guest chefs from the World\'s 50 Best Restaurants.',
  keywords: [
    '1-Group Singapore chefs',
    'Singapore restaurant chefs',
    'Felix Chong chef MONTI',
    'Lamley Chua Oumi chef',
    'Tom Kung UNA chef',
    'Soledad Nardelli Fire Restaurant',
    'Diego Grimbery UNA',
    'Singapore fine dining chefs',
    'World 50 Best chefs',
    'Michelin star chefs Singapore',
  ],
  openGraph: {
    title: 'Chefs — 1-Group Singapore Culinary Team',
    description:
      'Meet the award-winning chefs behind Singapore\'s leading hospitality group — 1-Group. From MONTI to Oumi, UNA to Fire Restaurant.',
    url: 'https://1-groupculinary.com/chefs',
    type: 'website',
  },
  alternates: {
    canonical: 'https://1-groupculinary.com/chefs',
  },
};

export default function ChefsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
