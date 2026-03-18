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
      <Card variant="interactive" className="overflow-hidden h-full card-hover group">
        <div className="aspect-video bg-gray-100 flex items-center justify-center text-center p-4 image-zoom-hover relative">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={`${recipe.title} by ${recipe.chef.name}${recipe.restaurant ? ` at ${recipe.restaurant}, Singapore` : ', 1-Group Singapore'}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-sm text-gray-500">{recipe.title}</span>
          )}

          {isSustainable && (
            <div className="absolute top-3 right-3">
              <Badge variant="secondary" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                <Leaf size={12} className="mr-1" />
                Sustainable
              </Badge>
            </div>
          )}

          {allergenCount > 0 && (
            <div className="absolute top-3 left-3">
              <Badge variant="warning" size="sm" className="bg-amber-50 text-amber-700 border-amber-200">
                <AlertCircle size={12} className="mr-1" />
                {allergenCount}
              </Badge>
            </div>
          )}
        </div>

        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-gold-700 transition-colors">
              {recipe.title}
            </h3>
            <div className="flex items-center justify-between mt-1.5">
              <p className="text-sm text-gold-600 font-medium">{recipe.chef.name}</p>
              {recipe.restaurant && (
                <p className="text-xs text-gray-500">{recipe.restaurant}</p>
              )}
            </div>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{recipe.description}</p>

          <div className="flex flex-wrap gap-1.5">
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

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Clock size={13} />
                {totalTime}
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                {recipe.servings}
              </span>
            </div>
            <Badge variant="primary" size="sm" className={getDifficultyColor(recipe.difficulty)}>
              {recipe.difficulty}
            </Badge>
          </div>

          {recipe.sustainability.score > 0 && (
            <div className="pt-2 text-xs">
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-gray-500">Sustainability</span>
                <span className="font-semibold text-emerald-600">{recipe.sustainability.score}%</span>
              </div>
              <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all"
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
