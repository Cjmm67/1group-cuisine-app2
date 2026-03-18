'use client';

import React from 'react';
import { RecipeDetail } from '@/components/recipe/RecipeDetail';
import { MOCK_RECIPES } from '@/lib/mockData';
import { notFound } from 'next/navigation';

interface RecipeDetailPageProps {
  params: {
    slug: string;
  };
}

export default function RecipeDetailPage({ params }: RecipeDetailPageProps) {
  const recipe = MOCK_RECIPES.find(
    (r) => r.title.toLowerCase().replace(/\s+/g, '-') === params.slug.toLowerCase()
  );

  if (!recipe) {
    notFound();
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-6">
      <div className="space-y-4">
        <RecipeDetail recipe={recipe} />
      </div>

      {/* Related Recipes Section */}
      <div className="mt-12 pt-12 border-t border-gray-200">
        <h2 className="text-2xl font-bold text-gray-900 tracking-tight mb-6">
          More from {recipe.chef.name}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {recipe.chef.recipes
            .filter((r) => r.id !== recipe.id)
            .slice(0, 4)
            .map((r) => (
              <div
                key={r.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <h3 className="font-semibold text-gray-900">{r.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{r.description}</p>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}
