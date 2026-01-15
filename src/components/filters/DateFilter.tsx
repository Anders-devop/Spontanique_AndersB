import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateFilterProps {
  dateRange: [string, string]; // [fromDate, toDate]
  onDateRangeChange: (range: [string, string]) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ dateRange, onDateRangeChange }) => {
  const [fromDate, toDate] = dateRange;

  // [RATIONALE]: Validate date range - prevent impossible date combinations
  // If toDate is set, fromDate cannot be later than toDate
  // If fromDate is set, toDate cannot be earlier than fromDate
  const isInvalidRange = fromDate && toDate && fromDate > toDate;

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
            max={toDate || undefined} // Cannot select date later than toDate
            onChange={(e) => {
              const newFromDate = e.target.value;
              // If new fromDate is after toDate, clear toDate to prevent invalid range
              if (toDate && newFromDate > toDate) {
                onDateRangeChange([newFromDate, '']);
              } else {
                onDateRangeChange([newFromDate, toDate]);
              }
            }}
            className={`w-full ${isInvalidRange ? 'border-red-500' : ''}`}
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
            min={fromDate || undefined} // Cannot select date earlier than fromDate
            onChange={(e) => {
              const newToDate = e.target.value;
              // If new toDate is before fromDate, clear fromDate to prevent invalid range
              if (fromDate && newToDate < fromDate) {
                onDateRangeChange(['', newToDate]);
              } else {
                onDateRangeChange([fromDate, newToDate]);
              }
            }}
            className={`w-full ${isInvalidRange ? 'border-red-500' : ''}`}
          />
        </div>
      </div>
      {isInvalidRange && (
        <p className="text-xs text-red-500">
          Invalid date range: From date cannot be later than To date
        </p>
      )}
    </div>
  );
};
