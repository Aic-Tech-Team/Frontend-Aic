import { BookMarked, BookOpen, Microscope, Trophy } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const items = [
  {
    title: "مسابقات",
    desc: "برگزاری چالش‌های تخصصی هوش مصنوعی و مسابقات علمی بین‌دانشگاهی برای کشف استعدادها.",
    icon: Trophy,
    tone: "text-amber-400 bg-amber-500/10",
  },
  {
    title: "کنفرانس‌ها",
    desc: "برگزاری همایش‌های علمی با حضور اساتید، محققان برجسته و متخصصان صنعت هوش مصنوعی.",
    icon: BookMarked,
    tone: "text-fuchsia-400 bg-fuchsia-500/10",
  },
  {
    title: "کارگاه‌های آموزشی",
    desc: "دوره‌های تخصصی یادگیری ماشین، پردازش زبان طبیعی، بینایی ماشین، و یادگیری عمیق.",
    icon: BookOpen,
    tone: "text-violet-400 bg-violet-500/10",
  },
  {
    title: "بازدیدهای علمی",
    desc: "بازدید از مراکز تحقیقاتی پیشرو، شرکت‌های فناوری، و آزمایشگاه‌های پیشرفته هوش مصنوعی کشور.",
    icon: Microscope,
    tone: "text-sky-400 bg-sky-500/10",
  },
];

export function WhatYouExperienceSection() {
  return (
    <section id="experience" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge="حوزه‌های اصلی"
          icon={Trophy}
          title="آنچه در انجمن تجربه می‌کنید"
          description="از بازدیدهای علمی تا مسابقات بین‌المللی، فعالیت‌های متنوعی را برای رشد علمی شما فراهم کرده‌ایم."
          align="center"
        />

        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item) => (
            <RevealItem key={item.title} direction="up" hoverLift>
              <div className="surface flex h-full flex-col items-center rounded-3xl p-6 text-center">
                <span
                  className={`flex h-12 w-12 items-center justify-center rounded-2xl ${item.tone}`}
                >
                  <item.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-5 text-base font-bold text-foreground">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">
                  {item.desc}
                </p>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}