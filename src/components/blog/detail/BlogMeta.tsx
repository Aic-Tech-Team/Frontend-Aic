import { Calendar, Clock, RefreshCw, User } from "lucide-react";
import type { ArticleMetaItem, BlogDetailLabels } from "@/types/blog";

interface BlogMetaProps {
  meta: ArticleMetaItem;
  labels: BlogDetailLabels;
}

const META_STYLE =
  "flex items-center gap-1.5 whitespace-nowrap text-[12.5px] font-normal text-muted-foreground";

export function BlogMeta({ meta, labels }: BlogMetaProps) {
  return (
    <div dir="rtl" className="flex flex-wrap items-center gap-x-5 gap-y-2.5">
      <span className={META_STYLE}>
        <User className="h-4 w-4 shrink-0 text-primary-300" strokeWidth={1.8} />
        {labels.authorLabel}: {meta.author}
      </span>
      <span className={META_STYLE}>
        <Calendar
          className="h-4 w-4 shrink-0 text-primary-300"
          strokeWidth={1.8}
        />
        {labels.publishedLabel}: {meta.publishedAt}
      </span>
      <span className={META_STYLE}>
        <RefreshCw
          className="h-4 w-4 shrink-0 text-primary-300"
          strokeWidth={1.8}
        />
        {labels.updatedLabel}: {meta.updatedAt}
      </span>
      <span className={META_STYLE}>
        <Clock
          className="h-4 w-4 shrink-0 text-primary-300"
          strokeWidth={1.8}
        />
        {labels.readTimeLabel}: {meta.readTime}
      </span>
    </div>
  );
}
