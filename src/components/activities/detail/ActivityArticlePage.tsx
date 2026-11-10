import { StickyColumn } from "@/components/common/StickyColumn";
import { ActivityContent } from "./ActivityContent";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityHero } from "./ActivityHero";
import { ActivityInfoCard } from "./ActivityInfoCard";
import { RecentActivities } from "./SidebarActivityCards";
import type {
  ActivityBreadcrumbItem,
  ActivityDetailLabels,
  ActivityMetaItem,
  SidebarActivity,
} from "@/types/activity";

interface ActivityArticlePageProps {
  breadcrumb: ActivityBreadcrumbItem[];
  category: string;
  title: string;
  meta: ActivityMetaItem;
  heroImage: string;
  heroAlt: string;
  /** A short summary shown under the title, when the text does not open with it. */
  lead?: string;
  content: string;
  recentActivities: SidebarActivity[];
  labels: ActivityDetailLabels;
}

/**
 * An article card in the same rounded `surface` as the sidebar cards (no ticket edge: that shape
 * belongs to events), on the site's container so its edges line up with the header. The sidebar
 * opens with the facts of the activity and a share button, then the recent ones.
 */
export function ActivityArticlePage({
  breadcrumb,
  category,
  title,
  meta,
  heroImage,
  heroAlt,
  lead,
  content,
  recentActivities,
  labels,
}: ActivityArticlePageProps) {
  return (
    <div dir="rtl" className="w-full py-6 sm:py-10">
      <div className="container">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <article className="surface min-w-0 rounded-[18px] p-5 shadow-none sm:p-7 lg:p-9">
            <ActivityHeader
              breadcrumb={breadcrumb}
              category={category}
              title={title}
              meta={meta}
              labels={labels}
            />

            {lead ? (
              <p className="mt-4 text-pretty text-base leading-8 text-muted-foreground">
                {lead}
              </p>
            ) : null}

            <div className="mt-6">
              <ActivityHero src={heroImage} alt={heroAlt} />
            </div>

            <div className="mt-7">
              <ActivityContent content={content} />
            </div>
          </article>

          <StickyColumn as="aside" className="flex min-w-0 flex-col gap-6">
            <ActivityInfoCard
              dateLabel={meta.dateLabel}
              category={category}
              title={title}
              labels={labels}
            />
            {recentActivities.length > 0 ? (
              <RecentActivities activities={recentActivities} labels={labels} />
            ) : null}
          </StickyColumn>
        </div>
      </div>
    </div>
  );
}
