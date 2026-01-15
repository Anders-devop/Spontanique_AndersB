import { EventWithTickets } from '@/types/event';

// Synonym map for keyword expansion - matches production
// [RATIONALE]: Data-Level Enhancement - Expanded synonym map with high-frequency user terms
// (social, nightlife, specific drinks, sports) to improve recall without altering stable scoring algorithms
export const SYNONYM_MAP: Record<string, string[]> = {
  'music': ['concert', 'live', 'band', 'performance', 'show', 'gig', 'festival', 'acoustic', 'jazz', 'rock', 'classical', 'electronic', 'dj', 'singer', 'musician', 'orchestra', 'opera', 'disco'],
  'yoga': ['pilates', 'meditation', 'mindfulness', 'wellness', 'stretching', 'zen', 'breathwork', 'workout'],
  // [RATIONALE]: Balanced search recall by implementing singular/plural synonym keys
  // Both 'game' and 'games' need primary keys for one-way expansion to handle common queries
  // Added 'puzzle', 'challenge', 'escape room' to BOTH to capture game-related activities
  // Must be in both since one-way expansion doesn't share synonyms between singular/plural
  'game': ['gaming', 'quiz', 'trivia', 'tournament', 'play', 'competition', 'esports', 'puzzle', 'challenge', 'escape room'],
  'games': ['gaming', 'quiz', 'trivia', 'board', 'cards', 'tournament', 'competition', 'e-sports', 'video games', 'board games', 'pub quiz', 'puzzle', 'challenge', 'escape room'],
  // [RATIONALE]: Added 'quiz' as primary key to enable semantic expansion for quiz-related queries
  // When user searches 'quiz night', we expand 'quiz' to game-related terms to capture "Board Game Café Night"
  'quiz': ['trivia', 'game', 'games', 'pub quiz', 'brain teaser', 'questions', 'knowledge', 'competition'],
  // [RATIONALE]: CRITICAL FIX - Removed 'drinks' from food synonyms to prevent domain bridge
  // 'drinks' acted as a portal between 'food' and 'nightlife', causing catastrophic chain:
  // 'food' → 'drinks' → 'nightlife' → 'disco', making "Food events" return "Silent Disco"
  // Keep specific terms ('wine', 'beer') but remove generic 'drinks' which belongs to nightlife
  'food': ['dining', 'restaurant', 'cuisine', 'meal', 'tasting', 'cooking', 'culinary', 'brunch', 'dinner', 'lunch', 'wine', 'beer'],
  // [RATIONALE]: Fitness focuses on individual training/health activities, NOT competitive sports spectator events
  // Removed 'sports' to prevent false positives (e.g., "E-Sports Gaming" matching fitness searches)
  // When users search "fitness", they want workout/training events, not sports matches
  // Reverse works: searching "sports" still finds CrossFit via sports→fitness expansion
  'fitness': ['workout', 'gym', 'exercise', 'training', 'crossfit', 'bootcamp', 'running', 'cycling', 'health', 'wellness'],
  'art': ['exhibition', 'gallery', 'museum', 'painting', 'sculpture', 'photography', 'creative', 'craft'],
  'theater': ['theatre', 'play', 'drama', 'performance', 'stage', 'acting', 'show'],
  // [RATIONALE]: Added 'nightlife' to dance synonyms to capture nightclub dance events
  // that are categorized under nightlife rather than entertainment/social
  'dance': ['dancing', 'salsa', 'ballet', 'nightlife', 'tango', 'hip-hop', 'contemporary', 'disco', 'party'],
  'comedy': ['standup', 'humor', 'funny', 'comedian', 'laugh', 'improv'],
  'party': ['nightlife', 'club', 'bar', 'dancing', 'celebration', 'social', 'disco'],
  'culture': ['cultural', 'art', 'museum', 'exhibition', 'theater', 'opera', 'ballet'],
  'workshop': ['class', 'course', 'lesson', 'training', 'seminar', 'tutorial'],
  'networking': ['meetup', 'social', 'connect', 'business', 'professional'],
  'outdoor': ['nature', 'park', 'beach', 'hiking', 'outside', 'fresh air'],
  'kids': ['children', 'family', 'youth', 'young'],
  // [RATIONALE]: Enhanced sport synonyms with specific sports to improve recall for sport-specific queries
  // Removed 'fitness' to prevent reverse lookup chain (fitness→running→sports causing E-Sports in fitness searches)
  // Added 'crossfit' directly so sports searches still find CrossFit events (competitive fitness)
  // Domain separation: fitness = training focus, sports = competition focus (with crossfit as bridge)
  'sport': ['sports', 'athletic', 'game', 'match', 'competition', 'football', 'soccer', 'basketball', 'tennis', 'running', 'crossfit'],
  'sports': ['sport', 'athletic', 'game', 'match', 'competition', 'football', 'soccer', 'basketball', 'tennis', 'running', 'crossfit'],
  // [RATIONALE]: Added 'nightlife' as primary key - missing high-frequency category term
  // Users searching "club", "bar", or "cocktails" will now find nightlife events
  'nightlife': ['club', 'bar', 'party', 'dancing', 'drinks', 'pub', 'lounge', 'dj', 'disco', 'cocktails'],

  // [RATIONALE]: Added 'social' as primary key - missing high-frequency category term
  // Users searching "meetup", "networking", or "dating" will now find social events
  'social': ['meetup', 'networking', 'gathering', 'community', 'friends', 'people', 'connect', 'dating'],
  // [RATIONALE]: Added drink-specific terms for improved food/drink search recall
  // Users searching "beer", "wine", or "coffee" will find relevant events
  'beer': ['brewery', 'pub', 'bar', 'drinks', 'craft beer', 'ale', 'lager', 'brewing'],
  'wine': ['winery', 'tasting', 'vineyard', 'sommelier', 'drinks', 'vino'],
  'coffee': ['café', 'espresso', 'barista', 'coffeehouse', 'latte', 'cappuccino'],
  // [RATIONALE]: Added 'show' as primary key for spectator performances
  // 'Show' encompasses any performance where audience watches (not participatory)
  // Includes concerts, theater, comedy, opera, ballet, magic - excludes dance classes, workshops, parties
  'show': ['performance', 'concert', 'gig', 'live', 'theater', 'theatre', 'play', 'drama', 'stage', 'acting', 'musical', 'comedy', 'standup', 'stand-up', 'improv', 'magic', 'illusion', 'circus', 'cabaret', 'opera', 'ballet', 'symphony', 'orchestra'],
  'cheap': ['affordable', 'budget', 'inexpensive', 'low-cost', 'free'],
  'expensive': ['premium', 'luxury', 'high-end', 'exclusive'],
  'tonight': ['today', 'this evening', 'now'],
  'weekend': ['saturday', 'sunday'],
};

// [RATIONALE]: Stop words - Functional words that trigger filters but create noise in text scoring
// These words are handled by parsePricePreference/parseTimePreference and should not contribute
// to relevance scoring to prevent "double counting" (e.g., event that talks about being "cheap"
// vs event that actually IS cheap). Separation of concerns: filters handle constraints, scoring handles intent.
const STOP_WORDS = [
  'cheap', 'affordable', 'expensive', 'free', 'price', 'cost', 'budget',
  'tonight', 'today', 'tomorrow', 'weekend', 'week', 'saturday', 'sunday', 'night', 'day', 'evening', 'morning',
  'near', 'close', 'local', 'around',
  'class', 'classes', 'lesson', 'lessons', 'course', 'courses', 'event', 'events',
  'the', 'a', 'an', 'in', 'at', 'on', 'with', 'for', 'to', 'and', 'or'
];

// [RATIONALE]: Activity-to-Category Intent Mapping
// Maps specific activity keywords to their primary categories to ensure semantic relevance
// When user searches "yoga", they want fitness events regardless of price/time modifiers
// Intent boost (+300 points) ensures topical relevance outweighs generic text matches
const ACTIVITY_CATEGORY_MAP: Record<string, string> = {
  // Fitness activities
  'yoga': 'fitness',
  'pilates': 'fitness',
  'workout': 'fitness',
  'gym': 'fitness',
  'spin': 'fitness',
  'meditation': 'fitness',
  'crossfit': 'fitness',
  'bootcamp': 'fitness',
  'running': 'fitness',
  'cycling': 'fitness',
  // Music activities
  'jazz': 'music',
  'rock': 'music',
  'concert': 'music',
  'opera': 'music',
  'symphony': 'music',
  'classical': 'music',
  'electronic': 'music',
  // Entertainment activities
  'quiz': 'entertainment',
  'trivia': 'entertainment',
  'game': 'entertainment',
  'magic': 'entertainment',
  'comedy': 'entertainment',
  'standup': 'entertainment',
  'show': 'entertainment',
  'performance': 'entertainment',
  // Culture activities
  'painting': 'culture',
  'art': 'culture',
  'exhibition': 'culture',
  'museum': 'culture',
  'theater': 'culture',
  'ballet': 'culture',
  // Food activities
  'tasting': 'food',
  'cooking': 'food',
  'wine': 'food',
  'beer': 'food',
  'culinary': 'food',
  // Nightlife activities
  'karaoke': 'nightlife',
  'disco': 'nightlife',
  'dancing': 'nightlife',
  'club': 'nightlife',
  // Sports activities
  'football': 'sports',
  'soccer': 'sports',
  'basketball': 'sports',
  'handball': 'sports',
};

// Venue entity map for precise venue matching - matches production
// [RATIONALE]: Venue entity recognition with strong weighting
// When user explicitly mentions a venue ("events at Vega", "live music at Tivoli"),
// this is a HARD REQUIREMENT, not a soft preference. Venue match must override other factors.
// Weight set to 400 points to ensure venue-specific searches always prioritize correct venue.
// This prevents cases like "live music at Vega" showing Tivoli events first.
export const VENUE_ENTITIES: Record<string, { canonical: string; aliases: string[]; weight: number }> = {
  'tivoli': { canonical: 'Tivoli Gardens', aliases: ['tivoli', 'tivoli gardens', 'tivoli copenhagen'], weight: 400 },
  'vega': { canonical: 'Vega', aliases: ['vega', 'vega copenhagen', 'store vega', 'lille vega'], weight: 400 },
  'kb hallen': { canonical: 'KB Hallen', aliases: ['kb hallen', 'kb-hallen', 'kb hall'], weight: 400 },
  'parken': { canonical: 'Parken Stadium', aliases: ['parken', 'parken stadium', 'telia parken'], weight: 400 },
  'royal danish': { canonical: 'Royal Danish Theatre', aliases: ['royal danish theatre', 'royal theatre', 'det kongelige teater'], weight: 400 },
  'opera': { canonical: 'Copenhagen Opera House', aliases: ['opera house', 'operaen', 'copenhagen opera'], weight: 400 },
  'rust': { canonical: 'Rust', aliases: ['rust', 'rust copenhagen'], weight: 400 },
  'pumpehuset': { canonical: 'Pumpehuset', aliases: ['pumpehuset', 'pumpe'], weight: 400 },
  'loppen': { canonical: 'Loppen', aliases: ['loppen', 'loppen christiania'], weight: 400 },
  'reffen': { canonical: 'Reffen', aliases: ['reffen', 'reffen street food'], weight: 400 },
};

// [RATIONALE]: Primary categories represent "Browsing Mode" intent.
// When user searches these broad terms, they want to see ALL events in that category,
// not just events with the keyword in the title. This distinguishes between:
// - Browsing: "fitness" → Show all fitness events (yoga, pilates, crossfit, etc.)
// - Searching: "dance" → Show only dance-specific events (salsa, ballet, hip-hop)
export const PRIMARY_CATEGORIES = [
  'fitness', 'music', 'food', 'sport', 'sports',
  'culture', 'art', 'entertainment', 'nightlife',
  'business', 'social'
];

/**
 * Expands keywords using the synonym map - FIREWALL EXPANSION
 * [RATIONALE]: CRITICAL FIX - Prevents second-order synonym expansion chain reactions.
 *
 * Forward Expansion (Primary Key → Synonyms):
 *   'fitness' → ['workout', 'gym', 'exercise', ...] ✅
 *
 * Reverse Lookup (Synonym → Parent ONLY):
 *   'workout' → ['workout', 'fitness'] ✅
 *   BUT: 'fitness' does NOT then expand to ['workout', 'gym', ...] 🛡️
 *
 * This prevents catastrophic chains like:
 *   'food' → 'drinks' → 'nightlife' → 'disco' ❌ PREVENTED
 *
 * Problem Solved: "Food events" was returning "Silent Disco" (655 points!)
 * Root Cause: 'drinks' existed in both 'food' and 'nightlife' synonyms, creating a bridge.
 * When 'food' expanded to 'drinks', then 'drinks' reverse-looked-up to 'nightlife',
 * then 'nightlife' forward-expanded to 'disco', matching "Silent Disco in the Park".
 *
 * Solution: Parent keys from reverse lookup are added WITHOUT triggering forward expansion.
 * This breaks the chain reaction while preserving recall (workout finds fitness events).
 */
export function expandKeywords(keywords: string[]): string[] {
  const expanded = new Set<string>();
  // [RATIONALE]: Track parent keys separately to prevent them from re-expanding
  // This is the firewall - parent keys are added to search terms but NOT expanded further
  const parentKeysOnly = new Set<string>();

  keywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    expanded.add(lower);

    Object.entries(SYNONYM_MAP).forEach(([key, synonyms]) => {
      // Case 1: Forward Expansion (User searches Primary Key)
      // [RATIONALE]: 'fitness' should find 'workout', 'gym', 'yoga', etc.
      // This is safe because user explicitly searched for the category
      if (lower === key) {
        synonyms.forEach(syn => expanded.add(syn));
      }
      // Case 2: Reverse Lookup (User searches Specific Synonym)
      // [RATIONALE]: 'workout' should find 'fitness' events, but STOP there
      // Do NOT expand 'fitness' again (which would add 'yoga', 'gym', etc.)
      // This prevents: 'food' → 'drinks' → 'nightlife' → 'disco' chain reaction
      else if (synonyms.includes(lower)) {
        parentKeysOnly.add(key); // Mark for inclusion WITHOUT expansion 🛡️
      }
    });
  });

  // [RATIONALE]: Add parent keys to final set WITHOUT triggering their forward expansion
  // This ensures 'workout' finds 'fitness' events, but stops the chain reaction
  // Example: 'drinks' will add 'nightlife' to search, but NOT 'disco', 'club', 'bar', etc.
  parentKeysOnly.forEach(key => expanded.add(key));

  return Array.from(expanded);
}

/**
 * Calculate venue and city proximity score
 * [RATIONALE]: Tiered Geographic Scoring - Prioritizes local relevance
 * Tier 1: Exact venue match → 400 points (explicit venue requirement)
 * Tier 2: Same city match → 200 points (local proximity)
 * Tier 3: Different city → 0 points (no proximity bonus)
 *
 * This enables future multi-city expansion (Copenhagen, Aarhus, Malmö, Stockholm)
 * while maintaining clear ranking: Specific Venue > City-wide > Other Cities
 *
 * Example: "events at Vega" → Vega events (400) > Copenhagen events (200) > Other (0)
 * Example: "events in Copenhagen" → All Copenhagen events (200) > Other cities (0)
 */
function calculateVenueScore(event: EventWithTickets, query: string): number {
  const lowerQuery = query.toLowerCase();
  const lowerVenue = event.venue.toLowerCase();
  const lowerCity = event.city.toLowerCase();

  // [RATIONALE]: Tier 1 - Exact venue entity match (400 points)
  // When user explicitly mentions a venue ("at Vega", "Tivoli events"),
  // this is a HARD REQUIREMENT and must override all other factors
  for (const [, entity] of Object.entries(VENUE_ENTITIES)) {
    if (entity.aliases.some(alias => lowerQuery.includes(alias))) {
      return entity.weight; // 400 points for exact venue match
    }
  }

  // [RATIONALE]: Tier 1 - Partial venue name match (400 points)
  // If venue name appears in query but not in entity list,
  // still treat as explicit venue requirement
  if (lowerQuery.includes(lowerVenue)) {
    return 400;
  }

  // [RATIONALE]: Tier 2 - Same city match (200 points)
  // When user searches by city ("events in Copenhagen"), prioritize all events in that city
  // Prepares for multi-city expansion: Copenhagen vs Aarhus vs Malmö
  // Future enhancement: Can add neighborhood scoring (Tier 1.5) between venue and city
  if (lowerQuery.includes(lowerCity)) {
    return 200;
  }

  // [RATIONALE]: Tier 3 - No location match (0 points)
  // Event is in a different city or location not specified in query
  // Falls back to pure semantic relevance (title, category, description)
  return 0;
}

/**
 * Calculate relevance score for an event based on keywords
 * [RATIONALE]: Hybrid Search Engine - Combined aggressive title-weighting with partial
 * match logic and one-way synonym expansion to maximize precision while maintaining flexibility.
 */
export function calculateRelevanceScore(
  event: EventWithTickets,
  originalKeywords: string[],
  expandedKeywords: string[],
  query: string
): { score: number; matched: number; direct: number; synonym: number; hasTitleMatch: boolean } {
  let score = 0;
  let directMatches = 0;
  let synonymMatches = 0;
  let hasTitleMatch = false;

  const lowerTitle = event.title.toLowerCase();
  const lowerDescription = event.description.toLowerCase();
  const lowerCategory = event.category.toLowerCase();
  const lowerQuery = query.toLowerCase();

  // PHRASE BONUS: Full query string appears in title
  if (lowerTitle.includes(lowerQuery)) {
    score += 150;
    directMatches++;
    hasTitleMatch = true;
  }

  // [RATIONALE]: INTENT BOOST - Apply massive boost when activity keyword matches event category
  // This ensures semantic relevance (e.g., "yoga" → fitness) outweighs generic noise
  // Applied BEFORE text scoring to establish topical priority
  originalKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    const intentCategory = ACTIVITY_CATEGORY_MAP[lower];

    if (intentCategory && lowerCategory === intentCategory) {
      score += 300; // Massive intent boost for correct category
      directMatches++;
    }
  });

  // [RATIONALE]: DIRECT TITLE MATCH - 500 points (The gold standard)
  // Doubled from 250 to ensure title relevance completely dominates category/description matches
  // This prevents "Board Game Café" from outranking "Salsa Dancing Night" for 'dance' queries
  // STOP WORDS are skipped to prevent noise from functional words (cheap, class, night)
  originalKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();

    // [RATIONALE]: Skip stop words - these are functional words handled by filters
    // Prevents "double counting" where events that talk about being "cheap" outrank events that ARE cheap
    if (STOP_WORDS.includes(lower)) {
      return; // Skip this keyword
    }

    // [RATIONALE]: Hyphen-aware exact match check for direct keywords
    // Check if keyword appears in title, but NOT as part of hyphenated compound
    const titleWords = lowerTitle.split(/\s+/);
    const hasDirectExactMatch = titleWords.some(word => {
      // Simple case: exact word match
      if (word === lower) return true;

      // If word has hyphen, only match if keyword is the full word or first part
      if (word.includes('-')) {
        const firstPart = word.split('-')[0];
        return word === lower || firstPart === lower;
      }

      // For non-hyphenated words, check if it contains keyword (for morphological variants)
      return word.includes(lower);
    });

    if (hasDirectExactMatch) {
      score += 500;  // Maximum priority for exact title match
      directMatches++;
      hasTitleMatch = true;
    } else {
      // [RATIONALE]: PARTIAL TITLE MATCH - 150 points
      // Handles morphological variations: 'dance' matching 'dancing' in "Salsa Dancing Night"
      // Increased from 70 to maintain strong signal for partial matches
      // MIN LENGTH 4: Prevents false positives from short words like "in", "is", "at", "on"
      // HYPHEN-AWARE: Prevents "sports" from matching "e-sports" (compound words)
      const titleWords = lowerTitle.split(/\s+/);
      const hasPartialMatch = titleWords.some(word => {
        // Skip if minimum length not met
        if (word.length < 4 || lower.length < 4) return false;

        // [RATIONALE]: Hyphen compound word protection - Prevents "E-Sports" matching "sports"
        // Compound words with hyphens are semantic units where prefix modifies meaning
        // "E-Sports" (electronic sports/gaming) ≠ "Sports" (physical athletics)
        // Only match if keyword matches the ENTIRE compound, not just the tail part
        if (word.includes('-')) {
          // Match only if keyword is the complete word or matches complete first part
          // This prevents "sports" from matching "e-sports" but allows "dance" to match "ice-dance"
          const parts = word.split('-');
          const firstPart = parts[0];
          // Only match the first part (prefix determines meaning) or full word exact match
          return word === lower ||
            firstPart === lower ||
            (firstPart.length >= 4 && (firstPart.includes(lower) || lower.includes(firstPart)));
        }

        // Normal partial matching for non-hyphenated words
        return word.includes(lower) || lower.includes(word);
      });
      if (hasPartialMatch) {
        score += 150;
        directMatches++;
        hasTitleMatch = true;
      }
    }
  });

  // [RATIONALE]: SYNONYM TITLE MATCH - 200 points
  // Strong signal but lower than direct matches (e.g., 'disco' for 'dance' query)
  // Increased from 45 to give synonyms more weight while keeping them below direct matches
  // STOP WORDS are also skipped here to prevent noise from expanded functional words
  expandedKeywords.forEach(keyword => {
    if (!originalKeywords.includes(keyword)) {
      // [RATIONALE]: Skip stop words in synonym expansion too
      if (STOP_WORDS.includes(keyword)) {
        return;
      }

      // [RATIONALE]: Hyphen-aware exact match check
      // Check if keyword appears in title, but NOT as part of hyphenated compound
      // "sports" should NOT match "e-sports gaming" because "e-sports" is a compound word
      const titleWords = lowerTitle.split(/\s+/);
      const hasExactMatch = titleWords.some(word => {
        // Simple case: exact word match
        if (word === keyword) return true;

        // If word has hyphen, only match if keyword is the full word or first part
        if (word.includes('-')) {
          const firstPart = word.split('-')[0];
          return word === keyword || firstPart === keyword;
        }

        // For non-hyphenated words, check if it contains keyword (for morphological variants)
        return word.includes(keyword);
      });

      if (hasExactMatch) {
        score += 200;  // Strong synonym match in title
        synonymMatches++;
        hasTitleMatch = true;
      } else {
        // [RATIONALE]: Partial synonym match in title - 80 points
        // Maintains flexibility for morphological variations in synonym matches
        // MIN LENGTH 4: Prevents false positives like "in" matching "dining", "wine"
        // or "is" matching "cuisine", "disco" - these are stop words or articles
        // HYPHEN-AWARE: Prevents "sports" from matching "e-sports" (compound words)
        const titleWords = lowerTitle.split(/\s+/);
        const hasPartialMatch = titleWords.some(word => {
          // Skip if minimum length not met
          if (word.length < 4 || keyword.length < 4) return false;

          // [RATIONALE]: Hyphen compound word protection - Same as direct match logic
          // Prevents synonym "sports" from matching "E-Sports" gaming tournament
          if (word.includes('-')) {
            const parts = word.split('-');
            const firstPart = parts[0];
            // Only match first part (prefix determines meaning) or full exact match
            return word === keyword ||
              firstPart === keyword ||
              (firstPart.length >= 4 && (firstPart.includes(keyword) || keyword.includes(firstPart)));
          }

          // Normal partial matching for non-hyphenated words
          return word.includes(keyword) || keyword.includes(word);
        });
        if (hasPartialMatch) {
          score += 80;
          synonymMatches++;
          hasTitleMatch = true;
        }
      }
    }
  });

  // Venue matching (only if venue is in query)
  const venueScore = calculateVenueScore(event, query);
  score += venueScore;
  if (venueScore > 0) directMatches++;

  // [RATIONALE]: CATEGORY MATCH with Browsing Mode detection
  // Distinguishes between two user intents:
  // 1. BROWSING MODE: User searches "fitness" → wants ALL fitness events (yoga, pilates, etc.)
  //    Award 200 points to guarantee visibility (above 150-point threshold)
  // 2. SEARCHING MODE: User searches "dance" → wants specific dance events only
  //    Award 30-45 points, let title matches (500 points) determine relevance
  originalKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();
    if (lowerCategory === lower || lowerCategory.includes(lower)) {
      let categoryScore = 30;

      // [RATIONALE]: Browsing Mode Activation
      // If user searches a PRIMARY CATEGORY term (e.g., "fitness", "music"),
      // award 200 points to guarantee ALL events in that category are visible.
      // This bypasses the 150-point precision threshold for broad category browsing.
      // Example: Search "fitness" → Show yoga, pilates, crossfit (all fitness activities)
      if (PRIMARY_CATEGORIES.includes(lower) && lowerCategory === lower) {
        categoryScore = 200;  // Browsing Mode: Show all events in category
      }
      // [RATIONALE]: Targeted boost for specific search concepts
      // For specific searches like 'game', 'quiz' that need better recall but aren't
      // full category browses, give a small boost to survive threshold
      else {
        const specificConcepts = ['game', 'games', 'quiz'];
        if (specificConcepts.includes(lower)) {
          categoryScore = 45; // Small boost for specific concept recall
        }
      }

      score += categoryScore;
      directMatches++;
    }
  });

  // [RATIONALE]: Synonym category matches - 15 points (halved from 30)
  // Minimal weight to prevent generic category overlap from creating false positives
  expandedKeywords.forEach(keyword => {
    if (!originalKeywords.includes(keyword)) {
      if (lowerCategory === keyword || lowerCategory.includes(keyword)) {
        score += 15;
        synonymMatches++;
      }
    }
  });

  // [RATIONALE]: DESCRIPTION MATCH - 20 points (reduced from 40)
  // Minimized to reduce noise from generic text that happens to contain search terms
  // Description text is often verbose and can create false positives
  // STOP WORDS are skipped to prevent noise (e.g., "cheap drinks" in karaoke description)
  originalKeywords.forEach(keyword => {
    const lower = keyword.toLowerCase();

    // [RATIONALE]: Skip stop words in description scoring
    if (STOP_WORDS.includes(lower)) {
      return;
    }

    if (lowerDescription.includes(lower)) {
      score += 20;
      directMatches++;
    }
  });

  // [RATIONALE]: Synonym description matches - 10 points (minimal)
  // Very low weight to avoid noise from common words in long descriptions
  expandedKeywords.forEach(keyword => {
    if (!originalKeywords.includes(keyword)) {
      // [RATIONALE]: Skip stop words in synonym description scoring
      if (STOP_WORDS.includes(keyword)) {
        return;
      }

      if (lowerDescription.includes(keyword)) {
        score += 10;
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
    synonym: synonymMatches,
    hasTitleMatch  // Track if event has any title match for senior sorting
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
    expandedKeywords,  // Show the actual expanded keywords for debugging
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
      _synonym: relevance.synonym,
      _hasTitleMatch: relevance.hasTitleMatch
    };
  });

  // [RATIONALE]: THRESHOLD FILTER - Remove events with score < 150
  // Increased from 40 → 150 to eliminate weak partial matches and false positives
  // (e.g., "Craft Beer" and "Silent Disco" scoring 95 points for 'games' query)
  // With expanded synonyms (puzzle, challenge, escape), relevant events like "Escape Room"
  // now score 200+ points through synonym title matches, so higher threshold is safe
  //
  // EXCEPTION: If all keywords are stop words (e.g., "events tomorrow", "cheap events today"),
  // user is doing pure filter-based browsing with no semantic intent. Skip threshold and show all.
  const allKeywordsAreStopWords = keywords.every(word =>
    STOP_WORDS.includes(word.toLowerCase())
  );

  const thresholdFiltered = allKeywordsAreStopWords
    ? scored  // Show all events when only filtering by price/time/location
    : scored.filter(event => event._relevanceScore >= 150);

  // [RATIONALE]: SENIOR SORTING LOGIC - Title matches ALWAYS rank above non-title matches
  // Primary sort: hasTitleMatch (boolean) - ensures 'Salsa Dancing Night' beats 'Board Game Café'
  // Secondary sort: relevance score - ranks within each tier (title-match vs non-title-match)
  // This is the industry-standard approach: semantic relevance trumps statistical matching
  thresholdFiltered.sort((a, b) => {
    // Title match priority - if one has title match and other doesn't, prioritize it
    if (a._hasTitleMatch && !b._hasTitleMatch) return -1;
    if (!a._hasTitleMatch && b._hasTitleMatch) return 1;

    // Both have or don't have title match - sort by relevance score
    if (b._relevanceScore !== a._relevanceScore) {
      return b._relevanceScore - a._relevanceScore;
    }

    // Tie-breaker: event date (sooner first)
    return new Date(a.event_date).getTime() - new Date(b.event_date).getTime();
  });

  // Log top results for debugging
  console.log('🎯 Top 5 results:', thresholdFiltered.slice(0, 5).map(e => ({
    title: e.title,
    score: e._relevanceScore,
    hasTitleMatch: e._hasTitleMatch,
    matched: e._matched,
    direct: e._direct,
    synonym: e._synonym
  })));

  return thresholdFiltered;
}
