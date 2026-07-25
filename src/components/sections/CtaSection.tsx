import { ArrowLeft, Handshake } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Reveal } from "@/components/reveal";
import { SectionBadge } from "@/components/section-heading";
import AutoBorderGlow from "../AutoBorderGlow";

export function CtaSection() {
  return (
    <section id="join" className="px-4 py-10 pb-24 sm:px-6 sm:pb-30">
      <Reveal direction="up" className="mx-auto max-w-6xl">
        <AutoBorderGlow
          className="w-full"
          borderRadius={40}
          glowColor="270 90 75"
          colors={["#c084fc", "#f472b6", "#38bdf8"]}
          glowRadius={30}
          glowIntensity={0.9}
          coneSpread={25}
          speed={8}
        >
          <div className="surface relative w-full overflow-hidden rounded-[2.5rem] px-6 py-16 text-center sm:px-12">
            <div className="pointer-events-none absolute -top-24 start-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-primary-500/25 blur-[100px]" />

            <div className="relative flex justify-center">
              <SectionBadge icon={Handshake}>عضویت در انجمن</SectionBadge>
            </div>

            <h2 className="relative mx-auto mt-5 max-w-xl text-2xl font-extrabold text-foreground sm:text-3xl">
              بخشی از انجمن ما باشید
            </h2>

            <p className="relative mx-auto mt-4 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
              اگر دانشجوی علاقه‌مند به هوش مصنوعی هستید، با پیوستن به انجمن، در
              فعالیت‌های علمی، آموزشی و پژوهشی ما شریک شوید. همراه ما رشد کنید.
            </p>

            <div className="relative mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button
                asChild
                size="lg"
                className="w-full rounded-sm shadow-glow sm:w-auto"
              >
                <a href="#join">
                  درخواست عضویت
                  <ArrowLeft className="h-4 w-4" />
                </a>
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="w-full rounded-sm border-border/60 sm:w-auto"
              >
                همکاری سازمانی
              </Button>
            </div>
          </div>
        </AutoBorderGlow>
      </Reveal>
    </section>
  );
}
