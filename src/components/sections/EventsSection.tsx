import { CalendarDays, User, ArrowLeft, Ticket } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const events = [
  {
    title: "هنر در هوش مصنوعی",
    instructor: "جبار صیفی",
    date: "۱۷ آبان — ساعت ۱۲:۰۰",
    seats: "۱۲ نفر ظرفیت باقی‌مانده",
    desc: "کارگاهی درباره تولید متن و تصویر ساختگی با ابزارهای مولد، و کاربرد آن در طراحی گرافیک، چاپ و رسانه‌های دیجیتال.",
    gradient: "from-zinc-800 via-pink-900 to-black",
  },
  {
    title: "کارگاه بینایی ماشین",
    instructor: "سارا محمدی",
    date: "۲۲ آبان — ساعت ۱۶:۰۰",
    seats: "۸ نفر ظرفیت باقی‌مانده",
    desc: "آشنایی عملی با شبکه‌های عصبی کانولوشنی و پیاده‌سازی یک مدل تشخیص تصویر از صفر تا استقرار.",
    gradient: "from-green-300 via-slate-400 to-slate-600",
  },
  {
    title: "رباتیک و یادگیری تقویتی",
    instructor: "امیر رضایی",
    date: "۲۹ آبان — ساعت ۱۰:۰۰",
    seats: "۵ نفر ظرفیت باقی‌مانده",
    desc: "بررسی معماری‌های کنترل هوشمند ربات و تمرین عملی آموزش یک عامل با یادگیری تقویتی.",
    gradient: "from-red-200 via-yellow-300 to-brown-300",
  },
];

export function EventsSection() {
  return (
    <section id="events" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge="رویدادها"
          icon={Ticket}
          title="رویدادها و کارگاه‌های پیش رو"
          description="کارگاه‌ها و رویدادهای تخصصی برای یادگیری عملی و شبکه‌سازی با فعالان حوزه."
          moreHref="#events"
        />

        <RevealGroup className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => (
            <RevealItem key={event.title} direction="up">
              <div className="group h-80 [perspective:1400px]">
                <div className="relative h-full w-full rounded-3xl transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                  <div
                    className={`absolute inset-0 flex flex-col justify-end overflow-hidden rounded-3xl bg-linear-to-br p-6 [backface-visibility:hidden] ${event.gradient}`}
                  >
                    <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent" />
                    <div
                      className="absolute inset-0 opacity-25"
                      style={{
                        backgroundSize: "18px 18px",
                      }}
                    />
                    <h3 className="relative text-lg font-bold text-white">
                      {event.title}
                    </h3>
                    <p className="relative mt-1 text-sm text-white/70">
                      {event.date}
                    </p>
                  </div>

                  <div className="surface absolute inset-0 flex flex-col justify-between rounded-3xl p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div>
                      <h3 className="text-lg font-bold text-foreground">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {event.desc}
                      </p>
                    </div>
                    <div className="space-y-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 text-primary-300" />
                        نام استاد: {event.instructor}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 text-primary-300" />
                        {event.date}
                      </p>
                      <p className="flex cursor-pointer items-center gap-2 font-medium text-primary-300">
                        {event.seats}
                        <ArrowLeft className="h-3.5 w-3.5" />
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
