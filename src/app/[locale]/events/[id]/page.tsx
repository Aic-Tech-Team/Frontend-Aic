import { notFound } from "next/navigation";
import { ContentUnavailablePage } from "@/components/common/ContentUnavailable";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { EventDetail } from "@/components/events/EventDetail";
import { OtherEventsRow } from "@/components/events/OtherEventsRow";
import { fetchEvent, fetchEvents, mapApiEvent } from "@/services/api/events";
import { Reveal } from "@/components/animations/Reveal";

export const dynamic = "force-dynamic";

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

  const td = await getTranslations("EventDetailPage");
  const tNav = await getTranslations("Nav");

  const [result, list] = await Promise.all([
    fetchEvent(id),
    fetchEvents({ page_size: 7 }),
  ]);
  if (!result.ok) {
    if (result.notFound) notFound();
    return <ContentUnavailablePage />;
  }

  const event = mapApiEvent(result.data, locale);
  const otherEvents = (list?.results ?? [])
    .filter((item) => String(item.id) !== event.id)
    .slice(0, 6)
    .map((r) => mapApiEvent(r, locale));

  return (
    <div className="relative overflow-x-clip">
      <EventDetail event={event} eventsLabel={tNav("events")} />

      {otherEvents.length ? (
        <div className="container pb-20 sm:pb-28">
          <Reveal direction="up">
            <OtherEventsRow
              events={otherEvents}
              title={td("otherEventsTitle")}
            />
          </Reveal>
        </div>
      ) : null}
    </div>
  );
}
