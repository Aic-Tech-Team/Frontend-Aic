import { CalendarClock } from "lucide-react";
import type { ActivityDetailLabels, ActivityMetaItem } from "@/types/activity";

interface ActivityMetaProps {
  meta: ActivityMetaItem;
  labels: ActivityDetailLabels;
}

const META_STYLE =
  "flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-normal text-muted-foreground";

export function ActivityMeta({ meta, labels }: ActivityMetaProps) {
  return (
    <div dir="rtl" className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
      <span className={META_STYLE}>
        <CalendarClock
          className="h-4 w-4 shrink-0 text-primary-300"
          strokeWidth={1.8}
        />
        {labels.dateLabel}: {meta.dateLabel}
      </span>
    </div>
  );
}