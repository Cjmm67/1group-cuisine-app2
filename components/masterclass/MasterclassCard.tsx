import React from 'react';
import Link from 'next/link';
import { Masterclass } from '@/types/index';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Avatar } from '@/components/ui/Avatar';
import { slugify } from '@/lib/utils';
import { Users, Play } from 'lucide-react';

interface MasterclassCardProps {
  masterclass: Masterclass;
}

export const MasterclassCard: React.FC<MasterclassCardProps> = ({ masterclass }) => {
  return (
    <Link href={`/masterclasses/${slugify(masterclass.title)}`}>
      <Card variant="interactive" className="overflow-hidden h-full card-hover group">
        <div className="aspect-video bg-gray-100 flex items-center justify-center relative image-zoom-hover">
          {masterclass.image ? (
            <img
              src={masterclass.image}
              alt={`${masterclass.title} — chef video on 1-CUISINESG, 1-Group Singapore culinary platform`}
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-500">{masterclass.title}</span>
          )}
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center">
              <Play size={24} className="text-gray-900 fill-gray-900 ml-1" />
            </div>
          </div>
        </div>

        <div className="p-5 space-y-3">
          <div>
            <h3 className="text-base font-semibold text-gray-900 line-clamp-2 group-hover:text-gold-700 transition-colors">
              {masterclass.title}
            </h3>
            <div className="flex items-center gap-2 mt-2">
              <Avatar name={masterclass.chef.name} image={masterclass.chef.avatar} size="sm" />
              <span className="text-sm text-gold-600 font-medium">{masterclass.chef.name}</span>
            </div>
          </div>

          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed">{masterclass.description}</p>

          <div className="flex flex-wrap gap-1.5">
            {masterclass.cuisine.slice(0, 2).map((c) => (
              <Badge key={c} variant="secondary" size="sm">
                {c}
              </Badge>
            ))}
            <Badge variant="primary" size="sm">
              {masterclass.level}
            </Badge>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <Play size={13} />
                {masterclass.episodes.length} episodes
              </span>
              <span className="flex items-center gap-1">
                <Users size={13} />
                {masterclass.enrollmentCount}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <span className="text-amber-500">&#9733;</span>
              <span className="text-sm font-semibold text-gray-900">
                {masterclass.rating.toFixed(1)}
              </span>
            </div>
            <span className="text-sm font-semibold text-gold-600">
              Watch
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
};
