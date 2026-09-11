"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CalendarClock, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Link } from "@/i18n/navigation";
import type { ActivityItem } from "@/types/activity";

function BarcodePattern() {
  return (
    <div className="flex items-center gap-[2px]" aria-hidden>
      <div className="h-6 w-0.5 bg-black" />
      <div className="h-6 w-px bg-black" />
      <div className="h-6 w-0.75 bg-black" />
      <div className="h-6 w-1 bg-black" />
      <div className="h-6 w-2 bg-black" />
      <div className="h-6 w-4 bg-black" />
      <div className="h-6 w-1 bg-black" />
      <div className="h-6 w-2 bg-black" />
    </div>
  );
}

export function ActivityTicketCard({
  activity,
  index = 0,
}: {
  activity: ActivityItem;
  index?: number;
}) {
  const t = useTranslations("ActivitiesPage");

  return (
    <div className="relative h-full">
      <article
        className="real-ticket-mask real-ticket-mask--vertical relative flex h-full flex-col overflow-hidden border border-border/60 bg-card text-card-foreground shadow-lg"
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
          <Image
            src={activity.image}
            alt={activity.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.endsWith("/images/qq.jpg")) {
                target.src = "/images/qq.jpg";
              }
            }}
            className="object-cover"
          />
        </div>

        <div className="relative flex shrink-0 items-center justify-center">
          <div className="relative h-px w-full">
            <span
              className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-repeat-x"
              style={{
                backgroundImage:
                  "radial-gradient(circle, color-mix(in srgb, var(--border) 90%, transparent) 1.4px, transparent 1.4px)",
                backgroundSize: "9px 3px",
              }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium text-foreground/90">
                  {activity.dateLabel}
                </span>
              </span>
              <span
                className={cn(
                  "shrink-0 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300",
                )}
              >
                {activity.category}
              </span>
            </div>

            <h3 className="line-clamp-2 wrap-break-word text-sm font-bold leading-snug text-foreground sm:text-base">
              {activity.title}
            </h3>

            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {activity.summary}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border/60 pt-3">
            <BarcodePattern />

            <Link
              href={`/activities/${activity.id}`}
              className="inline-flex items-center gap-1.5 rounded-xl bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground shadow-md transition-opacity hover:opacity-90"
            >
              {t("learnMore")}
              <ArrowLeft className="h-3.5 w-3.5 ltr:rotate-180" />
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
