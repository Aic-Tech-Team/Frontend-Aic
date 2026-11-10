"use client";

import { contactHref } from "@/components/contact/intents";
import { useState } from "react";
import { CalendarPlus, CircleSlash, Share2, Ticket } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { buttonVariants } from "@/components/ui/button-variants";
import { GlareButton } from "@/components/ui/glare-button";
import { cn } from "@/lib/utils";

const stamp = (d: Date) =>
  d
    .toISOString()
    .replace(/[-:]/g, "")
    .replace(/\.\d{3}/, "");

/** A Google Calendar "add event" link; an end time equal to the start gets two hours. */
function calendarHref(p: {
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  details: string;
}) {
  const start = new Date(p.startAt);
  if (Number.isNaN(start.getTime())) return null;
  let end = new Date(p.endAt);
  if (Number.isNaN(end.getTime()) || end <= start)
    end = new Date(start.getTime() + 2 * 3600 * 1000);
  const q = new URLSearchParams({
    action: "TEMPLATE",
    text: p.title,
    dates: `${stamp(start)}/${stamp(end)}`,
    details: p.details.slice(0, 600),
    location: p.location,
  });
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
}

/** Register, add to calendar, share. A finished event shows a closed state instead of registering. */
export function EventActions({
  title,
  startAt,
  endAt,
  location,
  details,
  registrationLink,
  isPast,
  labels,
  compact,
  secondary,
  className,
}: {
  title: string;
  startAt: string;
  endAt: string;
  location: string;
  details: string;
  registrationLink?: string;
  isPast: boolean;
  labels: {
    register: string;
    ended: string;
    calendar: string;
    share: string;
    copied: string;
  };
  /** Only the register / ended control, for the ticket stub. */
  compact?: boolean;
  /** Only calendar and share, set as plain text links. */
  secondary?: boolean;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const calendar = calendarHref({ title, startAt, endAt, location, details });

  async function share() {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // the share sheet was dismissed: nothing to do
    }
  }

  const ghost = secondary
    ? "inline-flex items-center gap-2 text-sm font-bold text-muted-foreground underline decoration-border underline-offset-[7px] outline-none transition-colors hover:text-foreground hover:decoration-primary-300 focus-visible:ring-2 focus-visible:ring-ring"
    : cn(
        buttonVariants({ variant: "outline", size: "lg" }),
        "h-12 gap-2 rounded-full border-border/60 bg-background/30 px-5",
      );

  return (
    <div
      className={cn(
        secondary
          ? "flex flex-wrap items-center gap-x-6 gap-y-3"
          : "flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center",
        className,
      )}
    >
      {secondary ? null : isPast ? (
        <span
          className={cn(
            buttonVariants({ variant: "outline", size: "lg" }),
            "h-12 gap-2 rounded-full opacity-70",
          )}
        >
          <CircleSlash className="size-4" />
          {labels.ended}
        </span>
      ) : (
        <GlareButton className="w-full sm:w-auto">
          {registrationLink ? (
            <a
              href={registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-full gap-2 rounded-full px-8 shadow-glow sm:w-auto",
              )}
            >
              <Ticket className="size-4" />
              {labels.register}
            </a>
          ) : (
            <Link
              href={contactHref("question")}
              className={cn(
                buttonVariants({ size: "lg" }),
                "h-12 w-full gap-2 rounded-full px-8 shadow-glow sm:w-auto",
              )}
            >
              <Ticket className="size-4" />
              {labels.register}
            </Link>
          )}
        </GlareButton>
      )}

      {!compact && calendar && !isPast ? (
        <a
          href={calendar}
          target="_blank"
          rel="noopener noreferrer"
          className={ghost}
        >
          <CalendarPlus className="size-4" />
          {labels.calendar}
        </a>
      ) : null}

      {!compact ? (
        <button type="button" onClick={share} className={ghost}>
          <Share2 className="size-4" />
          {copied ? labels.copied : labels.share}
        </button>
      ) : null}
    </div>
  );
}
