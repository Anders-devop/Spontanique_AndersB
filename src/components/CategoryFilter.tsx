import { CategorySelect } from "./filters/CategorySelect";
import { PriceFilter } from "./filters/PriceFilter";
import { DateFilter } from "./filters/DateFilter";
import { ResetFilters } from "./filters/ResetFilters";
import { Search } from "lucide-react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Switch } from "./ui/switch";

interface CategoryFilterProps {
  selected: string;
  onSelect: (category: string) => void;
  priceRange: [number, number];
  onPriceRangeChange: (range: [number, number]) => void;
  dateRange: [string, string]; // Changed from selectedDate: string
  onDateRangeChange: (range: [string, string]) => void; // Changed from onDateChange
  showOnlyPartnerEvents: boolean;
  onShowOnlyPartnerEventsChange: (show: boolean) => void;
  searchLocation?: string;
  onLocationChange?: (location: string) => void;
}

export const CategoryFilter = ({
  selected,
  onSelect,
  priceRange,
  onPriceRangeChange,
  dateRange, // Changed from selectedDate
  onDateRangeChange, // Changed from onDateChange
  showOnlyPartnerEvents,
  onShowOnlyPartnerEventsChange,
  searchLocation = "",
  onLocationChange,
}: CategoryFilterProps) => {
  const handleReset = () => {
    onSelect("All");
    onPriceRangeChange([0, 2000]);
    onDateRangeChange(["", ""]); // Changed from onDateChange("")
    onShowOnlyPartnerEventsChange(false);
    if (onLocationChange) {
      onLocationChange("");
    }
  };

  // [RATIONALE]: Check if any filters are active (different from default values)
  // Using !! to ensure boolean type (TypeScript requirement for hasActiveFilters prop)
  const hasActiveFilters =
    selected !== "All" ||
    priceRange[0] !== 0 ||
    priceRange[1] !== 2000 ||
    dateRange[0] !== "" || // Changed from selectedDate !== ""
    dateRange[1] !== "" || // New check
    showOnlyPartnerEvents ||
    !!(searchLocation && searchLocation.trim() !== "");

  return (
    <div className="space-y-6">
      <CategorySelect selected={selected} onSelect={onSelect} />

      {/* Location Search */}
      {onLocationChange && (
        <div className="space-y-2">
          <Label htmlFor="location-search" className="text-sm font-medium">
            Location
          </Label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              id="location-search"
              type="text"
              placeholder="Search by city or venue..."
              value={searchLocation}
              onChange={(e) => onLocationChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}

      <PriceFilter priceRange={priceRange} onPriceRangeChange={onPriceRangeChange} />
      <DateFilter dateRange={dateRange} onDateRangeChange={onDateRangeChange} />

      <div className="flex items-center space-x-2">
        <Switch
          id="partner-events"
          checked={showOnlyPartnerEvents}
          onCheckedChange={onShowOnlyPartnerEventsChange}
        />
        <Label htmlFor="partner-events" className="text-sm">
          Only show partner events
        </Label>
      </div>

      <ResetFilters hasActiveFilters={!!hasActiveFilters} onReset={handleReset} />
    </div>
  );
};
