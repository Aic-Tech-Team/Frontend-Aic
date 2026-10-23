import Image from "next/image";
import { GraduationCap, Hammer, Sprout } from "lucide-react";
import { getTranslations } from "next-intl/server";
import { Reveal, RevealGroup, RevealItem } from "@/components/animations/Reveal";
import { Parallax } from "@/components/animations/Parallax";

const ICONS = [Sprout, Hammer, GraduationCap] as const;

export async function AboutAudience() {
  const t = await getTranslations("AboutPage");
  const people = t.raw("audience") as { title: string; body: string }[];

  return (
    <section className="py-14 sm:py-24">
      <div className="container grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
        <Reveal direction="up" className="min-w-0">
          <h2 className="text-3xl font-extrabold leading-snug text-foreground sm:text-4xl lg:text-5xl">
            {t("audienceTitle")}
          </h2>
          <Parallax distance={30}>
            <div className="relative mx-auto mt-8 aspect-square w-full max-w-sm lg:max-w-none">
              <span
                aria-hidden="true"
                className="absolute inset-0 rounded-full bg-radial from-primary-500/40 via-primary-500/10 to-transparent to-70% blur-3xl"
              />
              <span
                aria-hidden="true"
                className="absolute inset-[6%] rounded-full border border-dashed border-primary/30"
              />
              <Image
                src="/images/Robot.svg"
                alt=""
                width={900}
                height={700}
                className="relative z-10 h-full w-full object-contain"
              />
            </div>
          </Parallax>
        </Reveal>

        <RevealGroup className="min-w-0 space-y-5">
          {people.map((person, i) => {
            const Icon = ICONS[i] ?? Sprout;
            return (
              <RevealItem key={person.title}>
                <article
                  className={`surface group relative flex gap-5 overflow-hidden rounded-3xl p-6 transition-transform duration-500 hover:-translate-y-1 sm:p-8 ${
                    i === 1 ? "lg:ms-10" : i === 2 ? "lg:ms-20" : ""
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute -end-10 -top-10 size-40 rounded-full bg-primary/20 blur-3xl transition-opacity duration-500 group-hover:opacity-100 opacity-50"
                  />
                  <span className="relative grid size-14 shrink-0 place-items-center rounded-2xl bg-primary/15 text-primary-300 ring-1 ring-primary/30 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6">
                    <Icon className="size-7" />
                  </span>
                  <div className="relative min-w-0">
                    <h3 className="text-xl font-extrabold leading-snug text-foreground sm:text-2xl">
                      {person.title}
                    </h3>
                    <p className="mt-2 text-base leading-8 text-muted-foreground">
                      {person.body}
                    </p>
                  </div>
                </article>
              </RevealItem>
            );
          })}
        </RevealGroup>
      </div>
    </section>
  );
}
