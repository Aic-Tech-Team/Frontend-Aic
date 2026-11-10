"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

type Labels = { days: string; hours: string; minutes: string; seconds: string };

/**
 * Live countdown to an event's start: four cells that tick every second, each figure sliding in
 * when it changes. Before it mounts (and for a start time that cannot be read) it renders
 * nothing, so the server HTML never disagrees with the client clock.
 */
export function EventCountdown({
  startAt,
  labels,
  liveLabel,
  locale,
  compact,
  className,
}: {
  startAt: string;
  labels: Labels;
  liveLabel: string;
  locale: string;
  /** Smaller cells, for a narrow column. */
  compact?: boolean;
  className?: string;
}) {
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    // the first reading is deferred a tick so it is not a synchronous state change inside the effect
    const first = window.setTimeout(() => setNow(Date.now()), 0);
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, []);

  const target = Date.parse(startAt);
  if (now === null || Number.isNaN(target)) return null;

  const diff = target - now;
  if (diff <= 0) {
    return (
      <p
        className={cn(
          "inline-flex items-center gap-2 text-sm font-bold text-emerald-300",
          className,
        )}
      >
        <span className="size-2 animate-pulse-glow rounded-full bg-emerald-400" />
        {liveLabel}
      </p>
    );
  }

  const total = Math.floor(diff / 1000);
  const fmt = new Intl.NumberFormat(locale, {
    minimumIntegerDigits: 2,
    useGrouping: false,
  });
  const cells: [string, number][] = [
    [labels.days, Math.floor(total / 86400)],
    [labels.hours, Math.floor((total % 86400) / 3600)],
    [labels.minutes, Math.floor((total % 3600) / 60)],
    [labels.seconds, total % 60],
  ];

  return (
    <div
      className={cn(
        "flex items-stretch gap-2 sm:gap-3",
        compact && "gap-1.5 sm:gap-1.5",
        className,
      )}
      dir="ltr"
      role="timer"
      aria-live="off"
    >
      {cells.map(([label, value], i) => (
        <div
          key={label}
          className={cn(
            "flex items-center gap-2 sm:gap-3",
            compact && "gap-1.5 sm:gap-1.5",
          )}
        >
          <div
            className={cn(
              "min-w-[3.6rem] rounded-2xl bg-black/40 px-2.5 py-2.5 text-center ring-1 ring-white/12 sm:min-w-[4.4rem] sm:px-3 sm:py-3",
              compact &&
                "min-w-[3.4rem] px-2 py-2 sm:min-w-[3.4rem] sm:px-2 sm:py-2",
            )}
          >
            <span
              key={value}
              className={cn(
                "count-tick block text-2xl font-black leading-none tabular-nums text-white sm:text-3xl",
                compact && "text-xl sm:text-xl",
              )}
            >
              {fmt.format(value)}
            </span>
            <span className="mt-1.5 block text-[10px] font-medium text-white/65 sm:text-[11px]">
              {label}
            </span>
          </div>
          {i < cells.length - 1 ? (
            <span className="text-lg font-black text-primary-300/70">:</span>
          ) : null}
        </div>
      ))}
    </div>
  );
}
