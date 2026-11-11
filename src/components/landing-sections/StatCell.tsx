"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useLocale } from "next-intl";

/** A number whose digits roll up from zero like an odometer once it scrolls into view. */
function Odometer({
  value,
  on,
  locale,
}: {
  value: number;
  on: boolean;
  locale: string;
}) {
  const fmt = useMemo(
    () => new Intl.NumberFormat(locale, { useGrouping: false }),
    [locale],
  );
  const glyphs = useMemo(
    () => Array.from({ length: 10 }, (_, i) => fmt.format(i)),
    [fmt],
  );
  const digits = String(value).split("").map(Number);

  return (
    <span
      className="inline-flex items-baseline"
      dir="ltr"
      aria-label={`${fmt.format(value)}+`}
      role="text"
    >
      <span
        aria-hidden="true"
        className="me-[0.04em] text-[0.62em] font-black text-primary-300"
      >
        +
      </span>
      {digits.map((d, i) => (
        <span
          key={i}
          aria-hidden="true"
          className="relative inline-block h-[1.08em] overflow-hidden leading-[1.08]"
        >
          <span className="invisible block px-[0.02em]">{glyphs[d]}</span>
          <span
            className="absolute inset-x-0 top-0 flex flex-col will-change-transform"
            style={{
              transform: on ? `translateY(-${d * 10}%)` : "translateY(0)",
              transition: `transform ${1.5 + i * 0.35}s cubic-bezier(0.16, 1, 0.3, 1) ${i * 90}ms`,
            }}
          >
            {glyphs.map((g, k) => (
              <span key={k} className="block h-[1.08em]">
                {g}
              </span>
            ))}
          </span>
        </span>
      ))}
    </span>
  );
}

/**
 * One figure of the stats band. On wide screens the three cells climb like steps, each with a
 * ruler under its number that draws itself out; the number rolls up like an odometer and a huge
 * hollow copy of it drifts behind.
 */
export function StatCell({
  index,
  label,
  value,
  icon,
}: {
  index: number;
  label: string;
  value: number;
  icon: ReactNode;
  fill?: number;
}) {
  const locale = useLocale();
  const ref = useRef<HTMLDivElement>(null);
  const [on, setOn] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setOn(true);
          io.disconnect();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      data-on={on}
      style={{ "--i": index } as CSSProperties}
      className="group relative isolate min-w-0 px-1 py-8 text-center sm:px-8 sm:py-12 lg:mt-[calc((2-var(--i))*2.5rem)] lg:px-10 lg:text-start"
    >
      {index > 0 ? (
        <span
          aria-hidden="true"
          className="absolute inset-y-4 inset-s-0 w-px bg-linear-to-b from-transparent via-border/70 to-transparent sm:inset-y-6"
        />
      ) : null}

      {/* the same number, huge and hollow, drifting behind the real one */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-3 inset-s-0 -z-10 hidden select-none text-[7rem] lg:block font-black leading-none text-transparent outline-text opacity-[0.12] transition-transform duration-1000 ease-out group-hover:translate-x-2 lg:text-[11rem] rtl:group-hover:-translate-x-2"
        dir="ltr"
      >
        {new Intl.NumberFormat(locale, { useGrouping: false }).format(value)}
      </span>
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-s-1/4 top-1/4 -z-10 h-40 w-2/3 rounded-full bg-primary/20 blur-3xl transition-colors duration-700 group-hover:bg-primary/30"
      />

      <div className="relative flex items-center justify-center gap-2.5 text-[11px] font-bold text-primary-300 sm:text-xs lg:justify-start">
        <span className="grid size-7 place-items-center rounded-full bg-primary/15 ring-1 ring-primary/30 [&>svg]:size-3.5">
          {icon}
        </span>
        <span className="tabular-nums opacity-70">
          {(index + 1).toLocaleString(locale, { minimumIntegerDigits: 2 })}
        </span>
      </div>

      <dd className="relative mt-4 text-[2.6rem] font-black leading-none tracking-tight text-foreground sm:mt-5 sm:text-7xl lg:text-8xl">
        <Odometer value={value} on={on} locale={locale} />
      </dd>

      {/* a ruler under the figure: it draws out, and a marker rides to its end */}
      <div aria-hidden="true" className="relative mt-5 hidden h-4 sm:block">
        <span className="stat-ruler absolute inset-0 origin-left rtl:origin-right" />
        <span className="stat-ruler-dot absolute top-0 size-2 rounded-full bg-primary-300 shadow-[0_0_12px_var(--primary)]" />
      </div>

      <dt className="relative mt-3 text-xs leading-5 text-muted-foreground sm:mt-4 sm:text-base">
        {label}
      </dt>
    </div>
  );
}
