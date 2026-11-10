"use client";

import { Carousel } from "@/components/common/Carousel";
import { RevealItem } from "@/components/animations/Reveal";
import { EventTicketCard } from "@/components/events/EventTicketCard";
import type { EventItemWithStatus } from "@/types/events";

/** More events under an event page, as the same ticket cards the list uses. */
export function OtherEventsRow({
  events,
  title,
}: {
  events: EventItemWithStatus[];
  title: string;
  /** Kept for the page's call site. */
  statusLabels?: unknown;
}) {
  if (!events.length) return null;

  return (
    <div>
      <h2 className="mb-6 text-xl font-extrabold text-foreground sm:text-2xl">
        {title}
      </h2>
      <Carousel
        ariaLabel={title}
        slideClassName="flex-[0_0_86%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
        options={{ slidesToScroll: 1 }}
      >
        {events.map((event, index) => (
          <RevealItem
            key={event.id}
            direction="up"
            delay={index * 0.05}
            className="h-full"
          >
            <EventTicketCard event={event} index={index} />
          </RevealItem>
        ))}
      </Carousel>
    </div>
  );
}
