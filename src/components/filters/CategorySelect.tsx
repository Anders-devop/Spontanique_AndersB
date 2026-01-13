import React from 'react';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface CategorySelectProps {
  selected: string;
  onSelect: (category: string) => void;
}

const categories = [
  'All',
  'music',
  'culture',
  'food',
  'fitness',
  'business',
  'entertainment',
  'social',
  'sports',
  'nightlife'
];

export const CategorySelect: React.FC<CategorySelectProps> = ({ selected, onSelect }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Category</Label>
      <Select value={selected} onValueChange={onSelect}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          {categories.map((category) => (
            <SelectItem key={category} value={category}>
              {category === 'All' ? 'All Categories' : category.charAt(0).toUpperCase() + category.slice(1)}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
