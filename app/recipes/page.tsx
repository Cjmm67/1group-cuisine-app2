'use client';

import React, { useState, useMemo } from 'react';
import { RecipeFilters } from '@/components/recipe/RecipeFilters';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { Button } from '@/components/ui/Button';
import { DEFAULT_FOOD_COST_RANGE, DIFFICULTY_LEVELS } from '@/lib/constants';
import { filterRecipes, sortRecipes } from '@/lib/utils';
import { MOCK_RECIPES } from '@/lib/mockData';
import { FilterState, Recipe } from '@/types/index';
import { Grid2x2, List } from 'lucide-react';

export default function RecipesPage() {
  const [filters, setFilters] = useState<FilterState>({
    cuisines: [],
    techniques: [],
    stations: [],
    ingredients: [],
    allergens: [],
    chefAccolades: [],
    menuContext: [],
    sustainability: { lowCarbon: false, seasonal: false, zeroWaste: false },
    foodCostRange: DEFAULT_FOOD_COST_RANGE,
    difficulty: [],
    searchQuery: '',
  });

  const [sortBy, setSortBy] = useState<'rating' | 'recent' | 'trending' | 'difficulty'>('rating');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filteredRecipes = useMemo(() => {
    let results = filterRecipes(MOCK_RECIPES, filters);
    results = sortRecipes(results, sortBy);
    return results;
  }, [filters, sortBy]);

  const activeFilterCount = [
    filters.cuisines.length,
    filters.techniques.length,
    filters.stations.length,
    filters.ingredients.length,
    filters.allergens.length,
    filters.menuContext.length,
    Object.values(filters.sustainability).filter(Boolean).length,
    filters.difficulty.length,
  ].reduce((a, b) => a + b, 0);

  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight mb-2">
          Recipe Collection
        </h1>
        <p className="text-lg text-gray-500">
          Explore {MOCK_RECIPES.length} recipes with advanced filtering
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Sidebar Filters */}
        <div className="w-full lg:w-64 flex-shrink-0">
          <RecipeFilters filters={filters} onFiltersChange={setFilters} />
        </div>

        {/* Results */}
        <div className="flex-1">
          {/* Controls */}
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="text-sm text-gray-500">
                <span className="font-semibold">{filteredRecipes.length}</span> recipes
                {activeFilterCount > 0 && (
                  <span className="ml-2 text-gold-600">
                    ({activeFilterCount} filters active)
                  </span>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-3 py-2 border border-gray-300 rounded-lg text-sm font-sans focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
                >
                  <option value="rating">Sort: Rating</option>
                  <option value="recent">Sort: Recent</option>
                  <option value="trending">Sort: Trending</option>
                  <option value="difficulty">Sort: Difficulty</option>
                </select>

                <div className="flex gap-2">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-gold-100 text-gold-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title="Grid view"
                  >
                    <Grid2x2 size={20} />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-gold-100 text-gold-600'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                    title="List view"
                  >
                    <List size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Results Grid/List */}
          {filteredRecipes.length > 0 ? (
            <div
              className={
                viewMode === 'grid'
                  ? 'grid grid-cols-1 md:grid-cols-2 gap-6'
                  : 'space-y-4'
              }
            >
              {filteredRecipes.map((recipe) => (
                <RecipeCard key={recipe.id} recipe={recipe} />
              ))}
            </div>
          ) : (
            <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
              <p className="text-lg text-gray-500 mb-4">
                No recipes found matching your filters
              </p>
              <Button
                variant="outline"
                onClick={() =>
                  setFilters({
                    cuisines: [],
                    techniques: [],
                    stations: [],
                    ingredients: [],
                    allergens: [],
                    chefAccolades: [],
                    menuContext: [],
                    sustainability: { lowCarbon: false, seasonal: false, zeroWaste: false },
                    foodCostRange: DEFAULT_FOOD_COST_RANGE,
                    difficulty: [],
                    searchQuery: '',
                  })
                }
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
