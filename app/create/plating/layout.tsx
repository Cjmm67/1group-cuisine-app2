import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plating Studio — Interactive Sketch Diagrams',
  description: 'Create professional overhead plating diagrams with organic hand-drawn shapes, interactive hover highlights, colour toggle, and annotation labels.',
};

export default function PlatingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
