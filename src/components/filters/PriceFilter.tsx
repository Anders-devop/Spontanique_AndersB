import React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface PriceFilterProps {
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
}

export const PriceFilter: React.FC<PriceFilterProps> = ({ priceRange, onPriceRangeChange }) => {
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium">Price Range</Label>
        <span className="text-sm text-muted-foreground">
          {priceRange[0]} - {priceRange[1]} DKK
        </span>
      </div>
      <Slider
        min={0}
        max={2000}
        step={50}
        value={priceRange}
        onValueChange={(value) => onPriceRangeChange(value as [number, number])}
        className="w-full"
      />
    </div>
  );
};
