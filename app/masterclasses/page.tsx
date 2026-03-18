'use client';

import React, { useState, useMemo } from 'react';
import { MasterclassCard } from '@/components/masterclass/MasterclassCard';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';
import { MOCK_MASTERCLASSES } from '@/lib/mockData';
import { Search } from 'lucide-react';

export default function MasterclassesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'recent' | 'price'>('rating');

  const filteredMasterclasses = useMemo(() => {
    let results = MOCK_MASTERCLASSES;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (mc) =>
          mc.title.toLowerCase().includes(query) ||
          mc.chef.name.toLowerCase().includes(query) ||
          mc.description.toLowerCase().includes(query)
      );
    }

    if (selectedLevel) {
      results = results.filter((mc) => mc.level === selectedLevel);
    }

    const sorted = [...results];

    switch (sortBy) {
      case 'recent':
        return sorted.sort(
          (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
        );
      case 'price':
        return sorted.sort((a, b) => a.price - b.price);
      case 'rating':
      default:
        return sorted.sort((a, b) => b.rating - a.rating);
    }
  }, [searchQuery, selectedLevel, sortBy]);

  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight mb-2">
          Masterclasses
        </h1>
        <p className="text-lg text-gray-500">
          Learn from the world's finest chefs
        </p>
      </div>

      {/* Controls */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            icon={<Search size={18} />}
            placeholder="Search masterclasses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-sans focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          >
            <option value="rating">Sort: Rating</option>
            <option value="recent">Sort: Recent</option>
            <option value="price">Sort: Price</option>
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <button
              key={level}
              onClick={() =>
                setSelectedLevel(selectedLevel === level ? null : level)
              }
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedLevel === level
                  ? 'bg-gold-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </button>
          ))}
        </div>

        <p className="text-sm text-gray-500">
          Showing <span className="font-semibold">{filteredMasterclasses.length}</span> of{' '}
          <span className="font-semibold">{MOCK_MASTERCLASSES.length}</span> masterclasses
        </p>
      </div>

      {/* Masterclass Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMasterclasses.map((masterclass) => (
          <MasterclassCard key={masterclass.id} masterclass={masterclass} />
        ))}
      </div>

      {filteredMasterclasses.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg text-gray-500 mb-4">
            No masterclasses found matching your criteria
          </p>
        </div>
      )}
    </div>
  );
}
