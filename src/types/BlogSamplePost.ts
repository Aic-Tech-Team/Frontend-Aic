import type { BlogPostItem } from "@/types/blog";

/**
 * ⚠️ Static placeholder data — no API call involved. Swap this file's
 * usage for the real `fetchBlogPosts`/`fetchBlogPost` (see hooks/api/blogs.ts)
 * once you're ready to wire the real backend in.
 */
const ENGLISH_BLOG_POSTS: BlogPostItem[] = [
  {
    id: "1",
    category: "AI",
    title: "Getting Started with AI",
    author: "John Doe",
    image: "/images/qq.jpg",
    summary: "An introduction to artificial intelligence.",
    content:
      "Artificial Intelligence (AI) is the simulation of human intelligence in machines. In this post we cover the basics: what AI is, how it differs from traditional software, and where it's already part of your daily life.",
    publishedLabel: "2026/7/20",
    publishedAt: "2026-07-20T08:00:00Z",
  },
  {
    id: "2",
    category: "Workshop",
    title: "Reinforcement Learning in the Real World",
    author: "Amir Rezaei",
    image: "/images/qq.jpg",
    summary:
      "Practical applications of reinforcement learning, from robotics to energy grid optimization.",
    content:
      "Reinforcement learning has moved well beyond game-playing demos. This post walks through real deployments in robotics and energy optimization, along with the open challenges researchers are tackling next.",
    publishedLabel: "2026/6/4",
    publishedAt: "2026-06-04T08:00:00Z",
  },
  {
    id: "3",
    category: "Tutorial",
    title: "How Transformers Actually Work",
    author: "Jabbar Seifi",
    image: "/images/qq.jpg",
    summary:
      "The transformer architecture underlies today's large language models.",
    content:
      "We break down the self-attention mechanism step by step and explain why the transformer architecture became the foundation for nearly every modern large language model.",
    publishedLabel: "2026/5/18",
    publishedAt: "2026-05-18T08:00:00Z",
  },
];

const PERSIAN_BLOG_POSTS: BlogPostItem[] = [
  {
    id: "1",
    category: "هوش مصنوعی",
    title: "شروع کار با هوش مصنوعی",
    author: "جان دو",
    image: "/images/qq.jpg",
    summary: "مقدمه‌ای بر هوش مصنوعی و مفاهیم پایه‌ی آن.",
    content:
      "هوش مصنوعی به شبیه‌سازی توانایی‌های ذهن انسان در ماشین‌ها گفته می‌شود. در این مقاله با تعریف هوش مصنوعی، تفاوت آن با نرم‌افزارهای سنتی و کاربردهای روزمره‌ی آن آشنا می‌شویم.",
    publishedLabel: "۱۴۰۵/۴/۲۹",
    publishedAt: "2026-07-20T08:00:00Z",
  },
  {
    id: "2",
    category: "کارگاه",
    title: "یادگیری تقویتی در دنیای واقعی",
    author: "امیر رضایی",
    image: "/images/qq.jpg",
    summary:
      "کاربردهای عملی یادگیری تقویتی، از رباتیک تا بهینه‌سازی شبکه‌ی انرژی.",
    content:
      "یادگیری تقویتی دیگر فقط به نمونه‌های بازی محدود نیست. در این مقاله استقرارهای واقعی آن در رباتیک و بهینه‌سازی انرژی و همچنین چالش‌های پیش روی پژوهشگران را بررسی می‌کنیم.",
    publishedLabel: "۱۴۰۵/۳/۱۴",
    publishedAt: "2026-06-04T08:00:00Z",
  },
  {
    id: "3",
    category: "آموزشی",
    title: "ترنسفورمرها واقعاً چگونه کار می‌کنند؟",
    author: "جبار صیفی",
    image: "/images/qq.jpg",
    summary: "معماری ترنسفورمر پایه‌ی مدل‌های زبانی بزرگ امروزی است.",
    content:
      "در این مقاله سازوکار توجه به خود را مرحله‌به‌مرحله بررسی می‌کنیم و توضیح می‌دهیم چرا معماری ترنسفورمر به پایه‌ی بسیاری از مدل‌های زبانی مدرن تبدیل شده است.",
    publishedLabel: "۱۴۰۵/۲/۲۸",
    publishedAt: "2026-05-18T08:00:00Z",
  },
];

export function getSampleBlogPosts(locale: string): BlogPostItem[] {
  return locale === "fa" ? PERSIAN_BLOG_POSTS : ENGLISH_BLOG_POSTS;
}

export const SAMPLE_BLOG_POSTS = ENGLISH_BLOG_POSTS;
