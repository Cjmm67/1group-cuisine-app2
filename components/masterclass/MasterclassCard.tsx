import React from 'react';
import Link from 'next/link';
import { Masterclass } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { formatCurrency, slugify } from '@/lib/utils';
import { Users, Play } from 'lucide-react';

interface MasterclassCardProps {
  masterclass: Masterclass;
}

export const MasterclassCard: React.FC<MasterclassCardProps> = ({ masterclass }) => {
  return (
    <Link href={`/masterclasses/${slugify(masterclass.title)}`}>
      <Card variant="interactive" className="overflow-hidden h-full">
        <div className="aspect-video bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center relative">
          {masterclass.image ? (
            <img
              src={masterclass.image}
              alt={masterclass.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gold-700">{masterclass.title}</span>
          )}
          <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
            <Play size={48} className="text-white fill-white" />
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <h3 className="font-playfair text-lg font-semibold text-charcoal-800 line-clamp-2">
              {masterclass.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Avatar name={masterclass.chef.name} image={masterclass.chef.avatar} size="sm" />
              <span className="text-sm text-gold-600 font-medium">{masterclass.chef.name}</span>
            </div>
          </div>

          <p className="text-sm text-charcoal-600 line-clamp-2">{masterclass.description}</p>

          <div className="flex flex-wrap gap-2">
            {masterclass.cuisine.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" size="sm">
                {c}
              </Badge>
            ))}
            <Badge variant="primary" size="sm">
              {masterclass.level}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-charcoal-600">
              <Play size={14} />
              {masterclass.episodes.length} episodes
            </div>
            <div className="flex items-center gap-2 text-xs text-charcoal-600">
              <Users size={14} />
              {masterclass.enrollmentCount}
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-gray-200">
            <div className="flex items-center">
              <span className="text-yellow-500 mr-1">★</span>
              <span className="text-sm font-semibold text-charcoal-800">
                {masterclass.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-lg font-bold text-gold-600">
              {formatCurrency(masterclass.price)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
