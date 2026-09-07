"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import { CalendarDays, User, BookOpen } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { BlogPostItem } from "@/types/blog";

function BarcodePattern() {
  return (
    <div
      className="flex items-center gap-[2px] opacity-40 hover:opacity-80 transition-opacity"
      aria-hidden
    >
      <div className="h-6 w-0.5 bg-foreground" />
      <div className="h-6 w-px bg-foreground" />
      <div className="h-6 w-0.75 bg-foreground" />
      <div className="h-6 w-1 bg-foreground" />
      <div className="h-6 w-2 bg-foreground" />
      <div className="h-6 w-4 bg-foreground" />
      <div className="h-6 w-1 bg-foreground" />
      <div className="h-6 w-2 bg-foreground" />
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
    <article
      className="real-ticket-mask group relative flex h-full flex-col overflow-hidden bg-card text-card-foreground shadow-lg transition-all duration-300 hover:shadow-2xl md:flex-row"
      style={{ animationDelay: `${index * 40}ms` }}
    >
      <div className="relative aspect-[4/3] w-full shrink-0 overflow-hidden md:h-auto md:w-56 md:aspect-square">
        <Image
          src={post.image}
          alt={post.title}
          fill
          sizes="(min-width: 768px) 224px, 100vw"
          unoptimized
          onError={(e) => {
            const target = e.currentTarget as HTMLImageElement;
            if (!target.src.endsWith("/images/qq.jpg")) {
              target.src = "/images/qq.jpg";
            }
          }}
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

        <span className="absolute inset-s-3 top-3 rounded-full border border-white/20 bg-black/40 px-2.5 py-0.5 text-[10px] font-semibold text-white backdrop-blur-md">
          {post.category}
        </span>

        <div className="absolute bottom-3 inset-s-3 rounded-lg border border-white/20 bg-black/50 px-2.5 py-1 backdrop-blur-md">
          <p className="text-[10px] font-bold uppercase tracking-wider text-white">
            {post.publishedLabel}
          </p>
        </div>
      </div>

      <div className="relative flex shrink-0 items-center justify-center md:w-6 md:justify-start">
        <div className="relative h-px w-full md:hidden">
          <span
            className="absolute inset-x-4 top-1/2 h-px -translate-y-1/2 bg-repeat-x"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in srgb, var(--border) 90%, transparent) 1.4px, transparent 1.4px)",
              backgroundSize: "9px 3px",
            }}
          />
        </div>
        <div className="relative hidden h-full w-px md:block">
          <span className="absolute start-[-14px] top-[-14px] h-[28px] w-[28px] rounded-full border border-border/80 bg-transparent" />
          <span className="absolute start-[-14px] bottom-[-14px] h-[28px] w-[28px] rounded-full border border-border/80 bg-transparent" />
          <span
            className="absolute inset-y-4 start-1/2 w-px -translate-x-1/2 bg-repeat-y"
            style={{
              backgroundImage:
                "radial-gradient(circle, color-mix(in srgb, var(--border) 90%, transparent) 1.4px, transparent 1.4px)",
              backgroundSize: "3px 9px",
            }}
          />
        </div>
      </div>

      <div className="flex min-w-0 flex-1 flex-col justify-between p-5">
        <div>
          <h3 className="line-clamp-2 wrap-break-word text-base font-bold leading-snug text-foreground sm:text-lg">
            {post.title}
          </h3>

          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary" />
              <span className="font-medium text-foreground/90">
                {post.publishedLabel}
              </span>
            </span>
            {post.author ? (
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5 shrink-0 text-primary" />
                {post.author}
              </span>
            ) : null}
          </div>

          <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {post.summary}
          </p>
        </div>

        <div className="mt-5 flex items-center justify-between gap-3 border-t border-dashed border-border/60 pt-3">
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
  );
}