import { ActivityBreadcrumb } from "./ActivityBreadcrumb";
import { ActivityMeta } from "./ActivityMeta";
import type {
  ActivityBreadcrumbItem,
  ActivityDetailLabels,
  ActivityMetaItem,
} from "@/types/activity";

interface ActivityHeaderProps {
  breadcrumb: ActivityBreadcrumbItem[];
  category: string;
  title: string;
  meta: ActivityMetaItem;
  labels: ActivityDetailLabels;
}

export function ActivityHeader({
  breadcrumb,
  category,
  title,
  meta,
  labels,
}: ActivityHeaderProps) {
  return (
    <header dir="rtl" className="w-full text-right">
      <ActivityBreadcrumb items={breadcrumb} ariaLabel={labels.breadcrumbLabel} />

      <div className="mt-4 flex items-start justify-between gap-4">
        <h1 className="min-w-0 flex-1 text-[22px] font-extrabold leading-[1.7] text-card-foreground sm:text-[28px] lg:text-[32px] lg:leading-[1.65]">
          {title}
        </h1>

        <span className="inline-flex shrink-0 items-center rounded-lg bg-primary/15 px-3 py-1 text-[12.5px] font-medium text-primary-300">
          {category}
        </span>
      </div>

      <div className="mt-4">
        <ActivityMeta meta={meta} labels={labels} />
      </div>
    </header>
  );
}