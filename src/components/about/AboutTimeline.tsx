"use client";

import { useRef } from "react";
import Image from "next/image";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { gsap, prefersReducedMotion, ScrollTrigger, useGSAP } from "@/lib/gsap";
import { ScrollText } from "@/components/animations/ScrollText";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface TimelineItem {
  title: string;
  body: string;
  image: string;
}

interface AboutTimelineProps {
  items: TimelineItem[];
  next: { title: string; body: string; cta: string };
}

/** Vertical scroll-driven timeline: progress line fills, nodes light up in turn. */
export function AboutTimeline({ items, next }: AboutTimelineProps) {
  const locale = useLocale();
  const root = useRef<HTMLDivElement>(null);
  const list = useRef<HTMLOListElement>(null);
  const fill = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const el = root.current;
      if (!el || !list.current) return;
      const nodes = gsap.utils.toArray<HTMLElement>("[data-tl-item]", el);

      if (prefersReducedMotion()) {
        nodes.forEach((n) => n.setAttribute("data-active", "true"));
        gsap.set(fill.current, { scaleY: 1 });
        return;
      }

      gsap.fromTo(
        fill.current,
        { scaleY: 0 },
        {
          scaleY: 1,
          ease: "none",
          scrollTrigger: {
            trigger: list.current,
            start: "top 60%",
            end: "bottom 62%",
            scrub: 0.4,
          },
        },
      );

      nodes.forEach((n) => {
        ScrollTrigger.create({
          trigger: n,
          start: "top 62%",
          onToggle: (self) => n.setAttribute("data-active", self.isActive ? "true" : "false"),
          onEnter: () => n.setAttribute("data-active", "true"),
          onLeaveBack: () => n.setAttribute("data-active", "false"),
        });
      });

      // Parallax: the oversized image layer drifts inside a fixed, clipped frame.
      gsap.utils.toArray<HTMLElement>("[data-tl-img]", el).forEach((layer) => {
        gsap.fromTo(
          layer,
          { yPercent: -9 },
          {
            yPercent: 9,
            ease: "none",
            scrollTrigger: {
              trigger: layer.parentElement,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
            },
          },
        );
      });
    },
    { scope: root },
  );

  return (
    <div ref={root} className="mt-12 sm:mt-16">
      <ol ref={list} className="relative">
        {/* track + progress; both stop where the list ends */}
        <span
          aria-hidden="true"
          className="absolute inset-y-0 start-3 w-px bg-border/60 lg:start-1/2 lg:-translate-x-1/2 rtl:lg:translate-x-1/2"
        />
        <span
          ref={fill}
          aria-hidden="true"
          className="absolute inset-y-0 start-3 w-0.5 origin-top -translate-x-px scale-y-0 bg-linear-to-b from-primary-300 via-primary-500 to-primary-300 shadow-[0_0_14px_var(--primary)] lg:start-1/2 lg:-translate-x-1/2 rtl:translate-x-px rtl:lg:translate-x-1/2"
        />

        {items.map((item, i) => {
          const flip = i % 2 === 1;
          const n = (i + 1).toLocaleString(locale, { minimumIntegerDigits: 2 });
          return (
            <li
              key={item.title}
              data-tl-item
              data-active="false"
              className="group relative grid min-w-0 gap-5 pb-14 ps-10 lg:grid-cols-2 lg:items-center lg:gap-x-24 lg:pb-24 lg:ps-0"
            >
              <span
                aria-hidden="true"
                className="absolute start-3 top-2 z-10 size-4 -translate-x-1/2 rounded-full border-2 border-border bg-background transition-all duration-500 group-data-[active=true]:scale-125 group-data-[active=true]:border-primary group-data-[active=true]:bg-primary group-data-[active=true]:shadow-[0_0_0_6px_color-mix(in_srgb,var(--primary)_25%,transparent),0_0_24px_var(--primary)] rtl:translate-x-1/2 lg:start-1/2 lg:top-1/2 lg:-translate-y-1/2"
              />

              {/* frame stays put; inner layer is taller than the frame and moves */}
              <div
                className={cn(
                  "relative aspect-4/3 min-w-0 overflow-hidden rounded-3xl border border-border/50 bg-card shadow-glow transition-[opacity,filter] duration-700",
                  "opacity-60 saturate-50 group-data-[active=true]:opacity-100 group-data-[active=true]:saturate-100",
                  flip && "lg:order-2",
                )}
              >
                <div
                  data-tl-img
                  className="absolute inset-x-0 -top-[12%] h-[124%] will-change-transform"
                >
                  <Image
                    src={item.image}
                    alt=""
                    width={1024}
                    height={768}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 bg-linear-to-t from-background/60 via-transparent to-transparent"
                />
                <span className="absolute start-4 top-4 rounded-full border border-white/20 bg-black/40 px-3 py-1 text-xs font-bold text-white backdrop-blur-md">
                  {n}
                </span>
              </div>

              <div className={cn("min-w-0", flip && "lg:order-1")}>
                <span
                  aria-hidden="true"
                  className="block text-6xl font-extrabold leading-none text-transparent outline-text opacity-40 transition-opacity duration-500 group-data-[active=true]:opacity-90 sm:text-7xl"
                >
                  {n}
                </span>
                <h3 className="mt-3 text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">
                  {item.title}
                </h3>
                <ScrollText
                  text={item.body}
                  className="mt-3 max-w-[48ch] text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9"
                />
              </div>
            </li>
          );
        })}
      </ol>

      {/* final node sits right where the line ends */}
      <div data-tl-item data-active="false" className="group relative ps-10 lg:ps-0">
        <span
          aria-hidden="true"
          className="absolute start-3 top-0 z-10 size-5 -translate-x-1/2 rounded-full border-2 border-dashed border-primary bg-background transition-all duration-500 group-data-[active=true]:animate-pulse group-data-[active=true]:bg-primary group-data-[active=true]:shadow-[0_0_30px_var(--primary)] rtl:translate-x-1/2 lg:start-1/2"
        />
        <div className="mx-auto max-w-xl pt-1 lg:pt-14 lg:text-center">
          <h3 className="text-3xl font-extrabold leading-snug text-gradient sm:text-4xl">
            {next.title}
          </h3>
          <p className="mt-3 text-base leading-8 text-muted-foreground sm:text-lg">
            {next.body}
          </p>
          <Button asChild size="lg" className="mt-6 h-12 rounded-full px-8 shadow-glow">
            <Link href="/events">
              {next.cta}
              <ArrowLeft className="size-4 ltr:rotate-180" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
