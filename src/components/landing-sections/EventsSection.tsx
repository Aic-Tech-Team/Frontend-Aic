import Image from "next/image";
import { ArrowLeft, CalendarDays, MapPin, User } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { getLandingEvents } from "@/services/api/landing";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";
import type { EventItemWithStatus } from "@/types/events";

function MetaRow({
  icon: Icon,
  label,
}: {
  icon: typeof MapPin;
  label: string;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 text-[11px]">
      <Icon className="h-3.5 w-3.5 shrink-0 text-primary-300" />
      <span className="truncate font-medium">{label}</span>
    </div>
  );
}

function EventCard({
  event,
  index,
  detailsCta,
}: {
  event: EventItemWithStatus;
  index: number;
  detailsCta: string;
}) {
  return (
    <RevealItem direction="up" delay={index * 0.06} className="h-full">
      <Link
        href={`/events/${event.id}`}
        className="group relative isolate flex aspect-square w-full max-md:aspect-4/5 [@media(hover:none)]:aspect-4/5 flex-col justify-end overflow-hidden rounded-3xl border border-border/50 bg-card shadow-[0_16px_36px_-22px_color-mix(in_srgb,var(--primary)_55%,transparent)] transition-[border-color,box-shadow] duration-500 hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Image
          src={event.image || "/images/qq.jpg"}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 84vw"
          className="-z-20 object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        <div className="absolute inset-0 -z-10 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

        <span className="absolute inset-s-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/45 px-3 py-1.5 text-xs font-medium text-white backdrop-blur-md">
          <CalendarDays className="h-3.5 w-3.5" />
          {event.dateLabel}
        </span>

        <div className="m-3 rounded-2xl border border-white/15 bg-black/55 p-4 text-white backdrop-blur-xl">
          <h3 className="line-clamp-2 text-base font-extrabold leading-7 sm:text-lg">
            {event.title}
          </h3>

          <div className="grid grid-rows-[0fr] opacity-0 max-md:grid-rows-[1fr] max-md:opacity-100 [@media(hover:none)]:grid-rows-[1fr] [@media(hover:none)]:opacity-100 transition-[grid-template-rows,opacity] duration-500 ease-out md:group-hover:grid-rows-[1fr] md:group-hover:opacity-100 md:group-focus-visible:grid-rows-[1fr] md:group-focus-visible:opacity-100">
            <div className="overflow-hidden">
              <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-white/70">
                {event.desc}
              </p>
              <div className="mt-3 divide-y divide-white/10 overflow-hidden rounded-xl bg-white/8 ring-1 ring-white/10">
                {event.location ? (
                  <MetaRow icon={MapPin} label={event.location} />
                ) : null}
                {event.speaker ? (
                  <MetaRow icon={User} label={event.speaker} />
                ) : null}
              </div>
            </div>
          </div>

          <span className="mt-3 flex h-9 items-center justify-center gap-2 rounded-xl bg-primary text-xs font-bold text-primary-foreground transition-colors group-hover:bg-primary-400">
            {detailsCta}
            <ArrowLeft className="h-3.5 w-3.5 ltr:rotate-180" />
          </span>
        </div>
      </Link>
    </RevealItem>
  );
}

export async function EventsSection() {
  const t = await getTranslations("Events");
  const common = await getTranslations("Common");
  const events = await getLandingEvents();

  const heading = (
    <SectionHeading
      badge={t("badge")}
      title={t("title")}
      description={t("description")}
      moreHref="/events"
      moreLabel={common("more")}
    />
  );

  if (events === null) {
    return (
      <section id="events" className="py-12 sm:py-20">
        <div className="container min-w-0">
          {heading}
          <ContentUnavailable className="mt-8" />
        </div>
      </section>
    );
  }

  if (events.length === 0) return null;

  const detailsCta = t("detailsCta");

  return (
    <section id="events" className="py-12 sm:py-20">
      <div className="container min-w-0">
        {heading}
        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
        >
          {events.map((event, index) => (
            <EventCard
              key={event.id}
              event={event}
              index={index}
              detailsCta={detailsCta}
            />
          ))}
        </Carousel>
      </div>
    </section>
  );
}
