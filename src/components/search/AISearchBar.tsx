import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAISearch } from '@/hooks/useAISearch';
import { motion, AnimatePresence } from 'framer-motion';

interface AISearchBarProps {
  onAISearch: (filters: {
    categories: string[];
    priceRange: [number, number];
    timePreference: string;
    mood: string;
    explanation: string;
    searchKeywords?: string;
    prompt?: string;
    location?: string;
    events?: any[];
    totalFound?: number;
  }) => void;
  placeholder?: string;
  initialPrompt?: string;
  showClearButton?: boolean;
  aiResultCount?: number;
  filteredResultCount?: number;
  isAiSearchActive?: boolean;
  activeFilters?: {
    selectedCategory?: string;
    priceRange?: [number, number];
    selectedDate?: string;
    searchLocation?: string;
    showOnlyPartnerEvents?: boolean;
  };
}

export const AISearchBar = ({
  onAISearch,
  placeholder = "Try: 'jazz music tonight' or 'cheap yoga classes'...",
  initialPrompt,
  showClearButton = true,
  aiResultCount = 0,
  filteredResultCount = 0,
  isAiSearchActive = false,
  activeFilters
}: AISearchBarProps) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [lastExplanation, setLastExplanation] = useState('');
  const [baseExplanation, setBaseExplanation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { analyzePrompt, isAnalyzing } = useAISearch();

  useEffect(() => {
    setPrompt(initialPrompt || '');
  }, [initialPrompt]);

  // [RATIONALE]: Dynamic blue box updates - text changes when filters are applied
  // Updates the SAME blue box (no separate yellow box) with filter details
  useEffect(() => {
    if (!isAiSearchActive || !baseExplanation || aiResultCount === 0) return;

    // Build filter details if filters are active
    const filters: string[] = [];

    if (activeFilters?.selectedCategory && activeFilters.selectedCategory !== 'All') {
      filters.push(`category: ${activeFilters.selectedCategory}`);
    }
    if (activeFilters?.priceRange && (activeFilters.priceRange[0] > 0 || activeFilters.priceRange[1] < 2000)) {
      filters.push(`price: ${activeFilters.priceRange[0]}-${activeFilters.priceRange[1]} DKK`);
    }
    if (activeFilters?.selectedDate) {
      filters.push(`date: ${new Date(activeFilters.selectedDate).toLocaleDateString()}`);
    }
    if (activeFilters?.searchLocation) {
      filters.push(`location: ${activeFilters.searchLocation}`);
    }
    if (activeFilters?.showOnlyPartnerEvents) {
      filters.push('partner events only');
    }

    // Update blue box text based on filter state
    if (filteredResultCount < aiResultCount && filters.length > 0) {
      // Filters are reducing results
      setLastExplanation(`Found ${aiResultCount} events, showing ${filteredResultCount} after applying filters (${filters.join(', ')})`);
    } else if (filters.length > 0 && filteredResultCount === aiResultCount) {
      // Filters active but not reducing results
      setLastExplanation(`${baseExplanation} (filters: ${filters.join(', ')})`);
    } else {
      // No filters active, show original message
      setLastExplanation(baseExplanation);
    }
  }, [aiResultCount, filteredResultCount, isAiSearchActive, activeFilters, baseExplanation]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || isAnalyzing) return;

    console.log('Starting AI search with prompt:', prompt);
    setIsSearching(true);

    try {
      const result = await analyzePrompt(prompt);
      if (result) {
        console.log('✅ AI search successful:', result);

        // Show smart feedback based on search results
        // [RATIONALE]: Handle optional totalFound field with nullish coalescing to prevent TypeScript errors
        let feedbackMessage = result.explanation;
        const foundCount = result.totalFound ?? 0;

        if (foundCount === 0) {
          feedbackMessage = `No events found for "${prompt}". Try adjusting your search or check back later!`;
        } else if (foundCount > 0 && foundCount <= 3) {
          feedbackMessage = `Found ${foundCount} perfect match${foundCount > 1 ? 'es' : ''} for "${prompt}"`;
        } else if (foundCount > 20) {
          feedbackMessage = `Found ${foundCount} events! Showing the most relevant ones first.`;
        }

        setBaseExplanation(feedbackMessage);
        setLastExplanation(feedbackMessage);

        onAISearch({
          categories: result.categories,
          priceRange: [result.price_range.min, result.price_range.max],
          timePreference: result.time_preference,
          mood: result.mood,
          explanation: result.explanation,
          searchKeywords: result.keywords.join(' '),
          prompt: prompt,
          location: result.location,
          events: result.events,
          totalFound: result.totalFound
        });
        setIsSearching(false);
      } else {
        setIsSearching(false);
      }
    } catch (error) {
      console.error('AI search error:', error);
      setIsSearching(false);
    }
  };

  const handleClear = () => {
    setPrompt('');
    setLastExplanation('');
    setBaseExplanation('');
    setIsSearching(false);
    onAISearch({
      categories: [],
      priceRange: [0, 2000],
      timePreference: "clear",
      mood: "",
      explanation: "",
      searchKeywords: "",
      prompt: "",
      location: "",
    });
  };

  // [RATIONALE]: Handle example prompt clicks - immediately execute search
  // Users expect quick actions when clicking examples, not just filling the input
  const handleExampleClick = async (examplePrompt: string) => {
    if (isAnalyzing) return;

    setPrompt(examplePrompt);
    setIsSearching(true);

    try {
      const result = await analyzePrompt(examplePrompt);
      if (result) {
        console.log('✅ Example search successful:', result);

        // [RATIONALE]: Same feedback logic as manual search
        let feedbackMessage = result.explanation;
        const foundCount = result.totalFound ?? 0;

        if (foundCount === 0) {
          feedbackMessage = `No events found for "${examplePrompt}". Try adjusting your search or check back later!`;
        } else if (foundCount > 0 && foundCount <= 3) {
          feedbackMessage = `Found ${foundCount} perfect match${foundCount > 1 ? 'es' : ''} for "${examplePrompt}"`;
        } else if (foundCount > 20) {
          feedbackMessage = `Found ${foundCount} events! Showing the most relevant ones first.`;
        }

        setBaseExplanation(feedbackMessage);
        setLastExplanation(feedbackMessage);

        onAISearch({
          categories: result.categories,
          priceRange: [result.price_range.min, result.price_range.max],
          timePreference: result.time_preference,
          mood: result.mood,
          explanation: result.explanation,
          searchKeywords: result.keywords.join(' '),
          prompt: examplePrompt,
          location: result.location,
          events: result.events,
          totalFound: result.totalFound
        });
      }
    } catch (error) {
      console.error('Example search failed:', error);
      setLastExplanation('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const examplePrompts = [
    "Jazz music tonight",
    "Cheap yoga classes",
    "Games this weekend",
    "Food events under 200 DKK"
  ];

  // Show fewer examples on mobile
  const displayPrompts = window.innerWidth < 768 ? examplePrompts.slice(0, 2) : examplePrompts;

  const isLoading = isAnalyzing || isSearching;

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="relative">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 sm:w-5 sm:h-5" />
            <Sparkles className="absolute right-3 top-1/2 transform -translate-y-1/2 text-primary w-4 h-4 sm:w-5 sm:h-5" />
            <Input
              type="text"
              placeholder={placeholder}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="pl-9 pr-9 h-10 sm:h-12 bg-white text-gray-900 border-2 border-gray-200 focus:border-primary text-sm sm:text-base"
              disabled={isLoading}
            />
          </div>
          <div className="flex gap-2">
            <Button
              type="submit"
              disabled={!prompt.trim() || isLoading}
              className="h-10 sm:h-12 px-4 sm:px-6 bg-primary hover:bg-primary/90 text-sm sm:text-base flex-1 sm:flex-none min-w-[100px]"
            >
              {isLoading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-2"
                >
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                  {isSearching ? "Searching..." : "Analyzing..."}
                </motion.div>
              ) : (
                "Search"
              )}
            </Button>
            {(prompt || lastExplanation) && !isLoading && showClearButton && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="h-10 sm:h-12 px-3 sm:px-4 border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900 text-sm sm:text-base"
              >
                Clear
              </Button>
            )}
          </div>
        </div>
      </form>

      <AnimatePresence>
        {lastExplanation && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center gap-2 text-sm bg-primary/10 backdrop-blur-sm p-3 rounded-lg border border-primary/20"
          >
            <Sparkles className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-gray-700">{lastExplanation}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {!prompt && !lastExplanation && !isLoading && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground mb-2">Try these examples:</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {displayPrompts.map((example, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Badge
                  variant="outline"
                  className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors px-3 py-2 text-xs justify-center text-center w-full"
                  onClick={() => handleExampleClick(example)}
                >
                  {example}
                </Badge>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
