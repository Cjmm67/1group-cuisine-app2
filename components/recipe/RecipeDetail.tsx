import React, { useState } from 'react';
import { Recipe } from '@/types/index';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { IngredientList } from './IngredientList';
import { StepList } from './StepList';
import { Avatar } from '@/components/ui/Avatar';
import { Slider } from '@/components/ui/Slider';
import { formatTime, getDifficultyColor, getMichelinStars } from '@/lib/utils';
import { Clock, Users, TrendingUp, Leaf, AlertTriangle } from 'lucide-react';

interface RecipeDetailProps {
  recipe: Recipe;
}

export const RecipeDetail: React.FC<RecipeDetailProps> = ({ recipe }) => {
  const [servings, setServings] = useState(recipe.servings);
  const [servingRange] = useState<[number, number]>([1, recipe.servings * 2]);

  const totalTime = formatTime(recipe.prepTime + recipe.cookTime);

  return (
    <div className="space-y-8">
      <div>
        <div className="aspect-[4/3] sm:aspect-video bg-gradient-to-br from-gold-100 to-gold-50 rounded-lg overflow-hidden flex items-center justify-center mb-6">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gold-600">No image available</span>
          )}
        </div>

        <div className="mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight mb-2">
            {recipe.title}
          </h1>
          <p className="text-base sm:text-lg text-gray-500">{recipe.description}</p>
        </div>

        <div className="flex items-center gap-6 mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <Avatar name={recipe.chef.name} image={recipe.chef.avatar} size="lg" />
            <div>
              <p className="font-semibold text-gray-900">{recipe.chef.name}</p>
              {recipe.restaurant && (
                <p className="text-sm text-gray-500">{recipe.restaurant}</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-3 mb-6">
          {recipe.cuisines.map((cuisine) => (
            <Badge key={cuisine.id} variant="secondary">
              {cuisine.name}
            </Badge>
          ))}
          <Badge className={getDifficultyColor(recipe.difficulty)}>
            {recipe.difficulty.charAt(0).toUpperCase() + recipe.difficulty.slice(1)}
          </Badge>
          {recipe.sustainability.lowCarbon && (
            <Badge variant="success">Low Carbon</Badge>
          )}
          {recipe.sustainability.seasonal && (
            <Badge variant="success">Seasonal</Badge>
          )}
          {recipe.sustainability.zeroWaste && (
            <Badge variant="success">Zero Waste</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-warm-100 rounded-lg p-6 mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Prep Time</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              <Clock size={18} />
              {formatTime(recipe.prepTime)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Cook Time</p>
            <p className="flex items-center gap-2 font-semibold text-gray-900">
              <Clock size={18} />
              {formatTime(recipe.cookTime)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Food Cost</p>
            <p className="font-semibold text-gray-900">{recipe.foodCostPercent}%</p>
          </div>
          <div>
            <p className="text-sm text-gray-500 mb-1">Sustainability</p>
            <p className="flex items-center gap-2 font-semibold text-green-600">
              <TrendingUp size={18} />
              {recipe.sustainability.score}%
            </p>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Users size={24} />
            Ingredients
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Servings: {servings}
            </label>
            <Slider
              min={servingRange[0]}
              max={servingRange[1]}
              value={[servings, servings]}
              onChange={([newServings]) => setServings(newServings)}
            />
          </div>
          <IngredientList
            ingredients={recipe.ingredients}
            servings={servings}
            originalServings={recipe.servings}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Method</h2>
        </CardHeader>
        <CardContent>
          <StepList steps={recipe.steps} />
        </CardContent>
      </Card>

      {recipe.allergens && recipe.allergens.length > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertTriangle className="text-yellow-600 flex-shrink-0 mt-0.5" size={20} />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Contains Allergens</h3>
                <div className="flex flex-wrap gap-2">
                  {recipe.allergens.map((allergen) => (
                    <Badge key={allergen.id} variant="warning">
                      {allergen.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Techniques</h2>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {recipe.techniques.map((technique) => (
              <Badge key={technique.id} variant="primary">
                {technique.name}
              </Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-3">
        <Button variant="primary" size="lg" className="flex-1">
          Save Recipe
        </Button>
        <Button variant="outline" size="lg" className="flex-1">
          Share
        </Button>
      </div>
    </div>
  );
};
