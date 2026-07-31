"use client";

import {
  Children,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  type ReactNode,
} from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import Accessibility, {
  type AccessibilityOptionsType,
} from "embla-carousel-accessibility";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: ReactNode;
  ariaLabel: string;
  className?: string;
  slideClassName?: string;
  options?: EmblaOptionsType;
  showDots?: boolean;
}

const DEFAULT_SLIDE_CLASS =
  "flex-[0_0_86%] sm:flex-[0_0_52%] lg:flex-[0_0_33.333%]";

export function Carousel({
  children,
  ariaLabel,
  className,
  slideClassName = DEFAULT_SLIDE_CLASS,
  options,
  showDots = true,
}: CarouselProps) {
  const locale = useLocale();
  const t = useTranslations("Carousel");
  const direction = locale === "fa" ? "rtl" : "ltr";

  const accessibilityOptions: AccessibilityOptionsType = {
    announceChanges: true,
    carouselAriaLabel: ariaLabel,
    carouselAriaRoleDescription: t("roleDescription"),
    previousButtonAriaLabel: t("prevSlide"),
    nextButtonAriaLabel: t("nextSlide"),
    slideAriaRoleDescription: t("slideRoleDescription"),
    slideAriaLabel: (_grouped, first, _last, total) =>
      t("slideLabel", { index: first + 1, total }),
    dotButtonAriaLabel: (_grouped, first, _last, total) =>
      t("goToSlide", { index: first + 1, total }),
    liveRegionContent: (_grouped, first, _last, total) =>
      t("showingSlide", { index: first + 1, total }),
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      direction,
      align: "start",
      loop: false,
      slidesToScroll: 1,
      containScroll: "trimSnaps",
      breakpoints: {
        "(prefers-reduced-motion: reduce)": { duration: 0 },
      },
      ...options,
    },
    [Accessibility(accessibilityOptions)],
  );

  const prevBtnRef = useRef<HTMLButtonElement>(null);
  const nextBtnRef = useRef<HTMLButtonElement>(null);
  const dotsRef = useRef<HTMLDivElement>(null);
  const liveRegionRef = useRef<HTMLDivElement>(null);
  const [, forceUpdate] = useReducer((c: number) => c + 1, 0);

  const scrollPrev = useCallback(() => emblaApi?.goToPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.goToNext(), [emblaApi]);
  const scrollTo = useCallback(
    (index: number) => emblaApi?.goTo(index),
    [emblaApi],
  );

  useEffect(() => {
    if (!emblaApi) return;

    emblaApi.on("select", forceUpdate);
    emblaApi.on("reinit", forceUpdate);

    return () => {
      emblaApi.off("select", forceUpdate);
      emblaApi.off("reinit", forceUpdate);
    };
  }, [emblaApi]);

  const canPrev = emblaApi?.canGoToPrev() ?? false;
  const canNext = emblaApi?.canGoToNext() ?? false;
  const canNavigate = canPrev || canNext;
  const scrollSnaps = emblaApi?.snapList() ?? [];
  const selectedIndex = emblaApi?.selectedSnap() ?? 0;

  useEffect(() => {
    if (!emblaApi) return;
    const accessibility = emblaApi.plugins().accessibility;
    if (!accessibility) return;

    if (prevBtnRef.current && nextBtnRef.current) {
      accessibility.setupPrevAndNextButtons(
        prevBtnRef.current,
        nextBtnRef.current,
      );
    }
    if (dotsRef.current) {
      accessibility.setupDotButtons(dotsRef.current);
    }
    if (liveRegionRef.current) {
      accessibility.setupLiveRegion(liveRegionRef.current);
    }
  }, [emblaApi]);

  const slides = Children.toArray(children);

  return (
    <div className={cn("relative", className)}>
      <div
        className="-mx-5 -my-10 overflow-hidden px-5 py-10 sm:-mx-6 sm:px-6 lg:-mx-10 lg:px-10"
        ref={emblaRef}
      >
        <div className="flex touch-pan-y gap-4 sm:gap-5">
          {slides.map((slide, index) => (
            <div
              key={index}
              className={cn("min-w-0 shrink-0 grow-0", slideClassName)}
            >
              {slide}
            </div>
          ))}
        </div>
      </div>

      <div
        ref={liveRegionRef}
        className="sr-only"
        aria-live="polite"
        aria-atomic="true"
      />

      {canNavigate ? (
        <div className="mt-6 flex items-center justify-center gap-4">
          <button
            ref={prevBtnRef}
            type="button"
            onClick={scrollPrev}
            disabled={!canPrev}
            className="surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowRight className="h-4 w-4 ltr:rotate-180" />
          </button>

          {showDots && scrollSnaps.length > 1 ? (
            <div ref={dotsRef} className="flex items-center gap-2">
              {scrollSnaps.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => scrollTo(index)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    index === selectedIndex
                      ? "w-6 bg-primary-400 shadow-[0_0_0_1px_rgba(255,255,255,0.1)]"
                      : "w-2 bg-primary/20 hover:bg-primary/40",
                  )}
                />
              ))}
            </div>
          ) : null}

          <button
            ref={nextBtnRef}
            type="button"
            onClick={scrollNext}
            disabled={!canNext}
            className="surface flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-30"
          >
            <ArrowLeft className="h-4 w-4 ltr:rotate-180" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
