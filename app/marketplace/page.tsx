'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { MOCK_JOBS } from '@/lib/mockData';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MapPin, DollarSign, Briefcase, Calendar } from 'lucide-react';

export default function MarketplacePage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const filteredJobs = useMemo(() => {
    let results = MOCK_JOBS;

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(query) ||
          job.restaurant.toLowerCase().includes(query) ||
          job.cuisine.some((c) => c.toLowerCase().includes(query))
      );
    }

    if (selectedLevel) {
      results = results.filter((job) => job.experienceLevel === selectedLevel);
    }

    if (selectedType) {
      results = results.filter((job) => job.type === selectedType);
    }

    return results;
  }, [searchQuery, selectedLevel, selectedType]);

  return (
    <div className="container-page py-10 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight mb-2">
          Job Marketplace
        </h1>
        <p className="text-lg text-gray-500">
          Find your next culinary opportunity
        </p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Input
            placeholder="Search positions, restaurants..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Experience Level</p>
            <div className="flex flex-wrap gap-2">
              {['junior', 'mid', 'senior', 'executive'].map((level) => (
                <button
                  key={level}
                  onClick={() =>
                    setSelectedLevel(selectedLevel === level ? null : level)
                  }
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLevel === level
                      ? 'bg-gold-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Employment Type</p>
            <div className="flex flex-wrap gap-2">
              {['full_time', 'part_time', 'contract', 'temporary'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedType(selectedType === type ? null : type)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedType === type
                      ? 'bg-gold-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.replace(/_/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-sm text-gray-500 pt-2 border-t border-gray-200">
          Found <span className="font-semibold">{filteredJobs.length}</span> positions
        </p>
      </div>

      {/* Job Listings */}
      <div className="space-y-4">
        {filteredJobs.map((job) => (
          <Card key={job.id} variant="interactive">
            <CardContent className="py-6">
              <div className="flex flex-col md:flex-row md:items-start gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between gap-4 mb-3">
                    <div>
                      <h3 className="text-2xl font-semibold text-gray-900">
                        {job.title}
                      </h3>
                      <p className="text-lg text-gold-600 font-medium mt-1">
                        {job.restaurant}
                      </p>
                    </div>
                    <Badge variant="primary">
                      {job.experienceLevel === 'junior' && '🟢'}
                      {job.experienceLevel === 'mid' && '🟡'}
                      {job.experienceLevel === 'senior' && '🟠'}
                      {job.experienceLevel === 'executive' && '🔴'}
                      {' '}
                      {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                    </Badge>
                  </div>

                  <p className="text-gray-500 mb-4">{job.description}</p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {job.cuisine.map((c) => (
                      <Badge key={c} variant="secondary" size="sm">
                        {c}
                      </Badge>
                    ))}
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <MapPin size={16} className="text-gold-500" />
                      <span>{job.location}</span>
                    </div>
                    {job.salary && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <DollarSign size={16} className="text-gold-500" />
                        <span>
                          {formatCurrency(job.salary.min, job.salary.currency)} -{' '}
                          {formatCurrency(job.salary.max, job.salary.currency)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-gray-500">
                      <Briefcase size={16} className="text-gold-500" />
                      <span>{job.type.replace(/_/g, ' ')}</span>
                    </div>
                    {job.deadline && (
                      <div className="flex items-center gap-2 text-gray-500">
                        <Calendar size={16} className="text-gold-500" />
                        <span>Closes {formatDate(job.deadline)}</span>
                      </div>
                    )}
                  </div>
                </div>

                <Button variant="primary" size="lg" className="md:self-start">
                  Apply Now
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredJobs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <p className="text-lg text-gray-500">
            No positions match your criteria
          </p>
        </div>
      )}
    </div>
  );
}
