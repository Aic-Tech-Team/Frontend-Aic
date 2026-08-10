import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/animations/Reveal";
import { Link } from "@/i18n/navigation";

export function SectionBadge({
  icon: Icon,
  children,
  className,
}: {
  icon: LucideIcon;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "surface inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium text-primary-300",
        className,
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}

export function SectionMoreLink({
  href,
  label,
  className,
}: {
  href: string;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "surface inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-primary-300",
        className,
      )}
    >
      {label}
      <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
    </Link>
  );
}

export function SectionHeading({
  badge,
  icon,
  title,
  description,
  moreHref,
  moreLabel,
  align = "start",
}: {
  badge: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  moreHref?: string;
  moreLabel?: string;
  align?: "start" | "center";
}) {
  const isCenter = align === "center";

  return (
    <Reveal
      direction="up"
      className={cn(
        "mb-8 flex flex-col gap-5 sm:mb-10 sm:gap-6",
        isCenter
          ? "items-center text-center"
          : "items-center justify-between text-center lg:flex-row lg:items-end lg:justify-between",
      )}
    >
      <div
        className={cn(
          isCenter ? "flex flex-col items-center" : "text-center lg:text-start",
        )}
      >
        <SectionBadge icon={icon}>{badge}</SectionBadge>
        <h2 className="mt-4 max-w-full text-xl font-extrabold wrap-break-words text-foreground sm:mt-5 sm:text-2xl md:text-3xl">
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-2 max-w-full text-sm leading-7 text-muted-foreground sm:text-base",
              isCenter && "mx-auto max-w-2xl",
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {moreHref && moreLabel ? (
        <SectionMoreLink href={moreHref} label={moreLabel} />
      ) : null}
    </Reveal>
  );
}
