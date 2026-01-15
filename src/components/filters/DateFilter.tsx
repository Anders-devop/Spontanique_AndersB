import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateFilterProps {
  dateRange: [string, string]; // [fromDate, toDate]
  onDateRangeChange: (range: [string, string]) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ dateRange, onDateRangeChange }) => {
  const [fromDate, toDate] = dateRange;

  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Date Range</Label>
      <div className="space-y-2">
        <div>
          <Label htmlFor="from-date" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input
            id="from-date"
            type="date"
            value={fromDate}
            onChange={(e) => onDateRangeChange([e.target.value, toDate])}
            className="w-full"
          />
        </div>
        <div>
          <Label htmlFor="to-date" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input
            id="to-date"
            type="date"
            value={toDate}
            onChange={(e) => onDateRangeChange([fromDate, e.target.value])}
            className="w-full"
          />
        </div>
      </div>
      {(fromDate || toDate) && (
        <p className="text-xs text-muted-foreground">
          {fromDate || 'Any'} - {toDate || 'Any'}
        </p>
      )}
    </div>
  );
};
