import React from 'react';
import { RecipeStep, KitchenStation } from '@/types/index';
import { Badge } from '@/components/ui/Badge';
import { Clock } from 'lucide-react';

interface StepListProps {
  steps: RecipeStep[];
}

export const StepList: React.FC<StepListProps> = ({ steps }) => {
  const sortedSteps = [...steps].sort((a, b) => a.order - b.order);

  return (
    <div className="space-y-4">
      {sortedSteps.map((step, index) => (
        <div key={step.id} className="flex gap-4">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gold-100 text-gold-600 font-semibold flex items-center justify-center">
            {step.order}
          </div>

          <div className="flex-1 pb-4 border-b border-gray-200 last:border-b-0">
            <p className="text-gray-900 mb-3">{step.instruction}</p>

            <div className="flex flex-wrap gap-2">
              {step.station && (
                <Badge variant="secondary" size="sm">
                  {step.station.name}
                </Badge>
              )}

              {step.techniques && step.techniques.map((technique) => (
                <Badge key={technique} variant="info" size="sm">
                  {technique}
                </Badge>
              ))}

              {step.duration && (
                <Badge variant="default" size="sm">
                  <Clock size={12} className="mr-1 inline" />
                  {step.duration}m
                </Badge>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
