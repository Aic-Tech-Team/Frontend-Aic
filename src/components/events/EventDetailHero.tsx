import { Home, Ticket, ChevronLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { EventItemWithStatus } from "@/types/events";

export function EventDetailHero({
  event,
  homeLabel,
  eventsLabel,
}: {
  event: EventItemWithStatus;
  homeLabel: string;
  eventsLabel: string;
}) {
  return (
    <div className="relative -mx-[calc(50vw-50%)] h-[260px] w-screen overflow-hidden rounded-[18px] bg-[#1a1430] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.04)] sm:h-[340px] sm:rounded-[22px]">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-1/2 h-[480px] w-[480px] -translate-y-1/2 rounded-full bg-primary/50 blur-[120px] sm:h-[600px] sm:w-[600px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-20 top-1/3 h-[260px] w-[260px] -translate-y-1/2 rounded-full bg-fuchsia-500/30 blur-[100px]"
      />
      {/* faint dot-grid texture over the whole banner */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.25]"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

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
      </div>
    </div>
  );
}
