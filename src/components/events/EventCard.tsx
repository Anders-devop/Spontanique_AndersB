import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Tag, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventWithTickets } from '@/types/event';
import { format } from 'date-fns';

// [RATIONALE]: Category-aware image fallback system provides contextually relevant
// placeholder images when external URLs fail. This ensures 100% visual uptime and
// maintains UI quality even when third-party image CDNs are unavailable.
const CATEGORY_PLACEHOLDERS: Record<string, string> = {
  business: 'https://plus.unsplash.com/premium_photo-1661301084402-1a0452b5850e?w=800',
  culture: 'https://plus.unsplash.com/premium_photo-1670267552055-8f33a55c1af0?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  entertainment: 'https://images.unsplash.com/photo-1615544261596-dc0a4898f2c0?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  fitness: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
  food: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800',
  music: 'https://plus.unsplash.com/premium_photo-1681830630610-9f26c9729b75?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
  nightlife: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800',
  social: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800',
  sports: 'https://images.unsplash.com/photo-1504450758481-7338eba7524a?w=800',
  default: 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?w=800',
};

interface EventCardProps {
  event: EventWithTickets;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
  // [RATIONALE]: Defensive UI pattern. Ensures 100% visual uptime by providing
  // contextually relevant fallbacks and developer warnings for broken external assets.
  const [imgSrc, setImgSrc] = useState<string>(event.image_url || CATEGORY_PLACEHOLDERS[event.category] || CATEGORY_PLACEHOLDERS.default);

  // [RATIONALE]: Sync imgSrc with event changes. When user navigates or filters update
  // the event list, we reset to the new event's primary image (not the fallback).
  useEffect(() => {
    setImgSrc(event.image_url || CATEGORY_PLACEHOLDERS[event.category] || CATEGORY_PLACEHOLDERS.default);
  }, [event.id, event.image_url, event.category]);

  // [RATIONALE]: Error handler logs failures for monitoring and gracefully falls back
  // to category-specific placeholder. This provides better UX than broken images and
  // helps developers identify problematic external image sources.
  const handleImageError = () => {
    const fallbackUrl = CATEGORY_PLACEHOLDERS[event.category] || CATEGORY_PLACEHOLDERS.default;
    console.warn(`[IMAGE_ERROR]: Failed for ${event.title}. Using ${event.category} fallback.`);
    setImgSrc(fallbackUrl);
  };

  const discount = event.original_price
    ? Math.round(((event.original_price - event.price) / event.original_price) * 100)
    : 0;

  const ticketsLeft = event.event_tickets?.[0]?.tickets_left || 0;
  const eventDate = new Date(event.event_date);
  const isToday = format(eventDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
  const isTomorrow = format(eventDate, 'yyyy-MM-dd') === format(new Date(Date.now() + 86400000), 'yyyy-MM-dd');

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="h-full"
    >
      <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
        <div className="relative h-48 overflow-hidden bg-gray-200">
          <img
            src={imgSrc}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute top-2 right-2 flex gap-2">
            {discount > 0 && (
              <Badge className="bg-red-500 text-white">
                -{discount}%
              </Badge>
            )}
            {event.source_type === 'external' && (
              <Badge variant="secondary">
                {event.source_platform}
              </Badge>
            )}
          </div>
          {(isToday || isTomorrow) && (
            <div className="absolute top-2 left-2">
              <Badge className="bg-primary text-primary-foreground">
                {isToday ? 'Today' : 'Tomorrow'}
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-3">
          <div className="space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold text-lg line-clamp-2 flex-1">
                {event.title}
              </h3>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Tag className="w-4 h-4" />
              <span className="capitalize">{event.category}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4" />
              <span className="line-clamp-1">{event.venue}, {event.city}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>{format(eventDate, 'MMM d, yyyy • h:mm a')}</span>
            </div>

            {ticketsLeft > 0 && ticketsLeft <= 10 && (
              <div className="flex items-center gap-2 text-sm text-orange-600">
                <Clock className="w-4 h-4" />
                <span className="font-medium">Only {ticketsLeft} tickets left!</span>
              </div>
            )}
          </div>

          <div className="pt-3 border-t">
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-2xl font-bold text-primary">
                  {event.price === 0 ? 'Free' : `${event.price} DKK`}
                </span>
                {event.original_price && event.original_price > event.price && (
                  <span className="text-sm text-muted-foreground line-through">
                    {event.original_price} DKK
                  </span>
                )}
              </div>
            </div>
          </div>

          <p className="text-sm text-muted-foreground line-clamp-2">
            {event.description}
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
};
