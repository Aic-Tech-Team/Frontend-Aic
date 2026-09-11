import type { ActivityItem } from "@/types/activity";

// Dummy data without api

const ACTIVITY_IMAGES = [
  "/images/1088745278696137752.jpg",
  "/images/download - 2026-07-30T233837.402.jpg",
  "/images/Heewon on Instagram_ \u201cShout out to local pizza\u2026.jpg",
  "/images/So cute ___.jpg",
] as const;

const PERSIAN_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    category: "مسابقه",
    title: "مسابقه ساخت تصویر با هوش مصنوعی",
    image: ACTIVITY_IMAGES[0],
    summary:
      "توانایی تخیل خودت را با قدرت مدل‌های مولد تصویر ترکیب کن و خلاقیتت را به نمایش بگذار.",
    content:
      "توانایی تخیل خودت را با قدرت مدل‌های مولد تصویر ترکیب کن و خلاقیتت را به نمایش بگذار. ایده‌ها در این رقابت به تصویر تبدیل می‌شوند و مرز بین هنر و فناوری از بین می‌رود.",
    dateLabel: "۱۷ آبان — ساعت ۱۲:۰۰",
  },
  {
    id: "2",
    category: "جشنواره",
    title: "جشنواره تخصصی هوش مصنوعی",
    image: ACTIVITY_IMAGES[1],
    summary:
      "رویدادی متفاوت برای آشنایی عمیق‌تر با دنیای الگوریتم‌ها، داده و خلاقیت دیجیتال.",
    content:
      "رویدادی متفاوت برای آشنایی عمیق‌تر با دنیای الگوریتم‌ها، داده و خلاقیت دیجیتال. اینجا یادگیری، تجربه و رقابت در کنار هم معنا پیدا می‌کنند تا ذهنی هوشمندتر بسازیم.",
    dateLabel: "۱۷ آبان — ساعت ۱۲:۰۰",
  },
  {
    id: "3",
    category: "همایش",
    title: "همایش بزرگ هوش مصنوعی",
    image: ACTIVITY_IMAGES[2],
    summary:
      "اولین قدم در دنیای هوشمند را با ما بردار. در این همایش با مفاهیم پایه آشنا می‌شوی.",
    content:
      "اولین قدم در دنیای هوشمند را با ما بردار. در این همایش، با مفاهیم پایه، مسیر پیشرفت و آینده‌ی درخشان هوش مصنوعی آشنا می‌شوی و مسیر یادگیری خودت را آغاز می‌کنی.",
    dateLabel: "۱۷ آبان — ساعت ۱۲:۰۰",
  },
  {
    id: "4",
    category: "همایش",
    title: "همایش سفر تجربه‌ها",
    image: ACTIVITY_IMAGES[3],
    summary:
      "جایی برای شنیدن مسیر رشد، چالش‌ها و موفقیت‌های فعالان حوزه فناوری و هوش مصنوعی.",
    content:
      "جایی برای شنیدن مسیر رشد، چالش‌ها و موفقیت‌های فعالان حوزه فناوری و هوش مصنوعی. همراه ما شو تا از تجربه‌های واقعی الهام بگیری و مسیر پیشرفتت را هوشمندانه‌تر بسازی.",
    dateLabel: "۱۷ آبان — ساعت ۱۲:۰۰",
  },
];

const ENGLISH_ACTIVITIES: ActivityItem[] = [
  {
    id: "1",
    category: "Contest",
    title: "AI image generation contest",
    image: ACTIVITY_IMAGES[0],
    summary:
      "Combine imagination with generative image models and showcase your creativity.",
    content:
      "Combine imagination with generative image models and showcase your creativity. Ideas become images as art and technology meet.",
    dateLabel: "Nov 8 — 12:00",
  },
  {
    id: "2",
    category: "Festival",
    title: "Specialized AI festival",
    image: ACTIVITY_IMAGES[1],
    summary:
      "A different event to go deeper into algorithms, data, and digital creativity.",
    content:
      "A different event to go deeper into algorithms, data, and digital creativity — learning, experience, and competition together.",
    dateLabel: "Nov 8 — 12:00",
  },
  {
    id: "3",
    category: "Summit",
    title: "Grand AI summit",
    image: ACTIVITY_IMAGES[2],
    summary: "Take your first step into the smart world.",
    content:
      "Take your first step into the smart world. Learn foundations, growth paths, and the bright future of AI.",
    dateLabel: "Nov 8 — 12:00",
  },
  {
    id: "4",
    category: "Summit",
    title: "Journey of experiences summit",
    image: ACTIVITY_IMAGES[3],
    summary:
      "Hear growth paths, challenges, and successes from tech and AI practitioners.",
    content:
      "Hear growth paths, challenges, and successes from tech and AI practitioners — and build your path smarter.",
    dateLabel: "Nov 8 — 12:00",
  },
];

export function getSampleActivities(locale: string): ActivityItem[] {
  return locale === "fa" ? PERSIAN_ACTIVITIES : ENGLISH_ACTIVITIES;
}