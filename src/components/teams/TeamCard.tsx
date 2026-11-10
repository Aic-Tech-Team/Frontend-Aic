"use client";

import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TeamItem } from "@/types/team";

interface TeamCardProps {
  team: TeamItem;
  /** Shown as the department's number on its photo; leave out to hide it. */
  index?: number;
  ctaLabel: string;
  href?: string;
  className?: string;
}

/**
 * Department card: the photo wears the department's number in outline type, the duties sit on
 * the photo as tags, and the call-to-action row underlines itself on hover. Shadow stays tight
 * so a carousel's overflow never clips it.
 */
export function TeamCard({ team, index, ctaLabel, href = "/teams", className }: TeamCardProps) {
  const locale = useLocale();
  const duties = team.responsibilities.slice(0, 2);

  return (
    <Link
      href={href}
      className={cn(
        "surface card-lift group flex h-full w-full cursor-pointer flex-col rounded-3xl p-2.5",
        "transition-shadow duration-500 ease-out",
        "hover:shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--primary)_60%,transparent)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        className,
      )}
    >
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden rounded-2xl bg-muted">
        <Image
          src={team.image}
          alt=""
          fill
          unoptimized
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 40vw, 300px"
          className="object-cover transition-transform duration-1000 ease-out group-hover:scale-110"
        />
        <div aria-hidden className="absolute inset-0 bg-linear-to-t from-primary-900/85 via-primary-900/10 to-transparent" />
        {index !== undefined ? (
          <span
            aria-hidden
            className="absolute -bottom-1 inset-s-3 text-6xl font-black leading-none text-transparent outline-text opacity-90 transition-transform duration-700 group-hover:-translate-y-2"
          >
            {(index + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}
          </span>
        ) : null}
        {duties.length > 0 ? (
          <ul className="absolute inset-e-2.5 top-2.5 flex max-w-[75%] flex-wrap justify-end gap-1.5">
            {duties.map((d) => (
              <li key={d} className="truncate rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/15 transition-[transform,background-color] duration-500 group-hover:-translate-y-0.5 group-hover:bg-primary/80">
                {d}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col px-3 pb-3 pt-4">
        <h3 className="line-clamp-1 text-lg font-extrabold leading-8 text-foreground transition-colors group-hover:text-primary-300">
          {team.name}
        </h3>
        {team.shortDescription ? (
          <p className="mt-1 line-clamp-2 text-sm leading-7 text-muted-foreground">{team.shortDescription}</p>
        ) : null}

        <span className="mt-auto flex items-center gap-3 pt-4 text-sm font-bold text-foreground">
          {ctaLabel}
          <span aria-hidden className="relative h-px flex-1 overflow-hidden bg-border">
            <span className="absolute inset-0 origin-left bg-primary-300 transition-transform duration-700 ease-out [transform:scaleX(0)] group-hover:[transform:scaleX(1)] rtl:origin-right" />
          </span>
          <span className="flex size-9 items-center justify-center rounded-full bg-primary/15 text-primary-300 transition-colors duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
            <ArrowLeft className="size-4 ltr:rotate-180" />
          </span>
        </span>
      </div>
    </Link>
  );
}
