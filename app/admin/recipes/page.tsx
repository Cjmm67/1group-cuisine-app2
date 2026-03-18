'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { MOCK_CHEFS, MOCK_RECIPES } from '@/lib/mockData';
import { ChefHat, Plus, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { slugify } from '@/lib/utils';

export default function AdminRecipesPage() {
  const { user } = useAuth();
  const [selectedChef, setSelectedChef] = useState<string | null>(null);

  // Group recipes by chef
  const chefs = MOCK_CHEFS.map((chef) => ({
    ...chef,
    recipeCount: MOCK_RECIPES.filter((r) => r.chef.id === chef.id).length,
  }));

  const selectedChefData = selectedChef
    ? MOCK_CHEFS.find((c) => c.id === selectedChef)
    : null;

  const selectedChefRecipes = selectedChef
    ? MOCK_RECIPES.filter((r) => r.chef.id === selectedChef)
    : [];

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Recipe Management</h1>
        <p className="text-gray-500">Select a chef to view and manage their recipes.</p>
      </div>

      {/* Chef selector */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {chefs.map((chef) => (
          <button
            key={chef.id}
            onClick={() => setSelectedChef(chef.id)}
            className={`p-4 rounded-xl border-2 text-left transition-all ${
              selectedChef === chef.id
                ? 'border-gold-500 bg-gold-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
            }`}
          >
            <div className="flex items-center gap-3 mb-2">
              {chef.avatar ? (
                <img
                  src={chef.avatar}
                  alt={chef.name}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                  <ChefHat size={18} className="text-gray-400" />
                </div>
              )}
            </div>
            <p className="text-sm font-semibold text-gray-900 line-clamp-1">{chef.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">{chef.recipeCount} recipes</p>
          </button>
        ))}
      </div>

      {/* Selected chef recipes */}
      {selectedChefData && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {selectedChefData.name}&apos;s Recipes
              </h2>
              <Badge variant="primary">{selectedChefRecipes.length} recipes</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {selectedChefRecipes.length === 0 ? (
              <p className="text-sm text-gray-500 py-4 text-center">No recipes yet for this chef.</p>
            ) : (
              <div className="divide-y divide-gray-100">
                {selectedChefRecipes.map((recipe) => (
                  <div key={recipe.id} className="flex items-center justify-between py-3">
                    <div className="flex items-center gap-3">
                      {recipe.image && (
                        <img
                          src={recipe.image}
                          alt={recipe.title}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      )}
                      <div>
                        <p className="text-sm font-medium text-gray-900">{recipe.title}</p>
                        <p className="text-xs text-gray-500">
                          {recipe.restaurant || selectedChefData.restaurant || '1-Group'}
                          {' · '}
                          {recipe.cuisines?.map((c) => c.name).join(', ')}
                        </p>
                      </div>
                    </div>
                    <Link
                      href={`/recipes/${slugify(recipe.title)}`}
                      className="flex items-center gap-1 text-xs text-gold-600 hover:text-gold-700 font-medium"
                    >
                      View <ExternalLink size={12} />
                    </Link>
                  </div>
                ))}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-500 flex items-center gap-2">
                <Plus size={16} className="text-gold-500" />
                To add new recipes, contact the platform administrator or submit via the recipe
                contribution form.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {!selectedChef && (
        <div className="text-center py-12 text-gray-400">
          <ChefHat size={48} className="mx-auto mb-4 opacity-50" />
          <p>Select a chef above to manage their recipes</p>
        </div>
      )}
    </div>
  );
}
