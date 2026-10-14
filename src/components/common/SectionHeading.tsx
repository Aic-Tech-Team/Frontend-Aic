import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/animations/Reveal";
import { ScrollText } from "@/components/animations/ScrollText";
import GlareHover from "@/components/animations/GlareHover";
import { Link } from "@/i18n/navigation";

function SectionMoreLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <GlareHover
      width="fit-content"
      height="auto"
      background="transparent"
      borderColor="transparent"
      borderRadius="9999px"
      glareColor="#c4b5fd"
      glareOpacity={0.45}
      glareSize={220}
      className="glare-hover--fit shrink-0"
    >
      <Link
        href={href}
        className={cn(
          "group inline-flex items-center gap-2 rounded-full border border-border/60 px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:border-primary/60 hover:bg-primary/10",
          className,
        )}
      >
        {label}
        <ArrowLeft className="h-4 w-4 transition-transform duration-300 ltr:rotate-180 ltr:group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5" />
      </Link>
    </GlareHover>
  );
}

export function SectionHeading({
  badge,
  title,
  description,
  moreHref,
  moreLabel,
  align = "start",
  className,
}: {
  badge: string;
  icon?: LucideIcon;
  title: string;
  description?: string;
  moreHref?: string;
  moreLabel?: string;
  align?: "start" | "center";
  className?: string;
}) {
  const isCenter = align === "center";
  const hasMore = Boolean(moreHref && moreLabel);

  return (
    <Reveal direction="up" className={cn("mb-8 sm:mb-10", className)}>
      <div className={isCenter ? "text-center" : "text-center lg:text-start"}>
        <div
          className={cn(
            "flex flex-col gap-4",
            isCenter
              ? "items-center"
              : hasMore
                ? "items-center lg:flex-row lg:items-center lg:justify-between lg:gap-8"
                : "items-center lg:items-start",
          )}
        >
          <span className="sr-only">{badge}</span>
          <h2 className="min-w-0 text-pretty text-2xl font-extrabold leading-snug tracking-tight text-foreground sm:text-3xl lg:text-4xl">
            {title}
          </h2>
          {hasMore ? (
            <SectionMoreLink href={moreHref!} label={moreLabel!} />
          ) : null}
        </div>

        {description ? (
          <ScrollText
            text={description}
            className={cn(
              "mt-3 w-full text-pretty text-sm leading-8 text-muted-foreground sm:text-base sm:leading-8",
              isCenter && "mx-auto max-w-2xl",
            )}
          />
        ) : null}
      </div>
    </Reveal>
  );
}
