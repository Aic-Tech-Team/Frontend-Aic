import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ActivityArticlePage } from "@/components/activities/detail/ActivityArticlePage";
import { ApiError } from "@/services/api/client";
import {
  fetchActivities,
  fetchActivity,
  mapApiActivity,
} from "@/hooks/api/activities";
import type { SidebarActivity } from "@/types/activity";

export const revalidate = 300;


function splitParagraphs(content: string | undefined, summary: string): string[] {
  const raw = (content ?? summary ?? "").trim();
  if (!raw) return [];
  const parts = raw
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (parts.length > 0) return parts;
  if (raw.length > 400) {
    const mid = Math.floor(raw.length / 2);
    const splitAt = raw.indexOf(".", mid) + 1 || mid;
    return [raw.slice(0, splitAt).trim(), raw.slice(splitAt).trim()].filter(
      Boolean,
    );
  }
  return [raw];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { id } = await params;

  try {
    const apiActivity = await fetchActivity(id);
    return {
      title: apiActivity.title,
      description:
        apiActivity.short_description ??
        apiActivity.description?.slice(0, 160),
    };
  } catch {
    return {};
  }
}

export default async function ActivityDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("ActivityDetailPage");

  let apiActivity: Awaited<ReturnType<typeof fetchActivity>>;
  try {
    apiActivity = await fetchActivity(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  const activity = mapApiActivity(apiActivity);

  let recentActivities: SidebarActivity[] = [];
  try {
    const list = await fetchActivities({
      page_size: 8,
    });
    recentActivities = list.results
      .filter((a) => String(a.id) !== activity.id)
      .slice(0, 4)
      .map((a) => {
        const mapped = mapApiActivity(a);
        return {
          id: mapped.id,
          title: mapped.title,
          image: mapped.image,
          date: mapped.dateLabel,
          category: mapped.category,
        } satisfies SidebarActivity;
      });
  } catch {
    recentActivities = [];
  }

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
      paragraphs={splitParagraphs(activity.content, activity.summary)}
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
