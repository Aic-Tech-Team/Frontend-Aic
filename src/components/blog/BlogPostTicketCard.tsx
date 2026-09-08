"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CalendarDays, User, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import type { BlogPostItem } from "@/types/blog";

function BarcodePattern() {
  return (
    <div
      className="flex items-center gap-[2px]"
      aria-hidden
    >
      <div className="h-6 w-0.5 bg-black" />
      <div className="h-6 w-px bg-black" />
      <div className="h-6 w-0.75 bg-black" />
      <div className="h-6 w-1 bg-black" />
      <div className="h-6 w-2 bg-black" />
      <div className="h-6 w-4 bg-black" />
      <div className="h-6 w-1 bg-black" />
      <div className="h-6 w-2 bg-black" />
    </div>
  );
}

export function BlogPostTicketCard({
  post,
  index = 0,
}: {
  post: BlogPostItem;
  index?: number;
}) {
  const t = useTranslations("BlogPage");

  return (
    <div className="relative h-full">
      <article
        className="real-ticket-mask real-ticket-mask--vertical relative flex h-full flex-col overflow-hidden border border-border/60 bg-card text-card-foreground shadow-lg"
        style={{ animationDelay: `${index * 40}ms` }}
      >
        <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
          <Image
            src={post.image}
            alt={post.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            unoptimized
            onError={(e) => {
              const target = e.currentTarget as HTMLImageElement;
              if (!target.src.endsWith("/images/qq.jpg")) {
                target.src = "/images/qq.jpg";
              }
            }}
            className="object-cover"
          />
        </div>

        <div className="relative flex shrink-0 items-center justify-center">
          <div className="relative h-px w-full">
            <span
              className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-repeat-x"
              style={{
                backgroundImage:
                  "radial-gradient(circle, color-mix(in srgb, var(--border) 90%, transparent) 1.4px, transparent 1.4px)",
                backgroundSize: "9px 3px",
              }}
            />
          </div>
        </div>

        <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
          <div>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
                <span className="truncate font-medium text-foreground/90">
                  {post.publishedLabel}
                </span>
              </span>
              <span className="shrink-0 rounded-full border border-purple-500/30 bg-purple-500/10 px-2.5 py-0.5 text-[10px] font-semibold text-purple-700 dark:text-purple-300">
                {post.category}
              </span>
            </div>
            <h3 className="line-clamp-2 wrap-break-word text-sm font-bold leading-snug text-foreground sm:text-base">
              {post.title}
            </h3>

            {post.author ? (
              <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                  {post.author}
                </span>
              </div>
            ) : null}

            <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
              {post.summary}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-border/60 pt-3">
            <BarcodePattern />

            <Button
              asChild
              size="sm"
              className="rounded-xl text-xs gap-1.5 shadow-md hover:shadow-lg transition-all"
            >
              <Link href={`/blog/${post.id}`}>
                <BookOpen className="h-3.5 w-3.5" />
                {t("readMore")}
              </Link>
            </Button>
          </div>
        </div>
      </article>
    </div>
  );
}
