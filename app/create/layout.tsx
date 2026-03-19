import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Creative Studio — AI Dish Development for Chefs',
  description:
    'AI-powered creative studio for 1-Group chefs. Develop dishes, explore flavour pairings, design menus, adapt recipes, get plating feedback, and run culinary R&D — powered by Claude.',
  openGraph: {
    title: 'Creative Studio — 1-CUISINESG',
    description:
      'AI creative partner for professional chefs. Dish building, flavour exploration, menu architecture, and culinary R&D.',
  },
};

export default function CreateLayout({ children }: { children: React.ReactNode }) {
  return children;
}
