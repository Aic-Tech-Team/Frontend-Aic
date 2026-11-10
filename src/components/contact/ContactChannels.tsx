"use client";

import { StickyColumn } from "@/components/common/StickyColumn";
import { useEffect, useRef, useState } from "react";
import { ArrowUpLeft, Check, Copy } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/gsap";
import { cn } from "@/lib/utils";

const WEEK = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"] as const;
const AXIS_FROM = 8; // 08:00 .. 18:00 drawn on each day column
const AXIS_TO = 18;
/** Open hours per weekday, Saturday first: Sat–Wed 8–18, Thu–Fri 10–16. */
const HOURS: [number, number][] = [
  [8, 18],
  [8, 18],
  [8, 18],
  [8, 18],
  [8, 18],
  [10, 16],
  [10, 16],
];

interface Now {
  day: number;
  hour: number;
  minute: number;
  second: number;
}

function tehranNow(): Now {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "Asia/Tehran",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(new Date());
  const bag = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  return {
    day: WEEK.indexOf(bag.weekday as (typeof WEEK)[number]),
    hour: Number(bag.hour),
    minute: Number(bag.minute),
    second: Number(bag.second),
  };
}

const pct = (hour: number) => ((hour - AXIS_FROM) / (AXIS_TO - AXIS_FROM)) * 100;

/** Big typographic row: label / large value / trailing action. */
function Row({
  label,
  children,
  action,
  as = "div",
  onClick,
}: {
  label: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  as?: "div" | "button";
  onClick?: () => void;
}) {
  const Tag = as;
  return (
    <Tag
      {...(as === "button" ? { type: "button" as const, onClick } : {})}
      className={cn(
        "group relative grid w-full min-w-0 grid-cols-[minmax(0,1fr)_auto] items-end gap-x-4 gap-y-3 py-6 text-start outline-none sm:gap-x-6 sm:py-8",
        as === "button" && "cursor-pointer focus-visible:ring-2 focus-visible:ring-ring",
      )}
    >
      {/* hover wash that wipes in from the start edge */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-4 inset-y-0 -z-10 origin-left scale-x-0 rounded-2xl bg-primary/8 transition-transform duration-500 ease-out group-hover:scale-x-100 rtl:origin-right"
      />
      <span className="col-span-2 text-sm font-bold text-primary-300">{label}</span>
      <span className="min-w-0">{children}</span>
      {action}
    </Tag>
  );
}

export function ContactChannels({ onPartner }: { onPartner?: () => void }) {
  const t = useTranslations("ContactPage");
  const footer = useTranslations("Footer");
  const locale = useLocale();
  const days = t.raw("weekdays") as string[];
  const shorts = t.raw("weekdayShort") as string[];
  const email = footer("email");

  const [now, setNow] = useState<Now | null>(null);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef(0);
  const nowLine = useRef<HTMLDivElement>(null);
  const instrument = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const tick = () => setNow(tehranNow());
    tick();
    const id = window.setInterval(tick, 1000);
    return () => {
      window.clearInterval(id);
      window.clearTimeout(copyTimer.current);
    };
  }, []);

  const today = now && now.day >= 0 ? HOURS[now.day] : null;
  const open = !!now && !!today && now.hour >= today[0] && now.hour < today[1];
  const fraction = now ? now.hour + now.minute / 60 + now.second / 3600 : 0;
  const lineVisible = !!now && fraction >= AXIS_FROM && fraction <= AXIS_TO;
  const minuteKey = now ? now.hour * 60 + now.minute : -1;

  // Day bars grow in when the instrument scrolls into view.
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      gsap.from("[data-bar]", {
        scaleY: 0,
        transformOrigin: "50% 100%",
        duration: 1,
        ease: "expo.out",
        stagger: 0.06,
        scrollTrigger: { trigger: instrument.current, start: "top 85%", once: true },
      });
    },
    { scope: instrument },
  );

  // The "now" line glides to the current time, minute by minute.
  useEffect(() => {
    const el = nowLine.current;
    if (!el || minuteKey < 0) return;
    const f = Math.min(AXIS_TO, Math.max(AXIS_FROM, minuteKey / 60));
    gsap.to(el, { top: `${pct(f)}%`, duration: prefersReducedMotion() ? 0 : 0.9, ease: "power2.out", overwrite: true });
  }, [minuteKey]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(email);
      setCopied(true);
      window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2200);
    } catch {
      // Clipboard blocked: the mailto link still works.
    }
  };

  const num = new Intl.NumberFormat(locale, { minimumIntegerDigits: 2, useGrouping: false });
  const pad = (n: number) => num.format(n);
  const plain = new Intl.NumberFormat(locale, { useGrouping: false });

  return (
    <section className="pb-16 pt-6 sm:pb-24">
      <div className="container min-w-0">
        <p className="inline-flex items-center gap-3 text-sm font-bold text-primary-300"><span aria-hidden="true" className="h-px w-8 bg-primary-300/60" />{t("channelsKicker")}</p>
        <h2 className="mt-4 max-w-4xl text-balance text-3xl font-extrabold leading-[1.35] text-foreground sm:text-5xl">
          {t("channelsTitle")}
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">{t("channelsLead")}</p>

        <div className="mt-12 grid min-w-0 gap-10 sm:mt-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)] lg:items-start lg:gap-16">
          <RevealGroup className="min-w-0 divide-y divide-border/60 border-y border-border/60" stagger={0.1}>
            <RevealItem>
              <Row
                label={t("emailLabel")}
                action={
                  <button
                    type="button"
                    onClick={copy}
                    className="inline-flex h-10 w-fit items-center gap-2 rounded-full border border-border/70 px-4 text-sm font-bold text-foreground outline-none transition-colors hover:border-primary/60 focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {copied ? <Check className="size-4 text-primary-300" aria-hidden="true" /> : <Copy className="size-4" aria-hidden="true" />}
                    <span aria-live="polite">{copied ? t("copied") : t("copyEmail")}</span>
                  </button>
                }
              >
                <a
                  href={`mailto:${email}`}
                  dir="ltr"
                  className="block py-1.5 text-start text-xl font-extrabold leading-snug [overflow-wrap:anywhere] text-foreground outline-none transition-colors hover:text-primary-300 focus-visible:ring-2 focus-visible:ring-ring sm:text-3xl rtl:text-end"
                >
                  {email}
                </a>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{t("emailNote")}</p>
              </Row>
            </RevealItem>

            <RevealItem>
              <Row label={t("visitLabel")}>
                <p className="text-xl font-extrabold leading-snug text-foreground sm:text-2xl">{footer("address")}</p>
                <p className="mt-3 max-w-[52ch] text-sm leading-8 text-muted-foreground">{t("visitNote")}</p>
              </Row>
            </RevealItem>

            <RevealItem>
              <Row
                as="button"
                onClick={onPartner}
                label={t("partnerLabel")}
                action={
                  <span className="flex size-12 items-center justify-center rounded-full border border-border/70 text-foreground transition-all duration-300 group-hover:border-primary group-hover:bg-primary group-hover:text-primary-foreground">
                    <ArrowUpLeft className="size-5 ltr:-scale-x-100" aria-hidden="true" />
                  </span>
                }
              >
                <span className="block text-xl font-extrabold leading-snug text-foreground sm:text-2xl">{t("partnerTitle")}</span>
                <span className="mt-2 block max-w-[48ch] text-sm leading-7 text-muted-foreground">{t("partnerBody")}</span>
              </Row>
            </RevealItem>
          </RevealGroup>

          {/* hours instrument: stays in view while the rows beside it scroll */}
          <StickyColumn className="min-w-0">
          <RevealGroup className="min-w-0" stagger={0.1}>
            <RevealItem>
              <div ref={instrument} className="surface rounded-3xl border border-border/60 p-5 sm:p-8">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-bold text-muted-foreground">{t("hoursNow")}</p>
                    {/* time reads left to right in both languages: HH:MM, then the seconds on its right */}
                    <p dir="ltr" className="mt-2 flex items-baseline gap-2 text-4xl font-extrabold leading-none tabular-nums tracking-tight text-foreground sm:text-5xl">
                      <span>{now ? `${pad(now.hour)}:${pad(now.minute)}` : "--:--"}</span>
                      <span className="text-lg font-bold text-primary-300 sm:text-xl">{now ? pad(now.second) : "--"}</span>
                    </p>
                  </div>
                  {/* a hanging door sign, the way a shop shows it: swings a little while open */}
                  <span className="relative mt-3 shrink-0 pt-4">
                    <span aria-hidden="true" className={cn("absolute inset-x-0 top-0 mx-auto h-4 w-px", open ? "bg-emerald-300/60" : "bg-border")} />
                    <span
                      className={cn(
                        "door-sign relative block origin-top rounded-[3px] border-2 px-4 pb-1.5 pt-3 text-sm font-black leading-none",
                        open ? "door-sign--open border-emerald-300/70 bg-emerald-300/10 text-emerald-200" : "border-border text-muted-foreground",
                      )}
                    >
                      <span aria-hidden="true" className="absolute inset-x-0 top-1 mx-auto size-1.5 rounded-full border border-current opacity-70" />
                      {now ? (open ? t("hoursOpen") : t("hoursClosed")) : "…"}
                    </span>
                  </span>
                </div>

                <div className="relative mt-8">
                  <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
                    {days.map((day, i) => {
                      const [from, to] = HOURS[i];
                      const isToday = now?.day === i;
                      return (
                        <div
                          key={day}
                          aria-label={`${day}: ${plain.format(from)}–${plain.format(to)}`}
                          aria-current={isToday ? "date" : undefined}
                          className="flex flex-col items-center gap-2"
                        >
                          <div
                            className={cn(
                              "relative h-44 w-full overflow-hidden rounded-2xl border",
                              isToday ? "border-primary/70 bg-primary/5" : "border-border/50",
                            )}
                          >
                            <div
                              data-bar
                              className="absolute inset-x-1 rounded-xl bg-linear-to-b from-primary-300 to-primary-500 shadow-glow sm:inset-x-1.5"
                              style={{ top: `${pct(from)}%`, bottom: `${100 - pct(to)}%` }}
                            />
                          </div>
                          <span className={cn("text-xs font-extrabold", isToday ? "text-primary-300" : "text-muted-foreground")}>
                            {shorts[i]}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* live "now" line across the columns (the 11rem bar area) */}
                  <div className="pointer-events-none absolute inset-x-0 top-0 h-44" aria-hidden="true">
                    <div
                      ref={nowLine}
                      className={cn("absolute inset-x-0 flex items-center transition-opacity duration-500", lineVisible ? "opacity-100" : "opacity-0")}
                      style={{ top: "50%" }}
                    >
                      <span className="size-2 shrink-0 rounded-full bg-foreground" />
                      <span className="h-px flex-1 bg-foreground/70" />
                    </div>
                  </div>
                </div>

                {/* legend: a swatch the shape of the bar it explains, the days, then the hours */}
                <dl className="mt-6 grid gap-x-6 gap-y-4 border-t border-border/50 pt-5 sm:grid-cols-2">
                  {[
                    { days: t("hoursWeekDays"), time: t("hoursWeekTime"), full: true },
                    { days: t("hoursEndDays"), time: t("hoursEndTime"), full: false },
                  ].map((row) => (
                    <div key={row.days} className="flex items-center gap-3.5">
                      <span aria-hidden="true" className="relative h-11 w-3 shrink-0 rounded-md border border-border/50">
                        <span
                          className="absolute inset-x-0.5 rounded-[5px] bg-linear-to-b from-primary-300 to-primary-500"
                          style={row.full ? { top: "0.125rem", bottom: "0.125rem" } : { top: "28%", bottom: "28%" }}
                        />
                      </span>
                      <div className="min-w-0">
                        <dt className="text-xs leading-5 text-muted-foreground">{row.days}</dt>
                        <dd className="text-lg font-extrabold leading-7 text-foreground">{row.time}</dd>
                      </div>
                    </div>
                  ))}
                </dl>
              </div>
            </RevealItem>
          </RevealGroup>
          </StickyColumn>
        </div>
      </div>
    </section>
  );
}
