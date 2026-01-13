import { useState } from 'react';
import { AISearchResult } from '@/types/event';
import { searchEvents } from '@/lib/searchEngine';
import { mockEvents } from '@/lib/mockData';
import { toast } from 'sonner';

// Configuration - Update these values for your Supabase project
const SUPABASE_URL = 'https://plrhuuatwiwjsnbpicfh.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBscmh1dWF0d2l3anNuYnBpY2ZoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgyNDkzNzAsImV4cCI6MjA4MzgyNTM3MH0.yoIbJlf8xoIoEeqHkweZYYBBx88I_ulu8EyrHm4x020';
console.log('hej')
export const useAISearch = () => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzePrompt = async (prompt: string): Promise<AISearchResult | null> => {
    if (!prompt.trim()) return null;

    setIsAnalyzing(true);
    try {
      console.log('🧠 Analyzing prompt:', prompt);

      // Call the edge function to analyze the prompt with OpenAI
      const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error(`Edge function error: ${response.status}`);
      }

      const analysis = await response.json();
      console.log('🤖 AI analysis:', analysis);

      // Search events using the AI-extracted parameters
      const searchResults = searchEvents(mockEvents, prompt, {
        categories: analysis.categories?.length > 0 ? analysis.categories : undefined,
        priceRange: analysis.price_range,
      });

      // Generate explanation using actual search results length
      const explanation = generateExplanation(
        searchResults.length,
        prompt,
        analysis.categories,
        analysis.time_preference
      );

      const result: AISearchResult = {
        categories: analysis.categories || [],
        price_range: analysis.price_range || { min: 0, max: 2000 },
        time_preference: analysis.time_preference || 'anytime',
        mood: '',
        keywords: analysis.keywords || [],
        explanation,
        location: analysis.location || 'Copenhagen',
        events: searchResults,
        totalFound: searchResults.length,
        searchType: 'ai_powered',
      };

      console.log('✅ AI search completed:', {
        totalFound: result.totalFound,
        topScores: searchResults.slice(0, 5).map((e: any) => ({
          title: e.title,
          score: e._relevanceScore
        })),
        categories: result.categories,
        keywords: result.keywords,
      });

      // Show toast with AI search results count
      // Note: This is the AI's initial result count; manual filters may reduce the final count
      toast.success('🧠 Smart AI Search Complete', {
        description: `${searchResults.length} relevant event${searchResults.length !== 1 ? 's' : ''} found`,
      });

      return result;
    } catch (error) {
      console.error('Error in AI search:', error);
      toast.error('Search Error', {
        description: 'Failed to analyze search. Please check your configuration.',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  return { analyzePrompt, isAnalyzing };
};

function generateExplanation(
  count: number,
  prompt: string,
  categories: string[],
  timePreference: string
): string {
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
