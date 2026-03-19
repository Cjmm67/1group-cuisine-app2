'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { formatCurrency, formatDate } from '@/lib/utils';
import { MapPin, DollarSign, Briefcase, Calendar, Loader2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  restaurant: string;
  position: string;
  cuisine: string[];
  location: string;
  salary?: { min: number; max: number; currency: string };
  description: string;
  requirements: string[];
  experienceLevel: 'junior' | 'mid' | 'senior' | 'executive';
  type: 'full_time' | 'part_time' | 'contract' | 'temporary';
  postedDate: string;
  deadline?: string;
}

export default function MarketplacePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/jobs')
      .then((r) => r.json())
      .then((data) => setJobs(data.jobs || []))
      .catch(() => setJobs([]))
      .finally(() => setLoading(false));
  }, []);

  const filteredJobs = useMemo(() => {
    let results = jobs;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      results = results.filter(
        (job) =>
          job.title.toLowerCase().includes(q) ||
          job.restaurant.toLowerCase().includes(q) ||
          job.cuisine.some((c) => c.toLowerCase().includes(q))
      );
    }
    if (selectedLevel) results = results.filter((j) => j.experienceLevel === selectedLevel);
    if (selectedType) results = results.filter((j) => j.type === selectedType);
    return results;
  }, [jobs, searchQuery, selectedLevel, selectedType]);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Job Marketplace</h1>
        <p className="text-lg text-gray-500">Current openings across 1-Group Singapore venues</p>
      </div>

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
        <Input
          placeholder="Search positions, venues..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="space-y-3">
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Experience Level</p>
            <div className="flex flex-wrap gap-2">
              {['junior', 'mid', 'senior', 'executive'].map((level) => (
                <button
                  key={level}
                  onClick={() => setSelectedLevel(selectedLevel === level ? null : level)}
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
                  {type.replace(/_/g, ' ').split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                </button>
              ))}
            </div>
          </div>
        </div>
        <p className="text-sm text-gray-500 pt-2 border-t border-gray-200">
          {loading ? 'Loading...' : `${filteredJobs.length} position${filteredJobs.length !== 1 ? 's' : ''} available`}
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center py-16">
          <Loader2 size={32} className="animate-spin text-gold-500 mx-auto mb-4" />
          <p className="text-gray-400">Loading positions...</p>
        </div>
      )}

      {/* Job Listings */}
      {!loading && filteredJobs.length > 0 && (
        <div className="space-y-4">
          {filteredJobs.map((job) => (
            <Card key={job.id} variant="interactive">
              <CardContent className="py-6">
                <div className="flex flex-col md:flex-row md:items-start gap-6">
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div>
                        <h3 className="text-2xl font-semibold text-gray-900">{job.title}</h3>
                        <p className="text-lg text-gold-600 font-medium mt-1">{job.restaurant}</p>
                      </div>
                      <Badge variant="primary">
                        {job.experienceLevel === 'junior' && '🟢'}
                        {job.experienceLevel === 'mid' && '🟡'}
                        {job.experienceLevel === 'senior' && '🟠'}
                        {job.experienceLevel === 'executive' && '🔴'}{' '}
                        {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-gray-500 mb-4">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {job.cuisine.map((c) => (
                        <Badge key={c} variant="secondary" size="sm">{c}</Badge>
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
                            {formatCurrency(job.salary.min, job.salary.currency)} –{' '}
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
                          <span>Closes {formatDate(new Date(job.deadline))}</span>
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
      )}

      {/* Empty state */}
      {!loading && filteredJobs.length === 0 && (
        <div className="bg-white border border-gray-200 rounded-lg p-12 text-center">
          <Briefcase size={48} className="mx-auto mb-4 text-gray-300" />
          <p className="text-lg text-gray-500 mb-2">No positions currently available</p>
          <p className="text-sm text-gray-400">Check back soon for new openings across 1-Group venues.</p>
        </div>
      )}
    </div>
  );
}
