import { useMemo } from 'react';
import { EventWithTickets } from '@/types/event';

export const useFilteredEvents = (
  events: EventWithTickets[],
  category: string,
  searchLocation: string,
  priceRange: [number, number],
  dateRange: [string, string], // Changed from dateFilter: string
  showOnlyPartnerEvents: boolean,
  isAiSearchActive: boolean = false
) => {
  const filteredEvents = useMemo(() => {
    let filtered = [...events];

    // [RATIONALE]: Check if events have AI relevance scores (_relevanceScore property)
    // to determine if we should sort by relevance (AI search) or keep default order (manual browse)
    const hasRelevanceScores = filtered.some(event =>
      '_relevanceScore' in event && typeof (event as any)._relevanceScore === 'number'
    );

    console.log('🔍 Hybrid Filter:', {
      isAiSearchActive,
      hasRelevanceScores,
      inputEvents: events.length,
      activeFilters: {
        category: category !== 'All' ? category : 'none',
        date: dateRange[0] || dateRange[1] ? `${dateRange[0] || 'Any'} - ${dateRange[1] || 'Any'}` : 'none', // Updated
        price: `${priceRange[0]}-${priceRange[1]}`,
        location: searchLocation || 'none',
        partnerOnly: showOnlyPartnerEvents
      }
    });

    // [RATIONALE]: HYBRID FILTERING - Apply ALL user filters regardless of AI search state
    // This creates an intersection: only events that pass BOTH AI relevance scoring AND
    // user's manual filters (category, date, price, location) are shown. This respects
    // user preferences while leveraging AI's semantic understanding.

    // Filter by category
    if (category && category !== 'All') {
      filtered = filtered.filter(event => event.category === category);
    }

    // [RATIONALE]: Location filter searches BOTH venue name AND city using .includes()
    // This fixes overly strict filtering where searching 'Copenhagen' wouldn't match
    // 'Bastard Café, Copenhagen' because venue name didn't contain 'Copenhagen'.
    // Using OR logic ensures location search is intuitive and captures both specific
    // venues and city-wide searches.
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

    // [RATIONALE]: Filter by date range - supports flexible from-to filtering
    // Matches PriceFilter UX pattern for consistency (from only, to only, or both)
    // If fromDate is set, events must be on or after that date (start of day)
    // If toDate is set, events must be on or before that date (end of day)
    const [fromDate, toDate] = dateRange;
    if (fromDate || toDate) {
      filtered = filtered.filter(event => {
        const eventDate = new Date(event.event_date);

        // If fromDate is set, event must be on or after fromDate
        if (fromDate) {
          const from = new Date(fromDate);
          from.setHours(0, 0, 0, 0); // Start of day
          if (eventDate < from) return false;
        }

        // If toDate is set, event must be on or before toDate
        if (toDate) {
          const to = new Date(toDate);
          to.setHours(23, 59, 59, 999); // End of day
          if (eventDate > to) return false;
        }

        return true;
      });
    }

    // [RATIONALE]: Partner events filter checks for 'external' source_type (not 'partner')
    // because the EventWithTickets type only supports 'native' | 'external', not 'partner'.
    // External events are affiliate/partner events from platforms like Eventbrite, Billetto.
    if (showOnlyPartnerEvents) {
      filtered = filtered.filter(event => event.source_type === 'external');
    }

    // [RATIONALE]: SORTING LOGIC - When AI search is active, ALWAYS sort by relevance score
    // (highest first) to surface the most semantically relevant events. This ensures that
    // high-scoring title matches appear at the top even when user applies additional filters.
    // Without AI search, keep default chronological order for manual browsing experience.
    if (isAiSearchActive && hasRelevanceScores) {
      filtered.sort((a, b) => {
        const scoreA = (a as any)._relevanceScore || 0;
        const scoreB = (b as any)._relevanceScore || 0;
        return scoreB - scoreA;  // Descending order - highest scores first
      });
      console.log('✅ Sorted by relevance score');
    }

    console.log('📊 Final filtered results:', filtered.length, 'events');

    return filtered;
  }, [events, category, searchLocation, priceRange, dateRange, showOnlyPartnerEvents, isAiSearchActive]); // Updated dependency

  // [RATIONALE]: Return plain array (not object) to fix "events.map is not a function" error
  // EventsList component expects array directly, not { filteredEvents: [...] }
  return filteredEvents;
};
