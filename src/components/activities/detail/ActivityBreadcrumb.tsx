import { ChevronLeft } from "lucide-react";
import { Fragment } from "react";
import { Link } from "@/i18n/navigation";
import type { ActivityBreadcrumbItem } from "@/types/activity";

interface ActivityBreadcrumbProps {
  items: ActivityBreadcrumbItem[];
  ariaLabel: string;
}

export function ActivityBreadcrumb({
  items,
  ariaLabel,
}: ActivityBreadcrumbProps) {
  return (
    <nav aria-label={ariaLabel} dir="rtl" className="w-full">
      <ol className="flex flex-wrap items-center gap-y-1 text-[12.5px] leading-6">
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={`${item.label}-${index}`}>
              {index > 0 ? (
                <ChevronLeft
                  className="mx-1.5 h-3.5 w-3.5 shrink-0 text-muted-foreground"
                  aria-hidden
                />
              ) : null}
              <li className="min-w-0">
                {isLast ? (
                  <span
                    aria-current="page"
                    className="block max-w-full truncate font-medium text-card-foreground"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href ?? "/"}
                    className="whitespace-nowrap font-normal text-muted-foreground transition-colors hover:text-primary-300"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  ); 
}