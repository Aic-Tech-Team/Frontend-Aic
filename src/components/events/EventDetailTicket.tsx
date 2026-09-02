"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
  CalendarDays,
  Clock,
  MapPin,
  User,
  Users,
  Ticket,
  CircleSlash,
  Tag,
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

function DetailRow({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-background/40 p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-muted-foreground">{label}</p>
        <p className="wrap-break-word text-sm font-semibold text-foreground">
          {value}
        </p>
      </div>
    </div>
  );
}

export function EventDetailTicket({ event }: { event: EventItemWithStatus }) {
  const t = useTranslations("EventsPage");
  const td = useTranslations("EventDetailPage");
  const isPast = event.status === "past";

  const gallery = event.gallery?.length ? event.gallery : [event.image];
  const [activeImage, setActiveImage] = useState(0);

  const [datePart, timePart] = event.dateLabel.split("·").map((s) => s.trim());

  return (
    <article
      className={cn(
        "detail-ticket-mask relative flex flex-col overflow-hidden bg-card text-card-foreground shadow-xl md:h-[min(78vh,720px)] md:flex-row",
        isPast && "opacity-90",
      )}
    >
      {/* Spotlight pane: gallery + full description — scrolls on its own */}
      <div className="detail-ticket-scrollbar flex min-w-0 flex-col overflow-y-auto md:h-full md:w-[64%] md:shrink-0">
        <div className="p-5 sm:p-6">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
            <Image
              src={gallery[activeImage] || "/images/placeholder.jpg"}
              alt={event.title}
              fill
              sizes="(min-width: 768px) 60vw, 100vw"
              unoptimized
              priority
              onError={(e) => {
                const target = e.currentTarget as HTMLImageElement;
                if (!target.src.endsWith("/images/placeholder.jpg")) {
                  target.src = "/images/placeholder.jpg";
                }
              }}
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <Badge
              variant={statusBadgeVariant[event.status]}
              className="absolute inset-s-3 top-3 shadow-md"
            >
              {event.status === "ongoing" ? (
                <span className="h-1.5 w-1.5 shrink-0 animate-pulse-glow rounded-full bg-current me-1.5" />
              ) : null}
              {t(`status.${event.status}`)}
            </Badge>
          </div>

          {gallery.length > 1 ? (
            <div className="mt-3 flex items-center gap-2 overflow-x-auto pb-1">
              {gallery.map((src, i) => (
                <button
                  key={src + i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={cn(
                    "relative h-14 w-20 shrink-0 overflow-hidden rounded-lg ring-2 ring-transparent transition-all",
                    i === activeImage && "ring-primary",
                  )}
                >
                  <Image
                    src={src || "/images/placeholder.jpg"}
                    alt=""
                    fill
                    sizes="80px"
                    unoptimized
                    onError={(e) => {
                      const target = e.currentTarget as HTMLImageElement;
                      if (!target.src.endsWith("/images/placeholder.jpg")) {
                        target.src = "/images/placeholder.jpg";
                      }
                    }}
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          ) : null}

          <h1 className="mt-5 text-xl font-bold leading-snug text-foreground sm:text-2xl">
            {event.title}
          </h1>

          <h2 className="mt-6 text-sm font-bold uppercase tracking-wide text-primary">
            {td("aboutTitle")}
          </h2>
          <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground sm:text-[15px]">
            {event.fullDesc || event.desc}
          </p>
        </div>
      </div>

      <div className="relative hidden shrink-0 items-center justify-start md:flex md:w-6">
        <div className="relative h-full w-px">
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

      {/* Mobile: horizontal dashed divider */}
      <div className="relative flex h-px w-full items-center justify-center md:hidden">
        <span
          className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-repeat-x"
          style={{
            backgroundImage:
              "radial-gradient(circle, color-mix(in srgb, var(--border) 90%, transparent) 1.4px, transparent 1.4px)",
            backgroundSize: "9px 3px",
          }}
        />
      </div>

      <div className="detail-ticket-scrollbar flex min-w-0 flex-col overflow-y-auto md:h-full md:flex-1">
        <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
          <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
            {td("detailsTitle")}
          </h2>

          <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-border/70 bg-background/40 px-2.5 py-1 text-[11px] font-semibold text-foreground/80">
            <Tag className="h-3.5 w-3.5 text-primary" />
            {event.category}
          </span>

          {event.organizer || event.speaker ? (
            <DetailRow
              icon={User}
              label={td("organizerLabel")}
              value={event.organizer || event.speaker || ""}
            />
          ) : null}

          <DetailRow
            icon={MapPin}
            label={t("locationLabel")}
            value={event.location}
          />

          {datePart ? (
            <DetailRow
              icon={CalendarDays}
              label={td("dateLabel")}
              value={datePart}
            />
          ) : null}

          {timePart ? (
            <DetailRow icon={Clock} label={td("timeLabel")} value={timePart} />
          ) : null}

          {typeof event.seatsLeft === "number" && !isPast ? (
            <div className="flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-xs font-semibold text-primary">
              <Users className="h-4 w-4 shrink-0" />
              {t("seatsLeft", { count: event.seatsLeft })}
            </div>
          ) : null}
        </div>

        <div className="sticky bottom-0 mt-auto border-t border-dashed border-border/60 bg-card/95 p-5 backdrop-blur-sm sm:p-6">
          {isPast ? (
            <Button
              size="lg"
              variant="outline"
              disabled
              className="w-full gap-2 rounded-xl"
            >
              <CircleSlash className="h-4 w-4" />
              {t("eventEnded")}
            </Button>
          ) : (
            <Button
              asChild
              size="lg"
              className="w-full gap-2 rounded-xl shadow-md hover:shadow-lg transition-all"
            >
              <Link href="/#join">
                <Ticket className="h-4 w-4" />
                {t("register")}
              </Link>
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
