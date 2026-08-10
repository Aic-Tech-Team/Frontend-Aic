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
import AutoBorderGlow from "@/components/animations/AutoBorderGlow";
import { cn } from "@/lib/utils";
import type { EventItemWithStatus } from "@/types/events";

function TearLine({ orientation }: { orientation: "horizontal" | "vertical" }) {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      className={cn(
        "relative shrink-0 border-dashed border-border/70",
        isHorizontal ? "h-px w-full border-t md:hidden" : "hidden h-auto w-px self-stretch border-s md:block",
      )}
      aria-hidden
    >
      <span
        className={cn(
          "absolute h-3 w-3 rounded-full border border-border/70 bg-background",
          isHorizontal
            ? "inset-s-0 top-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2"
            : "top-0 inset-s-1/2 -translate-x-1/2 -translate-y-1/2 rtl:translate-x-1/2",
        )}
      />
      <span
        className={cn(
          "absolute h-3 w-3 rounded-full border border-border/70 bg-background",
          isHorizontal
            ? "inset-e-0 top-1/2 translate-x-1/2 -translate-y-1/2 rtl:-translate-x-1/2"
            : "bottom-0 inset-s-1/2 -translate-x-1/2 translate-y-1/2 rtl:translate-x-1/2",
        )}
      />
    </div>
  );
}

const statusBadgeVariant = {
  ongoing: "success",
  upcoming: "secondary",
  past: "muted",
} as const;

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
    <AutoBorderGlow
      className="h-full w-full"
      borderRadius={26}
      glowColor="270 90 75"
      colors={["#c084fc", "#f472b6", "#38bdf8"]}
      glowRadius={22}
      glowIntensity={isPast ? 0.35 : 0.85}
      coneSpread={25}
      speed={6}
      lightModeBoost={2.5}
      phaseOffset={index * 90}
    >
      <article
        className={cn(
          "surface flex h-full flex-col overflow-hidden rounded-[inherit] border-0 md:flex-row",
          isPast && "opacity-70",
        )}
      >
        <div className="relative h-40 w-full shrink-0 overflow-hidden md:h-auto md:w-56">
          <Image
            src={event.image}
            alt={event.title}
            fill
            sizes="(min-width: 768px) 224px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />

          <Badge
            variant={statusBadgeVariant[event.status]}
            className="absolute inset-s-3 top-3"
          >
            {event.status === "ongoing" ? (
              <span className="h-1.5 w-1.5 shrink-0 animate-pulse-glow rounded-full bg-current" />
            ) : null}
            {t(`status.${event.status}`)}
          </Badge>

          <span className="surface absolute inset-e-3 top-3 rounded-full px-2.5 py-1 text-[10px] font-medium text-primary-300 dark:text-white">
            {event.category}
          </span>

          <div className="absolute bottom-3 inset-s-3 -rotate-3 rounded-xl border border-white/15 bg-black/45 px-3 py-1.5 backdrop-blur-sm">
            <p className="text-[10px] font-medium uppercase tracking-wider text-white/70">
              {event.dateLabel.split("·")[0]?.trim()}
            </p>
          </div>
        </div>

        <TearLine orientation="horizontal" />
        <TearLine orientation="vertical" />

        <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-5">
          <h3 className="line-clamp-2 wrap-break-word text-base font-bold leading-7 text-foreground sm:text-lg">
            {event.title}
          </h3>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-300" />
              <span className="font-medium text-foreground/80">{event.dateLabel}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary-300" />
              {event.location}
            </span>
            {event.speaker ? (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                {event.speaker}
              </span>
            ) : null}
          </div>

          <p className="mt-3 line-clamp-2 flex-1 text-sm leading-6 text-muted-foreground">
            {event.desc}
          </p>

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-border/50 pt-3">
            {typeof event.seatsLeft === "number" ? (
              <span className="flex items-center gap-1.5 text-xs font-medium text-primary-300">
                <Users className="h-3.5 w-3.5 shrink-0" />
                {t("seatsLeft", { count: event.seatsLeft })}
              </span>
            ) : (
              <span />
            )}

            {isPast ? (
              <Button size="sm" variant="outline" disabled className="rounded-xl text-xs">
                <CircleSlash className="h-3.5 w-3.5" />
                {t("eventEnded")}
              </Button>
            ) : (
              <Button asChild size="sm" className="rounded-xl text-xs shadow-glow">
                <Link href="/#join">
                  <Ticket className="h-3.5 w-3.5" />
                  {t("register")}
                </Link>
              </Button>
            )}
          </div>
        </div>
      </article>
    </AutoBorderGlow>
  );
}