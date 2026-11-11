import { getLocale, getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Carousel } from "@/components/common/Carousel";
import { BlogCard } from "@/components/cards/BlogCard";
import { getLandingBlogPosts } from "@/services/api/landing";
import { ContentUnavailable } from "@/components/common/ContentUnavailable";

function readMinutes(text: string): number {
  const chars = text.trim().length;
  return chars ? Math.max(1, Math.round(chars / 900)) : 1;
}

export async function BlogSection() {
  const t = await getTranslations("Blog");
  const tPage = await getTranslations("BlogPage");
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
            <RevealItem key={post.id} direction="up" delay={index * 0.06} className="h-full">
              <BlogCard
                post={post}
                ctaLabel={tPage("readMore")}
                readTimeLabel={tDetail("readTime", { minutes: readMinutes(post.content || post.summary) })}
              />
            </RevealItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}
