import {
  Globe2,
  Code2,
  Megaphone,
  CalendarRange,
  GraduationCap,
  Users2,
  Layers,
} from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";

const teams = [
  {
    icon: Globe2,
    title: "روابط عمومی",
    desc: "ارتباط با دانشگاه‌ها، شرکت‌ها و نهادهای علمی برای توسعه‌ی همکاری‌های انجمن.",
    members: 4,
  },
  {
    icon: Code2,
    title: "تیم فنی",
    desc: "توسعه‌ی پروژه‌های نرم‌افزاری، پشتیبانی فنی رویدادها و مدیریت زیرساخت دیجیتال.",
    members: 5,
  },
  {
    icon: Megaphone,
    title: "تیم رسانه",
    desc: "تولید محتوای آموزشی، مدیریت شبکه‌های اجتماعی و انتشار اخبار فعالیت‌های انجمن.",
    members: 7,
  },
  {
    icon: CalendarRange,
    title: "تیم رویدادها",
    desc: "برنامه‌ریزی و اجرای کنفرانس‌ها، بازدیدهای علمی و مسابقات تخصصی دانشجویی.",
    members: 6,
  },
  {
    icon: GraduationCap,
    title: "تیم آموزش",
    desc: "برگزاری کارگاه‌ها، دوره‌های آموزشی و جلسات مطالعاتی برای ارتقای سطح علمی اعضا.",
    members: 8,
  },
];

export function TeamsSection() {
  return (
    <section id="teams" className="px-4 py-20 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <SectionHeading
          badge="ساختار انجمن"
          icon={Layers}
          title="تیم‌های تخصصی انجمن"
          description="هر تیم با تخصص و انگیزه‌ی بالا در جهت پیشرفت علمی و توسعه‌ی فعالیت‌های انجمن تلاش می‌کند."
          align="center"
        />

        <RevealGroup className="grid gap-5 sm:grid-cols-2 lg:grid-cols-5">
          {teams.map((team) => (
            <RevealItem key={team.title} direction="up" hoverLift>
              <div className="surface group flex flex-col items-center rounded-3xl p-6 text-center">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-linear-to-br from-primary-500/25 to-primary-700/10 text-primary-300 transition-transform duration-500 group-hover:scale-110 group-hover:text-primary-200">
                  <team.icon className="h-6 w-6" />
                </span>
                <h3 className="mt-4 text-sm font-bold text-foreground sm:text-base">
                  {team.title}
                </h3>
                <p className="mt-2 text-xs leading-6 text-muted-foreground sm:text-[13px]">
                  {team.desc}
                </p>
                <span className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  {team.members} عضو فعال
                  <Users2 className="h-3.5 w-3.5 text-primary-300" />
                </span>
              </div>
            </RevealItem>
          ))}
        </RevealGroup>
      </div>
    </section>
  );
}
