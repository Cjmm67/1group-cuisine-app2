import React from 'react';
import Link from 'next/link';
import { Recipe } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { formatTime, getDifficultyColor, slugify } from '@/lib/utils';
import { Clock, Users, Leaf, AlertCircle } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
}

export const RecipeCard: React.FC<RecipeCardProps> = ({ recipe }) => {
  const totalTime = formatTime(recipe.prepTime + recipe.cookTime);
  const allergenCount = recipe.allergens.length;
  const isSustainable = recipe.sustainability.score > 70;

  return (
    <Link href={`/recipes/${slugify(recipe.title)}`}>
      <Card variant="interactive" className="overflow-hidden h-full card-with-hover">
        <div className="aspect-video bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center text-center p-4 image-zoom-hover relative">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-gold-700">{recipe.title}</span>
          )}

          {/* Sustainability Badge */}
          {isSustainable && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" size="sm" className="bg-green-100 text-green-700 border-green-200">
                <Leaf size={12} className="mr-1" />
                Sustainable
              </Badge>
            </div>
          )}

          {/* Allergen Count Badge */}
          {allergenCount > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="warning" size="sm" className="bg-orange-100 text-orange-700 border-orange-200">
                <AlertCircle size={12} className="mr-1" />
                {allergenCount}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-playfair text-lg font-semibold text-charcoal-800 line-clamp-2">
              {recipe.title}
            </h3>
            <div className="flex items-center justify-between mt-1">
              <p className="text-sm text-gold-600 font-medium">{recipe.chef.name}</p>
              {recipe.restaurant && (
                <p className="text-xs text-charcoal-500">{recipe.restaurant}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-charcoal-600 line-clamp-2">{recipe.description}</p>

          <div className="flex flex-wrap gap-2">
            {recipe.cuisines.slice(0, 2).map((cuisine) => (
              <Badge key={cuisine.id} variant="secondary" size="sm">
                {cuisine.name}
              </Badge>
            ))}
            {recipe.cuisines.length > 2 && (
              <Badge variant="secondary" size="sm">
                +{recipe.cuisines.length - 2}
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-4 text-xs text-charcoal-600">
              <span className="flex items-center gap-1">
                <Clock size={14} />
                {totalTime}
              </span>
              <span className="flex items-center gap-1">
                <Users size={14} />
                {recipe.servings}
              </span>
            </div>
            <Badge variant="primary" size="sm" className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty}
            </Badge>
          </div>

          {recipe.sustainability.score > 0 && (
            <div className="pt-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-charcoal-600">Sustainability</span>
                <span className="font-semibold text-green-600">{recipe.sustainability.score}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-200 rounded-full mt-1 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all"
                  style={{ width: `${recipe.sustainability.score}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </Link>
  );
};
