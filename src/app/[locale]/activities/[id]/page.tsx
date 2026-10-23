import { stripMarkdown } from "@/lib/utils";
import { notFound } from "next/navigation";
import { ContentUnavailablePage } from "@/components/common/ContentUnavailable";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActivityArticlePage } from "@/components/activities/detail/ActivityArticlePage";
import {
  fetchActivities,
  fetchActivity,
  mapApiActivity,
  type ApiActivity,
} from "@/services/api/activities";
import type { SidebarActivity } from "@/types/activity";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;
  const result = await fetchActivity(id);
  if (!result.ok) return {};
  return {
    title: result.data.title,
    description:
      result.data.short_description ??
      stripMarkdown(result.data.description ?? "").slice(0, 160),
  };
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ActivityDetailPage");

  const result = await fetchActivity(id);
  if (!result.ok) {
    if (result.notFound) notFound();
    return <ContentUnavailablePage />;
  }

  const activity = mapApiActivity(result.data, locale);

  const list = await fetchActivities({ page_size: 8 });
  const recentActivities = toSidebar(list?.results ?? [], activity.id, locale);

  return (
    <ActivityArticlePage
      breadcrumb={[
        { label: t("breadcrumbHome"), href: "/" },
        { label: t("breadcrumbActivities"), href: "/activities" },
        { label: activity.title },
      ]}
      category={activity.category}
      title={activity.title}
      meta={{ dateLabel: activity.dateLabel }}
      heroImage={activity.image}
      heroAlt={activity.title}
      content={activity.content ?? activity.summary}
      recentActivities={recentActivities}
      labels={{
        breadcrumbLabel: t("breadcrumbLabel"),
        latestActivitiesTitle: t("latestActivitiesTitle"),
        viewAll: t("viewAll"),
        dateLabel: t("dateLabel"),
      }}
    />
  );
}

function toSidebar(
  rows: ApiActivity[],
  excludeId: string,
  locale: string,
): SidebarActivity[] {
  return rows
    .filter((a) => String(a.id) !== excludeId)
    .slice(0, 4)
    .map((a) => {
      const mapped = mapApiActivity(a, locale);
      return {
        id: mapped.id,
        title: mapped.title,
        image: mapped.image,
        date: mapped.dateLabel,
        category: mapped.category,
      } satisfies SidebarActivity;
    });
}
