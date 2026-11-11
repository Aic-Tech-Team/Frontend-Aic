import { SmartImage } from "@/components/common/SmartImage";
import type { ReactNode } from "react";
import { ArrowLeft, Clock, MapPin, User } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { EventItem } from "@/types/events";

/** Day and short month from an ISO start time, in the page's calendar; null when it cannot be read. */
function dateStamp(startAt: string, locale: string) {
  const d = new Date(startAt);
  if (Number.isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat(locale === "fa" ? "fa-IR" : "en-US", {
    day: "numeric",
    month: "short",
  }).formatToParts(d);
  return {
    day: parts.find((p) => p.type === "day")?.value ?? "",
    month: parts.find((p) => p.type === "month")?.value ?? "",
  };
}

/**
 * Event as a poster in a ticket frame: scalloped top and bottom edges and a punched notch on
 * each side where a dashed tear line separates the title area from the call-to-action strip.
 * Inside, a full-bleed photo with the date stamp at the top and, anchored at the bottom, the title,
 * time, place and description. A light follows the cursor and a sheen crosses the photo.
 */
export function EventPosterCard({
  event,
  ctaLabel,
  locale,
  href,
  statusSlot,
  muted,
  className,
}: {
  event: EventItem;
  ctaLabel: string;
  locale: string;
  /** Without an href the ticket is not a link (finished events). */
  href?: string;
  statusSlot?: ReactNode;
  muted?: boolean;
  className?: string;
}) {
  const stamp = dateStamp(event.startAt, locale);
  const cls = cn(
    "ticket-frame card-lift group relative isolate flex min-h-[25rem] w-full flex-col overflow-hidden sm:aspect-4/5 bg-card text-white transition-[box-shadow,transform] duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
    muted && "grayscale-[35%]",
    className,
  );

  const content = (
    <>
      {/* shown until the photo has loaded */}
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-linear-to-br from-primary/25 via-card to-card"
      />
      <SmartImage
        src={event.image || "/images/banner.jpg"}
        alt=""
        fill
        sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 84vw"
        className="-z-20 object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-110"
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-linear-to-t from-black via-black/80 via-40% to-black/35"
      />
      <span
        aria-hidden="true"
        className="poster-sheen absolute inset-0 -z-10"
      />
      <span aria-hidden="true" data-spot className="absolute inset-0 -z-10" />

      <div className="flex items-start justify-between gap-3 p-5">
        {stamp ? (
          <span className="flex min-w-[3.6rem] flex-col items-center rounded-2xl bg-black/55 px-3 py-2 text-center ring-1 ring-white/15 transition-[background-color,transform] duration-500 group-hover:-rotate-3 group-hover:bg-primary/80">
            <span className="text-3xl font-black leading-none tabular-nums">
              {stamp.day}
            </span>
            <span className="mt-1 text-[11px] font-semibold tracking-wide text-white/80">
              {stamp.month}
            </span>
          </span>
        ) : (
          <span className="rounded-2xl bg-black/55 px-3 py-2 text-xs font-semibold ring-1 ring-white/15">
            {event.dateLabel}
          </span>
        )}
        <div className="flex min-w-0 flex-col items-end gap-2">
          {event.category ? (
            <span className="max-w-full truncate rounded-full bg-white/12 px-3 py-1 text-[11px] font-semibold ring-1 ring-white/20">
              {event.category}
            </span>
          ) : null}
          {statusSlot}
        </div>
      </div>

      <div className="mt-auto px-5 pb-4">
        <h3 className="line-clamp-2 text-xl font-black leading-snug transition-transform duration-500 group-hover:-translate-y-0.5 sm:text-[1.4rem] sm:leading-snug">
          {event.title}
        </h3>

        <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/75">
          {event.timeLabel ? (
            <span className="flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary-300" />
              {event.timeLabel}
            </span>
          ) : null}
          {event.location ? (
            <span className="flex min-w-0 items-center gap-1.5">
              <MapPin className="size-3.5 shrink-0 text-primary-300" />
              <span className="truncate">{event.location}</span>
            </span>
          ) : null}
        </div>

        <p className="mt-3 line-clamp-2 text-xs leading-6 text-white/75">
          {event.desc}
        </p>
        {event.speaker ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-white/85">
            <User className="size-3.5 text-primary-300" />
            {event.speaker}
          </p>
        ) : null}
      </div>

      {/* the strip under the tear line: the card's side notches sit on its top edge */}
      <div className="flex h-[var(--ticket-tear)] shrink-0 items-center gap-3 border-t-2 border-dashed border-white/35 bg-black/40 px-5">
        <span className="text-sm font-bold">{ctaLabel}</span>
        <span
          aria-hidden="true"
          className="relative h-px flex-1 overflow-hidden bg-white/25"
        >
          <span className="absolute inset-0 origin-left bg-primary-300 transition-transform duration-700 ease-out [transform:scaleX(0)] group-hover:[transform:scaleX(1)] rtl:origin-right" />
        </span>
        <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-white text-black transition-[background-color,color,transform] duration-300 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowLeft className="size-4 transition-transform duration-300 ltr:rotate-180 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
        </span>
      </div>
    </>
  );

  return href ? (
    <Link href={href as "/events"} className={cls}>
      {content}
    </Link>
  ) : (
    <div className={cls}>{content}</div>
  );
}
