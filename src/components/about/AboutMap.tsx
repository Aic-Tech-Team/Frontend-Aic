"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale } from "next-intl";
import { FocusGraph } from "@/components/about/FocusGraph";
import { useMotionCapability } from "@/hooks/useMotionCapability";
import { cn } from "@/lib/utils";

type Area = { title: string; desc: string };
type Fact = { label: string; value: string };

const AUTOPLAY_MS = 4200;

/**
 * "What we are" as a three-part readout around the 3D globe, no box around it: the intro and
 * facts on the reading side, the globe in the middle, and on the far side the open area with
 * the full list of areas under it. Until the visitor picks an area it walks through them.
 */
export function AboutMap({
  areas,
  facts,
  lede,
  label,
}: {
  areas: Area[];
  facts: Fact[];
  lede: string;
  label: string;
}) {
  const locale = useLocale();
  const [active, setActive] = useState(0);
  const [picked, setPicked] = useState(false);
  const [inView, setInView] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const { fxActive } = useMotionCapability();

  const pick = (i: number) => {
    setPicked(true);
    setActive(i);
  };

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setInView(e.isIntersecting), { threshold: 0.3 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (picked || !inView || !fxActive) return;
    const id = window.setInterval(() => setActive((a) => (a + 1) % areas.length), AUTOPLAY_MS);
    return () => window.clearInterval(id);
  }, [picked, inView, fxActive, areas.length]);

  const current = areas[active];
  const pad = (n: number) => n.toLocaleString(locale, { minimumIntegerDigits: 2 });

  return (
    <div ref={rootRef} className="relative isolate">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-1/2 -z-10 hidden size-[46rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-primary/10 lg:block rtl:translate-x-1/2"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute start-1/2 top-1/2 -z-10 hidden size-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-primary/15 lg:block rtl:translate-x-1/2"
      />

      <div className="grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.5fr)_minmax(0,0.9fr)] lg:gap-6 xl:gap-10">
        {/* intro and facts */}
        <div className="order-2 min-w-0 lg:order-1">
          <p className="text-pretty text-sm leading-8 text-foreground/80 sm:text-base sm:leading-9">{lede}</p>
          <dl className="mt-8">
            {facts.map((fact) => (
              <div key={fact.label} className="relative border-t border-border/50 py-4 first:border-primary/40">
                <dt className="text-sm text-muted-foreground">{fact.label}</dt>
                <dd className="mt-1 text-base font-extrabold leading-7 text-foreground sm:text-lg">{fact.value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the globe */}
        <div className="order-1 min-w-0 lg:order-2">
          <FocusGraph areas={areas} label={label} active={active} onPick={pick} />
        </div>

        {/* readout of the open area, then the full list */}
        <div className="order-3 min-w-0">
          <p aria-hidden="true" className="text-7xl font-black leading-none text-transparent outline-text opacity-70 sm:text-8xl">
            {pad(active + 1)}
          </p>
          <div aria-live="polite" className="mt-5 min-h-44 sm:min-h-48">
            <div key={active} className="animate-fade-in">
              <h3 className="text-2xl font-extrabold leading-snug text-foreground sm:text-3xl">{current.title}</h3>
              <p className="mt-3 text-base leading-9 text-muted-foreground">{current.desc}</p>
            </div>
          </div>
          <ul className="mt-4 border-t border-border/50">
            {areas.map((area, i) => (
              <li key={area.title} className="border-b border-border/50">
                <button
                  type="button"
                  onClick={() => pick(i)}
                  aria-current={i === active}
                  className="group relative flex w-full items-center gap-4 py-3 text-start text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      "absolute inset-y-2 start-0 w-0.5 origin-center rounded-full bg-primary-300 shadow-[0_0_10px_var(--primary)] transition-transform duration-300",
                      i === active ? "scale-y-100" : "scale-y-0",
                    )}
                  />
                  <span className="w-6 ps-3 text-xs font-bold tabular-nums text-primary-300/70">{pad(i + 1)}</span>
                  <span
                    className={cn(
                      "transition-colors duration-300",
                      i === active ? "font-bold text-foreground" : "text-muted-foreground group-hover:text-foreground",
                    )}
                  >
                    {area.title}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
