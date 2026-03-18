import React from 'react';
import { Ingredient } from '@/types/index';
import { Badge } from '@/components/ui/Badge';

interface IngredientListProps {
  ingredients: Ingredient[];
  servings?: number;
  originalServings?: number;
}

export const IngredientList: React.FC<IngredientListProps> = ({
  ingredients,
  servings = 1,
  originalServings = 1,
}) => {
  const scale = servings / originalServings;

  const groupedIngredients = ingredients.reduce(
    (acc, ingredient) => {
      const group = ingredient.group || 'other';
      if (!acc[group]) {
        acc[group] = [];
      }
      acc[group].push(ingredient);
      return acc;
    },
    {} as Record<string, Ingredient[]>
  );

  const getGroupLabel = (group: string) => {
    const labels: Record<string, string> = {
      protein: 'Proteins',
      vegetable: 'Vegetables',
      fruit: 'Fruits',
      dairy: 'Dairy',
      grain: 'Grains',
      oil: 'Oils & Fats',
      seasoning: 'Seasonings',
      other: 'Other',
    };
    return labels[group] || group;
  };

  return (
    <div className="space-y-6">
      {Object.entries(groupedIngredients).map(([group, items]) => (
        <div key={group}>
          <h4 className="font-semibold text-charcoal-700 text-sm uppercase tracking-wide mb-3">
            {getGroupLabel(group)}
          </h4>
          <div className="space-y-2">
            {items.map((ingredient) => (
              <div
                key={ingredient.id}
                className="flex items-start justify-between gap-4 pb-2 border-b border-gray-100"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-charcoal-800 font-medium">
                      {ingredient.name}
                    </span>
                    {ingredient.allergens && ingredient.allergens.length > 0 && (
                      <Badge variant="danger" size="sm">
                        ⚠ Allergen
                      </Badge>
                    )}
                  </div>
                  {ingredient.sustainability && (
                    <span className="text-xs text-green-600 capitalize">
                      {ingredient.sustainability}
                    </span>
                  )}
                </div>
                <div className="text-right whitespace-nowrap">
                  <span className="font-semibold text-charcoal-800">
                    {(ingredient.weight * scale).toFixed(1)}
                  </span>
                  <span className="text-charcoal-600 ml-1">{ingredient.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
