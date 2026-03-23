import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plating Studio — Interactive Dish Diagram Tool',
  description:
    'Interactive plating diagram studio for professional chefs. Build, position, and annotate dish components with 3D sketch-style rendering. Export production-ready SVG plating diagrams.',
  openGraph: {
    title: 'Plating Studio — 1-CUISINESG',
    description:
      'Interactive dish diagram tool with 3D sketch rendering. Drag components, annotate, and export SVG plating diagrams for professional kitchen use.',
  },
};

export default function PlatingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
