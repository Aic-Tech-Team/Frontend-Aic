"use client";

import { SmartImage } from "@/components/common/SmartImage";
import { ArrowLeft, CalendarDays, Clock, MapPin } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { EventCountdown } from "@/components/events/EventCountdown";
import { StatusSign } from "@/components/common/StatusSign";
import type { EventItemWithStatus } from "@/types/events";

/**
 * The event that matters next, drawn as one wide ticket: the poster on the start side, the
 * details and the countdown in the middle, and a tear-off stub on the end side with the day and
 * the way in. A dashed line and two notches mark where the stub tears off.
 */
export function EventFeatured({ event }: { event: EventItemWithStatus }) {
  const t = useTranslations("EventsPage");
  const td = useTranslations("EventDetailPage");
  const locale = useLocale();
  const live = event.status === "ongoing";
  const start = new Date(event.startAt);
  const valid = !Number.isNaN(start.getTime());
  const day = valid
    ? new Intl.DateTimeFormat(locale, { day: "numeric" }).format(start)
    : "";
  const weekday = valid
    ? new Intl.DateTimeFormat(locale, { weekday: "long" }).format(start)
    : "";
  const month = valid
    ? new Intl.DateTimeFormat(locale, { month: "long" }).format(start)
    : "";

  const facts = [
    { icon: CalendarDays, label: td("dateLabel"), value: event.dateLabel },
    { icon: Clock, label: td("timeLabel"), value: event.timeLabel },
    { icon: MapPin, label: t("locationLabel"), value: event.location },
  ].filter((f) => f.value);
  const no = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 4,
    useGrouping: false,
  }).format(Number(event.id) || 0);

  return (
    <article className="ticket-frame ticket-wide relative isolate mb-10 flex flex-col overflow-hidden bg-card text-card-foreground [--ticket-tear:6rem] sm:mb-14 lg:min-h-[25rem] lg:grid lg:grid-cols-[17rem_minmax(0,1fr)_var(--stub-w)]">
      {/* the poster's colours light the ticket */}
      <SmartImage
        src={event.image || "/images/banner.jpg"}
        alt=""
        fill
        sizes="100vw"
        className="-z-20 scale-150 object-cover opacity-30 blur-3xl"
        aria-hidden="true"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-b from-background/75 to-background/90"
      />

      {/* poster: a clean photo panel */}
      <Link
        href={`/events/${event.id}`}
        aria-hidden="true"
        tabIndex={-1}
        className="group relative block aspect-16/10 w-full overflow-hidden lg:aspect-auto"
      >
        <SmartImage
          src={event.image || "/images/banner.jpg"}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 17rem, 100vw"
          className="object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105"
        />
        <span aria-hidden="true" className="poster-sheen absolute inset-0" />
      </Link>

      {/* details */}
      <div className="relative flex min-w-0 flex-col px-6 pb-6 pt-0 sm:px-8 lg:px-10 lg:pb-7">
        {/* the status hangs from the top edge of the ticket; category and number sit opposite */}
        <div className="flex items-start justify-between gap-4">
          <StatusSign state={live ? "live" : "next"}>
            {live ? t("status.ongoing") : t("featuredLabel")}
          </StatusSign>
          <p
            dir="ltr"
            className="pt-5 text-xs font-bold tracking-wide text-muted-foreground"
          >
            {event.category ? `${event.category} · ` : ""}№ {no}
          </p>
        </div>

        <h2 className="mt-4 line-clamp-2 text-balance text-2xl font-black leading-[1.5] text-foreground sm:text-4xl sm:leading-[1.45]">
          {event.title}
        </h2>

        {event.desc ? (
          <p className="mt-3 line-clamp-2 max-w-2xl text-sm leading-8 text-muted-foreground">
            {event.desc}
          </p>
        ) : null}

        <dl className="mt-5 grid gap-3 sm:grid-cols-3">
          {facts.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="min-w-0 rounded-xl border border-border/50 bg-background/30 px-4 py-3"
            >
              <dt className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                <Icon className="size-3.5 text-primary-300" />
                {label}
              </dt>
              <dd className="mt-1 truncate text-sm font-bold text-foreground">
                {value}
              </dd>
            </div>
          ))}
        </dl>

        <div className="mt-5">
          {live ? (
            <p className="flex items-center gap-2.5 text-sm font-bold text-emerald-300">
              <span className="size-2.5 animate-pulse-glow rounded-full bg-emerald-400 shadow-[0_0_12px_2px_rgba(52,211,153,0.6)]" />
              {t("liveNow")}
            </p>
          ) : (
            <>
              <p className="mb-2 text-xs font-bold text-muted-foreground">
                {t("startsIn")}
              </p>
              <EventCountdown
                startAt={event.startAt}
                locale={locale}
                liveLabel={t("liveNow")}
                labels={{
                  days: t("countdown.days"),
                  hours: t("countdown.hours"),
                  minutes: t("countdown.minutes"),
                  seconds: t("countdown.seconds"),
                }}
              />
            </>
          )}
        </div>

        {/* barcode, as on a printed ticket */}
        <span
          aria-hidden="true"
          className="mt-auto hidden h-8 text-foreground opacity-25 lg:mt-6 lg:block [background:repeating-linear-gradient(90deg,currentColor_0_2px,transparent_2px_5px,currentColor_5px_6px,transparent_6px_10px,currentColor_10px_13px,transparent_13px_16px)] [mask-image:linear-gradient(90deg,#000_60%,transparent)] rtl:[mask-image:linear-gradient(270deg,#000_60%,transparent)]"
        />
      </div>

      {/* stub: torn off along the dashed line */}
      <Link
        href={`/events/${event.id}`}
        className="group/cta flex h-(--ticket-tear) items-center justify-between gap-4 border-t-2 border-dashed border-border/70 bg-muted/30 px-6 transition-colors hover:bg-primary/10 lg:h-auto lg:flex-col lg:justify-between lg:border-t-0 lg:border-s-2 lg:px-6 lg:py-8"
      >
        <div className="text-center">
          <span className="hidden text-xs font-bold text-muted-foreground lg:block">
            {weekday}
          </span>
          <span className="block text-4xl font-black leading-none tabular-nums text-foreground lg:mt-2 lg:text-7xl">
            {day}
          </span>
          <span className="mt-1.5 block text-sm font-bold text-primary-300">
            {month}
          </span>
          {event.timeLabel ? (
            <span className="mt-3 hidden rounded-full border border-border/60 px-3 py-1 text-xs font-bold tabular-nums text-foreground/80 lg:inline-block">
              {event.timeLabel}
            </span>
          ) : null}
        </div>
        <span className="flex items-center gap-3 lg:w-full lg:flex-col lg:gap-3">
          <span className="text-sm font-extrabold lg:order-2">
            {t("viewEvent")}
          </span>
          <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow transition-transform duration-500 group-hover/cta:-translate-x-1 ltr:group-hover/cta:translate-x-1 lg:order-1 lg:size-14">
            <ArrowLeft className="size-5 ltr:rotate-180" />
          </span>
        </span>
      </Link>
    </article>
  );
}
