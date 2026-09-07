import Image from "next/image";
import { Home, Ticket, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { EventItemWithStatus } from "@/types/events";

/** Static banner — lives in /public/images, not tied to any event's own image. */
const HERO_BANNER_SRC = "/images/banner.jpg";

export function EventDetailHero({
  event,
  homeLabel,
  eventsLabel,
}: {
  event: EventItemWithStatus;
  homeLabel: string;
  eventsLabel: string;
}) {
  const [datePart] = event.dateLabel.split("·").map((s) => s.trim());

  return (
    <div className="relative -mx-[calc(50vw-50%)] h-[260px] w-screen overflow-hidden bg-[#1a1430] sm:h-[340px]">
      <Image
        src={HERO_BANNER_SRC}
        alt=""
        fill
        sizes="100vw"
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/45 to-black/20" />

      <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 px-4 text-center">
        <h1 className="max-w-3xl text-2xl font-extrabold text-white drop-shadow sm:text-4xl">
          {event.title}
        </h1>

        <nav
          aria-label="breadcrumb"
          className="flex flex-wrap items-center justify-center gap-2 text-sm text-white/85 sm:text-base"
        >
          <Link
            href="/"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Home className="h-4 w-4 shrink-0" />
            {homeLabel}
          </Link>

          <ChevronLeft className="h-4 w-4 shrink-0 text-white/60 ltr:rotate-180" />

          <Link
            href="/events"
            className="flex items-center gap-1.5 transition-colors hover:text-white"
          >
            <Ticket className="h-4 w-4 shrink-0" />
            {eventsLabel}
          </Link>

          <ChevronLeft className="h-4 w-4 shrink-0 text-white/60 ltr:rotate-180" />

          <span className="max-w-[60vw] truncate font-semibold text-white">
            {event.title}
          </span>
        </nav>

        <div className="flex flex-wrap items-center justify-center gap-2 pt-1 text-center sm:gap-2.5">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/85 backdrop-blur-sm sm:text-xs">
            {event.category}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/85 backdrop-blur-sm sm:text-xs">
            {event.location}
          </span>
          {datePart ? (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-medium text-white/85 backdrop-blur-sm sm:text-xs">
              {datePart}
            </span>
          ) : null}
        </div>
      </div>
    </div>
  );
}