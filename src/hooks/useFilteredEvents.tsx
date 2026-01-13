import { useMemo } from 'react';
import { EventWithTickets } from '@/types/event';

export const useFilteredEvents = (
  events: EventWithTickets[],
  category: string,
  searchLocation: string,
  priceRange: [number, number],
  dateFilter: string,
  showOnlyPartnerEvents: boolean,
  isAiSearchActive: boolean = false
) => {
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // Check if events have AI relevance scores
    const hasRelevanceScores = filtered.some(event =>
      '_relevanceScore' in event && typeof (event as any)._relevanceScore === 'number'
    );

    console.log('🔍 Hybrid Filter:', {
      isAiSearchActive,
      hasRelevanceScores,
      inputEvents: events.length,
      activeFilters: {
        category: category !== 'All' ? category : 'none',
        date: dateFilter || 'none',
        price: `${priceRange[0]}-${priceRange[1]}`,
        location: searchLocation || 'none',
        partnerOnly: showOnlyPartnerEvents
      }
    });

    // HYBRID FILTERING: Apply ALL filters regardless of AI search state
    // This ensures only events that match BOTH AI search AND user filters are shown

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter(event => event.category === category);
    }

    // Filter by location (search both venue and city)
    if (searchLocation) {
      const lowerSearchLocation = searchLocation.toLowerCase();
      filtered = filtered.filter(event =>
        event.venue.toLowerCase().includes(lowerSearchLocation) ||
        event.city.toLowerCase().includes(lowerSearchLocation)
      );
    }

    // Filter by price
    filtered = filtered.filter(
      event => event.price >= priceRange[0] && event.price <= priceRange[1]
    );

    // Filter by date
    if (dateFilter && dateFilter !== 'all' && dateFilter !== '') {
      const now = new Date();
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);

        switch (dateFilter) {
          case 'today':
            return eventDate.toDateString() === now.toDateString();
          case 'tomorrow':
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return eventDate.toDateString() === tomorrow.toDateString();
          case 'week':
            const weekFromNow = new Date(now);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return eventDate >= now && eventDate <= weekFromNow;
          case 'weekend':
            const day = eventDate.getDay();
            return (day === 0 || day === 6) && eventDate >= now;
          default:
            return true;
        }
      });
    }

    // Filter by partner events (external sources)
    if (showOnlyPartnerEvents) {
      filtered = filtered.filter(event => event.source_type === 'external');
    }

    // SORTING LOGIC:
    // If AI search is active with relevance scores, sort by score (highest first)
    // Otherwise, keep default order (usually by date)
    if (isAiSearchActive && hasRelevanceScores) {
      filtered.sort((a, b) => {
        const scoreA = (a as any)._relevanceScore || 0;
        const scoreB = (b as any)._relevanceScore || 0;
        return scoreB - scoreA;
      });
      console.log('✅ Sorted by relevance score');
    }

    console.log('📊 Final filtered results:', filtered.length, 'events');

    return filtered;
  }, [events, category, searchLocation, priceRange, dateFilter, showOnlyPartnerEvents, isAiSearchActive]);

  return filteredEvents;
};
