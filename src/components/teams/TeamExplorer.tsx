"use client";

import { contactHref } from "@/components/contact/intents";
import {
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
} from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, ArrowRight, Check, ChevronLeft, Pause, Play, Users } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { StickyColumn } from "@/components/common/StickyColumn";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import type { TeamItem } from "@/types/team";

const ROW = 4; // rem: a row of the list, which the sliding highlight is sized to
const AUTOPLAY_MS = 7000;
const subscribeMotion = (cb: () => void) => {
  const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
};
const ARROW =
  "flex size-10 cursor-pointer items-center justify-center rounded-full border border-border/60 bg-card/50 text-foreground transition-colors hover:border-primary/50 hover:bg-primary/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

/**
 * The departments as a list with a panel. The list (a numbered row each, one highlight sliding
 * from row to row) is on the start side; the chosen department is in the panel: its photo, its
 * whole description, every responsibility, and a way to join.
 *
 * Every department's text sits in the same grid cell, so the panel is as tall as the tallest and
 * does not jump as you move between them; choosing fades one out and the next in, its parts
 * rising one after another. The photo crossfades with the one before it. The list and the panel
 * both stay in view as you scroll (`StickyColumn`). The departments also turn by themselves: the
 * highlight carries a progress line that fills, and the turn pauses while the pointer is on the
 * list, while the list has keyboard focus, on the toggle, and for people who asked for less motion.
 */
export function TeamExplorer({
  teams,
  ariaLabel,
  initialId,
}: {
  teams: TeamItem[];
  ariaLabel: string;
  /** Opens on this team (`?team=<id>`), e.g. from a landing card. */
  initialId?: string;
}) {
  const locale = useLocale();
  const t = useTranslations("Teams");
  const tc = useTranslations("Carousel");
  const tj = useTranslations("Cta");
  const total = teams.length;
  const [active, setActive] = useState(() => Math.max(0, teams.findIndex((x) => String(x.id) === initialId)));
  const [prev, setPrev] = useState<number | null>(null);
  const [playing, setPlaying] = useState(true);
  // the turn waits only while the list is under the pointer, or has keyboard focus (a mouse
  // click leaves focus on a row, which must not hold it)
  const [hovering, setHovering] = useState(false);
  const [kbdFocus, setKbdFocus] = useState(false);
  const held = hovering || kbdFocus;
  const [cycle, setCycle] = useState(0); // restarts the progress line
  const reduced = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    () => false,
  );
  const auto = playing && !reduced && total > 1;
  const tabs = useRef<(HTMLButtonElement | null)[]>([]);
  const pills = useRef<(HTMLButtonElement | null)[]>([]);

  // numerals of the page's language, with no padded zero: iranYekan draws a Persian ۰ as a ring
  // that reads as a Latin 0 beside the other digits
  const num = (n: number) => n.toLocaleString(locale, { useGrouping: false });
  const plain = num;

  const choose = (i: number, focus = false) => {
    const next = ((i % total) + total) % total;
    if (next === active) return;
    setPrev(active);
    setActive(next);
    setCycle((c) => c + 1);
    if (focus) (tabs.current[next] ?? pills.current[next])?.focus();
    pills.current[next]?.scrollIntoView({ block: "nearest", inline: "center", behavior: "smooth" });
  };

  const onKey = (e: KeyboardEvent) => {
    const fa = locale === "fa";
    const step: Record<string, number> = {
      ArrowDown: 1,
      ArrowUp: -1,
      ArrowRight: fa ? -1 : 1,
      ArrowLeft: fa ? 1 : -1,
    };
    if (e.key in step) {
      e.preventDefault();
      choose(active + step[e.key], true);
    } else if (e.key === "Home") {
      e.preventDefault();
      choose(0, true);
    } else if (e.key === "End") {
      e.preventDefault();
      choose(total - 1, true);
    }
  };

  return (
    <div className="container" role="region" aria-label={ariaLabel}>
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)] lg:gap-12">
        {/* phones: the departments as tabs in a row */}
        <div
          role="tablist"
          aria-label={t("listLabel")}
          onKeyDown={onKey}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocusCapture={(e) => setKbdFocus((e.target as HTMLElement).matches(":focus-visible"))}
          onBlurCapture={() => setKbdFocus(false)}
          className="-mx-5 flex snap-x gap-2 overflow-x-auto px-5 pb-1 [scrollbar-width:none] sm:-mx-6 sm:px-6 lg:hidden [&::-webkit-scrollbar]:hidden"
        >
          {teams.map((tm, i) => (
            <button
              key={tm.id}
              ref={(el) => {
                pills.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`team-pill-${tm.id}`}
              aria-selected={i === active}
              aria-controls="team-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => choose(i)}
              className={cn(
                "relative shrink-0 snap-center cursor-pointer overflow-hidden rounded-full border px-4 py-2 text-sm font-bold transition-colors duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                i === active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border/60 bg-card/40 text-muted-foreground hover:border-primary/50 hover:text-foreground",
              )}
            >
              {tm.name}
              {i === active && auto ? (
                <span
                  key={cycle}
                  aria-hidden="true"
                  onAnimationEnd={() => choose(active + 1)}
                  className="team-progress absolute inset-x-3 bottom-0 h-0.5 origin-left rounded-full bg-primary-foreground/80 rtl:origin-right"
                  style={
                    {
                      "--dur": `${AUTOPLAY_MS}ms`,
                      animationPlayState: held ? "paused" : "running",
                    } as CSSProperties
                  }
                />
              ) : null}
            </button>
          ))}
        </div>

        {/* wide screens: the numbered list, one highlight sliding between the rows */}
        <StickyColumn className="hidden lg:block">
        <div
          role="tablist"
          aria-orientation="vertical"
          aria-label={t("listLabel")}
          onKeyDown={onKey}
          onPointerEnter={() => setHovering(true)}
          onPointerLeave={() => setHovering(false)}
          onFocusCapture={(e) => setKbdFocus((e.target as HTMLElement).matches(":focus-visible"))}
          onBlurCapture={() => setKbdFocus(false)}
          className="relative"
        >
          <span
            aria-hidden="true"
            className="absolute inset-x-0 top-0 overflow-hidden rounded-2xl bg-primary/12 ring-1 ring-primary/40 transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ height: `${ROW}rem`, transform: `translateY(${active * ROW}rem)` }}
          >
            {auto ? (
              <span
                key={cycle}
                onAnimationEnd={() => choose(active + 1)}
                className="team-progress absolute inset-x-0 bottom-0 h-0.5 origin-left bg-primary-300 rtl:origin-right"
                style={
                  {
                    "--dur": `${AUTOPLAY_MS}ms`,
                    animationPlayState: held ? "paused" : "running",
                  } as CSSProperties
                }
              />
            ) : null}
          </span>
          {teams.map((tm, i) => (
            <button
              key={tm.id}
              ref={(el) => {
                tabs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`team-tab-${tm.id}`}
              aria-selected={i === active}
              aria-controls="team-panel"
              tabIndex={i === active ? 0 : -1}
              onClick={() => choose(i)}
              style={{ height: `${ROW}rem` }}
              className={cn(
                "group relative flex w-full cursor-pointer items-center gap-4 rounded-2xl px-5 text-start outline-none transition-colors duration-300 focus-visible:ring-2 focus-visible:ring-ring",
                i < total - 1 &&
                  "after:absolute after:inset-x-5 after:bottom-0 after:border-b after:border-dashed after:border-border/40",
                (i === active || i === active - 1) && "after:opacity-0",
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  "w-11 shrink-0 text-2xl font-black leading-none tabular-nums transition-colors duration-300",
                  i === active ? "text-primary-300" : "text-muted-foreground/50",
                )}
              >
                {num(i + 1)}
              </span>
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-lg font-extrabold transition-colors duration-300",
                  i === active
                    ? "text-foreground"
                    : "text-muted-foreground group-hover:text-foreground",
                )}
              >
                {tm.name}
              </span>
              <ChevronLeft
                className={cn(
                  "size-4 shrink-0 text-primary-300 transition-[opacity,transform] duration-300 ltr:rotate-180",
                  i === active
                    ? "opacity-100"
                    : "opacity-0 group-hover:opacity-60 rtl:group-hover:-translate-x-0.5 ltr:group-hover:translate-x-0.5",
                )}
              />
            </button>
          ))}
        </div>
        </StickyColumn>

        {/* the chosen department */}
        <StickyColumn className="min-w-0">
        <article
          id="team-panel"
          data-no-anim
          role="tabpanel"
          aria-labelledby={`team-tab-${teams[active].id}`}
          className="surface overflow-hidden rounded-3xl shadow-none"
        >
          {/* photo: the one before fades out as the new one settles in */}
          <div className="relative aspect-16/9 w-full overflow-hidden bg-muted sm:aspect-2/1">
            {teams.map((tm, i) =>
              i === active || i === prev ? (
                <Image
                  key={tm.id}
                  src={tm.image}
                  alt=""
                  fill
                  unoptimized
                  priority={i === 0}
                  sizes="(min-width: 1024px) 640px, 100vw"
                  className={cn(
                    "object-cover transition-opacity duration-700",
                    i === active ? "team-photo opacity-100" : "opacity-0",
                  )}
                />
              ) : null,
            )}
            <span
              aria-hidden="true"
              className="absolute inset-0 bg-linear-to-t from-card via-card/25 to-black/20"
            />
            <span
              aria-hidden="true"
              className="outline-text-photo absolute top-4 inset-s-5 text-6xl font-black leading-none opacity-85"
            >
              {num(active + 1)}
            </span>
            {/* every name in the same place; the chosen one is lit */}
            <div className="absolute inset-x-0 bottom-0 grid px-6 pb-5 sm:px-8">
              {teams.map((tm, i) => (
                <h2
                  key={tm.id}
                  aria-hidden={i !== active}
                  className={cn(
                    "col-start-1 row-start-1 translate-y-3 text-balance text-3xl font-black leading-snug text-foreground opacity-0 transition-[opacity,transform] duration-500 ease-out sm:text-4xl",
                    i === active && "translate-y-0 opacity-100 [transition-delay:120ms]",
                  )}
                >
                  {tm.name}
                </h2>
              ))}
            </div>
          </div>

          {/* every department's text in one cell: the panel is as tall as the longest */}
          <div className="grid px-6 pb-2 pt-5 sm:px-8 sm:pt-6">
            {teams.map((tm, i) => (
              <div
                key={tm.id}
                data-active={i === active}
                aria-hidden={i !== active}
                inert={i !== active}
                className="group/body invisible col-start-1 row-start-1 opacity-0 transition-[opacity,visibility] duration-300 data-[active=true]:visible data-[active=true]:opacity-100"
              >
                {tm.shortDescription ? (
                  <p
                    className="max-w-[60ch] translate-y-3 text-pretty text-base leading-9 text-muted-foreground opacity-0 transition-[opacity,transform] duration-500 ease-out group-data-[active=true]/body:translate-y-0 group-data-[active=true]/body:opacity-100 group-data-[active=true]/body:[transition-delay:calc(160ms+var(--i,0)*55ms)]"
                    style={{ "--i": 0 } as CSSProperties}
                  >
                    {tm.shortDescription}
                  </p>
                ) : null}

                {tm.responsibilities.length > 0 ? (
                  <div className="mt-6">
                    <h3
                      className="flex translate-y-3 items-center gap-2 text-sm font-bold text-primary-300 opacity-0 transition-[opacity,transform] duration-500 ease-out group-data-[active=true]/body:translate-y-0 group-data-[active=true]/body:opacity-100 group-data-[active=true]/body:[transition-delay:calc(160ms+var(--i,0)*55ms)]"
                      style={{ "--i": 1 } as CSSProperties}
                    >
                      {t("responsibilitiesLabel")}
                      <span className="inline-flex min-w-6 items-center justify-center rounded-full bg-primary/15 px-2 py-0.5 text-xs font-black tabular-nums leading-5 text-primary-300 ring-1 ring-primary/25">
                        {plain(tm.responsibilities.length)}
                      </span>
                    </h3>
                    <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
                      {tm.responsibilities.map((item, j) => (
                        <li
                          key={item}
                          className="flex translate-y-3 items-start gap-3 rounded-2xl border border-border/50 bg-background/25 p-3.5 text-[14px] font-semibold leading-7 text-foreground/90 opacity-0 transition-[opacity,transform] duration-500 ease-out group-data-[active=true]/body:translate-y-0 group-data-[active=true]/body:opacity-100 group-data-[active=true]/body:[transition-delay:calc(160ms+var(--i,0)*55ms)]"
                          style={{ "--i": 2 + j } as CSSProperties}
                        >
                          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary-300">
                            <Check className="size-3.5" strokeWidth={2.8} aria-hidden="true" />
                          </span>
                          <span className="min-w-0">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ))}
          </div>

          <footer className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-t border-dashed border-border/60 px-6 py-4 sm:px-8">
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setPlaying((v) => !v)}
                aria-label={auto ? t("pause") : t("play")}
                aria-pressed={!auto}
                disabled={reduced}
                className={cn(ARROW, "me-1 disabled:opacity-40")}
              >
                {auto ? <Pause className="size-4" /> : <Play className="size-4" />}
              </button>
              <button type="button" onClick={() => choose(active - 1)} aria-label={tc("prevSlide")} className={ARROW}>
                <ArrowLeft className="size-4 rtl:rotate-180" />
              </button>
              <p className="min-w-14 text-center text-sm font-bold tabular-nums text-muted-foreground">
                <span className="text-foreground">{num(active + 1)}</span> / {num(total)}
              </p>
              <button type="button" onClick={() => choose(active + 1)} aria-label={tc("nextSlide")} className={ARROW}>
                <ArrowRight className="size-4 rtl:rotate-180" />
              </button>
            </div>
            <Link
              href={contactHref("join")}
              className={cn(buttonVariants({ size: "lg" }), "h-11 gap-2 rounded-full px-6 shadow-glow")}
            >
              <Users className="size-4" />
              {tj("join")}
            </Link>
          </footer>
        </article>
        </StickyColumn>
      </div>
    </div>
  );
}
