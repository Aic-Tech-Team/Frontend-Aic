import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Reveal } from "@/components/animations/Reveal";
import { Parallax } from "@/components/animations/Parallax";
import { ScrollText } from "@/components/animations/ScrollText";

export async function AboutOrigin() {
  const t = await getTranslations("AboutPage");
  const [lead, ...rest] = t.raw("origin") as string[];

  return (
    <section className="py-10 sm:py-16">
      <div className="container">
        <Reveal direction="up">
          <div className="relative overflow-hidden rounded-3xl border border-border/50 shadow-glow">
            <div className="relative aspect-4/3 overflow-hidden sm:aspect-video lg:aspect-[21/9]">
              <Parallax distance={40} className="absolute inset-x-0 -top-[10%] h-[120%]">
                <Image
                  src="/images/about/about-origin.jpg"
                  alt=""
                  width={1024}
                  height={576}
                  className="h-full w-full object-cover"
                />
              </Parallax>
            </div>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 bg-linear-to-t from-background via-background/30 to-transparent"
            />
            <p className="absolute inset-x-6 bottom-3 text-7xl font-extrabold leading-none text-transparent outline-text sm:inset-x-10 sm:bottom-4 sm:text-8xl lg:text-9xl">
              {t("originYear")}
            </p>
          </div>
        </Reveal>

        <div className="mx-auto mt-12 max-w-3xl min-w-0 sm:mt-16">
          <h2 className="text-3xl font-extrabold leading-snug text-foreground sm:text-4xl">
            {t("originTitle")}
          </h2>
          <ScrollText
            text={lead}
            className="mt-6 text-xl font-bold leading-[2] text-foreground sm:text-2xl sm:leading-[2]"
          />
          <div className="mt-8 space-y-5 border-s-2 border-primary/40 ps-5 sm:ps-7">
            {rest.map((paragraph) => (
              <ScrollText
                key={paragraph}
                text={paragraph}
                className="text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9"
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
