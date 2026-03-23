'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2, Briefcase, Copy, Check, AlertCircle, Loader2 } from 'lucide-react';

interface Job {
  id: string;
  title: string;
  restaurant: string;
  cuisine: string[];
  location: string;
  salary?: { min: number; max: number; currency: string };
  description: string;
  requirements: string[];
  experienceLevel: string;
  type: string;
  postedDate: string;
  deadline?: string;
}

const VENUES = [
  '1-Altitude', 'Kaarla', 'Oumi', 'MONTI', 'Sol & Luna', 'Sol & Ora',
  'UNA', 'Fire Restaurant', 'FLNT', 'Camille', 'Wildseed Café',
  'Wildseed Bar & Grill', '1-Flowerhill', '1-Arden', '1-Atico',
  'Botanico', '1-Altitude Coast', 'La Torre', 'La Luna', '1-Group Corporate',
];

export default function AdminJobsPage() {
  const { isAdmin, isMasterAdmin } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [exportJson, setExportJson] = useState('');
  const [copied, setCopied] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [restaurant, setRestaurant] = useState(VENUES[0]);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('Singapore');
  const [cuisineInput, setCuisineInput] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('mid');
  const [type, setType] = useState('full_time');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [deadline, setDeadline] = useState('');
  const [requirementsInput, setRequirementsInput] = useState('');

  const fetchJobs = async () => {
    try {
      const res = await fetch('/api/jobs?export=true');
      const data = await res.json();
      setJobs(data.jobs || []);
      setExportJson(data.exportJson || '[]');
    } catch {
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchJobs(); }, []);

  const resetForm = () => {
    setTitle(''); setDescription(''); setLocation('Singapore');
    setCuisineInput(''); setExperienceLevel('mid'); setType('full_time');
    setSalaryMin(''); setSalaryMax(''); setDeadline('');
    setRequirementsInput(''); setRestaurant(VENUES[0]);
    setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || !restaurant) {
      setError('Title, venue, and description are required');
      return;
    }
    setError('');
    setSaving(true);

    try {
      const res = await fetch('/api/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          restaurant,
          description,
          location,
          cuisine: cuisineInput.split(',').map((c) => c.trim()).filter(Boolean),
          experienceLevel,
          type,
          salary: salaryMin && salaryMax ? {
            min: parseInt(salaryMin),
            max: parseInt(salaryMax),
            currency: 'SGD',
          } : undefined,
          deadline: deadline || undefined,
          requirements: requirementsInput.split('\n').map((r) => r.trim()).filter(Boolean),
        }),
      });

      if (res.ok) {
        resetForm();
        setShowForm(false);
        fetchJobs();
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to add position');
      }
    } catch {
      setError('Network error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this position?')) return;
    try {
      await fetch(`/api/jobs?id=${id}`, { method: 'DELETE' });
      fetchJobs();
    } catch {}
  };

  const copyExport = () => {
    navigator.clipboard.writeText(exportJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!isAdmin) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle size={18} /> Admin access required.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-2">Manage Positions</h1>
          <p className="text-gray-500">Add and manage job openings across 1-Group venues.</p>
        </div>
        <Button
          variant="primary"
          onClick={() => { setShowForm(!showForm); if (!showForm) resetForm(); }}
        >
          <Plus size={18} className="mr-1" />
          Add Position
        </Button>
      </div>

      {/* Add Job Form */}
      {showForm && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">New Position</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                  <AlertCircle size={16} /> {error}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Position Title *</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Head Chef, Sous Chef, Bartender"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue *</label>
                  <select
                    value={restaurant}
                    onChange={(e) => setRestaurant(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  >
                    {VENUES.map((v) => <option key={v} value={v}>{v}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe the role, responsibilities, and what makes it special..."
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-y"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                  <select
                    value={experienceLevel}
                    onChange={(e) => setExperienceLevel(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  >
                    <option value="junior">Junior</option>
                    <option value="mid">Mid-Level</option>
                    <option value="senior">Senior</option>
                    <option value="executive">Executive</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  >
                    <option value="full_time">Full Time</option>
                    <option value="part_time">Part Time</option>
                    <option value="contract">Contract</option>
                    <option value="temporary">Temporary</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min (SGD)</label>
                  <input
                    type="number"
                    value={salaryMin}
                    onChange={(e) => setSalaryMin(e.target.value)}
                    placeholder="e.g. 3000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max (SGD)</label>
                  <input
                    type="number"
                    value={salaryMax}
                    onChange={(e) => setSalaryMax(e.target.value)}
                    placeholder="e.g. 5000"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Cuisine Tags (comma-separated)</label>
                <input
                  type="text"
                  value={cuisineInput}
                  onChange={(e) => setCuisineInput(e.target.value)}
                  placeholder="e.g. Italian, Mediterranean, Modern European"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Requirements (one per line)</label>
                <textarea
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  placeholder={"Minimum 3 years experience in fine dining\nFood safety certification\nStrong team leadership skills"}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:border-gold-500 focus:ring-1 focus:ring-gold-500 outline-none resize-y"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <Button type="submit" variant="primary" isLoading={saving}>
                  Publish Position
                </Button>
                <Button type="button" variant="ghost" onClick={() => { setShowForm(false); resetForm(); }}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Current Listings */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">
              Active Positions ({jobs.length})
            </h2>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <Loader2 size={24} className="animate-spin text-gold-500 mx-auto" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="text-center py-8">
              <Briefcase size={40} className="mx-auto mb-3 text-gray-300" />
              <p className="text-gray-500">No positions posted yet.</p>
              <p className="text-sm text-gray-400 mt-1">Click &quot;Add Position&quot; to create your first listing.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {jobs.map((job) => (
                <div key={job.id} className="py-4 flex items-start justify-between gap-4">
                  <div>
                    <h3 className="font-semibold text-gray-900">{job.title}</h3>
                    <p className="text-sm text-gold-600 font-medium">{job.restaurant}</p>
                    <p className="text-sm text-gray-500 mt-1 line-clamp-2">{job.description}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="primary" size="sm">
                        {job.experienceLevel.charAt(0).toUpperCase() + job.experienceLevel.slice(1)}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        {job.type.replace(/_/g, ' ')}
                      </Badge>
                      {job.salary && (
                        <Badge variant="secondary" size="sm">
                          SGD {job.salary.min.toLocaleString()} – {job.salary.max.toLocaleString()}
                        </Badge>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(job.id)}
                    className="text-gray-400 hover:text-red-500 transition-colors p-1"
                    title="Remove position"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Permanent Save — Master Admin */}
      {isMasterAdmin && jobs.length > 0 && (
        <Card>
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">Save Permanently</h2>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-500">
              Jobs persist while the server is warm. To save permanently across deploys,
              copy the value below and add it as <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs font-mono">JOBS_DATA</code> in
              Vercel → Environment Variables, then redeploy.
            </p>
            <div className="p-4 bg-gray-900 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">JOBS_DATA</p>
                <button
                  onClick={copyExport}
                  className="flex items-center gap-1 text-xs text-gold-400 hover:text-gold-300 font-medium"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
              <pre className="text-xs text-green-400 font-mono overflow-x-auto whitespace-pre-wrap break-all max-h-32 overflow-y-auto">
                {exportJson}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
