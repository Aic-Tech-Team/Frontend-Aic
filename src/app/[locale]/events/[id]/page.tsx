import { notFound } from "next/navigation";
import { ContentUnavailablePage } from "@/components/common/ContentUnavailable";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventDetailHero } from "@/components/events/EventDetailHero";
import { EventDetailTicket } from "@/components/events/EventDetailTicket";
import { OtherEventsRow } from "@/components/events/OtherEventsRow";
import { fetchEvent, fetchEvents, mapApiEvent } from "@/services/api/events";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const result = await fetchEvent(id);
  if (!result.ok) return {};
  return {
    title: result.data.title,
    description: result.data.short_description ?? result.data.description,
  };
}

export default async function EventDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("EventsPage");
  const td = await getTranslations("EventDetailPage");
  const tNav = await getTranslations("Nav");

  const result = await fetchEvent(id);
  if (!result.ok) {
    if (result.notFound) notFound();
    return <ContentUnavailablePage />;
  }

  const event = mapApiEvent(result.data);

  const list = await fetchEvents({ page_size: 7 });
  const otherEvents = (list?.results ?? [])
    .filter((item) => String(item.id) !== event.id)
    .slice(0, 6)
    .map(mapApiEvent);

  return (
    <div className="relative overflow-hidden">
      <EventDetailHero
        event={event}
        homeLabel={tNav("home")}
        eventsLabel={tNav("events")}
      />

      <div className="relative py-10 sm:py-16">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[70vh]"
        >
          <div className="absolute top-[-12rem] start-[8%] h-[26rem] w-[26rem] rounded-full bg-primary/25 blur-[110px]" />
          <div className="absolute top-[6rem] end-[4%] h-[22rem] w-[22rem] rounded-full bg-primary-400/20 blur-[110px]" />
          <div
            className="absolute inset-0 opacity-[0.35] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_20%,#000_10%,transparent_75%)]"
            style={{
              backgroundImage:
                "radial-gradient(color-mix(in srgb, var(--border) 70%, transparent) 1px, transparent 1px)",
              backgroundSize: "22px 22px",
            }}
          />
        </div>

        <div className="container">
          <div className="relative mt-8">
            <div
              aria-hidden
              className="absolute -inset-3 -z-10 hidden rounded-[2.5rem] bg-linear-to-b from-primary/10 via-transparent to-transparent ring-1 ring-border/40 sm:block sm:-inset-6"
            />
            <EventDetailTicket event={event} />
          </div>

          {otherEvents.length ? (
            <div className="mt-16 sm:mt-20">
              <OtherEventsRow
                events={otherEvents}
                title={td("otherEventsTitle")}
                statusLabels={{
                  ongoing: t("status.ongoing"),
                  upcoming: t("status.upcoming"),
                  past: t("status.past"),
                }}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
