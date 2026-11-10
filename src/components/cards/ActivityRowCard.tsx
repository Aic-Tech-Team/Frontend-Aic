import Image from "next/image";
import { ArrowLeft, CalendarClock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { ActivityItem } from "@/types/activity";

/**
 * Activity as a wide row: the photo has a slanted inner edge and carries the item's number in
 * outline type; the text side has category, date, title, summary and a link that underlines
 * itself on hover.
 */
export function ActivityRowCard({
  item,
  index,
  ctaLabel,
  locale,
  className,
}: {
  item: ActivityItem;
  index: number;
  ctaLabel: string;
  locale: string;
  className?: string;
}) {
  return (
    <Link
      href={`/activities/${item.id}`}
      className={cn(
        "surface group relative flex h-full cursor-pointer items-stretch overflow-hidden rounded-3xl border border-border/40 md:rounded-[inherit] md:border-0",
        className,
      )}
    >
      <div className="relative w-32 shrink-0 overflow-hidden [clip-path:polygon(0_0,100%_0,calc(100%-1.4rem)_100%,0_100%)] sm:w-48 rtl:[clip-path:polygon(1.4rem_0,100%_0,100%_100%,0_100%)]">
        <Image
          src={item.image || "/images/banner.jpg"}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 640px) 192px, 128px"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-110"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/70 via-transparent to-black/20" />
        <span
          aria-hidden="true"
          className="absolute bottom-1 inset-s-3 text-5xl font-black leading-none text-transparent outline-text opacity-90 sm:bottom-2 sm:text-6xl"
        >
          {(index + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}
        </span>
      </div>

      <div className="flex min-w-0 flex-1 flex-col p-4 sm:p-6 sm:ps-5">
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 text-xs">
          {item.category ? (
            <span className="rounded-full bg-primary/15 px-2.5 py-0.5 font-semibold text-primary-300 ring-1 ring-primary/25">
              {item.category}
            </span>
          ) : null}
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <CalendarClock className="size-3.5 text-primary-300" />
            {item.dateLabel}
          </span>
        </div>
        <h3 className="mt-3 line-clamp-2 text-base font-extrabold leading-7 text-foreground transition-colors group-hover:text-primary-300 sm:text-lg">
          {item.title}
        </h3>
        <p className="mt-1.5 line-clamp-2 text-xs leading-6 text-muted-foreground sm:line-clamp-3 sm:text-sm sm:leading-7">
          {item.summary}
        </p>
        <span className="mt-auto flex items-center gap-2 pt-4 text-sm font-bold text-foreground">
          <span className="relative">
            {ctaLabel}
            <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary-300 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
          </span>
          <ArrowLeft className="size-4 text-primary-300 transition-transform duration-300 ltr:rotate-180 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
        </span>
      </div>
    </Link>
  );
}
