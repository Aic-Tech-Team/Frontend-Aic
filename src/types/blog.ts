export interface BlogPostItem {
  id: string;
  category: string;
  title: string;
  author?: string;
  image: string;
  summary: string;
  content?: string;
  publishedLabel: string;
  publishedAt: string;
}

export interface SidebarPost {
  id: string;
  title: string;
  image: string;
  date: string;
  readTime: string;
  source: string;
}

export interface ArticleMetaItem {
  author: string;
  publishedAt: string;
  updatedAt: string;
  readTime: string;
}

export interface BlogDetailLabels {
  breadcrumbLabel: string;
  latestPostsTitle: string;
  viewAll: string;
  authorLabel: string;
  publishedLabel: string;
  updatedLabel: string;
  readTimeLabel: string;
}

export interface BlogBreadcrumbItem {
  label: string;
  href?: "/" | "/blog";
}
