"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  MapPin,
  User,
  Users,
  Ticket,
  CircleSlash,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { EventItemWithStatus } from "@/types/events";

const statusBadgeVariant = {
  ongoing: "success",
  upcoming: "secondary",
  past: "muted",
} as const;

function BarcodePattern() {
  return (
    <div
      className="flex items-center gap-[2px] opacity-40 hover:opacity-80 transition-opacity"
      aria-hidden
    >
      <div className="h-6 w-0.5 bg-foreground" />
      <div className="h-6 w-px bg-foreground" />
      <div className="h-6 w-0.75 bg-foreground" />
      <div className="h-6 w-1 bg-foreground" />
      <div className="h-6 w-2 bg-foreground" />
      <div className="h-6 w-4 bg-foreground" />
      <div className="h-6 w-1 bg-foreground" />
      <div className="h-6 w-2 bg-foreground" />
    </div>
  );
}

export function EventTicketCard({
  event,
  index = 0,
}: {
  event: EventItemWithStatus;
  index?: number;
}) {
  const t = useTranslations("EventsPage");
  const isPast = event.status === "past";

  return (
    <>
      <article
        className={cn(
          "real-ticket-mask group relative flex h-full flex-col overflow-hidden bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-2xl md:flex-row",
          isPast && "opacity-75 grayscale-[20%]",
        )}
      >
        {/* 1. Ticket Image Stub */}
        <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden md:h-auto md:w-56 md:aspect-square">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 768px) 224px, 100vw"
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Status Badge */}
          <Badge
            variant={statusBadgeVariant[event.status]}
            className="absolute inset-s-3 top-3 shadow-md"
          >
            {event.status === "ongoing" ? (
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse-glow rounded-full bg-current me-1.5" />
            ) : null}
            {t(`status.${event.status}`)}
          </Badge>

          {/* Category Pill */}
          <span className="absolute inset-e-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
            {event.category}
          </span>

          {/* Date Tag */}
          <div className="absolute bottom-3 inset-s-3 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1 backdrop-blur-md">
            <p className="text-[10px] font-bold uppercase tracking-wider text-white">
              {event.dateLabel.split("·")[0]?.trim()}
            </p>
          </div>
        </div>

        {/* 2. Perforation: two punched notches + dotted tear line */}
        <div className="relative flex shrink-0 items-center justify-center md:w-6 md:justify-start">
          {/* mobile: horizontal line, notches on the left/right edges */}
          <div className="relative h-px w-full md:hidden">
            {/* <span className="absolute start-[-9px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border border-border/80 bg-transparent" /> */}
            {/* <span className="absolute end-[-9px] top-1/2 h-[18px] w-[18px] -translate-y-1/2 rounded-full border border-border/80 bg-transparent" /> */}
            <span
              className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-repeat-x"
              style={{
                backgroundImage:
                  "radial-gradient(circle, color-mix(in srgb, var(--border) 90%, transparent) 1.4px, transparent 1.4px)",
                backgroundSize: "9px 3px",
              }}
            />
          </div>
          {/* desktop: vertical line, notches on the top/bottom edges */}
          <div className="relative hidden h-full w-px md:block">
            <span className="absolute start-[-14px] top-[-14px] h-[28px] w-[28px] rounded-full border border-border/80 bg-transparent" />

            <span className="absolute start-[-14px] bottom-[-14px] h-[28px] w-[28px] rounded-full border border-border/80 bg-transparent" />

            <span
              className="absolute inset-y-4 start-1/2 w-px -translate-x-1/2 bg-repeat-y"
              style={{
                backgroundImage:
                  "radial-gradient(circle, color-mix(in srgb, var(--border) 90%, transparent) 1.4px, transparent 1.4px)",
                backgroundSize: "3px 9px",
              }}
            />
          </div>
        </div>

        {/* 3. Ticket Main Details */}
        <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="line-clamp-2 wrap-break-word text-base font-bold leading-snug text-foreground sm:text-lg">
                {event.title}
              </h3>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="font-medium text-foreground/90">
                  {event.dateLabel}
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                {event.location}
              </span>
              {event.speaker ? (
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {event.speaker}
                </span>
              ) : null}
            </div>

            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {event.desc}
            </p>
          </div>

          {/* Ticket Bottom Bar */}
          <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-border/60 pt-3">
            <div className="flex items-center gap-3">
              <BarcodePattern />
              {typeof event.seatsLeft === "number" && !isPast && (
                <span className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-primary">
                  <Users className="h-3.5 w-3.5 shrink-0" />
                  {t("seatsLeft", { count: event.seatsLeft })}
                </span>
              )}
            </div>

            {isPast ? (
              <Button
                size="sm"
                variant="outline"
                disabled
                className="rounded-xl text-xs gap-1.5"
              >
                <CircleSlash className="h-3.5 w-3.5" />
                {t("eventEnded")}
              </Button>
            ) : (
              <Button
                asChild
                size="sm"
                className="rounded-xl text-xs gap-1.5 shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/#join">
                  <Ticket className="h-3.5 w-3.5" />
                  {t("register")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </article>
    </>
  );
}
    // -webkit-mask-position: 0 0, 0 0, 0 0, 0 0;
    // -webkit-mask-size: 100% 100%, 100% 100%, 100% 24px, 100% 24px;
    // -webkit-mask-repeat: no-repeat, no-repeat, repeat-y, repeat-y;
    // -webkit-mask-composite: destination-in;