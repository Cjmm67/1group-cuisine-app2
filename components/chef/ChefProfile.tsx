import React from 'react';
import { Chef } from '@/types/index';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { RecipeCard } from '@/components/recipe/RecipeCard';
import { getMichelinStars, hasAccolade } from '@/lib/utils';
import { Star, Award, ExternalLink } from 'lucide-react';

interface ChefProfileProps {
  chef: Chef;
}

export const ChefProfile: React.FC<ChefProfileProps> = ({ chef }) => {
  const michelinStars = getMichelinStars(chef.accolades);

  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-gold-500 to-gold-700 rounded-lg p-5 sm:p-8 text-white">
        <div className="flex flex-col sm:flex-row gap-5 sm:gap-8 items-center sm:items-start text-center sm:text-left">
          <Avatar name={chef.name} image={chef.avatar} size="lg" className="w-20 h-20 sm:w-24 sm:h-24" />

          <div className="flex-1">
            <h1 className="text-2xl sm:text-4xl font-bold mb-1 sm:mb-2">{chef.name}</h1>
            {chef.restaurant && (
              <p className="text-xl font-medium text-white/90 mb-1">{chef.restaurant}</p>
            )}
            {chef.website && (
              <a href={chef.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-white/70 hover:text-white transition-colors mb-4">
                <ExternalLink size={14} />
                {chef.website.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '')}
              </a>
            )}
            {!chef.website && chef.restaurant && <div className="mb-4" />}

            <p className="text-white/80 max-w-2xl mb-4">{chef.bio}</p>

            <div className="flex flex-wrap gap-3">
              {michelinStars > 0 && (
                <Badge variant="warning">
                  {Array.from({ length: michelinStars })
                    .map(() => '⭐')
                    .join('')}
                  {' '}Michelin Stars
                </Badge>
              )}
              {hasAccolade(chef.accolades, 'guide') && (
                <Badge variant="secondary">Guide Listed</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gold-500">{chef.yearsExperience}</p>
            <p className="text-sm text-gray-500 mt-1">Years Experience</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gold-500">{chef.recipes.length}</p>
            <p className="text-sm text-gray-500 mt-1">Recipes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gold-500">{chef.masterclasses.length}</p>
            <p className="text-sm text-gray-500 mt-1">Classes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gold-500">{chef.cuisine.length}</p>
            <p className="text-sm text-gray-500 mt-1">Cuisines</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Award size={24} />
            Specialties & Expertise
          </h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Cuisines</h3>
            <div className="flex flex-wrap gap-2">
              {chef.cuisine.map((c) => (
                <Badge key={c} variant="secondary">
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-gray-700 mb-2">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {chef.specialties.map((specialty) => (
                <Badge key={specialty} variant="primary">
                  {specialty}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {chef.recipes.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recipes</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {chef.recipes.slice(0, 6).map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
