import { CalendarClock, ChevronLeft, LayoutGrid } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import AutoBorderGlow from "../AutoBorderGlow";

const activities = [
  {
    title: "مسابقه ساخت تصویر با هوش مصنوعی",
    desc: "توانایی تخیل خودت را با قدرت مدل‌های مولد تصویر ترکیب کن و خلاقیتت را به نمایش بگذار. ایده‌ها در این رقابت به تصویر تبدیل می‌شوند و مرز بین هنر و فناوری از بین می‌رود.",
    date: "۱۷ آبان — ساعت ۱۲:۰۰",
    icon: LayoutGrid,
    tone: "from-fuchsia-500/25 to-yellow-500/30",
  },
  {
    title: "جشنواره تخصصی هوش مصنوعی",
    desc: "رویدادی متفاوت برای آشنایی عمیق‌تر با دنیای الگوریتم‌ها، داده و خلاقیت دیجیتال. اینجا یادگیری، تجربه و رقابت در کنار هم معنا پیدا می‌کنند تا ذهنی هوشمندتر بسازیم.",
    date: "۱۷ آبان — ساعت ۱۲:۰۰",
    icon: CalendarClock,
    tone: "from-pink-500/25 to-sky-400/40",
  },
  {
    title: "همایش بزرگ هوش مصنوعی",
    desc: "اولین قدم در دنیای هوشمند را با ما بردار. در این همایش، با مفاهیم پایه، مسیر پیشرفت و آینده‌ی درخشان هوش مصنوعی آشنا می‌شوی و مسیر یادگیری خودت را آغاز می‌کنی.",
    date: "۱۷ آبان — ساعت ۱۲:۰۰",
    icon: LayoutGrid,
    tone: "from-emerald-400/20 to-primary-500/80",
  },
  {
    title: "همایش سفر تجربه‌ها",
    desc: "جایی برای شنیدن مسیر رشد، چالش‌ها و موفقیت‌های فعالان حوزه فناوری و هوش مصنوعی. همراه ما شو تا از تجربه‌های واقعی الهام بگیری و مسیر پیشرفتت را هوشمندانه‌تر بسازی.",
    date: "۱۷ آبان — ساعت ۱۲:۰۰",
    icon: CalendarClock,
    tone: "from-amber-400/20 to-primary-500/60",
  },
];

export function ActivitiesSection() {
  return (
    <section id="activities" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge="فعالیت‌ها"
          icon={CalendarClock}
          title="فعالیت‌ها و برنامه‌های انجمن"
          description="مسابقات، جشنواره‌ها و برنامه‌هایی برای تجربه، یادگیری و رشد در کنار هم."
          moreHref="#activities"
        />

        <RevealGroup className="grid gap-6 sm:grid-cols-2">
          {activities.map((item) => (
            <RevealItem key={item.title} direction="up" hoverLift className="h-full">
              <AutoBorderGlow
                className="h-full w-full"
                borderRadius={24}
                glowColor="270 90 75"
                colors={["#c084fc", "#f472b6", "#38bdf8"]}
                glowRadius={24}
                glowIntensity={0.9}
                coneSpread={25}
                speed={6}
              >
                <div className="surface group flex h-full gap-3 overflow-hidden rounded-3xl p-5 sm:p-6">
                  <div
                    className={`relative hidden w-28 shrink-0 overflow-hidden rounded-2xl bg-linear-to-br sm:block ${item.tone}`}
                  >
                    <item.icon className="absolute bottom-3 start-3 h-7 w-7 text-primary-200/80" />
                  </div>

                  <div className="flex flex-1 flex-col">
                    <h3 className="text-base font-bold text-foreground sm:text-lg">
                      {item.title}
                    </h3>
                    <p className="mt-2 flex-1 text-sm text-muted-foreground">
                      {item.desc}
                    </p>
                    <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                      <span className="text-xs text-muted-foreground">
                        {item.date}
                      </span>
                      <span className="flex h-8 w-8 items-center justify-center rounded-full border border-border/60 text-primary-300 transition-all duration-300 group-hover:-translate-x-1 group-hover:bg-primary/10">
                        <ChevronLeft className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                </div>
              </AutoBorderGlow>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
