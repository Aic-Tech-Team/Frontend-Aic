import Image from "next/image";
import { ChevronLeft, HouseHeart } from "lucide-react";
import { RevealGroup, RevealItem } from "@/components/reveal";
import { SectionHeading } from "../section-heading";

export function AboutSection() {
  return (
    <section id="about" className="px-4 py-20 sm:px-6">
      <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
        <RevealGroup className="lg:order-2">
          <SectionHeading
            icon={HouseHeart}
            badge="درباره انجمن"
            title="انجمنی برای علاقه‌مندان هوش مصنوعی"
            description="انجمن علمی هوش مصنوعی در سال ۱۳۹۸ با هدف ایجاد فضایی علمی و تخصصی برای دانشجویان علاقه‌مند به هوش مصنوعی تأسیس شد و زیر نظر دانشکده مهندسی کامپیوتر فعالیت می‌کند."
          />

          <RevealItem direction="right" className="mt-4">
            <p className="text-sm leading-8 text-muted-foreground sm:text-base">
              از برگزاری کارگاه‌های آموزشی و کنفرانس‌های علمی تا همکاری با صنعت
              و انجام پروژه‌های تحقیقاتی، اعضای انجمن در محیطی پویا و خلاق رشد
              می‌کنند.
            </p>
          </RevealItem>

          <RevealItem direction="right" className="mt-8">
            <button className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-6 py-3 text-sm font-bold text-white transition hover:bg-primary-400">
              <ChevronLeft className="h-4 w-4" />
              بیشتر درباره انجمن
            </button>
          </RevealItem>
        </RevealGroup>

        <RevealItem direction="left" className="lg:order-1">
          <div className="relative overflow-hidden rounded-3xl">
            <Image
              src="/images/about.jpg"
              alt="اعضای انجمن هوش مصنوعی"
              width={900}
              height={700}
              className="h-[420px] w-full object-cover sm:h-[520px]"
            />
          </div>
        </RevealItem>
      </div>
    </section>
  );
}