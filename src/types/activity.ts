export interface ActivityItem {
  id: string;
  category: string;
  title: string;
  image: string;
  summary: string;
  content?: string;
  dateLabel: string;
  /** ISO start (or creation) time; the day stamp on cards is drawn from it. */
  startAt?: string;
}

export interface SidebarActivity {
  id: string;
  title: string;
  image: string;
  date: string;
  category: string;
}

export interface ActivityMetaItem {
  dateLabel: string;
}

export interface ActivityDetailLabels {
  breadcrumbLabel: string;
  latestActivitiesTitle: string;
  viewAll: string;
  dateLabel: string;
  infoTitle: string;
  categoryLabel: string;
  share: string;
  linkCopied: string;
}

export interface ActivityBreadcrumbItem {
  label: string;
  href?: "/" | "/activities";
}