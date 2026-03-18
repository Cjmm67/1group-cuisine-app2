'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MOCK_SUPPLIERS } from '@/lib/mockData';
import { Star, MapPin, Globe, CheckCircle } from 'lucide-react';

export default function SuppliersPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'rating' | 'name'>('rating');

  const filteredSuppliers = useMemo(() => {
    let results = MOCK_SUPPLIERS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (supplier) =>
          supplier.name.toLowerCase().includes(query) ||
          supplier.specialties.some((s) => s.toLowerCase().includes(query)) ||
          supplier.type.some((t) => t.toLowerCase().includes(query))
      );
    }

    if (selectedType) {
      results = results.filter((supplier) => supplier.type.includes(selectedType));
    }

    const sorted = [...results];

    switch (sortBy) {
      case 'name':
        return sorted.sort((a, b) => a.name.localeCompare(b.name));
      case 'rating':
      default:
        return sorted.sort((a, b) => b.rating - a.rating);
    }
  }, [searchQuery, selectedType, sortBy]);

  const allTypes = Array.from(
    new Set(MOCK_SUPPLIERS.flatMap((s) => s.type))
  ).sort();

  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight mb-2">
          Supplier Directory
        </h1>
        <p className="text-lg text-gray-500">
          Connect with premium suppliers for your kitchen
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Search suppliers, specialties..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg font-sans focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
          >
            <option value="rating">Sort: Rating</option>
            <option value="name">Sort: Name A-Z</option>
          </select>
        </div>

        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Type</p>
          <div className="flex flex-wrap gap-2">
            {allTypes.map((type) => (
              <button
                key={type}
                onClick={() =>
                  setSelectedType(selectedType === type ? null : type)
                }
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-gold-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-gray-500 pt-2 border-t border-gray-200">
          Found <span className="font-semibold">{filteredSuppliers.length}</span> suppliers
        </p>
      </div>

      {/* Supplier Listings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredSuppliers.map((supplier) => (
          <Card key={supplier.id} variant="interactive">
            <CardContent className="py-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">
                    {supplier.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-2">
                    {supplier.verified && (
                      <Badge variant="success" size="sm">
                        <CheckCircle size={14} className="inline mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 text-right">
                  <Star size={18} className="text-yellow-500 fill-yellow-500" />
                  <span className="font-semibold text-gray-900">
                    {supplier.rating.toFixed(1)}
                  </span>
                </div>
              </div>

              <p className="text-gray-500 mb-4">{supplier.description}</p>

              <div className="flex flex-wrap gap-2 mb-4">
                {supplier.type.map((t) => (
                  <Badge key={t} variant="secondary" size="sm">
                    {t}
                  </Badge>
                ))}
              </div>

              <div className="mb-4 pb-4 border-b border-gray-200">
                <p className="text-sm font-medium text-gray-700 mb-2">Specialties</p>
                <div className="flex flex-wrap gap-1">
                  {supplier.specialties.map((specialty) => (
                    <Badge key={specialty} variant="primary" size="sm">
                      {specialty}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                <MapPin size={16} />
                <span>{supplier.location}</span>
              </div>

              {supplier.website && (
                <a href={supplier.website} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="md" className="w-full">
                    <Globe size={16} className="mr-2" />
                    Visit Website
                  </Button>
                </a>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredSuppliers.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg text-gray-500">
            No suppliers match your criteria
          </p>
        </div>
      )}
    </div>
  );
}
