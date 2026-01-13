import { AISearchResult } from '@/types/event';
import { searchEvents, SYNONYM_MAP } from './searchEngine';
import { mockEvents } from './mockData';

/**
 * Mock AI analysis - simulates OpenAI without external API
 * This replicates the production AI behavior using rule-based parsing
 */
export async function analyzeMockPrompt(prompt: string): Promise<AISearchResult> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  const lower = prompt.toLowerCase();
  const keywords = lower.split(' ').filter(word => word.length > 2);
  
  // Extract categories
  const categories: string[] = [];
  const categoryKeywords = ['music', 'culture', 'food', 'fitness', 'business', 'entertainment', 'social', 'sports', 'nightlife'];
  categoryKeywords.forEach(cat => {
    if (lower.includes(cat) || SYNONYM_MAP[cat]?.some(syn => lower.includes(syn))) {
      categories.push(cat);
    }
  });
  
  // Extract price preferences
  let priceRange = { min: 0, max: 10000 };
  if (lower.includes('free')) {
    priceRange = { min: 0, max: 0 };
  } else if (lower.includes('cheap') || lower.includes('affordable')) {
    priceRange = { min: 0, max: 200 };
  } else if (lower.includes('expensive') || lower.includes('premium')) {
    priceRange = { min: 300, max: 10000 };
  }
  
  // Extract time preference
  let timePreference = 'anytime';
  if (lower.includes('tonight') || lower.includes('today')) {
    timePreference = 'tonight';
  } else if (lower.includes('tomorrow')) {
    timePreference = 'tomorrow';
  } else if (lower.includes('weekend')) {
    timePreference = 'weekend';
  } else if (lower.includes('week')) {
    timePreference = 'week';
  }
  
  // Perform search
  const searchResults = searchEvents(mockEvents, prompt, {
    categories: categories.length > 0 ? categories : undefined,
    priceRange: priceRange.max < 10000 ? priceRange : undefined,
  });
  
  // Generate explanation
  const explanation = generateExplanation(searchResults.length, prompt, categories, timePreference);
  
  return {
    categories,
    price_range: priceRange,
    time_preference: timePreference,
    mood: '',
    keywords,
    explanation,
    location: 'Copenhagen',
    events: searchResults,
    totalFound: searchResults.length,
    searchType: 'ai_powered',
  };
}

function generateExplanation(count: number, prompt: string, categories: string[], timePreference: string): string {
  if (count === 0) {
    return `No events found for "${prompt}". Try different keywords or time periods.`;
  }
  
  let parts: string[] = [`Found ${count} event${count === 1 ? '' : 's'}`];
  
  if (categories.length > 0) {
    parts.push(`in ${categories.join(', ')}`);
  }
  
  if (timePreference !== 'anytime') {
    parts.push(`for ${timePreference}`);
  }
  
  return parts.join(' ') + ' matching your search.';
}
