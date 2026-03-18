'use client';

import React from 'react';
import { ChefProfile } from '@/components/chef/ChefProfile';
import { SchemaMarkup, buildChefSchema } from '@/components/seo/SchemaMarkup';
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

  const chefSchema = buildChefSchema({
    name: chef.name,
    bio: chef.bio,
    avatar: chef.avatar,
    restaurant: chef.restaurant,
    cuisine: chef.cuisine,
    accolades: chef.accolades,
  });

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10">
      <SchemaMarkup data={chefSchema} />
      <ChefProfile chef={chef} />
    </div>
  );
}
