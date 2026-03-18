'use client';

import React from 'react';
import { ChefProfile } from '@/components/chef/ChefProfile';
import { MOCK_CHEFS } from '@/lib/mockData';
import { notFound } from 'next/navigation';

interface ChefDetailPageProps {
  params: {
    slug: string;
  };
}

export default function ChefDetailPage({ params }: ChefDetailPageProps) {
  const chef = MOCK_CHEFS.find(
    (c) => c.name.toLowerCase().replace(/\s+/g, '-') === params.slug.toLowerCase()
  );

  if (!chef) {
    notFound();
  }

  return <div className="container-page py-10"><ChefProfile chef={chef} /></div>;
}
