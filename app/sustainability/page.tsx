'use client';

import React, { useState } from 'react';
import { WasteLogger } from '@/components/waste/WasteLogger';
import { WasteDashboard } from '@/components/waste/WasteDashboard';
import { WasteLog } from '@/types/index';
import { Card, CardContent } from '@/components/ui/Card';
import { Leaf } from 'lucide-react';

const SAMPLE_WASTE_LOGS: WasteLog[] = [
  {
    id: '1',
    chefId: 'chef-1',
    date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    items: [
      { id: '1', ingredient: 'Carrot Trim', weight: 250, unit: 'g', category: 'trim' },
      { id: '2', ingredient: 'Celery Tops', weight: 150, unit: 'g', category: 'trim' },
    ],
    notes: 'Used for stock',
  },
  {
    id: '2',
    chefId: 'chef-1',
    date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    items: [
      { id: '3', ingredient: 'Wilted Lettuce', weight: 300, unit: 'g', category: 'spoilage' },
    ],
    notes: 'Replaced with fresh supply',
  },
  {
    id: '3',
    chefId: 'chef-1',
    date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
    items: [
      { id: '4', ingredient: 'Fish Bones', weight: 500, unit: 'g', category: 'trim' },
      { id: '5', ingredient: 'Mushroom Stems', weight: 100, unit: 'g', category: 'trim' },
    ],
    notes: 'Perfect for stock and demi-glace',
  },
];

export default function SustainabilityPage() {
  const [wasteLogs, setWasteLogs] = useState<WasteLog[]>(SAMPLE_WASTE_LOGS);

  const handleSubmitWasteLog = (log: Partial<WasteLog>) => {
    const newLog: WasteLog = {
      id: Math.random().toString(),
      chefId: 'chef-1',
      date: log.date || new Date(),
      items: log.items || [],
      notes: log.notes,
    };
    setWasteLogs([...wasteLogs, newLog]);
  };

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight tracking-tight mb-2 flex items-center gap-3">
          <Leaf size={40} className="text-green-600" />
          Sustainability Hub
        </h1>
        <p className="text-lg text-gray-500">
          Track waste, optimize ingredients, and build a sustainable kitchen
        </p>
      </div>

      {/* Sustainability Tips */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-2">Zero Waste Cooking</h3>
            <p className="text-sm text-green-800">
              Use every part of your ingredients. Vegetable scraps become stocks, bones become broths.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-2">Seasonal Menu Planning</h3>
            <p className="text-sm text-green-800">
              Build menus around seasonal ingredients to reduce transportation and storage needs.
            </p>
          </CardContent>
        </Card>

        <Card className="border-green-200 bg-green-50">
          <CardContent className="pt-6">
            <h3 className="font-semibold text-green-900 mb-2">Local Sourcing</h3>
            <p className="text-sm text-green-800">
              Partner with local suppliers to reduce carbon footprint and support communities.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Waste Logger */}
      <WasteLogger onSubmit={handleSubmitWasteLog} />

      {/* Waste Dashboard */}
      <WasteDashboard logs={wasteLogs} />
    </div>
  );
}
