import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TeamItem } from "@/types/team";

interface TeamCardProps {
  team: TeamItem;
  /** Kept for API compatibility with callers. */
  index?: number;
  ctaLabel: string;
  href?: string;
  className?: string;
}

/**
 * Portrait card: framed photo up top, name + blurb + duty chips below.
 * Shadow is tight so it never gets clipped by carousel overflow.
 */
export function TeamCard({
  team,
  ctaLabel,
  href = "/teams",
  className,
}: TeamCardProps) {
  const duties = team.responsibilities.slice(0, 2);

  return (
    <Link
      href={href}
      className={cn(
        "surface group flex h-full w-full cursor-pointer flex-col rounded-3xl p-2.5",
        "transition-shadow duration-500 ease-out",
        "hover:shadow-[0_16px_36px_-22px_color-mix(in_srgb,var(--primary)_60%,transparent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-muted">
        <Image
          src={team.image}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 40vw, 280px"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-primary-900/60 via-transparent to-transparent"
        />
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <h3 className="line-clamp-1 text-lg font-extrabold leading-8 text-foreground">
          {team.name}
        </h3>
        {team.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-sm leading-7 text-muted-foreground">
            {team.shortDescription}
          </p>
        ) : null}

        {duties.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-1.5">
            {duties.map((d) => (
              <li
                key={d}
                className="rounded-full border border-primary/25 bg-primary/10 px-2.5 py-1 text-[11px] font-medium text-primary-300"
              >
                {d}
              </li>
            ))}
          </ul>
        ) : null}

        <span className="mt-auto flex items-center justify-between pt-4 text-sm font-bold text-foreground">
          {ctaLabel}
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/15 text-primary-300 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
          </span>
        </span>
      </div>
    </Link>
  );
}
