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
}

export const AISearchBar = ({ 
  onAISearch, 
  placeholder = "Try: 'jazz music tonight' or 'cheap yoga classes'...", 
  initialPrompt, 
  showClearButton = true 
}: AISearchBarProps) => {
  const [prompt, setPrompt] = useState(initialPrompt || '');
  const [lastExplanation, setLastExplanation] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const { analyzePrompt, isAnalyzing } = useAISearch();

  useEffect(() => {
    setPrompt(initialPrompt || '');
  }, [initialPrompt]);

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
        let feedbackMessage = result.explanation;
        if (result.totalFound === 0) {
          feedbackMessage = `No events found for "${prompt}". Try adjusting your search or check back later!`;
        } else if (result.totalFound > 0 && result.totalFound <= 3) {
          feedbackMessage = `Found ${result.totalFound} perfect match${result.totalFound > 1 ? 'es' : ''} for "${prompt}"`;
        } else if (result.totalFound > 20) {
          feedbackMessage = `Found ${result.totalFound} events! Showing the most relevant ones first.`;
        }
        
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
                  onClick={() => setPrompt(example)}
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
