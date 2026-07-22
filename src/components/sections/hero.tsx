import { ArrowLeft, Brain, Sparkles, Users2, Activity } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";

const stats = [
  { label: "عضو فعال", value: "+۱۵۰" },
  { label: "رویداد برگزار‌شده", value: "+۳۰۰" },
  { label: "سال فعالیت", value: "+۵" },
];

export function Hero() {
  return (
    <section className="relative overflow-hidden px-4 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pt-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-2 lg:gap-10">
        <Reveal direction="up" className="text-center lg:text-start">
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.25] tracking-tight text-foreground sm:text-5xl lg:text-[3.4rem]">
            آینده را با <span className="text-gradient">هوش مصنوعی</span>
            <br />
            بسازیم
          </h1>

          <p className="mx-auto mt-6 max-w-xl text-base leading-8 text-muted-foreground lg:mx-0">
            بستری برای یادگیری، پژوهش و همکاری دانشجویان علاقه‌مند به هوش
            مصنوعی؛ از کارگاه‌های تخصصی تا رقابت‌های ملی — اینجا رشد می‌کنیم.
          </p>

          <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
            <Button
              asChild
              size="lg"
              className="w-full rounded-full shadow-glow sm:w-auto"
            >
              <Link href="/#events">
                <ArrowLeft className="h-4 w-4" />
                مشاهده رویدادها
              </Link>
            </Button>

            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full rounded-full border-white/10 bg-white/[0.02] sm:w-auto"
            >
              <Link href="/#teams">آشنایی با انجمن</Link>
            </Button>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-4 border-t border-white/[0.06] pt-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-2xl font-extrabold text-foreground sm:text-3xl">
                  {stat.value}
                </p>

                <p className="mt-1 text-xs text-muted-foreground sm:text-sm">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal
          direction="left"
          delay={0.15}
          className="relative mx-auto flex h-[320px] w-[320px] items-center justify-center sm:h-[420px] sm:w-[420px] lg:h-[460px] lg:w-[460px]"
        >
          <div className="absolute inset-0 animate-pulse-glow rounded-full bg-gradient-to-br from-primary-500/40 via-glow-2/20 to-transparent blur-2xl" />
          <div className="absolute inset-6 animate-spin-slow rounded-full border border-dashed border-primary-400/25" />
          <div className="absolute inset-14 rounded-full border border-primary-300/15" />
          <div className="relative flex h-[68%] w-[68%] items-center justify-center overflow-hidden rounded-full">
            <div className="absolute inset-0 opacity-70" />
          </div>

          <div className="surface animate-float absolute -start-2 top-6 flex flex-row items-center gap-2.5 rounded-2xl px-3.5 py-2.5 sm:-start-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-900/60 text-primary-300">
              <Activity className="h-4 w-4" />
            </span>

            <div className="text-right">
              <span className="block text-sm font-bold text-foreground">
                ۴۸ پروژه
              </span>

              <span className="block text-[11px] text-muted-foreground">
                فعال
              </span>
            </div>
          </div>

          <div className="absolute -end-2 bottom-16 flex flex-row items-center gap-2.5 rounded-2xl px-3.5 py-2.5 sm:-end-6">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-900/60 text-primary-300">
              <Users2 className="h-4 w-4" />
            </span>

            <div className="text-right">
              <span className="block text-sm font-bold">۳۲ دانشجو</span>

              <span className="block text-[11px]">این ترم پیوستند</span>
            </div>
          </div>

          <div className="absolute bottom-0 start-8 flex flex-row items-center gap-2.5 rounded-2xl px-3.5 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary-900/60 text-primary-300">
              <Sparkles className="h-4 w-4" />
            </span>

            <div className="text-right">
              <span className="block text-sm font-bold">۱۲ کارگاه</span>

              <span className="block text-[11px]">امسال</span>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}