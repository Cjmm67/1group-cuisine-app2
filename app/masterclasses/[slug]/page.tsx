'use client';

import React from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EpisodeList } from '@/components/masterclass/EpisodeList';
import { Avatar } from '@/components/ui/Avatar';
import { MOCK_MASTERCLASSES } from '@/lib/mockData';
import { notFound } from 'next/navigation';
import { slugify } from '@/lib/utils';
import { formatCurrency, formatTime } from '@/lib/utils';
import { PlayCircle, Users, Star } from 'lucide-react';

interface MasterclassDetailPageProps {
  params: {
    slug: string;
  };
}

export default function MasterclassDetailPage({ params }: MasterclassDetailPageProps) {
  const masterclass = MOCK_MASTERCLASSES.find(
    (mc) => slugify(mc.title) === params.slug.toLowerCase()
  );

  if (!masterclass) {
    notFound();
  }

  const totalDuration = masterclass.episodes.reduce((sum, ep) => sum + ep.duration, 0);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-gold-500 to-gold-700 rounded-lg p-8 text-white">
        <div className="flex flex-col md:flex-row gap-8 items-start md:items-center">
          <div className="w-48 h-48 bg-gold-600 rounded-lg overflow-hidden flex-shrink-0">
            {masterclass.image ? (
              <img
                src={masterclass.image}
                alt={masterclass.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <PlayCircle size={64} className="opacity-50" />
              </div>
            )}
          </div>

          <div className="flex-1">
            <h1 className="text-4xl font-bold mb-4">{masterclass.title}</h1>
            <p className="text-lg text-white/90 mb-6">{masterclass.description}</p>

            <div className="flex items-center gap-4 mb-6">
              <Avatar name={masterclass.chef.name} image={masterclass.chef.avatar} size="md" />
              <div>
                <p className="font-semibold text-lg">{masterclass.chef.name}</p>
                {masterclass.chef.restaurant && (
                  <p className="text-white/80">{masterclass.chef.restaurant}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Badge variant="warning" className="bg-white text-gold-600">
                {masterclass.level.charAt(0).toUpperCase() + masterclass.level.slice(1)} Level
              </Badge>
              {masterclass.cuisine.map((c) => (
                <Badge key={c} variant="secondary" className="bg-white text-gold-600">
                  {c}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-right">
            <p className="text-4xl font-bold mb-4">{formatCurrency(masterclass.price)}</p>
            <Button size="lg" className="bg-white text-gold-600 hover:bg-warm-100">
              Enroll Now
            </Button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gold-500">{masterclass.episodes.length}</p>
            <p className="text-sm text-gray-500 mt-1">Episodes</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gold-500">{formatTime(totalDuration)}</p>
            <p className="text-sm text-gray-500 mt-1">Total Duration</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <div className="flex items-center justify-center gap-1">
              <Star size={20} className="text-yellow-500 fill-yellow-500" />
              <p className="text-2xl font-bold text-gray-900 tracking-tight">
                {masterclass.rating.toFixed(1)}
              </p>
            </div>
            <p className="text-sm text-gray-500 mt-1">Rating</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-3xl font-bold text-gold-500">{masterclass.enrollmentCount}+</p>
            <p className="text-sm text-gray-500 mt-1">Enrolled</p>
          </CardContent>
        </Card>
      </div>

      {/* Episodes */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">Course Content</h2>
        </CardHeader>
        <CardContent>
          <EpisodeList episodes={masterclass.episodes} />
        </CardContent>
      </Card>

      {/* About Chef */}
      <Card>
        <CardHeader>
          <h2 className="text-2xl font-bold text-gray-900">About the Chef</h2>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-700">{masterclass.chef.bio}</p>

          <Link href={`/chefs/${slugify(masterclass.chef.name)}`}>
            <Button variant="outline">View Full Profile</Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
