import React, { useState } from 'react';
import { WasteLog, WasteItem } from '@/types/index';
import { Card, CardContent, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Trash2, Plus } from 'lucide-react';

interface WasteLoggerProps {
  onSubmit: (log: Partial<WasteLog>) => void;
  isLoading?: boolean;
}

export const WasteLogger: React.FC<WasteLoggerProps> = ({ onSubmit, isLoading = false }) => {
  const [items, setItems] = useState<Partial<WasteItem>[]>([]);
  const [newItem, setNewItem] = useState<Partial<WasteItem>>({
    weight: 0,
    unit: 'g',
    category: 'trim',
  });
  const [notes, setNotes] = useState('');

  const handleAddItem = () => {
    if (newItem.ingredient && newItem.weight && newItem.weight > 0) {
      setItems([...items, { id: Math.random().toString(), ...newItem }]);
      setNewItem({ weight: 0, unit: 'g', category: 'trim' });
    }
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length > 0) {
      onSubmit({
        date: new Date(),
        items: items as WasteItem[],
        notes: notes || undefined,
      });
      setItems([]);
      setNotes('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Trash2 size={24} />
          Log Waste
        </h2>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-700">Add Waste Items</h3>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
              <Input
                label="Ingredient"
                placeholder="e.g., Carrot trim"
                value={newItem.ingredient || ''}
                onChange={(e) =>
                  setNewItem({ ...newItem, ingredient: e.target.value })
                }
              />
              <Input
                label="Weight"
                type="number"
                placeholder="Amount"
                value={newItem.weight || ''}
                onChange={(e) =>
                  setNewItem({ ...newItem, weight: parseFloat(e.target.value) || 0 })
                }
              />
              <Select
                label="Unit"
                options={[
                  { value: 'g', label: 'Grams' },
                  { value: 'kg', label: 'Kilograms' },
                  { value: 'ml', label: 'Milliliters' },
                  { value: 'l', label: 'Liters' },
                  { value: 'pcs', label: 'Pieces' },
                ]}
                value={newItem.unit || 'g'}
                onChange={(e) =>
                  setNewItem({ ...newItem, unit: e.target.value })
                }
              />
              <Select
                label="Category"
                options={[
                  { value: 'trim', label: 'Trim' },
                  { value: 'spoilage', label: 'Spoilage' },
                  { value: 'preparation', label: 'Preparation' },
                  { value: 'service', label: 'Service' },
                  { value: 'other', label: 'Other' },
                ]}
                value={newItem.category || 'trim'}
                onChange={(e) =>
                  setNewItem({ ...newItem, category: e.target.value as any })
                }
              />
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleAddItem}
              >
                <Plus size={18} />
              </Button>
            </div>
          </div>

          {items.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-semibold text-gray-700">Logged Items</h3>
              <div className="space-y-2">
                {items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.ingredient}</p>
                      <p className="text-sm text-gray-500">
                        {item.weight} {item.unit} • <Badge variant="default" size="sm">{item.category}</Badge>
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-2 hover:bg-red-50 rounded-lg transition-colors text-red-500"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="text-sm text-gray-500 p-3 bg-blue-50 rounded-lg">
                <strong>Total items:</strong> {items.length}
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes (optional)
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any prevention strategies or notes..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg font-sans text-gray-900 placeholder-gray-400 focus:border-gold-500 focus:ring-1 focus:ring-gold-500"
            />
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            className="w-full"
            isLoading={isLoading}
            disabled={items.length === 0}
          >
            Submit Waste Log
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
