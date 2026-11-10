"use client";

import { useLocale, useTranslations } from "next-intl";
import { EventPosterCard } from "@/components/cards/EventPosterCard";
import { StatusSign } from "@/components/common/StatusSign";
import type { EventItemWithStatus } from "@/types/events";

const signState = { ongoing: "live", upcoming: "next", past: "done" } as const;

/** Event card for the events list: the shared poster plus its status; finished events are not links. */
export function EventTicketCard({
  event,
}: {
  event: EventItemWithStatus;
  /** Kept for the grid's call sites. */
  index?: number;
}) {
  const t = useTranslations("EventsPage");
  const locale = useLocale();
  const isPast = event.status === "past";

  return (
    <EventPosterCard
      event={event}
      locale={locale}
      muted={isPast}
      href={isPast ? undefined : `/events/${event.id}`}
      ctaLabel={isPast ? t("eventEnded") : t("register")}
      statusSlot={
        <StatusSign state={signState[event.status]}>
          {t(`status.${event.status}`)}
        </StatusSign>
      }
    />
  );
}
