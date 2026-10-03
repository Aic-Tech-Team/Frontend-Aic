import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { TeamItem } from "@/types/team";

interface TeamCardProps {
  team: TeamItem;
  index: number;
  ctaLabel: string;
  href?: string;
  className?: string;
}

export function TeamCard({
  team,
  index,
  ctaLabel,
  href = "/teams",
  className,
}: TeamCardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-3xl",
        "border border-border/70 bg-card text-card-foreground shadow-lg",
        "transition-[border-color,box-shadow,transform] duration-300 ease-out",
        "hover:border-primary/45 hover:shadow-glow",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
        "active:scale-[0.99]",
        "motion-reduce:transition-none motion-reduce:active:scale-100",
        className,
      )}
    >
      <div className="relative aspect-4/3 w-full shrink-0 overflow-hidden bg-card">
        <Image
          src={team.image}
          alt={team.name}
          fill
          sizes="(max-width: 640px) 82vw, (max-width: 1024px) 40vw, 280px"
          className="object-cover"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-linear-to-t from-card from-5% via-transparent via-40% to-black/25"
        />
        <span className="absolute inset-e-3 top-3 z-10 rounded-full border border-white/20 bg-black/50 px-2.5 py-1 font-mono text-[11px] font-semibold tracking-wider text-white/90 backdrop-blur-md">
          {String(index + 1).padStart(2, "0")}
        </span>
      </div>

      <div className="relative z-10 -mt-px flex flex-1 flex-col gap-2.5 bg-card px-4 pb-4 pt-3 sm:px-5 sm:pb-5 sm:pt-3.5">
        <div className="space-y-1.5">
          <h3 className="line-clamp-2 text-base font-bold leading-snug text-foreground sm:text-lg">
            {team.name}
          </h3>
          {team.shortDescription ? (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              {team.shortDescription}
            </p>
          ) : null}
        </div>

        <div className="mt-auto flex items-center justify-end border-t border-dashed border-border/70 pt-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-foreground/90 transition-colors duration-200 group-hover:text-primary">
            {ctaLabel}
            <ArrowLeft
              className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-x-0.5 motion-reduce:transition-none"
              aria-hidden
            />
          </span>
        </div>
      </div>
    </Link>
  );
}
