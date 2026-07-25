import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/reveal";

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
        className
      )}
    >
      <Icon className="h-3.5 w-3.5 shrink-0" />
      {children}
    </span>
  );
}

export function SectionMoreLink({
  href,
  className,
}: {
  href: string;
  className?: string;
}) {
  return (
    <a
      href={href}
      className={cn(
        "surface inline-flex shrink-0 items-center gap-2 rounded-full px-5 py-2.5 text-sm font-medium text-foreground transition-colors hover:text-primary-300",
        className
      )}
    >
      <ArrowLeft className="h-4 w-4" />
      مشاهده بیشتر
    </a>
  );
}

export function SectionHeading({
  badge,
  icon,
  title,
  description,
  moreHref,
  align = "start",
}: {
  badge: string;
  icon: LucideIcon;
  title: string;
  description?: string;
  moreHref?: string;
  align?: "start" | "center";
}) {
  const isCenter = align === "center";

  return (
    <Reveal
      direction="up"
      className={cn(
        "mb-10 flex flex-col gap-6",
        isCenter
          ? "items-center text-center"
          : "items-center justify-between sm:flex-row sm:items-end"
      )}
    >
      <div className={cn(isCenter ? "flex flex-col items-center" : "text-center sm:text-start")}>
        <SectionBadge icon={icon}>{badge}</SectionBadge>
        <h2 className="mt-5 text-2xl font-extrabold text-foreground sm:text-3xl">
          {title}
        </h2>
        {description ? (
          <p
            className={cn(
              "mt-2 text-sm text-muted-foreground sm:text-base",
              isCenter && "mx-auto max-w-2xl leading-7"
            )}
          >
            {description}
          </p>
        ) : null}
      </div>

      {moreHref ? <SectionMoreLink href={moreHref} /> : null}
    </Reveal>
  );
}
