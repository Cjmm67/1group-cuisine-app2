import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Plating Studio — AI Sketch Generator for Chefs',
  description:
    'AI-powered plating diagram studio. Describe a dish and receive a bespoke hand-drawn SVG sketch with watercolour wash shading, cross-hatching, and professional annotation labels.',
  openGraph: {
    title: 'Plating Studio — 1-CUISINESG',
    description: 'Describe any dish. Get a bespoke AI-generated plating diagram in professional charcoal sketch style.',
  },
};

export default function PlatingLayout({ children }: { children: React.ReactNode }) {
  return children;
}
