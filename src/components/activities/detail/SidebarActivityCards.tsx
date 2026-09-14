import { ArrowLeft } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { ActivityDetailLabels, SidebarActivity } from "@/types/activity";
import { SidebarActivityCard } from "./SidebarActivityCard";

interface SidebarCardShellProps {
  title: string;
  linkLabel: string;
  children: React.ReactNode;
}

function SidebarCardShell({
  title,
  linkLabel,
  children,
}: SidebarCardShellProps) {
  return (
    <section dir="rtl" className="surface w-full rounded-[18px] p-5 sm:p-6">
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-card-foreground">{title}</h2>
        <Link
          href="/activities"
          className="inline-flex items-center gap-1 text-[12px] font-medium text-muted-foreground transition-colors hover:text-primary-300"
        >
          {linkLabel}
          <ArrowLeft className="h-3.5 w-3.5" strokeWidth={2} />
        </Link>
      </div>
      {children}
    </section>
  );
}

export function RecentActivities({
  activities,
  labels,
}: {
  activities: SidebarActivity[];
  labels: ActivityDetailLabels;
}) {
  return (
    <SidebarCardShell
      title={labels.latestActivitiesTitle}
      linkLabel={labels.viewAll}
    >
      <div className="flex flex-col">
        {activities.map((activity, index) => (
          <SidebarActivityCard
            key={activity.id}
            activity={activity}
            showDivider={index < activities.length - 1}
          />
        ))}
      </div>
    </SidebarCardShell>
  );
}