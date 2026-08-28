import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  ArrowRight,
  CalendarDays,
  Clock,
  MapPin,
  User,
  Tag,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { EventDetailTicket } from "@/components/events/EventDetailTicket";
import { OtherEventsRow } from "@/components/events/OtherEventsRow";
import { Badge } from "@/components/ui/badge";
import { EventItem, EventStatus, withStatus } from "@/types/events";

export const revalidate = 300;

const statusBadgeVariant: Record<EventStatus, "success" | "secondary" | "muted"> = {
  ongoing: "success",
  upcoming: "secondary",
  past: "muted",
};

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

  const [datePart, timePart] = event.dateLabel.split("·").map((s) => s.trim());

  const otherEvents = allEvents
    .filter((item) => item.id !== event.id)
    .sort((a, b) => {
      // ongoing/upcoming first, then past
      const rank = { ongoing: 0, upcoming: 1, past: 2 };
      return rank[a.status] - rank[b.status];
    })
    .slice(0, 6);

  return (
    <div className="relative overflow-hidden py-10 sm:py-16">
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
        <Link
          href="/events"
          className="surface inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary-300"
        >
          <ArrowRight className="h-4 w-4 ltr:rotate-180" />
          {td("backToEvents")}
        </Link>

        <div className="mt-6 flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant={statusBadgeVariant[event.status]}>
              {t(`status.${event.status}`)}
            </Badge>
            <span className="surface inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium text-foreground/80">
              <Tag className="h-3.5 w-3.5 text-primary" />
              {event.category}
            </span>
          </div>

          <h1 className="max-w-3xl text-2xl font-extrabold leading-snug text-foreground sm:text-3xl md:text-4xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3">
            {event.organizer || event.speaker ? (
              <span className="surface inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80 sm:text-sm">
                <User className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                {event.organizer || event.speaker}
              </span>
            ) : null}
            <span className="surface inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80 sm:text-sm">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-300" />
              {event.location}
            </span>
            {datePart ? (
              <span className="surface inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80 sm:text-sm">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                {datePart}
              </span>
            ) : null}

            {/* is it nessesary to show time part? */}

            {/* {timePart ? (
              <span className="surface inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium text-foreground/80 sm:text-sm">
                <Clock className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                {timePart}
              </span>
            ) : null} */}
          </div>
        </div>

        <div className="relative mt-8">
          <div
            aria-hidden
            className="absolute -inset-3 -z-10 hidden rounded-[2.5rem] bg-gradient-to-b from-primary/10 via-transparent to-transparent ring-1 ring-border/40 sm:block sm:-inset-6"
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
  );
}