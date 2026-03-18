import React, { useEffect, useRef } from 'react';
import { cn } from '@/lib/utils';

interface SliderProps {
  min: number;
  max: number;
  step?: number;
  value: [number, number];
  onChange: (value: [number, number]) => void;
  label?: string;
  disabled?: boolean;
  className?: string;
}

export const Slider = React.forwardRef<HTMLDivElement, SliderProps>(
  (
    {
      min,
      max,
      step = 1,
      value,
      onChange,
      label,
      disabled = false,
      className,
    },
    ref
  ) => {
    const [minValue, maxValue] = value;
    const minRef = useRef<HTMLInputElement>(null);
    const maxRef = useRef<HTMLInputElement>(null);

    const handleMinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMin = Math.min(Number(e.target.value), maxValue);
      onChange([newMin, maxValue]);
    };

    const handleMaxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newMax = Math.max(Number(e.target.value), minValue);
      onChange([minValue, newMax]);
    };

    const percentMin = ((minValue - min) / (max - min)) * 100;
    const percentMax = ((maxValue - min) / (max - min)) * 100;

    return (
      <div ref={ref} className={cn('w-full', className)}>
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
          </label>
        )}
        <div className="relative pt-6 pb-2">
          <div className="absolute top-8 left-0 right-0 h-2 bg-gray-200 rounded-full pointer-events-none">
            <div
              className="absolute h-full bg-gold-500 rounded-full"
              style={{
                left: `${percentMin}%`,
                right: `${100 - percentMax}%`,
              }}
            ></div>
          </div>

          <input
            ref={minRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={minValue}
            onChange={handleMinChange}
            disabled={disabled}
            className={cn(
              'absolute w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer pointer-events-none',
              'top-8 left-0',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500',
              '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto',
              '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:border-2',
              '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-gold-500 [&::-moz-range-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:border-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
          <input
            ref={maxRef}
            type="range"
            min={min}
            max={max}
            step={step}
            value={maxValue}
            onChange={handleMaxChange}
            disabled={disabled}
            className={cn(
              'absolute w-full h-2 bg-transparent rounded-full appearance-none cursor-pointer pointer-events-none',
              'top-8 left-0',
              '[&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5',
              '[&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-gold-500',
              '[&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:pointer-events-auto',
              '[&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:border-2',
              '[&::-moz-range-thumb]:w-5 [&::-moz-range-thumb]:h-5 [&::-moz-range-thumb]:rounded-full',
              '[&::-moz-range-thumb]:bg-gold-500 [&::-moz-range-thumb]:cursor-pointer',
              '[&::-moz-range-thumb]:border-white [&::-moz-range-thumb]:border-2',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>{minValue}</span>
          <span>{maxValue}</span>
        </div>
      </div>
    );
  }
);

Slider.displayName = 'Slider';
