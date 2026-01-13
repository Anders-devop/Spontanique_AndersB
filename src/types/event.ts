export interface EventWithTickets {
  id: string;
  event_key: string;
  title: string;
  description: string;
  category: string;
  venue: string;
  city: string;
  price: number;
  original_price: number | null;
  event_date: string;
  takedown_time: string;
  image_url: string;
  source_type: 'native' | 'external';
  source_platform: 'eventbrite' | 'billetto' | 'getyourguide' | 'ticketmaster' | null;
  booking_mode: 'spontanique_checkout' | 'external_redirect' | 'on_request';
  pricing_mode: 'standard' | 'on_request' | 'from_price' | 'custom';
  affiliate_link: string | null;
  external_booking_url: string | null;
  price_on_request: boolean;
  event_tickets: Array<{ tickets_left: number }>;
  embedding: number[] | null;
}

export interface AISearchResult {
  categories: string[];
  price_range: { min: number; max: number };
  time_preference: string;
  mood: string;
  keywords: string[];
  explanation: string;
  location: string;
  events?: EventWithTickets[];
  totalFound?: number;
  searchType?: 'ai_powered' | 'keyword';
}
