import React from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

interface DateFilterProps {
  selectedDate: string;
  onDateChange: (date: string) => void;
}

export const DateFilter: React.FC<DateFilterProps> = ({ selectedDate, onDateChange }) => {
  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Event Date</Label>
      <Input
        type="date"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
        className="w-full"
      />
    </div>
  );
};
