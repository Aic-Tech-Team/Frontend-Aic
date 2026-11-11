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
  /** Date of the last edit, in words; empty when the API gives none. */
  updatedLabel?: string;
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
  /** Empty when the article has not been edited since it came out. */
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
  infoTitle: string;
  categoryLabel: string;
  share: string;
  linkCopied: string;
  tocTitle: string;
}

export interface BlogBreadcrumbItem {
  label: string;
  href?: "/" | "/blog" | "/events";
}
