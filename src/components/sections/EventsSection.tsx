import Image from "next/image";
import { CalendarDays, User, ArrowLeft, Ticket } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import ElectricBorder from "../ElectricBorder";

const events = [
  {
    title: "هنر در هوش مصنوعی",
    instructor: "جبار صیفی",
    date: "۱۷ آبان — ساعت ۱۲:۰۰",
    seats: "۱۲ نفر ظرفیت باقی‌مانده",
    desc: "کارگاهی درباره تولید متن و تصویر ساختگی با ابزارهای مولد، و کاربرد آن در طراحی گرافیک، چاپ و رسانه‌های دیجیتال.",
    image: "/kumaicecream on tumblr and twitter.jpg",
  },
  {
    title: "کارگاه بینایی ماشین",
    instructor: "سارا محمدی",
    date: "۲۲ آبان — ساعت ۱۶:۰۰",
    seats: "۸ نفر ظرفیت باقی‌مانده",
    desc: "آشنایی عملی با شبکه‌های عصبی کانولوشنی و پیاده‌سازی یک مدل تشخیص تصویر از صفر تا استقرار.",
    image: "/Jason B (1).jpg",
  },
  {
    title: "رباتیک و یادگیری تقویتی",
    instructor: "امیر رضایی",
    date: "۲۹ آبان — ساعت ۱۰:۰۰",
    seats: "۵ نفر ظرفیت باقی‌مانده",
    desc: "بررسی معماری‌های کنترل هوشمند ربات و تمرین عملی آموزش یک عامل با یادگیری تقویتی.",
    image: "/Boho Chic Fashion Inspo.jpg",
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
              {/* Outer: perspective container */}
              <div className="group h-80 w-full [perspective:1400px]">
                {/* This div rotates — ElectricBorder + both faces all spin together */}
                <div className="relative h-full w-full transition-transform duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">

                  {/* ElectricBorder — front face */}
                  <div className="pointer-events-none absolute inset-0 z-10 [backface-visibility:hidden]">
                    <ElectricBorder
                      color="#7b2cc8"
                      speed={0.9}
                      chaos={0.01}
                      style={{ borderRadius: 24 }}
                      className="h-full w-full"
                    />
                  </div>

                  {/* ElectricBorder — back face */}
                  <div className="pointer-events-none absolute inset-0 z-10 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <ElectricBorder
                      color="#7b2cc8"
                      speed={0.9}
                      chaos={0.01}
                      style={{ borderRadius: 24 }}
                      className="h-full w-full"
                    />
                  </div>

                  {/* FRONT — image + title/date */}
                  <div className="absolute inset-0 flex flex-col justify-end overflow-hidden rounded-3xl [backface-visibility:hidden]">
                    <Image
                      src={event.image}
                      alt={event.title}
                      fill
                      sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    <div className="relative p-6">
                      <h3 className="text-lg font-bold leading-snug text-white">
                        {event.title}
                      </h3>
                      <p className="mt-1 text-sm text-white/70">
                        {event.date}
                      </p>
                    </div>
                  </div>

                  {/* BACK — details */}
                  <div className="surface absolute inset-0 flex flex-col justify-between rounded-3xl p-6 [backface-visibility:hidden] [transform:rotateY(180deg)]">
                    <div>
                      <h3 className="text-lg font-bold leading-snug text-foreground">
                        {event.title}
                      </h3>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {event.desc}
                      </p>
                    </div>
                    <div className="space-y-2 border-t border-border/50 pt-4 text-xs text-muted-foreground">
                      <p className="flex items-center gap-2">
                        <User className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                        نام استاد: {event.instructor}
                      </p>
                      <p className="flex items-center gap-2">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0 text-primary-300" />
                        {event.date}
                      </p>
                      <p className="flex cursor-pointer items-center gap-2 font-medium text-primary-300">
                        {event.seats}
                        <ArrowLeft className="h-3.5 w-3.5 shrink-0" />
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