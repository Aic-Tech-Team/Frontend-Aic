import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ArrowRight, CalendarDays, User, Tag } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { getSampleBlogPosts } from "@/types/BlogSamplePost";

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const td = await getTranslations("BlogDetailPage");

  const post = getSampleBlogPosts(locale).find((p) => p.id === id);
  if (!post) {
    notFound();
  }

  return (
    <div className="py-10 sm:py-16">
      <div className="container max-w-3xl">
        <Link
          href="/blog"
          className="surface inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium text-foreground transition-colors hover:text-primary-300"
        >
          <ArrowRight className="h-4 w-4 ltr:rotate-180" />
          {td("backToBlog")}
        </Link>

        <article className="real-ticket-mask mt-6 overflow-hidden bg-card text-card-foreground shadow-lg">
          <div className="relative aspect-[16/9] w-full overflow-hidden">
            <Image
              src={post.image}
              alt={post.title}
              fill
              sizes="(min-width: 768px) 768px, 100vw"
              unoptimized
              priority
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <span className="absolute inset-s-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-semibold text-white backdrop-blur-md">
              {post.category}
            </span>
          </div>

          <div className="p-6 sm:p-8">
            <h1 className="text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
              {post.title}
            </h1>

            <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-dashed border-border/60 pb-5 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="h-4 w-4 shrink-0 text-primary" />
                {post.publishedLabel}
              </span>
              {post.author ? (
                <span className="flex items-center gap-1.5">
                  <User className="h-4 w-4 shrink-0 text-primary" />
                  {post.author}
                </span>
              ) : null}
              <span className="flex items-center gap-1.5">
                <Tag className="h-4 w-4 shrink-0 text-primary" />
                {post.category}
              </span>
            </div>

            <div className="prose prose-sm sm:prose-base mt-6 max-w-none whitespace-pre-line leading-relaxed text-foreground/90">
              {post.content || post.summary}
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}
