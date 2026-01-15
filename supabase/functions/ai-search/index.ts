// @ts-nocheck - Deno runtime types (not available in Node.js TypeScript)
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.203.0/http/server.ts";

const openAIApiKey = typeof Deno !== "undefined" && Deno.env ? Deno.env.get('OPENAI_API_KEY') : undefined;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();
    console.log('🔍 AI Search request:', prompt);

    if (!openAIApiKey) {
      throw new Error('OPENAI_API_KEY is not configured');
    }

    // Call OpenAI to analyze the search prompt
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are an event search analyzer. Extract search parameters from natural language queries.
Return a JSON object with:
- categories: array of relevant categories (music, culture, food, fitness, business, entertainment, social, sports, nightlife)
- keywords: array of search keywords
- price_range: object with min and max (0 means free, use reasonable defaults)
- time_preference: string (tonight, tomorrow, weekend, week, anytime)
- location: string (default: "Copenhagen")

Examples:
"jazz music tonight" -> {"categories":["music"],"keywords":["jazz","music"],"price_range":{"min":0,"max":2000},"time_preference":"tonight","location":"Copenhagen"}
"cheap yoga classes" -> {"categories":["fitness"],"keywords":["yoga","classes"],"price_range":{"min":0,"max":200},"time_preference":"anytime","location":"Copenhagen"}
"games this weekend" -> {"categories":["entertainment"],"keywords":["games"],"price_range":{"min":0,"max":2000},"time_preference":"weekend","location":"Copenhagen"}`
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenAI API error:', error);
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;

    console.log('🤖 OpenAI response:', content);

    // Parse the JSON response from OpenAI
    let analysis;
    try {
      analysis = JSON.parse(content);
    } catch (e) {
      console.error('Failed to parse OpenAI response:', content);
      // Fallback to basic extraction
      analysis = {
        categories: [],
        keywords: prompt.toLowerCase().split(' ').filter(w => w.length > 2),
        price_range: { min: 0, max: 2000 },
        time_preference: 'anytime',
        location: 'Copenhagen'
      };
    }

    console.log('✅ Analysis complete:', analysis);

    return new Response(
      JSON.stringify(analysis),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('❌ Error in ai-search function:', error);
    return new Response(
      JSON.stringify({
        error: error.message,
        // Fallback response
        categories: [],
        keywords: [],
        price_range: { min: 0, max: 2000 },
        time_preference: 'anytime',
        location: 'Copenhagen'
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200, // Return 200 with fallback data
      }
    );
  }
});
