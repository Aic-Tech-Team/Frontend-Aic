import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";
import type { BlogPostItem } from "@/types/blog";

/**
 * Article as a magazine card: the picture with its reading time, the category tag hanging over
 * the picture's edge, a generous title, and a footer with the author and an underlining link.
 */
export function BlogCard({
  post,
  ctaLabel,
  readTimeLabel,
  className,
}: {
  post: BlogPostItem;
  ctaLabel: string;
  readTimeLabel: string;
  className?: string;
}) {
  return (
    <Link
      href={`/blog/${post.id}`}
      className={cn(
        "surface card-lift group flex h-full flex-col overflow-hidden rounded-3xl p-2.5 transition-shadow duration-500 hover:shadow-[0_18px_40px_-24px_color-mix(in_srgb,var(--primary)_60%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className,
      )}
    >
      <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl">
        <Image
          src={post.image || "/images/banner.jpg"}
          alt=""
          fill
          unoptimized
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
          className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
        />
        <span aria-hidden="true" className="absolute inset-0 bg-linear-to-t from-black/45 via-transparent to-transparent" />
        <span className="absolute inset-e-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[11px] font-medium text-white ring-1 ring-white/15">
          <Clock className="size-3" />
          {readTimeLabel}
        </span>
      </div>

      <div className="relative flex flex-1 flex-col px-3 pb-3 sm:px-4">
        {post.category ? (
          <span className="relative z-10 -mt-3.5 self-start rounded-full bg-primary px-3.5 py-1 text-[11px] font-bold text-primary-foreground shadow-glow transition-transform duration-500 group-hover:-translate-y-1">
            {post.category}
          </span>
        ) : (
          <span className="h-3" />
        )}
        <h3 className="mt-3.5 line-clamp-2 text-lg font-extrabold leading-8 text-foreground transition-colors group-hover:text-primary-300">
          {post.title}
        </h3>
        <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-muted-foreground">{post.summary}</p>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-border/50 pt-4">
          <div className="flex min-w-0 items-center gap-2.5">
            <span
              aria-hidden="true"
              className="flex size-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-primary-400 to-primary-700 text-sm font-extrabold text-white ring-0 ring-primary-300/50 transition-[box-shadow,transform] duration-500 group-hover:scale-110 group-hover:ring-4"
            >
              {(post.author ?? "؟").trim().charAt(0)}
            </span>
            <div className="min-w-0 text-xs leading-5">
              <span className="block truncate font-semibold text-foreground">{post.author ?? "—"}</span>
              {post.publishedLabel ? (
                <span className="flex items-center gap-1 text-muted-foreground">
                  <CalendarDays className="size-3" />
                  {post.publishedLabel}
                </span>
              ) : null}
            </div>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-sm font-bold text-foreground">
            <span className="relative">
              {ctaLabel}
              <span aria-hidden="true" className="absolute inset-x-0 -bottom-0.5 h-px origin-left scale-x-0 bg-primary-300 transition-transform duration-500 group-hover:scale-x-100 rtl:origin-right" />
            </span>
            <ArrowLeft className="size-4 text-primary-300 transition-transform duration-300 ltr:rotate-180 rtl:group-hover:-translate-x-1 ltr:group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </Link>
  );
}
