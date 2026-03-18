'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Input } from '@/components/ui/Input';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { ChefCard } from '@/components/chef/ChefCard';
import { MasterclassCard } from '@/components/masterclass/MasterclassCard';
import { Badge } from '@/components/ui/Badge';
import { MOCK_RECIPES, MOCK_CHEFS, MOCK_MASTERCLASSES } from '@/lib/mockData';
import { Search } from 'lucide-react';

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [selectedType, setSelectedType] = useState<'all' | 'recipes' | 'chefs' | 'masterclasses'>('all');

  const results = useMemo(() => {
    if (!query) return { recipes: [], chefs: [], masterclasses: [] };

    const lowerQuery = query.toLowerCase();

    const recipes = MOCK_RECIPES.filter(
      (r) =>
        r.title.toLowerCase().includes(lowerQuery) ||
        r.description.toLowerCase().includes(lowerQuery) ||
        r.chef.name.toLowerCase().includes(lowerQuery)
    );

    const chefs = MOCK_CHEFS.filter(
      (c) =>
        c.name.toLowerCase().includes(lowerQuery) ||
        c.bio.toLowerCase().includes(lowerQuery) ||
        c.specialties.some((s) => s.toLowerCase().includes(lowerQuery))
    );

    const masterclasses = MOCK_MASTERCLASSES.filter(
      (mc) =>
        mc.title.toLowerCase().includes(lowerQuery) ||
        mc.description.toLowerCase().includes(lowerQuery) ||
        mc.chef.name.toLowerCase().includes(lowerQuery)
    );

    return { recipes, chefs, masterclasses };
  }, [query]);

  const totalResults = results.recipes.length + results.chefs.length + results.masterclasses.length;

  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight mb-4">
          Search
        </h1>
        <div className="max-w-2xl">
          <Input
            icon={<Search size={18} />}
            placeholder="Search recipes, chefs, masterclasses..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            autoFocus
          />
        </div>
      </div>

      {query && (
        <>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <p className="text-sm text-gray-500">
              Found <span className="font-semibold">{totalResults}</span> results for "{query}"
            </p>
          </div>

          {/* Type Filters */}
          <div className="flex flex-wrap gap-2">
            {['all', 'recipes', 'chefs', 'masterclasses'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type as any)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-gold-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
                {type !== 'all' && (
                  <span className="ml-2">
                    (
                    {type === 'recipes'
                      ? results.recipes.length
                      : type === 'chefs'
                      ? results.chefs.length
                      : results.masterclasses.length}
                    )
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Recipes */}
          {(selectedType === 'all' || selectedType === 'recipes') && results.recipes.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Recipes ({results.recipes.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {results.recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} />
                ))}
              </div>
            </section>
          )}

          {/* Chefs */}
          {(selectedType === 'all' || selectedType === 'chefs') && results.chefs.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-2xl font-bold text-gray-900">
                Chefs ({results.chefs.length})
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {results.chefs.map((chef) => (
                  <ChefCard key={chef.id} chef={chef} />
                ))}
              </div>
            </section>
          )}

          {/* Masterclasses */}
          {(selectedType === 'all' || selectedType === 'masterclasses') &&
            results.masterclasses.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">
                  Masterclasses ({results.masterclasses.length})
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {results.masterclasses.map((masterclass) => (
                    <MasterclassCard key={masterclass.id} masterclass={masterclass} />
                  ))}
                </div>
              </section>
            )}

          {totalResults === 0 && (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-lg text-gray-500 mb-4">
                No results found for "{query}"
              </p>
              <p className="text-gray-400">Try different keywords or browse our categories</p>
            </div>
          )}
        </>
      )}

      {!query && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg text-gray-500 mb-4">
            Enter a search term to get started
          </p>
          <p className="text-gray-400 mb-6">
            Search for recipes, chefs, masterclasses, and more
          </p>

          <div className="space-y-4 mt-8 text-left max-w-md mx-auto">
            <div>
              <p className="font-semibold text-gray-900 mb-2">Popular Searches</p>
              <div className="flex flex-wrap gap-2">
                {['Risotto', 'Massimo Bottura', 'French Cuisine', 'Sustainable Cooking'].map((term) => (
                  <button
                    key={term}
                    onClick={() => setQuery(term)}
                    className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-sm hover:bg-gray-200 transition-colors"
                  >
                    {term}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
