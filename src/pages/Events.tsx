import React, { useState } from 'react';
import { AISearchBar } from '@/components/search/AISearchBar';
import { EventsList } from '@/components/events/EventsList';
import { CategoryFilter } from '@/components/CategoryFilter';
import { useFilteredEvents } from '@/hooks/useFilteredEvents';
import { mockEvents } from '@/lib/mockData';
import { EventWithTickets } from '@/types/event';
import { Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const Events = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 2000]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [showOnlyPartnerEvents, setShowOnlyPartnerEvents] = useState(false);
  const [searchLocation, setSearchLocation] = useState<string>('');
  const [aiSearchResults, setAiSearchResults] = useState<EventWithTickets[]>([]);
  const [isAiSearchActive, setIsAiSearchActive] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Use AI search results if active, otherwise use all mock events
  const eventsToFilter = isAiSearchActive ? aiSearchResults : mockEvents;

  // Apply client-side filters
  const filteredEvents = useFilteredEvents(
    eventsToFilter,
    selectedCategory,
    searchLocation,
    priceRange,
    selectedDate,
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
      setSelectedDate('');
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

            <AISearchBar onAISearch={handleAISearch} />

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
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar - Desktop */}
          <div className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-4">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <CategoryFilter
                selected={selectedCategory}
                onSelect={setSelectedCategory}
                priceRange={priceRange}
                onPriceRangeChange={setPriceRange}
                selectedDate={selectedDate}
                onDateChange={setSelectedDate}
                showOnlyPartnerEvents={showOnlyPartnerEvents}
                onShowOnlyPartnerEventsChange={setShowOnlyPartnerEvents}
                searchLocation={searchLocation}
                onLocationChange={setSearchLocation}
              />
            </div>
          </div>

          {/* Mobile Filter Button */}
          <div className="lg:hidden">
            <Button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              variant="outline"
              className="w-full"
            >
              <Filter className="w-4 h-4 mr-2" />
              Filters
            </Button>

            <AnimatePresence>
              {isFilterOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-4 overflow-hidden"
                >
                  <CategoryFilter
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                    priceRange={priceRange}
                    onPriceRangeChange={setPriceRange}
                    selectedDate={selectedDate}
                    onDateChange={setSelectedDate}
                    showOnlyPartnerEvents={showOnlyPartnerEvents}
                    onShowOnlyPartnerEventsChange={setShowOnlyPartnerEvents}
                    searchLocation={searchLocation}
                    onLocationChange={setSearchLocation}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Events Grid */}
          <div className="flex-1">
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
