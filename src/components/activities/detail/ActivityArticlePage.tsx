import { ActivityContent } from "./ActivityContent";
import { ActivityHeader } from "./ActivityHeader";
import { ActivityHero } from "./ActivityHero";
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
  paragraphs: string[];
  recentActivities: SidebarActivity[];
  labels: ActivityDetailLabels;
}

export function ActivityArticlePage({
  breadcrumb,
  category,
  title,
  meta,
  heroImage,
  heroAlt,
  paragraphs,
  recentActivities,
  labels,
}: ActivityArticlePageProps) {
  return (
    <div dir="rtl" className="w-full py-6 sm:py-10">
      <div className="mx-auto w-full max-w-[1200px] px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-10">
          <article className="surface real-ticket-mask real-ticket-mask--vertical min-w-0 border-0 p-5 sm:p-7 lg:p-9">
            <ActivityHeader
              breadcrumb={breadcrumb}
              category={category}
              title={title}
              meta={meta}
              labels={labels}
            />

            <div className="mt-6">
              <ActivityHero src={heroImage} alt={heroAlt} />
            </div>

            <div className="mt-7">
              <ActivityContent paragraphs={paragraphs} />
            </div>
          </article>

          <aside className="flex min-w-0 flex-col gap-6 md:sticky md:top-24 md:self-start">
            <RecentActivities activities={recentActivities} labels={labels} />
          </aside>
        </div>
      </div>
    </div>
  );
}
