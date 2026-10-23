"use client";

import { useSyncExternalStore, useState, useEffect, useRef } from "react";
import { ArrowLeft, Sparkles, Users2, Activity } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { GlareButton } from "@/components/ui/glare-button";
import {
  Reveal,
  RevealGroup,
  RevealItem,
} from "@/components/animations/Reveal";
import { PointerParallax } from "@/components/animations/PointerParallax";
import ClickSpark from "@/components/animations/ClickSpark";
import TextType from "@/components/animations/TextType";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { useMotionCapability } from "@/hooks/useMotionCapability";

const ORBITS = [
  { size: 76, delay: "0s", dashed: false },
  { size: 86, delay: "0.55s", dashed: true },
  { size: 96, delay: "1.1s", dashed: false },
] as const;

type FloatStat = {
  key: string;
  icon: LucideIcon;
  title: string;
  sub: string;
  orbit: number;
  start: number;
};

const ORBIT_DURATION = "36s";
/** Mobile: slower orbit = less perceived jank while keeping motion */
const ORBIT_DURATION_LITE = "56s";

export function Hero() {
  const t = useTranslations("Hero");
  const { resolvedTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const globeSrc =
    mounted && resolvedTheme === "light"
      ? "/images/PlanetLightMode.svg"
      : "/images/PlanetDarkMode.svg";

  const line1 = t.raw("line1") as string[];
  const line2 = t.raw("line2") as string[];
  const line3 = t.raw("line3") as string[];

  const phrases = line1.map((pre, i) => {
    const mid = line2[i] ?? "";
    const post = line3[i] ?? "";
    return {
      pre,
      mid,
      post,
      full: `${pre}\n${mid} ${post}`,
    };
  });
  const fullTexts = phrases.map((p) => p.full);
  const [phraseIndex, setPhraseIndex] = useState(0);
  const visualRef = useRef<HTMLDivElement>(null);
  const [orbitsActive, setOrbitsActive] = useState(true);
  const { isNarrow, isLowEnd } = useMotionCapability();
  /** Narrow / low-end: softer blur / slower orbits — same visual, cheaper paint */
  const heroLite = isNarrow || isLowEnd;

  useEffect(() => {
    const el = visualRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setOrbitsActive(entry.isIntersecting),
      { rootMargin: "120px", threshold: 0 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const renderHeroText = (displayed: string, _full: string, index: number) => {
    const { pre, mid } = phrases[index] ?? phrases[0];
    const midStart = pre.length + 1; // after \n
    const midEnd = midStart + mid.length;

    const head = displayed.slice(0, Math.min(displayed.length, midStart));
    const midShown =
      displayed.length > midStart
        ? displayed.slice(midStart, Math.min(displayed.length, midEnd))
        : "";
    const after = displayed.length > midEnd ? displayed.slice(midEnd) : "";

    return (
      <>
        {head}
        {midShown ? <span className="text-gradient">{midShown}</span> : null}
        {after}
      </>
    );
  };

  const floats: FloatStat[] = [
    {
      key: "projects",
      icon: Activity,
      title: t("floatProjects"),
      sub: t("floatProjectsSub"),
      orbit: 96,
      start: -20,
    },
    {
      key: "students",
      icon: Users2,
      title: t("floatStudents"),
      sub: t("floatStudentsSub"),
      orbit: 86,
      start: 100,
    },
    {
      key: "workshops",
      icon: Sparkles,
      title: t("floatWorkshops"),
      sub: t("floatWorkshopsSub"),
      orbit: 76,
      start: 220,
    },
  ];

  return (
    <section className="relative overflow-x-clip pb-14 pt-8 sm:pb-24 sm:pt-14 lg:min-h-[calc(100svh-5rem)] lg:pt-12">
      <div className="container relative grid min-w-0 items-center gap-10 sm:gap-14 lg:grid-cols-2 lg:gap-16">
        <RevealGroup
          stagger={0.12}
          className="min-w-0 text-center lg:text-start"
        >
          <RevealItem direction="up">
            <h1 className="mt-2 max-w-full text-4xl font-extrabold leading-[1.4] tracking-tight wrap-break-words text-foreground sm:text-5xl md:text-6xl lg:text-[3.6rem] xl:text-[4.2rem]">
              <span className="sr-only">{t("titleStatic")}</span>
              <span aria-hidden="true" className="grid min-w-0">
                <span className="invisible col-start-1 row-start-1 whitespace-pre-wrap">
                  {phrases[phraseIndex]?.pre}
                  {"\n"}
                  {phrases[phraseIndex]?.mid} {phrases[phraseIndex]?.post}
                </span>
                <span className="col-start-1 row-start-1 min-w-0">
                  <TextType
                    as="span"
                    text={fullTexts}
                    typingSpeed={heroLite ? 100 : 95}
                    deletingSpeed={heroLite ? 65 : 55}
                    pauseDuration={heroLite ? 3700 : 3500}
                    initialDelay={200}
                    loop={true}
                    showCursor
                    startOnVisible
                    renderText={renderHeroText}
                    onTextIndexChange={setPhraseIndex}
                  />
                </span>
              </span>
            </h1>
          </RevealItem>

          <RevealItem direction="up">
            <p className="mx-auto mt-5 max-w-xl text-sm leading-7 text-muted-foreground sm:mt-6 sm:text-base sm:leading-8 lg:mx-0">
              {t("subtitle")}
            </p>
          </RevealItem>

          <RevealItem direction="up">
            <ClickSpark
              sparkColor="#8b5cf6"
              sparkSize={10}
              sparkRadius={15}
              sparkCount={8}
              duration={400}
            >
              <div className="mt-7 flex flex-col items-center justify-center gap-3 sm:mt-9 sm:flex-row lg:justify-start">
                <GlareButton className="w-full sm:w-auto">
                  <Button
                    asChild
                    size="lg"
                    className="w-full rounded-2xl shadow-glow sm:w-auto sm:rounded-full"
                  >
                    <Link href="/#events">
                      {t("ctaEvents")}
                      <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
                    </Link>
                  </Button>
                </GlareButton>

                <GlareButton className="w-full sm:w-auto">
                  <Button
                    asChild
                    variant="outline"
                    size="lg"
                    className="w-full rounded-2xl border-border/70 bg-card/40 sm:w-auto sm:rounded-full"
                  >
                    <Link href="/#teams">{t("ctaAbout")}</Link>
                  </Button>
                </GlareButton>
              </div>
            </ClickSpark>
          </RevealItem>
        </RevealGroup>

        <div
          ref={visualRef}
          className={cn(
            "relative mx-auto aspect-square w-full max-w-85 overflow-visible sm:max-w-115 lg:max-w-135",
            !orbitsActive && "hero-visual--paused",
            heroLite && "hero-visual--lite",
          )}
        >
          <Reveal
            direction="left"
            delay={0.15}
            className="relative h-full w-full overflow-visible"
          >
            <div
              className={cn(
                "pointer-events-none absolute inset-[8%] rounded-full bg-linear-to-br from-primary-500/20 via-glow-2/10 to-transparent",
                heroLite ? "opacity-70 blur-xl" : "animate-pulse-glow blur-3xl",
              )}
            />

            <div className="pointer-events-none absolute inset-[6%] sm:inset-0">
              {ORBITS.map((orbit) => (
                <div
                  key={orbit.size}
                  className={cn(
                    "absolute left-1/2 top-1/2 rounded-full border",
                    heroLite ? "border-primary/30" : "border-primary/40",
                    !heroLite && "orbit-ring",
                  )}
                  style={{
                    width: `${orbit.size}%`,
                    height: `${orbit.size}%`,
                    translate: "-50% -50%",
                    animationDelay: heroLite ? undefined : orbit.delay,
                    borderStyle: orbit.dashed ? "dashed" : "solid",
                    borderWidth: orbit.dashed ? 1.5 : 1.25,
                  }}
                />
              ))}
            </div>

            <div className="absolute left-1/2 top-1/2 z-1 w-[74%] -translate-x-1/2 -translate-y-1/2 sm:w-[80%] lg:w-[85%]">
              <PointerParallax strength={heroLite ? 0 : 16}>
                <Image
                  src={globeSrc}
                  alt={t("imageAlt")}
                  width={900}
                  height={700}
                  priority
                  className="hero-globe h-auto w-full object-contain"
                />
              </PointerParallax>
            </div>

            <div className="absolute inset-[6%] z-2 sm:inset-0">
              {floats.map((item) => {
                const Icon = item.icon;
                const offset = (100 - item.orbit) / 2;

                return (
                  <div
                    key={item.key}
                    className="pointer-events-none absolute inset-0"
                    style={{ transform: `rotate(${item.start}deg)` }}
                  >
                    <div
                      className="orbit-spin absolute inset-0"
                      style={
                        {
                          "--orbit-duration": heroLite
                            ? ORBIT_DURATION_LITE
                            : ORBIT_DURATION,
                        } as React.CSSProperties
                      }
                    >
                      <div
                        className="absolute"
                        style={{
                          width: `${item.orbit}%`,
                          height: `${item.orbit}%`,
                          left: `${offset}%`,
                          top: `${offset}%`,
                        }}
                      >
                        <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                          <div
                            style={{ transform: `rotate(${-item.start}deg)` }}
                          >
                            <div
                              className="orbit-spin-rev pointer-events-auto"
                              style={
                                {
                                  "--orbit-duration": heroLite
                                    ? ORBIT_DURATION_LITE
                                    : ORBIT_DURATION,
                                } as React.CSSProperties
                              }
                            >
                              <div
                                className={cn(
                                  "flex scale-90 flex-row items-center gap-2 rounded-2xl px-2.5 py-2 sm:scale-100 sm:gap-2.5 sm:px-3.5 sm:py-2.5",
                                  heroLite ? "hero-orbit-chip" : "surface",
                                )}
                              >
                                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-primary/15 text-primary sm:h-9 sm:w-9">
                                  <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                                </span>
                                <div className="text-start">
                                  <span className="block whitespace-nowrap text-xs font-bold text-foreground sm:text-sm">
                                    {item.title}
                                  </span>
                                  <span className="block whitespace-nowrap text-[10px] text-muted-foreground sm:text-[11px]">
                                    {item.sub}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
