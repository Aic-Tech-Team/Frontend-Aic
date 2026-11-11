import { SmartImage } from "@/components/common/SmartImage";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { readMinutes } from "@/lib/read-time";
import type { BlogPostItem } from "@/types/blog";

/**
 * The newest article, large, in the same magazine voice as the cards below it: the picture with
 * its reading time, the category tag, a big title, the summary, and the author with a link that
 * underlines itself. The whole thing is one link.
 */
export async function BlogFeatured({ post }: { post: BlogPostItem }) {
  const t = await getTranslations("BlogPage");
  const td = await getTranslations("BlogDetailPage");

  return (
    <Link
      href={`/blog/${post.id}`}
      className="surface group mb-10 grid overflow-hidden rounded-3xl p-3 transition-shadow duration-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:mb-14 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)] lg:gap-10"
    >
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl lg:aspect-auto lg:min-h-[22rem]">
        <SmartImage
          src={post.image || "/images/banner.jpg"}
          alt=""
          fill
          priority
          sizes="(min-width: 1024px) 55vw, 100vw"
          className="object-cover transition-transform duration-[1400ms] ease-out group-hover:scale-105"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/40 via-transparent to-transparent" />
        <span className="absolute inset-e-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1.5 text-xs font-medium text-white ring-1 ring-white/15">
          <Clock className="size-3.5" />
          {td("readTime", { minutes: readMinutes(post.content || post.summary) })}
        </span>
      </div>

      <div className="flex min-w-0 flex-col justify-center gap-5 px-3 pb-3 pt-6 lg:px-0 lg:py-8 lg:pe-8">
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          {post.category ? (
            <span className="rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold text-primary-foreground shadow-glow">
              {post.category}
            </span>
          ) : null}
          {post.publishedLabel ? (
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5 text-primary-300" />
              {post.publishedLabel}
            </span>
          ) : null}
        </div>

        <h2 className="line-clamp-3 text-balance text-xl font-extrabold leading-[1.7] text-foreground transition-colors group-hover:text-primary-300 sm:text-2xl sm:leading-[1.65]">
          {post.title}
        </h2>

        {post.summary ? (
          <p className="line-clamp-4 max-w-[58ch] text-pretty text-sm leading-8 text-muted-foreground sm:text-[15px]">
            {post.summary}
          </p>
        ) : null}

        <div className="mt-1 flex items-center justify-between gap-4 border-t border-border/50 pt-5">
          <div className="flex min-w-0 items-center gap-3">
            <span
              aria-hidden="true"
              className="flex size-10 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-primary-700 text-base font-extrabold text-white"
            >
              {(post.author ?? "؟").trim().charAt(0)}
            </span>
            <span className="min-w-0 truncate text-sm font-semibold text-foreground">
              {post.author ?? "—"}
            </span>
          </div>
          <span className="flex shrink-0 items-center gap-2 text-sm font-bold text-foreground">
            <span className="relative">
              {t("readMore")}
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary-300 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
            </span>
            <ArrowLeft className="size-4 text-primary-300 transition-transform duration-300 ltr:rotate-180 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
