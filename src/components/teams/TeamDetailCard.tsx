import Image from "next/image";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TeamItem } from "@/types/team";

interface TeamDetailCardProps {
  team: TeamItem;
  index: number;
  responsibilitiesLabel: string;
  active?: boolean;
  className?: string;
}

export function TeamDetailCard({
  team,
  index,
  responsibilitiesLabel,
  active = false,
  className,
}: TeamDetailCardProps) {
  const bullets = team.responsibilities.slice(0, 5);

  return (
    <article
      className={cn(
        "relative flex h-[500px] w-[340px] flex-col overflow-hidden rounded-3xl sm:h-[530px] sm:w-[390px]",
        "border bg-card text-card-foreground shadow-lg",
        "transition-[border-color,box-shadow,opacity,filter] duration-300 ease-out",
        active
          ? "border-primary/50 opacity-100 shadow-glow"
          : "border-border/60 opacity-95",
        className,
      )}
    >
      <div className="relative h-[42%] w-full shrink-0 overflow-hidden bg-muted">
        <Image
          src={team.image}
          alt={team.name}
          fill
          sizes="360px"
          className="object-cover"
          draggable={false}
          priority={index === 0}
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-linear-to-t from-card via-card/40 to-black/20"
        />
        <div className="absolute inset-x-0 bottom-0 z-10 px-4 pb-3 sm:px-5 sm:pb-4">
          <h2 className="text-lg font-black leading-snug text-white wrap-break-word sm:text-xl">
            {team.name}
          </h2>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-3 bg-card px-4 py-3.5 sm:px-5 sm:py-4">
        {team.shortDescription ? (
          <p className="line-clamp-3 text-start text-sm leading-6 text-muted-foreground">
            {team.shortDescription}
          </p>
        ) : null}

        {bullets.length > 0 ? (
          <div className="mt-auto min-w-0">
            <p className="text-start text-[11px] font-semibold text-primary">
              {responsibilitiesLabel}
            </p>
            <ul className="mt-1.5 space-y-1.5">
              {bullets.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-2 text-start text-[11px] leading-5 text-foreground/85"
                >
                  <Check
                    className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary-300"
                    strokeWidth={2.5}
                    aria-hidden
                  />
                  <span className="line-clamp-2 min-w-0">{item}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </article>
  );
}
