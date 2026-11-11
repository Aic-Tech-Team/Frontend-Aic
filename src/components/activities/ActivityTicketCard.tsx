"use client";

import { useLocale, useTranslations } from "next-intl";
import { ActivityRowCard } from "@/components/cards/ActivityRowCard";
import { ActivityCardShell } from "@/components/landing-sections/ActivityCardShell";
import type { ActivityItem } from "@/types/activity";

/**
 * Activity card for the activities list: the same box as on the landing page, the shared row card
 * inside the shell that runs a glowing border around it.
 */
export function ActivityTicketCard({
  activity,
  index = 0,
}: {
  activity: ActivityItem;
  index?: number;
}) {
  const t = useTranslations("ActivitiesPage");
  const locale = useLocale();
  return (
    <ActivityCardShell phaseOffset={index * 90}>
      <ActivityRowCard
        item={activity}
        index={index}
        locale={locale}
        ctaLabel={t("learnMore")}
      />
    </ActivityCardShell>
  );
}
