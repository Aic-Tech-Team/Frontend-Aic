import { CalendarClock, Tag } from "lucide-react";
import { ShareButton } from "@/components/common/ShareButton";
import type { ActivityDetailLabels } from "@/types/activity";

/** The facts of the activity (when, what kind) and a way to pass the page on, kept beside the text. */
export function ActivityInfoCard({
  dateLabel,
  category,
  title,
  labels,
}: {
  dateLabel: string;
  category: string;
  title: string;
  labels: ActivityDetailLabels;
}) {
  const row =
    "flex items-start gap-3 py-4 first:pt-0 [&:not(:last-of-type)]:border-b [&:not(:last-of-type)]:border-dashed [&:not(:last-of-type)]:border-border/60";
  return (
    <section dir="rtl" className="surface w-full rounded-[18px] p-5 shadow-none sm:p-6">
      <h2 className="mb-4 text-[15px] font-bold text-card-foreground">
        {labels.infoTitle}
      </h2>
      <dl>
        <div className={row}>
          <CalendarClock
            className="mt-1 size-4 shrink-0 text-primary-300"
            strokeWidth={1.8}
          />
          <div>
            <dt className="text-xs text-muted-foreground">{labels.dateLabel}</dt>
            <dd className="mt-1 text-base font-extrabold text-foreground">
              {dateLabel}
            </dd>
          </div>
        </div>
        {category ? (
          <div className={row}>
            <Tag
              className="mt-1 size-4 shrink-0 text-primary-300"
              strokeWidth={1.8}
            />
            <div>
              <dt className="text-xs text-muted-foreground">
                {labels.categoryLabel}
              </dt>
              <dd className="mt-1 text-base font-extrabold text-foreground">
                {category}
              </dd>
            </div>
          </div>
        ) : null}
      </dl>
      <ShareButton
        title={title}
        label={labels.share}
        copiedLabel={labels.linkCopied}
        className="mt-5"
      />
    </section>
  );
}
