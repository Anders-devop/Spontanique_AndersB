import React from 'react';
import { Button } from '@/components/ui/button';
import { RotateCcw } from 'lucide-react';

interface ResetFiltersProps {
  hasActiveFilters: boolean;
  onReset: () => void;
}

export const ResetFilters: React.FC<ResetFiltersProps> = ({ hasActiveFilters, onReset }) => {
  if (!hasActiveFilters) return null;

  return (
    <Button
      variant="outline"
      onClick={onReset}
      className="w-full"
    >
      <RotateCcw className="w-4 h-4 mr-2" />
      Reset Filters
    </Button>
  );
};
