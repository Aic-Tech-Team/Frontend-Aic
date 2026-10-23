"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const WEEK = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;

function tehranNow() {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "short",
    hour: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const bag = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const day = WEEK.indexOf(bag.weekday as (typeof WEEK)[number]);
  const hour = Number(bag.hour);
  return { day, open: day >= 0 && day < 5 && hour >= 10 && hour < 16 };
}

export function ContactChannels() {
  const t = useTranslations("ContactPage");
  const footer = useTranslations("Footer");
  const days = t.raw("weekdays") as string[];
  const shorts = t.raw("weekdayShort") as string[];
  const email = footer("email");
  const [now, setNow] = useState<{ day: number; open: boolean } | null>(null);

  useEffect(() => {
    setNow(tehranNow());
  }, []);

  return (
    <section className="py-8 sm:py-16">
      <div className="container grid min-w-0 gap-14 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,0.9fr)] lg:items-end lg:gap-16">
        <div className="min-w-0">
          <h2 className="text-3xl font-extrabold leading-snug text-foreground sm:text-5xl">
            {t("visitTitle")}
          </h2>
          <p className="mt-4 text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
            {footer("address")}
          </p>
          <p className="mt-5 max-w-[48ch] text-base leading-8 text-muted-foreground">
            {t("visitExpect")}
          </p>
          <p className="mt-4 text-sm font-bold text-primary-300">
            {now?.open ? t("visitOpen") : t("visitClosed")}
            {now?.open ? (
              <span className="ms-2 font-medium text-muted-foreground">
                {footer("hours")}
              </span>
            ) : null}
          </p>

          <ol className="mt-8 grid grid-cols-7 gap-1.5 sm:gap-2">
            {days.map((day, i) => {
              const open = i < 5;
              const current = now?.day === i;
              return (
                <li
                  key={day}
                  aria-label={day}
                  aria-current={current ? "date" : undefined}
                  className={cn(
                    "flex min-h-14 items-center justify-center rounded-2xl border px-1 py-3 text-center",
                    open
                      ? "border-primary/40 bg-primary/10 text-foreground"
                      : "border-border/50 text-muted-foreground/70",
                    current && "ring-2 ring-ring",
                  )}
                >
                  <span className="text-sm font-extrabold sm:text-base">{shorts[i]}</span>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-muted-foreground">{t("emailLabel")}</p>
          <a
            href={`mailto:${email}`}
            className="mt-3 block break-all text-2xl font-extrabold leading-snug text-foreground outline-none transition-colors hover:text-primary-300 focus-visible:ring-2 focus-visible:ring-ring sm:text-4xl"
          >
            {email}
          </a>
          <p className="mt-5 max-w-[40ch] text-sm leading-8 text-muted-foreground">
            {t("socialNote")}
          </p>
        </div>
      </div>
    </section>
  );
}
