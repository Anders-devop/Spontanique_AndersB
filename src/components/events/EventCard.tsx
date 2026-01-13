import React from 'react';
import { motion } from 'framer-motion';
import { Clock, MapPin, Tag, Calendar } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { EventWithTickets } from '@/types/event';
import { format } from 'date-fns';

interface EventCardProps {
  event: EventWithTickets;
}

export const EventCard: React.FC<EventCardProps> = ({ event }) => {
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
            src={event.image_url || '/placeholder.svg'}
            alt={event.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = '/placeholder.svg';
            }}
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
