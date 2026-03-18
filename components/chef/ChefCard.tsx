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
  const has50Best = hasAccolade(chef.accolades, 'fifty_best');

  return (
    <Link href={`/chefs/${slugify(chef.name)}`}>
      <Card variant="interactive" className="overflow-hidden h-full">
        <div className="relative pb-24">
          <div className="aspect-square bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center">
            <Avatar name={chef.name} image={chef.avatar} size="lg" />
          </div>

          <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
            <Avatar name={chef.name} image={chef.avatar} size="lg" />
          </div>
        </div>

        <div className="pt-16 px-4 pb-4 text-center space-y-3">
          <div>
            <h3 className="font-playfair text-lg font-semibold text-charcoal-800">
              {chef.name}
            </h3>
            {chef.restaurant && (
              <p className="text-sm text-gold-600 font-medium">{chef.restaurant}</p>
            )}
          </div>

          <div className="flex flex-wrap gap-2 justify-center">
            {michelinStars > 0 && (
              <Badge variant="warning" className="flex items-center gap-1">
                {Array.from({ length: michelinStars })
                  .map((_, i) => (
                    <Star key={i} size={12} fill="currentColor" />
                  ))}
                <span className="ml-1">{michelinStars}</span>
              </Badge>
            )}
            {has50Best && (
              <Badge variant="secondary">50 Best</Badge>
            )}
          </div>

          <p className="text-xs text-charcoal-600">
            {chef.yearsExperience} years experience
          </p>

          <div className="flex items-center justify-center gap-4 text-xs text-charcoal-600 py-2">
            <span className="font-medium">
              {chef.recipes.length}
              {chef.recipes.length === 1 ? ' recipe' : ' recipes'}
            </span>
            <span className="w-1 h-1 bg-gold-300 rounded-full"></span>
            <span className="font-medium">
              {chef.masterclasses.length}
              {chef.masterclasses.length === 1 ? ' class' : ' classes'}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className="text-xs text-charcoal-600 mb-1">Specialties</p>
              <div className="flex flex-wrap gap-1 justify-center">
                {chef.specialties.slice(0, 2).map((specialty) => (
                  <Badge key={specialty} variant="primary" size="sm">
                    {specialty}
                  </Badge>
                ))}
              </div>
            </div>

            <div>
              <p className="text-xs text-charcoal-600 mb-1">Cuisines</p>
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
