import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EventDetailTicket } from "@/components/events/EventDetailTicket";
import { EventItem, withStatus } from "@/types/events";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  const t = await getTranslations({ locale, namespace: "EventsPage" });
  const items = t.raw("items") as EventItem[];
  const event = items.find((item) => item.id === id);

  if (!event) return {};

  return {
    title: event.title,
    description: event.desc,
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
  const items = t.raw("items") as EventItem[];
  const nowIso = new Date().toISOString();
  const allEvents = withStatus(items, nowIso);
  const event = allEvents.find((item) => item.id === id);

  if (!event) {
    notFound();
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="container">
        <Link
          href="/events">
        </Link>

        <div className="mt-6">
          <EventDetailTicket event={event} />
        </div>
      </div>
    </div>
  );
}