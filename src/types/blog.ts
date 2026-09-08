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