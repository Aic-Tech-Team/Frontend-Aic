"use client";

import { StickyColumn } from "@/components/common/StickyColumn";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpLeft } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { prefersReducedMotion } from "@/lib/gsap";
import { cn } from "@/lib/utils";

type FaqAction =
  | { type: "intent"; index: number; label: string }
  | { type: "link"; href: string; label: string };
type Faq = { q: string; a: string; action?: FaqAction };

const chip =
  "inline-flex items-center gap-1.5 rounded-full border border-primary/40 bg-primary/10 px-4 py-2 text-sm font-bold text-primary-300 outline-none transition-colors hover:bg-primary hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-ring";

function Avatar({ className }: { className?: string }) {
  return (
    <span className={cn("flex shrink-0 items-center justify-center bg-primary/15 ring-1 ring-primary/30", className)}>
      <Image src="/logo/AIC_logo_notext.svg" alt="" width={24} height={24} className="size-[55%]" />
    </span>
  );
}

/**
 * FAQ as a short conversation. Pick a question and it is "asked" in the chat, a typing
 * indicator shows, then the answer is written word by word. The questions are a list beside
 * the chat on desktop and under it on phones, so the answer is always in view. Once an answer
 * is written, a bar under its question fills and then asks the next one (hover pauses it).
 */
export function ContactFaq({
  onIntent,
  onWrite,
}: {
  onIntent: (index: number) => void;
  onWrite: () => void;
}) {
  const t = useTranslations("ContactPage");
  const locale = useLocale();
  const items = t.raw("faq") as Faq[];

  const [selected, setSelected] = useState(0);
  const [phase, setPhase] = useState<"q" | "typing" | "a">("a");
  const [shown, setShown] = useState(Number.POSITIVE_INFINITY); // words on screen (all of them for SSR and reduced motion)
  const [done, setDone] = useState(true); // the answer is fully written: the auto-advance bar may run
  const [paused, setPaused] = useState(false);
  const [auto, setAuto] = useState(false);
  const root = useRef<HTMLElement>(null);
  const timers = useRef<number[]>([]);
  const ticker = useRef(0);

  const words = items[selected]?.a.split(" ") ?? [];

  const clear = () => {
    timers.current.forEach(window.clearTimeout);
    timers.current = [];
    window.clearInterval(ticker.current);
  };

  const ask = (i: number) => {
    clear();
    setSelected(i);
    setDone(false);
    if (prefersReducedMotion()) {
      setPhase("a");
      setShown(Number.POSITIVE_INFINITY);
      setDone(true);
      return;
    }
    setPhase("q");
    setShown(0);
    const count = items[i].a.split(" ").length;
    timers.current.push(
      window.setTimeout(() => setPhase("typing"), 380),
      window.setTimeout(() => {
        setPhase("a");
        let n = 0;
        ticker.current = window.setInterval(() => {
          n += 1;
          setShown(n);
          if (n >= count) {
            window.clearInterval(ticker.current);
            setDone(true);
          }
        }, 42);
      }, 1350),
    );
  };

  // Until the section is on screen only the question shows; then the first exchange plays, once.
  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (prefersReducedMotion()) return;
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setAuto(true);
    setPhase("q");
    setShown(0);
    setDone(false);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        io.disconnect();
        ask(0);
      },
      { threshold: 0.35 },
    );
    io.observe(el);
    return () => io.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => clear, []);

  const next = () => ask((selected + 1) % items.length);
  const item = items[selected];

  return (
    <section ref={root} className="pb-16 pt-4 sm:pb-24">
      <div className="container min-w-0">
        <div className="mx-auto mb-12 max-w-4xl text-center sm:mb-16">
          <p className="text-sm font-bold text-primary-300">{t("faqKicker")}</p>
          <h2 className="mt-3 text-balance text-3xl font-extrabold leading-[1.3] text-foreground sm:text-5xl">{t("faqTitle")}</h2>
          <p className="mx-auto mt-5 max-w-2xl text-base leading-8 text-muted-foreground sm:text-lg sm:leading-9">{t("faqLead")}</p>
        </div>

        <div className="mx-auto grid max-w-6xl gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:items-start lg:gap-10">
          {/* chat: on top on phones so the answer stays in view */}
          <StickyColumn className="order-1 lg:order-2">
          <div className="surface relative overflow-hidden rounded-[1.75rem] border border-border/60">
            <header className="flex items-center gap-3 border-b border-border/60 px-5 py-4">
              <span className="relative">
                <Avatar className="size-11 rounded-2xl" />
                <span aria-hidden="true" className="faq-live absolute -bottom-0.5 -end-0.5 size-3 rounded-full border-2 border-background bg-emerald-400" />
              </span>
              <div className="min-w-0">
                <p className="text-sm font-extrabold text-foreground">{t("faqBot")}</p>
                <p className="text-xs font-bold text-emerald-400">{t("faqOnline")}</p>
              </div>
            </header>

            <div className="flex min-h-[22rem] flex-col gap-4 p-5 sm:min-h-[21rem] sm:p-6" aria-live="polite">
              {/* the question, as the visitor's message */}
              <p
                key={`q${selected}`}
                className="faq-bubble max-w-[88%] self-start rounded-2xl rounded-es-md bg-linear-to-br from-primary-500 to-primary-600 px-4 py-3 text-sm font-bold leading-7 text-primary-foreground ltr:self-end ltr:rounded-es-2xl ltr:rounded-ee-md sm:text-base"
              >
                {item.q}
              </p>

              {phase !== "q" ? (
                <div key={`a${selected}`} className="flex max-w-full items-start gap-3 self-end rtl:flex-row-reverse ltr:self-start">
                  <Avatar className="mt-1 size-8 rounded-xl" />
                  {phase === "typing" ? (
                    <p role="status" aria-label="…" className="faq-bubble flex h-11 items-center gap-1.5 rounded-2xl rounded-se-md border border-border/60 bg-white/[0.06] px-4 ltr:rounded-se-2xl ltr:rounded-ss-md">
                      <i className="faq-dot" />
                      <i className="faq-dot" />
                      <i className="faq-dot" />
                    </p>
                  ) : (
                    <div className="faq-bubble min-w-0 rounded-2xl rounded-se-md border border-border/60 bg-white/[0.06] px-4 py-3 ltr:rounded-se-2xl ltr:rounded-ss-md">
                      {/* every word is in place from the start (the bubble keeps its final size) and fades in as it is written */}
                      <p className="text-sm leading-8 text-foreground/90 sm:text-base">
                        {words.map((w, k) => (
                          <span key={k} className="faq-word" style={{ opacity: k < shown ? 1 : 0 }}>
                            {w}{" "}
                          </span>
                        ))}
                      </p>
                      {item.action ? (
                        <div className={cn("mt-3 transition-opacity duration-500", done ? "opacity-100" : "pointer-events-none opacity-0")}>
                          {item.action.type === "intent" ? (
                            <button type="button" onClick={() => onIntent((item.action as { index: number }).index)} className={chip}>
                              {item.action.label}
                              <ArrowUpLeft className="size-4 ltr:-scale-x-100" aria-hidden="true" />
                            </button>
                          ) : (
                            <Link href={item.action.href} className={chip}>
                              {item.action.label}
                              <ArrowUpLeft className="size-4 ltr:-scale-x-100" aria-hidden="true" />
                            </Link>
                          )}
                        </div>
                      ) : null}
                    </div>
                  )}
                </div>
              ) : null}
            </div>

            <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-border/60 px-5 py-4">
              <p className="text-xs text-muted-foreground sm:text-sm">{t("faqCtaTitle")}</p>
              <Button onClick={onWrite} className="h-10 rounded-full px-5 shadow-glow">
                {t("faqCta")}
              </Button>
            </footer>
          </div>
          </StickyColumn>

          {/* questions */}
          <ul
            className="order-2 space-y-2.5 [scrollbar-width:none] lg:sticky lg:top-24 lg:order-1 lg:-m-1 lg:max-h-[calc(100svh-7rem)] lg:overflow-y-auto lg:overscroll-contain lg:p-1 [&::-webkit-scrollbar]:hidden"
            role="list"
            onPointerEnter={() => setPaused(true)}
            onPointerLeave={() => setPaused(false)}
          >
            {items.map((it, i) => {
              const on = selected === i;
              return (
                <li key={it.q}>
                  <button
                    type="button"
                    aria-pressed={on}
                    onClick={() => ask(i)}
                    className={cn(
                      "faq-row group relative flex w-full items-center gap-4 rounded-2xl border px-4 py-4 text-start outline-none transition-[color,border-color,background-color,transform] duration-300 focus-visible:ring-2 focus-visible:ring-ring sm:px-5",
                      on
                        ? "border-primary/60 bg-linear-to-r from-primary/15 to-transparent text-foreground rtl:bg-linear-to-l"
                        : "border-border/60 bg-white/[0.03] text-foreground/75 hover:border-primary/50 hover:text-foreground",
                    )}
                  >
                    <span
                      className={cn(
                        "flex size-9 shrink-0 items-center justify-center rounded-xl border text-xs font-extrabold tabular-nums transition-colors duration-300",
                        on ? "border-primary bg-primary text-primary-foreground" : "border-primary-300/40 text-primary-300",
                      )}
                    >
                      {(i + 1).toLocaleString(locale)}
                    </span>
                    <span className="flex-1 text-[0.95rem] font-bold leading-7 sm:text-base">{it.q}</span>
                    <ArrowUpLeft
                      className={cn(
                        "size-4 shrink-0 transition-opacity duration-300 ltr:-scale-x-100",
                        on ? "text-primary-300 opacity-100" : "text-primary-300/70 opacity-60 group-hover:opacity-100",
                      )}
                      aria-hidden="true"
                    />
                    {auto && on && done ? (
                      <span
                        aria-hidden="true"
                        onAnimationEnd={next}
                        className="faq-bar"
                        style={{ animationPlayState: paused ? "paused" : "running" }}
                      />
                    ) : null}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </section>
  );
}
