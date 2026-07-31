import Image from "next/image";
import { BookOpen, CalendarDays, Clock } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";
import GlareHover from "@/components/animations/GlareHover";
import { Carousel } from "@/components/common/Carousel";


const postImages = [
  "/images/581949583092327844.jpg",
  "/images/766456430349003443.jpg",
  "/images/All posts • Instagram.jpg",
  "/images/Heewon on Instagram_ “Coffee beans of delight….jpg",
] as const;

export async function BlogSection() {
  const t = await getTranslations("Blog");
  const common = await getTranslations("Common");
  const posts = t.raw("items") as {
    tag: string;
    title: string;
    desc: string;
    author: string;
    date: string;
    readTime: string;
  }[];

  return (
    <section id="blog" className="py-14 sm:py-20">
      <div className="container">
        <SectionHeading
          badge={t("badge")}
          icon={BookOpen}
          title={t("title")}
          description={t("description")}
          moreHref="#blog"
          moreLabel={common("more")}
        />

        <Carousel
          ariaLabel={t("title")}
          slideClassName="flex-[0_0_100%] sm:flex-[0_0_calc((100%-1.25rem)/2)] md:flex-[0_0_calc((100%-2.5rem)/3)]"
        >
          {posts.map((post, index) => (
            <RevealItem
              key={post.title}
              direction="up"
              hoverLift
              delay={index * 0.06}
              className="h-full"
            >
              <GlareHover
                width="100%"
                height="100%"
                background="transparent"
                borderRadius="1.5rem"
                borderColor="transparent"
                glareColor="#ffffff"
                glareOpacity={0.25}
                glareAngle={-30}
                glareSize={300}
                transitionDuration={800}
                playOnce={false}
                className="h-full"
              >
                <article className="surface group flex h-full flex-col overflow-hidden rounded-2xl sm:rounded-3xl">
                  <div className="relative aspect-16/10 w-full overflow-hidden">
                    <Image
                      src={postImages[index] ?? postImages[0]}
                      alt={post.title}
                      fill
                      sizes="(min-width: 768px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <span className="surface absolute end-3 top-3 rounded-full px-2.5 py-1 text-[11px] font-medium text-primary-300 sm:end-4 sm:top-4 sm:px-3 dark:text-white">
                      {post.tag}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4 sm:p-6">
                    <h3 className="text-sm font-bold leading-6 text-foreground transition-colors group-hover:text-primary-300 sm:text-base sm:leading-7">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">
                      {post.desc}
                    </p>
                    <div className="mt-4 flex flex-col gap-2 border-t border-border/50 pt-3 text-xs text-muted-foreground sm:mt-5 sm:flex-row sm:items-center sm:justify-between sm:pt-4">
                      <span className="min-w-0 truncate font-medium text-foreground/70">
                        {post.author}
                      </span>
                      <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 shrink-0" />
                          {post.readTime}
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              </GlareHover>
            </RevealItem>
          ))}
        </Carousel>
      </div>
    </section>
  );
}