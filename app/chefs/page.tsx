'use client';

import React, { useState, useMemo } from 'react';
import { ChefCard } from '@/components/chef/ChefCard';
import { Input } from '@/components/ui/Input';
import { MOCK_CHEFS } from '@/lib/mockData';
import { Search } from 'lucide-react';

export default function ChefsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'experience' | 'accolades'>('name');

  const filteredChefs = useMemo(() => {
    let results = MOCK_CHEFS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (chef) =>
          chef.name.toLowerCase().includes(query) ||
          chef.restaurant?.toLowerCase().includes(query) ||
          chef.specialties.some((s) => s.toLowerCase().includes(query))
      );
    }

    const sorted = [...results];

    switch (sortBy) {
      case 'experience':
        return sorted.sort((a, b) => b.yearsExperience - a.yearsExperience);
      case 'accolades':
        return sorted.sort((a, b) => b.accolades.length - a.accolades.length);
      case 'name':
      default:
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
    }
  }, [searchQuery, sortBy]);

  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight mb-2">
          Chef Directory
        </h1>
        <p className="text-lg text-gray-500">
          Discover and connect with world-class chefs
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            icon={<Search size={18} />}
            placeholder="Search by name, restaurant, specialty..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-sans focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          >
            <option value="name">Sort: A-Z</option>
            <option value="experience">Sort: Years Experience</option>
            <option value="accolades">Sort: Accolades</option>
          </select>
        </div>

        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold">{filteredChefs.length}</span> of{' '}
          <span className="font-semibold">{MOCK_CHEFS.length}</span> chefs
        </p>
      </div>

      {/* Chef Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredChefs.map((chef) => (
          <ChefCard key={chef.id} chef={chef} />
        ))}
      </div>

      {filteredChefs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg text-gray-500 mb-4">
            No chefs found matching "{searchQuery}"
          </p>
        </div>
      )}
    </div>
  );
}
