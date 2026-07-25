import { BookOpen, CalendarDays, Clock } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import GlareHover from "../GlareHover";

const posts = [
  {
    tag: "راهنما",
    title: "راهنمای ورود به هوش مصنوعی برای دانشجویان",
    desc: "از کجا شروع کنیم؟ منابع، مسیر یادگیری، و توصیه‌های کاربردی برای دانشجویانی که می‌خواهند وارد این دنیا شوند.",
    author: "سارا محمدی",
    date: "۵ خرداد ۱۴۰۴",
    readTime: "۶ دقیقه",
    tone: "from-orange-400/25 to-rose-400/10",
  },
  {
    tag: "پژوهشی",
    title: "یادگیری تقویتی در دنیای واقعی",
    desc: "کاربردهای عملی یادگیری تقویتی از رباتیک تا بهینه‌سازی شبکه‌های انرژی؛ مروری بر پیشرفت‌های اخیر و چالش‌های پیش رو.",
    author: "امیر رضایی",
    date: "۱۵ خرداد ۱۴۰۴",
    readTime: "۱۲ دقیقه",
    tone: "from-pink-400/25 to-indigo-400/10",
  },
  {
    tag: "آموزشی",
    title: "ترانسفورمرها چگونه کار می‌کنند؟",
    desc: "معماری ترانسفورمر بنیان مدل‌های زبانی بزرگ است. در این مقاله به مکانیزم Self-Attention و دلیل موفقیت این معماری می‌پردازیم.",
    author: "جبار صیفی",
    date: "۲۸ خرداد ۱۴۰۴",
    readTime: "۸ دقیقه",
    tone: "from-yellow-400/25 to-primary-500/10",
  },
];

export function BlogSection() {
  return (
    <section id="blog" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge="وبلاگ"
          icon={BookOpen}
          title="مقالات و نوشته‌های علمی"
          description="آخرین مطالب آموزشی و پژوهشی اعضای انجمن را بخوانید."
          moreHref="#blog"
        />

        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <RevealItem key={post.title} direction="up" hoverLift className="h-full">
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
                <article className="surface group flex h-full flex-col overflow-hidden rounded-3xl">
                  <div
                    className={`relative aspect-16/10 w-full overflow-hidden bg-linear-to-br ${post.tone}`}
                  >
                    <div
                      className="absolute inset-0 opacity-40 transition-transform duration-700 group-hover:scale-110"
                      style={{
                        backgroundSize: "16px 16px",
                      }}
                    />
                    <span className="surface absolute end-4 top-4 rounded-full px-3 py-1 text-[11px] font-medium text-primary-300">
                      {post.tag}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-6">
                    <h3 className="text-base font-bold leading-7 text-foreground transition-colors group-hover:text-primary-300">
                      {post.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-7 text-muted-foreground">
                      {post.desc}
                    </p>
                    <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4 text-xs text-muted-foreground">
                      <span>{post.author}</span>
                      <span className="flex items-center gap-3">
                        <span className="flex items-center gap-1">
                          <CalendarDays className="h-3.5 w-3.5" />
                          {post.date}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {post.readTime}
                        </span>
                      </span>
                    </div>
                  </div>
                </article>
              </GlareHover>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
