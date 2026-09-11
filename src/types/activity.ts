export interface ActivityItem {
  id: string;
  category: string;
  title: string;
  image: string;
  summary: string;
  content?: string;
  dateLabel: string;
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
}

export interface ActivityBreadcrumbItem {
  label: string;
  href?: "/" | "/activities";
}