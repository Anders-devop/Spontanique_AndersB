# AI Search Bar - Candidate Technical Test

## Overview

This is a technical assessment for a senior developer position at Spontanique. The project contains a **fully functional AI-powered event search system** with real production code extracted from our platform.

**Time Allocation:** 1 week (expected 12-16 hours of focused work)

This is a **senior-level test** - the codebase is intentionally complex and mirrors production architecture. You should be comfortable navigating large codebases and understanding sophisticated algorithms.

## What This Project Contains

- ✅ **Full production AI search UI** with animations and framer-motion
- ✅ **50 diverse mock events** (music, culture, food, fitness, nightlife, etc.)
- ✅ **Complete production search engine** with keyword expansion and relevance scoring
- ✅ **Venue entity recognition** (Tivoli, Vega, KB Hallen, Parken, Opera House, etc.)
- ✅ **Synonym mapping** for natural language queries (50+ mappings)
- ✅ **Advanced filtering** (price, date, location, category, partner events)
- ✅ **Mock AI analyzer** that simulates OpenAI behavior without external APIs
- ✅ **Production-quality UI** using shadcn/ui components and Tailwind CSS

## Getting Started

### Prerequisites

- Node.js 18+ or Bun
- npm or bun package manager
- A Supabase account (free tier works fine)
- An OpenAI API key

### 1. Installation

```bash
npm install
```

### 2. Supabase Setup

This project uses **Supabase Edge Functions** to call OpenAI for AI-powered search analysis, exactly like production.

#### Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a free account
2. Create a new project (remember your database password)
3. Note your **Project URL** and **anon key** from Settings → API

#### Deploy the Edge Function

Install Supabase CLI:
```bash
npm install -g supabase
```

Login and link your project:
```bash
supabase login
supabase link --project-ref YOUR_PROJECT_REF
```

Your project ref is the part before `.supabase.co` in your project URL.

Deploy the edge function:
```bash
supabase functions deploy ai-search
```

#### Set the OpenAI API Key

Set your OpenAI API key as a secret in Supabase:
```bash
supabase secrets set OPENAI_API_KEY=sk-your-openai-api-key-here
```

Get your OpenAI API key from [platform.openai.com/api-keys](https://platform.openai.com/api-keys)

### 3. Configure the App

Update `src/hooks/useAISearch.tsx` with your Supabase credentials (lines 6-7):

```typescript
const SUPABASE_URL = 'https://xxxxx.supabase.co'; // Your project URL
const SUPABASE_ANON_KEY = 'eyJhb...'; // Your anon key
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:8080](http://localhost:8080) in your browser.

### Build for Production

```bash
npm run build
```

### Test the Search

Try these example searches to understand how the system works:
- "jazz music tonight" - Tests category + time preference extraction
- "cheap yoga classes" - Tests price + category matching
- "games this weekend" - Tests synonym expansion for "games"
- "food events under 200 DKK" - Tests price filtering
- "Tivoli events" - Tests venue entity recognition
- "live music at Vega" - Tests combined venue + category matching

## How the Search Works

### 1. User Input
User types a natural language query like:
- "jazz music tonight"
- "cheap yoga classes"
- "games this weekend"

### 2. AI Analysis (OpenAI via Edge Function)
The AI analyzer calls OpenAI GPT-4 through a Supabase Edge Function (`supabase/functions/ai-search/index.ts`) to extract:
- **Categories**: music, culture, food, fitness, etc.
- **Price preference**: cheap, expensive, free
- **Time preference**: tonight, tomorrow, weekend, week
- **Keywords**: individual search terms
- **Location**: defaults to Copenhagen

### 3. Keyword Expansion
Keywords are expanded using `SYNONYM_MAP`:
- "music" → ["concert", "live", "band", "performance", "show", "gig", ...]
- "yoga" → ["pilates", "meditation", "mindfulness", "wellness", ...]

### 4. Relevance Scoring
Each event gets a relevance score based on:
- **Title matches** (50 points per keyword)
- **Venue matches** (100 points for recognized venues)
- **Category matches** (30 points)
- **Description matches** (20 points)
- **Synonym matches** (15 points)
- **Availability** (up to 5 points based on tickets left)
- **Date proximity** (10 points for events within 7 days)

### 5. Ranking & Display
Events are sorted by relevance score and displayed to the user.

---

## Your Task

**Choose ONE of the following challenges** (or propose your own improvement):

### Option A: Improve Search Relevance (10-14 hours)

**Problem:**  
Users searching for "games" or "quiz night" aren't getting optimal results. The current algorithm may not properly recognize gaming/quiz-related events or might be weighting relevance factors incorrectly.

**Your Mission:**
1. **Analyze** the current search algorithm in `src/lib/searchEngine.ts`:
   - Study the `SYNONYM_MAP` - how does it expand keywords?
   - Examine `calculateRelevanceScore()` - what gets the highest weight?
   - Test various queries - which work well, which don't?

2. **Identify** the root causes:
   - Are gaming synonyms missing or insufficient?
   - Is the scoring algorithm weighting factors incorrectly?
   - Are there false positives drowning out real matches?

3. **Implement** improvements:
   - Enhance keyword expansion for gaming/quiz/trivia events
   - Adjust relevance scoring weights
   - Add new scoring factors if needed
   - Consider edge cases (e.g., "game night" vs "Olympic games")

4. **Test thoroughly**:
   - Ensure "games" returns gaming events as top results
   - Verify "quiz night" surfaces quiz/trivia events
   - Confirm other searches still work correctly
   - Test with queries like: "board games", "pub quiz", "trivia night"

5. **Document everything** in `SOLUTION.md`:
   - Problem analysis with examples
   - Root cause identification
   - Changes made and rationale
   - Before/after comparison
   - Trade-offs and limitations

**Success Criteria:**
- ✅ Query "games" returns gaming/quiz/trivia events as top 5 results
- ✅ Query "quiz night" returns pub quiz/trivia events
- ✅ No regression in other search categories (music, food, etc.)
- ✅ Clear documentation explaining your reasoning
- ✅ Code is well-commented and maintainable

---

### Option B: Add Smart Filter Suggestions (10-14 hours)

**Feature:**  
When users perform a search, automatically analyze the results and suggest relevant quick filters to help them narrow down options.

**Your Mission:**
1. **Analyze search results** to detect patterns:
   - What categories are most common?
   - Which venues appear frequently?
   - What's the price distribution?
   - When are most events happening?

2. **Generate contextual suggestions**:
   - For "music" search → Suggest "Jazz | Rock | Tonight | Vega | Free"
   - For "food" search → Suggest "Wine Tasting | Under 200 DKK | This Weekend"
   - For "Tivoli" search → Suggest "Today | Tomorrow | Music | Culture"

3. **Design intuitive UI**:
   - Pill-style quick filters below search bar
   - Clicking applies the filter immediately
   - Show active state for applied filters
   - Responsive design (stack on mobile)

4. **Implement smart logic**:
   - Only show suggestions that would actually filter results
   - Limit to 5-7 most relevant suggestions
   - Update suggestions when search changes
   - Handle edge cases (no results, all same category, etc.)

5. **Polish the experience**:
   - Add smooth animations (framer-motion)
   - Ensure accessibility (keyboard navigation)
   - Mobile-friendly layout
   - Clear visual feedback

**Success Criteria:**
- ✅ Smart suggestions appear after each search
- ✅ Suggestions are contextually relevant and useful
- ✅ UI is polished and responsive (desktop + mobile)
- ✅ Clicking suggestions correctly filters results
- ✅ Edge cases handled gracefully
- ✅ Code is component-based and reusable
- ✅ Documented in `SOLUTION.md` with screenshots

---

### Option C: Propose Your Own Improvement

Have a different idea to improve the search experience? We'd love to see it! Document your proposal in `SOLUTION.md` and implement it.

---

## Project Structure

```
ai-searchbar-candidate-test/
├── src/
│   ├── components/
│   │   ├── search/
│   │   │   └── AISearchBar.tsx           # ⭐ Main search component
│   │   ├── events/
│   │   │   ├── EventCard.tsx             # Event card display
│   │   │   └── EventsList.tsx            # Events grid layout
│   │   ├── filters/
│   │   │   ├── CategorySelect.tsx        # Category dropdown
│   │   │   ├── PriceFilter.tsx           # Price range slider
│   │   │   ├── DateFilter.tsx            # Date picker
│   │   │   └── ResetFilters.tsx          # Reset button
│   │   ├── ui/                           # shadcn/ui components
│   │   └── CategoryFilter.tsx            # Main filter component
│   ├── hooks/
│   │   ├── useAISearch.tsx               # ⭐ AI analysis hook
│   │   └── useFilteredEvents.tsx         # Client-side filtering
│   ├── lib/
│   │   ├── mockData.ts                   # ⭐ 50 mock events
│   │   ├── mockAI.ts                     # ⭐ Mock AI prompt parser
│   │   ├── searchEngine.ts               # ⭐⭐⭐ CORE SEARCH ALGORITHM
│   │   └── utils.ts                      # Utility functions
│   ├── types/
│   │   └── event.ts                      # TypeScript interfaces
│   ├── pages/
│   │   └── Events.tsx                    # Main events page
│   ├── App.tsx                           # App entry point
│   └── main.tsx                          # React entry point
├── README.md                             # This file
├── package.json                          # Dependencies
├── tailwind.config.ts                    # Tailwind configuration
└── vite.config.ts                        # Vite configuration
```

**⭐ = Critical files to understand**

---

## Key Files to Understand

### 1. `src/lib/searchEngine.ts` ⭐⭐⭐ **MOST IMPORTANT**

The heart of the search system - **this is where you'll spend most of your time**.

**What it contains:**
- **`SYNONYM_MAP`** (lines 4-25): Maps keywords to synonyms for expansion
  - Example: "music" → ["concert", "live", "band", "performance", ...]
  - **50+ category mappings** covering all event types
  
- **`VENUE_ENTITIES`** (lines 28-39): Recognizes famous Copenhagen venues
  - Maps venue names to canonical names and aliases
  - Assigns importance weights (Tivoli: 100, Vega: 90, etc.)
  
- **`expandKeywords()`** (lines 44-61): Expands search terms using synonyms
  - Takes user query keywords and returns expanded set
  
- **`calculateRelevanceScore()`** (lines 89-191): **The scoring algorithm**
  - **Title matches**: 50 points per keyword
  - **Venue matches**: Up to 100 points for recognized venues
  - **Category matches**: 30 points
  - **Description matches**: 20 points
  - **Synonym matches**: 15 points for expanded keywords
  - **Availability bonus**: Up to 5 points based on tickets left
  - **Recency bonus**: 10 points for events within 7 days
  
- **`searchEvents()`** (lines 264-353): Main search orchestration
  - Parses query and extracts keywords
  - Expands keywords with synonyms
  - Filters by time, price, categories
  - Calculates relevance scores
  - Sorts and returns ranked results

**Why this matters:**  
This is production code - any changes you make here would directly affect how thousands of users find events. Understanding the scoring weights and keyword expansion is critical for Option A.

---

### 2. `src/lib/mockData.ts` ⭐

**50 diverse mock events** designed to test the search algorithm:

**Categories covered:**
- Music (jazz, rock, classical, electronic)
- Culture (art, theater, museums)
- Food (wine tasting, cooking classes, food tours)
- Fitness (yoga, running, CrossFit)
- Nightlife (clubs, bars, parties)
- Social (networking, meetups)
- Sports (football, games, tournaments)
- Business (workshops, conferences)

**Venues included:**
- Premium venues: Tivoli Gardens, Parken Stadium, Opera House
- Music venues: Vega, KB Hallen, Rust, Pumpehuset, Loppen
- Cultural venues: Royal Danish Theatre, Louisiana Museum
- Food venues: Reffen Street Food, various restaurants

**Event types:**
- **Native events** (`source_type: 'native'`) - Our platform's events
- **External events** - From Eventbrite, GetYourGuide, Billetto, Ticketmaster
- Price range: 0 DKK (free) to 1200 DKK
- Dates: Spread across next 3 weeks
- Rich descriptions with varied keywords for testing

---

### 3. `src/lib/mockAI.ts` ⭐

**Mock AI prompt analyzer** - simulates what OpenAI would do in production:

**What it does:**
- Parses natural language queries
- Extracts categories (e.g., "music", "food", "yoga")
- Detects price preferences ("cheap", "free", "expensive")
- Identifies time filters ("tonight", "tomorrow", "weekend")
- Generates human-readable explanations

**Why it's mock:**  
In production, we call OpenAI's API. Here, we use rule-based regex patterns to simulate the same behavior without external dependencies. This lets you test locally without API keys.

**Example flow:**
```
User types: "cheap jazz music tonight"
↓
mockAI extracts:
  - categories: ["music"]
  - priceRange: { min: 0, max: 200 }
  - timePreference: "tonight"
  - keywords: ["cheap", "jazz", "music", "tonight"]
↓
searchEngine.ts takes over:
  - Expands "music" to ["concert", "live", "band", ...]
  - Filters events for tonight
  - Applies price filter
  - Scores remaining events
  - Returns sorted results
```

---

### 4. `src/components/search/AISearchBar.tsx` ⭐

**Production-quality search UI** with:
- **Real-time search** with loading states
- **Example prompts** to guide users
- **Framer Motion animations** for smooth transitions
- **Clear/reset functionality**
- **Mobile-responsive design**
- **Accessibility** (keyboard navigation, ARIA labels)

**User experience flow:**
1. User sees example prompts ("Jazz music tonight", "Cheap yoga classes")
2. Clicks example or types custom query
3. Sees "Analyzing..." animation
4. Sees "Searching..." animation
5. Gets explanation: "Found 12 events in music for tonight matching your search"
6. Results appear below, sorted by relevance

---

### 5. `src/hooks/useAISearch.tsx` ⭐

Orchestrates the AI search flow:
```typescript
1. User submits prompt
2. Call analyzeMockPrompt() to extract filters
3. Call searchEvents() with extracted filters
4. Show success toast with explanation
5. Return results to parent component
```

**Error handling:**
- Shows user-friendly error messages
- Logs detailed errors to console for debugging
- Handles empty results gracefully

---

### 6. `src/hooks/useFilteredEvents.tsx`

**Client-side filtering** after initial search:
- Filters by category (if "All" is not selected)
- Filters by location (city or venue name)
- Filters by price range
- Filters by specific date
- Filters by partner status

**Why separate from searchEngine.ts?**  
The search engine does the initial smart ranking. This hook applies additional UI filters that users toggle after seeing results.

## Guidelines

### What You CAN Change ✅
- Search algorithm logic in `searchEngine.ts`
- Keyword expansion maps (`SYNONYM_MAP`)
- Scoring weights and formulas
- Add new components for features (Option B)
- Add new hooks or utilities
- Modify filtering logic
- UI improvements (animations, responsiveness)

### What You Should NOT Change ❌
- Core component structure
- Mock data format (`EventWithTickets` interface)
- Build configuration files
- Package dependencies (unless necessary)

### Best Practices
- **Comment your changes** - Explain your reasoning
- **Test thoroughly** - Try many different queries
- **Keep it maintainable** - Production code quality
- **Document everything** - `SOLUTION.md` is critical

## Evaluation Criteria

We will evaluate based on:

### Technical Skills (40%)
- Code quality and TypeScript usage
- Algorithm efficiency
- Problem-solving approach
- Testing strategy

### Understanding (30%)
- Comprehension of existing codebase
- Analysis of the problem
- Rationale for changes

### Implementation (20%)
- Feature completeness
- Bug-free execution
- Edge case handling

### Communication (10%)
- Clear documentation
- Code comments
- Explanation of decisions

## Submission

Create a `SOLUTION.md` file with:
1. **Problem Analysis**: What did you discover?
2. **Solution Approach**: What did you change and why?
3. **Results**: How did it improve?
4. **Trade-offs**: What compromises did you make?
5. **Future Improvements**: What would you do with more time?

Include before/after examples showing the improvement.

## Questions?

If anything is unclear about the requirements or codebase, document your assumptions in `SOLUTION.md`.

## Tips

- Start by exploring the search with different queries
- Use browser console logs to understand how scoring works
- Test edge cases (empty results, multiple matches, etc.)
- Keep changes focused and well-documented
- Commit your work frequently

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Framer Motion (animations)
- Vite (build tool)

---

**Good luck! We're excited to see your solution. 🚀**
