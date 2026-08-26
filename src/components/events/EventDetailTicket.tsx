"use client";

import { useState } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import {
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

function DetailRow() {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-background/40 p-3">
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
      </span>

      <div className="min-w-0">
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
  
  return (
    <article
      className={cn(
        "detail-ticket-mask relative flex flex-col overflow-hidden bg-card text-card-foreground shadow-xl md:h-[min(78vh,720px)] md:flex-row",
        isPast && "opacity-90",
      )}
    >
      <div className="flex min-w-0 flex-col overflow-y-auto md:h-full md:w-[64%] md:shrink-0">
        <div className="p-5 sm:p-6">
          <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl bg-muted">


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

      <div className="flex min-w-0 flex-col overflow-y-auto md:h-full md:flex-1">

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