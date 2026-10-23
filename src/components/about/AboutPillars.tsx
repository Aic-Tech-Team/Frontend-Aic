import {
  ArrowLeft,
  Building2,
  Laptop,
  Presentation,
  Trophy,
  type LucideIcon,
} from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { SectionHeading } from "@/components/common/SectionHeading";

/** Same order as `Experience.items`; destinations mirror the footer. */
const PILLARS: { icon: LucideIcon; href: "/events" | "/activities" }[] = [
  { icon: Trophy, href: "/events" },
  { icon: Presentation, href: "/events" },
  { icon: Laptop, href: "/activities" },
  { icon: Building2, href: "/activities" },
];

export async function AboutPillars() {
  const t = await getTranslations("AboutPage");
  const experience = await getTranslations("Experience");
  const items = experience.raw("items") as { title: string; desc: string }[];

  return (
    <section className="py-12 sm:py-20">
      <div className="container">
        <SectionHeading
          badge={t("pillarsTitle")}
          title={t("pillarsTitle")}
          description={t("pillarsDescription")}
        />

        <RevealGroup className="border-b border-border/60" stagger={0.08}>
          {items.map((item, i) => {
            const { icon: Icon, href } = PILLARS[i] ?? PILLARS[0];
            return (
              <RevealItem key={item.title} direction="up">
                <Link
                  href={href}
                  className="group relative isolate flex flex-col gap-3 overflow-hidden border-t border-border/60 px-2 py-7 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:px-6 sm:py-9 md:flex-row md:items-center md:gap-10"
                >
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 -z-10 origin-(--fill-origin,left) scale-x-0 bg-primary/10 transition-transform duration-500 ease-out group-hover:scale-x-100 group-focus-visible:scale-x-100 rtl:[--fill-origin:right]"
                  />
                  <Icon
                    aria-hidden="true"
                    className="h-7 w-7 shrink-0 text-primary-300 transition-transform duration-500 group-hover:-rotate-6 group-hover:scale-110"
                  />
                  <h3 className="text-2xl font-extrabold leading-snug text-foreground sm:text-4xl md:w-[32%] md:shrink-0">
                    {item.title}
                  </h3>
                  <p className="max-w-[48ch] flex-1 text-sm leading-8 text-muted-foreground sm:text-base">
                    {item.desc}
                  </p>
                  <ArrowLeft
                    aria-hidden="true"
                    className="hidden h-6 w-6 shrink-0 text-primary-300 transition-transform duration-300 md:block ltr:rotate-180 ltr:group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                  />
                </Link>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
