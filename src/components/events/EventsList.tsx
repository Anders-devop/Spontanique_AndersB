import React from 'react';
import { EventCard } from './EventCard';
import { EventWithTickets } from '@/types/event';

interface EventsListProps {
  events: EventWithTickets[];
}

export const EventsList: React.FC<EventsListProps> = ({ events }) => {
  if (events.length === 0) {
    return (
      <div className="text-center py-16 bg-muted/50 rounded-lg border border-border">
        <h3 className="text-xl font-semibold text-foreground mb-2">No events found</h3>
        <p className="text-muted-foreground">Try adjusting your filters or search query</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {events.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
};
