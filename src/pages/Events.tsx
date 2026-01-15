import { useState, useEffect } from 'react';
import { AISearchBar } from '@/components/search/AISearchBar';
import { EventsList } from '@/components/events/EventsList';
import { CategoryFilter } from '@/components/CategoryFilter';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { mockEvents } from '@/lib/mockData';
import { EventWithTickets } from '@/types/event';
import { Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  // [RATIONALE]: Date range filter - changed from single date to from-to range
  // Matches PriceFilter UX pattern for consistency (from only, to only, or both)
  const [dateRange, setDateRange] = useState<[string, string]>(['', '']);
  const [showOnlyPartnerEvents, setShowOnlyPartnerEvents] = useState(false);
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [aiSearchResults, setAiSearchResults] = useState<EventWithTickets[]>([]);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // [RATIONALE]: Persist sidebar state in localStorage for better UX
  // Users who collapse the sidebar likely want it collapsed on return visits
  useEffect(() => {
    const saved = localStorage.getItem('sidebarOpen');
    if (saved !== null) {
      setIsSidebarOpen(saved === 'true');
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('sidebarOpen', String(isSidebarOpen));
  }, [isSidebarOpen]);

  // Use AI search results if active, otherwise use all mock events
  const eventsToFilter = isAiSearchActive ? aiSearchResults : mockEvents;

  // Apply client-side filters
  const filteredEvents = useFilteredEvents(
    eventsToFilter,
    selectedCategory,
    searchLocation,
    priceRange,
    dateRange, // Changed from selectedDate
    showOnlyPartnerEvents,
    isAiSearchActive
  );

  const handleAISearch = (filters: {
    categories: string[];
    priceRange: [number, number];
    timePreference: string;
    mood: string;
    explanation: string;
    searchKeywords?: string;
    prompt?: string;
    location?: string;
    events?: EventWithTickets[];
    totalFound?: number;
  }) => {
    console.log('AI Search filters received:', filters);

    // If clearing search
    if (filters.timePreference === 'clear') {
      setIsAiSearchActive(false);
      setAiSearchResults([]);
      setSelectedCategory('All');
      setPriceRange([0, 2000]);
      setDateRange(['', '']); // Changed from setSelectedDate('')
      setSearchLocation('');
      return;
    }

    // Set AI search results
    if (filters.events) {
      setAiSearchResults(filters.events);
      setIsAiSearchActive(true);
    }

    // Apply filters from AI search
    if (filters.location) {
      setSearchLocation(filters.location);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with AI Search */}
      <div className="bg-gradient-to-br from-primary via-primary-600 to-primary-700 text-white">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-3xl mx-auto space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-4"
            >
              <h1 className="text-4xl md:text-5xl font-bold">
                Find Your Perfect Experience
              </h1>
              <p className="text-xl text-white/90">
                AI-powered search for events in Copenhagen
              </p>
            </motion.div>

            <AISearchBar
              onAISearch={handleAISearch}
              aiResultCount={aiSearchResults.length}
              filteredResultCount={filteredEvents.length}
              isAiSearchActive={isAiSearchActive}
              activeFilters={{
                selectedCategory,
                priceRange,
                dateRange, // Changed from selectedDate
                searchLocation,
                showOnlyPartnerEvents
              }}
            />

            {isAiSearchActive && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center"
              >
                <p className="text-sm text-white/80">
                  Showing {filteredEvents.length} AI-powered results
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-6">

          {/* Desktop: Collapsible Sidebar */}
          <aside className={`
            hidden lg:block
            transition-all duration-300 ease-in-out
            ${isSidebarOpen ? 'lg:w-64' : 'lg:w-12'}
            flex-shrink-0
          `}>
            <div className="sticky top-4">
              {isSidebarOpen ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold">Filters</h2>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(false)}
                      className="h-8 w-8 p-0"
                      title="Collapse sidebar"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                  </div>
                  <CategoryFilter
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    dateRange={dateRange} // Changed from selectedDate
                    onDateRangeChange={setDateRange} // Changed from onDateChange
                    showOnlyPartnerEvents={showOnlyPartnerEvents}
                    onShowOnlyPartnerEventsChange={setShowOnlyPartnerEvents}
                    searchLocation={searchLocation}
                    onLocationChange={setSearchLocation}
                  />
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsSidebarOpen(true)}
                  className="h-10 w-10 p-0"
                  title="Expand sidebar"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </aside>

          {/* Mobile: Full-width Collapsible (Original) */}
          <div className="lg:hidden w-full">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </Button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3 }}
                  className="mt-4 overflow-hidden"
                >
                  <div className="bg-card border rounded-lg p-6">
                    <h2 className="text-lg font-semibold mb-4">Filters</h2>
                    <CategoryFilter
                      selected={selectedCategory}
                      onSelect={setSelectedCategory}
                      priceRange={priceRange}
                      onPriceRangeChange={setPriceRange}
                      dateRange={dateRange} // Changed from selectedDate
                      onDateRangeChange={setDateRange} // Changed from onDateChange
                      showOnlyPartnerEvents={showOnlyPartnerEvents}
                      onShowOnlyPartnerEventsChange={setShowOnlyPartnerEvents}
                      searchLocation={searchLocation}
                      onLocationChange={setSearchLocation}
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Events Grid */}
          <div className="flex-1 min-w-0">
            <div className="mb-6">
              <h2 className="text-2xl font-bold">
                {isAiSearchActive ? 'AI Search Results' : 'All Events'}
              </h2>
              <p className="text-muted-foreground">
                {filteredEvents.length} event{filteredEvents.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <EventsList events={filteredEvents} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Events;
