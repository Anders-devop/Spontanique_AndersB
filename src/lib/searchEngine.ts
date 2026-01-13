import { EventWithTickets } from '@/types/event';

// Synonym map for keyword expansion - matches production
export const SYNONYM_MAP: Record<string, string[]> = {
  'music': ['concert', 'live', 'band', 'performance', 'show', 'gig', 'festival', 'acoustic', 'jazz', 'rock', 'classical', 'electronic', 'dj', 'singer', 'musician', 'orchestra'],
  'yoga': ['pilates', 'meditation', 'mindfulness', 'wellness', 'stretching', 'zen', 'breathwork'],
  'games': ['gaming', 'quiz', 'trivia', 'board', 'cards', 'tournament', 'competition', 'e-sports', 'video games', 'board games', 'pub quiz'],
  'food': ['dining', 'restaurant', 'cuisine', 'meal', 'tasting', 'cooking', 'culinary', 'brunch', 'dinner', 'lunch', 'wine', 'beer', 'drinks'],
  'fitness': ['workout', 'gym', 'exercise', 'training', 'crossfit', 'bootcamp', 'sports', 'running', 'cycling'],
  'art': ['exhibition', 'gallery', 'museum', 'painting', 'sculpture', 'photography', 'creative', 'craft'],
  'theater': ['theatre', 'play', 'drama', 'performance', 'stage', 'acting', 'show'],
  'dance': ['dancing', 'ballet', 'salsa', 'tango', 'hip-hop', 'contemporary'],
  'comedy': ['standup', 'humor', 'funny', 'comedian', 'laugh', 'improv'],
  'party': ['nightlife', 'club', 'bar', 'dancing', 'celebration', 'social'],
  'culture': ['cultural', 'art', 'museum', 'exhibition', 'theater', 'opera', 'ballet'],
  'workshop': ['class', 'course', 'lesson', 'training', 'seminar', 'tutorial'],
  'networking': ['meetup', 'social', 'connect', 'business', 'professional'],
  'outdoor': ['nature', 'park', 'beach', 'hiking', 'outside', 'fresh air'],
  'kids': ['children', 'family', 'youth', 'young'],
  'sport': ['sports', 'athletic', 'game', 'match', 'competition'],
  'cheap': ['affordable', 'budget', 'inexpensive', 'low-cost', 'free'],
  'expensive': ['premium', 'luxury', 'high-end', 'exclusive'],
  'tonight': ['today', 'this evening', 'now'],
  'weekend': ['saturday', 'sunday'],
};

// Venue entity map for precise venue matching - matches production
export const VENUE_ENTITIES: Record<string, { canonical: string; aliases: string[]; weight: number }> = {
  'tivoli': { canonical: 'Tivoli Gardens', aliases: ['tivoli', 'tivoli gardens', 'tivoli copenhagen'], weight: 100 },
  'vega': { canonical: 'Vega', aliases: ['vega', 'vega copenhagen', 'store vega', 'lille vega'], weight: 90 },
  'kb hallen': { canonical: 'KB Hallen', aliases: ['kb hallen', 'kb-hallen', 'kb hall'], weight: 85 },
  'parken': { canonical: 'Parken Stadium', aliases: ['parken', 'parken stadium', 'telia parken'], weight: 95 },
  'royal danish': { canonical: 'Royal Danish Theatre', aliases: ['royal danish theatre', 'royal theatre', 'det kongelige teater'], weight: 90 },
  'opera': { canonical: 'Copenhagen Opera House', aliases: ['opera house', 'operaen', 'copenhagen opera'], weight: 95 },
  'rust': { canonical: 'Rust', aliases: ['rust', 'rust copenhagen'], weight: 80 },
  'pumpehuset': { canonical: 'Pumpehuset', aliases: ['pumpehuset', 'pumpe'], weight: 75 },
  'loppen': { canonical: 'Loppen', aliases: ['loppen', 'loppen christiania'], weight: 70 },
  'reffen': { canonical: 'Reffen', aliases: ['reffen', 'reffen street food'], weight: 85 },
};

/**
 * Expands keywords using the synonym map
 */
export function expandKeywords(keywords: string[]): string[] {
  const expanded = new Set<string>();

  keywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    expanded.add(lower);

    // Check synonym map
    Object.entries(SYNONYM_MAP).forEach(([key, synonyms]) => {
      if (lower === key || synonyms.includes(lower)) {
        expanded.add(key);
        synonyms.forEach(syn => expanded.add(syn));
      }
    });
  });

  return Array.from(expanded);
}

/**
 * Calculate venue match score
 * Only returns score if venue is explicitly mentioned in the query
 */
function calculateVenueScore(event: EventWithTickets, query: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerVenue = event.venue.toLowerCase();

  // Check for exact venue entity match - ONLY if in query
  for (const [, entity] of Object.entries(VENUE_ENTITIES)) {
    if (entity.aliases.some(alias => lowerQuery.includes(alias))) {
      return entity.weight;
    }
  }

  // Check for partial venue match - ONLY if venue name is in query
  if (lowerQuery.includes(lowerVenue)) {
    return 50;
  }

  return 0;
}

/**
 * Calculate relevance score for an event based on keywords
 * This matches the production scoring algorithm
 */
export function calculateRelevanceScore(
  event: EventWithTickets,
  originalKeywords: string[],
  expandedKeywords: string[],
  query: string
): { score: number; matched: number; direct: number; synonym: number } {
  let score = 0;
  let directMatches = 0;
  let synonymMatches = 0;

  const lowerTitle = event.title.toLowerCase();
  const lowerDescription = event.description.toLowerCase();
  const lowerCategory = event.category.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // PHRASE BONUS: Full query string appears in title
  if (lowerTitle.includes(lowerQuery)) {
    score += 150;
    directMatches++;
  }

  // Title matches (highest weight)
  originalKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    if (lowerTitle.includes(lower)) {
      score += 100;
      directMatches++;
    }
  });

  // Expanded keyword title matches
  expandedKeywords.forEach(keyword => {
    if (!originalKeywords.includes(keyword)) {
      if (lowerTitle.includes(keyword)) {
        score += 45;
        synonymMatches++;
      }
    }
  });

  // Venue matching (only if venue is in query)
  const venueScore = calculateVenueScore(event, query);
  score += venueScore;
  if (venueScore > 0) directMatches++;

  // Category matches
  originalKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    if (lowerCategory === lower || lowerCategory.includes(lower)) {
      score += 60;
      directMatches++;
    }
  });

  // Expanded keyword category matches
  expandedKeywords.forEach(keyword => {
    if (!originalKeywords.includes(keyword)) {
      if (lowerCategory === keyword || lowerCategory.includes(keyword)) {
        score += 27;
        synonymMatches++;
      }
    }
  });

  // Description matches
  originalKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    if (lowerDescription.includes(lower)) {
      score += 40;
      directMatches++;
    }
  });

  // Expanded keyword description matches
  expandedKeywords.forEach(keyword => {
    if (!originalKeywords.includes(keyword)) {
      if (lowerDescription.includes(keyword)) {
        score += 18;
        synonymMatches++;
      }
    }
  });

  // Source diversity bonus (prefer native events slightly)
  if (event.source_type === 'native') {
    score += 2;
  }

  // Availability bonus (events with more tickets)
  const ticketsLeft = event.event_tickets?.[0]?.tickets_left || 0;
  if (ticketsLeft > 0) {
    score += Math.min(ticketsLeft / 10, 5); // Max 5 points
  }

  // Recent/soon events get a small boost
  const eventDate = new Date(event.event_date);
  const daysUntil = Math.floor((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  if (daysUntil >= 0 && daysUntil <= 7) {
    score += 10; // Boost events in the next week
  } else if (daysUntil > 7 && daysUntil <= 14) {
    score += 5;
  }

  return {
    score,
    matched: directMatches + synonymMatches,
    direct: directMatches,
    synonym: synonymMatches
  };
}

/**
 * Parse time preference from query
 */
export function parseTimePreference(query: string): { start?: Date; end?: Date } | null {
  const lower = query.toLowerCase();
  const now = new Date();

  // Tonight
  if (lower.includes('tonight') || lower.includes('today')) {
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 59, 999);
    return { start: now, end: endOfDay };
  }

  // Tomorrow
  if (lower.includes('tomorrow')) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    const endOfTomorrow = new Date(tomorrow);
    endOfTomorrow.setHours(23, 59, 59, 999);
    return { start: tomorrow, end: endOfTomorrow };
  }

  // This weekend
  if (lower.includes('weekend') || lower.includes('saturday') || lower.includes('sunday')) {
    const day = now.getDay();
    const daysUntilSaturday = day === 0 ? 6 : 6 - day;
    const saturday = new Date(now);
    saturday.setDate(saturday.getDate() + daysUntilSaturday);
    saturday.setHours(0, 0, 0, 0);
    const sunday = new Date(saturday);
    sunday.setDate(sunday.getDate() + 1);
    sunday.setHours(23, 59, 59, 999);
    return { start: saturday, end: sunday };
  }

  // This week
  if (lower.includes('this week') || lower.includes('week')) {
    const endOfWeek = new Date(now);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    return { start: now, end: endOfWeek };
  }

  return null;
}

/**
 * Parse price preference from query
 */
export function parsePricePreference(query: string): { min?: number; max?: number } | null {
  const lower = query.toLowerCase();

  if (lower.includes('free')) {
    return { min: 0, max: 0 };
  }

  if (lower.includes('cheap') || lower.includes('affordable') || lower.includes('budget')) {
    return { min: 0, max: 200 };
  }

  if (lower.includes('expensive') || lower.includes('premium') || lower.includes('luxury')) {
    return { min: 300, max: 10000 };
  }

  return null;
}

/**
 * Main search function - matches production logic
 */
export function searchEvents(
  events: EventWithTickets[],
  query: string,
  options?: {
    categories?: string[];
    priceRange?: { min: number; max: number };
    timeFilter?: { start?: Date; end?: Date };
  }
): EventWithTickets[] {
  // Extract keywords from query
  const keywords = query
    .toLowerCase()
    .split(' ')
    .filter(word => word.length > 2);

  // Expand keywords using synonyms
  const expandedKeywords = expandKeywords(keywords);

  // Auto-detect time and price preferences if not provided
  const timeFilter = options?.timeFilter || parseTimePreference(query);
  const priceFilter = options?.priceRange || parsePricePreference(query);

  console.log('🔍 Search params:', {
    query,
    keywords,
    expandedCount: expandedKeywords.length,
    timeFilter,
    priceFilter
  });

  // Filter events by time
  let filtered = events;
  if (timeFilter) {
    filtered = filtered.filter(event => {
      const eventDate = new Date(event.event_date);
      if (timeFilter.start && eventDate < timeFilter.start) return false;
      if (timeFilter.end && eventDate > timeFilter.end) return false;
      return true;
    });
  }

  // Filter by price
  if (priceFilter) {
    filtered = filtered.filter(event => {
      if (priceFilter.min !== undefined && event.price < priceFilter.min) return false;
      if (priceFilter.max !== undefined && event.price > priceFilter.max) return false;
      return true;
    });
  }

  // Filter by categories
  if (options?.categories && options.categories.length > 0) {
    filtered = filtered.filter(event =>
      options.categories!.includes(event.category)
    );
  }

  // Calculate relevance scores
  const scored = filtered.map(event => {
    const relevance = calculateRelevanceScore(event, keywords, expandedKeywords, query);
    return {
      ...event,
      _relevanceScore: relevance.score,
      _matched: relevance.matched,
      _direct: relevance.direct,
      _synonym: relevance.synonym
    };
  });

  // Sort by relevance score
  scored.sort((a, b) => {
    // Primary sort: relevance score
    if (b._relevanceScore !== a._relevanceScore) {
      return b._relevanceScore - a._relevanceScore;
    }
    // Secondary sort: event date (sooner first)
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  // Log top results for debugging
  console.log('🎯 Top 5 results:', scored.slice(0, 5).map(e => ({
    title: e.title,
    score: e._relevanceScore,
    matched: e._matched,
    direct: e._direct,
    synonym: e._synonym
  })));

  return scored;
}
