import Image from "next/image";
import { ArrowLeft, CalendarDays, Clock } from "lucide-react";
import { getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { getLandingBlogPosts } from "@/services/api/landing";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";

function readMinutes(text: string): number {
  const chars = text.trim().length;
  return chars ? Math.max(1, Math.round(chars / 900)) : 1;
}

export async function BlogSection() {
  const t = await getTranslations("Blog");
  const tDetail = await getTranslations("BlogDetailPage");
  const common = await getTranslations("Common");
  const posts = await getLandingBlogPosts(await getLocale());

  const heading = (
    <SectionHeading
      badge={t("badge")}
      title={t("title")}
      description={t("description")}
      moreHref="/blog"
      moreLabel={common("more")}
    />
  );

  if (posts === null) {
    return (
      <section id="blog" className="py-12 sm:py-20">
        <div className="container">
          {heading}
          <ContentUnavailable className="mt-8" />
        </div>
      </section>
    );
  }

  if (posts.length === 0) return null;

  return (
    <section id="blog" className="py-12 sm:py-20">
      <div className="container">
        {heading}

        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] lg:flex-[0_0_calc((100%-2.5rem)/3)]"
        >
          {posts.map((post, index) => (
            <RevealItem
              key={post.id}
              direction="up"
              delay={index * 0.06}
              className="h-full"
            >
              <Link
                href={`/blog/${post.id}`}
                className="surface group flex h-full flex-col overflow-hidden rounded-3xl p-2.5 transition-shadow duration-500 hover:shadow-[0_16px_36px_-22px_color-mix(in_srgb,var(--primary)_60%,transparent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <article className="flex h-full flex-col">
                  <div className="relative aspect-16/10 w-full overflow-hidden rounded-2xl">
                    <Image
                      src={post.image || "/images/qq.jpg"}
                      alt=""
                      fill
                      unoptimized
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 88vw"
                      className="object-cover transition-transform duration-1000 ease-out group-hover:scale-105"
                    />
                    {post.category ? (
                      <span className="absolute inset-s-3 top-3 rounded-full bg-black/45 px-3 py-1 text-[11px] font-medium text-white backdrop-blur-md">
                        {post.category}
                      </span>
                    ) : null}
                  </div>

                  <div className="flex flex-1 flex-col px-3 pb-3 pt-5 sm:px-4">
                    <h3 className="line-clamp-2 text-lg font-extrabold leading-8 text-foreground transition-colors group-hover:text-primary-300">
                      {post.title}
                    </h3>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-7 text-muted-foreground">
                      {post.summary}
                    </p>

                    <div className="mt-5 flex items-center justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-2.5">
                        <span
                          aria-hidden="true"
                          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/15 text-xs font-bold text-primary-300"
                        >
                          {(post.author ?? "؟").trim().charAt(0)}
                        </span>
                        <div className="min-w-0 text-xs">
                          <span className="block truncate font-medium text-foreground">
                            {post.author ?? "—"}
                          </span>
                          <span className="flex items-center gap-2 text-muted-foreground">
                            {post.publishedLabel ? (
                              <span className="flex items-center gap-1">
                                <CalendarDays className="h-3 w-3" />
                                {post.publishedLabel}
                              </span>
                            ) : null}
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {tDetail("readTime", {
                                minutes: readMinutes(
                                  post.content || post.summary,
                                ),
                              })}
                            </span>
                          </span>
                        </div>
                      </div>
                      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-300 transition-all duration-300 group-hover:bg-primary group-hover:text-primary-foreground">
                        <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
                      </span>
                    </div>
                  </div>
                </article>
              </Link>
            </RevealItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
