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
        "relative flex flex-col gap-4 md:flex-row md:items-start",
        isPast && "opacity-90",
      )}
    >
      <div className="detail-ticket-mask flex min-w-0 flex-col overflow-hidden border border-border/60 bg-card text-card-foreground shadow-xl md:w-[64%] md:shrink-0">
        <div className="detail-ticket-scrollbar flex min-w-0 flex-col overflow-y-auto">
          <div className="p-5 sm:p-6">
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-muted">
              <Image
                src={gallery[activeImage]}
                alt={event.title}
                fill
                sizes="(min-width: 768px) 60vw, 100vw"
                className="object-cover"
                priority
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
                      src={src}
                      alt=""
                      fill
                      sizes="80px"
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
      </div>

      <aside className="flex min-w-0 flex-col md:sticky md:top-6 md:w-[36%] md:self-start">
        <div className="detail-ticket-mask flex min-w-0 flex-col overflow-hidden border border-border/60 bg-card text-card-foreground shadow-xl">
          <div className="flex flex-col gap-3 p-5 sm:p-6">
            <h2 className="text-sm font-bold uppercase tracking-wide text-primary">
              {td("detailsTitle")}
            </h2>

            <DetailRow
              icon={Tag}
              label={td("categoryLabel")}
              value={event.category}
            />

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
              <DetailRow
                icon={Clock}
                label={td("timeLabel")}
                value={timePart}
              />
            ) : null}

            {typeof event.seatsLeft === "number" && !isPast ? (
              <div className="flex items-center gap-2 rounded-2xl bg-primary/10 p-3 text-xs font-semibold text-primary">
                <Users className="h-4 w-4 shrink-0" />
                {t("seatsLeft", { count: event.seatsLeft })}
              </div>
            ) : null}
          </div>
        </div>

        <div className="mt-4 border-t-2 border-border pt-4">
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
              className="w-full gap-2 rounded-xl shadow-md transition-all hover:shadow-lg"
            >
              {event.registrationLink ? (
                <a
                  href={event.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Ticket className="h-4 w-4" />
                  {t("register")}
                </a>
              ) : (
                <Link href="/#join">
                  <Ticket className="h-4 w-4" />
                  {t("register")}
                </Link>
              )}
            </Button>
          )}
        </div>
      </aside>
    </article>
  );
}
