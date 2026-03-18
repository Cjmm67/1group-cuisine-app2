'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FilterState } from '@/types/index';
import { Input } from '@/components/ui/Input';
import { Slider } from '@/components/ui/Slider';
import { CUISINES, TECHNIQUES, KITCHEN_STATIONS, ALLERGENS, DEFAULT_FOOD_COST_RANGE, MAX_FOOD_COST } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface RecipeFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
}

interface ExpandedSections {
  cuisines: boolean;
  techniques: boolean;
  stations: boolean;
  ingredients: boolean;
  allergens: boolean;
  chefs: boolean;
  menuContext: boolean;
  sustainability: boolean;
  foodCost: boolean;
  difficulty: boolean;
}

export const RecipeFilters: React.FC<RecipeFiltersProps> = ({ filters, onFiltersChange }) => {
  const [expanded, setExpanded] = useState<ExpandedSections>({
    cuisines: true,
    techniques: true,
    stations: false,
    ingredients: false,
    allergens: false,
    chefs: false,
    menuContext: false,
    sustainability: false,
    foodCost: true,
    difficulty: false,
  });

  const toggleSection = (section: keyof ExpandedSections) => {
    setExpanded((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const handleCuisineChange = (id: string) => {
    const newCuisines = filters.cuisines.includes(id)
      ? filters.cuisines.filter((c) => c !== id)
      : [...filters.cuisines, id];
    onFiltersChange({ ...filters, cuisines: newCuisines });
  };

  const handleTechniqueChange = (id: string) => {
    const newTechniques = filters.techniques.includes(id)
      ? filters.techniques.filter((t) => t !== id)
      : [...filters.techniques, id];
    onFiltersChange({ ...filters, techniques: newTechniques });
  };

  const handleStationChange = (id: string) => {
    const newStations = filters.stations.includes(id)
      ? filters.stations.filter((s) => s !== id)
      : [...filters.stations, id];
    onFiltersChange({ ...filters, stations: newStations });
  };

  const handleAllergenChange = (id: string) => {
    const newAllergens = filters.allergens.includes(id)
      ? filters.allergens.filter((a) => a !== id)
      : [...filters.allergens, id];
    onFiltersChange({ ...filters, allergens: newAllergens });
  };

  const handleMenuContextChange = (context: string) => {
    const newContexts = filters.menuContext.includes(context)
      ? filters.menuContext.filter((m) => m !== context)
      : [...filters.menuContext, context];
    onFiltersChange({ ...filters, menuContext: newContexts });
  };

  const handleSustainabilityChange = (key: 'lowCarbon' | 'seasonal' | 'zeroWaste') => {
    onFiltersChange({
      ...filters,
      sustainability: {
        ...filters.sustainability,
        [key]: !filters.sustainability[key],
      },
    });
  };

  const handleFoodCostChange = (range: [number, number]) => {
    onFiltersChange({ ...filters, foodCostRange: range });
  };

  const handleDifficultyChange = (difficulty: string) => {
    const newDifficulties = filters.difficulty.includes(difficulty)
      ? filters.difficulty.filter((d) => d !== difficulty)
      : [...filters.difficulty, difficulty];
    onFiltersChange({ ...filters, difficulty: newDifficulties });
  };

  const renderCheckboxGroup = (
    items: any[],
    selectedIds: string[],
    onChange: (id: string) => void,
    labelKey: string = 'name'
  ) => (
    <div className="space-y-2">
      {items.map((item) => (
        <label key={item.id} className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={selectedIds.includes(item.id)}
            onChange={() => onChange(item.id)}
            className="w-4 h-4 rounded border-gray-300 text-gold-500 cursor-pointer"
          />
          <span className="text-sm text-gray-700">{item[labelKey]}</span>
        </label>
      ))}
    </div>
  );

  const FilterSection = ({
    title,
    sectionKey,
    children,
  }: {
    title: string;
    sectionKey: keyof ExpandedSections;
    children: React.ReactNode;
  }) => (
    <div className="border-b border-gray-200">
      <button
        onClick={() => toggleSection(sectionKey)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
      >
        <span>{title}</span>
        <ChevronDown
          size={16}
          className={cn('transition-transform', expanded[sectionKey] && 'rotate-180')}
        />
      </button>
      {expanded[sectionKey] && (
        <div className="px-4 py-3 bg-gray-50">{children}</div>
      )}
    </div>
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Filters</h3>
      </div>

      <div className="divide-y divide-gray-200">
        <FilterSection title="Search" sectionKey="cuisines">
          <Input
            type="text"
            placeholder="Recipe, chef name..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({ ...filters, searchQuery: e.target.value })}
          />
        </FilterSection>

        <FilterSection title="Cuisine" sectionKey="cuisines">
          {renderCheckboxGroup(
            CUISINES.filter((c) => !c.parent),
            filters.cuisines,
            handleCuisineChange
          )}
        </FilterSection>

        <FilterSection title="Technique" sectionKey="techniques">
          {renderCheckboxGroup(TECHNIQUES, filters.techniques, handleTechniqueChange)}
        </FilterSection>

        <FilterSection title="Kitchen Station" sectionKey="stations">
          {renderCheckboxGroup(KITCHEN_STATIONS, filters.stations, handleStationChange)}
        </FilterSection>

        <FilterSection title="Allergens (Exclude)" sectionKey="allergens">
          {renderCheckboxGroup(ALLERGENS, filters.allergens, handleAllergenChange)}
        </FilterSection>

        <FilterSection title="Menu Context" sectionKey="menuContext">
          <div className="space-y-2">
            {['tasting_menu', 'a_la_carte', 'brunch', 'zero_waste'].map((context) => (
              <label key={context} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.menuContext.includes(context)}
                  onChange={() => handleMenuContextChange(context)}
                  className="w-4 h-4 rounded border-gray-300 text-gold-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 capitalize">
                  {context.replace(/_/g, ' ')}
                </span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Sustainability" sectionKey="sustainability">
          <div className="space-y-2">
            {[
              { key: 'lowCarbon', label: 'Low Carbon' },
              { key: 'seasonal', label: 'Seasonal' },
              { key: 'zeroWaste', label: 'Zero Waste' },
            ].map(({ key, label }) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.sustainability[key as 'lowCarbon' | 'seasonal' | 'zeroWaste']}
                  onChange={() =>
                    handleSustainabilityChange(key as 'lowCarbon' | 'seasonal' | 'zeroWaste')
                  }
                  className="w-4 h-4 rounded border-gray-300 text-gold-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700">{label}</span>
              </label>
            ))}
          </div>
        </FilterSection>

        <FilterSection title="Food Cost (%)" sectionKey="foodCost">
          <Slider
            min={0}
            max={MAX_FOOD_COST}
            value={filters.foodCostRange}
            onChange={handleFoodCostChange}
            label="Food cost percentage"
          />
        </FilterSection>

        <FilterSection title="Difficulty" sectionKey="difficulty">
          <div className="space-y-2">
            {['beginner', 'intermediate', 'advanced', 'expert'].map((difficulty) => (
              <label key={difficulty} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filters.difficulty.includes(difficulty)}
                  onChange={() => handleDifficultyChange(difficulty)}
                  className="w-4 h-4 rounded border-gray-300 text-gold-500 cursor-pointer"
                />
                <span className="text-sm text-gray-700 capitalize">{difficulty}</span>
              </label>
            ))}
          </div>
        </FilterSection>
      </div>

      <button
        onClick={() =>
          onFiltersChange({
            cuisines: [],
            techniques: [],
            stations: [],
            ingredients: [],
            allergens: [],
            chefAccolades: [],
            menuContext: [],
            sustainability: { lowCarbon: false, seasonal: false, zeroWaste: false },
            foodCostRange: DEFAULT_FOOD_COST_RANGE,
            difficulty: [],
            searchQuery: '',
          })
        }
        className="w-full px-4 py-3 text-sm font-medium text-gold-500 hover:bg-gold-50 transition-colors border-t border-gray-200"
      >
        Clear Filters
      </button>
    </div>
  );
};
