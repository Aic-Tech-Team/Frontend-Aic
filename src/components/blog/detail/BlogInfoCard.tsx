import { CalendarDays, Clock, RefreshCw, Tag } from "lucide-react";
import { ShareButton } from "@/components/common/ShareButton";
import type { ArticleMetaItem, BlogDetailLabels } from "@/types/blog";

/** The author, the dates, the reading time and the category, with a way to pass the article on. */
export function BlogInfoCard({
  meta,
  category,
  title,
  labels,
}: {
  meta: ArticleMetaItem;
  category: string;
  title: string;
  labels: BlogDetailLabels;
}) {
  const row = "flex items-start gap-3 py-3.5 [&:not(:last-of-type)]:border-b [&:not(:last-of-type)]:border-dashed [&:not(:last-of-type)]:border-border/60";
  const icon = "mt-1 size-4 shrink-0 text-primary-300";
  const label = "text-xs text-muted-foreground";
  const value = "mt-0.5 text-sm font-extrabold text-foreground";

  return (
    <section dir="rtl" className="surface w-full rounded-[18px] p-5 shadow-none sm:p-6">
      <h2 className="mb-4 text-[15px] font-bold text-card-foreground">{labels.infoTitle}</h2>

      {meta.author ? (
        <div className="mb-1 flex items-center gap-3 border-b border-dashed border-border/60 pb-4">
          <span
            aria-hidden="true"
            className="flex size-11 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-primary-700 text-lg font-extrabold text-white"
          >
            {meta.author.trim().charAt(0)}
          </span>
          <div className="min-w-0">
            <p className={label}>{labels.authorLabel}</p>
            <p className="truncate text-base font-extrabold text-foreground">{meta.author}</p>
          </div>
        </div>
      ) : null}

      <dl>
        <div className={row}>
          <CalendarDays className={icon} strokeWidth={1.8} />
          <div>
            <dt className={label}>{labels.publishedLabel}</dt>
            <dd className={value}>{meta.publishedAt}</dd>
          </div>
        </div>
        {meta.updatedAt ? (
          <div className={row}>
            <RefreshCw className={icon} strokeWidth={1.8} />
            <div>
              <dt className={label}>{labels.updatedLabel}</dt>
              <dd className={value}>{meta.updatedAt}</dd>
            </div>
          </div>
        ) : null}
        <div className={row}>
          <Clock className={icon} strokeWidth={1.8} />
          <div>
            <dt className={label}>{labels.readTimeLabel}</dt>
            <dd className={value}>{meta.readTime}</dd>
          </div>
        </div>
        {category ? (
          <div className={row}>
            <Tag className={icon} strokeWidth={1.8} />
            <div>
              <dt className={label}>{labels.categoryLabel}</dt>
              <dd className={value}>{category}</dd>
            </div>
          </div>
        ) : null}
      </dl>

      <ShareButton
        title={title}
        label={labels.share}
        copiedLabel={labels.linkCopied}
        className="mt-4"
      />
    </section>
  );
}
