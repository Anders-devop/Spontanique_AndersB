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
        date: dateFilter || 'none',
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
  }, [events, category, searchLocation, priceRange, dateFilter, showOnlyPartnerEvents, isAiSearchActive]);

  // [RATIONALE]: Return plain array (not object) to fix "events.map is not a function" error
  // EventsList component expects array directly, not { filteredEvents: [...] }
  return filteredEvents;
};
