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
import { Reveal } from "@/components/animations/Reveal";

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

  const [result, list] = await Promise.all([
    fetchActivity(id),
    fetchActivities({ page_size: 8 }),
  ]);
  if (!result.ok) {
    if (result.notFound) notFound();
    return <ContentUnavailablePage />;
  }

  const activity = mapApiActivity(result.data, locale);
  // the short summary is shown as a lead only when the text does not already open with it
  const showLead =
    Boolean(result.data.short_description) &&
    !(activity.content ?? "")
      .trim()
      .startsWith(activity.summary.trim().slice(0, 30));
  const recentActivities = toSidebar(list?.results ?? [], activity.id, locale);

  return (
    <Reveal direction="up" duration={1.1}>
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
        lead={showLead ? activity.summary : ""}
        content={activity.content ?? activity.summary}
        recentActivities={recentActivities}
        labels={{
          breadcrumbLabel: t("breadcrumbLabel"),
          latestActivitiesTitle: t("latestActivitiesTitle"),
          viewAll: t("viewAll"),
          dateLabel: t("dateLabel"),
          infoTitle: t("infoTitle"),
          categoryLabel: t("categoryLabel"),
          share: t("share"),
          linkCopied: t("linkCopied"),
        }}
      />
    </Reveal>
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
