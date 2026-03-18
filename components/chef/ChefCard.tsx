import React from 'react';
import Link from 'next/link';
import { Chef } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { getMichelinStars, hasAccolade, slugify } from '@/lib/utils';
import { Star } from 'lucide-react';

interface ChefCardProps {
  chef: Chef;
}

export const ChefCard: React.FC<ChefCardProps> = ({ chef }) => {
  const michelinStars = getMichelinStars(chef.accolades);

  return (
    <Link href={`/chefs/${slugify(chef.name)}`}>
      <Card variant="interactive" className="overflow-hidden h-full card-hover group">
        <div className="pt-8 pb-4 flex flex-col items-center">
          <Avatar name={chef.name} image={chef.avatar} size="lg" />
        </div>

        <div className="px-5 pb-5 text-center space-y-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-gold-700 transition-colors">
              {chef.name}
            </h3>
            {chef.restaurant && (
              <p className="text-sm text-gold-600 font-medium mt-0.5">{chef.restaurant}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-1.5 justify-center">
            {michelinStars > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                {Array.from({ length: michelinStars }).map((_, i) => (
                  <Star key={i} size={11} fill="currentColor" />
                ))}
                <span className="ml-0.5">{michelinStars}</span>
              </Badge>
            )}
          </div>

          <p className="text-xs text-gray-500">
            {chef.yearsExperience} years experience
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-gray-500 py-1">
            <span className="font-medium">
              {chef.recipes.length}
              {chef.recipes.length === 1 ? ' recipe' : ' recipes'}
            </span>
            <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
            <span className="font-medium">
              {chef.masterclasses.length}
              {chef.masterclasses.length === 1 ? ' class' : ' classes'}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-gray-400 mb-1.5">Specialties</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {chef.specialties.slice(0, 2).map((specialty) => (
                  <Badge key={specialty} variant="primary" size="sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-gray-400 mb-1.5">Cuisines</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {chef.cuisine.slice(0, 2).map((c) => (
                  <Badge key={c} variant="secondary" size="sm">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Card>
    </Link>
  );
};
